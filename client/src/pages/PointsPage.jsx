import { useEffect, useMemo, useState } from 'react';

const getPlacementLabel = (rule) => {
  if (rule.placingFrom === rule.placingTo) {
    if (rule.placingFrom === 1) return '1st';
    if (rule.placingFrom === 2) return '2nd';
    if (rule.placingFrom === 3) return '3rd';
    return `${rule.placingFrom}°`;
  }

  return `Top ${rule.placingTo}`;
};

const getPlayersLabel = (items) => {
  if (!items.length) return '';

  const first = items[0];
  if (first.maxPlayers === null || first.maxPlayers === undefined) {
    return `(${first.minPlayers}+ jugadores)`;
  }

  if (first.minPlayers === first.maxPlayers) {
    return `(${first.minPlayers} jugadores)`;
  }

  return `(hasta ${first.maxPlayers} jugadores)`;
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

  const groupedRules = useMemo(() => {
    const groups = {};

    for (const rule of rules) {
      if (!groups[rule.label]) {
        groups[rule.label] = [];
      }
      groups[rule.label].push(rule);
    }

    return Object.entries(groups).map(([label, items]) => ({
      label,
      items: [...items].sort((a, b) => a.placingFrom - b.placingFrom),
    }));
  }, [rules]);

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,7,18,0.98))] p-5 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Sistema de liga
        </p>

        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
          Sistema de puntos
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Consultá cómo se asignan los puntos según el tipo de torneo, la cantidad de jugadores y la posición final.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-slate-300">
          Cargando reglas...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
          {error}
        </div>
      ) : !groupedRules.length ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-slate-400">
          No hay reglas cargadas.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedRules.map((group, index) => (
            <div
              key={group.label}
              className="overflow-hidden rounded-[22px] border border-slate-800 bg-[linear-gradient(180deg,rgba(12,16,40,0.98),rgba(5,7,24,0.98))] shadow-[0_0_0_1px_rgba(34,211,238,0.03)]"
            >
              <div className="border-b border-slate-800/80 px-4 py-4 sm:px-5">
                <h2
                  className={`text-sm font-extrabold uppercase tracking-[0.04em] ${
                    index === 1 ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  {group.label} {getPlayersLabel(group.items)}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/[0.03] text-slate-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold sm:px-5">
                        Posición
                      </th>
                      <th className="px-4 py-3 text-right font-semibold sm:px-5">
                        Puntos
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {group.items.map((rule) => (
                      <tr
                        key={rule.id}
                        className="border-t border-slate-800/70 text-slate-100"
                      >
                        <td className="px-4 py-4 font-semibold sm:px-5">
                          {getPlacementLabel(rule)}
                        </td>
                        <td className="px-4 py-4 text-right font-extrabold sm:px-5">
                          {rule.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}