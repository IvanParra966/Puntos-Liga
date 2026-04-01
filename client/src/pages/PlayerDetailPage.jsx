import { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiList } from 'react-icons/fi';
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
  const bestPlacing = Math.min(...validHistory.map((item) =>
    Number(item.placing)));
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
function StatCard({ label, value, subtitle, wide = false }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/60 p-5
shadow-[0_10px_30px_rgba(0,0,0,0.18)] ${wide ? 'sm:col-span-2' : ''
        }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]
text-fuchsia-400">
        {label}
      </p>
      <p className="mt-4 break-words text-2xl font-black text-white
sm:text-3xl">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</
      p> : null}
    </div>
  );
}
function SummaryCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
      <div className="mb-4 h-1 w-12 rounded-full bg-cyan-400/80" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]
text-slate-400">
        {label}
      </p>
      <p className="mt-3 break-words text-2xl font-bold text-white">{value}</
      p>
      {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</
      p> : null}
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
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs fontsemibold ${className}`}>
      {result}
    </span>
  );
}
function PlaceholderModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bgslate-950/80 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bgslate-950 p-6">
        <h3 className="text-xl font-bold text-white">Listado del deck</h3>
        <p className="mt-3 text-sm text-slate-400">
          Estamos trabajando en esta sección.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex rounded-full border border-cyan-400/20
bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
export default function PlayerDetailPage() {
  const { playerId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listadoOpen, setListadoOpen] = useState(false);
  useEffect(() => {
    const loadPlayer = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await apiGet(`/api/league/player/${playerId}?
