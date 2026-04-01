import { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiList, FiX } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../lib/api';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR');
};

const formatPlacement = (placing) => {
  if (!placing) return '-';
  return `${placing}°`;
};

const formatSectionLabel = (sectionKey) => {
  const key = String(sectionKey || '').toLowerCase();

  if (key === 'digimon') return 'Digimon';
  if (key === 'digitama' || key === 'eggs') return 'Digitama';
  if (key === 'tamers') return 'Tamers';
  if (key === 'option' || key === 'options') return 'Options';

  return key.charAt(0).toUpperCase() + key.slice(1);
};

const buildDigimonCardCode = (set, number) => {
  const safeSet = String(set || '').trim().toUpperCase();
  const safeNumber = String(number || '').trim().replace(/\s+/g, '').padStart(3, '0');

  if (!safeSet || !safeNumber) return '';
  return `${safeSet}-${safeNumber}`;
};

const buildDigimonImageUrl = (cardCode) => {
  return `https://images.digimoncard.io/images/cards/${cardCode}.webp`;
};

const getDeckSections = (decklist) => {
  if (!decklist || typeof decklist !== 'object') return [];

  const preferredOrder = ['digitama', 'eggs', 'digimon', 'tamers', 'option', 'options'];

  return Object.entries(decklist)
    .filter(([, cards]) => Array.isArray(cards) && cards.length > 0)
    .sort(([a], [b]) => {
      const indexA = preferredOrder.indexOf(String(a).toLowerCase());
      const indexB = preferredOrder.indexOf(String(b).toLowerCase());

      if (indexA === -1 && indexB === -1) {
        return String(a).localeCompare(String(b));
      }

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    })
    .map(([sectionKey, cards]) => ({
      key: sectionKey,
      label: formatSectionLabel(sectionKey),
      cards: cards.map((card, index) => {
        const cardCode = buildDigimonCardCode(card?.set, card?.number);

        return {
          id: `${sectionKey}-${cardCode || card?.name || index}`,
          quantity: Number(card?.count || 0),
          name: card?.name || '-',
          set: String(card?.set || '').trim().toUpperCase(),
          number: String(card?.number || '').trim().replace(/\s+/g, '').padStart(3, '0'),
          cardCode,
          imageUrl: cardCode ? buildDigimonImageUrl(cardCode) : '',
        };
      }),
    }));
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

const getDeckShortLabel = (deckName) => {
  if (!deckName) return 'DK';

  return String(deckName)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

const getTournamentGroups = (matches = [], history = [], playerName = null, limitlessPlayerId = null) => {
  const historyMap = new Map();

  history.forEach((item) => {
    historyMap.set(String(item.tournamentId), item);
  });

  const groupedMap = new Map();

  matches.forEach((match) => {
    const key = String(match.tournamentId || `${match.shortName}-${match.tournamentDate}`);

    if (!groupedMap.has(key)) {
      const tournamentHistory = historyMap.get(String(match.tournamentId)) || null;

      groupedMap.set(key, {
        tournamentId: match.tournamentId || key,
        tournamentName: match.tournamentName || match.shortName || '-',
        shortName: match.shortName || '-',
        tournamentDate: match.tournamentDate || null,
        placing: tournamentHistory?.placing || null,
        deckName: tournamentHistory?.deckName || null,
        pointsAwarded: tournamentHistory?.pointsAwarded || 0,
        playersCount: tournamentHistory?.playersCount || 0,
        playerName:
          match.playerName ||
          tournamentHistory?.playerName ||
          playerName ||
          null,
        limitlessPlayerId:
          match.limitlessPlayerId ||
          tournamentHistory?.limitlessPlayerId ||
          limitlessPlayerId ||
          null,
        rounds: [],
      });
    }

    groupedMap.get(key).rounds.push(match);
  });

  return [...groupedMap.values()]
    .map((group) => ({
      ...group,
      rounds: [...group.rounds].sort((a, b) => Number(b.round || 0) - Number(a.round || 0)),
    }))
    .sort((a, b) => new Date(b.tournamentDate) - new Date(a.tournamentDate));
};

const buildDeckPayload = ({ playerRow }) => {
  const sections = getDeckSections(playerRow?.decklist);

  return {
    playerName: playerRow?.name || '-',
    playerKey: playerRow?.player || null,
    country: playerRow?.country || null,
    deckName: playerRow?.deck?.name || playerRow?.deck?.archetype || 'Deck',
    sections,
    rawDecklist: playerRow?.decklist || null,
  };
};

function StatCard({ label, value, subtitle, wide = false }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] sm:p-5 ${
        wide ? 'sm:col-span-2' : ''
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-400">
        {label}
      </p>
      <p className="mt-3 break-words text-2xl font-black text-white sm:mt-4 sm:text-3xl">
        {value}
      </p>
      {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
    </div>
  );
}

function SummaryCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5">
      <div className="mb-4 h-1 w-12 rounded-full bg-cyan-400/80" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 break-words text-2xl font-bold text-white">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
    </div>
  );
}

