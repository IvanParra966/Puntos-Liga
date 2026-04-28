import { useEffect, useMemo, useRef, useState } from 'react';
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
import OrganizationHeader from '../components/OrganizationHeader';
import OrganizationStructureSidebar from '../components/OrganizationStructureSidebar';
import OrganizationWorkspacePanel from '../components/OrganizationWorkspacePanel';
import CreateFolderModal from '../components/CreateFolderModal';
import DeleteFolderModal from '../components/DeleteFolderModal';

function buildTree(nodes, parentId = null) {
  return nodes
    .filter((node) => node.parent_id === parentId)
    .map((node) => ({
      ...node,
      children: buildTree(nodes, node.id),
    }));
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

  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOverNodeId, setDragOverNodeId] = useState(null);

  const canManageStructure =
    membership?.organization_role?.code === 'owner' ||
    organizationPermissions.includes('organizations.update');

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

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  useEffect(() => {
    setRenameValue(selectedNode?.name || '');
  }, [selectedNode]);

  const tree = useMemo(() => buildTree(nodes), [nodes]);

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

  const handleRenameNode = async () => {
    if (!selectedNode) return;

    try {
      setRenaming(true);

      await updateOrganizationNode(
        selectedNode.id,
        { name: renameValue },
        token
      );

      toast.success('Carpeta actualizada correctamente');
      await loadData();
    } catch (error) {
      console.error('Error renaming node:', error);
      toast.error(error.message || 'No se pudo actualizar la carpeta');
    } finally {
      setRenaming(false);
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

    toast.info('Siguiente paso: crear torneo dentro de esta carpeta');
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
            canManageStructure={canManageStructure}
            renameValue={renameValue}
            renaming={renaming}
            onRenameChange={setRenameValue}
            onRenameNode={handleRenameNode}
            onCreateRootFolder={openCreateRootFolder}
            onCreateChildFolder={openCreateChildFolder}
            onCreateTournament={handleCreateTournament}
            onDeleteNode={() => setDeleteModalOpen(true)}
            onSelectNode={setSelectedNode}
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
    </>
  );
}