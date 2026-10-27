'use strict';

const { createServer } = require('node:http');
const { Server } = require('socket.io');
const Queue = require('./queue');
const {
  handleSubscribe,
  handlePickup,
  handleInTransit,
  handleDelivered,
  handleReceived,
  handleGetAll,
} = require('./handler');

const port = Number(process.env.PORT || 3000);
const httpServer = createServer();
const io = new Server(httpServer);
const caps = io.of('/caps');
const queue = new Queue();

caps.on('connection', (socket) => {
  console.log(`CAPS: connected ${socket.id}`);

  socket.on('subscribe', (request) => {
    handleSubscribe(socket, request);
  });

  socket.on('getAll', (request) => {
    handleGetAll(socket, queue, request);
  });

  socket.on('received', (message) => {
    handleReceived(queue, message);
  });

  socket.on('pickup', (order) => {
    handlePickup(caps, queue, order);
  });

  socket.on('in-transit', (order) => {
    handleInTransit(caps, order);
  });

  socket.on('delivered', (order) => {
    handleDelivered(caps, queue, order);
  });
});

httpServer.listen(port, () => {
  console.log(`CAPS server listening on port ${port}, namespace /caps`);
});