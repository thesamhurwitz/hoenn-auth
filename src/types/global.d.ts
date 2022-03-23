import { Session, User } from '@prisma/client';

declare global {
  declare namespace Express {
    export interface Request {
      session?: Session & { user: User },
      user?: User
    }
  }
}
