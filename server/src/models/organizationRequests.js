import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const OrganizationRequest = sequelize.define(
  'OrganizationRequest',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requestType: {
      type: DataTypes.ENUM('create_organization', 'become_organizer'),
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    organizationNameRequested: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    reviewedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'OrganizationRequest',
    timestamps: true,
    underscored: true,
  }
);