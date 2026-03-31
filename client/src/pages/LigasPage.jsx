const leagues = [
  {
    id: 1,
    title: 'Liga 1',
    status: 'Finalizada',
    description: 'Primera liga terminada. Acá después podés mostrar el ranking final y sus resultados.',
    season: '2026',
    winner: 'Pendiente de cargar',
  },
  {
    id: 2,
    title: 'Liga 2',
    status: 'Próximamente',
    description: 'Espacio reservado para los resultados de la segunda liga.',
    season: '2026',
    winner: '-',
  },
  {
    id: 3,
    title: 'Liga 3',
    status: 'Próximamente',
    description: 'Espacio reservado para los resultados de la tercera liga.',
    season: '2026',
    winner: '-',
  },
  {
    id: 4,
    title: 'Liga 4',
    status: 'Próximamente',
    description: 'Espacio reservado para los resultados de la cuarta liga.',
    season: '2026',
    winner: '-',
  },
];

const getStatusClass = (status) => {
  if (status === 'Finalizada') {
    return 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20';
  }

  return 'bg-slate-800 text-slate-300 border-slate-700';
};

export default function LigasPage() {
  return (
    <section>
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Ligas</h1>
        <p className="mt-2 text-sm text-slate-400">
          Acá vas a mostrar los resultados de las ligas anteriores y las próximas.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {leagues.map((league) => (
          <article
            key={league.id}
            className="rounded-xl border border-slate-800 bg-slate-950/30 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">{league.title}</h2>
                <p className="mt-1 text-sm text-slate-500">Temporada {league.season}</p>
              </div>

              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(league.status)}`}
              >
                {league.status}
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-400">{league.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Ganador</p>
                <p className="mt-2 text-base font-semibold text-white">{league.winner}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
                <p className="mt-2 text-base font-semibold text-white">{league.status}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}