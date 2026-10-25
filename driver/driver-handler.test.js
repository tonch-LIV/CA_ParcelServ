'use strict';

const eventPool = require('../eventPool');
const handlePickup = require('./handler');

describe('driver handler', () => {
  let emitSpy;
  let logSpy;

  beforeEach(() => {
    emitSpy = jest.spyOn(eventPool, 'emit').mockReturnValue(true);
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

    handlePickup(order);

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      'DRIVER: picked up order-123.',
    );
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      'DRIVER: delivered order-123.',
    );

    expect(emitSpy).toHaveBeenCalledTimes(2);
    expect(emitSpy).toHaveBeenNthCalledWith(1, 'in-transit', order);
    expect(emitSpy).toHaveBeenNthCalledWith(2, 'delivered', order);
  });
});