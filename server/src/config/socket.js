import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './env.js';
import { SOCKET_EVENTS } from './socket.events.js';
import { logger } from '../utils/logger.js';

let io = null;

export const initSocket = (httpServer) => {
  const socketOrigins = [
    config.clientUrl,
    config.portalUrl,
    'http://localhost:5174',
    'http://localhost:5173',
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: socketOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    }
  });

  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      // If no token in auth, check cookies
      if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        token = cookies['customerToken'] || cookies['ownerToken'];
      }

      if (!token) {
        // Allow guest connection for public broadcasts
        socket.data.user = { id: `anon_${socket.id}`, role: 'guest' };
        return next();
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      socket.data.user = decoded;
      next();
    } catch (error) {
      // Fallback to guest so public broadcasts still work
      socket.data.user = { id: `anon_${socket.id}`, role: 'guest' };
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`[Socket] User connected: ${user.id} (${user.role})`);
    
    // Always join public room for broadcast events
    socket.join('public');

    if (user.role !== 'guest') {
      // Join personal room
      socket.join(`user:${user.id}`);
      logger.info(`[Socket] ${user.id} joined room: user:${user.id}`);
      
      // Join owner room if owner or staff
      if (user.role === 'owner') {
        socket.join(`owner:${user.id}`);
        logger.info(`[Socket] ${user.id} joined room: owner:${user.id}`);
      } else if (user.role === 'staff' && user.parentOwner) {
        socket.join(`owner:${user.parentOwner}`);
        logger.info(`[Socket] Staff ${user.id} joined room: owner:${user.parentOwner}`);
      }
    }

    socket.on('error', (error) => {
      logger.error(`[Socket] Socket error for user ${user.id}: ${error.message}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket] User disconnected: ${user.id}, reason: ${reason}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
