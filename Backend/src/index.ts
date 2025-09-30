import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import authRoutes from './routes/authRoutes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (_req, res) => {
  return res.json({ status: 'OK', message: 'Server is running' });
});

// Example API endpoint
app.get('/api/users', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.json(data); // Added return
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' }); // Added return
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email }])
      .select();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(201).json(data); // Added return
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' }); // Added return
  }
});

// Mount auth routes (provides /auth/register and /auth/login)
app.use('/', authRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});