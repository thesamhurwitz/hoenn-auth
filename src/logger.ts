import { Service } from 'typedi';
import { createLogger, format, transports } from 'winston';

import { config } from './config';

const prettyJson = format.printf(info => {
  if (typeof info.message === 'object') {
    info.message = JSON.stringify(info.message, null, 4);
  }
  return `${info.level}: ${info.message}${info.meta ? '\n' + JSON.stringify(info.meta, null, 4) : ''}`;
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

@Service()
export class Logger {
  public debug(message: string, meta?: any): void {
    logger.log('debug', message, { meta });
  }

  public info(message: string, meta?: any): void {
    logger.log('info', message, { meta });
  }

  public warn(message: string, meta?: any): void {
    logger.log('warn', message, { meta });
  }

  public error(message: string, meta?: any): void {
    logger.log('error', message, { meta });
  }
}
