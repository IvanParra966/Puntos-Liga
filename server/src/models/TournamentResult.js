import { DataTypes } from 'sequelize';

export const defineTournamentResult = (sequelize) => {
  const TournamentResult = sequelize.define('TournamentResult', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    placing: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    wins: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    losses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ties: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    matchesPlayed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pointsAwarded: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    droppedAtRound: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deckName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'tournament_results',
    indexes: [
      {
        unique: true,
        fields: ['tournament_id', 'player_id'],
      },
    ],
  });

  return TournamentResult;
};
