import 'reflect-metadata';
import { API_LABELS_METADATA_KEY } from '../decorators/api-labels.decorator';

interface ApiLabel {
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
export function registerApis(controllers: Function[]): void {
  console.info('Scanning controllers for API labels...');

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
          console.warn(`No @ApiLabels found for ${controllerName}.${methodName}`);
        }
      }
    });

    console.info(`> Completed registration for controller: ${controllerName}`);
  });
}

/**
 * Retrieves all registered API labels.
 * @returns A map of controller names to their respective API labels.
 */
export function getApiRegistry(): Map<string, ApiLabel[]> {
  console.info('Fetching API registry...');
  return apiRegistry;
}

/**
 * Finds the ApiLabel metadata for a given HTTP method and path.
 * @param method The HTTP method (GET, POST, etc.)
 * @param path The request path.
 * @returns The corresponding ApiLabel metadata, or undefined if not found.
 */
export function findApiLabel(method: string, path: string): ApiLabel | undefined {
    for (const [controllerName, apiLabels] of apiRegistry) {
      for (const label of apiLabels) {
        // Normalize the path by removing leading slashes and replace path parameters with regex
        let normalizedPath = label.path.replace(/^\//, '').replace(/:[^\s/]+/g, '([^/]+)');
  
        // Construct full regex with optional base path
        const fullPath = `${label.api.replace(/\/$/, '')}/${normalizedPath}`;
        const regexPath = fullPath.replace(/\//g, '\\/');
        const regex = new RegExp(`^${regexPath}$`);
  
        if (regex.test(path) && label.method.toUpperCase() === method.toUpperCase()) {
          return label;
        }
      }
    }
  
    console.warn(`No matching route found for method: ${method}, path: ${path}`);
    return undefined;
}