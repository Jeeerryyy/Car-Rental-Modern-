import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useOwnerAuth } from './OwnerAuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useOwnerAuth();
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (userId) {
      let socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalhost && socketUrl.includes('localhost')) {
        socketUrl = window.location.origin;
      }

      let token = '';
      const cookieRow = document.cookie.split(';').find(c => c.trim().startsWith('ownerToken='));
      if (cookieRow) {
        token = cookieRow.trim().split('=')[1];
      }

      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        path: '/socket.io',
        auth: { token }
      });

      newSocket.on('connect', () => {
        newSocket.emit('join', `owner:${userId}`);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      setSocket(prevSocket => {
        if (prevSocket) {
          prevSocket.close();
        }
        return null;
      });
    }
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);