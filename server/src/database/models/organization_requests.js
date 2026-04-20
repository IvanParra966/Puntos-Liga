import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const OrganizationRequest = sequelize.define(
  'OrganizationRequests',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    request_type: {
      type: DataTypes.ENUM('create_organization', 'become_organizer'),
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    organization_name_requested: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    reviewed_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'organization_requests',
    timestamps: true,
    underscored: true,
  }
);