import { Service } from 'typedi';
import crypto from 'crypto';
import { User } from '@prisma/client';
import DeviceInfo from './deviceInfo';
import { config } from 'src/config';
import { PrismaService } from 'src/prisma.service';
import { Logger } from 'src/logger';


@Service()
export class SessionService {
  constructor(
    private log: Logger,
    private prisma: PrismaService
  ) {}


  public async create(user: { id: number }, deviceInfo: DeviceInfo) {
    this.log.info('Create session', { user, deviceInfo });

    const sessionId = this.generateSessionId();

    const session = this.prisma.session.create({
      data: {
        key: sessionId,
        expires: new Date(Date.now() + config.session.maxAge * 1000),
        device: JSON.stringify(deviceInfo.device),
        ip: deviceInfo.ip,
        location: JSON.stringify(deviceInfo.location),
        user: {
          connect: {
            id: user.id
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

    return session;
  }

  public async get(sessionId: string) {
    this.log.info('Get session');

    const session = await this.prisma.session.findUnique({
      where: {
        key: sessionId
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

    return session;
  }

  public async list(user: User, currentSessionId?: string) {
    this.log.info('List sessions', { user });

    const sessions = await this.prisma.session.findMany({
      where: {
        user: {
          id: user.id
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
      const { key, ...rest } = session;

      return {
        ...(key === currentSessionId) && { current: true },
        ...rest
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

  public async destroyAllButCurrent(user: User, currentSessionId: string) {
    this.log.debug('Destroy all, but current', user);

    await this.prisma.session.deleteMany({
      where: {
        AND: {
          user: {
            id: user.id
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
