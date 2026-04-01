import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LeagueTable from '../components/LeagueTable';
import { apiGet } from '../lib/api';

export default function RankingPage() {
  const [overview, setOverview] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const selectedSeason = searchParams.get('season') || 'active';

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiGet(`/api/league/overview?season=${selectedSeason}`);
        setOverview(data);
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar el ranking.');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [selectedSeason]);

  const leaderboard = useMemo(() => {
    const source = overview?.leaderboard || [];

    if (!query.trim()) {
      return source;
    }

    const safeQuery = query.toLowerCase().trim();

    return source.filter((player) => {
      const values = [
        player.name,
        player.limitlessPlayerId,
        player.country,
        player.lastDeckName,
      ];

      return values.some((value) =>
        String(value || '').toLowerCase().includes(safeQuery)
      );
    });
  }, [overview, query]);

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,7,18,0.98))] p-5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Liga activa
            </p>

            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Ranking actual
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {overview?.season?.name || 'Temporada activa'}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-cyan-300">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              Torneos de la temporada
            </p>
            <p className="mt-2 text-2xl font-black">
              {overview?.summary?.tournamentsCount || 0}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar jugador, ID, país o deck"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-slate-300">
          Cargando ranking...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
          {error}
        </div>
      ) : (
        <LeagueTable leaderboard={leaderboard} season={overview?.season} />
      )}
    </section>
  );
}