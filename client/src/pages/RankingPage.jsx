import { useEffect, useMemo, useState } from 'react';
import LeagueTable from '../components/LeagueTable';

export default function RankingPage() {
  const [overview, setOverview] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/league/overview');
        if (!response.ok) {
          throw new Error('No se pudo cargar el ranking.');
        }

        const data = await response.json();
        setOverview(data);
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar el ranking.');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

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
    <section>
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Ranking de la liga
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Tocá el nombre del jugador para abrir su ficha en otra pestaña.
            </p>
          </div>

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar jugador, ID, país o deck"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
          />
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-sm text-slate-300">
            Cargando ranking...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
            {error}
          </div>
        ) : (
          <LeagueTable leaderboard={leaderboard} />
        )}
      </div>
    </section>
  );
}