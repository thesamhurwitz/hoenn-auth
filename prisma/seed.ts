import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function generateHash(password): Promise<string> {
  return bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));
}

export async function seedDatabase(prisma: PrismaClient) {
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@hoenn.club',
      role: 'ADMIN',
      hash: await generateHash('admin_password')
    }
  });

  const tester = await prisma.user.upsert({
    where: { username: 'tester' },
    update: {},
    create: {
      username: 'tester',
      email: 'tester@hoenn.club',
      role: 'USER',
      hash: await generateHash('tester_password')
    }
  });

  return {
    users: {
      admin,
      tester
    }
  };
}

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
