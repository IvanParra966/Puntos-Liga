import { useEffect, useState } from 'react';
import { FiCheck, FiEye, FiShield, FiX } from 'react-icons/fi';
import { toast } from 'sonner';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { useAuth } from '../../auth/context/AuthContext';
import {
  approveOrganizationRequest,
  getPendingOrganizationRequests,
  rejectOrganizationRequest,
} from '../services/adminOrganizationRequestsService';

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AdminOrganizationRequestsPage() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [requestToReject, setRequestToReject] = useState(null);
  const [processing, setProcessing] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getPendingOrganizationRequests(token);
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error loading admin requests:', error);
      toast.error(error.message || 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadRequests();
    }
  }, [token]);

  const handleApprove = async () => {
    if (!requestToApprove) return;

    try {
      setProcessing(true);
      await approveOrganizationRequest(requestToApprove.id, token);
      toast.success('Solicitud aprobada correctamente');
      setRequestToApprove(null);
      await loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'No se pudo aprobar la solicitud');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!requestToReject) return;

    try {
      setProcessing(true);
      await rejectOrganizationRequest(requestToReject.id, token);
      toast.success('Solicitud rechazada correctamente');
      setRequestToReject(null);
      await loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'No se pudo rechazar la solicitud');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
            <FiShield size={14} />
            Panel admin
          </div>

          <h1 className="text-3xl font-bold text-white">Solicitudes pendientes</h1>
          <p className="mt-2 text-sm text-slate-400">
            Revisá solicitudes para ser organizador y tomá una decisión.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-6 text-sm text-slate-400">
              Cargando solicitudes...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-6 text-sm text-slate-300">
              No hay solicitudes pendientes.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
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
                            {request.organization_name_requested || 'Sin nombre'}
                          </span>

                          <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                            Pendiente
                          </span>
                        </div>

                        <p className="text-sm text-slate-400">
                          Usuario: {request.user?.username || 'Sin usuario'}
                        </p>

                        <p className="text-sm text-slate-400">
                          Email: {request.user?.email || 'Sin email'}
                        </p>

                        <p className="text-sm text-slate-400">
                          Enviada el {formatDate(request.createdAt || request.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : request.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                        >
                          <FiEye size={16} />
                          {isExpanded ? 'Ocultar' : 'Ver'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setRequestToApprove(request)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                        >
                          <FiCheck size={16} />
                          Aprobar
                        </button>

                        <button
                          type="button"
                          onClick={() => setRequestToReject(request)}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                        >
                          <FiX size={16} />
                          Rechazar
                        </button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-slate-500">Nombre solicitado</p>
                            <p className="text-slate-200">
                              {request.organization_name_requested || 'Sin nombre'}
                            </p>
                          </div>

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
      </div>

      <ConfirmDialog
        open={Boolean(requestToApprove)}
        title="Aprobar solicitud"
        description="Se creará la organización y el usuario quedará como owner."
        confirmText="Sí, aprobar"
        cancelText="Volver"
        onConfirm={handleApprove}
        onCancel={() => setRequestToApprove(null)}
        loading={processing}
      />

      <ConfirmDialog
        open={Boolean(requestToReject)}
        title="Rechazar solicitud"
        description="La solicitud quedará rechazada y el usuario no obtendrá permisos de organizador."
        confirmText="Sí, rechazar"
        cancelText="Volver"
        onConfirm={handleReject}
        onCancel={() => setRequestToReject(null)}
        loading={processing}
      />
    </>
  );
}