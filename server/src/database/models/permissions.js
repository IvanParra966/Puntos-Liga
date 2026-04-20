import { DataTypes } from 'sequelize';
import { sequelize } from '../../app/config/database.js';

export const Permission = sequelize.define(
  'Permission',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    scope: {
      type: DataTypes.ENUM('global', 'organization', 'tournament', 'points', 'admin'),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'permissions',
    timestamps: true,
    underscored: true,
  }
);

Permission.afterSync(async () => {
  const initialPermissions = [
    {
      code: 'users.view',
      name: 'Ver usuarios',
      scope: 'global',
      category: 'users',
      description: 'Puede ver usuarios del sistema',
    },
    {
      code: 'users.create',
      name: 'Crear usuarios',
      scope: 'global',
      category: 'users',
      description: 'Puede crear usuarios',
    },
    {
      code: 'users.update',
      name: 'Editar usuarios',
      scope: 'global',
      category: 'users',
      description: 'Puede editar usuarios',
    },
    {
      code: 'users.delete',
      name: 'Eliminar usuarios',
      scope: 'global',
      category: 'users',
      description: 'Puede eliminar usuarios',
    },
    {
      code: 'organizations.view',
      name: 'Ver organizaciones',
      scope: 'organization',
      category: 'organizations',
      description: 'Puede ver organizaciones',
    },
    {
      code: 'organization.members.manage',
      name: 'Gestionar miembros',
      scope: 'organization',
      category: 'organizations',
      description: 'Puede administrar miembros de una organización',
    },
    {
      code: 'organization.permissions.manage',
      name: 'Gestionar permisos de organización',
      scope: 'organization',
      category: 'organizations',
      description: 'Puede asignar roles y permisos dentro de la organización',
    },
    {
      code: 'tournaments.create',
      name: 'Crear torneos',
      scope: 'tournament',
      category: 'tournaments',
      description: 'Puede crear torneos',
    },
    {
      code: 'tournaments.edit_any',
      name: 'Editar cualquier torneo de la organización',
      scope: 'tournament',
      category: 'tournaments',
      description: 'Puede editar torneos de la organización',
    },
    {
      code: 'tournaments.publish',
      name: 'Publicar torneos',
      scope: 'tournament',
      category: 'tournaments',
      description: 'Puede publicar torneos',
    },
    {
      code: 'registrations.manage',
      name: 'Gestionar inscripciones',
      scope: 'tournament',
      category: 'tournaments',
      description: 'Puede gestionar inscripciones',
    },
    {
      code: 'rounds.manage',
      name: 'Gestionar rondas',
      scope: 'tournament',
      category: 'tournaments',
      description: 'Puede generar y administrar rondas',
    },
    {
      code: 'matches.report',
      name: 'Cargar resultados',
      scope: 'tournament',
      category: 'tournaments',
      description: 'Puede cargar resultados de partidas',
    },
    {
      code: 'points.manage_org',
      name: 'Gestionar puntos de organización',
      scope: 'points',
      category: 'points',
      description: 'Puede modificar puntos dentro de la organización',
    },
    {
      code: 'points.manage_global',
      name: 'Gestionar puntos globales',
      scope: 'points',
      category: 'points',
      description: 'Puede modificar el sistema global de puntos',
    },
  ];

  for (const permissionData of initialPermissions) {
    try {
      await Permission.findOrCreate({
        where: { code: permissionData.code },
        defaults: permissionData,
      });
    } catch (error) {
      console.error('Error seeding permissions:', error);
    }
  }
});