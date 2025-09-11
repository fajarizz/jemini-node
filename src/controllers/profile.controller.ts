import type { Request, Response } from 'express';
import { getProfileById as fetchProfile, updateProfile } from '../services/profile.service.js';

export async function handleGetProfileById(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'Missing id' });
  try {
    const profile = await fetchProfile(id);
    return res.json({ profile });
  } catch (e: any) {
    return res.status(e.status || 404).json({ error: e.message, details: e.details });
  }
}

export async function handleGetMyProfile(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const profile = await fetchProfile(user.id);
    return res.json({ profile });
  } catch (e: any) {
    return res.status(e.status || 404).json({ error: e.message, details: e.details });
  }
}

export async function handleUpdateMyProfile(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { displayName, avatarUrl } = req.body || {};
  if (displayName && typeof displayName !== 'string') return res.status(400).json({ error: 'displayName must be a string' });
  if (avatarUrl && typeof avatarUrl !== 'string') return res.status(400).json({ error: 'avatarUrl must be a string' });
  try {
    const profile = await updateProfile(user.id, { displayName, avatarUrl });
    return res.json({ profile });
  } catch (e: any) {
    return res.status(e.status || 400).json({ error: e.message, details: e.details });
  }
}

