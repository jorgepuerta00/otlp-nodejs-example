import { Request, Response, NextFunction } from 'express';
import { incrementRequestCounter, incrementResponseCounter } from '../core/metrics';
import { findApiLabel } from '../core/api-registry';

export function requestMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    console.info('Request metrics middleware', { method: req.method, path: req.path });

    const apiLabel = findApiLabel(req.method, req.path);

    let matchedPath = req.path;
    let api = 'unknown';
    let endpoint = 'unknown';

    if (apiLabel) {
      matchedPath = `${apiLabel.api}${apiLabel.path}`;
      api = apiLabel.api;
      endpoint = apiLabel.endpoint;
      console.info(`Matched route: ${matchedPath}, Method: ${req.method}, API: ${api}, Endpoint: ${endpoint}`);
    } else {
      console.warn(`No matching route found for path: ${req.path} with method: ${req.method}`);
    }

    incrementRequestCounter({ api, endpoint, path: matchedPath, method: req.method });

    res.on('finish', () => {
      incrementResponseCounter({ api, endpoint, path: matchedPath, method: req.method, statuscode: res.statusCode });
    });

    next();
  } catch (error) {
    console.error('Error in requestMetricsMiddleware:', error);
    next();
  }
}
