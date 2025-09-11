import type { Request, Response } from 'express';
import { chatWithGemini } from '../services/chat.service.js';

export async function handleChat(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { prompt, conversationId, title, model } = req.body || {};
  try {
    const result = await chatWithGemini({ userId: user.id, prompt, conversationId, title, model });
    return res.json(result);
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.message || 'Chat failed', details: e.details });
  }
}

