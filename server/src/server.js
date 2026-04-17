import app from './app.js';
import { ensureDatabaseExists, connectDatabase, sequelize } from './config/database.js';
import './models/index.js';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
    await ensureDatabaseExists();
    await connectDatabase();
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

bootstrap();