import 'reflect-metadata';
import { CONTROLLER_METADATA_KEY } from '../decorators/controller.decorator';
import { ROUTE_METADATA_KEY } from '../decorators/route.decorator';

interface MethodMetadata {
  path: string;
  methodName: string;
}

interface ControllerMetadata {
  basePath: string;
  methods: MethodMetadata[];
  controllerClass: Function; 
}

const controllerRegistry = new Map<string, ControllerMetadata>();

export function scanControllers(controllers: Function[]): void {
  console.log('Starting controller scanning...');
  controllers.forEach(controller => {
    const controllerPath = Reflect.getMetadata(CONTROLLER_METADATA_KEY, controller);
    if (!controllerPath) {
      console.warn(`No base path found for controller: ${controller.name}`);
      return;
    }

    console.log(`Registering controller: ${controller.name}, Base path: ${controllerPath}`);
    const prototype = controller.prototype;

    const methods = Object.getOwnPropertyNames(prototype)
      .filter(methodName => methodName !== 'constructor')
      .map(methodName => {
        const routePath = Reflect.getMetadata(ROUTE_METADATA_KEY, prototype, methodName);
        if (routePath) {
          console.log(`  Registering route: ${routePath}, Method: ${methodName}`);
          return { path: routePath, methodName };
        } else {
          console.warn(`  No route path found for method: ${methodName}`);
        }
        return null;
      })
      .filter((method): method is MethodMetadata => method !== null);

    controllerRegistry.set(controller.name, { basePath: controllerPath, methods, controllerClass: controller });
    console.log(`Controller ${controller.name} registered successfully.\n`);
  });
  console.log('Controller scanning completed.');
}

export function getControllerRegistry(): Map<string, ControllerMetadata> {
  console.log('Fetching controller registry...');
  return controllerRegistry;
}
