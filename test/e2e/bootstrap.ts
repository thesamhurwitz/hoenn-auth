import { join } from 'path';
import 'reflect-metadata';
import { config } from 'src/config';
import { Application } from 'express';
import { createExpressServer } from 'routing-controllers';
import authorizationChecker from 'src/auth/authorizationChecker';
import currentUserChecker from 'src/auth/currentUserChecker';
import Container from 'typedi';

import { useContainer as classValidatorUseContainer } from 'class-validator';
import { useContainer as routingUseContainer } from 'routing-controllers';

import { seedDatabase } from 'prisma/seed';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

export async function bootstrap() {
  classValidatorUseContainer(Container);
  routingUseContainer(Container);
  // App
  const expressApp: Application = createExpressServer({
    cors: false,
    classTransformer: true,
    routePrefix: config.app.routePrefix,
    defaultErrorHandler: false,


    controllers: [join(__dirname, '../../src/api/**/*.controller.ts')],
    middlewares: [join(__dirname, '../../src/middlewares/*.ts')],
    interceptors: [],

    authorizationChecker: authorizationChecker,
    currentUserChecker: currentUserChecker
  });

  // Database
  execSync('dotenv -e .env.test -- yarn prisma db push --force-reset --skip-generate --accept-data-loss');
  const prisma = new PrismaClient();
  await prisma.$connect();
  await seedDatabase(prisma);

  return {
    app: expressApp,
    prisma
  };
}

