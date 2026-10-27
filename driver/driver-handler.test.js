'use strict';

jest.mock('../socket', () => ({
  emit: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
}));

const socket = require('../socket');
const handlePickup = require('./handler');

describe('driver handler', () => {
  let emitSpy;
  let logSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    emitSpy = jest.spyOn(socket, 'emit').mockReturnValue(true);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('logs pickup and delivery and emits both states in order', () => {
    const order = {
      store: 'Neighborhood Books',
      orderId: 'order-123',
      customer: 'Sam Rivera',
      address: 'Portland, OR',
    };

    handlePickup({
      event: 'pickup',
      messageId: order.orderId,
      clientId: order.store,
      order,
    });

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      'DRIVER: picked up order-123.',
    );
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      'DRIVER: delivered order-123.',
    );

    expect(emitSpy).toHaveBeenCalledTimes(3);
    expect(emitSpy).toHaveBeenNthCalledWith(1, 'in-transit', order);
    expect(emitSpy).toHaveBeenNthCalledWith(2, 'delivered', order);
    expect(emitSpy).toHaveBeenNthCalledWith(3, 'received', {
      clientId: order.store,
      event: 'pickup',
      messageId: order.orderId,
    });
  });
});