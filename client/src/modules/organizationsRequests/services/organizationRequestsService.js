import { apiGet, apiPost } from '../../../shared/lib/api';

export const createOrganizationRequest = async (payload, token) => {
  return apiPost('/api/organization-requests', payload, {
    Authorization: `Bearer ${token}`,
  });
};

export const getMyOrganizationRequests = async (token) => {
  return apiGet('/api/organization-requests/me', {
    Authorization: `Bearer ${token}`,
  });
};


export const cancelOrganizationRequest = async (requestId, token) => {
  return apiPatch(`/api/organization-requests/${requestId}/cancel`, null, {
    Authorization: `Bearer ${token}`,
  });
};