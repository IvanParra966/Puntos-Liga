import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const Season = sequelize.define(
  'Season',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seasonNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    startsAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endsAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    isActiveManual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'seasons',
  }
);