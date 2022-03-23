import prisma from 'src/prisma';
import { Prisma, User } from '@prisma/client';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { AuthPayload } from './auth-payload';
import { BadRequestError, NotFoundError, UnauthorizedError } from 'routing-controllers';
import userAgentParser from 'ua-parser-js';
import DeviceInfo from './deviceInfo';
import * as sessionService from './session.service';

async function generateHash(password): Promise<string> {
  return bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
}

async function validateHash(password, hash): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signup(signupDto: SignupDto) {
  const hash = await generateHash(signupDto.password);

  try {
    return await prisma.user.create({
      data: {
        username: signupDto.username,
        email: signupDto.email,
        hash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
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

export async function signin(signinDto: SigninDto, userAgent: string, ip: string): Promise<{ user: Partial<User>, sessionId: string }> {
  const user = await prisma.user.findUnique({
    where: {
      username: signinDto.username,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      hash: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError(
      'User with such username does not exist.',
    );
  }

  if (!(await validateHash(signinDto.password, user.hash))) {
    throw new UnauthorizedError('Wrong password.');
  }

  const deviceInfo: DeviceInfo = {
    ip,
    device: userAgentParser(userAgent),
    location: {},
  };

  const session = await sessionService.create(user, deviceInfo);

  const { hash, ...result } = user;

  return {
    user: result,
    sessionId: session.key,
  };
}

export async function getProfile(payload: AuthPayload) {
  const user = prisma.user.findUnique({
    where: {
      username: payload.username,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      profile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError();
  }

  return user;
}
