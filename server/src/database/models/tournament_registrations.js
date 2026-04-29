import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const TournamentRegistrations = sequelize.define(
  'TournamentRegistrations',
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    first_name_snapshot: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name_snapshot: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    display_name_snapshot: {
      type: DataTypes.STRING(220),
      allowNull: false,
    },

    registration_status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'registered',
    },
    registration_source: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'open',
    },
    registration_code_used: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: 'tournament_registrations',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['tournament_id', 'user_id'],
      },
    ],
  }
);