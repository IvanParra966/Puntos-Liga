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
  },
  {
    tableName: 'organization_roles',
    timestamps: true,
    underscored: true,
  }
);

OrganizationRoles.afterSync(async () => {
  const initialRoles = [
    { code: 'owner', name: 'Dueño' },
    { code: 'organizer', name: 'Organizador' },
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