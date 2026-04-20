import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { getMyOrganizationRequests } from '../services/organizationRequestsService';

function StatusBadge({ status }) {
  const code = status?.code || '';

  const styles = {
    pending: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    approved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    rejected: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    default: 'border-slate-700 bg-slate-950 text-slate-300',
  };

  const className = styles[code] || styles.default;

  return (
    <span className={`inline-flex rounded-lg border px-3 py-1 text-xs font-medium ${className}`}>
      {status?.name || status?.code || 'Sin estado'}
    </span>
  );
}

export default function MyOrganizationRequestsPage({ embedded = false }) {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await getMyOrganizationRequests(token);

        if (!cancelled) {
          setRequests(data.requests || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'No se pudieron cargar tus solicitudes');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (token) {
      run();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return <div className="text-slate-300">Cargando solicitudes...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'mx-auto max-w-4xl'}>
      <h2 className="text-xl font-bold text-white">
        {embedded ? 'Mis solicitudes' : 'Solicitudes'}
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Estado actual de las solicitudes enviadas.
      </p>

      <div className="mt-6 space-y-4">
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-300">
            Todavía no hiciste ninguna solicitud.
          </div>
        ) : (
          requests.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {item.request_type === 'create_organization'
                      ? 'Crear organización'
                      : 'Ser organizador'}
                  </h3>

                  <div className="mt-2">
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <span className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300">
                  #{item.id}
                </span>
              </div>

              {item.organization_name_requested ? (
                <p className="mt-3 text-sm text-slate-300">
                  Organización solicitada: {item.organization_name_requested}
                </p>
              ) : null}

              {item.organization?.name ? (
                <p className="mt-3 text-sm text-slate-300">
                  Organización: {item.organization.name}
                </p>
              ) : null}

              {item.message ? (
                <p className="mt-3 text-sm text-slate-300">{item.message}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}