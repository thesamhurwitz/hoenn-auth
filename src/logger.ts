import { createLogger, format, transports } from 'winston';

import { config } from './config';

const logger = createLogger({
  transports: [
    new transports.Console({
      level: config.log.level,
      handleExceptions: true,
      format: config.node !== 'development' ? format.combine(format.json()) : format.combine(format.colorize(), format.simple()),
    }),
  ],
});

export default logger;
