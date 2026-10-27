'use strict';

const socket = require('../socket.js');

/**
 * Processes a queued pickup and acknowledges it after delivery.
 * @param {object} message - Queued pickup notification.
 */
function handlePickup(message) {
  const { event, messageId, clientId, order } = message;

  console.log(`DRIVER: picked up ${order.orderId}.`);
  socket.emit('in-transit', order);

  console.log(`DRIVER: delivered ${order.orderId}.`);
  socket.emit('delivered', order);

  socket.emit('received', {
    clientId,
    event,
    messageId,
  });
}

module.exports = handlePickup;
