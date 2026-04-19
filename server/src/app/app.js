import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import registerRoutes from './routes.js';

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Servidor funcionando' });
});

registerRoutes(app);

export default app;