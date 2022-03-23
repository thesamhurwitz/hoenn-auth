import * as express from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { config } from 'src/config';
import logger from 'src/logger';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  public isProduction = config.isProduction;

  public error(error: HttpError, req: express.Request, res: express.Response): void {
    const code = error.httpCode || 500;

    res.status(code);

    if (code >= 500) {
      res.json({
        name: 'Internal server error',
        message: 'Internal server error'
      });

      logger.error('Internal server error occurred', { name: error.name, message: error.message });
    } else {
      res.json({
        name: error.name,
        message: error.message
      });

      logger.info('Http error occurred', { code: error.httpCode, name: error.name, message: error.message });
    }
  }
}
