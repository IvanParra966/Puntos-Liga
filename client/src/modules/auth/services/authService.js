import { apiGet, apiPost } from '../../../shared/lib/api';

export const registerRequest = async (payload) => {
  return apiPost('/api/auth/register', payload);
};

export const loginRequest = async (payload) => {
  return apiPost('/api/auth/login', payload);
};

export const meRequest = async (token) => {
  return apiGet('/api/auth/me', {
    Authorization: `Bearer ${token}`,
  });
};