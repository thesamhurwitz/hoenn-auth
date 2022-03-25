import * as express from 'express';
import { ExpressMiddlewareInterface, UnauthorizedError } from 'routing-controllers';
import { config } from 'src/config';
import { Logger } from 'src/logger';
import { SessionService } from 'src/api/auth/session.service';
import Container from 'typedi';

export class AuthenticateMiddleware implements ExpressMiddlewareInterface {
  constructor(
    private log: Logger,
    private sessionService: SessionService
  ) {}

  public async use(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
    const sessionId = req.cookies[config.session.cookieName];

    if (!sessionId) {
      this.log.warn('No session id cookie found');
      return next(new UnauthorizedError('Could not authorize the user'));
    }

    const session = await this.sessionService.get(sessionId);

    if (!session) {
      return next(new UnauthorizedError('Could not authorize the user'));
    }

    req.session = session;
    req.user = session.user;
    return next();
  }
}
