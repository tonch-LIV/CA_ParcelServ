'use strict';

class Queue {
  constructor() {
    this.storage = new Map();
  }

  /**
   * Stores a notification in the client's event queue.
   * @param {string} clientId - Store owning the queue.
   * @param {string} event - Notification event name.
   * @param {object} order - Original order payload.
   * @returns {object} The stored notification.
   */
  add(clientId, event, order) {
    const key = `${clientId}:${event}`;

    if (!this.storage.has(key)) {
      this.storage.set(key, new Map());
    }

    const message = {
      event,
      messageId: order.orderId,
      clientId,
      order,
    };

    this.storage.get(key).set(message.messageId, message);

    return message;
  }

  /**
   * Lists pending notifications without removing them.
   * @param {string} clientId - Store owning the queue.
   * @param {string} event - Notification event name.
   * @returns {object[]} Pending notifications.
   */
  getAll(clientId, event) {
    const messages = this.storage.get(`${clientId}:${event}`);

    return messages ? Array.from(messages.values()) : [];
  }

  /**
   * Removes an acknowledged notification.
   * @param {string} clientId - Store owning the queue.
   * @param {string} event - Notification event name.
   * @param {string} messageId - Acknowledged order ID.
   * @returns {boolean} Whether a notification was removed.
   */
  remove(clientId, event, messageId) {
    const messages = this.storage.get(`${clientId}:${event}`);

    return messages ? messages.delete(messageId) : false;
  }
}

module.exports = Queue;