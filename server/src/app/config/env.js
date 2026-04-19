import dotenv from 'dotenv';

dotenv.config();

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return String(value).toLowerCase() === 'true';
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  port: toNumber(process.env.PORT, 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  timezone: process.env.APP_TIMEZONE || 'America/Argentina/Catamarca',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'catamarca_league',
    logging: toBoolean(process.env.DB_LOGGING, false),
  },
  limitless: {
    baseUrl: process.env.LIMITLESS_BASE_URL || 'https://play.limitlesstcg.com/api',
    game: process.env.LIMITLESS_GAME || 'DCG',
    organizerId: toNumber(process.env.LIMITLESS_ORGANIZER_ID, 281),
    keyword: process.env.LIMITLESS_KEYWORD || 'CATAMARCA',
    pageSize: toNumber(process.env.LIMITLESS_PAGE_SIZE, 100),
    maxPages: toNumber(process.env.LIMITLESS_MAX_PAGES, 10),
  },
  sync: {
    onBoot: toBoolean(process.env.AUTO_SYNC_ON_BOOT, true),
    intervalMinutes: toNumber(process.env.AUTO_SYNC_INTERVAL_MINUTES, 60),
  },
};