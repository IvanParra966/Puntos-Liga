import { Link } from 'react-router-dom';
function PlayerNameLink({ player }) {
  return (
    <Link
      to={`/jugador/${player.playerId}`}
      className="font-semibold text-white transition hover:text-cyan-300"
    >
      {player.name}
    </Link>
  );
}
export default function LeagueTable({ leaderboard, season }) {
  if (!leaderboard.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6
text-slate-300">
        No hay jugadores cargados todavía. Probá sincronizar la liga.
      </div>
    );
  }
  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-950/30 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Tabla de posiciones</
          h2>
          <p className="text-sm text-slate-400">{season?.name || 'Temporada activa'}</p>
        </div>
      </div>
      <div className="hidden overflow-hidden rounded-2xl border borderslate-800 lg:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-950 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Jugador</th>
              <th className="px-4 py-3 text-left">Torneos jugados</th>
              <th className="px-4 py-3 text-left">Último deck jugado</th>
              <th className="px-4 py-3 text-left">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((player) => (
              <tr key={player.playerId} className="border-t border-slate-800
text-slate-200">
                <td className="px-4 py-3 font-semibold textwhite">#{player.rank}</td>
                <td className="px-4 py-3">
                  <div>
                    <PlayerNameLink player={player} />
                    <p className="text-xs textslate-500">{player.limitlessPlayerId}</p>
                  </div>
                </td>
                <td className="px-4 py-3">{player.tournamentsPlayed}</td>
                <td className="px-4 py-3">{player.lastDeckName || '-'}</td>
                <td className="px-4 py-3 text-cyan-300 fontbold">{player.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 lg:hidden">
        {leaderboard.map((player) => (
          <div
            key={player.playerId}
            className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4" >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] textslate-500">
                  Rank #{player.rank}
                </p>
                <div className="mt-1">
                  <PlayerNameLink player={player} />
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Torneos: {player.tournamentsPlayed}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Deck: {player.lastDeckName || '-'}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-400/20 bgcyan-400/10 px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.18em] textcyan-300">Puntos</p>
                <p className="mt-1 text-xl font-black textcyan-300">{player.totalPoints}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}