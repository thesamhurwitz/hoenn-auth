import { createLogger, format, transports } from 'winston';

import { config } from './config';

const prettyJson = format.printf(info => {
  if (typeof info.message === 'object') {
    info.message = JSON.stringify(info.message, null, 4);
  }
  return `${info.level}: ${info.message}`;
});

const logger = createLogger({
  transports: [
    new transports.Console({
      level: config.log.level,
      handleExceptions: true,
      format: config.node !== 'development' ?
        format.combine(format.json()) :
        format.combine(
          format.colorize(),
          format.prettyPrint(),
          format.splat(),
          format.simple(),
          prettyJson,
        )
    })
  ]
});

export default logger;
