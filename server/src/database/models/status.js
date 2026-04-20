import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const Status = sequelize.define(
  'Status',
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
  },
  {
    tableName: 'status',
    timestamps: true,
    underscored: true,
  }
);

Status.afterSync(async () => {
  const initialStatus = [
    { code: 'active', name: 'Activo' },
    { code: 'inactive', name: 'Inactivo' },
    { code: 'approved', name: 'Aprobado' },
    { code: 'pending', name: 'Pendiente' },
    { code: 'rejected', name: 'Rechazado' },
    { code: 'blocked', name: 'Bloqueado' },
    { code: 'suspended', name: 'Suspendido' },
    { code: 'unverified', name: 'No verificado' },
    { code: 'verified', name: 'Verificado' },
  ];

  for (const statusData of initialStatus) {
    try {
      await Status.findOrCreate({
        where: { code: statusData.code },
        defaults: statusData,
      });
    } catch (error) {
      console.error('Error seeding status:', error);
    }
  }
});