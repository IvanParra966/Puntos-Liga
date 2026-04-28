import { Router } from 'express';
import { requireAuth } from '../../app/middlewares/requireAuth.js';
import { uploadOrganizationLogo } from '../../app/middlewares/uploadOrganizationLogo.js';
import {
  createOrganizationNode,
  getMyOrganization,
  getOrganizationNodes,
  reorderOrganizationNodes,
  softDeleteOrganizationNode,
  updateOrganizationLogo,
  updateOrganizationNode,
} from './organizationsController.js';

const router = Router();

router.get('/my', requireAuth, getMyOrganization);
router.get('/:id/nodes', requireAuth, getOrganizationNodes);
router.post('/:id/nodes', requireAuth, createOrganizationNode);

router.patch('/nodes/reorder', requireAuth, reorderOrganizationNodes);
router.patch('/nodes/:nodeId/delete', requireAuth, softDeleteOrganizationNode);
router.patch('/nodes/:nodeId', requireAuth, updateOrganizationNode);

router.patch('/:id/logo', requireAuth, uploadOrganizationLogo, updateOrganizationLogo);

export default router;