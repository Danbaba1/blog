import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';   
import { AuthService } from './services/auth.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        forwardRef(() => AuthModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '1000s' },
            }),
        }),
    ],
    providers: [AuthService],
    exports: [AuthService, JwtModule]
})
export class AuthModule {}
