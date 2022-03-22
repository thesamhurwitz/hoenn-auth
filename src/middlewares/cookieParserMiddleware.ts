import * as express from 'express';
import cookieParser from 'cookie-parser';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

@Middleware({ type: 'before' })
export class CookieParserMiddleware implements ExpressMiddlewareInterface {
  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    return cookieParser()(req, res, next);
  }
}
