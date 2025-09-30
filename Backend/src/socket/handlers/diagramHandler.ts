import { Socket } from 'socket.io';

export const handleDiagramEvents = (socket: Socket) => {
  socket.on('manual-update', (data) => {
    socket.emit('diagram-update', { 
      mermaidCode: data.mermaidCode 
    });
  });
};