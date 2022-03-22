import { Action } from 'routing-controllers';
import { config } from '../../config';
import logger from '../../logger';

export default async function authorizationChecker(action: Action, roles: string[]): Promise<boolean> {
  if (roles.length > 0) {
    return false;
  }

  const sessionId = action.request.cookies[config.session.cookieName];

  if (!sessionId) {
    logger.warn('No session id cookie found');
    return false;
  }

  // if (credentials === undefined) {
  //     log.warn('No credentials given');
  //     return false;
  // }

  // action.request.user = await authService.validateUser(credentials.username, credentials.password);
  // if (action.request.user === undefined) {
  //     log.warn('Invalid credentials given');
  //     return false;
  // }

  logger.info('Successfully checked credentials');
  return true;
}
