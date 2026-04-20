import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const Permission = sequelize.define(
  'Permission',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    scope: {
      type: DataTypes.ENUM('global', 'organization', 'tournament', 'points', 'admin'),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'permissions',
    timestamps: true,
    underscored: true,
  }
);