import { Request, Response, NextFunction } from 'express';
import { incrementRequestCounter, incrementResponseCounter } from '../core/metrics';
import { getControllerRegistry } from '../core/metadata-scanner';
import { getRouteMetadata } from '../decorators/route.decorator';

export function requestMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('Request metrics middleware', { method: req.method, path: req.path });

    const registry = getControllerRegistry();
    let matchedPath: string | undefined;

    // Iterate through the controller registry to find a match
    registry.forEach((controllerMetadata) => {
      controllerMetadata.methods.forEach(methodMetadata => {
        const { path: methodPath, methodName } = methodMetadata;
        const basePath = controllerMetadata.basePath;

        // Combine base path and method path
        const fullPath = `${basePath}${methodPath}`;

        // Create a regex to match request paths with the registered path, considering dynamic segments
        const regexPath = fullPath.replace(/:[^\s/]+/g, '([\\w-]+)');
        const regex = new RegExp(`^${regexPath}$`);

        if (regex.test(req.path)) {
          matchedPath = `${basePath}${getRouteMetadata(controllerMetadata.controllerClass.prototype, methodName)}`;
          console.log(`Matched route: ${matchedPath}`);
        }
      });
    });

    // If no match is found, fallback to the original request path
    matchedPath = matchedPath || req.path;

    console.log('Resolved route path:', matchedPath);

    // Use the matched path for metrics
    incrementRequestCounter(matchedPath, req.method);

    res.on('finish', () => {
      incrementResponseCounter(matchedPath!, req.method, res.statusCode);
    });

    next();
  } catch (error) {
    console.error('Error in requestMetricsMiddleware:', error);
    next();
  }
}