import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { initializeSocketHandlers } from './socket/socketHandler';
import authRoutes from './routes/authRoutes'

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
app.use('/', authRoutes);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Initialize socket handlers
initializeSocketHandlers(io);

// Routes
app.get('/api/health', (_req, res) => {
  return res.json({ status: 'OK', message: 'Server is running' });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO ready on http://localhost:${PORT}`);
});