'use strict';

const logEvent = require('./hub');

describe('global event logger', () => {
  const timestamp = '2026-01-01T12:00:00.000Z';
  let logSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(timestamp));
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test.each(['pickup', 'in-transit', 'delivered'])(
    'logs the %s event with a timestamp and payload',
    (event) => {
      const order = {
        store: 'Neighborhood Books',
        orderId: 'order-123',
        customer: 'Sam Rivera',
        address: 'Portland, OR',
      };

      logEvent(event, order);

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith('EVENT:', {
        event,
        time: timestamp,
        payload: order,
      });
    },
  );
});