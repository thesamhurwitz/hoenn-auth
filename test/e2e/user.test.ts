import { bootstrap } from './bootstrap';
import request from 'supertest';


describe('/api/user', () => {
  let ctx: Awaited<ReturnType<typeof bootstrap>>;
  beforeAll(async () => {
    try {
      ctx = await bootstrap();
    } catch (e) {
      console.error(e);
    }
  });

  afterAll(async () => {
    ctx.prisma.$disconnect();
  });

  describe('POST /signin', () => {
    test('Should not signin with wrong username', async () => {
      const response = await request(ctx.app)
        .post('/api/user/signin')
        .send({
          username: 'non-existing',
          password: 'password'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.name).toBe('UnauthorizedError');
      expect(response.body.message).toBe('User with such username does not exist');
    });

    test('Should not signin with wrong password', async () => {
      const response = await request(ctx.app)
        .post('/api/user/signin')
        .send({
          username: 'admin',
          password: 'wrong_password'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.name).toBe('UnauthorizedError');
      expect(response.body.message).toBe('Wrong password');
    });

    test('Should sign in a user with correct credentials and set cookie', async () => {
      const response = await request(ctx.app)
        .post('/api/user/signin')
        .send({
          username: 'tester',
          password: 'tester_password'
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect('set-cookie', /sid=.*;/);

      expect(response.body.username).toBe('tester');
      expect(response.body.email).toBe('tester@hoenn.club');
    });
  });

  describe('POST /signup', () => {
    test('Should not create user with existing username', async () => {
      const response = await request(ctx.app)
        .post('/api/user/signup')
        .send({
          username: 'tester',
          email: 'tester@hoenn.club',
          password: 'password'
        })
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body.name).toBe('BadRequestError');
      expect(response.body.message).toBe('User with such username or email already exists');
    });

    test('Should create a new user', async () => {
      const response = await request(ctx.app)
        .post('/api/user/signup')
        .send({
          username: 'new_user',
          email: 'new_user@hoenn.club',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.username).toBe('new_user');
      expect(response.body.email).toBe('new_user@hoenn.club');
      expect(response.body.role).toBe('USER');

      await request(ctx.app)
        .post('/api/user/signin')
        .send({
          username: 'new_user',
          password: 'password'
        })
        .expect(200);
    });
  });

});
