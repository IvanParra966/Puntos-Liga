import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from '../modules/home/pages/HomePage';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import CreateOrganizationRequestPage from '../modules/organizationsRequests/pages/CreateOrganizationRequestPage';
import MyOrganizationRequestsPage from '../modules/organizationsRequests/pages/MyOrganizationRequestsPage';
import ProfilePage from '../modules/profile/pages/ProfilePage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/organization-requests/new" element={<CreateOrganizationRequestPage />} />
      <Route path="/organization-requests/me" element={<MyOrganizationRequestsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}