import { Request, Response, NextFunction } from 'express';
import { incrementRequestCounter, incrementResponseCounter } from '../core/metrics';
import { getControllerRegistry } from '../core/metadata-scanner';
import { getRouteMetadata } from '../decorators/route.decorator';
import { HTTP_METHOD_METADATA_KEY } from '../decorators/http-method.decorator';

export function requestMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('Request metrics middleware', { method: req.method, path: req.path });

    const registry = getControllerRegistry();
    let matchedPath: string | undefined;
    let api: string | undefined;
    let endpoint: string | undefined;

    registry.forEach((controllerMetadata) => {
      controllerMetadata.methods.forEach(methodMetadata => {
        const { path: methodPath, methodName } = methodMetadata;
        const basePath = controllerMetadata.basePath;
        const fullPath = `${basePath}${methodPath}`;

        // Create a regex to match request paths with the registered path, considering dynamic segments
        const regexPath = fullPath.replace(/:[^\s/]+/g, '([\\w-]+)');
        const regex = new RegExp(`^${regexPath}$`);

        // Fetch the expected HTTP method for the current method
        const expectedMethod = Reflect.getMetadata(HTTP_METHOD_METADATA_KEY, controllerMetadata.controllerClass.prototype, methodName);

        if (regex.test(req.path) && req.method === expectedMethod) {
          matchedPath = `${basePath}${getRouteMetadata(controllerMetadata.controllerClass.prototype, methodName)}`;
          api = basePath;
          endpoint = methodName;
          console.log(`Matched route: ${matchedPath}, Method: ${req.method}, API: ${api}, Endpoint: ${endpoint}`);
        }
      });
    });

    if (!matchedPath) {
      console.warn(`No matching route found for path: ${req.path} with method: ${req.method}`);
      matchedPath = req.path; // Fallback to original path
    }

    console.log('Resolved route path:', matchedPath);
    console.log('API:', api);
    console.log('Endpoint:', endpoint);

    incrementRequestCounter({ path: matchedPath, method: req.method, api, endpoint });

    res.on('finish', () => {
      incrementResponseCounter({ path: matchedPath!, method: req.method, statuscode: res.statusCode, api, endpoint });
    });

    next();
  } catch (error) {
    console.error('Error in requestMetricsMiddleware:', error);
    next();
  }
}
