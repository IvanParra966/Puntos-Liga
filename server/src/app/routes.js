import authRoutes from '../modules/auth/authRoutes.js';
import organizationRequestsRoutes from '../modules/organizationsRequests/organizationRequestsRoutes.js';
import organizationRequestsAdminRoutes from '../modules/organizationsRequests/organizationRequestsAdminRoutes.js';
import countriesRoutes from '../modules/countries/countriesRoutes.js';
import usersRoutes from '../modules/users/usersRoutes.js';
import organizationsRoutes from '../modules/organizations/organizationsRoutes.js';

export default function registerRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/organization-requests', organizationRequestsRoutes);
  app.use('/api/admin/organization-requests', organizationRequestsAdminRoutes);
  app.use('/api/countries', countriesRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/organizations', organizationsRoutes);
}