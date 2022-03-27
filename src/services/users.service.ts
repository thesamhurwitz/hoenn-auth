import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
// import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto } from '../api/users/dto/patch-user.dto';
import { Service } from 'typedi';
import { BadRequestError, NotFoundError } from 'routing-controllers';

@Service()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { skip?: number; take?: number }) {
    const { skip, take } = params;

    return this.prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async findOne(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            picture: true,
            bio: true,
            birthday: true,
            emails: true,
            gender: true,
            phone: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User with such username does not exist');
    }

    return user;
  }

  async patch(username: string, patchUserDto: PatchUserDto) {
    try {
      return await this.prisma.user.update({
        where: {
          username
        },
        data: {
          email: patchUserDto.email,
          profile: {
            upsert: {
              create: {
                birthday: patchUserDto.birthday,
                bio: patchUserDto.bio,
                emails: [patchUserDto.email], // TODO
                gender: patchUserDto.gender,
                phone: patchUserDto.phone,
                picture: patchUserDto.picture
              },
              update: {
                birthday: patchUserDto.birthday,
                bio: patchUserDto.bio,
                emails: [patchUserDto.email], // TODO
                gender: patchUserDto.gender,
                phone: patchUserDto.phone,
                picture: patchUserDto.picture
              }
            }
          },
          role: patchUserDto.role
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              bio: true,
              birthday: true,
              emails: true,
              gender: true,
              phone: true,
              picture: true
            }
          }
        }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new BadRequestError('User with such username does not exist');
        }
        if (e.code === 'P2002') {
          throw new BadRequestError('User with such email already exists');
        }
      }

      throw e;
    }
  }

  async delete(username: string) {
    try {
      return await this.prisma.user.delete({
        where: {
          username
        },
        select: {
          id: true
        }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new BadRequestError('User with such username does not exist');
        }
      }

      throw e;
    }
  }
}
