'use strict';

const eventPool = require('../eventPool');
const handlePickup = require('./handler');

eventPool.on('pickup', handlePickup);