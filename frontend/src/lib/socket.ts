import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
    
    socket.on('error', (errorData) => {
        console.error('Socket server error:', errorData);
    });

  }
  return socket;
};

export const disconnectSocket = () => {
    if(socket && socket.connected) {
        socket.disconnect();
        console.log('Socket manually disconnected');
    }
};