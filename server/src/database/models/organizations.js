import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const Organization = sequelize.define(
  'Organization',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 120],
      },
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
  },
  {
    tableName: 'organization',
    timestamps: true,
    underscored: true,
  }
);