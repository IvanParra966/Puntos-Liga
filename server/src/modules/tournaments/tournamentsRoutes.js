import { Router } from 'express';
import { requireAuth } from '../../app/middlewares/requireAuth.js';
import {
  cloneTournament,
  createTournament,
  exportTournament,
  getNodeTournaments,
  getTournamentById,
  getTournamentCatalogs,
  updateTournament,
} from './tournamentsController.js';

const router = Router();

router.get('/catalogs', requireAuth, getTournamentCatalogs);
router.get('/organizations/:organizationId/nodes/:nodeId', requireAuth, getNodeTournaments);
router.get('/:id', requireAuth, getTournamentById);

router.post('/', requireAuth, createTournament);
router.patch('/:id', requireAuth, updateTournament);
router.post('/:id/clone', requireAuth, cloneTournament);
router.post('/:id/export', requireAuth, exportTournament);

export default router;