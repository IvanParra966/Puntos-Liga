import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const TournamentPointStructures = sequelize.define(
  'TournamentPointStructures',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    win_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    draw_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    loss_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    allow_draws: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'tournament_point_structures',
    timestamps: true,
    underscored: true,
  }
);

TournamentPointStructures.afterSync(async () => {
  const items = [
    {
      code: 'standard_3_1_0',
      name: '3 por victoria, 1 por empate, 0 por derrota',
      win_points: 3,
      draw_points: 1,
      loss_points: 0,
      allow_draws: true,
    },
    {
      code: 'no_draws_1_0',
      name: 'Sin empates, 1 por victoria, 0 por derrota',
      win_points: 1,
      draw_points: 0,
      loss_points: 0,
      allow_draws: false,
    },
  ];

  for (const item of items) {
    await TournamentPointStructures.findOrCreate({
      where: { code: item.code },
      defaults: item,
    });
  }
});