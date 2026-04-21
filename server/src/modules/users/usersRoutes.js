import { Router } from 'express';
import { requireAuth } from '../../app/middlewares/requireAuth.js';
import { updateMyProfile, updateMyPassword } from './usersController.js';

const router = Router();

router.put('/me', requireAuth, updateMyProfile);
router.put('/me/password', requireAuth, updateMyPassword);

export default router;