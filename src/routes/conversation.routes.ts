import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleListConversations } from '../controllers/conversation.controller.js';

const router = Router();

router.get('/conversation', requireAuth, handleListConversations);

export default router;

