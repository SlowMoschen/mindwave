import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface ISocketContext {
  socket: Socket | null;
  userName: string | null;
  connectSocket: (userName: string) => void;
  disconnectSocket: () => void;
}

// Definiere den SocketContext
export const SocketContext = createContext<ISocketContext>({
  socket: null,
  userName: null,
  connectSocket: () => {},
  disconnectSocket: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const connectSocket = (userName: string) => {
    if (!userName) throw new Error("Username is required to connect to socket");
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    setUserName(userName);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
    }
  };

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        userName,
        connectSocket,
        disconnectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
