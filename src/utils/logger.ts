import winston from 'winston';
import { config } from '../config';

export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: config.logging.file,
      level: 'error',
    }),
    new winston.transports.File({
      filename: config.logging.file,
    }),
  ],
});

if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};