import { Router } from 'express';
import {
  createOrganizationRequest,
  getMyOrganizationRequests,
  cancelOrganizationRequest,
} from './organizationRequestsController.js';
import { requireAuth } from '../../app/middlewares/requireAuth.js';
import { requirePermission } from '../../app/middlewares/requirePermission.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  requirePermission('organization_requests.create'),
  createOrganizationRequest
);

router.get(
  '/me',
  requireAuth,
  requirePermission('organization_requests.create'),
  getMyOrganizationRequests
);

router.patch(
  '/:id/cancel',
  requireAuth,
  requirePermission('organization_requests.create'),
  cancelOrganizationRequest
);

export default router;