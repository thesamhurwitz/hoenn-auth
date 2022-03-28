import { Action } from 'routing-controllers';
import { Logger } from 'src/logger';
import Container from 'typedi';

/**
 * @deprecated Routing controllers default checkers should not be user. Use authenticateMiddleware with decorator instead.
 */
export default async function authorizationChecker(action: Action, roles: string[]): Promise<boolean> {
  const log = Container.get(Logger);
  log.warn('Deprecated authorization checker is used');

  return false;
}
