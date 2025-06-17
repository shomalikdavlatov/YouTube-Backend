import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';

@Injectable()
export default class TransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse();
    const handlerFunction = context.getHandler();
    const handlerClass = context.getClass();
    if (
      this.reflector.getAllAndOverride('isFreeResponse', [
        handlerClass,
        handlerFunction,
      ])
    )
      return next.handle();
    return next.handle().pipe(
      map((data: any) => {
        return {
          status: response.statusCode,
          ...(typeof data !== 'object' || Array.isArray(data)
            ? { data }
            : data),
        };
      }),
    );
  }
}
