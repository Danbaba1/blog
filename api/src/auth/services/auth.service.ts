import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, forkJoin, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../user/models/user.interface';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService) { }

    generateJWT(user: User): Observable<string> {
        return from(this.jwtService.signAsync({ user }));
    }

    hashPassword(password: string): Observable<string> {
        return from<string>(bcrypt.hash(password, 12));
    }

    comparePasswords(newPassword: string, passwordHash: string): Observable<any | boolean> {
        return from(bcrypt.compare(newPassword, passwordHash));
    }

    checkPreviousPasswords(
        newPasswordPlain: string,
        hashedPreviousPasswords: string[],
    ): Observable<boolean> {
        if (!hashedPreviousPasswords || hashedPreviousPasswords.length === 0) {
            return of(true); // No previous passwords to check against  
        }

        const comparisons = hashedPreviousPasswords.map(oldPasswordHash =>
            this.comparePasswords(newPasswordPlain, oldPasswordHash)
        );

        return forkJoin(comparisons).pipe(
            map(results => {

                const passwordReused = results.some(result => result === true);

                if (passwordReused) {
                    throw new BadRequestException(
                        'New password cannot be the same as any of the last 3 passwords.'
                    );
                }

                return true; // No password reuse detected
            })
        );
    }
}