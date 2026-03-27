import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import { env } from './env.js';

export const ensureDatabaseExists = async () => {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();
};

export const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: env.db.logging ? console.log : false,
  define: {
    underscored: true,
    freezeTableName: false,
  },
});
