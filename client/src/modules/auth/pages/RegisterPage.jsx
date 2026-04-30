import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiGlobe, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getCountries } from '../../countries/services/countriesService';

function InputIcon({ children }) {
  return (
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
      {children}
    </span>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();

  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    country_id: '',
    password: '',
    confirmPassword: '',
  });

  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formReady = useMemo(() => {
    return (
      form.username &&
      form.first_name &&
      form.last_name &&
      form.email &&
      form.country_id &&
      form.password &&
      form.confirmPassword
    );
  }, [form]);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getCountries();
        setCountries(data.countries || []);
      } catch (err) {
        setCountriesError(err.message || 'No se pudieron cargar los países');
      } finally {
        setCountriesLoading(false);
      }
    };

    run();
  }, []);

  if (!loading && isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formReady) {
      setError('Completá todos los campos');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        ...form,
        country_id: Number(form.country_id),
      });

      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo registrar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-6xl items-center justify-center px-4 py-10">
      <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden h-full flex-col justify-between border-r border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_45%),linear-gradient(135deg,#050b16_0%,#0f172a_100%)] p-10 lg:flex">
          <div>
            <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              VortexTCG
            </span>

            <h1 className="mt-6 max-w-md text-4xl font-black leading-tight text-white">
              Armá tu cuenta y empezá a competir.
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
              Registrate para entrar al ecosistema de torneos, seguir tu perfil
              competitivo y administrar tus datos de jugador desde el primer día.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">Perfil prolijo desde el inicio</p>
              <p className="mt-1 text-sm text-slate-400">
                Tu nombre y apellido quedan separados correctamente para torneos,
                perfil y futuras inscripciones.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-white">Tu país y tu identidad</p>
              <p className="mt-1 text-sm text-slate-400">
                Mantené tu cuenta lista para rankings, torneos y vista pública.
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white">Crear cuenta</h2>
              <p className="mt-2 text-sm text-slate-400">
                Completá tus datos para empezar dentro de VortexTCG.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Usuario
                  </label>
                  <div className="relative">
                    <InputIcon>
                      <FiUser size={18} />
                    </InputIcon>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3.5 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                      placeholder="Tu usuario"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Nombre
                  </label>
                  <div className="relative">
                    <InputIcon>
                      <FiUser size={18} />
                    </InputIcon>
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3.5 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                      placeholder="Tu nombre"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Apellido
                  </label>
                  <div className="relative">
                    <InputIcon>
                      <FiUser size={18} />
                    </InputIcon>
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3.5 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <div className="relative">
                    <InputIcon>
                      <FiMail size={18} />
                    </InputIcon>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3.5 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    País
                  </label>
                  <div className="relative">
                    <InputIcon>
                      <FiGlobe size={18} />
                    </InputIcon>
                    <select
                      name="country_id"
                      value={form.country_id}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3.5 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                    >
                      <option value="">
                        {countriesLoading ? 'Cargando países...' : 'Seleccioná tu país'}
                      </option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {countriesError ? (
                    <p className="mt-2 text-sm text-rose-400">{countriesError}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Contraseña
                  </label>
                  <div className="relative">
                    <InputIcon>
                      <FiLock size={18} />
                    </InputIcon>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3.5 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <InputIcon>
                      <FiLock size={18} />
                    </InputIcon>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3.5 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                      placeholder="Repetí tu contraseña"
                    />
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!formReady || submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
              >
                {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
                {!submitting ? <FiChevronRight size={18} /> : null}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              ¿Ya tenés cuenta?{' '}
              <Link
                to="/login"
                className="font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Ingresá acá
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}