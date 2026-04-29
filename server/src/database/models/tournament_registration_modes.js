import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const TournamentRegistrationModes = sequelize.define(
  'TournamentRegistrationModes',
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
    tableName: 'tournament_registration_modes',
    timestamps: true,
    underscored: true,
  }
);

TournamentRegistrationModes.afterSync(async () => {
  const items = [
    {
      code: 'open',
      name: 'Registro abierto',
      description: 'Cualquiera puede registrarse',
    },
    {
      code: 'shared_code',
      name: 'Registro por código',
      description: 'Se requiere un código general del torneo',
    },
    {
      code: 'single_use_code',
      name: 'Código de un solo uso',
      description: 'Cada código sirve una sola vez',
    },
  ];

  for (const item of items) {
    await TournamentRegistrationModes.findOrCreate({
      where: { code: item.code },
      defaults: item,
    });
  }
});