'use strict';

const { randomUUID } = require('node:crypto');
const socket = require('../socket');
/**
 * Creates an order and requests pickup for the supplied store.
 * @param {string} store - The vendor's store name.
 * @returns {object} The created order.
 */
function requestPickup(store) {
  const order = {
    store,
    orderId: randomUUID(),
    customer: 'Alex Morgan',
    address: 'Portland, OR',
  };

  socket.emit('pickup', order);

  return order;
}

/**
 * Logs a delivery notification and acknowledges receipt.
 * @param {object} message - Queued delivery notification.
 */
function handleDelivered(message) {
  const { event, messageId, clientId, order } = message;

  console.log(`VENDOR: ${clientId} delivered ${messageId}`, order);
  console.log(`Thank you for your order ${order.customer}`);

  socket.emit('received', {
    clientId,
    event,
    messageId,
  });
}

module.exports = { requestPickup, handleDelivered };