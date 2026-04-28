import {
  FiChevronDown,
  FiChevronRight,
  FiFolder,
  FiPlus,
} from 'react-icons/fi';

function DragHandleDots({ canDrag, onDragStart, onDragEnd }) {
  if (!canDrag) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-slate-300 active:cursor-grabbing"
      title="Arrastrar carpeta"
    >
      <span className="grid grid-cols-2 gap-[3px]">
        {Array.from({ length: 6 }).map((_, index) => (
          <span
            key={index}
            className="h-[3px] w-[3px] rounded-full bg-current"
          />
        ))}
      </span>
    </button>
  );
}

function TreeItem({
  node,
  level = 0,
  selectedId,
  expandedIds,
  canManageStructure,
  draggedNodeId,
  dragOverNodeId,
  canDropOnTarget,
  onToggleExpanded,
  onSelectNode,
  onCreateChildFolder,
  onDragStartNode,
  onDragEnterNode,
  onDropNode,
  onClearDragState,
}) {
  const isSelected = selectedId === node.id;
  const hasChildren = node.children?.length > 0;
  const isExpanded = expandedIds.has(node.id);

  const currentDepth = level + 1;
  const canCreateChild =
    canManageStructure &&
    currentDepth < 5 &&
    !node.contains_tournaments;

  const isDragging = draggedNodeId === node.id;
  const showDropLine = dragOverNodeId === node.id && canDropOnTarget(node);

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (!canDropOnTarget(node)) return;
          e.preventDefault();
        }}
        onDragEnter={(e) => {
          if (!canDropOnTarget(node)) return;
          e.preventDefault();
          onDragEnterNode(node.id);
        }}
        onDrop={(e) => {
          if (!canDropOnTarget(node)) return;
          e.preventDefault();
          onDropNode(node);
        }}
        className={`relative flex items-center gap-2 rounded-xl px-2 py-1 transition ${
          isSelected ? 'bg-cyan-400/10' : 'hover:bg-slate-900'
        } ${isDragging ? 'opacity-50' : ''}`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {showDropLine ? (
          <div className="pointer-events-none absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-cyan-400 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]" />
        ) : null}

        <DragHandleDots
          canDrag={canManageStructure}
          onDragStart={() => onDragStartNode(node.id)}
          onDragEnd={onClearDragState}
        />

        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpanded(node.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            {isExpanded ? <FiChevronDown size={15} /> : <FiChevronRight size={15} />}
          </button>
        ) : (
          <div className="h-8 w-8" />
        )}

        <button
          type="button"
          onClick={() => onSelectNode(node)}
          className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
            isSelected
              ? 'text-cyan-300'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <FiFolder size={16} />
          <span className="truncate">{node.name}</span>
        </button>

        {canCreateChild ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCreateChildFolder(node);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            title="Crear subcarpeta"
          >
            <FiPlus size={15} />
          </button>
        ) : null}
      </div>

      {hasChildren && isExpanded ? (
        <div className="mt-1 space-y-1">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              canManageStructure={canManageStructure}
              draggedNodeId={draggedNodeId}
              dragOverNodeId={dragOverNodeId}
              canDropOnTarget={canDropOnTarget}
              onToggleExpanded={onToggleExpanded}
              onSelectNode={onSelectNode}
              onCreateChildFolder={onCreateChildFolder}
              onDragStartNode={onDragStartNode}
              onDragEnterNode={onDragEnterNode}
              onDropNode={onDropNode}
              onClearDragState={onClearDragState}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function OrganizationStructureSidebar({
  tree,
  selectedNode,
  expandedIds,
  canManageStructure,
  draggedNodeId,
  dragOverNodeId,
  canDropOnTarget,
  onToggleExpanded,
  onSelectNode,
  onCreateRootFolder,
  onCreateChildFolder,
  onDragStartNode,
  onDragEnterNode,
  onDropNode,
  onClearDragState,
}) {
  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Estructura</h2>
          <p className="mt-1 text-sm text-slate-400">
            Organizá carpetas y subcarpetas.
          </p>
        </div>

        {canManageStructure ? (
          <button
            type="button"
            onClick={onCreateRootFolder}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            title="Crear carpeta raíz"
          >
            <FiPlus size={16} />
          </button>
        ) : null}
      </div>

      {tree.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
          Todavía no hay carpetas.
        </div>
      ) : (
        <div className="space-y-1">
          {tree.map((node) => (
            <TreeItem
              key={node.id}
              node={node}
              selectedId={selectedNode?.id || null}
              expandedIds={expandedIds}
              canManageStructure={canManageStructure}
              draggedNodeId={draggedNodeId}
              dragOverNodeId={dragOverNodeId}
              canDropOnTarget={canDropOnTarget}
              onToggleExpanded={onToggleExpanded}
              onSelectNode={onSelectNode}
              onCreateChildFolder={onCreateChildFolder}
              onDragStartNode={onDragStartNode}
              onDragEnterNode={onDragEnterNode}
              onDropNode={onDropNode}
              onClearDragState={onClearDragState}
            />
          ))}
        </div>
      )}
    </aside>
  );
}