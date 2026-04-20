import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const Countries = sequelize.define(
  'Countries',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'countries',
    timestamps: true,
    underscored: true,
  }
);