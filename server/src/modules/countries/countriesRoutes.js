import { Router } from 'express';
import { getCountries } from './countriesController.js';

const router = Router();

router.get('/', getCountries);

export default router;