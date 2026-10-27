'use strict';

const socket = require('../socket');
const { requestPickup, handleDelivered } = require('./handler');

const store = process.argv[2] || 'acme-widgets';
let orderInterval;

socket.on('delivered', handleDelivered);

socket.on('connect', () => {
  console.log(`VENDOR: ${store} connected ${socket.id}`);

  const subscription = {
    clientId: store,
    event: 'delivered',
  };

  socket.emit('subscribe', subscription);
  socket.emit('getAll', subscription);

  requestPickup(store);

  orderInterval = setInterval(() => {
    requestPickup(store);
  }, 5000);
});

socket.on('disconnect', () => {
  clearInterval(orderInterval);
});

socket.on('connect_error', (error) => {
  console.log(`VENDOR: connection failed: ${error.message}`)
});

if (require.main === module) {
  socket.connect();
}

module.exports = requestPickup;