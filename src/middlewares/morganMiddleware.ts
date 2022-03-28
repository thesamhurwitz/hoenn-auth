import * as express from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import morgan from 'morgan';
import { config } from 'src/config';
import { Logger } from 'src/logger';


@Middleware({ type: 'before' })
export class MorganMiddleware implements ExpressMiddlewareInterface {
  private middleware: ReturnType<typeof morgan>;

  constructor(
    private readonly logger: Logger
  ) {
    this.middleware = morgan(config.log.output, {
      stream: { write: message => this.logger.info(message) }

    });
  }

  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    return this.middleware(req, res, next);
  }
}
