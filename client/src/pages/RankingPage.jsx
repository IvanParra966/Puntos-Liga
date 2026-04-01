import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LeagueTable from '../components/LeagueTable';
import { apiGet } from '../lib/api';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR');
};

const getPlayerName = (playerId, standingsMap = new Map()) => {
  if (!playerId) return '-';
  return standingsMap.get(playerId)?.name || playerId;
};

const getPlayerPlacing = (playerId, standingsMap = new Map()) => {
  if (!playerId) return null;
  return standingsMap.get(playerId)?.placing || null;
};

const getRecordLabel = (standing) => {
  const wins = Number(standing?.wins || 0);
  const losses = Number(standing?.losses || 0);
  const ties = Number(standing?.ties || 0);
  return `${wins}-${losses}-${ties}`;
};

const getWinnerBadge = (pairing, standingsMap = new Map()) => {
  const winner = pairing?.winner;

  if (winner === null || winner === undefined || winner === '') {
    return {
      label: 'Sin resultado',
      className: 'bg-slate-800 text-slate-300 border-slate-700',
    };
  }

  if (winner === '0' || winner === 0) {
    return {
      label: 'Empate',
      className: 'bg-amber-400/15 text-amber-300 border-amber-400/20',
    };
  }

  if (winner === '-1' || winner === -1) {
    return {
      label: 'Doble derrota',
      className: 'bg-red-400/15 text-red-300 border-red-400/20',
    };
  }

  return {
    label: `Ganó ${getPlayerName(winner, standingsMap)}`,
    className: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
  };
};

const groupPairingsByRound = (pairings = []) => {
  const roundMap = new Map();

  pairings.forEach((pairing) => {
    const round = Number(pairing?.round || 0);

    if (!roundMap.has(round)) {
      roundMap.set(round, []);
    }

    roundMap.get(round).push(pairing);
  });

  return [...roundMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([round, items]) => ({
      round,
      pairings: [...items].sort((a, b) => Number(a?.table || 0) - Number(b?.table || 0)),
    }));
};

function TournamentStandings({ standings = [] }) {
  if (!standings.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
        Este torneo no tiene posiciones disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {standings.map((standing) => (
        <div
          key={`${standing.player}-${standing.placing}`}
          className="grid grid-cols-[64px_minmax(0,1fr)_72px] items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Posición</p>
            <p className="mt-1 text-lg font-black text-cyan-300">#{standing.placing || '-'}</p>
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{standing.name || standing.player}</p>
            <p className="mt-1 text-xs text-slate-400">
              {standing.player || '-'}
              {standing.deck?.name ? ` · ${standing.deck.name}` : ''}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Record</p>
            <p className="mt-1 text-sm font-bold text-white">{getRecordLabel(standing)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TournamentPairings({ pairings = [], standings = [] }) {
  if (!pairings.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
        Este torneo no tiene emparejamientos disponibles.
      </div>
    );
  }

  const standingsMap = new Map(
    standings.map((standing) => [
      standing.player,
      {
        name: standing.name || standing.player,
        placing: standing.placing || null,
      },
    ])
  );

  const rounds = groupPairingsByRound(pairings);

  return (
    <div className="space-y-5">
      {rounds.map((roundGroup) => (
        <div key={roundGroup.round}>
          <div className="mb-3 flex items-center gap-3">
            <div className="h-1 w-10 rounded-full bg-fuchsia-400" />
            <h4 className="text-lg font-bold text-white">Ronda {roundGroup.round}</h4>
          </div>

          <div className="space-y-2">
            {roundGroup.pairings.map((pairing, index) => {
              const winnerBadge = getWinnerBadge(pairing, standingsMap);
              const player1Name = getPlayerName(pairing.player1, standingsMap);
              const player2Name = getPlayerName(pairing.player2, standingsMap);
              const player1Placing = getPlayerPlacing(pairing.player1, standingsMap);
              const player2Placing = getPlayerPlacing(pairing.player2, standingsMap);

              return (
                <div
                  key={`${roundGroup.round}-${pairing.table || index}-${pairing.player1}-${pairing.player2}`}
                  className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        Mesa {pairing.table || '-'}
                      </p>

                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3">
                          <p className="truncate text-sm font-bold text-white">{player1Name}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {pairing.player1 || '-'}
                            {player1Placing ? ` · #${player1Placing}` : ''}
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3">
                          <p className="truncate text-sm font-bold text-white">{player2Name}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {pairing.player2 || '-'}
                            {player2Placing ? ` · #${player2Placing}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:pl-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-2 text-xs font-semibold ${winnerBadge.className}`}
                      >
                        {winnerBadge.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TournamentCard({ tournament }) {
  const totalRounds = groupPairingsByRound(tournament.pairings || []).length;

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,0.98))]">
      <div className="border-b border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-300/80">
              Torneo
            </p>

            <h3 className="mt-2 text-2xl font-black text-white">
              {tournament.shortName || tournament.name || 'Torneo'}
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              {formatDate(tournament.date)} · {tournament.playersCount || 0} jugadores
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[240px]">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-cyan-300">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
                Posiciones
              </p>
              <p className="mt-2 text-2xl font-black">{tournament.standings?.length || 0}</p>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-amber-300">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
                Rondas
              </p>
              <p className="mt-2 text-2xl font-black">{totalRounds || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)] sm:p-6">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-1 w-10 rounded-full bg-cyan-400" />
            <h4 className="text-lg font-bold text-white">Posiciones del torneo</h4>
          </div>

          <TournamentStandings standings={tournament.standings || []} />
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-1 w-10 rounded-full bg-fuchsia-400" />
            <h4 className="text-lg font-bold text-white">Rondas y ganadores</h4>
          </div>

          <TournamentPairings
            pairings={tournament.pairings || []}
            standings={tournament.standings || []}
          />
        </div>
      </div>
    </div>
  );
}

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

  const orderedTournaments = useMemo(() => {
    const tournaments = overview?.tournaments || [];
    return [...tournaments].sort((a, b) => new Date(a?.date) - new Date(b?.date));
  }, [overview]);

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,7,18,0.98))] p-5 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Temporada seleccionada
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
        <>
          <LeagueTable leaderboard={leaderboard} season={overview?.season} />

          <div className="rounded-[28px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,0.98))] p-5 sm:p-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Torneos de la temporada</h2>
              <p className="mt-1 text-sm text-slate-400">
                Posiciones finales, rondas y quién ganó cada duelo.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {!orderedTournaments.length ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-slate-400">
                  Esta temporada no tiene torneos cargados.
                </div>
              ) : (
                orderedTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id || tournament.shortName}
                    tournament={tournament}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}