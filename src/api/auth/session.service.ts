import crypto from 'crypto';
import { User, Session } from '@prisma/client';
import DeviceInfo from './deviceInfo';
import { config } from 'src/config';
import prisma from 'src/prisma';
import logger from 'src/logger';

function generateSessionId(): string {
  return crypto.randomBytes(config.session.idBytes).toString('hex');
}

export async function create(user: { id: number }, deviceInfo: DeviceInfo): Promise<Session> {
  const sessionId = generateSessionId();

  const session = prisma.session.create({
    data: {
      key: sessionId,
      expires: new Date(Date.now() + config.session.maxAge * 1000),
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

export async function get(sessionId: string): Promise<(Session & { user: User }) | null> {
  const session = await prisma.session.findUnique({
    where: {
      key: sessionId,
    },
    include: {
      user: true,
    },
  });


  if (!session) {
    return null;
  }

  if (session.expires < new Date()) {
    logger.info('Session cookie expired');
    return null;
  }

  delete session.user.hash;

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

export async function destroy(sessionId: string) {
  await prisma.session.delete({
    where: {
      key: sessionId,
    },
  });
}

export async function cleanUp() {
  await prisma.session.deleteMany({
    where: {
      expires: {
        lte: new Date(),
      },
    },
  });
}

// destroyAllUserSessions(user)
// destroyAllButCurrent(user, sessionId)

