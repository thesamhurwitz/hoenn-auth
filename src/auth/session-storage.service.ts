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
      return null;
    }

    if (session.expires < new Date()) {
      this.log.info('Session cookie expired');
      return null;
    }

    return session;
  }

  public async list(user: User, currentSessionId?: string) {
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
    await this.prisma.session.delete({
      where: {
        key: sessionId
      }
    });
  }

  public async destroyAll(user: User): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        user: {
          id: user.id
        }
      }
    });
  }

  public async destroyAllButCurrent(user: User, currentSessionId: string) {
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
