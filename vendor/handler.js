'use strict';

const { randomUUID } = require('node:crypto');
const eventPool = require('../eventPool');

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

  eventPool.emit('pickup', order);

  return order;
}

/**
 * Thanks the customer when their order is delivered.
 * @param {object} order - The delivered order.
 */
function handleDelivered(order) {
  console.log(`Thank you for your order ${order.customer}`);
}

module.exports = { requestPickup, handleDelivered };