import axios from 'axios';
import { env } from '../app/config/env.js';
import { includesKeyword } from '../utils/text.js';

const api = axios.create({
  baseURL: env.limitless.baseUrl,
  timeout: 30000,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelay = (error, attempt) => {
  const retryAfterHeader = error?.response?.headers?.['retry-after'];
  const retryAfterSeconds = Number(retryAfterHeader);

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  return Math.min(1000 * (attempt + 1), 10000);
};

const getWithRetry = async (url, config = {}, attempt = 0) => {
  try {
    const response = await api.get(url, config);
    await sleep(500);
    return response;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 429 && attempt < 5) {
      const delay = getRetryDelay(error, attempt);
      console.warn(`Limitless respondió 429 en ${url}. Reintentando en ${delay}ms...`);
      await sleep(delay);
      return getWithRetry(url, config, attempt + 1);
    }

    throw error;
  }
};

export const fetchTournamentsPage = async (page = 1) => {
  const response = await getWithRetry('/tournaments', {
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
    const sameGame =
      String(tournament.game || '').toUpperCase() ===
      String(env.limitless.game).toUpperCase();
    const hasKeyword = includesKeyword(tournament.name, env.limitless.keyword);

    return sameOrganizer && sameGame && hasKeyword;
  });
};

export const fetchTournamentStandings = async (tournamentId) => {
  const response = await getWithRetry(`/tournaments/${tournamentId}/standings`);
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchTournamentPairings = async (tournamentId) => {
  const response = await getWithRetry(`/tournaments/${tournamentId}/pairings`);
  return Array.isArray(response.data) ? response.data : [];
};