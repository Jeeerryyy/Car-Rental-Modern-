const logger = require('./logger');

const SOCKET_EVENTS = {
  BOOKING_CREATED: 'booking:created',
  BOOKING_UPDATED: 'booking:updated',
  BOOKING_CANCELLED: 'booking:cancelled',
  BOOKING_COMPLETED: 'booking:completed',
  CAR_STATUS_CHANGED: 'car:statusChanged',
  CAR_AVAILABILITY: 'car:availability',
  PAYMENT_RECEIVED: 'payment:received',
  NOTIFICATION: 'notification',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  PROMO_UPDATED: 'promo:updated',
  ADMIN_STATS_UPDATE: 'admin:statsUpdate'
};

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.roomSubscriptions = new Map();
  }

  initialize() {
    if (!this.io) {
      logger.warn('[SOCKET] No IO instance provided');
      return;
    }

    this.io.on('connection', (socket) => {
      logger.info(`[SOCKET] Client connected: ${socket.id}`);

      socket.on('authenticate', (userId) => {
        this.authenticateUser(socket, userId);
      });

      socket.on('join:room', (room) => {
        this.joinRoom(socket, room);
      });

      socket.on('leave:room', (room) => {
        this.leaveRoom(socket, room);
      });

      socket.on('subscribe:car', (carId) => {
        this.subscribeToCar(socket, carId);
      });

      socket.on('subscribe:booking', (bookingId) => {
        this.subscribeToBooking(socket, bookingId);
      });

      socket.on('typing', (data) => {
        this.handleTyping(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });

    logger.info('[SOCKET] Service initialized');
  }

  authenticateUser(socket, userId) {
    socket.data.userId = userId;
    this.connectedUsers.set(userId, socket.id);
    this.broadcastToAdmins(SOCKET_EVENTS.USER_ONLINE, { userId, socketId: socket.id });
    logger.info(`[SOCKET] User authenticated: ${userId}`);
  }

  joinRoom(socket, room) {
    socket.join(room);
    logger.info(`[SOCKET] Socket ${socket.id} joined room: ${room}`);
  }

  leaveRoom(socket, room) {
    socket.leave(room);
    logger.info(`[SOCKET] Socket ${socket.id} left room: ${room}`);
  }

  subscribeToCar(socket, carId) {
    socket.join(`car:${carId}`);
    logger.info(`[SOCKET] Subscribed socket ${socket.id} to car: ${carId}`);
  }

  subscribeToBooking(socket, bookingId) {
    socket.join(`booking:${bookingId}`);
    logger.info(`[SOCKET] Subscribed socket ${socket.id} to booking: ${bookingId}`);
  }

  handleTyping(socket, data) {
    const { room, isTyping } = data;
    socket.to(room).emit('user:typing', { userId: socket.data.userId, isTyping });
  }

  handleDisconnect(socket) {
    const userId = socket.data.userId;
    if (userId) {
      this.connectedUsers.delete(userId);
      this.broadcastToAdmins(SOCKET_EVENTS.USER_OFFLINE, { userId });
    }
    logger.info(`[SOCKET] Client disconnected: ${socket.id}`);
  }

  emitToRoom(room, event, data) {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
    logger.info(`[SOCKET] Emitted ${event} to room: ${room}`);
  }

  emitToUser(userId, event, data) {
    if (!this.io) return;
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      logger.info(`[SOCKET] Emitted ${event} to user: ${userId}`);
    }
  }

  broadcastToAdmins(event, data) {
    this.emitToRoom('owner-dashboard', event, data);
  }

  emitBookingCreated(booking) {
    this.broadcastToAdmins(SOCKET_EVENTS.BOOKING_CREATED, booking);
    this.emitToUser(booking.userId?.toString(), SOCKET_EVENTS.BOOKING_CREATED, booking);
  }

  emitBookingUpdated(booking) {
    this.broadcastToAdmins(SOCKET_EVENTS.BOOKING_UPDATED, booking);
    this.emitToUser(booking.userId?.toString(), SOCKET_EVENTS.BOOKING_UPDATED, booking);
  }

  emitBookingCancelled(booking) {
    this.broadcastToAdmins(SOCKET_EVENTS.BOOKING_CANCELLED, booking);
    this.emitToUser(booking.userId?.toString(), SOCKET_EVENTS.BOOKING_CANCELLED, booking);
  }

  emitCarStatusChanged(carId, oldStatus, newStatus) {
    this.emitToRoom(`car:${carId}`, SOCKET_EVENTS.CAR_STATUS_CHANGED, { carId, oldStatus, newStatus });
    this.broadcastToAdmins(SOCKET_EVENTS.CAR_STATUS_CHANGED, { carId, oldStatus, newStatus });
  }

  emitPaymentReceived(bookingId, amount) {
    this.broadcastToAdmins(SOCKET_EVENTS.PAYMENT_RECEIVED, { bookingId, amount });
  }

  emitNotification(userId, title, message, type = 'info') {
    const notification = { title, message, type, timestamp: new Date() };
    this.emitToUser(userId, SOCKET_EVENTS.NOTIFICATION, notification);
  }

  emitAdminStatsUpdate(stats) {
    this.broadcastToAdmins(SOCKET_EVENTS.ADMIN_STATS_UPDATE, stats);
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  getConnectedCount() {
    return this.connectedUsers.size;
  }
}

let socketService = null;

const initSocketService = (io) => {
  socketService = new SocketService(io);
  socketService.initialize();
  return socketService;
};

const getSocketService = () => socketService;

module.exports = {
  SOCKET_EVENTS,
  SocketService,
  initSocketService,
  getSocketService
};