/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Attributes } from '@opentelemetry/api';

export const API_LABELS_METADATA_KEY = Symbol('apiLabels');

/**
 * Decorator function for adding API labels to a method.
 * @param options - The API labels to be added to the method.
 * @returns The method decorator.
 */
export function ApiLabels(options: Attributes): MethodDecorator | any {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
    const originalMethod = descriptor.value;
    Reflect.defineMetadata(API_LABELS_METADATA_KEY, options, target, propertyKey);

    descriptor.value = function (...args: any[]) {
      const [req] = args;

      if (req && typeof req === 'object') {
        req.controllerName = Reflect.getMetadata('controllerName', target, propertyKey);
        req.methodName = Reflect.getMetadata('methodName', target, propertyKey);
      }

      return originalMethod.apply(this, args);
    };
  };
}
