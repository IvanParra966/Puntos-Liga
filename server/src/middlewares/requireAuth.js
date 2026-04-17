import jwt from 'jsonwebtoken';
import { User, Roles, Status } from '../models/index.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        message: 'No autorizado',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Roles, as: 'role' },
        { model: Status, as: 'status' },
      ],
    });

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Token inválido',
      });
    }

    if (user.status?.code !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Usuario inactivo o bloqueado',
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      statusId: user.statusId,
      role: user.role?.code || null,
      status: user.status?.code || null,
    };

    next();
  } catch (error) {
    console.error('requireAuth error:', error);

    return res.status(401).json({
      ok: false,
      message: 'Token inválido o vencido',
    });
  }
};