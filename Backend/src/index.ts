import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import { createServer } from 'http';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5003;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Websocket
const io = new Server(httpServer, {
  // front end port
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

// Store active sessions
const sessions = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  let assemblySocket: WebSocket | null = null;

  socket.on('start-stream', async () => {
    console.log('Starting AssemblyAI stream for:', socket.id);
    
    // Build connection URL with parameters
    const params = new URLSearchParams({
      sample_rate: '16000',
      format_turns: 'true'
    });
    
    const assemblyUrl = `wss://streaming.assemblyai.com/v3/ws?${params.toString()}`;
    
    // Connect to AssemblyAI WebSocket
    assemblySocket = new WebSocket(assemblyUrl, {
      headers: { 
        'Authorization': ASSEMBLYAI_API_KEY 
      }
    });

    assemblySocket.on('open', () => {
      console.log('Connected to AssemblyAI v3 streaming');
      socket.emit('status', { message: 'Listening...' });
    });

    assemblySocket.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const msgType = message.type;
        
        if (msgType === 'Begin') {
          console.log('Session began:', message.id);
          socket.emit('session-started', { 
            sessionId: message.id,
            expiresAt: message.expires_at 
          });
        }
        
        else if (msgType === 'Turn') {
          console.log("turn")
          const transcript = message.transcript || '';
          const isFormatted = message.turn_is_formatted;
          const endOfTurn = message.end_of_turn;
          
          // Send partial or final transcript to frontend
          if (isFormatted && endOfTurn) {
            console.log('Final transcript:', transcript);
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
        
      } catch (error) {
        console.error('Error parsing AssemblyAI message:', error);
      }
    });

    assemblySocket.on('error', (error) => {
      console.error('AssemblyAI WebSocket error:', error);
      socket.emit('error', { message: 'Transcription service error' });
    });

    assemblySocket.on('close', () => {
      console.log('AssemblyAI connection closed');
      socket.emit('status', { message: 'Disconnected' });
    });

    sessions.set(socket.id, { assemblySocket });
  });

  socket.on('audio-data', (audioBuffer) => {
    console.log("voices here")
    const session = sessions.get(socket.id);
    if (session?.assemblySocket?.readyState === WebSocket.OPEN) {
      // Send raw binary audio data (Buffer) to AssemblyAI
      session.assemblySocket.send(audioBuffer);
    }
  });

  socket.on('stop-stream', () => {
    console.log("stop here")
    const session = sessions.get(socket.id);
    if (session?.assemblySocket?.readyState === WebSocket.OPEN) {
      // Send termination message as JSON
      session.assemblySocket.send(JSON.stringify({ type: 'Terminate' }));
      // Close connection after a short delay
      setTimeout(() => {
        session.assemblySocket?.close();
      }, 500);
    }
    sessions.delete(socket.id);
    socket.emit('status', { message: 'Stopped' });
  });

  socket.on('manual-update', (data) => {
    socket.emit('diagram-update', { 
      mermaidCode: data.mermaidCode 
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const session = sessions.get(socket.id);
    if (session?.assemblySocket) {
      session.assemblySocket.close();
    }
    sessions.delete(socket.id);
  });
});

// Routes
app.get('/api/health', (_req, res) => {
  return res.json({ status: 'OK', message: 'Server is running' });
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO ready on http://localhost:${PORT}`);
});