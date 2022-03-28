import { Service } from 'typedi';
import crypto from 'crypto';
import { User } from '@prisma/client';
import DeviceInfo from './deviceInfo';
import { config } from 'src/config';
import { PrismaService } from 'src/prisma.service';
import { Logger } from 'src/logger';
import { SessionPayload, UserPayload } from './session-payload';


@Service()
export class SessionService {
  constructor(
    private log: Logger,
    private prisma: PrismaService
  ) {}


  public async create(user: UserPayload, deviceInfo: DeviceInfo): Promise<{ key: string, payload: SessionPayload }> {
    this.log.info('Create session', { user, deviceInfo });

    const sessionId = this.generateSessionId();

    const session = await this.prisma.session.create({
      data: {
        key: sessionId,
        expires: new Date(Date.now() + config.session.maxAge * 1000),
        device: JSON.stringify(deviceInfo.device),
        ip: deviceInfo.ip,
        location: JSON.stringify(deviceInfo.location),
        user: {
          connect: {
            username: user.username
          }
        }
      },
      select: {
        key: true,
        createdAt: true,
        expires: true,
        lastAccess: true,
        ip: true,
        device: true,
        location: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    });

    return {
      key: session.key,
      payload: {
        ip: session.ip,
        device: JSON.parse(session.device.toString()),
        location: JSON.parse(session.location.toString()),
        expires: session.expires,
        createdAt: session.createdAt,
        lastAccess: session.lastAccess,
        user: {
          username: session.user.username,
          email: session.user.email,
          role: session.user.role
        }
      }
    };
  }

  public async get(sessionKey: string): Promise<SessionPayload> {
    this.log.info('Get session');

    const session = await this.prisma.session.findUnique({
      where: {
        key: sessionKey
      },
      select: {
        key: true,
        createdAt: true,
        expires: true,
        lastAccess: true,
        ip: true,
        device: true,
        location: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    });

    if (!session) {
      this.log.info('Session key does not exist');
      return null;
    }

    if (session.expires < new Date()) {
      this.log.warn('Session in database expired');
      return null;
    }

    this.log.debug('Successfully retrieved session', { ...session, key: '--removed--' });

    return {
      ip: session.ip,
      device: JSON.parse(session.device.toString()),
      location: JSON.parse(session.location.toString()),
      expires: session.expires,
      createdAt: session.createdAt,
      lastAccess: session.lastAccess,
      user: {
        username: session.user.username,
        email: session.user.email,
        role: session.user.role
      }
    };
  }

  public async list(user: UserPayload, currentSessionId?: string) {
    this.log.info('List sessions', { user });

    const sessions = await this.prisma.session.findMany({
      where: {
        user: {
          username: user.username
        },
        expires: {
          gte: new Date()
        }
      },
      select: {
        key: true,
        createdAt: true,
        expires: true,
        lastAccess: true,
        ip: true,
        device: true,
        location: true
      }
    });

    const result = sessions.map((session) => {
      return {
        ...(session.key === currentSessionId) && { current: true },
        ip: session.ip,
        device: JSON.parse(session.device.toString()),
        location: JSON.parse(session.location.toString()),
        expires: session.expires,
        createdAt: session.createdAt,
        lastAccess: session.lastAccess
      };
    });

    return result;
  }

  public async destroy(sessionId: string): Promise<void> {
    this.log.info('Destroy session');

    await this.prisma.session.delete({
      where: {
        key: sessionId
      }
    });
  }

  public async destroyAll(user: User): Promise<void> {
    this.log.info('Destroy all sessions', { user });

    await this.prisma.session.deleteMany({
      where: {
        user: {
          id: user.id
        }
      }
    });
  }

  public async destroyAllButCurrent(user: UserPayload, currentSessionId: string) {
    this.log.debug('Destroy all, but current', user);

    await this.prisma.session.deleteMany({
      where: {
        AND: {
          user: {
            username: user.username
          },
          NOT: {
            key: currentSessionId
          }
        }
      }
    });
  }

  public async cleanUp() {
    this.log.info('Session cleanup');
    await this.prisma.session.deleteMany({
      where: {
        expires: {
          lte: new Date()
        }
      }
    });
  }

  private generateSessionId(): string {
    return crypto.randomBytes(config.session.idBytes).toString('hex');
  }
}
