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
    const { first_name, last_name, country_id, in_game_name } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    let fullName = [first_name?.trim(), last_name?.trim()].filter(Boolean).join(' ').trim();

    if (!fullName) {
      fullName = user.name;
    }

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
      name: fullName,
      username: in_game_name?.trim() || user.username,
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