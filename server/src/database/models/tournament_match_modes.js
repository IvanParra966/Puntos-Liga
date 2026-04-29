import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const TournamentMatchModes = sequelize.define(
  'TournamentMatchModes',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    games_to_win: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_games: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'tournament_match_modes',
    timestamps: true,
    underscored: true,
  }
);

TournamentMatchModes.afterSync(async () => {
  const items = [
    {
      code: 'bo1',
      name: 'Al mejor de 1',
      games_to_win: 1,
      max_games: 1,
    },
    {
      code: 'bo3',
      name: 'Al mejor de 3',
      games_to_win: 2,
      max_games: 3,
    },
    {
      code: 'bo5',
      name: 'Al mejor de 5',
      games_to_win: 3,
      max_games: 5,
    },
  ];

  for (const item of items) {
    await TournamentMatchModes.findOrCreate({
      where: { code: item.code },
      defaults: item,
    });
  }
});