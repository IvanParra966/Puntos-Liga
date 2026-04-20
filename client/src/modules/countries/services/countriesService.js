import { apiGet } from '../../../shared/lib/api';

export const getCountries = async () => {
  return apiGet('/api/countries');
};