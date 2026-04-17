import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isAuthenticated, loading } = useAuth();

    const [form, setForm] = useState({
        identifier: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!loading && isAuthenticated) {
        return <Navigate to="/ranking" replace />;
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
        setSubmitting(true);

        try {
            await login(form);
            navigate('/ranking', { replace: true });
        } catch (err) {
            setError(err.message || 'No se pudo iniciar sesión');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
            <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
                <p className="mt-2 text-sm text-slate-400">
                    Entrá con tu usuario o email.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-slate-300">
                            Usuario o email
                        </label>
                        <input
                            type="text"
                            name="identifier"
                            value={form.identifier}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                            placeholder="username o email"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-300">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                            placeholder="******"
                        />
                    </div>

                    {error ? (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {submitting ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="mt-4 text-sm text-slate-400">
                    ¿No tenés cuenta?{' '}
                    <Link to="/register" className="font-medium text-cyan-300 hover:text-cyan-200">
                        Registrate
                    </Link>
                </p>
            </div>
        </div>
    );
}