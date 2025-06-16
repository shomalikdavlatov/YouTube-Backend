import { CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

export default class AuthGuard implements CanActivate{
    constructor(private reflector: Reflector, private jwtService: JwtService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const handler = context.getHandler();
        if (this.reflector.get('isFreeAuth', handler)) return true;
        const request = context.switchToHttp().getRequest();
        const token = request.cookies['jwt'];
        try {
            request.user = await this.jwtService.verifyAsync(token);
            return true;
        } catch(error) {
            throw new ForbiddenException("Token is invalid!");
        }

    }
}