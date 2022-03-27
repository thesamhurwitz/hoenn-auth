import { Role } from '@prisma/client';

export type AuthPayload = {
  username: string;
  role: Role;
};
