import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from './socket.events.js';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token },
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket'],
  });
  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection failed:', err.message);
  });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;
