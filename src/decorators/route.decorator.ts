import 'reflect-metadata';

export const ROUTE_METADATA_KEY = Symbol('route');

export function Route(path: string = '/'): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;

    console.log("*".repeat(50));
    console.log("Route defined decorator called");
    console.log("Original Path:", path);
    console.log("Normalized path:", normalizedPath);
    console.log("Target (prototype):", target);
    console.log("Target's constructor name:", target.constructor.name);
    console.log("Property key:", propertyKey);
    console.log("Descriptor:", descriptor);
    console.log("*".repeat(50));

    Reflect.defineMetadata(ROUTE_METADATA_KEY, normalizedPath, target, propertyKey);
  };
}

export function getRouteMetadata(target: Object, propertyKey: string | symbol): string | undefined {
  console.log("*".repeat(50));
  console.log("Route Get decorator called");
  console.log("Target (prototype):", target);
  console.log("Target's constructor name:", target.constructor.name);
  console.log("Property key:", propertyKey);
  console.log("*".repeat(50));
  const result = Reflect.getMetadata(ROUTE_METADATA_KEY, target, propertyKey);
  console.log("Result:", result);
  return result;
}
