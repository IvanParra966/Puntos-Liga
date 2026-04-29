import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const TournamentPairingSystems = sequelize.define(
  'TournamentPairingSystems',
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
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'tournament_pairing_systems',
    timestamps: true,
    underscored: true,
  }
);

TournamentPairingSystems.afterSync(async () => {
  const items = [
    {
      code: 'swiss',
      name: 'Rondas suizas',
      description: 'Emparejamientos por sistema suizo',
    },
    {
      code: 'single_elimination',
      name: 'Eliminación individual',
      description: 'Bracket de eliminación simple',
    },
  ];

  for (const item of items) {
    await TournamentPairingSystems.findOrCreate({
      where: { code: item.code },
      defaults: item,
    });
  }
});