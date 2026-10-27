'use strict';

const {
  handleJoin,
  handlePickup,
  handleInTransit,
  handleDelivered,
} = require('./handler');

describe('CAPS server handlers', () => {
  const timestamp = '2026-01-01T12:00:00.000Z';
  const order = {
    store: '1-206-flowers',
    orderId: 'order-123',
    customer: 'Sam Rivera',
    address: 'Portland, OR',
  };

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

  test('joins the socket to the requested vendor room', () => {
    const socket = { join: jest.fn() };

    handleJoin(socket, order.store);

    expect(socket.join).toHaveBeenCalledTimes(1);
    expect(socket.join).toHaveBeenCalledWith(order.store);
  });

  test('logs pickup and broadcasts it through the sender socket', () => {
    const socket = {
      broadcast: { emit: jest.fn() },
    };

    handlePickup(socket, order);

    expect(socket.broadcast.emit).toHaveBeenCalledTimes(1);
    expect(socket.broadcast.emit).toHaveBeenCalledWith('pickup', order);
    expect(logSpy).toHaveBeenCalledWith('EVENT:', {
      event: 'pickup',
      time: timestamp,
      payload: order,
    });
  });

  test.each([
    ['in-transit', handleInTransit],
    ['delivered', handleDelivered],
  ])('routes %s to the matching vendor room', (event, handler) => {
    const room = { emit: jest.fn() };
    const caps = { to: jest.fn().mockReturnValue(room) };

    handler(caps, order);

    expect(caps.to).toHaveBeenCalledTimes(1);
    expect(caps.to).toHaveBeenCalledWith(order.store);
    expect(room.emit).toHaveBeenCalledTimes(1);
    expect(room.emit).toHaveBeenCalledWith(event, order);
    expect(logSpy).toHaveBeenCalledWith('EVENT:', {
      event,
      time: timestamp,
      payload: order,
    });
  });
});