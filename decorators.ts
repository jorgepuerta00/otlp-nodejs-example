import 'reflect-metadata';

const ROUTE_METADATA_KEY = Symbol('route');

export function Route(path: string): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
    Reflect.defineMetadata(ROUTE_METADATA_KEY, path, target, propertyKey);
  };
}

export function getRoutePath(target: any, propertyKey: string | symbol): string | undefined {
  return Reflect.getMetadata(ROUTE_METADATA_KEY, target, propertyKey);
}
