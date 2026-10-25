'use strict';

module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'eventPool.js',
    'hub.js',
    'vendor/**/*.js',
    'driver/**/*.js',
    '!**/*.test.js',
  ],
};