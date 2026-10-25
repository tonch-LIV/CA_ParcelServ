'use strict';

const EventEmitter = require('node:events');

// all modules importing this file share this emitter instance.
const eventPool = new EventEmitter();

module.exports = eventPool;