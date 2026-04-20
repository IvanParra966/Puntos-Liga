import {
  Roles,
  Permission,
  OrganizationRoles,
  RolePermissions,
  OrganizationRolePermissions,
} from '../models/index.js';

import {
  globalRolesSeed,
  organizationRolesSeed,
  permissionsSeed,
} from './catalogsSeed.js';

import { rolePermissionsSeed } from './rolePermissionsSeed.js';
import { organizationRolePermissionsSeed } from './organizationRolePermissionsSeed.js';

async function seedCatalog(model, items, key = 'code') {
  for (const item of items) {
    await model.findOrCreate({
      where: { [key]: item[key] },
      defaults: item,
    });
  }
}

async function seedRolePermissions() {
  const allPermissions = await Permission.findAll();
  const allRoles = await Roles.findAll();

  const permissionMap = new Map(allPermissions.map((p) => [p.code, p.id]));
  const roleMap = new Map(allRoles.map((r) => [r.code, r.id]));

  for (const [roleCode, permissionCodes] of Object.entries(rolePermissionsSeed)) {
    const roleId = roleMap.get(roleCode);

    if (!roleId) continue;

    const finalPermissionCodes =
      permissionCodes.includes('*') ? allPermissions.map((p) => p.code) : permissionCodes;

    for (const permissionCode of finalPermissionCodes) {
      const permissionId = permissionMap.get(permissionCode);
      if (!permissionId) continue;

      await RolePermissions.findOrCreate({
        where: {
          role_id: roleId,
          permission_id: permissionId,
        },
        defaults: {
          role_id: roleId,
          permission_id: permissionId,
        },
      });
    }
  }
}

async function seedOrganizationRolePermissions() {
  const allPermissions = await Permission.findAll();
  const allOrganizationRoles = await OrganizationRoles.findAll();

  const permissionMap = new Map(allPermissions.map((p) => [p.code, p.id]));
  const organizationRoleMap = new Map(allOrganizationRoles.map((r) => [r.code, r.id]));

  for (const [roleCode, permissionCodes] of Object.entries(organizationRolePermissionsSeed)) {
    const organizationRoleId = organizationRoleMap.get(roleCode);

    if (!organizationRoleId) continue;

    for (const permissionCode of permissionCodes) {
      const permissionId = permissionMap.get(permissionCode);
      if (!permissionId) continue;

      await OrganizationRolePermissions.findOrCreate({
        where: {
          organization_role_id: organizationRoleId,
          permission_id: permissionId,
        },
        defaults: {
          organization_role_id: organizationRoleId,
          permission_id: permissionId,
        },
      });
    }
  }
}

export async function runSeeds() {
  await seedCatalog(Roles, globalRolesSeed);
  await seedCatalog(OrganizationRoles, organizationRolesSeed);
  await seedCatalog(Permission, permissionsSeed);

  await seedRolePermissions();
  await seedOrganizationRolePermissions();

  console.log('Seeds ejecutadas correctamente');
}