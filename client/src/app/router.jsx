import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from '../modules/home/pages/HomePage';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import CreateOrganizationRequestPage from '../modules/organizationsRequests/pages/CreateOrganizationRequestPage';
import ProfilePage from '../modules/profile/pages/ProfilePage';
import AdminPage from '../modules/admin/pages/AdminPage';
import AdminOrganizationRequestsPage from '../modules/admin/pages/AdminOrganizationRequestsPage';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import MyOrganizationPage from '../modules/organizations/pages/MyOrganizationPage';
import TournamentDetailPage from '../modules/tournaments/pages/TournamentDetailPage';
import TournamentPublicPage from '../modules/tournaments/pages/TournamentPublicPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/tournaments/:slug" element={<TournamentPublicPage />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organization"
        element={
          <ProtectedRoute>
            <MyOrganizationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organization-requests/new"
        element={
          <ProtectedRoute>
            <CreateOrganizationRequestPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredPermission="organization_requests.review">
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/organization-requests"
        element={
          <ProtectedRoute requiredPermission="organization_requests.review">
            <AdminOrganizationRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization/tournaments/:id"
        element={
          <ProtectedRoute>
            <TournamentDetailPage />
          </ProtectedRoute>
        }
      />


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}