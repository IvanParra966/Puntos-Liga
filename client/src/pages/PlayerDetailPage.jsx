import { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR');
};

const formatPlacement = (placing) => {
  if (!placing) return '-';
  return `${placing}°`;
};

const getPlacementTone = (placing) => {
  if (placing === 1) return 'bg-amber-400/15 text-amber-300 border-amber-400/20';
  if (placing === 2) return 'bg-slate-200/10 text-slate-200 border-slate-200/10';
  if (placing === 3) return 'bg-orange-400/15 text-orange-300 border-orange-400/20';
  if (placing <= 8) return 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20';
  return 'bg-slate-800 text-slate-300 border-slate-700';
};

const getMostPlayedDeck = (history = [], fallbackDeck = null) => {
  const deckMap = new Map();

  history.forEach((item) => {
    const deckName = String(item.deckName || '').trim();
    if (!deckName) return;

    const current = deckMap.get(deckName) || 0;
    deckMap.set(deckName, current + 1);
  });

  if (!deckMap.size) {
    return fallbackDeck || '-';
  }

  return [...deckMap.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })[0][0];
};

const getBestFinishInfo = (history = []) => {
  const validHistory = history.filter((item) => Number(item.placing) > 0);

  if (!validHistory.length) {
    return {
      placing: null,
      date: null,
    };
  }

  const bestPlacing = Math.min(...validHistory.map((item) => Number(item.placing)));

  const latestBestResult = [...validHistory]
    .filter((item) => Number(item.placing) === bestPlacing)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return {
    placing: bestPlacing,
    date: latestBestResult?.date || null,
  };
};

const getRecordTotals = (history = []) => {
  return history.reduce(
    (acc, item) => {
      acc.wins += Number(item.wins || 0);
      acc.losses += Number(item.losses || 0);
      acc.ties += Number(item.ties || 0);
      return acc;
    },
    { wins: 0, losses: 0, ties: 0 }
  );
};

const getWinRate = ({ wins, losses, ties }) => {
  const total = wins + losses + ties;
  if (!total) return '0%';
  return `${((wins / total) * 100).toFixed(1)}%`;
};

