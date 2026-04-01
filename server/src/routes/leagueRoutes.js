import { Router } from 'express';
import {
  getLeagueOverview,
  getPlayerDetail,
  getSeasonsOverview,
  syncCatamarcaLeague,
} from '../services/leagueService.js';
const router = Router();
router.get('/overview', async (req, res) => {
  try {
    const season = req.query.season || 'active';
    const data = await getLeagueOverview(season);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'No se pudo obtener la tabla de liga',
      error: error.message,
    });
  }
});
router.get('/seasons', async (req, res) => {
  try {
    const data = await getSeasonsOverview();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'No se pudieron obtener las temporadas',
      error: error.message,
    });
  }
});
router.get('/player/:playerId', async (req, res) => {
  try {
    const season = req.query.season || 'active';
    const data = await getPlayerDetail(req.params.playerId, season);
    if (!data) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'No se pudo obtener el detalle del jugador',
      error: error.message,
    });
  }
});
router.post('/sync', async (req, res) => {
  try {
    const result = await syncCatamarcaLeague();
    res.json({ message: 'Sincronización completada', result });
  } catch (error) {
    res.status(500).json({
      message: 'No se pudo sincronizar la liga',
      error: error.message,
    });
  }
});
export default router;
