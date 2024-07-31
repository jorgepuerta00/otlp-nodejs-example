import 'reflect-metadata';
import { ApiLabelAttributes } from '../core/api-registry';

export const API_LABELS_METADATA_KEY = Symbol('apiLabels');

/**
 * Decorator function for adding API labels to a method.
 * @param options - The API labels to be added to the method.
 */
export function ApiLabels(options: ApiLabelAttributes): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
    Reflect.defineMetadata(API_LABELS_METADATA_KEY, options, target, propertyKey);
  };
}

/**
 * Retrieves the API labels for a given method.
 * @param target - The object to retrieve metadata from.
 * @param propertyKey - The property key to retrieve metadata from.
 * @returns The API labels for the method.
 */
export function getApiLabels(target: Object, propertyKey: string | symbol): ApiLabelAttributes | undefined {
  return Reflect.getMetadata(API_LABELS_METADATA_KEY, target, propertyKey);
}
