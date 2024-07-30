import 'reflect-metadata';

export const API_RESOURCE_METADATA_KEY = Symbol('api_resource');

export function ApiResource(basePath: string): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(API_RESOURCE_METADATA_KEY, basePath, target);
    console.log(`ApiResource defined: ${target.name}, Base path: ${basePath}`);
  };
}
