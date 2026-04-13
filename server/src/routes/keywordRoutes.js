import { Router } from 'express';
import { Keyword } from '../models/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const keywords = await Keyword.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    res.json(keywords);
  } catch (error) {
    res.status(500).json({
      message: 'No se pudieron obtener las keywords',
      error: error.message,
    });
  }
});

export default router;