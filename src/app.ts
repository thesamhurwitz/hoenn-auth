import { join } from 'path';
import 'reflect-metadata';
import { config } from './config';

import express, { Application } from 'express';
import { createExpressServer } from 'routing-controllers';
import logger from './logger';
import mrgn from 'morgan';

import { UserController } from './user/user.controller';

// App
const expressApp: Application = createExpressServer({
  cors: true,
  classTransformer: true,
  routePrefix: config.app.routePrefix,
  defaultErrorHandler: false,

  controllers: [ UserController ],
  middlewares: [],
  interceptors: [],
});

expressApp.use(mrgn(config.log.output));

expressApp.get(config.app.routePrefix, (req: express.Request, res: express.Response) => {
  return res.json({
    name: config.app.name,
    version: config.app.version,
    description: config.app.description,
  });
});

// Public
expressApp.use(express.static(join(__dirname, '..', 'public'), { maxAge: 31557600000 }));

expressApp.listen(config.app.port);
logger.info(`Server running on port ${config.app.port}`);
