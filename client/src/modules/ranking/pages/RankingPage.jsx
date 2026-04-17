import { useEffect, useMemo, useState } from 'react';
import { FiChevronRight, FiX } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import LeagueTable from '../../../components/LeagueTable';
import { apiGet } from '../../../shared/lib/api';

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

const getPlayerMatchResult = (pairing, playerId) => {
  const winner = String(pairing?.winner ?? '');

  if (!playerId) return 'PENDIENTE';
  if (winner === '0') return 'EMPATE';
  if (winner === '-1') return 'LOSS';
  if (!winner) return 'PENDIENTE';

  return winner === String(playerId) ? 'WIN' : 'LOSS';
};

const getResultClasses = (result) => {
  if (result === 'WIN') {
    return 'border-emerald-400/20 bg-emerald-400/15 text-emerald-300';
  }

  if (result === 'LOSS') {
    return 'border-red-400/20 bg-red-400/15 text-red-300';
  }

  if (result === 'EMPATE') {
    return 'border-amber-400/20 bg-amber-400/15 text-amber-300';
  }

  return 'border-slate-700 bg-slate-800 text-slate-300';
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

function RoundMatchCard({ pairing, standingsMap }) {
  const player1Name = getPlayerName(pairing.player1, standingsMap);
  const player2Name = getPlayerName(pairing.player2, standingsMap);

  const player1Placing = getPlayerPlacing(pairing.player1, standingsMap);
  const player2Placing = getPlayerPlacing(pairing.player2, standingsMap);

  const player1Result = getPlayerMatchResult(pairing, pairing.player1);
  const player2Result = getPlayerMatchResult(pairing, pairing.player2);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.70),rgba(2,6,23,0.88))] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-300">
            MESA {pairing.table || '-'}
          </span>

          {pairing.phase ? (
            <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-400">
              FASE {pairing.phase}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${getResultClasses(
                player1Result
              )}`}
            >
              {player1Result}
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{player1Name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {pairing.player1 || '-'}
                {player1Placing ? ` · #${player1Placing}` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-black tracking-[0.25em] text-fuchsia-300">
            VS
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{player2Name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {pairing.player2 || '-'}
                {player2Placing ? ` · #${player2Placing}` : ''}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${getResultClasses(
                player2Result
              )}`}
            >
              {player2Result}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_90px_minmax(0,1fr)] lg:items-center lg:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${getResultClasses(
              player1Result
            )}`}
          >
            {player1Result}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white sm:text-base">
              {player1Name}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {pairing.player1 || '-'}
              {player1Placing ? ` · #${player1Placing}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-black tracking-[0.25em] text-fuchsia-300">
            VS
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-bold text-white sm:text-base">
              {player2Name}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {pairing.player2 || '-'}
              {player2Placing ? ` · #${player2Placing}` : ''}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${getResultClasses(
              player2Result
            )}`}
          >
            {player2Result}
          </span>
        </div>
      </div>
    </div>
  );
}

function TournamentDetailModal({ open, onClose, tournament }) {
  const [activeRound, setActiveRound] = useState(0);
  const [direction, setDirection] = useState(1);

  const standingsMap = useMemo(() => {
    return new Map(
      (tournament?.standings || []).map((standing) => [
        standing.player,
        {
          name: standing.name || standing.player,
          placing: standing.placing || null,
        },
      ])
    );
  }, [tournament]);

  const rounds = useMemo(() => {
    return groupPairingsByRound(tournament?.pairings || []);
  }, [tournament]);

  useEffect(() => {
    setActiveRound(0);
    setDirection(1);
  }, [tournament]);

  useEffect(() => {
    if (!open) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !tournament) return null;

  const currentRound = rounds[activeRound] || null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,7,18,0.99))] shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-800 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-fuchsia-300/80">
                Detalle del torneo
              </p>

              <h3 className="mt-2 truncate text-xl font-black text-white sm:text-3xl">
                {tournament.shortName || tournament.name}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  {formatDate(tournament.date)}
                </span>
                <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  {tournament.playersCount || 0} jugadores
                </span>
                <span className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-semibold text-fuchsia-300">
                  {rounds.length} rondas
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/80 text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-2">
              {rounds.map((roundGroup, index) => {
                const isActive = index === activeRound;

                return (
                  <button
                    key={roundGroup.round}
                    type="button"
                    onClick={() => {
                      setDirection(index > activeRound ? 1 : -1);
                      setActiveRound(index);
                    }}
                    className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition sm:flex-none ${isActive
                        ? 'border border-cyan-400/30 bg-cyan-400/15 text-cyan-300 shadow-[0_8px_24px_rgba(34,211,238,0.10)]'
                        : 'border border-transparent bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <span className="text-xs tracking-[0.2em]">R</span>
                    <span>{roundGroup.round}</span>
                    {isActive ? <FiChevronRight size={15} /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-h-[68vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          {!currentRound ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-400">
              Este torneo no tiene rondas disponibles.
            </div>
          ) : (
            <div
              key={`round-${currentRound.round}`}
              className={`space-y-3 transition-all duration-300 ${direction > 0
                ? 'animate-[slideInRight_0.28s_ease]'
                : 'animate-[slideInLeft_0.28s_ease]'
                }`}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-10 rounded-full bg-cyan-400" />
                  <h4 className="text-lg font-bold text-white sm:text-xl">
                    Emparejamientos · Ronda {currentRound.round}
                  </h4>
                </div>

                <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                  {currentRound.pairings.length} partidas
                </span>
              </div>

              {currentRound.pairings.map((pairing, index) => (
                <RoundMatchCard
                  key={`${currentRound.round}-${pairing.table || index}-${pairing.player1}-${pairing.player2}`}
                  pairing={pairing}
                  standingsMap={standingsMap}
                />
              ))}
            </div>
          )}
        </div>

        <style>{`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

function TournamentCard({ tournament, onOpenDetail }) {
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
              <p className="mt-2 text-2xl font-black">
                {groupPairingsByRound(tournament.pairings || []).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-1 w-10 rounded-full bg-cyan-400" />
          <h4 className="text-lg font-bold text-white">Posiciones del torneo</h4>
        </div>

        <TournamentStandings standings={tournament.standings || []} />

        <div className="mt-5">
          <button
            type="button"
            onClick={() => onOpenDetail(tournament)}
            className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2.5 text-sm font-semibold text-fuchsia-300 transition hover:border-fuchsia-400/40 hover:bg-fuchsia-400/15 hover:text-white"
          >
            Detalle
            <FiChevronRight size={16} />
          </button>
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
  const [detailTournament, setDetailTournament] = useState(null);

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
    return [...tournaments].sort((a, b) => new Date(b?.date) - new Date(a?.date));
  }, [overview]);

  return (
    <>
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
                  Posiciones finales del torneo y detalle por rondas.
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
                      onOpenDetail={setDetailTournament}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </section>

      <TournamentDetailModal
        open={Boolean(detailTournament)}
        tournament={detailTournament}
        onClose={() => setDetailTournament(null)}
      />
    </>
  );
}