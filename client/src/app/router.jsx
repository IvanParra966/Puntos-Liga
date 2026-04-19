import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}