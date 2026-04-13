import app from './app.js';
import { env } from './config/env.js';
import { ensureDatabaseExists, sequelize } from './config/database.js';
import { syncModels } from './models/index.js';
import { seedPointRules, seedSyncState, seedKeywords } from './services/seedService.js';
import { syncCatamarcaLeague } from './services/leagueService.js';

const startServer = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    await syncModels();
    await seedPointRules();
    await seedSyncState();
    await seedKeywords();

    if (env.sync.onBoot) {
      try {
        await syncCatamarcaLeague();
      } catch (error) {
        console.error('Error durante la sincronización inicial:', error.message);
      }
    }

    app.listen(env.port, () => {
      console.log(`Servidor corriendo en http://localhost:${env.port}`);
    });

    if (env.sync.intervalMinutes > 0) {
      setInterval(async () => {
        try {
          await syncCatamarcaLeague();
          console.log('Sincronización automática completada');
        } catch (error) {
          console.error('Error en sincronización automática:', error.message);
        }
      }, env.sync.intervalMinutes * 60 * 1000);
    }
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
