import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiGlobe, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getCountries } from '../../countries/services/countriesService';

function InputIcon({ children }) {
  return (
    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
      {children}
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();

  const [form, setForm] = useState({
    username: '',
    name: '',
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
      form.name &&
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
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-xl items-center">
      <section className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white">Crear cuenta</h2>
          <p className="mt-2 text-sm text-slate-400">
            Completá tus datos para empezar dentro de VortexTCG.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
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
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Nombre completo
              </label>
              <div className="relative">
                <InputIcon>
                  <FiUser size={18} />
                </InputIcon>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                  placeholder="nombre completo"
                />
              </div>
            </div>
          </div>

          <div>
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
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                placeholder="email"
              />
            </div>
          </div>

          <div>
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
                disabled={countriesLoading}
                className="w-full appearance-none rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400 disabled:opacity-70"
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
              <p className="mt-2 text-sm text-amber-300">{countriesError}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
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
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-400"
                  placeholder="Repetí tu contraseña"
                />
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting || countriesLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span>{submitting ? 'Creando cuenta...' : 'Crear cuenta'}</span>
            {!submitting ? <FiChevronRight size={18} /> : null}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
            Ingresá acá
          </Link>
        </p>
      </section>
    </div>
  );
}