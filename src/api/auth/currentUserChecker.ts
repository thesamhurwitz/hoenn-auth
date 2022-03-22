import { User } from '@prisma/client';
import { Action } from 'routing-controllers';
import logger from '../../logger';
import { config } from '../../config';
import * as sessionService from '../session/session.service';

export default async function currentUserChecker(action: Action): Promise<User | null> {
  const sessionId = action.request.cookies[config.session.cookieName];

  if (!sessionId) {
    logger.warn('No session id cookie found');
    return null;
  }

  const session = await sessionService.get(sessionId);

  action.request.sess = session;

  return session.user;
}
