import { Body, CurrentUser, Get, JsonController, Post, Req, Res } from 'routing-controllers';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as authService from './auth.service';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { config } from '../../config';

@JsonController('/auth')
export class AuthController {
  @Post('/signup')
  async signup(@Body() signupDto: SignupDto) {
    return authService.signup(signupDto);
  }

  @Post('/signin')
  async signin(@Body() signinDto: SigninDto, @Req() req: Request, @Res() res: Response) {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    const data = await authService.signin(signinDto, userAgent, ip);

    res.cookie(config.session.cookieName, data.sessionId, {
      httpOnly: config.session.cookieHttpOnly,
      maxAge: config.session.cookieMaxAge * 1000,
      domain: config.session.cookieDomain,
      path: config.session.cookiePath,
      sameSite: config.session.cookieSameSite,
      secure: config.session.cookieSecure,
    });

    return data.user;
  }

  @Get('/me')
  async me(@CurrentUser() user: User, @Req() req: Request) {
    return {
      session: (req as any).sess,
      cookies: req.cookies,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };
  }

  @Get('/profile')
  async profile(@Req() req: Request) {
    return { cookies: req.cookies };
  }
}
