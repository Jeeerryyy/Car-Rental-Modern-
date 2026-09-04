import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from './socket.events.js';

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;
  const token = localStorage.getItem('customerToken');
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: token ? { token } : undefined,
    withCredentials: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
  });
  socket.on('connect_error', () => {
    // Silently handled — reconnection is automatic
  });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;
