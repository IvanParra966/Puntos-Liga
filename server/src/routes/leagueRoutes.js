import { Router } from 'express';
import { getLeagueOverview, syncCatamarcaLeague } from '../services/leagueService.js';

const router = Router();

router.get('/overview', async (req, res) => {
  try {
    const data = await getLeagueOverview();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener la tabla de liga', error: error.message });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const result = await syncCatamarcaLeague();
    res.json({ message: 'Sincronización completada', result });
  } catch (error) {
    res.status(500).json({ message: 'No se pudo sincronizar la liga', error: error.message });
  }
});

export default router;
