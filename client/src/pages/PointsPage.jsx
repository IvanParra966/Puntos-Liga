import { useEffect, useState } from 'react';

const formatPlayersRange = (rule) => {
  if (rule.maxPlayers === null || rule.maxPlayers === undefined) {
    return `${rule.minPlayers}+ jugadores`;
  }

  if (rule.minPlayers === rule.maxPlayers) {
    return `${rule.minPlayers} jugadores`;
  }

  return `${rule.minPlayers} a ${rule.maxPlayers} jugadores`;
};

const formatPlacingRange = (rule) => {
  if (rule.placingFrom === rule.placingTo) {
    return `${rule.placingFrom}° puesto`;
  }

  return `${rule.placingFrom}° al ${rule.placingTo}° puesto`;
};

export default function PointsPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        setError('');

        const API_URL = import.meta.env.VITE_API_URL || '';

        const response = await fetch(`${API_URL}/api/league/overview`);

        if (!response.ok) {
          throw new Error('No se pudieron cargar los puntos.');
        }

        const data = await response.json();
        setRules(data.rules || []);
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar los puntos.');
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  return (
    <section>
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Puntos</h1>
        <p className="mt-2 text-sm text-slate-400">
          Acá se muestran las reglas de puntuación de la liga.
        </p>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-slate-300">
            Cargando reglas...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        ) : !rules.length ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-slate-400">
            No hay reglas cargadas.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/30">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-950/90 text-slate-300">
                  <tr>
                    <th className="px-4 py-4 text-left">Regla</th>
                    <th className="px-4 py-4 text-left">Jugadores</th>
                    <th className="px-4 py-4 text-left">Posiciones</th>
                    <th className="px-4 py-4 text-left">Puntos</th>
                  </tr>
                </thead>

                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-t border-slate-800 text-slate-200">
                      <td className="px-4 py-4">{rule.label}</td>
                      <td className="px-4 py-4">{formatPlayersRange(rule)}</td>
                      <td className="px-4 py-4">{formatPlacingRange(rule)}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-cyan-400/15 px-3 py-1 font-semibold text-cyan-300">
                          {rule.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}