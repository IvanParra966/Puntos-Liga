import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 px-6 py-12 shadow-xl sm:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Plataforma en crecimiento
        </span>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Organizá y jugá torneos de Digimon en un solo lugar
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Un sistema pensado para jugadores, organizadores y administración:
          registro, torneos, standings, decklists y puntos de temporada.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="w-full rounded-xl bg-cyan-400 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
          >
            Crear cuenta
          </Link>

          <Link
            to="/login"
            className="w-full rounded-xl border border-slate-700 px-5 py-3 text-center text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 sm:w-auto"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}