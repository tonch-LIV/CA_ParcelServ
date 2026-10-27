'use strict';

module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'socket.js',
    'server/**/*.js',
    'vendor/**/*.js',
    'driver/**/*.js',
    '!**/*.test.js',
  ],
};