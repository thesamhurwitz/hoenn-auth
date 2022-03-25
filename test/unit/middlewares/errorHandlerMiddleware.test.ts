import MockExpressResponse from 'mock-express-response';
import { ErrorHandlerMiddleware } from 'src/middlewares/errorHandlerMiddleware';
import { HttpError } from 'routing-controllers';
import { LoggerMock } from '../LoggerMock';


describe('ErrorHandlerMiddleware', () => {
  let middleware;
  let res;
  let log: LoggerMock;
  beforeEach(() => {
    log = new LoggerMock();
    middleware = new ErrorHandlerMiddleware(log);
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
    expect(log.errorMock).toHaveBeenCalledWith(
      'Internal server error occurred',
      { name: error.name, message: error.message },
    );
    expect(log.infoMock).not.toHaveBeenCalled();
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
    expect(log.infoMock).toHaveBeenCalledWith(
      'Http error occurred',
      { code: error.httpCode, name: error.name, message: error.message }
    );
    expect(log.errorMock).not.toHaveBeenCalled();
  });
});
