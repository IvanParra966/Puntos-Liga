import { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const formatDate = (value) => {
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

function DetailTable({ history }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Fecha</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Torneo</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Jugadores</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Puesto</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Puntos</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium">Record</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={`${item.tournamentId}-${item.date}`} className="border-t border-slate-800 text-slate-200">
                <td className="whitespace-nowrap px-4 py-3">{formatDate(item.date)}</td>
                <td className="min-w-[220px] px-4 py-3">
                  <p className="break-words font-medium text-white">{item.shortName}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{item.playersCount}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPlacementTone(item.placing)}`}>
                    {formatPlacement(item.placing)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{item.pointsAwarded}</td>
                <td className="whitespace-nowrap px-4 py-3">{item.wins}-{item.losses}-{item.ties}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function LeagueTable({ leaderboard }) {
  const [openRows, setOpenRows] = useState({});

  const defaultOpen = useMemo(() => {
    if (!leaderboard.length) return null;
    return leaderboard[0].playerId;
  }, [leaderboard]);

  const toggleRow = (playerId) => {
    setOpenRows((current) => ({
      ...current,
      [playerId]: current[playerId] === undefined ? playerId !== defaultOpen : !current[playerId],
    }));
  };

  const isOpen = (playerId) => {
    if (openRows[playerId] === undefined) {
      return playerId === defaultOpen;
    }

    return openRows[playerId];
  };

  if (!leaderboard.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400 sm:p-10">
        No hay jugadores cargados todavía. Probá sincronizar la liga.
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/30">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-950/90 text-slate-300">
                <tr>
                  <th className="whitespace-nowrap px-4 py-4 text-left">#</th>
                  <th className="whitespace-nowrap px-4 py-4 text-left">Jugador</th>
                  <th className="whitespace-nowrap px-4 py-4 text-left">Torneos</th>
                  <th className="whitespace-nowrap px-4 py-4 text-left">Puntos</th>
                  <th className="whitespace-nowrap px-4 py-4 text-left">1° puestos</th>
                  <th className="whitespace-nowrap px-4 py-4 text-left">Promedio</th>
                  <th className="whitespace-nowrap px-4 py-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player) => {
                  const expanded = isOpen(player.playerId);

                  return (
                    <FragmentRow
                      key={player.playerId}
                      player={player}
                      expanded={expanded}
                      onToggle={() => toggleRow(player.playerId)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {leaderboard.map((player) => {
          const expanded = isOpen(player.playerId);

          return (
            <article key={player.playerId} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/35 shadow-soft">
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-base font-semibold text-cyan-300">
                    {player.rank}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-base font-semibold text-white sm:text-lg">{player.name}</h3>
                        <p className="mt-1 break-all text-sm text-slate-500">{player.limitlessPlayerId}</p>
                      </div>

                      <div className="inline-flex w-fit rounded-full bg-cyan-400/15 px-3 py-2 text-sm font-semibold text-cyan-300">
                        {player.totalPoints} pts
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniStat label="Torneos" value={player.tournamentsPlayed} />
                  <MiniStat label="1° puestos" value={player.firstPlaces} />
                  <MiniStat label="Promedio" value={player.averagePlacing || '-'} />
                  <MiniStat label="País" value={player.country || '-'} />
                </div>

                <button
                  type="button"
                  onClick={() => toggleRow(player.playerId)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
                >
                  {expanded ? <FiChevronUp /> : <FiChevronDown />}
                  {expanded ? 'Ocultar detalle' : 'Ver detalle'}
                </button>
              </div>

              {expanded ? (
                <div className="border-t border-slate-800 bg-slate-950/50 p-4">
                  <div className="space-y-3">
                    {player.history.map((item) => (
                      <div key={`${player.playerId}-${item.tournamentId}`} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-slate-500">{formatDate(item.date)}</p>
                            <p className="mt-1 break-words font-medium text-white">{item.shortName}</p>
                            <p className="mt-1 text-sm text-slate-500">{item.playersCount} jugadores · {item.wins}-{item.losses}-{item.ties}</p>
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
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </>
  );
}

function FragmentRow({ player, expanded, onToggle }) {
  return (
    <>
      <tr className="border-t border-slate-800 text-slate-200 first:border-t-0">
        <td className="whitespace-nowrap px-4 py-4 font-semibold text-cyan-300">{player.rank}</td>
        <td className="px-4 py-4">
          <div className="min-w-0">
            <p className="break-words font-semibold text-white">{player.name}</p>
            <p className="mt-1 text-xs text-slate-500">{player.limitlessPlayerId}</p>
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-4">{player.tournamentsPlayed}</td>
        <td className="whitespace-nowrap px-4 py-4">
          <span className="inline-flex rounded-full bg-cyan-400/15 px-3 py-1 font-semibold text-cyan-300">
            {player.totalPoints}
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-4">{player.firstPlaces}</td>
        <td className="whitespace-nowrap px-4 py-4">{player.averagePlacing || '-'}</td>
        <td className="px-4 py-4 text-right">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
          >
            {expanded ? <FiChevronUp /> : <FiChevronDown />}
            {expanded ? 'Ocultar' : 'Ver detalle'}
          </button>
        </td>
      </tr>

      {expanded ? (
        <tr className="border-t border-slate-800/80 bg-slate-950/35">
          <td colSpan={7} className="px-4 py-4">
            <DetailTable history={player.history} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
