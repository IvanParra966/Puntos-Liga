const futureItems = [
  'Organizaciones y solicitudes de organizador',
  'Creación y administración de torneos',
  'Inscripciones y check-in',
  'Carga de decklists',
  'Rondas, pairings y standings',
  'Puntos y ranking por temporada',
];

export default function FutureSection() {
  return (
    <section className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-white">Próximamente</h2>
        <p className="mt-2 text-slate-400">
          Estos son los módulos que se van a ir activando a medida que avance el sistema.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {futureItems.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm text-slate-200"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}