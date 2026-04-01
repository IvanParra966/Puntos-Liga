import { Op } from 'sequelize';
import { Season } from '../models/index.js';

const DEFAULT_SEASONS_2026 = [
  {
    key: '2026-S1',
    year: 2026,
    seasonNumber: 1,
    name: 'PHOENIX LEAGUE 2026 - SEASON 1',
    startsAt: '2026-01-01',
    endsAt: '2026-03-31',
  },
  {
    key: '2026-S2',
    year: 2026,
    seasonNumber: 2,
    name: 'PHOENIX LEAGUE 2026 - SEASON 2',
    startsAt: '2026-04-01',
    endsAt: '2026-06-30',
  },
  {
    key: '2026-S3',
    year: 2026,
    seasonNumber: 3,
    name: 'PHOENIX LEAGUE 2026 - SEASON 3',
    startsAt: '2026-07-01',
    endsAt: '2026-09-30',
  },
  {
    key: '2026-S4',
    year: 2026,
    seasonNumber: 4,
    name: 'PHOENIX LEAGUE 2026 - SEASON 4',
    startsAt: '2026-10-01',
    endsAt: '2026-12-31',
  },
];

const toDateOnly = (value) => {
  if (!value) return null;
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const bootstrapSeasons = async () => {
  for (const season of DEFAULT_SEASONS_2026) {
    const [record] = await Season.findOrCreate({
      where: { key: season.key },
      defaults: season,
    });

    await record.update({
      year: season.year,
      seasonNumber: season.seasonNumber,
      name: season.name,
      startsAt: season.startsAt,
      endsAt: season.endsAt,
    });
  }
};

export const getAllSeasons = async () => {
  return Season.findAll({
    order: [
      ['year', 'DESC'],
      ['seasonNumber', 'DESC'],
    ],
  });
};

export const findSeasonForTournamentDate = async (dateValue) => {
  const dateOnly = toDateOnly(dateValue);
  if (!dateOnly) return null;

  return Season.findOne({
    where: {
      startsAt: { [Op.lte]: dateOnly },
      endsAt: { [Op.gte]: dateOnly },
    },
    order: [
      ['year', 'DESC'],
      ['seasonNumber', 'DESC'],
    ],
  });
};

export const getActiveSeason = async () => {
  const manual = await Season.findOne({
    where: { isActiveManual: true },
  });

  if (manual) return manual;

  const today = toDateOnly(new Date());

  return Season.findOne({
    where: {
      startsAt: { [Op.lte]: today },
      endsAt: { [Op.gte]: today },
    },
    order: [
      ['year', 'DESC'],
      ['seasonNumber', 'DESC'],
    ],
  });
};

export const getSeasonByKey = async (seasonKey) => {
  if (!seasonKey) return null;
  return Season.findOne({ where: { key: seasonKey } });
};