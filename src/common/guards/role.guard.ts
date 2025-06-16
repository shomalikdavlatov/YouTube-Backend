import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export default class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const handler = context.getHandler();
        const roles = this.reflector.get('roles', handler);
        if (roles.include(request.user.userRole)) return true;
        if (roles.include('OWNER') && request.params.id === request.user.userId) return true;
        throw new ForbiddenException("You do not have credentials!");
    }
}