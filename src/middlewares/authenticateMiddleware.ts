import * as express from 'express';
import { ExpressMiddlewareInterface, UnauthorizedError } from 'routing-controllers';
import { config } from 'src/config';
import { Logger } from 'src/logger';
import { SessionService } from 'src/auth/session-storage.service';

export class AuthenticateMiddleware implements ExpressMiddlewareInterface {
  constructor(
    private log: Logger,
    private sessionService: SessionService
  ) {}

  public async use(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
    const sessionId = req.cookies[config.session.cookieName];

    if (!sessionId) {
      // TODO: log user's ip and user agent
      this.log.info('No session id cookie found');
      return next(new UnauthorizedError('Could not authorize the user'));
    }

    const session = await this.sessionService.get(sessionId);

    if (!session) {
      this.log.info('Session with such id does not exist', { sid: sessionId });
      return next(new UnauthorizedError('Could not authorize the user'));
    }

    req.session = session;
    req.user = session.user;
    return next();
  }
}
