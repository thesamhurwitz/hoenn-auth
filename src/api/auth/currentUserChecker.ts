import { User } from '@prisma/client';
import { Action } from 'routing-controllers';

export default async function currentUserChecker(action: Action): Promise<User | null> {
  return action.request.user;
}
