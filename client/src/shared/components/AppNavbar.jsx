import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiChevronDown,
  FiChevronRight,
  FiFilePlus,
  FiLogOut,
  FiMenu,
  FiShield,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';
import logoLiga from '/logo.png';

const adminRoles = ['system_owner', 'platform_admin', 'support_admin'];

const getMobileLinkClass = ({ isActive }) =>
  [
    'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition',
    isActive
      ? 'bg-cyan-400/15 text-cyan-300'
      : 'text-slate-300 hover:bg-slate-900 hover:text-white',
  ].join(' ');

function UserAvatar({ user }) {
  const imageUrl = user?.avatar_url || user?.image_url || user?.photo_url || '';

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={user?.username || 'Usuario'}
        className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-700"
      />
    );
  }

  const initial = user?.username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-300 ring-1 ring-slate-700">
      {initial}
    </div>
  );
}

export default function AppNavbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const location = useLocation();
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();

  const isAdmin = adminRoles.includes(user?.role);

  const userMenuItems = useMemo(() => {
    const items = [
      {
        to: '/organization-requests/new',
        label: 'Organizá torneos',
        icon: FiFilePlus,
      },
      {
        to: '/profile',
        label: 'Perfil',
        icon: FiUser,
      },
    ];

    if (isAdmin) {
      items.push({
        to: '/admin',
        label: 'Panel admin',
        icon: FiShield,
      });
    }

    return items;
  }, [isAdmin]);

  useEffect(() => {
    setOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setUserMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cyan-400/10">
              <img
                src={logoLiga}
                alt="VortexTCG"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate font-storm text-3xl text-[#5aff5e]">
                VortexTCG
              </p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-left transition hover:border-slate-700 hover:bg-slate-900/80"
                >
                  <UserAvatar user={user} />

                  <div className="max-w-[160px]">
                    <p className="truncate text-sm font-medium text-white">
                      {user?.username}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {user?.role || 'player'}
                    </p>
                  </div>

                  <FiChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`absolute right-0 top-[calc(100%+10px)] z-50 w-72 origin-top-right rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl transition ${
                    userMenuOpen
                      ? 'pointer-events-auto scale-100 opacity-100'
                      : 'pointer-events-none scale-95 opacity-0'
                  }`}
                >
                  <div className="mb-2 rounded-xl border border-slate-800 bg-slate-900 p-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {user?.username}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {user?.email || 'Sin email'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
                        >
                          <span className="flex items-center gap-3">
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </span>
                          <FiChevronRight size={15} className="text-slate-500" />
                        </NavLink>
                      );
                    })}
                  </div>

                  <div className="mt-2 border-t border-slate-800 pt-2">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-white"
                    >
                      <span className="flex items-center gap-3">
                        <FiLogOut size={16} />
                        <span>Salir</span>
                      </span>
                      <FiChevronRight size={15} className="text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <NavLink
                  to="/login"
                  className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
                >
                  Ingresar
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Registrarse
                </NavLink>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-cyan-400/40 hover:text-white lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <FiMenu size={20} />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        id="mobile-menu"
        className={`fixed right-0 top-0 z-50 flex h-full w-[320px] max-w-[88vw] flex-col border-l border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-300 lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-cyan-400/10">
              <img
                src={logoLiga}
                alt="VortexTCG"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Menú</p>
              <p className="text-xs text-slate-500">VortexTCG</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
            aria-label="Cerrar menú"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isAuthenticated ? (
            <>
              <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {user?.username}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {user?.role || 'player'}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {userMenuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={getMobileLinkClass}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </span>
                      <FiChevronRight size={16} />
                    </NavLink>
                  );
                })}
              </nav>
            </>
          ) : (
            <div className="space-y-3">
              <NavLink
                to="/login"
                className="block rounded-xl border border-slate-800 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                Ingresar
              </NavLink>
              <NavLink
                to="/register"
                className="block rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Registrarse
              </NavLink>
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <div className="border-t border-slate-800 p-4">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-between rounded-xl border border-slate-700 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-red-400/40 hover:text-white"
            >
              <span className="flex items-center gap-3">
                <FiLogOut size={16} />
                <span>Salir</span>
              </span>
              <FiChevronRight size={16} />
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}