import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../lib/api';
const formatDate = (value) => {
  if (!value) return '-';
  return new Date(`${value}T00:00:00`).toLocaleDateString('es-AR');
};
export default function LigasPage() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const loadSeasons = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiGet('/api/league/seasons');
        setSeasons(data || []);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las temporadas.');
      } finally {
        setLoading(false);
      }
    };
    loadSeasons();
  }, []);
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-800 bg-[radialgradient(circle_at_top_left,_rgba(168,85,247,0.10),_transparent_32%),lineargradient(180deg,rgba(2,6,23,0.98),rgba(3,7,18,0.98))] p-5 sm:p-8">
        <h1 className="text-3xl font-black text-white sm:text-4xl">Ligas</h1>
        <p className="mt-2 text-sm text-slate-400">
          Acá se muestran la temporada activa y las temporadas pasadas.
        </p>
      </div>
      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/40
p-6 text-slate-300">
          Cargando temporadas...
        </div>
      ) : error ? (
        <div
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 textred-200">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {seasons.map((season) => (
            <div
              key={season.key}
              className="rounded-2xl border border-slate-800 bg-slate-950/40
p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">{season.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatDate(season.startsAt)} —
                    {formatDate(season.endsAt)}
                  </p>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${season.isActive
                      ? 'bg-cyan-400/15 text-cyan-300 border bordercyan-400/20'
                      : 'bg-slate-900 text-slate-300 border border-slate-700'
                    }`}
                >
                  {season.isActive ? 'ACTIVA' : 'FINALIZADA'}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bgslate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] textslate-500">Torneos</p>
                  <p className="mt-2 text-2xl font-black textwhite">{season.tournamentsCount}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bgslate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] textslate-500">Jugadores</p>
                  <p className="mt-2 text-2xl font-black textwhite">{season.playersCount}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bgslate-950/60 p-4 col-span-2 sm:col-span-1">
                  <p className="text-xs uppercase tracking-[0.18em] textslate-500">Ganador</p>
                  <p className="mt-2 text-base font-bold text-cyan-300">
                    {season.winner?.name || '-'}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to={`/ranking?season=${season.key}`}
                  className="inline-flex items-center rounded-full border
border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold textcyan-300 transition hover:border-cyan-400/40 hover:text-white"
                >
                  Ver ranking de esta temporada
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

