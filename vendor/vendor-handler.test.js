'use strict';

jest.mock('../socket', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
}));

const socket = require('../socket');
const { requestPickup, handleDelivered } = require('./handler');

describe('vendor handlers', () => {
  let emitSpy;
  let logSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    emitSpy = jest.spyOn(socket, 'emit').mockReturnValue(true);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('requests pickup with the supplied store and order details', () => {
    const order = requestPickup('Neighborhood Books');

    expect(order).toEqual({
      store: 'Neighborhood Books',
      orderId: expect.any(String),
      customer: expect.any(String),
      address: expect.any(String),
    });
    expect(order.orderId).not.toBe('');
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith('pickup', order);
  });

  test('creates a different order ID for each request', () => {
    const firstOrder = requestPickup('Neighborhood Books');
    const secondOrder = requestPickup('Neighborhood Books');

    expect(firstOrder.orderId).not.toBe(secondOrder.orderId);
  });

  test('logs delivery details and acknowledges the notification', () => {
    const order = {
      store: 'acme-widgets',
      orderId: 'order-123',
      customer: 'Sam Rivera',
      address: 'Portland, OR',
    };

    handleDelivered({
      event: 'delivered',
      messageId: order.orderId,
      clientId: order.store,
      order,
    });

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      'VENDOR: acme-widgets delivered order-123',
      order,
    );
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      'Thank you for your order Sam Rivera',
    );

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith('received', {
      clientId: order.store,
      event: 'delivered',
      messageId: order.orderId,
    });
  });

  test('stops creating orders when the vendor disconnects', () => {
    jest.useFakeTimers();
    jest.replaceProperty(process, 'argv', [
      'node',
      'vendor/index.js',
      'acme-widgets',
    ]);

    require('./index');
    const listeners = Object.fromEntries(socket.on.mock.calls);

    listeners.connect();

    const subscription = {
      clientId: 'acme-widgets',
      event: 'delivered',
    };

    expect(emitSpy).toHaveBeenNthCalledWith(
      1,
      'subscribe',
      subscription,
    );
    expect(emitSpy).toHaveBeenNthCalledWith(
      2,
      'getAll',
      subscription,
    );

    jest.advanceTimersByTime(5000);
    expect(emitSpy).toHaveBeenCalledTimes(4);

    listeners.disconnect();

    jest.advanceTimersByTime(10000);
    expect(emitSpy).toHaveBeenCalledTimes(4);
  });
});