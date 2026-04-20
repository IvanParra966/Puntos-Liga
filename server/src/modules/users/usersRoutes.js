import { Router } from 'express';
import { requireAuth } from '../../app/middlewares/requireAuth.js';
import { updateMyProfile } from './usersController.js';

const router = Router();

router.put('/me', requireAuth, updateMyProfile);

export default router;