import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleChat } from '../controllers/chat.controller.js';

const router = Router();

router.post('/chat', requireAuth, handleChat);

export default router;

