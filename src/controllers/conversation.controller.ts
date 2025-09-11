import type { Request, Response } from 'express';
import { listConversationsForUser } from '../services/conversation.service.js';

export async function handleListConversations(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const conversations = await listConversationsForUser(user.id);
    return res.json({ conversations });
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.message || 'Failed to fetch conversations', details: e.details });
  }
}

