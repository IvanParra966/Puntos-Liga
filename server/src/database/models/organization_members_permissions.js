import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const OrganizationMembersPermissions = sequelize.define(
  'OrganizationMembersPermissions',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    organization_member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: 'organization_members_permissions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'uq_org_member_perm',
        unique: true,
        fields: ['organization_member_id', 'permission_id'],
      },
    ],
  }
);