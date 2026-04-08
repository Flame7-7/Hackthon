// frontend/src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = (username, onEvent) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!username) return;

    const socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
      auth: { username },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
      if (onEvent?.onConnect) onEvent.onConnect(socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      if (onEvent?.onDisconnect) onEvent.onDisconnect(reason);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });

    // Register all event handlers
    if (onEvent) {
      Object.entries(onEvent).forEach(([event, handler]) => {
        if (event !== 'onConnect' && event !== 'onDisconnect') {
          socket.on(event, handler);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [username]);

  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot emit ${event}: not connected`);
    }
  };

  return { isConnected, error, emit, socket: socketRef.current };
};