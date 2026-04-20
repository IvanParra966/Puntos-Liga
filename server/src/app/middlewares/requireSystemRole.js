export function requireSystemRole(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          ok: false,
          message: 'No autenticado',
        });
      }

      const userRole = req.user.role;

      if (!userRole) {
        return res.status(403).json({
          ok: false,
          message: 'Tu usuario no tiene un rol válido',
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          ok: false,
          message: 'No tenés permisos para realizar esta acción',
        });
      }

      next();
    } catch (error) {
      console.error('requireSystemRole error:', error);
      return res.status(500).json({
        ok: false,
        message: 'Error interno al validar rol del sistema',
      });
    }
  };
}