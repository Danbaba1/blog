import { Get, UseGuards, Req, Res, Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('Google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() { }

  @Get('auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async callback(@Req() req, @Res() res) {
    try {
      if (!req.user) {
        return res.redirect('/login?error=authentication_failed');
      }
      const token = await firstValueFrom(this.authService.generateJWT(req.user));
      res.set('authorization', token);
      return res.json(req.user)
    } catch (error) {
      console.error('Error during Google authentication callback:', error);
      return res.redirect('/login?error=internal_server_error');
    }
}

  @Get('test123')
  @UseGuards(AuthGuard('jwt'))
  async test123(@Res() res) {
    res.json('success');
  }
}
