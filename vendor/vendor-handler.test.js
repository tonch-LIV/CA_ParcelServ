'use strict';

const eventPool = require('../eventPool');
const { requestPickup, handleDelivered } = require('./handler');

describe('vendor handlers', () => {
  let emitSpy;
  let logSpy;

  beforeEach(() => {
    emitSpy = jest.spyOn(eventPool, 'emit').mockReturnValue(true);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
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

  test('thanks the customer named in the delivered order', () => {
    handleDelivered({ customer: 'Sam Rivera' });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      'Thank you for your order Sam Rivera',
    );
  });
});