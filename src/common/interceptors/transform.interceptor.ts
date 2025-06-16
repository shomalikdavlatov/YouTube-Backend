import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export default class TransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();
    if (this.reflector.get('isFreeResponse', handler)) return next.handle();
    return next.handle().pipe(
      // @ts-ignore
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
