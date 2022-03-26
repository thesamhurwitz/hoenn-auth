import { AuthenticateMiddleware } from 'src/middlewares/authenticateMiddleware';
import { LoggerMock } from '../LoggerMock';
import MockExpressResponse from 'mock-express-response';
import MockExpressRequest from 'mock-express-request';
import { SessionServiceMock } from '../SessionServiceMock';
import { Request } from 'express';
import { UnauthorizedError } from 'routing-controllers';



describe('AuthenticationMiddleware', () => {
  let log: LoggerMock;
  beforeEach(() => {
    log = new LoggerMock();
    jest.clearAllMocks();
  });

  test('Should not find session cookie and call next with error', async () => {
    const req: Request = new MockExpressRequest({
      cookies: {
      }
    });

    const sessionMock = new SessionServiceMock();
    sessionMock.sessions = {};

    const next = jest.fn();

    const middleware = new AuthenticateMiddleware(log, sessionMock as any);
    await middleware.use(req, new MockExpressResponse(), next);

    expect(sessionMock.getMock).not.toBeCalled();
    expect(log.infoMock).toBeCalledWith('No session id cookie found');
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(new UnauthorizedError('Could not authorize the user'));
    expect(req.user).toBeUndefined();
  });

  test('Should not find session with that session id and call next with error', async () => {
    const req: Request = new MockExpressRequest({
      cookies: {
        sid: 'test'
      }
    });

    const sessionMock = new SessionServiceMock();
    sessionMock.sessions = {};

    const next = jest.fn();

    const middleware = new AuthenticateMiddleware(log, sessionMock as any);
    await middleware.use(req, new MockExpressResponse(), next);

    expect(sessionMock.getMock).toBeCalledWith('test');
    expect(log.infoMock).toBeCalledWith('Session with such id does not exist', { sid: 'test' });
    expect(next).toBeCalledTimes(1);
    expect(next.mock.calls[0][0]).toStrictEqual(new UnauthorizedError('Could not authorize the user'));
    expect(req.user).toBeUndefined();
  });

  test('Should attach user to req object', async () => {
    const req: Request = new MockExpressRequest({
      cookies: {
        sid: 'test'
      }
    });

    const sessionMock = new SessionServiceMock();
    sessionMock.sessions = {
      test: {
        user: {
          test: true
        }
      }
    };

    const next = jest.fn();

    const middleware = new AuthenticateMiddleware(log, sessionMock as any);
    await middleware.use(req, new MockExpressResponse(), next);

    expect(sessionMock.getMock).toBeCalledWith('test');
    expect(next).toBeCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user).toStrictEqual({ test: true });
  });
});
