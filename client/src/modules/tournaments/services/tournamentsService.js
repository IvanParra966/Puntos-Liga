import { apiDelete, apiGet, apiPatch, apiPost } from '../../../shared/lib/api';

export const getTournamentCatalogs = async (token) => {
  return apiGet('/api/tournaments/catalogs', {
    Authorization: `Bearer ${token}`,
  });
};

export const getNodeTournaments = async (organizationId, nodeId, token) => {
  return apiGet(`/api/tournaments/organizations/${organizationId}/nodes/${nodeId}`, {
    Authorization: `Bearer ${token}`,
  });
};

export const getTournamentById = async (tournamentId, token) => {
  return apiGet(`/api/tournaments/${tournamentId}`, {
    Authorization: `Bearer ${token}`,
  });
};

export const createTournament = async (payload, token) => {
  return apiPost('/api/tournaments', payload, {
    Authorization: `Bearer ${token}`,
  });
};

export const updateTournament = async (tournamentId, payload, token) => {
  return apiPatch(`/api/tournaments/${tournamentId}`, payload, {
    Authorization: `Bearer ${token}`,
  });
};

export const cloneTournament = async (tournamentId, token) => {
  return apiPost(`/api/tournaments/${tournamentId}/clone`, {}, {
    Authorization: `Bearer ${token}`,
  });
};

export const exportTournament = async (tournamentId, payload, token) => {
  return apiPost(`/api/tournaments/${tournamentId}/export`, payload, {
    Authorization: `Bearer ${token}`,
  });
};


export const deleteTournament = async (tournamentId, payload, token) => {
  return apiDelete(`/api/tournaments/${tournamentId}`, payload, {
    Authorization: `Bearer ${token}`,
  });
};


