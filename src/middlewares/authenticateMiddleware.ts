import * as express from 'express';
import { ExpressMiddlewareInterface, UnauthorizedError } from 'routing-controllers';
import { config } from 'src/config';
import { Logger } from 'src/logger';
import { SessionService } from 'src/auth/session-storage.service';
import { Service } from 'typedi';

@Service()
export class AuthenticateMiddleware implements ExpressMiddlewareInterface {
  constructor(
    private log: Logger,
    private sessionService: SessionService
  ) {}

  public async use(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
    const sessionId = req.cookies[config.session.cookieName];
    const strictSessionId = req.cookies[config.session.cookieStrictName];

    if (!sessionId) {
      this.log.info('No session cookie found', { ip: req.ip, userAgent: req.header['user-agent'] });
      return next(new UnauthorizedError('Could not authorize the user'));
    }

    if (config.session.useCsrfDoubleCookie &&
      req.method !== 'GET' &&
      sessionId !== strictSessionId
    ) {
      this.log.info('CSRF cookie does not exist or does not match session cookie');
    }

    const session = await this.sessionService.get(sessionId);

    if (!session) {
      this.log.info('Wrong session cookie', { ip: req.ip, userAgent: req.header['user-agent'], sid: sessionId });
      return next(new UnauthorizedError('Could not authorize the user'));
    }

    this.log.info('Successfully authenticated user', { ...session, key: '--removed--' });

    req.session = session;
    req.user = session.user;
    return next();
  }
}
