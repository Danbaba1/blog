import { Controller, Post, Body, Get, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Post()
    create(@Body()user: User): Observable<User | Object> {
        return this.userService.create(user).pipe(
            map((user: User) => user),
            catchError(err => of({error: err.message}))
        );
    }

    @Post('login')
    login(@Body()user: User): Observable<Object> {
        return this.userService.login(user).pipe(
            map((jwt: string) => {
                return { access_token: jwt };
            })
        );
    }

    @Get(':id')
    findOne(@Param()params): Observable<User> {
        return this.userService.findOne(params.id);
    }

    @Get()
    findAll(): Observable<User[]> {
        return this.userService.findAll();
    }

    @Delete(':id')
    deleteOne(@Param('id')id: string): Observable<User> {
        return this.userService.deleteOne(Number(id));
    }

    @Put(':id')
    updateOne(@Param('id') id : string, @Body() user: User): Observable<User> {
        return this.userService.updateOne(Number(id), user);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/password')
    updatePassword(
        @Param('id') id:string,
        @Body() passwordData: { newPassword: string },
        @Req() req: Request
    ): Observable<User | Object> {
        if (req.user && req.user.id !== Number(id)) {
            return of({ error: 'Forbidden: You can only update your own password.', statusCode: 403 });
        }

        return this.userService.updatePassword(Number(id), passwordData.newPassword).pipe(
            map((user: User) => user),
            catchError(err => of({ error: err.message }))
        );
    }
}
