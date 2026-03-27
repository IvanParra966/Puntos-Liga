import { Router } from 'express';
import { getPointRules, savePointRules } from '../services/leagueService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rules = await getPointRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron obtener las reglas de puntaje', error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const rules = Array.isArray(req.body) ? req.body : [];
    const saved = await savePointRules(rules);
    res.json({ message: 'Reglas de puntaje actualizadas', rules: saved });
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron guardar las reglas de puntaje', error: error.message });
  }
});

export default router;
