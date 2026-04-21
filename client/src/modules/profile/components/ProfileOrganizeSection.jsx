import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertCircle,
  FiClock,
  FiEye,
  FiShield,
  FiSlash,
  FiXCircle,
  FiCheckCircle,
} from 'react-icons/fi';
import { toast } from 'sonner';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { useAuth } from '../../auth/context/AuthContext';
import {
  cancelOrganizationRequest,
  getMyOrganizationRequests,
} from '../../organizationsRequests/services/organizationRequestsService';

function getStatusStyles(statusCode) {
  switch (statusCode) {
    case 'pending':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-300';
    case 'approved':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300';
    case 'rejected':
      return 'border-rose-400/20 bg-rose-400/10 text-rose-300';
    case 'cancelled':
      return 'border-slate-600 bg-slate-800/70 text-slate-300';
    default:
      return 'border-slate-700 bg-slate-900 text-slate-300';
  }
}

function getStatusLabel(statusCode) {
  switch (statusCode) {
    case 'pending':
      return 'Pendiente';
    case 'approved':
      return 'Aprobada';
    case 'rejected':
      return 'Rechazada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Sin estado';
  }
}

function getRequestTypeLabel(requestType) {
  switch (requestType) {
    case 'become_organizer':
      return 'Ser organizador';
    case 'create_organization':
      return 'Crear organización';
    default:
      return requestType;
  }
}

export default function ProfileOrganizeSection() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [canceling, setCanceling] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getMyOrganizationRequests(token);
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error loading organization requests:', error);
      toast.error(error.message || 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const hasPendingRequest = useMemo(() => {
    return requests.some((request) => request.status?.code === 'pending');
  }, [requests]);

  const handleCancelRequest = async () => {
    if (!requestToCancel) return;

    try {
      setCanceling(true);
      await cancelOrganizationRequest(requestToCancel.id, token);
      toast.success('Solicitud cancelada correctamente');
      setRequestToCancel(null);
      await loadRequests();
    } catch (error) {
      console.error('Error canceling request:', error);
      toast.error(error.message || 'No se pudo cancelar la solicitud');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
              <FiShield size={14} />
              Organización de torneos
            </div>

            <h2 className="text-3xl font-bold text-white">Ser organizador</h2>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              Desde esta sección podés solicitar acceso para organizar torneos,
              crear organizaciones y administrar eventos dentro de la plataforma.
              Tu solicitud será revisada por el equipo administrador.
            </p>
          </div>

          <div className="shrink-0">
            {hasPendingRequest ? (
              <button
                type="button"
                disabled
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-400 opacity-80"
              >
                Ya tenés una solicitud en revisión
              </button>
            ) : (
              <Link
                to="/organization-requests/new"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <FiShield size={16} />
                Ser organizador
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-white">Mis solicitudes</h3>
          <p className="mt-2 text-sm text-slate-400">
            Acá vas a ver el estado de tus solicitudes y podrás consultar su detalle.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-6 text-sm text-slate-400">
            Cargando solicitudes...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-6 text-sm text-slate-300">
            Todavía no hiciste ninguna solicitud.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const statusCode = request.status?.code;
              const isPending = statusCode === 'pending';
              const isExpanded = expandedId === request.id;

              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-white">
                          {getRequestTypeLabel(request.request_type)}
                        </span>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(
                            statusCode
                          )}`}
                        >
                          {getStatusLabel(statusCode)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-400">
                        Enviada el{' '}
                        {new Date(request.created_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : request.id)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                      >
                        <FiEye size={16} />
                        {isExpanded ? 'Ocultar solicitud' : 'Ver solicitud'}
                      </button>

                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => setRequestToCancel(request)}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                        >
                          <FiSlash size={16} />
                          Cancelar
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-slate-500">Tipo</p>
                          <p className="text-slate-200">
                            {getRequestTypeLabel(request.request_type)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Estado</p>
                          <p className="text-slate-200">
                            {getStatusLabel(statusCode)}
                          </p>
                        </div>

                        {request.organization_name_requested ? (
                          <div>
                            <p className="text-slate-500">Organización solicitada</p>
                            <p className="text-slate-200">
                              {request.organization_name_requested}
                            </p>
                          </div>
                        ) : null}

                        {request.organization?.name ? (
                          <div>
                            <p className="text-slate-500">Organización</p>
                            <p className="text-slate-200">
                              {request.organization.name}
                            </p>
                          </div>
                        ) : null}

                        <div>
                          <p className="text-slate-500">Mensaje</p>
                          <p className="text-slate-200">
                            {request.message || 'Sin mensaje'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(requestToCancel)}
        title="Cancelar solicitud"
        description="Si cancelás esta solicitud, quedará marcada como cancelada y no podrás reactivarla."
        confirmText="Sí, cancelar"
        cancelText="Volver"
        onConfirm={handleCancelRequest}
        onCancel={() => setRequestToCancel(null)}
        loading={canceling}
      />
    </>
  );
}