function ResultBadge({ result }) {
  const className =
    result === 'VICTORIA'
      ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20'
      : result === 'DERROTA'
      ? 'bg-red-400/15 text-red-300 border-red-400/20'
      : result === 'EMPATE'
      ? 'bg-amber-400/15 text-amber-300 border-amber-400/20'
      : 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {result}
    </span>
  );
}

function DeckModal({ open, onClose, loading, error, data }) {
  if (!open) return null;

  const totalCards = (data?.sections || []).reduce((acc, section) => {
    return (
      acc +
      section.cards.reduce((sectionAcc, card) => sectionAcc + Number(card.quantity || 0), 0)
    );
  }, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[94vh] w-full max-w-6xl overflow-auto rounded-[24px] border border-slate-800 bg-slate-950 p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-white sm:text-2xl">Deck jugado</h3>

            {data ? (
              <>
                <p className="mt-1 truncate text-sm text-slate-400">{data.playerName}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-semibold text-fuchsia-300">
                    {data.deckName || 'Deck'}
                  </span>

                  {data.country ? (
                    <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                      {data.country}
                    </span>
                  ) : null}

                  {totalCards ? (
                    <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                      {totalCards} cartas
                    </span>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
          >
            <FiX size={18} />
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-slate-300">
            Consultando deck en Limitless...
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        {!loading && !error && data ? (
          data.sections?.length ? (
            <div className="mt-6 space-y-7">
              {data.sections.map((section) => (
                <div key={section.key}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-1 w-10 rounded-full bg-cyan-400" />
                    <h4 className="text-lg font-bold text-white">{section.label}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {section.cards.map((card) => (
                      <div
                        key={card.id}
                        className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40"
                      >
                        <div className="relative aspect-[0.72] bg-slate-950/80 p-2">
                          {card.imageUrl ? (
                            <img
                              src={card.imageUrl}
                              alt={card.name}
                              loading="lazy"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-500">
                              Sin imagen
                            </div>
                          )}

                          <span className="absolute left-2 top-2 inline-flex rounded-full bg-slate-950/95 px-2.5 py-1 text-xs font-black text-cyan-300 shadow">
                            x{card.quantity}
                          </span>
                        </div>

                        <div className="p-3">
                          <p className="line-clamp-2 text-sm font-bold text-white sm:text-base">
                            {card.name}
                          </p>

                          <p className="mt-2 text-xs font-semibold text-cyan-300 sm:text-sm">
                            {card.cardCode || '-'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-slate-300">
              Se encontró el jugador, pero no se pudo interpretar la decklist de Digimon para mostrar imágenes.
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

function TournamentHistoryCard({ group, onOpenDeck }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
      <div className="flex flex-col lg:flex-row">
        <div className="border-b border-slate-800 p-4 lg:w-[260px] lg:border-b-0 lg:border-r">
          <div className="flex items-start gap-3">
            <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-[linear-gradient(180deg,rgba(30,41,59,0.9),rgba(2,6,23,0.95))] text-sm font-black text-cyan-300 sm:h-20 sm:w-16">
              {getDeckShortLabel(group.deckName)}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-extrabold leading-tight text-white sm:text-xl">
                {group.shortName}
              </h3>

              <p className="mt-1 text-sm font-medium text-fuchsia-400">
                {formatDate(group.tournamentDate)}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {group.placing ? (
                  <span className="inline-flex rounded-full bg-fuchsia-500 px-3 py-1 text-[11px] font-bold text-white">
                    #{group.placing}
                  </span>
                ) : null}

                {group.deckName ? (
                  <span className="truncate text-sm font-semibold text-fuchsia-300">
                    {group.deckName}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-xl font-black text-cyan-300">
                {group.pointsAwarded || 0} PTS
              </p>

              <button
                type="button"
                onClick={() =>
                  onOpenDeck({
                    tournamentId: group.tournamentId,
                    playerName: group.playerName,
                    playerKey: group.limitlessPlayerId || group.playerName,
                  })
                }
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-sm font-semibold text-fuchsia-300 transition hover:border-fuchsia-400/40 hover:text-white"
              >
                <FiList size={15} />
                Deck
              </button>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 p-3 sm:p-4">
          <div className="hidden grid-cols-[72px_minmax(0,1fr)_130px_96px] gap-4 border-b border-slate-800 px-3 pb-3 text-sm font-semibold text-white md:grid">
            <p>Ronda</p>
            <p>Oponente</p>
            <p>Resultado</p>
            <p>Deck</p>
          </div>

          <div className="space-y-3 md:mt-2 md:space-y-0">
            {group.rounds.map((round) => (
              <div
                key={round.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 md:grid md:grid-cols-[72px_minmax(0,1fr)_130px_96px] md:items-center md:gap-4 md:rounded-none md:border-0 md:border-b md:border-slate-800 md:bg-transparent md:px-3 md:py-3"
              >
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 md:hidden">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Ronda
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">
                      {round.round || '-'}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Oponente
                    </p>

                    {round.opponentPlayerId ? (
                      <Link
                        to={`/jugador/${round.opponentPlayerId}`}
                        className="mt-1 block truncate text-base font-bold text-white transition hover:text-cyan-300"
                      >
                        {round.opponentName}
                      </Link>
                    ) : (
                      <p className="mt-1 truncate text-base font-bold text-white">
                        {round.opponentName || 'BYE / Sin rival'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden md:block">
                  <p className="text-xl font-black text-white md:text-base">
                    {round.round || '-'}
                  </p>
                </div>

                <div className="hidden min-w-0 md:block">
                  {round.opponentPlayerId ? (
                    <Link
                      to={`/jugador/${round.opponentPlayerId}`}
                      className="block truncate text-sm font-bold text-white transition hover:text-cyan-300"
                      title={round.opponentName}
                    >
                      {round.opponentName}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-bold text-white">
                      {round.opponentName || 'BYE / Sin rival'}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 md:mt-0 md:contents">
                  <div className="md:order-4">
                    {round.opponentName ? (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenDeck({
                            tournamentId: group.tournamentId,
                            playerName: round.opponentName,
                            playerKey:
                              round.opponentLimitlessPlayerId ||
                              round.limitlessOpponentId ||
                              round.opponentLimitlessId ||
                              round.opponentName,
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:text-white"
                      >
                        <FiList size={13} />
                        Deck
                      </button>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </div>

                  <div className="md:order-3 md:justify-self-start">
                    <ResultBadge result={round.result} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerDetailPage() {
  const { playerId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deckModalOpen, setDeckModalOpen] = useState(false);
  const [deckModalLoading, setDeckModalLoading] = useState(false);
  const [deckModalError, setDeckModalError] = useState('');
  const [deckModalData, setDeckModalData] = useState(null);

  const closeDeckModal = () => {
    setDeckModalOpen(false);
    setDeckModalLoading(false);
    setDeckModalError('');
    setDeckModalData(null);
  };

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiGet(`/api/league/player/${playerId}?season=active`);
        setDetail(data);
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar el jugador.');
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [playerId]);

  useEffect(() => {
    if (!deckModalOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDeckModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [deckModalOpen]);

  const current = detail?.currentSeason || null;
  const historical = detail?.historical || null;
  const matches = detail?.matches || [];

  const currentHistory = useMemo(() => current?.history || [], [current]);
  const historicalHistory = useMemo(() => historical?.history || [], [historical]);

  const currentTotals = useMemo(() => getRecordTotals(currentHistory), [currentHistory]);
  const historicalTotals = useMemo(() => getRecordTotals(historicalHistory), [historicalHistory]);

  const currentWinRate = useMemo(() => getWinRate(currentTotals), [currentTotals]);
  const historicalWinRate = useMemo(() => getWinRate(historicalTotals), [historicalTotals]);

  const currentBest = useMemo(() => getBestFinishInfo(currentHistory), [currentHistory]);
  const historicalBest = useMemo(() => getBestFinishInfo(historicalHistory), [historicalHistory]);

  const currentMostPlayedDeck = useMemo(
    () => getMostPlayedDeck(currentHistory, current?.lastDeckName),
    [currentHistory, current]
  );

  const historicalMostPlayedDeck = useMemo(
    () => getMostPlayedDeck(historicalHistory, historical?.lastDeckName),
    [historicalHistory, historical]
  );

  const tournamentGroups = useMemo(() => {
    return getTournamentGroups(
      matches,
      historicalHistory,
      detail?.player?.name || null,
      detail?.player?.limitlessPlayerId || null
    );
  }, [matches, historicalHistory, detail]);

  const handleOpenDeck = async ({ tournamentId, playerName, playerKey }) => {
    try {
      setDeckModalOpen(true);
      setDeckModalLoading(true);
      setDeckModalError('');
      setDeckModalData(null);

      if (!tournamentId) {
        throw new Error('El torneo no tiene tournamentId.');
      }

      if (!playerKey && !playerName) {
        throw new Error('No hay datos suficientes para identificar al jugador.');
      }

      const params = new URLSearchParams();

      if (playerKey) params.set('player', playerKey);
      if (playerName) params.set('name', playerName);

      const playerRow = await apiGet(
        `/api/league/limitless/tournaments/${tournamentId}/standings?${params.toString()}`
      );

      if (!playerRow) {
        throw new Error('No se encontró el jugador en Limitless.');
      }

      if (!playerRow.decklist) {
        throw new Error('Este jugador no tiene decklist pública en ese torneo.');
      }

      const payload = buildDeckPayload({ playerRow });

      if (!payload.sections.length) {
        throw new Error('La decklist existe, pero no se pudo interpretar para mostrar las cartas.');
      }

      setDeckModalData(payload);
    } catch (err) {
      setDeckModalError(err.message || 'No se pudo obtener el deck del jugador.');
    } finally {
      setDeckModalLoading(false);
    }
  };

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

  if (!detail?.player) {
    return (
      <section>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-slate-300">
          No se encontró el jugador.
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-6 sm:space-y-8">
        <div className="overflow-hidden rounded-[24px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.10),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.10),_transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,7,18,0.98))] p-4 sm:rounded-[28px] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/ranking"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
            >
              <FiArrowLeft size={16} />
              Volver al ranking
            </Link>

            <div className="hidden rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-300 sm:inline-flex">
              {detail.activeSeason?.name || 'Temporada activa'}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                Perfil del jugador
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {detail.player.name}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Resumen general del jugador en la liga, con sus métricas principales,
                desempeño histórico y mazo más utilizado.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-cyan-300">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
                    Puesto actual
                  </p>
                  <p className="mt-2 text-2xl font-black">#{current?.rank || '-'}</p>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-300">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
                    Torneos jugados
                  </p>
                  <p className="mt-2 text-2xl font-black">{current?.tournamentsPlayed || 0}</p>
                </div>

                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-amber-300">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
                    Torneos ganados
                  </p>
                  <p className="mt-2 text-2xl font-black">{current?.firstPlaces || 0}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:mt-6 sm:p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Dato destacado de la temporada
                </p>

                <p className="mt-3 text-base font-semibold text-white sm:text-lg">
                  Mazo más jugado: <span className="text-cyan-300">{currentMostPlayedDeck}</span>
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                    Mejor posición: {currentBest.placing ? formatPlacement(currentBest.placing) : '-'}
                  </span>
                  <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                    Ratio: {currentWinRate}
                  </span>
                  <span className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                    Record: {currentTotals.wins}-{currentTotals.losses}-{currentTotals.ties}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-400/90">
                Liga actual
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <StatCard label="Ranking" value={`#${current?.rank || '-'}`} />
                <StatCard
                  label="Mejor posición"
                  value={currentBest.placing ? formatPlacement(currentBest.placing) : '-'}
                  subtitle={currentBest.date ? `Alcanzada el ${formatDate(currentBest.date)}` : ''}
                />
                <StatCard
                  label="Ratio de victorias"
                  value={currentWinRate}
                  subtitle={`${currentTotals.wins} victorias · ${currentTotals.losses} derrotas · ${currentTotals.ties} empates`}
                  wide
                />
                <StatCard label="Mazo más jugado" value={currentMostPlayedDeck} wide />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,0.98))] p-4 sm:rounded-[28px] sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/75">
              Resumen histórico
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Todas las temporadas
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SummaryCard label="Torneos jugados" value={historical?.tournamentsPlayed || 0} />
            <SummaryCard label="Torneos ganados" value={historical?.firstPlaces || 0} />
            <SummaryCard
              label="Mejor posición"
              value={historicalBest.placing ? formatPlacement(historicalBest.placing) : '-'}
              subtitle={historicalBest.date ? `Alcanzada el ${formatDate(historicalBest.date)}` : ''}
            />
            <SummaryCard
              label="Victorias / derrotas / empates"
              value={`${historicalTotals.wins} / ${historicalTotals.losses} / ${historicalTotals.ties}`}
              subtitle={`Win rate: ${historicalWinRate}`}
            />
            <SummaryCard label="Mazo más jugado" value={historicalMostPlayedDeck} />
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.08),_transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,0.98))] p-4 sm:rounded-[28px] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Historial de torneos</h2>
              <p className="mt-1 text-sm text-slate-400">
                Rivales, rondas y resultado de cada torneo jugado.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-6">
            {!tournamentGroups.length ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-slate-400">
                Este jugador todavía no tiene historial de torneos.
              </div>
            ) : (
              tournamentGroups.map((group) => (
                <TournamentHistoryCard
                  key={group.tournamentId}
                  group={group}
                  onOpenDeck={handleOpenDeck}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <DeckModal
        open={deckModalOpen}
        loading={deckModalLoading}
        error={deckModalError}
        data={deckModalData}
        onClose={closeDeckModal}
      />
    </>
  );
}