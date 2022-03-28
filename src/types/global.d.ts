import { Session, User } from '@prisma/client';
import { SessionPayload, UserPayload } from 'src/auth/session-payload';

declare global {
  declare namespace Express {
    export interface Request {
      session: SessionPayload,
      user: UserPayload
    }
  }
}
