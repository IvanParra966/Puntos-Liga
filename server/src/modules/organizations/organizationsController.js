import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Organization,
  OrganizationMembers,
  OrganizationMembersPermissions,
  OrganizationNodes,
  OrganizationRolePermissions,
  OrganizationRoles,
  Permission,
  Status,
  User,
} from '../../database/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildPublicLogoUrl(filename) {
  if (!filename) return null;
  return `/uploads/organization-logos/${filename}`;
}

function buildOrganizationResponse(organization) {
  if (!organization) return null;

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    logo_url: organization.logo_url,
    description: organization.description,
    status: organization.status
      ? {
          id: organization.status.id,
          code: organization.status.code,
          name: organization.status.name,
        }
      : null,
  };
}

function buildMembershipResponse(member) {
  if (!member) return null;

  return {
    id: member.id,
    status: member.status
      ? {
          id: member.status.id,
          code: member.status.code,
          name: member.status.name,
        }
      : null,
    organization_role: member.organizationRole
      ? {
          id: member.organizationRole.id,
          code: member.organizationRole.code,
          name: member.organizationRole.name,
        }
      : null,
  };
}

async function getMembership(userId, organizationId) {
  return OrganizationMembers.findOne({
    where: {
      user_id: userId,
      organization_id: organizationId,
    },
    include: [
      {
        model: OrganizationRoles,
        as: 'organizationRole',
      },
      {
        model: Status,
        as: 'status',
      },
    ],
  });
}

async function getEffectiveOrganizationPermissionCodes(member) {
  const rolePermissions = await OrganizationRolePermissions.findAll({
    where: {
      organization_role_id: member.organization_role_id,
    },
    include: [
      {
        model: Permission,
        as: 'permission',
        attributes: ['code'],
      },
    ],
  });

  const memberPermissions = await OrganizationMembersPermissions.findAll({
    where: {
      organization_member_id: member.id,
    },
    include: [
      {
        model: Permission,
        as: 'permission',
        attributes: ['code'],
      },
    ],
  });

  const codes = new Set();

  for (const item of rolePermissions) {
    if (item.permission?.code) {
      codes.add(item.permission.code);
    }
  }

  for (const item of memberPermissions) {
    if (!item.permission?.code) continue;

    if (item.allowed) {
      codes.add(item.permission.code);
    } else {
      codes.delete(item.permission.code);
    }
  }

  return codes;
}

function canManageNodes(member, permissionCodes) {
  return (
    member.organizationRole?.code === 'owner' ||
    permissionCodes.has('organizations.update')
  );
}

async function getNodeDepth(node, organizationId) {
  let depth = 1;
  let currentParentId = node.parent_id;

  while (currentParentId) {
    const parentNode = await OrganizationNodes.findOne({
      where: {
        id: currentParentId,
        organization_id: organizationId,
        deleted_at: null,
      },
    });

    if (!parentNode) break;

    depth += 1;
    currentParentId = parentNode.parent_id;
  }

  return depth;
}

export async function getMyOrganization(req, res) {
  try {
    const membership = await OrganizationMembers.findOne({
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: Organization,
          as: 'organization',
          include: [
            {
              model: Status,
              as: 'status',
            },
          ],
        },
        {
          model: OrganizationRoles,
          as: 'organizationRole',
        },
        {
          model: Status,
          as: 'status',
        },
      ],
      order: [['created_at', 'DESC']],
    });

    if (!membership) {
      return res.status(200).json({
        ok: true,
        organization: null,
        membership: null,
        permissions: [],
      });
    }

    const permissions = Array.from(
      await getEffectiveOrganizationPermissionCodes(membership)
    ).sort();

    return res.status(200).json({
      ok: true,
      organization: buildOrganizationResponse(membership.organization),
      membership: buildMembershipResponse(membership),
      permissions,
    });
  } catch (error) {
    console.error('getMyOrganization error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener tu organización',
    });
  }
}

