import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import leagueRoutes from './routes/leagueRoutes.js';
import pointRoutes from './routes/pointRoutes.js';

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Servidor funcionando' });
});

app.use('/api/league', leagueRoutes);
app.use('/api/points', pointRoutes);

export default app;
