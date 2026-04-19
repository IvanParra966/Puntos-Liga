import authRoutes from '../modules/auth/authRoutes.js';

export default function registerRoutes(app) {
  app.use('/api/auth', authRoutes);
}