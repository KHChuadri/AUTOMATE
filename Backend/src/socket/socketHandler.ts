import { Server, Socket } from 'socket.io';
import { handleStreamEvents } from './handlers/streamHandler';
import { handleDiagramEvents } from './handlers/diagramHandler';

export interface SocketSession {
  assemblySocket: any;
}

// Store active sessions
export const sessions = new Map<string, SocketSession>();

export const initializeSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Initialize stream handlers
    handleStreamEvents(socket);
    
    // Initialize diagram handlers
    handleDiagramEvents(socket);

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      const session = sessions.get(socket.id);
      if (session?.assemblySocket) {
        session.assemblySocket.close();
      }
      sessions.delete(socket.id);
    });
  });
};