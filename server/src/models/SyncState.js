import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const SyncState = sequelize.define('SyncState', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    syncKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'idle',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    tableName: 'sync_states',
  });
