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

import { TournamentFormats } from './tournament_formats.js';
import { TournamentPointStructures } from './tournament_point_structures.js';
import { TournamentRegistrationModes } from './tournament_registration_modes.js';
import { TournamentPairingSystems } from './tournament_pairing_systems.js';
import { TournamentMatchModes } from './tournament_match_modes.js';
import { Tournaments } from './tournaments.js';
import { TournamentRoundRules } from './tournament_round_rules.js';
import { TournamentStaff } from './tournament_staff.js';
import { TournamentAccessCodes } from './tournament_access_codes.js';

import { TournamentRegistrations } from './tournament_registrations.js';

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
   TOURNAMENTS
========================= */

Tournaments.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });
Organization.hasMany(Tournaments, { foreignKey: 'organization_id', as: 'tournaments' });

Tournaments.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'createdBy' });
User.hasMany(Tournaments, { foreignKey: 'created_by_user_id', as: 'createdTournaments' });

Tournaments.belongsTo(Tournaments, { foreignKey: 'cloned_from_tournament_id', as: 'clonedFrom' });
Tournaments.hasMany(Tournaments, { foreignKey: 'cloned_from_tournament_id', as: 'clones' });

Tournaments.belongsTo(TournamentFormats, { foreignKey: 'format_id', as: 'format' });
TournamentFormats.hasMany(Tournaments, { foreignKey: 'format_id', as: 'tournaments' });

Tournaments.belongsTo(TournamentPointStructures, { foreignKey: 'point_structure_id', as: 'pointStructure' });
TournamentPointStructures.hasMany(Tournaments, { foreignKey: 'point_structure_id', as: 'tournaments' });

Tournaments.belongsTo(TournamentRegistrationModes, { foreignKey: 'registration_mode_id', as: 'registrationMode' });
TournamentRegistrationModes.hasMany(Tournaments, { foreignKey: 'registration_mode_id', as: 'tournaments' });

Tournaments.belongsTo(TournamentPairingSystems, { foreignKey: 'pairing_system_id', as: 'pairingSystem' });
TournamentPairingSystems.hasMany(Tournaments, { foreignKey: 'pairing_system_id', as: 'tournaments' });

Tournaments.belongsTo(TournamentMatchModes, { foreignKey: 'match_mode_id', as: 'matchMode' });
TournamentMatchModes.hasMany(Tournaments, { foreignKey: 'match_mode_id', as: 'tournaments' });

TournamentRoundRules.belongsTo(Tournaments, { foreignKey: 'tournament_id', as: 'tournament' });
Tournaments.hasMany(TournamentRoundRules, { foreignKey: 'tournament_id', as: 'roundRules' });

TournamentStaff.belongsTo(Tournaments, { foreignKey: 'tournament_id', as: 'tournament' });
Tournaments.hasMany(TournamentStaff, { foreignKey: 'tournament_id', as: 'staff' });

TournamentStaff.belongsTo(OrganizationMembers, { foreignKey: 'organization_member_id', as: 'organizationMember' });
OrganizationMembers.hasMany(TournamentStaff, { foreignKey: 'organization_member_id', as: 'tournamentAssignments' });

TournamentAccessCodes.belongsTo(Tournaments, { foreignKey: 'tournament_id', as: 'tournament' });
Tournaments.hasMany(TournamentAccessCodes, { foreignKey: 'tournament_id', as: 'accessCodes' });

TournamentAccessCodes.belongsTo(User, { foreignKey: 'created_by_user_id', as: 'createdBy' });
User.hasMany(TournamentAccessCodes, { foreignKey: 'created_by_user_id', as: 'createdTournamentAccessCodes' });

/* =========================
   TOURNAMENT REGISTRATIONS
========================= */

Tournaments.hasMany(TournamentRegistrations, { foreignKey: 'tournament_id', as: 'registrations' });
TournamentRegistrations.belongsTo(Tournaments, { foreignKey: 'tournament_id', as: 'tournament' });

User.hasMany(TournamentRegistrations, { foreignKey: 'user_id', as: 'tournamentRegistrations' });
TournamentRegistrations.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

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
   Tournaments,
   TournamentAccessCodes,
   TournamentFormats,
   TournamentMatchModes,
   TournamentPairingSystems,
   TournamentPointStructures,
   TournamentRegistrationModes,
   TournamentRoundRules,
   TournamentStaff,
   TournamentRegistrations
};