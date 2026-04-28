import { apiGet, apiPatch, apiPost } from '../../../shared/lib/api';

export const getMyOrganization = async (token) => {
  return apiGet('/api/organizations/my', {
    Authorization: `Bearer ${token}`,
  });
};

export const getOrganizationNodes = async (organizationId, token) => {
  return apiGet(`/api/organizations/${organizationId}/nodes`, {
    Authorization: `Bearer ${token}`,
  });
};

export const createOrganizationNode = async (organizationId, payload, token) => {
  return apiPost(`/api/organizations/${organizationId}/nodes`, payload, {
    Authorization: `Bearer ${token}`,
  });
};

export const updateOrganizationNode = async (nodeId, payload, token) => {
  return apiPatch(`/api/organizations/nodes/${nodeId}`, payload, {
    Authorization: `Bearer ${token}`,
  });
};

export const deleteOrganizationNode = async (nodeId, payload, token) => {
  return apiPatch(`/api/organizations/nodes/${nodeId}/delete`, payload, {
    Authorization: `Bearer ${token}`,
  });
};

export const reorderOrganizationNodes = async (payload, token) => {
  return apiPatch('/api/organizations/nodes/reorder', payload, {
    Authorization: `Bearer ${token}`,
  });
};

export const updateOrganizationLogo = async (organizationId, file, token) => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL || ''}/api/organizations/${organizationId}/logo`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'No se pudo actualizar el logo');
  }

  return data;
};