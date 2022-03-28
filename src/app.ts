import { join } from 'path';
import 'reflect-metadata';
import { config } from './config';
import express, { Application } from 'express';
import { createExpressServer } from 'routing-controllers';
import authorizationChecker from 'src/auth/authorizationChecker';
import currentUserChecker from 'src/auth/currentUserChecker';
import Container from 'typedi';
import { Logger } from './logger';

import { useContainer as classValidatorUseContainer } from 'class-validator';
import { useContainer as routingUseContainer } from 'routing-controllers';

classValidatorUseContainer(Container);
routingUseContainer(Container);

// App
const expressApp: Application = createExpressServer({
  cors: false,
  classTransformer: true,
  routePrefix: config.app.routePrefix,
  defaultErrorHandler: false,

  // TODO: move to config
  controllers: [join(__dirname + '/api/**/*.controller.ts')],
  middlewares: [join(__dirname + '/middlewares/*.ts')],
  interceptors: [],

  authorizationChecker: authorizationChecker,
  currentUserChecker: currentUserChecker
});

const logger = Container.get(Logger);

// To expose client ip address (see http://expressjs.com/en/guide/behind-proxies.html)
expressApp.set('trust proxy', true);


expressApp.get(config.app.routePrefix, (req: express.Request, res: express.Response) => {
  return res.json({
    name: config.app.name
    // version: config.app.version,
    // description: config.app.description
  });
});

// Public
expressApp.use(express.static(join(__dirname, '..', 'public'), { maxAge: 31557600000 }));

expressApp.listen(config.app.port);
logger.info(`Server running on port ${config.app.port}`);
