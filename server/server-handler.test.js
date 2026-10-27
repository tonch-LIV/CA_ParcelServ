'use strict';

const Queue = require('./queue');
const {
  handleSubscribe,
  handlePickup,
  handleInTransit,
  handleDelivered,
  handleReceived,
  handleGetAll,
} = require('./handler');

describe('CAPS server handlers', () => {
  const timestamp = '2026-01-01T12:00:00.000Z';
  const order = {
    store: 'acme-widgets',
    orderId: 'order-123',
    customer: 'Sam Rivera',
    address: 'Portland, OR',
  };

  let queue;
  let logSpy;

  beforeEach(() => {
    queue = new Queue();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(timestamp));
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('subscribes a socket to its store and event room', () => {
    const socket = { join: jest.fn() };

    handleSubscribe(socket, {
      clientId: order.store,
      event: 'delivered',
    });

    expect(socket.join).toHaveBeenCalledTimes(1);
    expect(socket.join).toHaveBeenCalledWith('acme-widgets:delivered');
  });

  test.each([
    ['pickup', handlePickup],
    ['delivered', handleDelivered],
  ])('stores %s before publishing its notification', (event, handler) => {
    const message = {
      event,
      messageId: order.orderId,
      clientId: order.store,
      order,
    };

    const room = {
      emit: jest.fn((name, notification) => {
        expect(queue.getAll(order.store, name)).toEqual([notification]);
      }),
    };
    const caps = { to: jest.fn().mockReturnValue(room) };

    handler(caps, queue, order);

    expect(caps.to).toHaveBeenCalledWith(`${order.store}:${event}`);
    expect(room.emit).toHaveBeenCalledTimes(1);
    expect(room.emit).toHaveBeenCalledWith(event, message);
    expect(logSpy).toHaveBeenCalledWith('EVENT:', {
      event,
      time: timestamp,
      payload: order,
    });
  });

  test('routes live transit updates to the vendor subscribers', () => {
    const room = { emit: jest.fn() };
    const caps = { to: jest.fn().mockReturnValue(room) };

    handleInTransit(caps, order);

    expect(caps.to).toHaveBeenCalledWith('acme-widgets:delivered');
    expect(room.emit).toHaveBeenCalledWith('in-transit', order);
    expect(logSpy).toHaveBeenCalledWith('EVENT:', {
      event: 'in-transit',
      time: timestamp,
      payload: order,
    });
  });

  test('replays only the requested queue without removing messages', () => {
    const first = queue.add(order.store, 'delivered', order);
    const second = queue.add(order.store, 'delivered', {
      ...order,
      orderId: 'order-456',
    });

    queue.add(order.store, 'pickup', order);
    queue.add('1-800-flowers', 'delivered', {
      ...order,
      store: '1-800-flowers',
    });

    const socket = { emit: jest.fn() };

    handleGetAll(socket, queue, {
      clientId: order.store,
      event: 'delivered',
    });

    expect(socket.emit.mock.calls).toEqual([
      ['delivered', first],
      ['delivered', second],
    ]);
    expect(queue.getAll(order.store, 'delivered')).toEqual([
      first,
      second,
    ]);
  });

  test('removes acknowledged messages so they are not replayed', () => {
    queue.add(order.store, 'delivered', order);

    const acknowledgment = {
      clientId: order.store,
      event: 'delivered',
      messageId: order.orderId,
    };

    handleReceived(queue, acknowledgment);

    expect(queue.getAll(order.store, 'delivered')).toEqual([]);
    expect(logSpy).toHaveBeenCalledWith(
      'CAPS: acknowledged delivered order-123 for acme-widgets',
    );

    const socket = { emit: jest.fn() };

    handleGetAll(socket, queue, {
      clientId: order.store,
      event: 'delivered',
    });

    expect(socket.emit).not.toHaveBeenCalled();

    logSpy.mockClear();
    handleReceived(queue, acknowledgment);
    expect(logSpy).not.toHaveBeenCalled();
  });
});