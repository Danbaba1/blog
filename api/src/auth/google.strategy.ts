import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { UserService } from "src/user/service/user.service";
import * as dotenv from "dotenv";
dotenv.config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
            scope: ["email", "profile"],
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        try {
            const user = await this.userService.findOrCreateGoogleUser(profile).toPromise();

            if (user) {
                return done(null, user);
            } else {
                return done(new Error("Failed to auhtenticate user"), null);
            }
        } catch (error) {
            return done(error, null);
        }
    }
}