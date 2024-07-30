import 'reflect-metadata';

export const API_LABELS_METADATA_KEY = Symbol('apiLabels');

interface ApiLabelsOptions {
  method: string;
  path: string;
  api: string;
  [key: string]: any; 
}

export function ApiLabels(options: ApiLabelsOptions): MethodDecorator {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
    Reflect.defineMetadata(API_LABELS_METADATA_KEY, options, target, propertyKey);
  };
}

export function getApiLabels(target: Object, propertyKey: string | symbol): ApiLabelsOptions | undefined {
  return Reflect.getMetadata(API_LABELS_METADATA_KEY, target, propertyKey);
}
