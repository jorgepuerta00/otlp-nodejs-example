import 'reflect-metadata';

export const ROUTE_METADATA_KEY = Symbol('route');

export function Route(path: string = '/'): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    console.log("Route defined decorator called", { path, normalizedPath, target, propertyKey });

    Reflect.defineMetadata(ROUTE_METADATA_KEY, normalizedPath, target, propertyKey);
  };
}

export function getRouteMetadata(target: Object, propertyKey: string | symbol): string | undefined {
  const result = Reflect.getMetadata(ROUTE_METADATA_KEY, target, propertyKey);
  console.log("Route Get decorator called", { target, propertyKey, result });
  return result;
}
