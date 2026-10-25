'use strict';

const eventPool = require('../eventPool');

/**
 * Picks up an order and simulates its delivery.
 * @param {object} order - The order awaiting pickup.
 */
function handlePickup(order) {
  console.log(`DRIVER: picked up ${order.orderId}.`);
  eventPool.emit('in-transit', order);

  console.log(`DRIVER: delivered ${order.orderId}.`);
  eventPool.emit('delivered', order);
}

module.exports = handlePickup;
