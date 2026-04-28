import { User } from './users.js';
import { Roles } from './roles.js';
import { Status } from './status.js';
import { Permission } from './permissions.js';

import { OrganizationRoles } from './organization_roles.js';
import { OrganizationMembers } from './organization_members.js';
import { OrganizationRequest } from './organization_requests.js';
import { Organization } from './organizations.js';

import { RolePermissions } from './role_permissions.js';
import { OrganizationRolePermissions } from './organization_role_permissions.js';
import { OrganizationMembersPermissions } from './organization_members_permissions.js';

import { Keyword } from './Keyword.js';
import { Countries } from './countries.js';

import { OrganizationNodes } from './organization_nodes.js';

/* =========================
   USERS / ROLES / STATUS
========================= */

User.belongsTo(Roles, { foreignKey: 'role_id', as: 'role' });
Roles.hasMany(User, { foreignKey: 'role_id', as: 'users' });

User.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });
Status.hasMany(User, { foreignKey: 'status_id', as: 'users' });

/* =========================
   ORGANIZATIONS
========================= */

Organization.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'createdBy' });
User.hasMany(Organization, { foreignKey: 'created_by_user_id', as: 'createdOrganizations' });

Organization.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });
Status.hasMany(Organization, { foreignKey: 'status_id', as: 'organizations' });

/* =========================
   ORGANIZATION REQUESTS
========================= */

OrganizationRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(OrganizationRequest, { foreignKey: 'user_id', as: 'organizationRequests' });

OrganizationRequest.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Organization.hasMany(OrganizationRequest, { foreignKey: 'organization_id', as: 'requests' });

OrganizationRequest.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });
Status.hasMany(OrganizationRequest, { foreignKey: 'status_id', as: 'organizationRequests' });

OrganizationRequest.belongsTo(User, { foreignKey: 'reviewed_by_user_id', as: 'reviewedBy' });
User.hasMany(OrganizationRequest, { foreignKey: 'reviewed_by_user_id', as: 'reviewedOrganizationRequests' });

/* =========================
   ORGANIZATION MEMBERS
========================= */

OrganizationMembers.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });
Status.hasMany(OrganizationMembers, { foreignKey: 'status_id', as: 'organizationMembers' });

OrganizationMembers.belongsTo(OrganizationRoles, { foreignKey: 'organization_role_id', as: 'organizationRole' });
OrganizationRoles.hasMany(OrganizationMembers, { foreignKey: 'organization_role_id', as: 'organizationMembers' });

OrganizationMembers.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(OrganizationMembers, { foreignKey: 'user_id', as: 'organizationMembers' });

OrganizationMembers.belongsTo(User, { foreignKey: 'approved_by_user_id', as: 'approvedBy' });
User.hasMany(OrganizationMembers, { foreignKey: 'approved_by_user_id', as: 'approvedMemberships' });

OrganizationMembers.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Organization.hasMany(OrganizationMembers, { foreignKey: 'organization_id', as: 'members' });

/* =========================
   ROLE PERMISSIONS (global)
========================= */

RolePermissions.belongsTo(Roles, { foreignKey: 'role_id', as: 'role' });
Roles.hasMany(RolePermissions, { foreignKey: 'role_id', as: 'rolePermissions' });

RolePermissions.belongsTo(Permission, { foreignKey: 'permission_id', as: 'permission' });
Permission.hasMany(RolePermissions, { foreignKey: 'permission_id', as: 'rolePermissions' });

/* =========================
   ORGANIZATION ROLE PERMISSIONS
========================= */

OrganizationRolePermissions.belongsTo(OrganizationRoles, {
  foreignKey: 'organization_role_id',
  as: 'organizationRole',
});
OrganizationRoles.hasMany(OrganizationRolePermissions, {
  foreignKey: 'organization_role_id',
  as: 'organizationRolePermissions',
});

OrganizationRolePermissions.belongsTo(Permission, {
  foreignKey: 'permission_id',
  as: 'permission',
});
Permission.hasMany(OrganizationRolePermissions, {
  foreignKey: 'permission_id',
  as: 'organizationRolePermissions',
});

/* =========================
   ORGANIZATION MEMBER PERMISSIONS
========================= */

OrganizationMembersPermissions.belongsTo(OrganizationMembers, {
  foreignKey: 'organization_member_id',
  as: 'organizationMember',
});
OrganizationMembers.hasMany(OrganizationMembersPermissions, {
  foreignKey: 'organization_member_id',
  as: 'memberPermissions',
});

OrganizationMembersPermissions.belongsTo(Permission, {
  foreignKey: 'permission_id',
  as: 'permission',
});
Permission.hasMany(OrganizationMembersPermissions, {
  foreignKey: 'permission_id',
  as: 'organizationMemberPermissions',
});

/* =========================
   COUNTRIES
========================= */

Countries.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });
Status.hasMany(Countries, { foreignKey: 'status_id', as: 'countries' });

User.belongsTo(Countries, { foreignKey: 'country_id', as: 'country' });
Countries.hasMany(User, { foreignKey: 'country_id', as: 'users' });

/* =========================
   ORGANIZATION NODES
========================= */
OrganizationNodes.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Organization.hasMany(OrganizationNodes, { foreignKey: 'organization_id', as: 'nodes' });

OrganizationNodes.belongsTo(OrganizationNodes, { foreignKey: 'parent_id', as: 'parent' });
OrganizationNodes.hasMany(OrganizationNodes, { foreignKey: 'parent_id', as: 'children' });

OrganizationNodes.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'createdBy' });
User.hasMany(OrganizationNodes, { foreignKey: 'created_by_user_id', as: 'createdOrganizationNodes' });

OrganizationNodes.belongsTo(Status, { foreignKey: 'status_id', as: 'status' });
Status.hasMany(OrganizationNodes, { foreignKey: 'status_id', as: 'organizationNodes' });

OrganizationNodes.belongsTo(User, { foreignKey: 'deleted_by_user_id', as: 'deletedBy' });
User.hasMany(OrganizationNodes, { foreignKey: 'deleted_by_user_id', as: 'deletedOrganizationNodes' });


/* =========================
   EXPORTS
========================= */

export {
  User,
  Roles,
  Status,
  Permission,
  RolePermissions,
  Organization,
  OrganizationRequest,
  OrganizationRoles,
  OrganizationRolePermissions,
  OrganizationMembers,
  OrganizationMembersPermissions,
  Keyword,
  Countries,
  OrganizationNodes,
};