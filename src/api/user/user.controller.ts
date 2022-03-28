import { Body, CurrentUser, Get, JsonController, Post, Req, Res } from 'routing-controllers';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UserService } from 'src/services/user.service';
import { Request, Response } from 'express';
import { config } from 'src/config';
import { Authenticate } from 'src/auth/authenticate.decorator';
import { SessionService } from 'src/auth/session-storage.service';
import { UserPayload } from 'src/auth/session-payload';

@JsonController('/user')
export class UserController {
  constructor(
    private userService: UserService,
    private sessionService: SessionService
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
      httpOnly: config.isProduction,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: config.session.maxAge * 1000
    });

    if (config.session.useCsrfDoubleCookie) {
      res.cookie(config.session.cookieStrictName, data.sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: config.session.maxAge * 1000
      });
    }

    return data.user;
  }

  @Authenticate()
  @Get('/me')
  async me(@CurrentUser() user: UserPayload, @Req() req: Request) {
    return {
      session: req.session,
      user: user
    };
  }

  @Authenticate()
  @Get('/profile')
  async profile(@CurrentUser() user: UserPayload) {
    return this.userService.getProfile(user.username);
  }

  @Authenticate()
  @Get('/sessions')
  async getSessions(@CurrentUser() user: UserPayload, @Req() req: Request) {
    return this.sessionService.list(user, req.cookies.sid);
  }
}
