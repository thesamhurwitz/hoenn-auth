import { config } from './config'

import { configure, format, transports } from 'winston';

configure({
  transports: [
    new transports.Console({
      level: config.log.level,
      handleExceptions: true,
      format: config.node !== 'development' ? format.combine(format.json()) : format.combine(format.colorize(), format.simple()),
    }),
  ],
})
