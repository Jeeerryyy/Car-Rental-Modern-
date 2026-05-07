/**
 * app.js — cPanel Phusion Passenger entry point
 * 
 * cPanel's Node.js hosting uses Passenger, which expects an app.js
 * at the application root. This file simply loads the actual server.
 */
const path = require('path');

// Ensure dotenv loads from the server directory
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Start the server
require('./server/server');
