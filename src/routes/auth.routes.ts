import { Router } from 'express';
import { handleSignUp, handleLogin, handleMe } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', handleSignUp);
router.post('/login', handleLogin);
router.get('/me', requireAuth, handleMe);

export default router;

