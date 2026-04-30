import { apiDelete, apiGet, apiPost, apiPut } from '../../../shared/lib/api';

export const getPublicTournamentBySlug = async (slug) => {
  return apiGet(`/api/tournaments/public/${slug}`);
};

export const getMyTournamentRegistration = async (tournamentId, token) => {
  return apiGet(`/api/tournaments/${tournamentId}/my-registration`, {
    Authorization: `Bearer ${token}`,
  });
};

export const registerToTournament = async (tournamentId, payload, token) => {
  return apiPost(`/api/tournaments/${tournamentId}/register`, payload, {
    Authorization: `Bearer ${token}`,
  });
};

export const unregisterFromTournament = async (tournamentId, token) => {
  return apiDelete(
    `/api/tournaments/${tournamentId}/register`,
    null,
    {
      Authorization: `Bearer ${token}`,
    }
  );
};

export const getMyTournamentDecklist = async (tournamentId, token) => {
  return apiGet(`/api/tournaments/${tournamentId}/my-decklist`, {
    Authorization: `Bearer ${token}`,
  });
};

export const createTournamentDecklist = async (tournamentId, payload, token) => {
  return apiPost(`/api/tournaments/${tournamentId}/decklist`, payload, {
    Authorization: `Bearer ${token}`,
  });
};

export const updateTournamentDecklist = async (tournamentId, payload, token) => {
  return apiPut(`/api/tournaments/${tournamentId}/decklist`, payload, {
    Authorization: `Bearer ${token}`,
  });
};