import { Controller, Post, Body, Res, Get, Req, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(body.email, body.password, body.role);
    res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return result;
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body.email, body.password);
    res.cookie('access_token', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return result;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return { user: req.user };
  }
}
