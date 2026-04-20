import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiXCircle,
} from 'react-icons/fi';
import MyOrganizationRequestsPage from '../../organizationsRequests/pages/MyOrganizationRequestsPage';

function StatCard({ label, value, color = 'slate' }) {
  const styles = {
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    rose: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    slate: 'border-slate-700 bg-slate-950 text-slate-200',
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[color] || styles.slate}`}>
      <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function InfoPill({ icon: Icon, label, value, color = 'slate' }) {
  const styles = {
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    rose: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    slate: 'border-slate-700 bg-slate-950 text-slate-200',
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${styles[color] || styles.slate}`}>
      <Icon size={15} />
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

export default function ProfileOrganizeSection() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="bg-gradient-to-r from-cyan-500/15 via-slate-900 to-emerald-500/10 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                Organizaciones y torneos
              </div>

              <h2 className="mt-4 text-3xl font-bold text-white">Organizá torneos</h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Desde esta sección vas a poder pedir acceso para crear organizaciones,
                administrar torneos y acompañar el crecimiento competitivo de la plataforma.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <InfoPill
                  icon={FiShield}
                  label="Acceso"
                  value="Solicitudes y gestión"
                  color="cyan"
                />
                <InfoPill
                  icon={FiClock}
                  label="Estado"
                  value="En crecimiento"
                  color="amber"
                />
              </div>
            </div>

            <div className="flex shrink-0">
              <Link
                to="/organizationRequests/new"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <FiShield size={16} />
                Nueva solicitud
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-800 p-6 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Solicitudes" value="--" color="cyan" />
          <StatCard label="Pendientes" value="--" color="amber" />
          <StatCard label="Aprobadas" value="--" color="emerald" />
          <StatCard label="Rechazadas" value="--" color="rose" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <InfoPill icon={FiClock} label="Pendiente" value="En revisión" color="amber" />
          <InfoPill icon={FiCheckCircle} label="Aprobada" value="Lista para operar" color="emerald" />
          <InfoPill icon={FiXCircle} label="Rechazada" value="No aprobada" color="rose" />
          <InfoPill icon={FiAlertCircle} label="Importante" value="Tus solicitudes viven acá" color="slate" />
        </div>

        <MyOrganizationRequestsPage embedded />
      </section>
    </div>
  );
}