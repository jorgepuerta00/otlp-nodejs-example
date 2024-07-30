import 'reflect-metadata';

export const CONTROLLER_METADATA_KEY = Symbol('controller');

export function Controller(basePath: string): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(CONTROLLER_METADATA_KEY, basePath, target);
    console.log(`Controller defined: ${target.name}, Base path: ${basePath}`);
  };
}
