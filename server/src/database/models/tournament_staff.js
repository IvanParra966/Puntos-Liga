import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const TournamentStaff = sequelize.define(
  'TournamentStaff',
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
    organization_member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role_label: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    can_manage_registrations: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    can_manage_decklists: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    can_manage_pairings: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    can_submit_results: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    can_edit_tournament: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'tournament_staff',
    timestamps: true,
    underscored: true,
  }
);