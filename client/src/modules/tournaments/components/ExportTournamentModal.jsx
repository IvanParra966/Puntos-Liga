import { useEffect, useMemo, useState } from 'react';

function buildNodePath(nodes, node) {
  const map = new Map(nodes.map((item) => [item.id, item]));
  const names = [];
  let current = node;

  while (current) {
    names.unshift(current.name);
    current = current.parent_id ? map.get(current.parent_id) : null;
  }

  return names.join(' / ');
}

export default function ExportTournamentModal({
  open,
  nodes,
  tournament,
  loading,
  onClose,
  onConfirm,
}) {
  const [targetNodeId, setTargetNodeId] = useState('');

  const availableNodes = useMemo(() => {
    const parentIds = new Set(
      nodes
        .filter((node) => node.parent_id !== null)
        .map((node) => node.parent_id)
    );

    return nodes
      .filter((node) => !parentIds.has(node.id))
      .filter((node) => node.id !== tournament?.organization_node_id)
      .map((node) => ({
        ...node,
        pathLabel: buildNodePath(nodes, node),
      }));
  }, [nodes, tournament]);

  useEffect(() => {
    if (!open) return;
    setTargetNodeId(availableNodes[0]?.id || '');
  }, [open, availableNodes]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetNodeId) return;
    await onConfirm(Number(targetNodeId));
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">Exportar torneo</h2>
          <p className="mt-2 text-sm text-slate-400">
            Elegí la carpeta donde querés clonar este torneo.
          </p>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Torneo
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {tournament?.name || 'Sin torneo'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Carpeta destino
              </label>

              <select
                value={targetNodeId}
                onChange={(e) => setTargetNodeId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              >
                {availableNodes.length === 0 ? (
                  <option value="">No hay carpetas disponibles</option>
                ) : (
                  availableNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.pathLabel}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading || !targetNodeId}
                className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
              >
                {loading ? 'Exportando...' : 'Exportar torneo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}