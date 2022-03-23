import MockExpressResponse from 'mock-express-response';
// import { HttpError } from 'routing-controllers';

import { ErrorHandlerMiddleware } from 'src/middlewares/errorHandlerMiddleware';

import logger from 'src/logger';
import { HttpError } from 'routing-controllers';
jest.mock('src/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('ErrorHandlerMiddleware', () => {
  let middleware;
  let res;
  beforeEach(() => {
    middleware = new ErrorHandlerMiddleware();
    res = new MockExpressResponse();
    jest.clearAllMocks();
  });

  test('Should respond with internal server error on error without status code', () => {
    middleware.isProduction = true;

    const error = new Error('Test Error');

    middleware.error(error, undefined, res, undefined);

    expect(res.statusCode).toBe(500);
    const json = res._getJSON();
    expect(json).toStrictEqual({
      name: 'Internal server error',
      message: 'Internal server error'
    });
    expect(logger.error).toHaveBeenCalledWith(
      'Internal server error occurred',
      { name: error.name, message: error.message },
    );
    expect(logger.info).not.toHaveBeenCalled();
  });

  test('Should respond with correct error', () => {
    middleware.isProduction = true;

    const error = new HttpError(401, 'Test Error');

    middleware.error(error, undefined, res, undefined);

    expect(res.statusCode).toBe(error.httpCode);
    const json = res._getJSON();
    expect(json).toStrictEqual({
      name: error.name,
      message: error.message
    });
    expect(logger.info).toHaveBeenCalledWith(
      'Http error occurred',
      { code: error.httpCode, name: error.name, message: error.message }
    );
    expect(logger.error).not.toHaveBeenCalled();
  });
});
