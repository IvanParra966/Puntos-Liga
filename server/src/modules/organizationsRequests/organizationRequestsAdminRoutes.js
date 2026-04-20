import { Router } from 'express';
import {
  getPendingOrganizationRequests,
  approveOrganizationRequest,
  rejectOrganizationRequest,
} from './organizationRequestsAdminController.js';
import { requireAuth } from '../../app/middlewares/requireAuth.js';
import { requirePermission } from '../../app/middlewares/requirePermission.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  requirePermission('organization_requests.review'),
  getPendingOrganizationRequests
);

router.patch(
  '/:id/approve',
  requireAuth,
  requirePermission('organization_requests.review'),
  approveOrganizationRequest
);

router.patch(
  '/:id/reject',
  requireAuth,
  requirePermission('organization_requests.review'),
  rejectOrganizationRequest
);

export default router;