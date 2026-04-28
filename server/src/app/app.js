import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import registerRoutes from './routes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../../uploads'))
);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Servidor funcionando' });
});

registerRoutes(app);

export default app;