export async function getOrganizationNodes(req, res) {
  try {
    const { id } = req.params;

    const membership = await getMembership(req.user.id, id);

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const activeStatus = await Status.findOne({
      where: { code: 'active' },
    });

    const nodes = await OrganizationNodes.findAll({
      where: {
        organization_id: id,
        deleted_at: null,
        ...(activeStatus ? { status_id: activeStatus.id } : {}),
      },
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    return res.status(200).json({
      ok: true,
      nodes,
    });
  } catch (error) {
    console.error('getOrganizationNodes error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener carpetas',
    });
  }
}

export async function createOrganizationNode(req, res) {
  try {
    const { id } = req.params;
    const { name, parent_id = null } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre de la carpeta es obligatorio',
      });
    }

    const membership = await getMembership(req.user.id, id);

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const permissionCodes = await getEffectiveOrganizationPermissionCodes(membership);

    if (!canManageNodes(membership, permissionCodes)) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para crear carpetas',
      });
    }

    let newDepth = 1;

    if (parent_id) {
      const parentNode = await OrganizationNodes.findOne({
        where: {
          id: parent_id,
          organization_id: id,
          deleted_at: null,
        },
      });

      if (!parentNode) {
        return res.status(404).json({
          ok: false,
          message: 'La carpeta padre no existe',
        });
      }

      if (parentNode.contains_tournaments) {
        return res.status(400).json({
          ok: false,
          message: 'No podés crear subcarpetas dentro de una carpeta que ya contiene torneos',
        });
      }

      newDepth = (await getNodeDepth(parentNode, id)) + 1;
    }

    if (newDepth > 5) {
      return res.status(400).json({
        ok: false,
        message: 'Solo se permiten 5 niveles de carpetas',
      });
    }

    const activeStatus = await Status.findOne({
      where: { code: 'active' },
    });

    if (!activeStatus) {
      return res.status(500).json({
        ok: false,
        message: 'No existe el estado active',
      });
    }

    const node = await OrganizationNodes.create({
      organization_id: Number(id),
      parent_id: parent_id || null,
      name: name.trim(),
      node_type: 'folder',
      created_by_user_id: req.user.id,
      status_id: activeStatus.id,
      contains_tournaments: false,
    });

    return res.status(201).json({
      ok: true,
      message: 'Carpeta creada correctamente',
      node,
    });
  } catch (error) {
    console.error('createOrganizationNode error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al crear la carpeta',
    });
  }
}

export async function updateOrganizationNode(req, res) {
  try {
    const { nodeId } = req.params;
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre es obligatorio',
      });
    }

    const node = await OrganizationNodes.findOne({
      where: {
        id: nodeId,
        deleted_at: null,
      },
    });

    if (!node) {
      return res.status(404).json({
        ok: false,
        message: 'Carpeta no encontrada',
      });
    }

    const membership = await getMembership(req.user.id, node.organization_id);

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const permissionCodes = await getEffectiveOrganizationPermissionCodes(membership);

    if (!canManageNodes(membership, permissionCodes)) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para editar carpetas',
      });
    }

    await node.update({
      name: name.trim(),
    });

    return res.status(200).json({
      ok: true,
      message: 'Carpeta actualizada correctamente',
      node,
    });
  } catch (error) {
    console.error('updateOrganizationNode error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al actualizar la carpeta',
    });
  }
}

export async function softDeleteOrganizationNode(req, res) {
  try {
    const { nodeId } = req.params;
    const { current_password } = req.body;

    if (!current_password) {
      return res.status(400).json({
        ok: false,
        message: 'Debés ingresar tu contraseña',
      });
    }

    const node = await OrganizationNodes.findOne({
      where: {
        id: nodeId,
        deleted_at: null,
      },
    });

    if (!node) {
      return res.status(404).json({
        ok: false,
        message: 'Carpeta no encontrada',
      });
    }

    const membership = await getMembership(req.user.id, node.organization_id);

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const permissionCodes = await getEffectiveOrganizationPermissionCodes(membership);

    if (!canManageNodes(membership, permissionCodes)) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para eliminar carpetas',
      });
    }

    const user = await User.scope('withPassword').findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    const isValidPassword = await bcrypt.compare(
      current_password,
      user.password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({
        ok: false,
        message: 'La contraseña es incorrecta',
      });
    }

    const activeChildren = await OrganizationNodes.count({
      where: {
        parent_id: node.id,
        deleted_at: null,
      },
    });

    if (activeChildren > 0) {
      return res.status(400).json({
        ok: false,
        message: 'No podés eliminar una carpeta que todavía tiene subcarpetas',
      });
    }

    if (node.contains_tournaments) {
      return res.status(400).json({
        ok: false,
        message: 'No podés eliminar una carpeta que contiene torneos',
      });
    }

    const inactiveStatus = await Status.findOne({
      where: { code: 'inactive' },
    });

    await node.update({
      status_id: inactiveStatus ? inactiveStatus.id : node.status_id,
      deleted_at: new Date(),
      deleted_by_user_id: req.user.id,
    });

    return res.status(200).json({
      ok: true,
      message: 'Carpeta eliminada correctamente',
    });
  } catch (error) {
    console.error('softDeleteOrganizationNode error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al eliminar la carpeta',
    });
  }
}

