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
    port: toNumber(getEnv('APP_PORT'))
  },
  log: {
    level: getEnv('LOG_LEVEL'),
    json: toBool(getEnvOptional('LOG_JSON')),
    output: getEnv('LOG_OUTPUT')
  },
  session: {
    idBytes: toNumber(getEnv('SESSION_ID_BYTES')),
    useSecret: toBool(getEnv('USE_SESSION_SECRET')),
    secret: getEnv('SESSION_SECRET'),
    rotateSecrets: toBool(getEnv('ROTATE_SECRETS')),
    maxAge: toSeconds(getEnv('SESSION_MAXAGE')),
    cookieName: getEnv('SESSION_COOKIE_NAME'),
    cookieSecure: toBool(getEnv('SESSION_COOKIE_SECURE')),
    cookieHttpOnly: toBool(getEnv('SESSION_COOKIE_HTTPONLY')),
    cookieSameSite: getEnv('SESSION_COOKIE_SAMESITE') as 'lax' | 'strict' | 'none',
    cookieDomain: getEnv('SESSION_COOKIE_DOMAIN'),
    cookiePath: getEnv('SESSION_COOKIE_PATH')
  }
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

export function toSeconds(value: string): number {
  const number = parseInt(value.match(/^[0-9]*/gi)[0]);
  const unit = value.match(/[a-zA-Z]*$/gi)[0];

  switch (unit) {
    case 's':
      return number;
    case 'm':
      return number * 60;
    case 'h':
      return number * 60 * 60;
    case 'd':
      return number * 60 * 60 * 24;
    case 'mo':
      return number * 60 * 60 * 24 * 30;
    case 'y':
      return number * 60 * 60 * 24 * 365;
    default:
      return number;
  }
}
