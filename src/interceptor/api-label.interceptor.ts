/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { API_LABELS_KEY } from '../decorators/api-label-nestjs.decorator';

/**
 * Interceptor for applying API labels to the request.
 * @param context - The execution context.
 * @param next - The call handler.
 * @returns The observable.
*/
@Injectable()
export class ApiLabelsInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const apiLabels = this.reflector.get(API_LABELS_KEY, context.getHandler());
    const controllerName = context.getClass().name;
    const methodName = context.getHandler().name;
    const request = context.switchToHttp().getRequest();

    if (apiLabels) {
      request.apiLabels = apiLabels;
      request.controllerName = controllerName;
      request.methodName = methodName;
    }

    return next.handle();
  }
}
