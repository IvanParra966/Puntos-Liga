import { Link } from 'react-router-dom';

function PlayerNameLink({ player }) {
  return (
    <Link
      to={`/jugador/${player.playerId}`}
      rel="noreferrer"
      className="font-semibold text-white transition hover:text-cyan-300"
      title={`Abrir ficha de ${player.name}`}
    >
      {player.name}
    </Link>
  );
}

export default function LeagueTable({ leaderboard }) {
  if (!leaderboard.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400 sm:p-10">
        No hay jugadores cargados todavía. Probá sincronizar la liga.
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/30">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-950/90 text-slate-300">
                <tr>
                  <th className="w-[90px] px-4 py-4 text-left">Rank</th>
                  <th className="w-[32%] px-4 py-4 text-left">Jugador</th>
                  <th className="whitespace-nowrap px-4 py-4 text-left">Torneos jugados</th>
                  <th className="w-[28%] px-4 py-4 text-left">Último deck jugado</th>
                  <th className="whitespace-nowrap px-4 py-4 text-left">Puntos</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((player) => (
                  <tr
                    key={player.playerId}
                    className="border-t border-slate-800 text-slate-200 first:border-t-0"
                  >
                    <td className="px-4 py-4">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/15 text-sm font-semibold text-cyan-300">
                        {player.rank}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="min-w-0">
                        <PlayerNameLink player={player} />
                        <p className="mt-1 text-xs text-slate-500">
                          {player.limitlessPlayerId}
                        </p>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {player.tournamentsPlayed}
                    </td>

                    <td className="px-4 py-4">
                      <p
                        className="truncate text-slate-200"
                        title={player.lastDeckName || '-'}
                      >
                        {player.lastDeckName || '-'}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex rounded-full bg-cyan-400/15 px-3 py-1 font-semibold text-cyan-300">
                        {player.totalPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/30">
          <table className="w-full table-fixed text-xs">
            <thead className="bg-slate-950/90 text-slate-300">
              <tr>
                <th className="w-[70px] px-3 py-3 text-left">Rank</th>
                <th className="px-3 py-3 text-left">Jugador</th>
                <th className="w-[92px] px-3 py-3 text-left">Puntos</th>
              </tr>
            </thead>

            <tbody>
              {leaderboard.map((player) => (
                <tr
                  key={player.playerId}
                  className="border-t border-slate-800 text-slate-200 first:border-t-0"
                >
                  <td className="px-3 py-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/15 text-xs font-semibold text-cyan-300">
                      {player.rank}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <div className="min-w-0">
                      <PlayerNameLink player={player} />
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full bg-cyan-400/15 px-2.5 py-1 text-sm font-semibold text-cyan-300">
                      {player.totalPoints}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}