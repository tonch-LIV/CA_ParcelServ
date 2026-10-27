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

/** Subscribes a socket to one store/event queue. */
function handleSubscribe(socket, { clientId, event }) {
  socket.join(`${clientId}:${event}`);
}

/** Stores a pickup notification before publishing it to subscribers. */
function handlePickup(caps, queue, order) {
  const message = queue.add(order.store, 'pickup', order);

  logEvent('pickup', order);
  caps.to(`${order.store}:pickup`).emit('pickup', message);
}

/** Sends a live transit update to the vendor's subscribers. */
function handleInTransit(caps, order) {
  logEvent('in-transit', order);
  caps.to(`${order.store}:delivered`).emit('in-transit', order);
}

/** Stores delivery confirmation before publishing it to subscribers. */
function handleDelivered(caps, queue, order) {
  const message = queue.add(order.store, 'delivered', order);

  logEvent('delivered', order);
  caps.to(`${order.store}:delivered`).emit('delivered', message);
}

/** Removes an acknowledged notification from its queue. */
function handleReceived(queue, { clientId, event, messageId }) {
  const removed = queue.remove(clientId, event, messageId);

  if (removed) {
    console.log(
      `CAPS: acknowledged ${event} ${messageId} for ${clientId}`,
    );
  }
}

/** Replays pending notifications to the requesting socket. */
function handleGetAll(socket, queue, { clientId, event }) {
  const messages = queue.getAll(clientId, event);

  console.log(
    `CAPS: ${clientId} requested ${event}; ${messages.length} pending`,
  );

  for (const message of messages) {
    socket.emit(event, message);
  }
}

module.exports = {
  handleSubscribe,
  handlePickup,
  handleInTransit,
  handleDelivered,
  handleReceived,
  handleGetAll,
};