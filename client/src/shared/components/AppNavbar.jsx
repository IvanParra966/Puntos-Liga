import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';
import logoLiga from '/logo.png';

export default function AppNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <NavLink to={isAuthenticated ? '/' : '/login'} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-cyan-400/10">
              <img src={logoLiga} alt="VortexTCG" className="h-full w-full object-contain" />
            </div>
            <p className="font-storm text-3xl text-[#5aff5e]">VortexTCG</p>
          </NavLink>

          <div className="hidden md:flex md:items-center md:gap-3">
            {isAuthenticated ? (
              <>
                <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
                  {user?.username}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-red-400/40 hover:text-white"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
                >
                  Ingresar
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Registrarse
                </NavLink>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-cyan-400/40 hover:text-white md:hidden"
            aria-label="Abrir menú"
          >
            <FiMenu size={20} />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 transition-opacity duration-300 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[290px] max-w-[85vw] border-l border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <p className="text-sm font-semibold text-white">Menú</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-200"
            aria-label="Cerrar menú"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                {user?.username}
              </div>
              <button
                type="button"
                onClick={logout}
                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-left text-sm font-medium text-slate-200"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <NavLink to="/login" className="block rounded-xl border border-slate-800 px-4 py-3 text-sm text-slate-300">
                Ingresar
              </NavLink>
              <NavLink to="/register" className="block rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">
                Registrarse
              </NavLink>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}