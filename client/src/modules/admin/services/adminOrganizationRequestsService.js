import { apiGet, apiPatch } from '../../../shared/lib/api';

export const getPendingOrganizationRequests = async (token) => {
  return apiGet('/api/admin/organization-requests', {
    Authorization: `Bearer ${token}`,
  });
};

export const approveOrganizationRequest = async (requestId, token) => {
  return apiPatch(`/api/admin/organization-requests/${requestId}/approve`, {}, {
    Authorization: `Bearer ${token}`,
  });
};

export const rejectOrganizationRequest = async (requestId, token) => {
  return apiPatch(`/api/admin/organization-requests/${requestId}/reject`, {}, {
    Authorization: `Bearer ${token}`,
  });
};