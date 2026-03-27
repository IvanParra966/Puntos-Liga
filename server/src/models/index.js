import { sequelize } from '../config/database.js';
import { definePlayer } from './Player.js';
import { defineTournament } from './Tournament.js';
import { defineTournamentResult } from './TournamentResult.js';
import { definePointRule } from './PointRule.js';
import { defineSyncState } from './SyncState.js';

export const Player = definePlayer(sequelize);
export const Tournament = defineTournament(sequelize);
export const TournamentResult = defineTournamentResult(sequelize);
export const PointRule = definePointRule(sequelize);
export const SyncState = defineSyncState(sequelize);

Tournament.hasMany(TournamentResult, { foreignKey: 'tournamentId', as: 'results', onDelete: 'CASCADE' });
TournamentResult.belongsTo(Tournament, { foreignKey: 'tournamentId', as: 'tournament' });

Player.hasMany(TournamentResult, { foreignKey: 'playerId', as: 'results', onDelete: 'CASCADE' });
TournamentResult.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

export const syncModels = async () => {
  await sequelize.sync({ alter: true });
};
