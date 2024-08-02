import { Request, Response, NextFunction } from 'express';
import { findApiLabel } from '../core/api-registry';
import { HttpMetrics, HttpMetricsConfig } from '../metrics/httpMetrics';
import { AppLogger } from '../logger/app.logger';

const logger = new AppLogger();

/**
 * Middleware function for tracking request and response metrics.
 * This middleware extracts API labels and increments counters for requests and responses.
 *
 * @param config - The configuration for HTTP metrics.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function in the stack.
 */
export const requestMetricsMiddleware = (config: HttpMetricsConfig) => (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.withFields({ method: req.method, path: req.path }).info('Request metrics middleware');

    const apiLabel = findApiLabel(req.method, req.path); 

    const metrics = HttpMetrics.getInstance(config);

    let matchedPath = req.path;
    let api = 'unknown';
    let endpoint = 'unknown';

    if (apiLabel) {
      matchedPath = `${apiLabel.api}${apiLabel.path}`;
      api = apiLabel.api;
      endpoint = apiLabel.endpoint;
      logger.info(`Matched route: ${matchedPath}, Method: ${req.method}, API: ${api}, Endpoint: ${endpoint}`);
    } else {
      logger.warn(`No matching route found for path: ${req.path} with method: ${req.method}`);
    }

    metrics.incrementRequestCounter({ api, endpoint, path: matchedPath, method: req.method });

    res.on('finish', () => {
      metrics.incrementResponseCounter({ api, endpoint, path: matchedPath, method: req.method, statuscode: res.statusCode });
    });

    next();
  } catch (error) {
    logger.withFields({ error }).error('Error in requestMetricsMiddleware');
    next();
  }
};
