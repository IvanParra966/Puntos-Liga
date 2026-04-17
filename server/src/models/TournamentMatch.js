import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const TournamentMatch = sequelize.define(
    'TournamentMatch',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tournamentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      seasonId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      round: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      phase: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tableNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      matchLabel: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      player1LimitlessId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      player2LimitlessId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      winnerLimitlessId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resultType: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'decided',
      },
    },
    {
      tableName: 'tournament_matches',
    }
  );