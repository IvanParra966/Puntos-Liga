import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../auth/context/AuthContext';
import {
  createOrganizationNode,
  deleteOrganizationNode,
  getMyOrganization,
  getOrganizationNodes,
  reorderOrganizationNodes,
  updateOrganizationLogo,
  updateOrganizationNode,
} from '../services/organizationsService';
import {
  cloneTournament,
  createTournament,
  getNodeTournaments,
  getTournamentCatalogs,
  exportTournament,
} from '../../tournaments/services/tournamentsService';
import OrganizationHeader from '../components/OrganizationHeader';
import OrganizationStructureSidebar from '../components/OrganizationStructureSidebar';
import OrganizationWorkspacePanel from '../components/OrganizationWorkspacePanel';
import CreateFolderModal from '../components/CreateFolderModal';
import DeleteFolderModal from '../components/DeleteFolderModal';
import CreateTournamentModal from '../../tournaments/components/CreateTournamentModal';
import EditFolderNameModal from '../components/EditFolderNameModal';
import ExportTournamentModal from '../../tournaments/components/ExportTournamentModal';

function buildTree(nodes, parentId = null) {
  return nodes
    .filter((node) => node.parent_id === parentId)
    .map((node) => ({
      ...node,
      children: buildTree(nodes, node.id),
    }));
}

function buildBreadcrumbs(organization, nodes, selectedNode) {
  const items = [
    {
      key: 'root',
      label: organization?.name || 'Organización',
      node: null,
    },
  ];

  if (!selectedNode) {
    return items;
  }

  const map = new Map(nodes.map((node) => [node.id, node]));
  const chain = [];

  let current = selectedNode;

  while (current) {
    chain.unshift(current);
    current = current.parent_id ? map.get(current.parent_id) : null;
  }

  return [
    ...items,
    ...chain.map((node) => ({
      key: `node-${node.id}`,
      label: node.name,
      node,
    })),
  ];
}

function getAncestorIds(nodes, node) {
  const ids = [];
  const map = new Map(nodes.map((item) => [item.id, item]));

  let current = node;

  while (current?.parent_id) {
    ids.unshift(current.parent_id);
    current = map.get(current.parent_id);
  }

  return ids;
}

function resolveLogoUrl(logoUrl) {
  if (!logoUrl) return null;

  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl;
  }

  return `${import.meta.env.VITE_API_URL || ''}${logoUrl}`;
}

