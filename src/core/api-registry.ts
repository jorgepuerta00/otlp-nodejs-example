import 'reflect-metadata';
import { API_LABELS_METADATA_KEY } from '../decorators/api-labels.decorator';
import { AppLogger } from '../logger/app.logger';

const logger = new AppLogger();

type AttributeValue = string | number | boolean | null;

/**
 * ApiLabelAttributes is a map from string to attribute values.
 */
export interface ApiLabelAttributes {
  [key: string]: AttributeValue | undefined;
}

interface ApiLabel extends ApiLabelAttributes {
  method: string;
  path: string;
  api: string;
  endpoint: string;
}

const apiRegistry = new Map<string, ApiLabel[]>();

/**
 * Registers all the methods in the given controllers annotated with @ApiLabels.
 * @param controllers Array of controller classes to scan for @ApiLabels metadata.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function registerApis(controllers: Function[]): void {
  logger.info('Scanning controllers for API labels...');

  controllers.forEach(controller => {
    const prototype = controller.prototype;
    const controllerName = controller.name;

    if (!apiRegistry.has(controllerName)) {
      apiRegistry.set(controllerName, []);
    }

    Object.getOwnPropertyNames(prototype).forEach(methodName => {
      if (methodName !== 'constructor') {
        const metadata = Reflect.getMetadata(API_LABELS_METADATA_KEY, prototype, methodName) as ApiLabel | undefined;

        if (metadata) {
          apiRegistry.get(controllerName)?.push({ ...metadata, endpoint: methodName });
        } else {
          logger.warn(`No @ApiLabels found for ${controllerName}.${methodName}`);
        }
      }
    });

    logger.info(`Completed registration for controller: ${controllerName}`);
  });
}

/**
 * Retrieves all registered API labels.
 * @returns A map of controller names to their respective API labels.
 */
export function getApiRegistry(): Map<string, ApiLabel[]> {
  logger.info('Fetching API registry...');
  return apiRegistry;
}

/**
 * Finds the ApiLabel metadata for a given HTTP method and path.
 * @param method The HTTP method (GET, POST, etc.)
 * @param path The request path.
 * @returns The corresponding ApiLabel metadata, or undefined if not found.
 */
export function findApiLabel(method: string, path: string): ApiLabel | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [controllerName, apiLabels] of apiRegistry) {
      for (const label of apiLabels) {
        // Normalize the path by removing leading slashes and replace path parameters with regex
        const normalizedPath = label.path.replace(/^\//, '').replace(/:[^\s/]+/g, '([^/]+)');
  
        // Construct full regex with optional base path
        const fullPath = `${label.api.replace(/\/$/, '')}/${normalizedPath}`;
        const regexPath = fullPath.replace(/\//g, '\\/');
        const regex = new RegExp(`^${regexPath}$`);
  
        if (regex.test(path) && label.method.toUpperCase() === method.toUpperCase()) {
          return label;
        }
      }
    }
  
    logger.warn(`No matching route found for method: ${method}, path: ${path}`);
    return undefined;
}