export async function reorderOrganizationNodes(req, res) {
  try {
    const { dragged_node_id, target_node_id } = req.body;

    if (!dragged_node_id || !target_node_id) {
      return res.status(400).json({
        ok: false,
        message: 'Faltan nodos para reordenar',
      });
    }

    const draggedNode = await OrganizationNodes.findOne({
      where: {
        id: dragged_node_id,
        deleted_at: null,
      },
    });

    const targetNode = await OrganizationNodes.findOne({
      where: {
        id: target_node_id,
        deleted_at: null,
      },
    });

    if (!draggedNode || !targetNode) {
      return res.status(404).json({
        ok: false,
        message: 'Una de las carpetas no existe',
      });
    }

    if (draggedNode.organization_id !== targetNode.organization_id) {
      return res.status(400).json({
        ok: false,
        message: 'Las carpetas no pertenecen a la misma organización',
      });
    }

    if (draggedNode.parent_id !== targetNode.parent_id) {
      return res.status(400).json({
        ok: false,
        message: 'Solo podés reordenar carpetas del mismo nivel',
      });
    }

    const membership = await getMembership(req.user.id, draggedNode.organization_id);

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const permissionCodes = await getEffectiveOrganizationPermissionCodes(membership);

    if (!canManageNodes(membership, permissionCodes)) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para ordenar carpetas',
      });
    }

    const siblings = await OrganizationNodes.findAll({
      where: {
        organization_id: draggedNode.organization_id,
        parent_id: draggedNode.parent_id,
        deleted_at: null,
      },
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    const orderedIds = siblings.map((node) => node.id);
    const fromIndex = orderedIds.indexOf(draggedNode.id);

    if (fromIndex === -1) {
      return res.status(400).json({
        ok: false,
        message: 'No se pudo calcular el origen del movimiento',
      });
    }

    orderedIds.splice(fromIndex, 1);

    const targetIndexAfterRemoval = orderedIds.indexOf(targetNode.id);

    if (targetIndexAfterRemoval === -1) {
      return res.status(400).json({
        ok: false,
        message: 'No se pudo calcular el destino del movimiento',
      });
    }

    orderedIds.splice(targetIndexAfterRemoval + 1, 0, draggedNode.id);

    for (let i = 0; i < orderedIds.length; i += 1) {
      await OrganizationNodes.update(
        { sort_order: i + 1 },
        { where: { id: orderedIds[i] } }
      );
    }

    return res.status(200).json({
      ok: true,
      message: 'Orden actualizado correctamente',
    });
  } catch (error) {
    console.error('reorderOrganizationNodes error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al reordenar carpetas',
    });
  }
}

export async function updateOrganizationLogo(req, res) {
  try {
    const { id } = req.params;

    const membership = await getMembership(req.user.id, id);

    if (!membership) {
      return res.status(403).json({
        ok: false,
        message: 'No pertenecés a esta organización',
      });
    }

    const permissionCodes = await getEffectiveOrganizationPermissionCodes(membership);

    if (!canManageNodes(membership, permissionCodes)) {
      return res.status(403).json({
        ok: false,
        message: 'No tenés permisos para actualizar el logo',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: 'Debés subir una imagen',
      });
    }

    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({
        ok: false,
        message: 'Organización no encontrada',
      });
    }

    if (organization.logo_url) {
      const previousFilename = organization.logo_url.split('/').pop();
      const previousPath = path.join(
        __dirname,
        '../../../uploads/organization-logos',
        previousFilename
      );

      if (fs.existsSync(previousPath)) {
        fs.unlinkSync(previousPath);
      }
    }

    const logoUrl = buildPublicLogoUrl(req.file.filename);

    await organization.update({
      logo_url: logoUrl,
    });

    return res.status(200).json({
      ok: true,
      message: 'Logo actualizado correctamente',
      logo_url: logoUrl,
    });
  } catch (error) {
    console.error('updateOrganizationLogo error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al actualizar el logo',
    });
  }
}