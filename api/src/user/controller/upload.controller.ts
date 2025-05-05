import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Param, Delete, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { UserService } from '../service/user.service';
import { AuthGuard } from '@nestjs/passport';
import { Observable, from, switchMap } from 'rxjs';

@Controller('upload')
export class UploadController {
    constructor(
        private cloudinaryService: CloudinaryService,
        private userService: UserService
    ) { }

    @Post('profile-image')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfileImage(@UploadedFile() file, @Req() req): Promise<any> {
        const userId = req.user.user.id;

        // Upload the image to Cloudinary
        const uploadResult = await this.cloudinaryService.uploadImage(file);

        // Update the user with the new profile image URL
        return this.userService.updateUserProfileImage(
            userId,
            uploadResult.secure_url,
            uploadResult.public_id
        );
    }

    @Delete('profile-image/:userId')
    @UseGuards(AuthGuard('jwt'))
    async deleteProfileImage(@Param('userId') userId: number, @Req() req): Promise<Observable<any>> {
        // Make sure the user can only delete their own image
        if (req.user.user.id !== userId) {
            throw new Error('Unauthorized');
        }

        // Get the user to find their current profile image public ID
        return from(this.userService.findOne(userId)).pipe(
            switchMap(async (user) => {
                if (user && user.profileImageId) {
                    // Delete from Cloudinary
                    await this.cloudinaryService.deleteImage(user.profileImageId);

                    // Update user record
                    return this.userService.updateUserProfileImage(userId, null, null);
                }
                return { message: 'No profile image to delete' };
            })
        );
    }

    // In your UploadController, add this test endpoint
    @Post('test-upload')
    @UseInterceptors(FileInterceptor('file'))
    async testUpload(@UploadedFile() file): Promise<any> {
        try {
            const result = await this.cloudinaryService.uploadImage(file);
            return {
                success: true,
                url: result.secure_url,
                publicId: result.public_id
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}