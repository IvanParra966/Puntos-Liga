import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const Roles = sequelize.define(
  'Roles',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'roles',
    timestamps: true,
    underscored: true,
  }
);

Roles.afterSync(async () => {
  const initialRoles = [
    { code: 'system_owner', name: 'Dueño del sistema', description: 'Dueño del sistema' },
    { code: 'platform_admin', name: 'Administrador de la plataforma', description: 'Administrador de la plataforma' },
    { code: 'support_admin', name: 'Administrador de soporte', description: 'Administrador de soporte' },
    { code: 'player', name: 'Jugador', description: 'Jugador del sistema' },
  ];

  for (const roleData of initialRoles) {
    try {
      await Roles.findOrCreate({
        where: { code: roleData.code },
        defaults: roleData,
      });
    } catch (error) {
      console.error('Error seeding roles:', error);
    }
  }
});