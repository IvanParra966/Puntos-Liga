import { sequelize } from '../config/database.js';
import { env } from '../config/env.js';
import { Player, PointRule, SyncState, Tournament, TournamentResult } from '../models/index.js';
import { fetchAllCatamarcaTournaments, fetchTournamentStandings } from './limitlessService.js';
import { makeTournamentShortName } from '../utils/text.js';

const sortRules = (rules = []) => {
  return [...rules].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    if (a.minPlayers !== b.minPlayers) return a.minPlayers - b.minPlayers;
    if ((a.maxPlayers || 999999) !== (b.maxPlayers || 999999)) return (a.maxPlayers || 999999) - (b.maxPlayers || 999999);
    if (a.placingFrom !== b.placingFrom) return a.placingFrom - b.placingFrom;
    return a.placingTo - b.placingTo;
  });
};

const getPointRulesCollection = async (transaction = null) => {
  const rules = await PointRule.findAll({
    order: [['sortOrder', 'ASC'], ['minPlayers', 'ASC'], ['placingFrom', 'ASC']],
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
    const matchesPlayers = safePlayersCount >= Number(rule.minPlayers)
      && (rule.maxPlayers === null || safePlayersCount <= Number(rule.maxPlayers));

    const matchesPlacing = safePlacing >= Number(rule.placingFrom)
      && safePlacing <= Number(rule.placingTo);

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

    await result.update({
      pointsAwarded: resolvePoints(playersCount, result.placing, rules),
    }, { transaction });
  }
};

export const syncCatamarcaLeague = async () => {
  await updateSyncState({
    status: 'running',
    message: 'Sincronizando torneos de Catamarca...',
    startedAt: new Date(),
  });

  try {
    const rules = await getPointRulesCollection();
    const tournaments = await fetchAllCatamarcaTournaments();
    let savedResults = 0;
    const skipped = [];

    for (const tournamentData of tournaments) {
      try {
        const standings = await fetchTournamentStandings(tournamentData.id);
        const playersCount = Number(tournamentData.players || standings.length || 0);

        let tournamentRecord = await Tournament.findOne({
          where: { limitlessTournamentId: tournamentData.id },
        });

        if (tournamentRecord) {
          await tournamentRecord.update({
            organizerId: tournamentData.organizerId,
            game: tournamentData.game,
            format: tournamentData.format || null,
            name: tournamentData.name,
            shortName: makeTournamentShortName(tournamentData.name),
            date: tournamentData.date,
            playersCount,
            keywordTag: env.limitless.keyword,
          });
        } else {
          tournamentRecord = await Tournament.create({
            limitlessTournamentId: tournamentData.id,
            organizerId: tournamentData.organizerId,
            game: tournamentData.game,
            format: tournamentData.format || null,
            name: tournamentData.name,
            shortName: makeTournamentShortName(tournamentData.name),
            date: tournamentData.date,
            playersCount,
            keywordTag: env.limitless.keyword,
          });
        }

        await TournamentResult.destroy({ where: { tournamentId: tournamentRecord.id } });

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
          });

          savedResults += 1;
        }
      } catch (error) {
        skipped.push({ tournamentId: tournamentData.id, name: tournamentData.name, error: error.message });
      }
    }

    const payload = {
      tournaments: tournaments.length,
      results: savedResults,
      skipped,
      keyword: env.limitless.keyword,
      organizerId: env.limitless.organizerId,
      game: env.limitless.game,
    };

    await updateSyncState({
      status: 'success',
      message: `Sincronización finalizada. ${tournaments.length} torneos revisados.`,
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

export const getLeagueOverview = async () => {
  const tournaments = await Tournament.findAll({
    order: [['date', 'DESC']],
  });

  const results = await TournamentResult.findAll({
    include: [
      { model: Player, as: 'player' },
      { model: Tournament, as: 'tournament' },
    ],
    order: [
      [{ model: Tournament, as: 'tournament' }, 'date', 'DESC'],
      ['placing', 'ASC'],
    ],
  });

  const syncState = await SyncState.findOne({ where: { syncKey: 'catamarca' } });
  const rules = await getPointRulesCollection();
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
    row.bestFinish = row.bestFinish === null ? result.placing : Math.min(row.bestFinish, result.placing);

    if (result.placing === 1) {
      row.firstPlaces += 1;
    }

    row.history.push({
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
    });

    totalMatches += result.matchesPlayed;
    totalPointsAwarded += result.pointsAwarded;
  }

  const leaderboard = Array.from(leaderboardMap.values())
    .map((row) => ({
      ...row,
      averagePlacing: row.tournamentsPlayed ? Number((row.totalPlacings / row.tournamentsPlayed).toFixed(2)) : null,
      history: row.history.sort((a, b) => new Date(b.date) - new Date(a.date)),
    }))
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.firstPlaces !== a.firstPlaces) return b.firstPlaces - a.firstPlaces;
      if (b.tournamentsPlayed !== a.tournamentsPlayed) return b.tournamentsPlayed - a.tournamentsPlayed;
      if ((a.averagePlacing || 999) !== (b.averagePlacing || 999)) return (a.averagePlacing || 999) - (b.averagePlacing || 999);
      return a.name.localeCompare(b.name);
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return {
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
    })),
    rules,
    leaderboard,
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
      .filter((rule) => Number(rule.placingFrom) > 0 && Number(rule.placingTo) > 0)
      .map((rule, index) => ({
        label: rule.label || 'Regla personalizada',
        minPlayers: Number(rule.minPlayers || 1),
        maxPlayers: rule.maxPlayers === null || rule.maxPlayers === '' ? null : Number(rule.maxPlayers),
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
};
