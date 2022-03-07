/* eslint-disable @typescript-eslint/no-use-before-define */
import * as dotenv from 'dotenv';
import * as path from 'path';

import * as pkg from '../package.json';


dotenv.config({ path: path.join(process.cwd(), `.env${((process.env.NODE_ENV === 'test') ? '.test' : '')}`) });

export const config = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  app: {
    name: getEnv('APP_NAME'),
    version: (pkg as any).version,
    description: (pkg as any).description,
    host: getEnv('APP_HOST'),
    schema: getEnv('APP_SCHEMA'),
    routePrefix: getEnv('APP_ROUTE_PREFIX'),
    port: toNumber(getEnv('APP_PORT')),
  },
  log: {
    level: getEnv('LOG_LEVEL'),
    json: toBool(getEnvOptional('LOG_JSON')),
    output: getEnv('LOG_OUTPUT'),
  },
  // db: {
  //     type: getOsEnv('DB_CONNECTION'),
  //     host: getOsEnvOptional('DB_HOST'),
  //     port: toNumber(getOsEnvOptional('DB_PORT')),
  //     username: getOsEnvOptional('DB_USERNAME'),
  //     password: getOsEnvOptional('DB_PASSWORD'),
  //     database: getOsEnv('DB_DATABASE'),
  //     synchronize: toBool(getOsEnvOptional('DB_SYNCHRONIZE')),
  //     logging: getOsEnv('DB_LOGGING'),
  // },
  // swagger: {
  //     enabled: toBool(getOsEnv('SWAGGER_ENABLED')),
  //     route: getOsEnv('SWAGGER_ROUTE'),
  //     username: getOsEnv('SWAGGER_USERNAME'),
  //     password: getOsEnv('SWAGGER_PASSWORD'),
  // },
};

export function getEnv(key: string): string {
  if (typeof process.env[key] === 'undefined') {
    throw new Error(`Environment variable ${key} is not set.`);
  }

  return process.env[key] as string;
}

export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}

export function getEnvArray(key: string, delimiter: string = ','): string[] {
  return process.env[key] && process.env[key].split(delimiter) || [];
}

export function toNumber(value: string): number {
  return parseInt(value, 10);
}

export function toBool(value: string): boolean {
  return value === 'true';
}