season=active`);
        setDetail(data);
      } catch (err) {
        setError(err.message || 'Ocurrió un error al cargar el jugador.');
      } finally {
        setLoading(false);
      }
    };
    loadPlayer();
  }, [playerId]);
  const current = detail?.currentSeason || null;
  const historical = detail?.historical || null;
  const matches = detail?.matches || [];
  const currentHistory = useMemo(() => current?.history || [], [current]);
  const historicalHistory = useMemo(() => historical?.history || [],
    [historical]);
  const currentTotals = useMemo(() => getRecordTotals(currentHistory),
    [currentHistory]);
  const historicalTotals = useMemo(() => getRecordTotals(historicalHistory),
    [historicalHistory]);
  const currentWinRate = useMemo(() => getWinRate(currentTotals),
    [currentTotals]);
  const historicalWinRate = useMemo(() => getWinRate(historicalTotals),
    [historicalTotals]);
  const currentBest = useMemo(() => getBestFinishInfo(currentHistory),
    [currentHistory]);
  const historicalBest = useMemo(() => getBestFinishInfo(historicalHistory),
    [historicalHistory]);
  const currentMostPlayedDeck = useMemo(
    () => getMostPlayedDeck(currentHistory, current?.lastDeckName),
    [currentHistory, current]
  );
  const historicalMostPlayedDeck = useMemo(
    () => getMostPlayedDeck(historicalHistory, historical?.lastDeckName),
    [historicalHistory, historical]
  );
  if (loading) {
    return (
      <section>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40
p-6 text-slate-300">
          Cargando jugador...
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section>
        <div
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text
red-200">
          {error}
        </div>
      </section>
    );
  }
  if (!detail?.player) {
    return (
      <section>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40
p-6 text-slate-300">
          No se encontró el jugador.
        </div>
      </section>
    );
  }
  return (
    <>
      <section className="space-y-8">
        <div className="overflow-hidden rounded-[28px] border borderslate-800 bg-[radialgradient(circle_at_top_left,_rgba(34,211,238,0.10),_transparent_32%),radialgradient(circle_at_top_right,_rgba(168,85,247,0.10),_transparent_28%),lineargradient(180deg,rgba(2,6,23,0.98),rgba(3,7,18,0.98))] p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/ranking"
              className="inline-flex items-center gap-2 rounded-full border
border-slate-700 bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-200
transition hover:border-cyan-400/50 hover:text-white"
            >
              <FiArrowLeft size={16} />
              Volver al ranking
            </Link>
            <div className="hidden rounded-full border border-slate-700 bgslate-900/70 px-4 py-2 text-sm font-medium text-slate-300 sm:inline-flex">
              {detail.activeSeason?.name || 'Temporada activa'}
            </div>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-
[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-
[0.22em] text-cyan-300/80">
                Perfil del jugador
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight textwhite sm:text-5xl lg:text-6xl">
                {detail.player.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400
sm:text-base">
                Resumen general del jugador en la liga, con sus métricas
                principales,
                desempeño histórico y mazo más utilizado.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-cyan-400/20 bgcyan-400/10 px-4 py-3 text-cyan-300">
                  <p className="text-[11px] font-semibold uppercase tracking-
[0.18em] opacity-80">
                    Puesto actual
                  </p>
                  <p className="mt-2 text-2xl font-black">#{current?.rank ||
                    '-'}</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bgemerald-400/10 px-4 py-3 text-emerald-300">
                  <p className="text-[11px] font-semibold uppercase tracking-
[0.18em] opacity-80">
                    Torneos jugados
                  </p>
                  <p className="mt-2 text-2xl fontblack">{current?.tournamentsPlayed || 0}</p>
                </div>
                <div className="rounded-2xl border border-amber-400/20 bgamber-400/10 px-4 py-3 text-amber-300">
                  <p className="text-[11px] font-semibold uppercase tracking-
[0.18em] opacity-80">
                    Torneos ganados
                  </p>
                  <p className="mt-2 text-2xl fontblack">{current?.firstPlaces || 0}</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-800 bgslate-950/50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-
[0.18em] text-slate-400">
                  Dato destacado de la temporada
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  Mazo más jugado: <span className="textcyan-300">{currentMostPlayedDeck}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border borderslate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                    Mejor posición: {currentBest.placing ?
                      formatPlacement(currentBest.placing) : '-'}
                  </span>
                  <span className="inline-flex rounded-full border borderslate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                    Ratio: {currentWinRate}
                  </span>
                  <span className="inline-flex rounded-full border borderslate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                    Record: {currentTotals.wins}-{currentTotals.losses}-
                    {currentTotals.ties}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setListadoOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border borderfuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-sm font-semibold textfuchsia-300 transition hover:border-fuchsia-400/40 hover:text-white"
                >
                  <FiList size={16} />
                  Listado
                </button>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-
[0.22em] text-fuchsia-400/90">
                Liga actual
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <StatCard label="Ranking" value={`#${current?.rank || '-'}
`} />
                <StatCard
                  label="Mejor posición"
                  value={currentBest.placing ?
                    formatPlacement(currentBest.placing) : '-'}
                  subtitle={currentBest.date ? `Alcanzada el $
{formatDate(currentBest.date)}` : ''}
                />
                <StatCard
                  label="Ratio de victorias"
                  value={currentWinRate}
                  subtitle={`${currentTotals.wins} victorias · $
{currentTotals.losses} derrotas · ${currentTotals.ties} empates`}
                  wide
                />
                <StatCard label="Mazo más jugado"
                  value={currentMostPlayedDeck} wide />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-800 bg-[radialgradient(circle_at_top,_rgba(34,211,238,0.08),_transparent_24%),lineargradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,0.98))] p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-
[0.22em] text-cyan-300/75">
              Resumen histórico
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Todas las temporadas
            </h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SummaryCard label="Torneos jugados"
              value={historical?.tournamentsPlayed || 0} />
            <SummaryCard label="Torneos ganados"
              value={historical?.firstPlaces || 0} />
            <SummaryCard
              label="Mejor posición"
              value={historicalBest.placing ?
                formatPlacement(historicalBest.placing) : '-'}
              subtitle={historicalBest.date ? `Alcanzada el $
{formatDate(historicalBest.date)}` : ''}
            />
            <SummaryCard
              label="Victorias / derrotas / empates"
              value={`${historicalTotals.wins} / $
{historicalTotals.losses} / ${historicalTotals.ties}`}
              subtitle={`Win rate: ${historicalWinRate}`}
            />
            <SummaryCard label="Mazo más jugado"
              value={historicalMostPlayedDeck} />
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-800 bgslate-950/30 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end
sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Historial de
                torneos</h2>
              <p className="mt-1 text-sm text-slate-400">
                Rivales, rondas y resultado de cada torneo jugado.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {!matches.length ? (
              <div className="rounded-xl border border-slate-800 bgslate-950/30 p-6 text-slate-400">
                Este jugador todavía no tiene historial de matches.
              </div>
            ) : (
              matches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-2xl border border-slate-800 bgslate-950/40 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:itemscenter lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] textslate-500">
                        {formatDate(match.tournamentDate)} ·
                        {match.shortName}
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">
                        Rival: {match.opponentLimitlessId || 'BYE / Sin rival'}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Ronda {match.round || '-'} · Fase {match.phase ||
                          '-'}
                        {match.tableNumber ? ` · Mesa ${match.tableNumber}
` : ''}
                        {match.matchLabel ? ` · ${match.matchLabel}` : ''}
                      </p>
                    </div>
                    <ResultBadge result={match.result} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <PlaceholderModal open={listadoOpen} onClose={() =>
        setListadoOpen(false)} />
    </>
  );
}