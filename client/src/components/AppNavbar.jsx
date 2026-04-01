import { useEffect, useState } from 'react';
import { FiAward, FiList, FiLayers, FiMenu, FiX } from 'react-icons/fi';
import { NavLink, useLocation } from 'react-router-dom';
import logoLiga from '/logo.png'; // cambiá la ruta si hace falta

const navItems = [
  {
    to: '/ranking',
    label: 'Ranking',
    icon: FiAward,
  },
  {
    to: '/puntos',
    label: 'Puntos',
    icon: FiList,
  },
  {
    to: '/ligas',
    label: 'Ligas',
    icon: FiLayers,
  },
];

const getDesktopLinkClass = ({ isActive }) =>
  [
    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-cyan-400/15 text-cyan-300'
      : 'text-slate-300 hover:bg-slate-900 hover:text-white',
  ].join(' ');

const getMobileLinkClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
    isActive
      ? 'bg-cyan-400/15 text-cyan-300'
      : 'text-slate-300 hover:bg-slate-900 hover:text-white',
  ].join(' ');

export default function AppNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

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
          <NavLink to="/ranking" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-cyan-400/10">
              <img
                src={logoLiga}
                alt="Liga Catamarca"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="font-storm text-3xl text-[#5aff5e]">VortexTCG</p>
            </div>
          </NavLink>

          <nav className="hidden md:flex md:items-center md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.to} to={item.to} className={getDesktopLinkClass}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

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
        className={`fixed inset-0 z-40 bg-slate-950/60 transition-opacity duration-300 md:hidden ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[290px] max-w-[85vw] border-l border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-300 md:hidden ${open ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-cyan-400/10">
              <img
                src={logoLiga}
                alt="Liga Catamarca"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Menú</p>
              <p className="text-xs text-slate-500">Liga Catamarca</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
            aria-label="Cerrar menú"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.to} to={item.to} className={getMobileLinkClass}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}