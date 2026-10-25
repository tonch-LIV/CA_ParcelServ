'use strict';

const eventPool = require('../eventPool');
const { requestPickup, handleDelivered } = require('./handler');

eventPool.on('delivered', handleDelivered);

module.exports = requestPickup;