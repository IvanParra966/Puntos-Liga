import { apiGet, apiPost } from '../../../shared/lib/api';

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