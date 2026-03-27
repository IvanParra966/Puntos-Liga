import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiAward, FiRefreshCcw, FiSearch } from 'react-icons/fi';
import StatCard from './components/StatCard.jsx';
import LeagueTable from './components/LeagueTable.jsx';
import PointsEditor from './components/PointsEditor.jsx';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

const formatDateTime = (value) => {
  if (!value) return 'Todavía no sincronizado';
  return new Date(value).toLocaleString('es-AR');
};

export default function App() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');
      const overviewResponse = await api.get('/league/overview');
      setOverview(overviewResponse.data);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError('');
      await api.post('/league/sync');
      await loadData();
    } catch (syncError) {
      setError(syncError?.response?.data?.message || 'No se pudo sincronizar la liga');
    } finally {
      setSyncing(false);
    }
  };

  const filteredLeaderboard = useMemo(() => {
    const list = overview?.leaderboard || [];
    if (!search.trim()) return list;

    const query = search.trim().toLowerCase();
    return list.filter((player) => (
      player.name.toLowerCase().includes(query)
      || player.limitlessPlayerId.toLowerCase().includes(query)
      || String(player.country || '').toLowerCase().includes(query)
    ));
  }, [overview, search]);

  const totalFirstPlaces = useMemo(() => {
    return (overview?.leaderboard || []).reduce((acc, player) => acc + player.firstPlaces, 0);
  }, [overview]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_28%),radial-gradient(circle_at_right,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(180deg,#020617_0%,#071028_54%,#020617_100%)]">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <header className="overflow-hidden rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-4 shadow-soft backdrop-blur sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                <FiAward />
                Liga Catamarca · Limitless TCG
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Tabla de posiciones de Catamarca
              </h1>

             
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <FiRefreshCcw className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-slate-400 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
              Organizer ID: <span className="font-medium text-slate-200">{overview?.summary?.organizerId ?? 281}</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
              Juego: <span className="font-medium text-slate-200">{overview?.summary?.game ?? 'DCG'}</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
              Última sync: <span className="font-medium text-slate-200">{formatDateTime(overview?.summary?.lastSync)}</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
              Estado: <span className="font-medium capitalize text-slate-200">{overview?.summary?.syncStatus || 'idle'}</span>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mt-6 rounded-3xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-3xl bg-slate-900/80" />
            ))}
          </div>
        ) : (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Jugadores únicos"
                value={overview?.summary?.playersCount || 0}
                subtitle="Participantes cargados en la liga de Catamarca"
              />
              <StatCard
                title="Torneos jugados"
                value={overview?.summary?.tournamentsCount || 0}
                subtitle="Torneos completados tomados desde la API"
              />
              <StatCard
                title="Puntos repartidos"
                value={overview?.summary?.totalPointsAwarded || 0}
                subtitle="Suma de puntos asignados por el reglamento"
              />
              <StatCard
                title="Veces campeón"
                value={totalFirstPlaces}
                subtitle="Cantidad total de primeros puestos registrados"
              />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
              <div className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-soft backdrop-blur sm:p-5 lg:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-white sm:text-2xl">Tabla general de la liga</h2>
                    
                  </div>

                  <label className="relative block w-full lg:max-w-sm">
                    <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar jugador, ID o país"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-3 pl-11 pr-4 text-white outline-none transition focus:border-cyan-400"
                    />
                  </label>
                </div>

                <div className="mt-5 min-w-0">
                  <LeagueTable leaderboard={filteredLeaderboard} />
                </div>
              </div>

              <div className="min-w-0">
                <PointsEditor rules={overview?.rules || []} />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
