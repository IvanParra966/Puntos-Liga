import { apiPut } from '../../../shared/lib/api';

export const updateMyProfile = async (payload, token) => {
  return apiPut('/api/users/me', payload, {
    Authorization: `Bearer ${token}`,
  });
};

export const updateMyPassword = async (payload, token) => {
  return apiPut('/api/users/me/password', payload, {
    Authorization: `Bearer ${token}`,
  });
};