import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useOwnerAuth } from './OwnerAuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { owner, token } = useOwnerAuth();

  useEffect(() => {
    if (owner && token) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token },
        transports: ['websocket']
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [owner, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);