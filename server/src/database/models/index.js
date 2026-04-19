import { User } from './users.js';
import { Roles } from './roles.js';
import { Status } from './status.js';
import { OrganizationRoles } from './organizationRoles.js';
import { OrganizationMembers } from './organizationMembers.js';
import { OrganizationRequest } from './organizationRequests.js';
import { Organization } from './organizations.js';
import { Keyword } from './Keyword.js';

User.belongsTo(Roles, { foreignKey: 'roleId', as: 'role' });
Roles.hasMany(User, { foreignKey: 'roleId', as: 'users' });

User.belongsTo(Status, { foreignKey: 'statusId', as: 'status' });
Status.hasMany(User, { foreignKey: 'statusId', as: 'users' });

OrganizationMembers.belongsTo(Status, { foreignKey: 'statusId', as: 'status' });
Status.hasMany(OrganizationMembers, { foreignKey: 'statusId', as: 'organizationMembers' });

OrganizationMembers.belongsTo(OrganizationRoles, { foreignKey: 'organizationRoleId', as: 'organizationRole' });
OrganizationRoles.hasMany(OrganizationMembers, { foreignKey: 'organizationRoleId', as: 'organizationMembers' });

OrganizationMembers.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(OrganizationMembers, { foreignKey: 'userId', as: 'organizationMembers' });

OrganizationMembers.belongsTo(User, { foreignKey: 'approvedByUserId', as: 'approvedBy' });
User.hasMany(OrganizationMembers, { foreignKey: 'approvedByUserId', as: 'approvedMemberships' });

Organization.belongsTo(User, { foreignKey: 'createdByUserId', as: 'createdBy' });
User.hasMany(Organization, { foreignKey: 'createdByUserId', as: 'createdOrganizations' });

Organization.belongsTo(Status, { foreignKey: 'statusId', as: 'status' });
Status.hasMany(Organization, { foreignKey: 'statusId', as: 'organizations' });

OrganizationRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(OrganizationRequest, { foreignKey: 'userId', as: 'organizationRequests' });

OrganizationRequest.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Organization.hasMany(OrganizationRequest, { foreignKey: 'organizationId', as: 'requests' });

OrganizationRequest.belongsTo(Status, { foreignKey: 'statusId', as: 'status' });
Status.hasMany(OrganizationRequest, { foreignKey: 'statusId', as: 'organizationRequests' });

OrganizationRequest.belongsTo(User, { foreignKey: 'reviewedByUserId', as: 'reviewedBy' });
User.hasMany(OrganizationRequest, { foreignKey: 'reviewedByUserId', as: 'reviewedOrganizationRequests' });

OrganizationMembers.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Organization.hasMany(OrganizationMembers, { foreignKey: 'organizationId', as: 'members' });

export {
  User,
  Roles,
  Status,
  OrganizationRoles,
  OrganizationMembers,
  OrganizationRequest,
  Organization,
  Keyword,
};