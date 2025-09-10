import express, { type Request, type Response } from 'express';
import { supabase } from './config/supabase.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check
app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

// Sign up route (email + password)
app.post('/auth/signup', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  return res.status(201).json({ user: data.user });
});

// Login route
app.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  return res.json({ user: data.user, session: data.session });
});

// Protected route returning authenticated user
app.get('/me', requireAuth, (req: Request, res: Response) => {
  return res.json({ user: (req as any).user });
});

export default app;
