import { DataTypes } from 'sequelize';

export const defineTournament = (sequelize) => {
  const Tournament = sequelize.define(
    'Tournament',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      limitlessTournamentId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      organizerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      game: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      format: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shortName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      playersCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      keywordTag: {
        type: DataTypes.STRING(128),
        allowNull: false,
        defaultValue: 'CATAMARCA',
      },
      seasonId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      seasonKey: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
      seasonYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      seasonNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'tournaments',
    }
  );

  return Tournament;
};