export default function MyOrganizationPage() {
  const { token } = useAuth();
  const logoInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [membership, setMembership] = useState(null);
  const [organizationPermissions, setOrganizationPermissions] = useState([]);

  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderParent, setFolderParent] = useState(null);
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [renaming, setRenaming] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOverNodeId, setDragOverNodeId] = useState(null);

  const [catalogs, setCatalogs] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentModalOpen, setTournamentModalOpen] = useState(false);
  const [creatingTournament, setCreatingTournament] = useState(false);
  const [cloningTournamentId, setCloningTournamentId] = useState(null);

  const [editNameModalOpen, setEditNameModalOpen] = useState(false);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedTournamentToExport, setSelectedTournamentToExport] = useState(null);
  const [exportingTournament, setExportingTournament] = useState(false);

  const navigate = useNavigate();
  const handleOpenTournament = (tournamentId) => {
    navigate(`/organization/tournaments/${tournamentId}`);
  };

  const canManageStructure =
    membership?.organization_role?.code === 'owner' ||
    organizationPermissions.includes('organizations.update');

  const loadCatalogs = async () => {
    try {
      const data = await getTournamentCatalogs(token);
      setCatalogs(data);
    } catch (error) {
      console.error('Error loading tournament catalogs:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const organizationData = await getMyOrganization(token);
      const org = organizationData.organization || null;

      setOrganization(org);
      setMembership(organizationData.membership || null);
      setOrganizationPermissions(organizationData.permissions || []);
      setLogoPreview(resolveLogoUrl(org?.logo_url));

      if (org?.id) {
        const nodesData = await getOrganizationNodes(org.id, token);
        const allNodes = nodesData.nodes || [];

        setNodes(allNodes);

        setExpandedIds((prev) => {
          const validIds = new Set(allNodes.map((node) => node.id));
          const cleaned = new Set([...prev].filter((id) => validIds.has(id)));

          if (cleaned.size > 0) {
            return cleaned;
          }

          const rootIds = allNodes
            .filter((node) => node.parent_id === null)
            .map((node) => node.id);

          return new Set(rootIds);
        });

        setSelectedNode((prev) => {
          if (!prev) return null;
          const exists = allNodes.find((node) => node.id === prev.id);
          return exists || null;
        });
      } else {
        setNodes([]);
        setSelectedNode(null);
      }
    } catch (error) {
      console.error('Error loading organization workspace:', error);
      toast.error(error.message || 'No se pudo cargar la organización');
    } finally {
      setLoading(false);
    }
  };

  const loadTournaments = async (node) => {
    if (!organization?.id || !node?.id) {
      setTournaments([]);
      return;
    }

    try {
      const data = await getNodeTournaments(organization.id, node.id, token);
      setTournaments(data.tournaments || []);
    } catch (error) {
      console.error('Error loading node tournaments:', error);
      toast.error(error.message || 'No se pudieron cargar los torneos');
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
      loadCatalogs();
    }
  }, [token]);

  useEffect(() => {
    if (selectedNode) {
      loadTournaments(selectedNode);
    } else {
      setTournaments([]);
    }
  }, [selectedNode, organization?.id]);

  const tree = useMemo(() => buildTree(nodes), [nodes]);

  const breadcrumbs = useMemo(() => {
    return buildBreadcrumbs(organization, nodes, selectedNode);
  }, [organization, nodes, selectedNode]);

  const currentChildren = useMemo(() => {
    const parentId = selectedNode ? selectedNode.id : null;
    return nodes.filter((node) => node.parent_id === parentId);
  }, [nodes, selectedNode]);

  const toggleExpanded = (nodeId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return next;
    });
  };

  const openCreateRootFolder = () => {
    setFolderParent(null);
    setFolderModalOpen(true);
  };

  const openCreateChildFolder = (node) => {
    setFolderParent(node);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(node.id);
      return next;
    });
    setFolderModalOpen(true);
  };

  const handleCreateFolder = async (name) => {
    if (!organization?.id) return;

    try {
      setCreatingFolder(true);

      await createOrganizationNode(
        organization.id,
        {
          name,
          parent_id: folderParent?.id || null,
        },
        token
      );

      toast.success('Carpeta creada correctamente');
      setFolderModalOpen(false);
      setFolderParent(null);
      await loadData();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error(error.message || 'No se pudo crear la carpeta');
    } finally {
      setCreatingFolder(false);
    }
  };


  const handleDeleteNode = async () => {
    if (!selectedNode) return;

    try {
      setDeleting(true);

      await deleteOrganizationNode(
        selectedNode.id,
        { current_password: deletePassword },
        token
      );

      toast.success('Carpeta eliminada correctamente');
      setDeleteModalOpen(false);
      setDeletePassword('');
      setSelectedNode(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting node:', error);
      toast.error(error.message || 'No se pudo eliminar la carpeta');
    } finally {
      setDeleting(false);
    }
  };

  const handlePickLogo = () => {
    logoInputRef.current?.click();
  };

  const handleLogoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !organization?.id) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Seleccioná una imagen válida');
      return;
    }

    try {
      setUploadingLogo(true);

      const localPreview = URL.createObjectURL(file);
      setLogoPreview(localPreview);

      const data = await updateOrganizationLogo(organization.id, file, token);

      setLogoPreview(resolveLogoUrl(data.logo_url));
      toast.success('Logo actualizado correctamente');
      await loadData();
    } catch (error) {
      console.error('Error updating logo:', error);
      toast.error(error.message || 'No se pudo actualizar el logo');
    } finally {
      setUploadingLogo(false);
      event.target.value = '';
    }
  };

  const handleCreateTournament = () => {
    if (!selectedNode) {
      toast.error('Primero seleccioná una carpeta');
      return;
    }

    setTournamentModalOpen(true);
  };

  const handleSubmitTournament = async (formData) => {
    if (!organization?.id || !selectedNode?.id) return;

    try {
      setCreatingTournament(true);

      await createTournament(
        {
          ...formData,
          organization_id: organization.id,
          organization_node_id: selectedNode.id,
        },
        token
      );

      toast.success('Torneo creado correctamente');
      setTournamentModalOpen(false);
      await loadData();
      await loadTournaments(selectedNode);
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error(error.message || 'No se pudo crear el torneo');
    } finally {
      setCreatingTournament(false);
    }
  };

  const handleCloneTournament = async (tournamentId) => {
    try {
      setCloningTournamentId(tournamentId);
      await cloneTournament(tournamentId, token);
      toast.success('Torneo clonado correctamente');
      await loadTournaments(selectedNode);
    } catch (error) {
      console.error('Error cloning tournament:', error);
      toast.error(error.message || 'No se pudo clonar el torneo');
    } finally {
      setCloningTournamentId(null);
    }
  };

  const handleReorderNode = async (targetNode) => {
    if (!draggedNodeId || !targetNode?.id || draggedNodeId === targetNode.id) {
      setDraggedNodeId(null);
      setDragOverNodeId(null);
      return;
    }

    try {
      await reorderOrganizationNodes(
        {
          dragged_node_id: draggedNodeId,
          target_node_id: targetNode.id,
        },
        token
      );

      toast.success('Orden actualizado correctamente');
      await loadData();
    } catch (error) {
      console.error('Error reordering nodes:', error);
      toast.error(error.message || 'No se pudo reordenar la carpeta');
    } finally {
      setDraggedNodeId(null);
      setDragOverNodeId(null);
    }
  };

  const canDropOnTarget = (targetNode) => {
    if (!canManageStructure) return false;
    if (!draggedNodeId || draggedNodeId === targetNode.id) return false;

    const draggedNode = nodes.find((node) => node.id === draggedNodeId);
    if (!draggedNode) return false;

    return draggedNode.parent_id === targetNode.parent_id;
  };

  const handleNavigateBreadcrumb = (node) => {
    if (!node) {
      setSelectedNode(null);
      return;
    }

    const ancestorIds = getAncestorIds(nodes, node);

    setExpandedIds((prev) => {
      const next = new Set(prev);
      ancestorIds.forEach((id) => next.add(id));
      return next;
    });

    setSelectedNode(node);
  };

  const handleOpenExportTournament = (tournament) => {
    setSelectedTournamentToExport(tournament);
    setExportModalOpen(true);
  };

  const handleExportTournament = async (targetNodeId) => {
    if (!selectedTournamentToExport) return;

    try {
      setExportingTournament(true);

      await exportTournament(
        selectedTournamentToExport.id,
        { target_node_id: targetNodeId },
        token
      );

      toast.success('Torneo exportado correctamente');
      setExportModalOpen(false);
      setSelectedTournamentToExport(null);
      await loadTournaments(selectedNode);
    } catch (error) {
      console.error('Error exporting tournament:', error);
      toast.error(error.message || 'No se pudo exportar el torneo');
    } finally {
      setExportingTournament(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
        Cargando organización...
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold text-white">Mi organización</h1>
        <p className="mt-3 text-sm text-slate-400">
          Todavía no pertenecés a una organización.
        </p>
      </div>
    );
  }

  return (
    <>
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoChange}
      />

      <div className="mx-auto w-full max-w-7xl space-y-6">
        <OrganizationHeader
          organization={organization}
          membership={membership}
          logoPreview={logoPreview}
          onPickLogo={handlePickLogo}
          uploadingLogo={uploadingLogo}
        />

        <section className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
          <OrganizationStructureSidebar
            tree={tree}
            selectedNode={selectedNode}
            expandedIds={expandedIds}
            canManageStructure={canManageStructure}
            draggedNodeId={draggedNodeId}
            dragOverNodeId={dragOverNodeId}
            canDropOnTarget={canDropOnTarget}
            onToggleExpanded={toggleExpanded}
            onSelectNode={setSelectedNode}
            onCreateRootFolder={openCreateRootFolder}
            onCreateChildFolder={openCreateChildFolder}
            onDragStartNode={setDraggedNodeId}
            onDragEnterNode={setDragOverNodeId}
            onDropNode={handleReorderNode}
            onClearDragState={() => {
              setDraggedNodeId(null);
              setDragOverNodeId(null);
            }}
          />

          <OrganizationWorkspacePanel
            organization={organization}
            selectedNode={selectedNode}
            currentChildren={currentChildren}
            tournaments={tournaments}
            canManageStructure={canManageStructure}
            breadcrumbs={breadcrumbs}
            onNavigateBreadcrumb={handleNavigateBreadcrumb}
            onOpenRenameModal={() => setEditNameModalOpen(true)}
            onCreateRootFolder={openCreateRootFolder}
            onCreateChildFolder={openCreateChildFolder}
            onCreateTournament={handleCreateTournament}
            onCloneTournament={handleCloneTournament}
            onOpenExportTournament={handleOpenExportTournament}
            onDeleteNode={() => setDeleteModalOpen(true)}
            onSelectNode={setSelectedNode}
            onOpenTournament={handleOpenTournament}
          />
        </section>
      </div>

      <CreateFolderModal
        open={folderModalOpen}
        onClose={() => {
          setFolderModalOpen(false);
          setFolderParent(null);
        }}
        onSubmit={handleCreateFolder}
        loading={creatingFolder}
        parentName={folderParent?.name || null}
      />

      <DeleteFolderModal
        open={deleteModalOpen}
        password={deletePassword}
        loading={deleting}
        onPasswordChange={setDeletePassword}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletePassword('');
        }}
        onConfirm={handleDeleteNode}
      />

      <CreateTournamentModal
        open={tournamentModalOpen}
        onClose={() => setTournamentModalOpen(false)}
        onSubmit={handleSubmitTournament}
        loading={creatingTournament}
        selectedNode={selectedNode}
        catalogs={catalogs}
      />

      <EditFolderNameModal
        open={editNameModalOpen}
        currentName={selectedNode?.name || ''}
        loading={renaming}
        onClose={() => setEditNameModalOpen(false)}
        onConfirm={async (newName) => {
          if (!selectedNode) return;

          try {
            setRenaming(true);

            await updateOrganizationNode(
              selectedNode.id,
              { name: newName },
              token
            );

            toast.success('Carpeta actualizada correctamente');
            setEditNameModalOpen(false);
            await loadData();
          } catch (error) {
            console.error('Error renaming node:', error);
            toast.error(error.message || 'No se pudo actualizar la carpeta');
          } finally {
            setRenaming(false);
          }
        }}

      />
      <ExportTournamentModal
        open={exportModalOpen}
        nodes={nodes}
        tournament={selectedTournamentToExport}
        loading={exportingTournament}
        onClose={() => {
          setExportModalOpen(false);
          setSelectedTournamentToExport(null);
        }}
        onConfirm={handleExportTournament}
      />
    </>
  );
}