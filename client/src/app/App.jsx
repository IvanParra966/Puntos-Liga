import { Navigate, Route, Routes } from 'react-router-dom';

import AppNavbar from '../shared/components/AppNavbar';

import RankingPage from '../modules/ranking/pages/RankingPage';
import PointsPage from '../modules/points/pages/PointsPage';
import LigasPage from '../modules/leagues/pages/LigasPage';
import PlayerDetailPage from '../modules/players/pages/PlayerDetailPage';
import KeywordsPage from '../modules/keywords/pages/KeywordsPage';
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppNavbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/ranking" replace />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/puntos" element={<PointsPage />} />
          <Route path="/ligas" element={<LigasPage />} />
          <Route path="/keywords" element={<KeywordsPage />} />
          <Route path="/jugador/:playerId" element={<PlayerDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}