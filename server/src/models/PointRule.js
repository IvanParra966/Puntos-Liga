import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const PointRule = sequelize.define('PointRule', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    label: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: 'Regla de puntaje',
    },
    minPlayers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    placingFrom: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    placingTo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'point_rules',
  });
