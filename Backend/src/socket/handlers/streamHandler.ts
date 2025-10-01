import { Socket } from 'socket.io';
import WebSocket from 'ws';
import { sessions } from '../socketHandler';
import { createAssemblyAIConnection } from '../../services/assemblyAI';
//import { StopCurrentSession } from '../../services/openAI';

export const handleStreamEvents = (socket: Socket) => {
  let assemblySocket: WebSocket | null = null;

  socket.on('start-stream', async () => {
    console.log('Starting AssemblyAI stream for:', socket.id);
    
    try {
      assemblySocket = await createAssemblyAIConnection(socket);
      sessions.set(socket.id, { assemblySocket });
    } catch (error) {
      console.error('Failed to start stream:', error);
      socket.emit('error', { message: 'Failed to connect to transcription service' });
    }
  });

  socket.on('audio-data', (audioBuffer) => {
    // console.log("voices here");
    const session = sessions.get(socket.id);
    if (session?.assemblySocket?.readyState === WebSocket.OPEN) {
      // Send raw binary audio data (Buffer) to AssemblyAI
      session.assemblySocket.send(audioBuffer);
    }
  });

  socket.on('stop-stream', () => {
    //StopCurrentSession();
    console.log("stop here");
    const session = sessions.get(socket.id);
    if (session?.assemblySocket?.readyState === WebSocket.OPEN) {
      // Send termination message as JSON
      session.assemblySocket.send(JSON.stringify({ type: 'Termination' }));
      // Close connection after a short delay
      setTimeout(() => {
        session.assemblySocket?.close();
      }, 500);
    }
    sessions.delete(socket.id);
    socket.emit('status', { message: 'Stopped' });
  });
};