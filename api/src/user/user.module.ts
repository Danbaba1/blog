import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { UploadController } from './controller/upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UserEntity } from './models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => AuthModule),
    MulterModule.register({
      dest: './uploads',
    }),
    CloudinaryModule
  ],
  providers: [UserService],
  controllers: [UserController, UploadController],
  exports: [UserService]
})
export class UserModule { }
