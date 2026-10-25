'use strict';

const eventPool = require('./eventPool');

/**
 * Logs a package event with its timestamp and original payload.
 * @param {string} event - The package event name.
 * @param {object} payload - The order associated with the event.
 */
function logEvent(event, payload) {
  console.log('EVENT:', {
    event,
    time: new Date().toISOString(),
    payload,
  });
}

eventPool.on('pickup', (payload) => logEvent('pickup', payload));
eventPool.on('in-transit', (payload) => logEvent('in-transit', payload));
eventPool.on('delivered', (payload) => logEvent('delivered', payload));

if (require.main === module) {
  require('./driver');
  const requestPickup = require('./vendor');

  requestPickup('Test Flowers');
}

module.exports = logEvent;