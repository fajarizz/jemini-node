import type { Request, Response } from 'express';
import { signIn, signUp } from '../services/auth.service.js';
import { mapUser } from '../models/auth.model.js';

function validate(req: Request): { email: string; password: string } | null {
  const { email, password } = req.body || {};
  if (!email || !password) return null;
  return { email, password };
}

export async function handleSignUp(req: Request, res: Response) {
  const creds = validate(req);
  if (!creds) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await signUp(creds);
    return res.status(201).json({ user: mapUser(result.user) });
  } catch (e: any) {
    return res.status(e.status || 400).json({ error: e.message, details: e.details });
  }
}

export async function handleLogin(req: Request, res: Response) {
  const creds = validate(req);
  if (!creds) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await signIn(creds);
    return res.json({ user: mapUser(result.user), session: result.session });
  } catch (e: any) {
    return res.status(e.status || 400).json({ error: e.message, details: e.details });
  }
}

export async function handleMe(req: Request, res: Response) {
  return res.json({ user: mapUser((req as any).user) });
}
