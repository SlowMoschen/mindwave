import { useEffect } from "react";
import { useSocket } from "./useSocket";

export function useSocketListener(event: string, callback: (...args: unknown[]) => void) {
    const { socket } = useSocket();
  
    useEffect(() => {
      if (!socket) return;
  
      socket.on(event, callback);
  
      return () => {
        socket.off(event, callback);
      };
    }, [socket, event, callback]);
  }