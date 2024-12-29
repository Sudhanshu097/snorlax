import { app } from './app';
import { logger } from './utils/logger';
import { config } from './config';

const startServer = () => {
  try {
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();