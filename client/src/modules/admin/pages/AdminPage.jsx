import { Link } from 'react-router-dom';
import { FiClipboard, FiShield, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';

function AdminCard({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 hover:bg-slate-900/80"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
        <Icon size={20} />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </Link>
  );
}

export default function AdminPage() {
  const { user, hasPermission } = useAuth();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
          <FiShield size={14} />
          Panel admin
        </div>

        <h1 className="text-3xl font-bold text-white">Administración</h1>
        <p className="mt-2 text-sm text-slate-400">
          Desde acá vas a gestionar módulos administrativos según los permisos de tu cuenta.
        </p>

        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
          Rol actual: <span className="font-semibold text-white">{user?.role || 'Sin rol'}</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {hasPermission('organization_requests.review') ? (
          <AdminCard
            to="/admin/organization-requests"
            icon={FiClipboard}
            title="Solicitudes"
            description="Revisá, aprobá y rechazá solicitudes para ser organizador."
          />
        ) : null}

        {hasPermission('users.view') ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 opacity-80">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <FiUsers size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">Usuarios</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Próximamente vas a poder administrar usuarios desde este módulo.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}