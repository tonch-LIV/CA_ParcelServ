'use strict';

/**
 * Logs a package event and its original order details.
 * @param {string} event - Package event name.
 * @param {object} order - Package payload.
 */
function logEvent(event, order) {
  console.log('EVENT:', {
    event,
    time: new Date().toISOString(),
    payload: order,
  });
}

/**
 * Joins a client to its vendor room.
 * @param {object} socket - The connected client socket.
 * @param {string} store - Vendor room name.
 */
function handleJoin(socket, store) {
  socket.join(store);
}

/**
 * Announces a pickup to other clients in the namespace.
 * @param {object} socket - The client requesting pickup.
 * @param {object} order - Package payload.
 */
function handlePickup(socket, order) {
  logEvent('pickup', order);
  socket.broadcast.emit('pickup', order);
}

/**
 * Sends a transit update to the order's vendor room.
 * @param {object} caps - The CAPS namespace.
 * @param {object} order - Package payload.
 */
function handleInTransit(caps, order) {
  logEvent('in-transit', order);
  caps.to(order.store).emit('in-transit', order);
}

/**
 * Sends delivery confirmation to the order's vendor room.
 * @param {object} caps - The CAPS namespace.
 * @param {object} order - Package payload.
 */
function handleDelivered(caps, order) {
  logEvent('delivered', order);
  caps.to(order.store).emit('delivered', order);
}

module.exports = {
  handleJoin,
  handlePickup,
  handleInTransit,
  handleDelivered,
};