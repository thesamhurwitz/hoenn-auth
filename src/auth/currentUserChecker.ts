import { Action } from 'routing-controllers';
import { UserPayload } from './session-payload';

export default async function currentUserChecker(action: Action): Promise<UserPayload> {
  return action.request.user;
}
