import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { User } from '../models/user.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private authService: AuthService
    ) { }

    create(user: User): Observable<User> {
        return this.authService.hashPassword(user.password).pipe(
            switchMap((passwordHash: string) => {
                const newUser = new UserEntity();
                newUser.name = user.name;
                newUser.username = user.username;
                newUser.email = user.email;
                newUser.password = passwordHash;
                return from(this.userRepository.save(newUser)).pipe(
                    map((user: User) => {
                        const { password, ...result } = user;
                        return result;
                    }),
                    catchError(error => throwError(error))
                );
            })
        );
    }

    findOrCreateGoogleUser(profile: any): Observable<User> {
        const email = profile.emails[0].value;

        return this.findByMail(email).pipe(
            switchMap((existingUser: User) => {
                // If user exists, return it
                if (existingUser) {
                    const { password, ...result } = existingUser;
                    return of(result);
                }

                // Create new user if not exists
                const newUser = new UserEntity();
                newUser.email = email;
                newUser.name = `${profile.name.givenName} ${profile.name.familyName}`;
                newUser.username = email.split('@')[0];
                // Generate random password for Google users
                const randomPassword = crypto.randomBytes(32).toString('hex');

                return this.authService.hashPassword(randomPassword).pipe(
                    switchMap((passwordHash: string) => {
                        newUser.password = passwordHash;
                        return from(this.userRepository.save(newUser)).pipe(
                            map((user: User) => {
                                const { password, ...result } = user;
                                return result;
                            })
                        );
                    })
                );
            })
        );
    }

    findOne(id: number): Observable<User> {
        return from(this.userRepository.findOne({ where: { id } })).pipe(
            map((user: User) => {
                if (user) {
                    const { password, ...result } = user;
                    return result;
                }
                return null;
            })
        );
    }

    findAll(): Observable<User[]> {
        return from(this.userRepository.find()).pipe(
            map((users: User[]) => {
                users.forEach(function (v) { delete v.password });
                return users;
            })
        );
    }

    deleteOne(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }

    updateOne(id: number, user: User): Observable<any> {
        delete user.email;
        delete user.password;

        return from(this.userRepository.update(id, user));
    }

    login(user: User): Observable<string> {
        return this.validateUser(user.email, user.password).pipe(
            switchMap((user: User) => {
                if (user) {
                    return this.authService.generateJWT(user).pipe(map((jwt: string) => jwt));
                } else {
                    return 'Wrong Credentials';
                }
            })
        );

    }

    validateUser(email: string, password: string): Observable<User> {
        return this.findByMail(email).pipe(
            switchMap((user: User) => {
                if (!user) {
                    return of(null); // Return null if user not found
                }

                return this.authService.comparePasswords(password, user.password).pipe(
                    map((match: boolean) => {
                        if (match) {
                            const { password, ...result } = user;
                            return result;
                        } else {
                            throw new Error('Invalid credentials');
                        }
                    })
                )
            })
        );
    }

    // Add this method to your UserService class

    updateUserProfileImage(userId: number, imageUrl: string, imageId: string): Observable<any> {
        return from(this.userRepository.update(userId, {
            profileImageUrl: imageUrl,
            profileImageId: imageId
        })).pipe(
            switchMap(() => this.findOne(userId))
        );
    }

    findByMail(email: string): Observable<User> {
        return from(this.userRepository.findOne({ where: { email } }));
    }

    updatePassword(
        userId: number,
        newPasswordPlain: string,
    ): Observable<User> {
        return from(this.userRepository.findOne({ where: { id: userId } })).pipe(
            switchMap((user: UserEntity) => {
                if (!user) {
                    return throwError(() => new Error('User not found'));
                }

                return this.authService.checkPreviousPasswords(
                    newPasswordPlain,
                    user.previousPasswords || []
                ).pipe(
                    switchMap(() => this.updateUserWithNewPassword(user, newPasswordPlain)),
                    catchError(error => throwError(() => error))
                );
            })
        );
    }

    private updateUserWithNewPassword(user: UserEntity, newPasswordPlain: string): Observable<User> {
        return this.authService.hashPassword(newPasswordPlain).pipe(
            switchMap((newPasswordHash: string) => {
                user.previousPasswords = [
                    newPasswordHash,
                    ...(user.previousPasswords || []).slice(0, 2) // Keep only the last 3 passwords
                ];

                user.password = newPasswordHash;

                return from(this.userRepository.save(user)).pipe(
                    map((updatedUser: User) => {
                        const { password, ...result } = updatedUser;
                        return result;
                    }),
                    catchError(error => throwError(() => error))
                );
            })
        );
    }
}
