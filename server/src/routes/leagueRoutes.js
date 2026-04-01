import { Router } from 'express';
import {
  getLeagueOverview,
  getPlayerDetail,
  getSeasonsOverview,
  syncCatamarcaLeague,
} from '../services/leagueService.js';

const router = Router();

const normalizeLookupValue = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

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

router.get('/limitless/tournaments/:id/standings', async (req, res) => {
  try {
    const { id } = req.params;
    const player = req.query.player || '';
    const name = req.query.name || '';

    const response = await fetch(`https://play.limitlesstcg.com/api/tournaments/${id}/standings`);

    if (!response.ok) {
      throw new Error('No se pudo consultar Limitless');
    }

    const data = await response.json();
    const players = Array.isArray(data) ? data : data?.players || [];

    if (!player && !name) {
      return res.json(players);
    }

    const normalizedPlayer = normalizeLookupValue(player);
    const normalizedName = normalizeLookupValue(name);

    const playerRow = players.find((item) => {
      const apiPlayer = normalizeLookupValue(item?.player);
      const apiName = normalizeLookupValue(item?.name);

      return (
        (normalizedPlayer && apiPlayer === normalizedPlayer) ||
        (normalizedName && apiName === normalizedName)
      );
    });

    if (!playerRow) {
      return res.status(404).json({
        message: 'No se encontró el jugador en el standings de Limitless',
      });
    }

    res.json(playerRow);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Error consultando Limitless',
    });
  }
});

export default router;