export const globalRolesSeed = [
  {
    code: 'system_owner',
    name: 'Dueño del sistema',
    description: 'Control total de la plataforma',
  },
  {
    code: 'platform_admin',
    name: 'Administrador de plataforma',
    description: 'Admin fuerte con acceso amplio',
  },
  {
    code: 'support_admin',
    name: 'Administrador de soporte',
    description: 'Admin de apoyo con permisos limitados',
  },
  {
    code: 'player',
    name: 'Jugador',
    description: 'Usuario común del sistema',
  },
];

export const organizationRolesSeed = [
  {
    code: 'owner',
    name: 'Dueño',
    description: 'Control total de la organización',
  },
  {
    code: 'organization_admin',
    name: 'Administrador de organización',
    description: 'Administra miembros y torneos de la organización',
  },
  {
    code: 'tournament_manager',
    name: 'Manager de torneos',
    description: 'Crea y administra torneos',
  },
  {
    code: 'tournament_staff',
    name: 'Staff de torneos',
    description: 'Opera tareas de torneo',
  },
  {
    code: 'viewer',
    name: 'Visualizador',
    description: 'Solo lectura',
  },
];

export const permissionsSeed = [
  // users / admin
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
    code: 'admins.manage',
    name: 'Gestionar administradores',
    scope: 'admin',
    category: 'admin',
    description: 'Puede gestionar roles administrativos globales',
  },

  // organization requests
  {
    code: 'organization_requests.create',
    name: 'Crear solicitudes de organización',
    scope: 'organization',
    category: 'organizations',
    description: 'Puede solicitar crear organización o pedir permisos',
  },
  {
    code: 'organization_requests.review',
    name: 'Revisar solicitudes de organización',
    scope: 'admin',
    category: 'organizations',
    description: 'Puede aprobar o rechazar solicitudes',
  },

  // organizations
  {
    code: 'organizations.view',
    name: 'Ver organizaciones',
    scope: 'organization',
    category: 'organizations',
    description: 'Puede ver organizaciones',
  },
  {
    code: 'organizations.create',
    name: 'Crear organizaciones',
    scope: 'organization',
    category: 'organizations',
    description: 'Puede crear organizaciones',
  },
  {
    code: 'organizations.update',
    name: 'Editar organizaciones',
    scope: 'organization',
    category: 'organizations',
    description: 'Puede editar datos de organizaciones',
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

  // tournaments
  {
    code: 'tournaments.view',
    name: 'Ver torneos',
    scope: 'tournament',
    category: 'tournaments',
    description: 'Puede ver torneos',
  },
  {
    code: 'tournaments.create',
    name: 'Crear torneos',
    scope: 'tournament',
    category: 'tournaments',
    description: 'Puede crear torneos',
  },
  {
    code: 'tournaments.edit_own',
    name: 'Editar torneos propios',
    scope: 'tournament',
    category: 'tournaments',
    description: 'Puede editar torneos creados por él',
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
    code: 'tournaments.delete',
    name: 'Eliminar torneos',
    scope: 'tournament',
    category: 'tournaments',
    description: 'Puede eliminar torneos',
  },

  // tournament operation
  {
    code: 'registrations.create',
    name: 'Inscribirse a torneos',
    scope: 'tournament',
    category: 'registrations',
    description: 'Puede inscribirse a torneos',
  },
  {
    code: 'registrations.manage',
    name: 'Gestionar inscripciones',
    scope: 'tournament',
    category: 'registrations',
    description: 'Puede gestionar inscripciones',
  },
  {
    code: 'checkin.manage',
    name: 'Gestionar check-in',
    scope: 'tournament',
    category: 'operations',
    description: 'Puede administrar check-in',
  },
  {
    code: 'rounds.manage',
    name: 'Gestionar rondas',
    scope: 'tournament',
    category: 'operations',
    description: 'Puede generar y administrar rondas',
  },
  {
    code: 'matches.report',
    name: 'Cargar resultados',
    scope: 'tournament',
    category: 'operations',
    description: 'Puede cargar resultados de partidas',
  },
  {
    code: 'standings.view',
    name: 'Ver standings',
    scope: 'tournament',
    category: 'operations',
    description: 'Puede ver standings',
  },

  // decklists
  {
    code: 'decklists.submit',
    name: 'Subir decklist',
    scope: 'tournament',
    category: 'decklists',
    description: 'Puede subir decklists',
  },
  {
    code: 'decklists.view_private',
    name: 'Ver decklists privadas',
    scope: 'tournament',
    category: 'decklists',
    description: 'Puede ver decklists privadas durante el torneo',
  },

  // points
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
  {
    code: 'rankings.view',
    name: 'Ver rankings',
    scope: 'points',
    category: 'points',
    description: 'Puede ver rankings',
  },
];