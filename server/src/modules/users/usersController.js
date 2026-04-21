import bcrypt from 'bcryptjs';
import { User, Roles, Status, Countries } from '../../database/models/index.js';

function buildUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role_id: user.role_id,
    status_id: user.status_id,
    country_id: user.country_id,
    role: user.role ? user.role.code : null,
    status: user.status ? user.status.code : null,
    country: user.country
      ? {
          id: user.country.id,
          code: user.country.code,
          name: user.country.name,
        }
      : null,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

export async function updateMyProfile(req, res) {
  try {
    const { first_name, last_name, country_id } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    const fullName = [first_name?.trim(), last_name?.trim()]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (country_id) {
      const country = await Countries.findByPk(country_id);

      if (!country) {
        return res.status(404).json({
          ok: false,
          message: 'País no válido',
        });
      }
    }

    await user.update({
      name: fullName || user.name,
      country_id: country_id || null,
    });

    const updatedUser = await User.findByPk(user.id, {
      include: [
        { model: Roles, as: 'role' },
        { model: Status, as: 'status' },
        { model: Countries, as: 'country' },
      ],
    });

    return res.status(200).json({
      ok: true,
      message: 'Perfil actualizado correctamente',
      user: buildUserResponse(updatedUser),
    });
  } catch (error) {
    console.error('updateMyProfile error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al actualizar perfil',
    });
  }
}

export async function updateMyPassword(req, res) {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos son obligatorios',
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        ok: false,
        message: 'La confirmación no coincide con la nueva contraseña',
      });
    }

    if (current_password === new_password) {
      return res.status(400).json({
        ok: false,
        message: 'La nueva contraseña no puede ser igual a la actual',
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
        message: 'La contraseña actual es incorrecta',
      });
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);

    await user.update({
      password_hash: newPasswordHash,
    });

    return res.status(200).json({
      ok: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    console.error('updateMyPassword error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno al actualizar la contraseña',
    });
  }
}