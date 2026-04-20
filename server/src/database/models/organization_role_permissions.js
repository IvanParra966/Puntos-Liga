import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const OrganizationRolePermissions = sequelize.define(
  'OrganizationRolePermissions',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    organization_role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'organization_role_permissions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'uq_org_role_perm',
        unique: true,
        fields: ['organization_role_id', 'permission_id'],
      },
    ],
  }
);