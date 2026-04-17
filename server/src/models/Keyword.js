import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Keyword = sequelize.define(
    'Keyword',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      reminderText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interruptive: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      area: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      debut: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      colors: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      summary: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      tips: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      comparisons: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      funFact: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'keywords',
    }
  );