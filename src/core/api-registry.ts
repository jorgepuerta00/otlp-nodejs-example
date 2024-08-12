import 'reflect-metadata';
import { API_LABELS_METADATA_KEY } from '../decorators/api-labels.decorator';
import { AppLogger } from '../logger/app.logger';
import { Attributes } from '@opentelemetry/api';

const logger = new AppLogger();

const apiRegistry = new Map<string, Attributes>();

/**
 * Registers all the methods in the given controllers annotated with @ApiLabelAttributes.
 * @param controllers Array of controller classes to scan for @ApiLabelAttributes metadata.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function registerApis(controllers: Function[]): void {
  controllers.forEach(controller => {
    const prototype = controller.prototype;
    const controllerName = controller.name;

    Object.getOwnPropertyNames(prototype).forEach(methodName => {
      if (methodName !== 'constructor') {
        const metadata = Reflect.getMetadata(API_LABELS_METADATA_KEY, prototype, methodName) as Attributes | undefined;

        if (metadata) {
          const methodKey = `${controllerName}.${methodName}`;
          apiRegistry.set(methodKey, metadata);
          logger.withFields(metadata).info(`Registered API labels for ${controllerName}.${methodName}`);
        }
      }
    });
  });
}

/**
  * Finds the API label for the given method.
  * @param controllerName The name of the controller.
  * @param methodName The name of the method.
  * @returns The API label if found, otherwise undefined.
 */
export function findApiLabel(controllerName: string, methodName: string): Attributes | undefined {
  const methodKey = `${controllerName}.${methodName}`;
  return apiRegistry.get(methodKey);
}