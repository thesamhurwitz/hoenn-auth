import { Session, User } from '@prisma/client';

declare global {
  declare namespace Express {
    export interface Request {
      session?: Partial<Session> & { user: partial<User> },
      user?: Partial<User>
    }
  }
}
