import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { handleGetProfileById, handleGetMyProfile, handleUpdateMyProfile } from '../controllers/profile.controller.js';

const router = Router();

// Public (or could be protected depending on requirements) fetch by id
router.get('/profiles/:id', handleGetProfileById);

// Authenticated profile endpoints for current user
router.get('/profile/me', requireAuth, handleGetMyProfile);
router.patch('/profile/me', requireAuth, handleUpdateMyProfile);

export default router;

