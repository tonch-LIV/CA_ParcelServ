'use strict';

const socket = require('../socket.js');

/**
 * Picks up an order and simulates its delivery.
 * @param {object} order - The order awaiting pickup.
 */
function handlePickup(order) {
  console.log(`DRIVER: picked up ${order.orderId}.`);
  socket.emit('in-transit', order);

  console.log(`DRIVER: delivered ${order.orderId}.`);
  socket.emit('delivered', order);
}

module.exports = handlePickup;
