import WebSocket from 'ws';
import { Socket } from 'socket.io';
import dotenv from "dotenv";
import { GenerateMermaidDiagram } from './openAI';

dotenv.config();

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

interface AssemblyAIMessage {
  type: string;
  id?: string;
  expires_at?: string;
  transcript?: string;
  turn_is_formatted?: boolean;
  end_of_turn?: boolean;
  audio_duration_seconds?: number;
  session_duration_seconds?: number;
}

export const createAssemblyAIConnection = (socket: Socket): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    // Build connection URL with parameters
    const params = new URLSearchParams({
      sample_rate: '16000',
      format_turns: 'true'
    });
    console.log(ASSEMBLYAI_API_KEY)
    const assemblyUrl = `wss://streaming.assemblyai.com/v3/ws?${params.toString()}`;
    
    // Connect to AssemblyAI WebSocket
    const assemblySocket = new WebSocket(assemblyUrl, {
      headers: { 
        'Authorization': ASSEMBLYAI_API_KEY 
      }
    });

    assemblySocket.on('open', () => {
      console.log('Connected to AssemblyAI v3 streaming');
      socket.emit('status', { message: 'Listening...' });
      resolve(assemblySocket);
    });

    assemblySocket.on('message', async (data) => {
      try {
        const message: AssemblyAIMessage = JSON.parse(data.toString());
        handleAssemblyAIMessage(message, socket);
      } catch (error) {
        console.error('Error parsing AssemblyAI message:', error);
      }
    });

    assemblySocket.on('error', (error) => {
      console.error('AssemblyAI WebSocket error:', error);
      socket.emit('error', { message: 'Transcription service error' });
      reject(error);
    });

    assemblySocket.on('close', () => {
      console.log('AssemblyAI connection closed');
      socket.emit('status', { message: 'Disconnected' });
    });
  });
};

const handleAssemblyAIMessage = (message: AssemblyAIMessage, socket: Socket) => {
  const msgType = message.type;
  
  if (msgType === 'Begin') {
    console.log('Session began:', message.id);
    socket.emit('session-started', { 
      sessionId: message.id,
      expiresAt: message.expires_at 
    });
  }
  
  else if (msgType === 'Turn') {
    console.log("turn");
    const transcript = message.transcript || '';
    const isFormatted = message.turn_is_formatted;
    const endOfTurn = message.end_of_turn;
    
    // Send partial or final transcript to frontend
    if (isFormatted && endOfTurn) {
      console.log('Final transcript:', transcript);
      GenerateMermaidDiagram(transcript);
      // count ++ if count = 0 erase history and create a new dr
      //else continue from previous prompts
      socket.emit('transcript', { text: transcript, final: true });
      
      // Parse with AI only on final transcripts
    } else {
      // Partial transcript (for real-time feedback)
      socket.emit('partial-transcript', { text: transcript });
    }
  }
  
  else if (msgType === 'Termination') {
    console.log('Session terminated:', message);
    socket.emit('session-ended', {
      audioDuration: message.audio_duration_seconds,
      sessionDuration: message.session_duration_seconds
    });
  }
};