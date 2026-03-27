import axios from 'axios';
import { env } from '../config/env.js';
import { includesKeyword } from '../utils/text.js';

const api = axios.create({
  baseURL: env.limitless.baseUrl,
  timeout: 30000,
});

export const fetchTournamentsPage = async (page = 1) => {
  const response = await api.get('/tournaments', {
    params: {
      game: env.limitless.game,
      organizerId: env.limitless.organizerId,
      limit: env.limitless.pageSize,
      page,
    },
  });

  return Array.isArray(response.data) ? response.data : [];
};

export const fetchAllCatamarcaTournaments = async () => {
  const tournaments = [];

  for (let page = 1; page <= env.limitless.maxPages; page += 1) {
    const currentPage = await fetchTournamentsPage(page);

    if (!currentPage.length) {
      break;
    }

    tournaments.push(...currentPage);

    if (currentPage.length < env.limitless.pageSize) {
      break;
    }
  }

  return tournaments.filter((tournament) => {
    const sameOrganizer = Number(tournament.organizerId) === Number(env.limitless.organizerId);
    const sameGame = String(tournament.game || '').toUpperCase() === String(env.limitless.game).toUpperCase();
    const hasKeyword = includesKeyword(tournament.name, env.limitless.keyword);

    return sameOrganizer && sameGame && hasKeyword;
  });
};

export const fetchTournamentStandings = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}/standings`);
  return Array.isArray(response.data) ? response.data : [];
};
