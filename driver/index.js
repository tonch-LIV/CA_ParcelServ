'use strict';

const socket = require('../socket');
const handlePickup = require('./handler');

socket.on('pickup', handlePickup);

socket.on('connect', () => {
  console.log(`DRIVER: connected ${socket.id}`);
});

socket.on('connect_error', (error) => {
  console.error(`DRIVER: connection failed: ${error.message}`);
});

if (require.main === module) {
  socket.connect();
}