import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const OrganizationRoles = sequelize.define(
  'OrganizationRoles',
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
    tableName: 'organization_roles',
    timestamps: true,
    underscored: true,
  }
);

OrganizationRoles.afterSync(async () => {
  const initialRoles = [
    { code: 'owner', name: 'Dueño', description: 'Dueño de la organización' },
    { code: 'organization_admin', name: 'Administrador de la organización', description: 'Administrador de la organización' },
    { code: 'tournament_manager', name: 'Manager de torneos', description: 'Manager de torneos' },
    { code: 'tournament_staff', name: 'Staff de torneos', description: 'Staff de torneos' },
    { code: 'viewer', name: 'Espectador', description: 'Espectador de la organización' },
  ];

  for (const roleData of initialRoles) {
    try {
      await OrganizationRoles.findOrCreate({
        where: { code: roleData.code },
        defaults: roleData,
      });
    } catch (error) {
      console.error('Error seeding organization roles:', error);
    }
  }
});