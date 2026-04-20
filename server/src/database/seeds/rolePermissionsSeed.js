export const rolePermissionsSeed = {
  system_owner: ['*'],

  platform_admin: [
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'organization_requests.review',
    'organizations.view',
    'organizations.create',
    'organizations.update',
    'points.manage_global',
    'rankings.view',
  ],

  support_admin: [
    'users.view',
    'organization_requests.review',
    'organizations.view',
    'tournaments.view',
    'rankings.view',
  ],

  player: [
    'organization_requests.create',
    'organizations.view',
    'tournaments.view',
    'registrations.create',
    'decklists.submit',
    'standings.view',
    'rankings.view',
  ],
};