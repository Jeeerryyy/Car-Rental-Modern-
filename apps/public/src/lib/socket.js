import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from './socket.events.js';

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket'],
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
