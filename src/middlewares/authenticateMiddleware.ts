import * as express from 'express';
import { ExpressMiddlewareInterface, UnauthorizedError } from 'routing-controllers';
import { config } from 'src/config';
import logger from 'src/logger';
import * as sessionService from 'src/api/auth/session.service';

export class AuthenticateMiddleware implements ExpressMiddlewareInterface {
  public async use(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
    const sessionId = req.cookies[config.session.cookieName];

    if (!sessionId) {
      logger.warn('No session id cookie found');
      return next(new UnauthorizedError('Could not authorize the user'));
    }

    const session = await sessionService.get(sessionId);

    if (!session) {
      return next(new UnauthorizedError('Could not authorize the user'));
    }

    req.session = session;
    req.user = session.user;
    return next();
  }
}
