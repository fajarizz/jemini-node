import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

// Extends Express Request to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: any; // You can refine with a Supabase user type if desired
  }
}

// Bearer token auth middleware using Supabase Auth (JWT from client)
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }
    const accessToken = header.substring('Bearer '.length).trim();
    if (!accessToken) {
      return res.status(401).json({ error: 'Empty token' });
    }

    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token', details: error?.message });
    }

    req.user = data.user;
    return next();
  } catch (e: any) {
    return res.status(500).json({ error: 'Auth middleware failure', details: e?.message });
  }
}
