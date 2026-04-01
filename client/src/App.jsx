import { Navigate, Route, Routes } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import RankingPage from './pages/RankingPage';
import PointsPage from './pages/PointsPage';
import LigasPage from './pages/LigasPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppNavbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/ranking" replace />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/puntos" element={<PointsPage />} />
          <Route path="/ligas" element={<LigasPage />} />
          <Route path="/jugador/:playerId" element={<PlayerDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
