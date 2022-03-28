import { Role } from '@prisma/client';
import { IResult } from 'ua-parser-js';

export interface UserPayload {
  username: string,
  email: string,
  role: Role
}

export interface SessionPayload {
  ip?: string,
  device?: IResult,
  location?: string,
  createdAt: Date,
  lastAccess: Date,
  expires: Date,
  user: UserPayload
}
