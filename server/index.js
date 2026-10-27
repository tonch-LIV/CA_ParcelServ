'use strict';

const { createServer } = require('node:http');
const { Server } = require('socket.io');
const {
  handleJoin,
  handlePickup,
  handleInTransit,
  handleDelivered,
} = require('./handler');

const port = Number(process.env.PORT || 3000);
const httpServer = createServer();
const io = new Server(httpServer);
const caps = io.of('/caps');

caps.on('connection', (socket) => {
  console.log(`CAPS: connected ${socket.id}`);

  socket.on('join', (store) => handleJoin(socket, store));
  socket.on('pickup', (order) => handlePickup(socket, order));
  socket.on('in-transit', (order) => handleInTransit(caps, order));
  socket.on('delivered', (order) => handleDelivered(caps, order));
});

httpServer.listen(port, () => {
  console.log(`CAPS server listening on port ${port}, namespace /caps`);
});