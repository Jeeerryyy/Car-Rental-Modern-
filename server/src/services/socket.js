import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

let io;

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join owner rooms
    socket.on('join_owner_room', (ownerId) => {
      socket.join(`owner_${ownerId}`);
      logger.info(`Socket ${socket.id} joined owner room: owner_${ownerId}`);
    });

    // Join customer room
    socket.on('join_customer_room', (customerId) => {
      socket.join(`customer_${customerId}`);
      logger.info(`Socket ${socket.id} joined customer room: customer_${customerId}`);
    });

    // Handle booking notifications
    socket.on('new_booking', (data) => {
      io.to(`owner_${data.ownerId}`).emit('booking_notification', {
        type: 'new_booking',
        booking: data
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Emit to specific owner
export const emitToOwner = (ownerId, event, data) => {
  if (io) {
    io.to(`owner_${ownerId}`).emit(event, data);
  }
};

// Emit to specific customer  
export const emitToCustomer = (customerId, event, data) => {
  if (io) {
    io.to(`customer_${customerId}`).emit(event, data);
  }
};

// Emit to all connected clients
export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export default { setupSocket, emitToOwner, emitToCustomer, emitToAll };