import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const TournamentFormats = sequelize.define(
  'TournamentFormats',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'tournament_formats',
    timestamps: true,
    underscored: true,
  }
);

TournamentFormats.afterSync(async () => {
  const items = [
    {
      code: 'standard',
      name: 'Standard',
      description: 'Formato estándar',
    },
  ];

  for (const item of items) {
    await TournamentFormats.findOrCreate({
      where: { code: item.code },
      defaults: item,
    });
  }
});