import { hasPermission } from '../../shared/utils/permissionResolver.js';

export function requirePermission(permissionCode, getOrganizationId = null) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          ok: false,
          message: 'No autenticado',
        });
      }

      let organizationId = null;

      if (typeof getOrganizationId === 'function') {
        organizationId = getOrganizationId(req);
      }

      const allowed = await hasPermission(
        req.user.id,
        permissionCode,
        organizationId
      );

      if (!allowed) {
        return res.status(403).json({
          ok: false,
          message: 'No tenés permisos para realizar esta acción',
        });
      }

      next();
    } catch (error) {
      console.error('requirePermission error:', error);
      return res.status(500).json({
        ok: false,
        message: 'Error interno al validar permisos',
      });
    }
  };
}