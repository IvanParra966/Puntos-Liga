import {
  OrganizationRequest,
  Organization,
  Status,
} from '../../database/models/index.js';

export async function createOrganizationRequest(req, res) {
  try {
    const { request_type, organization_id, organization_name_requested, message } = req.body;

    if (!request_type) {
      return res.status(400).json({
        ok: false,
        message: 'El tipo de solicitud es obligatorio',
      });
    }

    if (
      request_type !== 'create_organization' &&
      request_type !== 'become_organizer'
    ) {
      return res.status(400).json({
        ok: false,
        message: 'Tipo de solicitud inválido',
      });
    }

    if (
      request_type === 'create_organization' &&
      !organization_name_requested?.trim()
    ) {
      return res.status(400).json({
        ok: false,
        message: 'Debés indicar el nombre de la organización',
      });
    }

    if (
      request_type === 'become_organizer' &&
      !organization_id
    ) {
      return res.status(400).json({
        ok: false,
        message: 'Debés indicar la organización',
      });
    }

    if (request_type === 'become_organizer') {
      const organization = await Organization.findByPk(organization_id);

      if (!organization) {
        return res.status(404).json({
          ok: false,
          message: 'La organización no existe',
        });
      }
    }

    const pendingStatus = await Status.findOne({
      where: { code: 'pending' },
    });

    if (!pendingStatus) {
      return res.status(500).json({
        ok: false,
        message: 'No existe el estado pending en la base de datos',
      });
    }

    const newRequest = await OrganizationRequest.create({
      user_id: req.user.id,
      request_type,
      organization_id: request_type === 'become_organizer' ? organization_id : null,
      organization_name_requested:
        request_type === 'create_organization'
          ? organization_name_requested.trim()
          : null,
      message: message?.trim() || null,
      status_id: pendingStatus.id,
    });

    return res.status(201).json({
      ok: true,
      message: 'Solicitud creada correctamente',
      request: newRequest,
    });
  } catch (error) {
    console.error('createOrganizationRequest error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al crear la solicitud',
    });
  }
}

export async function getMyOrganizationRequests(req, res) {
  try {
    const requests = await OrganizationRequest.findAll({
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: Organization,
          as: 'organization',
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
    console.error('getMyOrganizationRequests error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener tus solicitudes',
    });
  }
}