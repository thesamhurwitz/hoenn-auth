import { Service } from 'typedi';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User } from '@prisma/client';
import { SignupDto } from 'src/api/user/dto/signup.dto';
import { SigninDto } from 'src/api/user/dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { AuthPayload } from 'src/api/user/auth-payload';
import { BadRequestError, NotFoundError, UnauthorizedError } from 'routing-controllers';
import userAgentParser from 'ua-parser-js';
import DeviceInfo from 'src/auth/deviceInfo';
import { SessionService } from 'src/auth/session-storage.service';

@Service()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private sessionService: SessionService
  ) {}

  private async generateHash(password): Promise<string> {
    return bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
  }

  private async validateHash(password, hash): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public async signup(signupDto: SignupDto) {
    const hash = await this.generateHash(signupDto.password);

    try {
      return await this.prisma.user.create({
        data: {
          username: signupDto.username,
          email: signupDto.email,
          hash
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestError(
            'User with such username or email already exists.',
          );
        }
      }

      throw e;
    }
  }

  public async signin(signinDto: SigninDto, userAgent: string, ip: string): Promise<{ user: Partial<User>, sessionId: string }> {
    const user = await this.prisma.user.findUnique({
      where: {
        username: signinDto.username
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        hash: true
      }
    });

    if (!user) {
      throw new UnauthorizedError(
        'User with such username does not exist.',
      );
    }

    if (!(await this.validateHash(signinDto.password, user.hash))) {
      throw new UnauthorizedError('Wrong password.');
    }

    const deviceInfo: DeviceInfo = {
      ip,
      device: userAgentParser(userAgent),
      location: {}
    };

    const session = await this.sessionService.create(user, deviceInfo);

    const { hash, ...result } = user;

    return {
      user: result,
      sessionId: session.key
    };
  }

  public async getProfile(payload: AuthPayload) {
    const user = this.prisma.user.findUnique({
      where: {
        username: payload.username
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundError();
    }

    return user;
  }

}
