import { UseBefore } from 'routing-controllers';
import { AuthenticateMiddleware } from 'src/middlewares/authenticateMiddleware';

export function Authenticate(): Function {
  return UseBefore(AuthenticateMiddleware);
}
