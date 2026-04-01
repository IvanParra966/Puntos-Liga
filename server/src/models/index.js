import { sequelize } from '../config/database.js';
import { definePlayer } from './Player.js';
import { defineTournament } from './Tournament.js';
import { defineTournamentResult } from './TournamentResult.js';
import { defineTournamentMatch } from './TournamentMatch.js';
import { defineSeason } from './Season.js';
import { definePointRule } from './PointRule.js';
import { defineSyncState } from './SyncState.js';

export const Player = definePlayer(sequelize);
export const Season = defineSeason(sequelize);
export const Tournament = defineTournament(sequelize);
export const TournamentResult = defineTournamentResult(sequelize);
export const TournamentMatch = defineTournamentMatch(sequelize);
export const PointRule = definePointRule(sequelize);
export const SyncState = defineSyncState(sequelize);

Season.hasMany(Tournament, {
  foreignKey: 'seasonId',
  as: 'tournaments',
});

Tournament.belongsTo(Season, {
  foreignKey: 'seasonId',
  as: 'season',
});

Tournament.hasMany(TournamentResult, {
  foreignKey: 'tournamentId',
  as: 'results',
  onDelete: 'CASCADE',
});

TournamentResult.belongsTo(Tournament, {
  foreignKey: 'tournamentId',
  as: 'tournament',
});

Player.hasMany(TournamentResult, {
  foreignKey: 'playerId',
  as: 'results',
  onDelete: 'CASCADE',
});
TournamentResult.belongsTo(Player, {
  foreignKey: 'playerId',
  as: 'player',
});

Tournament.hasMany(TournamentMatch, {
  foreignKey: 'tournamentId',
  as: 'matches',
  onDelete: 'CASCADE',
});

TournamentMatch.belongsTo(Tournament, {
  foreignKey: 'tournamentId',
  as: 'tournament',
});

Season.hasMany(TournamentMatch, {
  foreignKey: 'seasonId',
  as: 'matches',
});

TournamentMatch.belongsTo(Season, {
  foreignKey: 'seasonId',
  as: 'season',
});

export const syncModels = async () => {
  await sequelize.sync({ alter: true });
};