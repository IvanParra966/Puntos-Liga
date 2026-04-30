import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const TournamentDecklists = sequelize.define(
  'TournamentDecklists',
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

    tournament_registration_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    deck_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    input_format: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'text',
    },

    raw_text: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },

    raw_tts: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },

    parsed_cards_json: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },

    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'tournament_decklists',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['tournament_id', 'user_id'],
      },
      {
        unique: true,
        fields: ['tournament_registration_id'],
      },
    ],
  }
);