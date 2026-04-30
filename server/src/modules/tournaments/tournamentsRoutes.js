import { Router } from 'express';
import { requireAuth } from '../../app/middlewares/requireAuth.js';
import {
  cloneTournament,
  createTournament,
  deleteTournament,
  exportTournament,
  getNodeTournaments,
  getPublicTournamentBySlug,
  getTournamentById,
  getTournamentCatalogs,
  registerToTournament,
  updateTournament,
  getMyTournamentRegistration,
  unregisterFromTournament,
  getMyTournamentDecklist,
  createTournamentDecklist,
  updateTournamentDecklist,
} from './tournamentsController.js';

const router = Router();

router.get('/catalogs', requireAuth, getTournamentCatalogs);
router.get('/organizations/:organizationId/nodes/:nodeId', requireAuth, getNodeTournaments);
router.get('/:id', requireAuth, getTournamentById);

router.post('/', requireAuth, createTournament);
router.patch('/:id', requireAuth, updateTournament);
router.post('/:id/clone', requireAuth, cloneTournament);
router.post('/:id/export', requireAuth, exportTournament);
router.delete('/:id', requireAuth, deleteTournament);


router.get('/public/:slug', getPublicTournamentBySlug);
router.post('/:id/register', requireAuth, registerToTournament);
router.get('/:id/my-registration', requireAuth, getMyTournamentRegistration);
router.delete('/tournaments/:id/register', requireAuth, unregisterFromTournament);
router.delete('/:id/register', requireAuth, unregisterFromTournament);


router.get('/:id/my-decklist', requireAuth, getMyTournamentDecklist);
router.post('/:id/decklist', requireAuth, createTournamentDecklist);
router.put('/:id/decklist', requireAuth, updateTournamentDecklist);
export default router;