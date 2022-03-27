import { Body, CurrentUser, Get, JsonController, Post, Req, Res } from 'routing-controllers';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UserService } from 'src/services/user.service';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { config } from 'src/config';
import { Authenticate } from 'src/auth/authenticate.decorator';

@JsonController('/user')
export class UserController {
  constructor(
    private userService: UserService,
  ) {}

  @Post('/signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.userService.signup(signupDto);
  }

  @Post('/signin')
  async signin(@Body() signinDto: SigninDto, @Req() req: Request, @Res() res: Response) {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    const data = await this.userService.signin(signinDto, userAgent, ip);

    res.cookie(config.session.cookieName, data.sessionId, {
      httpOnly: config.session.cookieHttpOnly,
      maxAge: config.session.maxAge * 1000,
      domain: config.session.cookieDomain,
      path: config.session.cookiePath,
      sameSite: config.session.cookieSameSite,
      secure: config.session.cookieSecure
    });

    return data.user;
  }

  @Authenticate()
  @Get('/me')
  async me(@CurrentUser() user: User, @Req() req: Request) {
    return {
      session: req.session,
      user: user,
      cookies: req.cookies,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };
  }

  @Get('/profile')
  async profile(@Req() req: Request) {
    return { cookies: req.cookies };
  }
}
