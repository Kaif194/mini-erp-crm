import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connection established successfully');

    app.listen(config.port, () => {
      logger.info(`Server running in [${config.env}] mode on port ${config.port}`);
      logger.info(`API Documentation available at http://localhost:${config.port}/api/v1/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
