import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return false;
        }

        let token: string;
        if (authHeader.startsWith('Bearer ')) {

            token = authHeader.split(' ')[1];

        } else {
            token = authHeader;
        }

        try {
            const decoded = this.jwtService.verify(token);
            request.user = decoded.user;
            return true;
        } catch (err) {
            return false;
        }
    }
}