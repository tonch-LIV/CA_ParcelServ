'use strict';

require('./hub');
require('./driver');
const requestPickup = require('./vendor');

describe('connected delivery flow', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('processes a vendor request through delivery confirmation', () => {
    const order = requestPickup('Neighborhood Books');

    const eventRecords = logSpy.mock.calls
      .filter(([label]) => label === 'EVENT:')
      .map(([, record]) => record);

    expect(eventRecords.map((record) => record.event)).toEqual([
      'pickup',
      'in-transit',
      'delivered',
    ]);

    for (const record of eventRecords) {
      expect(record.payload).toBe(order);
    }

    expect(logSpy).toHaveBeenCalledWith(
      `DRIVER: picked up ${order.orderId}.`,
    );
    expect(logSpy).toHaveBeenCalledWith(
      `DRIVER: delivered ${order.orderId}.`,
    );
    expect(logSpy).toHaveBeenLastCalledWith(
      `Thank you for your order ${order.customer}`,
    );
    expect(logSpy).toHaveBeenCalledTimes(6);
  });
});