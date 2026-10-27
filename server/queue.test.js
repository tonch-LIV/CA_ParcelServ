'use strict';

const Queue = require('./queue');

describe('notification queue', () => {
  let queue;

  const order = {
    store: 'acme-widgets',
    orderId: 'order-1',
    customer: 'Alex Morgan',
    address: 'Portland, OR',
  };

  beforeEach(() => {
    queue = new Queue();
  });

  test('stores notifications and retains them when listed', () => {
    const first = queue.add(order.store, 'pickup', order);
    const second = queue.add(order.store, 'pickup', {
      ...order,
      orderId: 'order-2',
    });

    expect(first).toEqual({
      event: 'pickup',
      messageId: 'order-1',
      clientId: 'acme-widgets',
      order,
    });

    expect(queue.getAll(order.store, 'pickup')).toEqual([
      first,
      second,
    ]);

    expect(queue.getAll(order.store, 'pickup')).toEqual([
      first,
      second,
    ]);
  });

  test('keeps stores and event types separate', () => {
    const pickup = queue.add(order.store, 'pickup', order);
    const delivery = queue.add(order.store, 'delivered', order);

    const flowersDelivery = queue.add(
      '1-800-flowers',
      'delivered',
      { ...order, store: '1-800-flowers' },
    );

    expect(queue.getAll('acme-widgets', 'pickup')).toEqual([
      pickup,
    ]);
    expect(queue.getAll('acme-widgets', 'delivered')).toEqual([
      delivery,
    ]);
    expect(queue.getAll('1-800-flowers', 'delivered')).toEqual([
      flowersDelivery,
    ]);
  });

  test('removes only the acknowledged notification', () => {
    queue.add(order.store, 'pickup', order);

    const remaining = queue.add(order.store, 'pickup', {
      ...order,
      orderId: 'order-2',
    });

    const delivery = queue.add(order.store, 'delivered', order);

    expect(queue.remove(order.store, 'pickup', 'order-1')).toBe(true);
    expect(queue.getAll(order.store, 'pickup')).toEqual([remaining]);
    expect(queue.getAll(order.store, 'delivered')).toEqual([delivery]);
  });

  test('handles missing queues and message IDs safely', () => {
    expect(queue.getAll(order.store, 'pickup')).toEqual([]);
    expect(queue.remove(order.store, 'pickup', 'missing')).toBe(false);

    const message = queue.add(order.store, 'pickup', order);

    expect(queue.remove(order.store, 'pickup', 'missing')).toBe(false);
    expect(queue.getAll(order.store, 'pickup')).toEqual([message]);
  });
});