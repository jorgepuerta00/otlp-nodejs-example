import { Request, Response, NextFunction } from 'express';
import { incrementRequestCounter } from './metrics';
import { getRoutePath } from './decorators';

export function requestMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const routeStack = req.route?.stack || [];
  const handler = routeStack.length > 0 ? routeStack[0].handle : null;

  if (handler) {
    const route = getRoutePath(handler, handler.name) || req.path;
    incrementRequestCounter(route.toString(), req.method);
  } else {
    incrementRequestCounter(req.path, req.method);
  }

  next();
}
