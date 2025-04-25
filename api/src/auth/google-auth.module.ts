// google-auth.module.ts
import { Module } from '@nestjs/common';
import { GoogleStrategy } from './google.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [GoogleStrategy],
  exports: [GoogleStrategy]
})
export class GoogleAuthModule {}