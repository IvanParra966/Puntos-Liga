import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import { env } from '../config/env.js';
import {
  Player,
  PointRule,
  Season,
  SyncState,
  Tournament,
  TournamentMatch,
  TournamentResult,
} from '../models/index.js';
import {
  fetchAllCatamarcaTournaments,
  fetchTournamentPairings,
  fetchTournamentStandings,
} from './limitlessService.js';
import {
  bootstrapSeasons,
  findSeasonForTournamentDate,
  getActiveSeason,
  getAllSeasons,
  getSeasonByKey,
} from './seasonService.js';
import { makeTournamentShortName } from '../utils/text.js';
const sortRules = (rules = []) => {
  return [...rules].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    if (a.minPlayers !== b.minPlayers) return a.minPlayers - b.minPlayers;
    if ((a.maxPlayers || 999999) !== (b.maxPlayers || 999999)) {
      return (a.maxPlayers || 999999) - (b.maxPlayers || 999999);
    }
    if (a.placingFrom !== b.placingFrom) return a.placingFrom -
      b.placingFrom;
    return a.placingTo - b.placingTo;
  });
};
const getPointRulesCollection = async (transaction = null) => {
  const rules = await PointRule.findAll({
    order: [['sortOrder', 'ASC'], ['minPlayers', 'ASC'], ['placingFrom',
      'ASC']],
    transaction: transaction || undefined,
  });
  return rules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    minPlayers: rule.minPlayers,
    maxPlayers: rule.maxPlayers,
    placingFrom: rule.placingFrom,
    placingTo: rule.placingTo,
    points: rule.points,
    sortOrder: rule.sortOrder,
  }));
};
const resolvePoints = (playersCount, placing, rules = []) => {
  const safePlayersCount = Number(playersCount || 0);
  const safePlacing = Number(placing || 0);
  const matchedRule = rules.find((rule) => {
    const matchesPlayers =
      safePlayersCount >= Number(rule.minPlayers) &&
      (rule.maxPlayers === null || safePlayersCount <=
        Number(rule.maxPlayers));
    const matchesPlacing =
      safePlacing >= Number(rule.placingFrom) &&
      safePlacing <= Number(rule.placingTo);
    return matchesPlayers && matchesPlacing;
  });
  return matchedRule ? Number(matchedRule.points) : 0;
};
const updateSyncState = async (values) => {
  const [syncState] = await SyncState.findOrCreate({
    where: { syncKey: 'catamarca' },
    defaults: { status: 'idle' },
  });
  await syncState.update(values);
  return syncState;
};
const recalculateStoredPoints = async (transaction) => {
  const rules = await getPointRulesCollection(transaction);
  const results = await TournamentResult.findAll({
    include: [{ model: Tournament, as: 'tournament' }],
    transaction,
  });
  for (const result of results) {
    const playersCount = Number(result.tournament?.playersCount || 0);
    await result.update(
      {
        pointsAwarded: resolvePoints(playersCount, result.placing, rules),
      },
      { transaction }
    );
  }
};
const normalizeMatchResultType = (winner) => {
  if (winner === 0 || winner === '0') return 'tie';
  if (winner === -1 || winner === '-1') return 'double-loss';
  if (winner === null || winner === undefined || winner === '') return
  'pending';
  return 'decided';
};
const buildOverviewFromResults = ({
  tournaments = [],
  results = [],
  season = null,
  seasons = [],
  syncState = null,
  rules = [],
}) => {
  const leaderboardMap = new Map();
  let totalMatches = 0;
  let totalPointsAwarded = 0;
  for (const result of results) {
    const playerId = result.player.id;
    if (!leaderboardMap.has(playerId)) {
      leaderboardMap.set(playerId, {
        playerId,
        limitlessPlayerId: result.player.limitlessPlayerId,
        name: result.player.displayName,
        country: result.player.country,
        totalPoints: 0,
        tournamentsPlayed: 0,
        matchesPlayed: 0,
        firstPlaces: 0,
        totalPlacings: 0,
        bestFinish: null,
        history: [],
      });
    }
    const row = leaderboardMap.get(playerId);
    row.totalPoints += result.pointsAwarded;
    row.tournamentsPlayed += 1;
    row.matchesPlayed += result.matchesPlayed;
    row.totalPlacings += result.placing;
    row.bestFinish = row.bestFinish === null ? result.placing :
      Math.min(row.bestFinish, result.placing);
    if (result.placing === 1) {
      row.firstPlaces += 1;
    }
    row.history.push({
      seasonKey: result.tournament.seasonKey,
      seasonNumber: result.tournament.seasonNumber,
      seasonYear: result.tournament.seasonYear,
      tournamentId: result.tournament.limitlessTournamentId,
      tournamentName: result.tournament.name,
      shortName: result.tournament.shortName,
      date: result.tournament.date,
      playersCount: result.tournament.playersCount,
      placing: result.placing,
      wins: result.wins,
      losses: result.losses,
      ties: result.ties,
      matchesPlayed: result.matchesPlayed,
      pointsAwarded: result.pointsAwarded,
      deckName: result.deckName || null,
      deckTypeId: result.deckTypeId || null,
      decklistJson: result.decklistJson || null,
    });
    totalMatches += result.matchesPlayed;
    totalPointsAwarded += result.pointsAwarded;
  }
  const leaderboard = Array.from(leaderboardMap.values())
    .map((row) => {
      const sortedHistory = row.history.sort((a, b) => new Date(b.date) -
        new Date(a.date));
      return {
        ...row,
        averagePlacing: row.tournamentsPlayed
          ? Number((row.totalPlacings / row.tournamentsPlayed).toFixed(2))
          : null,
        history: sortedHistory,
        lastDeckName: sortedHistory[0]?.deckName || null,
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints -
        a.totalPoints;
      if (b.firstPlaces !== a.firstPlaces) return b.firstPlaces -
        a.firstPlaces;
      if (b.tournamentsPlayed !== a.tournamentsPlayed) return
      b.tournamentsPlayed - a.tournamentsPlayed;
      if ((a.averagePlacing || 999) !== (b.averagePlacing || 999)) {
        return (a.averagePlacing || 999) - (b.averagePlacing || 999);
      }
      return a.name.localeCompare(b.name);
    })
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
  return {
    season: season
      ? {
        id: season.id,
        key: season.key,
        name: season.name,
        year: season.year,
        seasonNumber: season.seasonNumber,
        startsAt: season.startsAt,
        endsAt: season.endsAt,
      }
      : null,
    seasons: seasons.map((item) => ({
      id: item.id,
      key: item.key,
      name: item.name,
      year: item.year,
      seasonNumber: item.seasonNumber,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
    })),
    summary: {
      keyword: env.limitless.keyword,
      organizerId: env.limitless.organizerId,
      game: env.limitless.game,
      playersCount: leaderboard.length,
      tournamentsCount: tournaments.length,
      matchesCount: totalMatches,
      totalPointsAwarded,
      lastSync: syncState?.finishedAt || null,
      syncStatus: syncState?.status || 'idle',
      syncMessage: syncState?.message || null,
      lastPayload: syncState?.payload || null,
    },
    tournaments: tournaments.map((tournament) => ({
      id: tournament.limitlessTournamentId,
      name: tournament.name,
      shortName: tournament.shortName,
      date: tournament.date,
      playersCount: tournament.playersCount,
      seasonKey: tournament.seasonKey,
      seasonYear: tournament.seasonYear,
      seasonNumber: tournament.seasonNumber,
    })),
    rules,
    leaderboard,
  };
};
const getResultsWhereBySeasonParam = async (seasonParam) => {
  if (!seasonParam || seasonParam === 'active') {
    const activeSeason = await getActiveSeason();
    return {
      season: activeSeason,
      tournamentWhere: activeSeason ? { seasonId: activeSeason.id } : {
        id:
          null
      },
    };
  }
  if (seasonParam === 'all') {
    return {
      season: null,
      tournamentWhere: {},
    };
  }
  const selectedSeason = await getSeasonByKey(seasonParam);
  return {
    season: selectedSeason,
    tournamentWhere: selectedSeason ? { seasonId: selectedSeason.id } : {
      id: null
    },
  };
};
export const syncCatamarcaLeague = async () => {
  await bootstrapSeasons();
  await updateSyncState({
    status: 'running',
    message: 'Sincronizando torneos de Catamarca...',
    startedAt: new Date(),
  });
  try {
    const rules = await getPointRulesCollection();
    const tournaments = await fetchAllCatamarcaTournaments();
    let savedResults = 0;
    let savedMatches = 0;
    const skipped = [];
    for (const tournamentData of tournaments) {
      try {
        const standings = await fetchTournamentStandings(tournamentData.id);
        const pairings = await fetchTournamentPairings(tournamentData.id);
        const playersCount = Number(tournamentData.players ||
          standings.length || 0);
        const season = await
          findSeasonForTournamentDate(tournamentData.date);
        let tournamentRecord = await Tournament.findOne({
          where: { limitlessTournamentId: tournamentData.id },
        });
        const baseTournamentPayload = {
          organizerId: tournamentData.organizerId,
          game: tournamentData.game,
          format: tournamentData.format || null,
          name: tournamentData.name,
          shortName: makeTournamentShortName(tournamentData.name),
          date: tournamentData.date,
          playersCount,
          keywordTag: env.limitless.keyword,
          seasonId: season?.id || null,
          seasonKey: season?.key || null,
          seasonYear: season?.year || null,
          seasonNumber: season?.seasonNumber || null,
        };
        if (tournamentRecord) {
          await tournamentRecord.update(baseTournamentPayload);
        } else {
          tournamentRecord = await Tournament.create({
            limitlessTournamentId: tournamentData.id,
            ...baseTournamentPayload,
          });
        }
        await TournamentResult.destroy({
          where: {
            tournamentId:
              tournamentRecord.id
          }
        });
        await TournamentMatch.destroy({
          where: {
            tournamentId:
              tournamentRecord.id
          }
        });
        for (const standing of standings) {
          const wins = Number(standing?.record?.wins || 0);
          const losses = Number(standing?.record?.losses || 0);
          const ties = Number(standing?.record?.ties || 0);
          const matchesPlayed = wins + losses + ties;
          const placing = Number(standing.placing || 0);
          const pointsAwarded = resolvePoints(playersCount, placing, rules);
          const [player] = await Player.findOrCreate({
            where: { limitlessPlayerId: standing.player },
            defaults: {
              limitlessPlayerId: standing.player,
              displayName: standing.name || standing.player,
              country: standing.country || null,
            },
          });
          await player.update({
            displayName: standing.name || player.displayName,
            country: standing.country || player.country,
          });
          await TournamentResult.create({
            tournamentId: tournamentRecord.id,
            playerId: player.id,
            placing,
            wins,
            losses,
            ties,
            matchesPlayed,
            pointsAwarded,
            droppedAtRound: standing.drop ?? null,
            deckName: standing.deck?.name || null,
            deckTypeId: standing.deck?.id || null,
            decklistJson: standing.decklist || null,
          });
          savedResults += 1;
        }
        for (const pairing of pairings) {
          await TournamentMatch.create({
            tournamentId: tournamentRecord.id,
            seasonId: season?.id || null,
            round: Number(pairing.round || 0) || null,
            phase: Number(pairing.phase || 0) || null,
            tableNumber: Number(pairing.table || 0) || null,
            matchLabel: pairing.match || null,
            player1LimitlessId: pairing.player1 || null,
            player2LimitlessId: pairing.player2 || null,
            winnerLimitlessId:
              pairing.winner === null || pairing.winner === undefined
                ? null
                : String(pairing.winner),
            resultType: normalizeMatchResultType(pairing.winner),
          });
          savedMatches += 1;
        }
      } catch (error) {
        skipped.push({
          tournamentId: tournamentData.id,
          name: tournamentData.name,
          error: error.message,
        });
      }
    }
    const payload = {
      tournaments: tournaments.length,
      results: savedResults,
      matches: savedMatches,
      skipped,
      keyword: env.limitless.keyword,
      organizerId: env.limitless.organizerId,
      game: env.limitless.game,
    };
    await updateSyncState({
      status: 'success',
      message: `Sincronización finalizada. ${tournaments.length} torneos
revisados.`,
      finishedAt: new Date(),
      payload,
    });
    return payload;
  } catch (error) {
    await updateSyncState({
      status: 'error',
      message: error.message,
      finishedAt: new Date(),
      payload: { stack: error.stack },
    });
    throw error;
  }
};
export const getLeagueOverview = async (seasonParam = 'active') => {
  await bootstrapSeasons();
  const { season, tournamentWhere } = await
    getResultsWhereBySeasonParam(seasonParam);
  const [tournaments, results, syncState, rules, seasons] = await
    Promise.all([
      Tournament.findAll({
        where: tournamentWhere,
        order: [['date', 'DESC']],
      }),
      TournamentResult.findAll({
        include: [
          { model: Player, as: 'player' },
          {
            model: Tournament,
            as: 'tournament',
            where: tournamentWhere,
          },
        ],
        order: [
          [{ model: Tournament, as: 'tournament' }, 'date', 'DESC'],
          ['placing', 'ASC'],
        ],
      }),
      SyncState.findOne({ where: { syncKey: 'catamarca' } }),
      getPointRulesCollection(),
      getAllSeasons(),
    ]);
  return buildOverviewFromResults({
    tournaments,
    results,
    season,
    seasons,
    syncState,
    rules,
  });
};
export const getSeasonsOverview = async () => {
  await bootstrapSeasons();
  const seasons = await Season.findAll({
    include: [
      {
        model: Tournament,
        as: 'tournaments',
        required: false,
      },
    ],
    order: [
      ['year', 'DESC'],
      ['seasonNumber', 'DESC'],
    ],
  });
  const activeSeason = await getActiveSeason();
  const payload = [];
  for (const season of seasons) {
    const overview = await getLeagueOverview(season.key);
    const winner = overview.leaderboard[0] || null;
    payload.push({
      id: season.id,
      key: season.key,
      name: season.name,
      year: season.year,
      seasonNumber: season.seasonNumber,
      startsAt: season.startsAt,
      endsAt: season.endsAt,
      isActive: activeSeason ? activeSeason.id === season.id : false,
      tournamentsCount: season.tournaments?.length || 0,
      playersCount: overview.summary.playersCount,
      winner: winner
        ? {
          playerId: winner.playerId,
          name: winner.name,
          totalPoints: winner.totalPoints,
        }
        : null,
    });
  }
  return payload;
};

export const getPlayerDetail = async (playerId, seasonParam = 'active') => {
  await bootstrapSeasons();

  const [activeOverview, allOverview, activeSeason, seasons] = await Promise.all([
    getLeagueOverview(seasonParam),
    getLeagueOverview('all'),
    getActiveSeason(),
    getAllSeasons(),
  ]);

  const currentPlayer =
    activeOverview.leaderboard.find((item) => String(item.playerId) === String(playerId)) || null;

  const historicalPlayer =
    allOverview.leaderboard.find((item) => String(item.playerId) === String(playerId)) || null;

  if (!historicalPlayer && !currentPlayer) {
    return null;
  }

  const basePlayer = historicalPlayer || currentPlayer;
  const playerLimitlessId = String(basePlayer.limitlessPlayerId);

  const playerMatches = await TournamentMatch.findAll({
    include: [
      {
        model: Tournament,
        as: 'tournament',
      },
    ],
    where: {
      [Op.or]: [
        { player1LimitlessId: playerLimitlessId },
        { player2LimitlessId: playerLimitlessId },
      ],
    },
    order: [
      [{ model: Tournament, as: 'tournament' }, 'date', 'DESC'],
      ['phase', 'DESC'],
      ['round', 'DESC'],
    ],
  });

  const filteredMatches = playerMatches.map((match) => {
    const isPlayerOne = String(match.player1LimitlessId || '') === playerLimitlessId;
    const opponentLimitlessId = isPlayerOne ? match.player2LimitlessId : match.player1LimitlessId;

    let result = 'PENDIENTE';

    if (match.resultType === 'tie') {
      result = 'EMPATE';
    } else if (match.resultType === 'double-loss') {
      result = 'DOBLE DERROTA';
    } else if (String(match.winnerLimitlessId || '') === playerLimitlessId) {
      result = 'VICTORIA';
    } else if (match.winnerLimitlessId) {
      result = 'DERROTA';
    }

    return {
      id: match.id,
      seasonKey: match.tournament?.seasonKey || null,
      round: match.round,
      phase: match.phase,
      tableNumber: match.tableNumber,
      matchLabel: match.matchLabel,
      result,
      opponentLimitlessId: opponentLimitlessId || null,
      tournamentId: match.tournament?.limitlessTournamentId || null,
      tournamentName: match.tournament?.name || '-',
      shortName: match.tournament?.shortName || '-',
      tournamentDate: match.tournament?.date || null,
    };
  });

  return {
    player: {
      playerId: basePlayer.playerId,
      limitlessPlayerId: basePlayer.limitlessPlayerId,
      name: basePlayer.name,
      country: basePlayer.country,
    },
    activeSeason: activeSeason
      ? {
          id: activeSeason.id,
          key: activeSeason.key,
          name: activeSeason.name,
          year: activeSeason.year,
          seasonNumber: activeSeason.seasonNumber,
          startsAt: activeSeason.startsAt,
          endsAt: activeSeason.endsAt,
        }
      : null,
    seasons: seasons.map((season) => ({
      id: season.id,
      key: season.key,
      name: season.name,
      year: season.year,
      seasonNumber: season.seasonNumber,
      startsAt: season.startsAt,
      endsAt: season.endsAt,
    })),
    currentSeason: currentPlayer,
    historical: historicalPlayer,
    matches: filteredMatches,
  };
};

export const getPointRules = async () => {
  const rules = await getPointRulesCollection();
  return sortRules(rules);
};
export const savePointRules = async (rules = []) => {
  const transaction = await sequelize.transaction();
  try {
    await PointRule.destroy({ where: {}, transaction });
    const payload = sortRules(rules)
      .filter((rule) => Number(rule.placingFrom) > 0 &&
        Number(rule.placingTo) > 0)
      .map((rule, index) => ({
        label: rule.label || 'Regla personalizada',
        minPlayers: Number(rule.minPlayers || 1),
        maxPlayers:
          rule.maxPlayers === null || rule.maxPlayers === ''
            ? null
            : Number(rule.maxPlayers),
        placingFrom: Number(rule.placingFrom),
        placingTo: Number(rule.placingTo),
        points: Number(rule.points || 0),
        sortOrder: Number(rule.sortOrder || index + 1),
      }));
    if (payload.length) {
      await PointRule.bulkCreate(payload, { transaction });
    }
    await recalculateStoredPoints(transaction);
    await transaction.commit();
    return getPointRules();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}