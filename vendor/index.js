'use strict';

const socket = require('../socket');
const { requestPickup, handleDelivered } = require('./handler');

const store = '1-206-flowers';
let orderInterval;

socket.on('delivered', handleDelivered);

socket.on('connect', () => {
  console.log(`VENDOR: connected ${socket.id}`);

  socket.emit('join', store);
  requestPickup(store);

  orderInterval = setInterval(() => {
    requestPickup(store);
  }, 5000)
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