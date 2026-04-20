import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User, Roles, Status } from '../../database/models/index.js';

const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role_id: user.role_id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const buildUserResponse = (user) => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role_id: user.role_id,
    status_id: user.status_id,
    role: user.role ? user.role.code : null,
    status: user.status ? user.status.code : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const register = async (req, res) => {
  try {
    const { username, name, email, password, confirmPassword } = req.body;

    if (!username || !name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos son obligatorios',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        ok: false,
        message: 'Las contraseñas no coinciden',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: normalizedEmail },
          { username: normalizedUsername },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: 'El email o el username ya están en uso',
      });
    }

    const playerRole = await Roles.findOne({
      where: { code: 'player' },
    });


    const activeStatus = await Status.findOne({
      where: { code: 'active' },
    });

    if (!playerRole || !activeStatus) {
      return res.status(500).json({
        ok: false,
        message: 'Faltan roles o estados base en la base de datos',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: normalizedUsername,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role_id: playerRole.id,
      status_id: activeStatus.id,
    });


    const createdUser = await User.findByPk(user.id, {
      include: [
        { model: Roles, as: 'role' },
        { model: Status, as: 'status' },
      ],
    });

    const token = signToken(createdUser);

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente',
      token,
      user: buildUserResponse(createdUser),
    });
  } catch (error) {
    console.error('register error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al registrar usuario',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Ingresá usuario/email y contraseña',
      });
    }

    const value = identifier.trim();

    const user = await User.scope('withPassword').findOne({
      where: {
        [Op.or]: [
          { email: value.toLowerCase() },
          { username: value },
        ],
      },
      include: [
        { model: Roles, as: 'role' },
        { model: Status, as: 'status' },
      ],
    });

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas',
      });
    }

    if (user.status?.code !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Tu usuario no está activo',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas',
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      ok: true,
      message: 'Login correcto',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al iniciar sesión',
    });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Roles, as: 'role' },
        { model: Status, as: 'status' },
      ],
    });

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    return res.status(200).json({
      ok: true,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error('me error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener usuario',
    });
  }
};