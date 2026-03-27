import { PointRule, SyncState } from '../models/index.js';

const defaultRules = [
  {
    label: 'Hasta 8 jugadores',
    minPlayers: 1,
    maxPlayers: 8,
    placingFrom: 1,
    placingTo: 1,
    points: 50,
    sortOrder: 1,
  },
  {
    label: 'Hasta 8 jugadores',
    minPlayers: 1,
    maxPlayers: 8,
    placingFrom: 2,
    placingTo: 2,
    points: 25,
    sortOrder: 2,
  },
  {
    label: 'Hasta 8 jugadores',
    minPlayers: 1,
    maxPlayers: 8,
    placingFrom: 3,
    placingTo: 4,
    points: 10,
    sortOrder: 3,
  },
  {
    label: 'Hasta 8 jugadores',
    minPlayers: 1,
    maxPlayers: 8,
    placingFrom: 5,
    placingTo: 8,
    points: 1,
    sortOrder: 4,
  },
  {
    label: 'Más de 8 jugadores',
    minPlayers: 9,
    maxPlayers: null,
    placingFrom: 1,
    placingTo: 1,
    points: 100,
    sortOrder: 5,
  },
  {
    label: 'Más de 8 jugadores',
    minPlayers: 9,
    maxPlayers: null,
    placingFrom: 2,
    placingTo: 2,
    points: 60,
    sortOrder: 6,
  },
  {
    label: 'Más de 8 jugadores',
    minPlayers: 9,
    maxPlayers: null,
    placingFrom: 3,
    placingTo: 4,
    points: 45,
    sortOrder: 7,
  },
  {
    label: 'Más de 8 jugadores',
    minPlayers: 9,
    maxPlayers: null,
    placingFrom: 5,
    placingTo: 8,
    points: 25,
    sortOrder: 8,
  },
  {
    label: 'Más de 8 jugadores',
    minPlayers: 9,
    maxPlayers: null,
    placingFrom: 9,
    placingTo: 16,
    points: 10,
    sortOrder: 9,
  },
  {
    label: 'Más de 8 jugadores',
    minPlayers: 9,
    maxPlayers: null,
    placingFrom: 17,
    placingTo: 20,
    points: 5,
    sortOrder: 10,
  },
];

const needsReset = async () => {
  const currentRules = await PointRule.findAll({ order: [['sortOrder', 'ASC'], ['id', 'ASC']] });

  if (currentRules.length !== defaultRules.length) {
    return true;
  }

  return currentRules.some((rule) => !rule.label || !rule.placingFrom || !rule.placingTo);
};

export const seedPointRules = async () => {
  if (await needsReset()) {
    await PointRule.destroy({ where: {} });
    await PointRule.bulkCreate(defaultRules);
  }
};

export const seedSyncState = async () => {
  await SyncState.findOrCreate({
    where: { syncKey: 'catamarca' },
    defaults: {
      status: 'idle',
      message: 'Sin sincronizaciones todavía',
    },
  });
};
