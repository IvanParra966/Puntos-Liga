import {
  FiChevronRight,
  FiFolder,
  FiFolderPlus,
  FiPlus,
} from 'react-icons/fi';

export default function OrganizationWorkspacePanel({
  organization,
  selectedNode,
  currentChildren,
  canManageStructure,
  renameValue,
  renaming,
  onRenameChange,
  onRenameNode,
  onCreateRootFolder,
  onCreateChildFolder,
  onCreateTournament,
  onDeleteNode,
  onSelectNode,
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span>{organization.name}</span>

            {selectedNode ? (
              <>
                <FiChevronRight size={14} />
                <span className="text-white">{selectedNode.name}</span>
              </>
            ) : (
              <>
                <FiChevronRight size={14} />
                <span className="text-white">Raíz</span>
              </>
            )}
          </div>

          <h2 className="mt-3 text-2xl font-semibold text-white">
            {selectedNode ? selectedNode.name : 'Raíz de la organización'}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {selectedNode
              ? 'Desde esta carpeta vas a poder crear subcarpetas y torneos.'
              : 'Seleccioná una carpeta o creá una nueva desde la estructura.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedNode ? (
            <>
              {canManageStructure ? (
                <>
                  <button
                    type="button"
                    onClick={() => onCreateChildFolder(selectedNode)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
                  >
                    <FiFolderPlus size={16} />
                    Nueva subcarpeta
                  </button>

                  <button
                    type="button"
                    onClick={onDeleteNode}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
                  >
                    Eliminar
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={onCreateTournament}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                <FiPlus size={16} />
                Nuevo torneo
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onCreateRootFolder}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <FiFolderPlus size={16} />
              Nueva carpeta
            </button>
          )}
        </div>
      </div>

      {selectedNode && canManageStructure ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Nombre de la carpeta
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={onRenameNode}
              disabled={renaming || !renameValue.trim()}
              className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-70"
            >
              {renaming ? 'Guardando...' : 'Guardar nombre'}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        {currentChildren.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-sm text-slate-400">
            No hay elementos dentro de esta ubicación.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {currentChildren.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => onSelectNode(node)}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <FiFolder size={20} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-white">
                  {node.name}
                </h3>

                <p className="mt-2 text-sm text-slate-400">Carpeta</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}