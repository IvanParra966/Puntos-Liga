import {
  User,
  Roles,
  Permission,
  RolePermissions,
  OrganizationMembers,
  OrganizationRoles,
  OrganizationRolePermissions,
  OrganizationMembersPermissions,
} from '../../database/models/index.js';

export async function getGlobalPermissions(userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Roles,
        as: 'role',
        include: [
          {
            model: RolePermissions,
            as: 'rolePermissions',
            include: [
              {
                model: Permission,
                as: 'permission',
              },
            ],
          },
        ],
      },
    ],
  });

  if (!user || !user.role) return [];

  return user.role.rolePermissions
    .map((item) => item.permission?.code)
    .filter(Boolean);
}

export async function getOrganizationPermissions(userId, organizationId) {
  const membership = await OrganizationMembers.findOne({
    where: {
      user_id: userId,
      organization_id: organizationId,
    },
    include: [
      {
        model: OrganizationRoles,
        as: 'organizationRole',
        include: [
          {
            model: OrganizationRolePermissions,
            as: 'organizationRolePermissions',
            include: [
              {
                model: Permission,
                as: 'permission',
              },
            ],
          },
        ],
      },
      {
        model: OrganizationMembersPermissions,
        as: 'memberPermissions',
        include: [
          {
            model: Permission,
            as: 'permission',
          },
        ],
      },
    ],
  });

  if (!membership) return [];

  const rolePermissions =
    membership.organizationRole?.organizationRolePermissions
      ?.map((item) => item.permission?.code)
      .filter(Boolean) || [];

  const allowedOverrides =
    membership.memberPermissions
      ?.filter((item) => item.allowed === true)
      .map((item) => item.permission?.code)
      .filter(Boolean) || [];

  const deniedOverrides =
    membership.memberPermissions
      ?.filter((item) => item.allowed === false)
      .map((item) => item.permission?.code)
      .filter(Boolean) || [];

  const finalPermissions = new Set([...rolePermissions, ...allowedOverrides]);

  for (const denied of deniedOverrides) {
    finalPermissions.delete(denied);
  }

  return [...finalPermissions];
}

export async function getEffectivePermissions(userId, organizationId = null) {
  const globalPermissions = await getGlobalPermissions(userId);

  if (!organizationId) {
    return [...new Set(globalPermissions)];
  }

  const organizationPermissions = await getOrganizationPermissions(
    userId,
    organizationId
  );

  return [...new Set([...globalPermissions, ...organizationPermissions])];
}

export async function hasPermission(userId, permissionCode, organizationId = null) {
  const permissions = await getEffectivePermissions(userId, organizationId);
  return permissions.includes(permissionCode);
}