function TopBadge({ label, value, tone = 'cyan' }) {
  const toneClass =
    tone === 'emerald'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
      : tone === 'amber'
      ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
      : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300';

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function LeagueStatCard({ label, value, subtitle, wide = false }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/60 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] ${
        wide ? 'sm:col-span-2' : ''
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-400">
        {label}
      </p>

      <p className="mt-4 break-words text-2xl font-black leading-tight text-white sm:text-3xl">
        {value}
      </p>

      {subtitle ? (
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  );
}

function SummaryStatCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
      <div className="mb-4 h-1 w-12 rounded-full bg-cyan-400/80" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 break-words text-2xl font-bold text-white">{value}</p>
      {subtitle ? (
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  );
}

function HistoryTable({ history }) {
  return (
    <div className="hidden lg:block">
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/30">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-950/90 text-slate-300">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Torneo</th>
                <th className="px-4 py-3 text-left">Deck</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">Jugadores</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">Puesto</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">Puntos</th>
                <th className="whitespace-nowrap px-4 py-3 text-left">Record</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr
                  key={`${item.tournamentId}-${item.date}`}
                  className="border-t border-slate-800 text-slate-200"
                >
                  <td className="whitespace-nowrap px-4 py-3">{formatDate(item.date)}</td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{item.shortName}</p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="max-w-[220px] truncate" title={item.deckName || '-'}>
                      {item.deckName || '-'}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">{item.playersCount}</td>

                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPlacementTone(
                        item.placing
                      )}`}
                    >
                      {formatPlacement(item.placing)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">{item.pointsAwarded}</td>

                  <td className="whitespace-nowrap px-4 py-3">
                    {item.wins}-{item.losses}-{item.ties}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MobileHistory({ history }) {
  return (
    <div className="space-y-3 lg:hidden">
      {history.map((item) => (
        <div
          key={`${item.tournamentId}-${item.date}`}
          className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
        >
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {formatDate(item.date)}
              </p>
              <p className="mt-1 font-semibold text-white">{item.shortName}</p>
              <p className="mt-1 text-sm text-slate-400">
                Deck: {item.deckName || '-'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {item.playersCount} jugadores · {item.wins}-{item.losses}-{item.ties}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPlacementTone(
                  item.placing
                )}`}
              >
                {formatPlacement(item.placing)}
              </span>

              <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                {item.pointsAwarded} pts
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlayerDetailPage() {
  const { playerId } = useParams();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError('');

        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/league/overview`);

        if (!response.ok) {
          throw new Error('No se pudo cargar el detalle del jugador.');
        }

        const data = await response.json();
        setOverview(data);
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar el jugador.');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const player = useMemo(() => {
    const leaderboard = overview?.leaderboard || [];
    return leaderboard.find((item) => String(item.playerId) === String(playerId)) || null;
  }, [overview, playerId]);

  const history = useMemo(() => {
    if (!player?.history?.length) return [];
    return [...player.history].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [player]);

  const bestFinish = useMemo(() => getBestFinishInfo(history), [history]);
  const mostPlayedDeck = useMemo(
    () => getMostPlayedDeck(history, player?.lastDeckName),
    [history, player]
  );
  const totals = useMemo(() => getRecordTotals(history), [history]);
  const winRate = useMemo(() => getWinRate(totals), [totals]);

  if (loading) {
    return (
      <section>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-slate-300">
          Cargando jugador...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
          {error}
        </div>
      </section>
    );
  }

  if (!player) {
    return (
      <section>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-6">
          <p className="text-slate-300">No se encontró el jugador.</p>

          <Link
            to="/ranking"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
          >
            <FiArrowLeft size={16} />
            Volver al ranking
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.10),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.10),_transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,7,18,0.98))] p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/ranking"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
          >
            <FiArrowLeft size={16} />
            Volver al ranking
          </Link>

          <div className="hidden rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-300 sm:inline-flex">
            Jugador #{player.rank}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Perfil del jugador
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              {player.name}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Resumen general del jugador en la liga, con sus métricas principales,
              desempeño histórico y mazo más utilizado.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <TopBadge label="Puesto actual" value={`#${player.rank}`} tone="cyan" />
              <TopBadge
                label="Torneos jugados"
                value={player.tournamentsPlayed || 0}
                tone="emerald"
              />
              <TopBadge
                label="Torneos ganados"
                value={player.firstPlaces || 0}
                tone="amber"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Dato destacado
              </p>

              <p className="mt-3 text-lg font-semibold text-white">
                Mazo más jugado: <span className="text-cyan-300">{mostPlayedDeck}</span>
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                  Mejor posición: {bestFinish.placing ? formatPlacement(bestFinish.placing) : '-'}
                </span>

                <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                  Ratio: {winRate}
                </span>

                <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                  Record: {totals.wins}-{totals.losses}-{totals.ties}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-400/90">
              Panel actual
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <LeagueStatCard
                label="Ranking"
                value={`#${player.rank}`}
              />

              <LeagueStatCard
                label="Mejor posición"
                value={bestFinish.placing ? formatPlacement(bestFinish.placing) : '-'}
                subtitle={
                  bestFinish.date ? `Alcanzada el ${formatDate(bestFinish.date)}` : ''
                }
              />

              <LeagueStatCard
                label="Ratio de victorias"
                value={winRate}
                subtitle={`${totals.wins} victorias · ${totals.losses} derrotas · ${totals.ties} empates`}
                wide
              />

              <LeagueStatCard
                label="Mazo más jugado"
                value={mostPlayedDeck}
                wide
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,0.98))] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/75">
              Resumen histórico
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Datos destacados
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SummaryStatCard
            label="Torneos jugados"
            value={player.tournamentsPlayed || 0}
          />

          <SummaryStatCard
            label="Torneos ganados"
            value={player.firstPlaces || 0}
          />

          <SummaryStatCard
            label="Mejor posición"
            value={bestFinish.placing ? formatPlacement(bestFinish.placing) : '-'}
            subtitle={bestFinish.date ? `Alcanzada el ${formatDate(bestFinish.date)}` : ''}
          />

          <SummaryStatCard
            label="Victorias / derrotas / empates"
            value={`${totals.wins} / ${totals.losses} / ${totals.ties}`}
            subtitle={`Win rate: ${winRate}`}
          />

          <SummaryStatCard
            label="Mazo más jugado"
            value={mostPlayedDeck}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white">Histórico detallado</h2>
        <p className="mt-1 text-sm text-slate-400">
          Acá ves todos los torneos jugados por el jugador.
        </p>

        <div className="mt-4">
          {history.length ? (
            <>
              <HistoryTable history={history} />
              <MobileHistory history={history} />
            </>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-slate-400">
              Este jugador todavía no tiene historial.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}