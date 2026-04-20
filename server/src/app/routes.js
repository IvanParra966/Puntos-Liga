import authRoutes from '../modules/auth/authRoutes.js';
import organizationRequestsRoutes from '../modules/organizationsRequests/organizationRequestsRoutes.js';

export default function registerRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/organization-requests', organizationRequestsRoutes);
}