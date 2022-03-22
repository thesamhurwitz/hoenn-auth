import * as express from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { config } from '../config';
import logger from '../logger';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  public isProduction = config.isProduction;

  public error(error: HttpError, req: express.Request, res: express.Response): void {
    const code = error.httpCode || 500;

    res.status(code);

    if (code === 500) {
      res.json({
        name: 'Internal server error',
        message: 'Internal server error',
      });
    }

    res.json({
      name: error.name,
      message: error.message,
      errors: (error as any).errors || [],
    });

    if (this.isProduction) {
      logger.error(error.name, error.message);
    } else {
      logger.error(error.name, error.stack);
    }
  }
}
