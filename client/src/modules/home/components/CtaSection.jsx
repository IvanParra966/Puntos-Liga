import { Link } from 'react-router-dom';

export default function CtaSection() {
  return (
    <section className="mt-12 rounded-3xl border border-cyan-400/10 bg-cyan-400/5 px-6 py-10 text-center">
      <h2 className="text-2xl font-bold text-white">Empezá desde ahora</h2>
      <p className="mx-auto mt-3 max-w-2xl text-slate-300">
        La plataforma recién arranca, pero ya podés crear tu cuenta y dejar lista la base
        para todo lo que viene.
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/register"
          className="w-full rounded-xl bg-cyan-400 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
        >
          Registrarme
        </Link>

        <Link
          to="/login"
          className="w-full rounded-xl border border-slate-700 px-5 py-3 text-center text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 sm:w-auto"
        >
          Ya tengo cuenta
        </Link>
      </div>
    </section>
  );
}