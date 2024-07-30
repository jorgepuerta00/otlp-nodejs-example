import 'reflect-metadata';

export const HTTP_METHOD_METADATA_KEY = Symbol('httpMethod');

export function HttpMethod(method: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
    Reflect.defineMetadata(HTTP_METHOD_METADATA_KEY, method, target, propertyKey);
  };
}
