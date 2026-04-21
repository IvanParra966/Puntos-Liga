import {
  OrganizationRequest,
  Organization,
  OrganizationMembers,
  OrganizationRoles,
  Status,
  User,
} from '../../database/models/index.js';

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getStatusByCode(code) {
  return Status.findOne({ where: { code } });
}

export async function getPendingOrganizationRequests(req, res) {
  try {
    const pendingStatus = await getStatusByCode('pending');

    if (!pendingStatus) {
      return res.status(500).json({
        ok: false,
        message: 'No existe el estado pending',
      });
    }

    const requests = await OrganizationRequest.findAll({
      where: {
        status_id: pendingStatus.id,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'name', 'email'],
        },
        {
          model: Status,
          as: 'status',
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      ok: true,
      requests,
    });
  } catch (error) {
    console.error('getPendingOrganizationRequests error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener solicitudes pendientes',
    });
  }
}

export async function approveOrganizationRequest(req, res) {
  try {
    const { id } = req.params;
    const { organization_role_code } = req.body;

    const approvedStatus = await getStatusByCode('approved');
    const pendingStatus = await getStatusByCode('pending');

    if (!approvedStatus || !pendingStatus) {
      return res.status(500).json({
        ok: false,
        message: 'Faltan estados base del sistema',
      });
    }

    const request = await OrganizationRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!request) {
      return res.status(404).json({
        ok: false,
        message: 'Solicitud no encontrada',
      });
    }

    if (request.status_id !== pendingStatus.id) {
      return res.status(400).json({
        ok: false,
        message: 'La solicitud ya fue procesada',
      });
    }

    if (request.request_type !== 'become_organizer') {
      return res.status(400).json({
        ok: false,
        message: 'Tipo de solicitud no soportado',
      });
    }

    if (!request.organization_name_requested?.trim()) {
      return res.status(400).json({
        ok: false,
        message: 'La solicitud no tiene nombre de organización',
      });
    }

    const baseSlug = slugify(request.organization_name_requested);
    let finalSlug = baseSlug;
    let counter = 1;

    while (await Organization.findOne({ where: { slug: finalSlug } })) {
      counter += 1;
      finalSlug = `${baseSlug}-${counter}`;
    }

    const newOrganization = await Organization.create({
      name: request.organization_name_requested,
      slug: finalSlug,
      description: request.message || null,
      created_by_user_id: request.user_id,
      status_id: approvedStatus.id,
    });

    const targetRoleCode = organization_role_code || 'owner';

    const organizationRole = await OrganizationRoles.findOne({
      where: { code: targetRoleCode },
    });

    if (!organizationRole) {
      return res.status(404).json({
        ok: false,
        message: 'El rol organizacional indicado no existe',
      });
    }

    await OrganizationMembers.create({
      organization_id: newOrganization.id,
      user_id: request.user_id,
      organization_role_id: organizationRole.id,
      status_id: approvedStatus.id,
      approved_by_user_id: req.user.id,
      approved_at: new Date(),
    });

    await request.update({
      organization_id: newOrganization.id,
      status_id: approvedStatus.id,
      reviewed_by_user_id: req.user.id,
      reviewed_at: new Date(),
    });

    return res.status(200).json({
      ok: true,
      message: 'Solicitud aprobada correctamente',
      organization: newOrganization,
    });
  } catch (error) {
    console.error('approveOrganizationRequest error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al aprobar la solicitud',
    });
  }
}

export async function rejectOrganizationRequest(req, res) {
  try {
    const { id } = req.params;

    const rejectedStatus = await getStatusByCode('rejected');
    const pendingStatus = await getStatusByCode('pending');

    if (!rejectedStatus || !pendingStatus) {
      return res.status(500).json({
        ok: false,
        message: 'Faltan estados base del sistema',
      });
    }

    const request = await OrganizationRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({
        ok: false,
        message: 'Solicitud no encontrada',
      });
    }

    if (request.status_id !== pendingStatus.id) {
      return res.status(400).json({
        ok: false,
        message: 'La solicitud ya fue procesada',
      });
    }

    await request.update({
      status_id: rejectedStatus.id,
      reviewed_by_user_id: req.user.id,
      reviewed_at: new Date(),
    });

    return res.status(200).json({
      ok: true,
      message: 'Solicitud rechazada correctamente',
    });
  } catch (error) {
    console.error('rejectOrganizationRequest error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al rechazar la solicitud',
    });
  }
}