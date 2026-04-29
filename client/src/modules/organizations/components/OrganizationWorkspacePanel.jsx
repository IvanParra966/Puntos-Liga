import {
  FiChevronRight,
  FiCopy,
  FiEdit2,
  FiFolder,
  FiFolderPlus,
  FiPlus,
} from 'react-icons/fi';
import { BiExport } from "react-icons/bi";
export default function OrganizationWorkspacePanel({
  organization,
  selectedNode,
  currentChildren,
  tournaments,
  canManageStructure,
  breadcrumbs,
  onNavigateBreadcrumb,
  onOpenRenameModal,
  onCreateRootFolder,
  onCreateChildFolder,
  onCreateTournament,
  onCloneTournament,
  onDeleteNode,
  onSelectNode,
  onOpenExportTournament,
  onOpenTournament,
}) {
  const hasChildren = currentChildren.length > 0;
  const hasTournaments = tournaments.length > 0;

  const canDeleteNode =
    selectedNode && canManageStructure && !hasChildren && !hasTournaments;

  const canCreateSubfolder =
    selectedNode && canManageStructure && !hasTournaments;

  const canCreateTournament =
    selectedNode && !hasChildren;

  const showSubfoldersSection = !hasTournaments;
  const showTournamentsSection = selectedNode && !hasChildren;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <div key={item.key} className="flex items-center gap-2">
                  {index > 0 ? <FiChevronRight size={14} /> : null}

                  {isLast ? (
                    <span className="font-medium text-white">
                      {item.label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigateBreadcrumb(item.node)}
                      className="transition hover:text-white"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-white">
              {selectedNode ? selectedNode.name : 'Raíz de la organización'}
            </h2>

            {selectedNode && canManageStructure ? (
              <button
                type="button"
                onClick={onOpenRenameModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-slate-300 transition hover:border-cyan-400 hover:text-white"
                title="Editar nombre"
              >
                <FiEdit2 size={16} />
              </button>
            ) : null}
          </div>

          <p className="mt-2 text-sm text-slate-400">
            {selectedNode
              ? 'Administrá subcarpetas y torneos dentro de esta ubicación.'
              : 'Seleccioná una carpeta o creá una nueva desde la estructura.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedNode ? (
            <>
              {canCreateSubfolder ? (
                <button
                  type="button"
                  onClick={() => onCreateChildFolder(selectedNode)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
                >
                  <FiFolderPlus size={16} />
                  Nueva carpeta
                </button>
              ) : null}

              {canDeleteNode ? (
                <button
                  type="button"
                  onClick={onDeleteNode}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
                >
                  Eliminar
                </button>
              ) : null}

              {canCreateTournament ? (
                <button
                  type="button"
                  onClick={onCreateTournament}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  <FiPlus size={16} />
                  Nuevo torneo
                </button>
              ) : null}
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

      <div className="mt-6 space-y-6">
        {showSubfoldersSection ? (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">Carpetas</h3>

            {currentChildren.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-sm text-slate-400">
                No hay subcarpetas en esta ubicación.
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

                    <h4 className="mt-4 text-base font-semibold text-white">
                      {node.name}
                    </h4>

                    <p className="mt-2 text-sm text-slate-400">Carpeta</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {showTournamentsSection ? (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">Torneos</h3>

            {tournaments.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-sm text-slate-400">
                No hay torneos en esta carpeta.
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {tournaments.map((tournament) => (
                  <article
                    key={tournament.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          {tournament.name}
                        </h4>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                          <span className="rounded-full border border-slate-700 px-3 py-1">
                            {tournament.format?.name || 'Sin formato'}
                          </span>
                          <span className="rounded-full border border-slate-700 px-3 py-1">
                            {tournament.matchMode?.name || 'Sin match mode'}
                          </span>
                          <span className="rounded-full border border-slate-700 px-3 py-1">
                            {tournament.pairingSystem?.name || 'Sin sistema'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">

                        <button
                          type="button"
                          onClick={() => onOpenTournament(tournament.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-white"
                        >
                          Abrir
                        </button>
                        <button
                          type="button"
                          onClick={() => onCloneTournament(tournament.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-white"
                        >
                          <FiCopy size={15} />
                          Clonar
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenExportTournament(tournament)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400 hover:text-white"
                        >
                          <BiExport size={15} />
                          Exportar
                        </button>


                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}