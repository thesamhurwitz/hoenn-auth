import crypto from 'crypto';
import { User, Session } from '@prisma/client';
import DeviceInfo from '../auth/deviceInfo';
import { config } from '../../config';
import prisma from '../../prisma';

function generateSessionId(): string {
  return crypto.randomBytes(config.session.idBytes).toString('hex');
}

export async function create(user: { id: number }, deviceInfo: DeviceInfo): Promise<Session> {
  const sessionId = generateSessionId();

  const session = prisma.session.create({
    data: {
      key: sessionId,
      device: JSON.stringify(deviceInfo.device),
      ip: deviceInfo.ip,
      location: JSON.stringify(deviceInfo.location),
      user: {
        connect: {
          id: user.id,
        },
      },
    },
    include: {
      user: true,
    },
  });

  return session;
}

export async function get(sessionId: string): Promise<Session & { user: User } | null> {
  const session = await prisma.session.findUnique({
    where: {
      key: sessionId,
    },
    include: {
      user: true,
    },
  });

  delete session.user.hash;

  if (!session) {
    return null;
  }

  // TODO: check if expired, revoked

  return session;
}

export async function list(user: User) {
  const sessions = await prisma.session.findMany({
    where: {
      user: {
        id: user.id,
      },
    },
  });

  return sessions;
}

export async function remove(sessionId: string) {
  await prisma.session.delete({
    where: {
      key: sessionId,
    },
  });
}
