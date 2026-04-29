import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const TournamentRoundRules = sequelize.define(
  'TournamentRoundRules',
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
    min_players: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_players: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rounds_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: 'tournament_round_rules',
    timestamps: true,
    underscored: true,
  }
);