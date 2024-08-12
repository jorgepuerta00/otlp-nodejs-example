import { Attributes } from '@opentelemetry/api';
import 'reflect-metadata';

export const API_LABELS_METADATA_KEY = Symbol('apiLabels');

/**
 * Decorator function for adding API labels to a method.
 * @param options - The API labels to be added to the method.
 */
export function ApiLabels(options: Attributes): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const [req, res, next] = args;

      req.controllerName = target.constructor.name;
      req.methodName = propertyKey;

      return originalMethod.apply(this, args);
    };

    Reflect.defineMetadata(API_LABELS_METADATA_KEY, options, target, propertyKey);
  };
}

/**
 * Retrieves the API labels for a given method.
 * @param target - The object to retrieve metadata from.
 * @param propertyKey - The property key to retrieve metadata from.
 * @returns The API labels for the method.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function getApiLabels(target: Object, propertyKey: string | symbol): Attributes | undefined {
  return Reflect.getMetadata(API_LABELS_METADATA_KEY, target, propertyKey);
}
