import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const RolePermissions = sequelize.define(
  'RolePermissions',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'role_permissions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'uq_role_perm',
        unique: true,
        fields: ['role_id', 'permission_id'],
      },
    ],
  }
);