import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const TournamentAccessCodes = sequelize.define(
  'TournamentAccessCodes',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tournament_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    code_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'single_use',
    },
    max_uses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    used_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'tournament_access_codes',
    timestamps: true,
    underscored: true,
  }
);