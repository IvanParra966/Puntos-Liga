import { useEffect, useMemo, useState } from 'react';
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-white">{value}</p>
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
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPlacementTone(item.placing)}`}>
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
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPlacementTone(item.placing)}`}>
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

        const response = await fetch('/api/league/overview');
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
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6">
          <p className="text-slate-300">No se encontró el jugador.</p>

          <Link
            to="/ranking"
            className="mt-4 inline-flex rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
          >
            Volver al ranking
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 sm:p-6">
        <Link
          to="/ranking"
          className="inline-flex rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
        >
          Volver al ranking
        </Link>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {player.name}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              ID: {player.limitlessPlayerId}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              País: {player.country || '-'}
            </p>
          </div>

          <div className="inline-flex w-fit rounded-full bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-300">
            Ranking actual: {player.rank}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-white">Varios datos</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Ranking actual" value={player.rank} />
          <StatCard label="Total de torneos jugados" value={player.tournamentsPlayed} />
          <StatCard label="Total de torneos ganados" value={player.firstPlaces} />
          <StatCard label="Mazo más jugado" value={mostPlayedDeck} />
          <StatCard
            label="Mejor posición alcanzada"
            value={bestFinish.placing ? formatPlacement(bestFinish.placing) : '-'}
          />
          <StatCard
            label="Fecha de la mejor posición"
            value={bestFinish.date ? formatDate(bestFinish.date) : '-'}
          />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-white">Histórico</h2>
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