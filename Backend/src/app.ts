import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import 'dotenv/config';

type GraphEdge = { from: string; to: string; label: string }
type GraphState = { nodes: Set<string>; edges: GraphEdge[] }

const app = express();
const httpServer = createServer(app);
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
  let graphState: GraphState = { nodes: new Set<string>(), edges: [] }

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
          const transcript = message.transcript || '';
          const isFormatted = message.turn_is_formatted;
          const endOfTurn = message.end_of_turn;
          
          // Send partial or final transcript to frontend
          if (isFormatted && endOfTurn) {
            console.log('Final transcript:', transcript);
            socket.emit('transcript', { text: transcript, final: true });
            
            // Parse with AI only on final transcripts
            // if (transcript.length > 10) {
            //   const parsed = await parseWithAI(transcript);
              
            //   if (parsed && (parsed.nodes.length > 0 || parsed.edges.length > 0)) {
            //     updateGraphState(graphState, parsed);
            //     const mermaidCode = generateMermaid(graphState);
                
            //     socket.emit('diagram-update', { 
            //       mermaidCode,
            //       parsed 
            //     });
            //   }
            // }
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

    sessions.set(socket.id, { assemblySocket, graphState });
  });

  socket.on('audio-data', (audioBuffer) => {
    const session = sessions.get(socket.id);
    if (session?.assemblySocket?.readyState === WebSocket.OPEN) {
      // Send raw binary audio data (Buffer) to AssemblyAI
      session.assemblySocket.send(audioBuffer);
    }
  });

  socket.on('stop-stream', () => {
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

// // AI Parsing Function - You'll need to add OpenAI/Claude API
// async function parseWithAI(text) {
//   // TODO: Implement with OpenAI or Claude API
//   // For testing, you can use a simple regex-based parser first
  
//   try {
//     // Simple regex-based parser for demo (replace with AI later)
//     const nodes: string[] = []
//     const edges: GraphEdge[] = []
    
//     // Extract potential entities (capitalized words or quoted terms)
//     // const entityRegex = /(?:the |a |an )?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|"[^"]+"|'[^']+')/g;
//     // const matches = [...text.matchAll(entityRegex)];
//     // const potentialNodes = matches.map(m => m[1].replace(/['"]/g, ''));
    
//     // Extract relationships (verb phrases)
//     const relationshipRegex = /(\w+(?:\s+\w+)*)\s+(sends?|queries?|authenticates?|connects?|stores?|forwards?|returns?|calls?|invokes?|requests?)\s+(?:to\s+|with\s+|in\s+|a\s+)?(\w+(?:\s+\w+)*)/gi;
//     const relMatches = [...text.matchAll(relationshipRegex)];
    
//     relMatches.forEach(match => {
//       const source = match[1].trim();
//       const action = match[2].trim();
//       const target = match[3].trim();
      
//       if (source && target) {
//         nodes.push(source);
//         nodes.push(target);
//         edges.push({ from: source, to: target, label: action });
//       }
//     });
    
//     // Remove duplicates from nodes
//     const uniqueNodes: string[] = [...new Set(nodes)]
    
//     return {
//       nodes: uniqueNodes,
//       edges: edges
//     };
    
//   } catch (error) {
//     console.error('Parsing error:', error);
//     return { nodes: [], edges: [] };
//   }
// }

// function updateGraphState(graphState, parsed) {
//   // Add new nodes
//   parsed.nodes.forEach(node => graphState.nodes.add(node));
  
//   // Add new edges (avoid exact duplicates)
//   parsed.edges.forEach(edge => {
//     const exists = graphState.edges.some(e => 
//       e.from === edge.from && e.to === edge.to && e.label === edge.label
//     );
//     if (!exists) {
//       graphState.edges.push(edge);
//     }
//   });
// }

// function generateMermaid(graphState) {
//   if (graphState.nodes.size === 0) {
//     return 'graph TD\n    A[Start Speaking]';
//   }
  
//   const nodes = Array.from(graphState.nodes);
//   const nodeMap = new Map();
  
//   // Create node IDs (A, B, C, etc.)
//   nodes.forEach((node, i) => {
//     const id = String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : '');
//     nodeMap.set(node, id);
//   });
  
//   let mermaid = 'graph TD\n';
  
//   // Add edges
//   graphState.edges.forEach(edge => {
//     const fromId = nodeMap.get(edge.from);
//     const toId = nodeMap.get(edge.to);
//     if (fromId && toId) {
//       mermaid += `    ${fromId}[${edge.from}] -->|${edge.label}| ${toId}[${edge.to}]\n`;
//     }
//   });
  
//   return mermaid;
// }

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log("felicia")
  console.log(`Server running on http://localhost:${PORT}`);
});