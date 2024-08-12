import { Request, Response, NextFunction } from 'express';
import { findApiLabel } from '../core/api-registry';
import { MetricsManager, HttpMetricsConfig } from '../metrics/metrics.manager';
import { AppLogger } from '../logger/app.logger';
import { Attributes } from '@opentelemetry/api';

/**
 * Interface for a label enrichment strategy, which enriches the labels for a given request.
 */
export interface ILabelEnrichment {
  enrichLabels(req: Request, labels: Attributes): Attributes;
}

/**
 * Middleware function for tracking request and response metrics.
 * This middleware extracts API labels and increments counters for requests and responses.
 *
 * @param config - The configuration for HTTP metrics.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function in the stack.
 */
export const requestMetricsMiddleware = (metrics: MetricsManager, config: HttpMetricsConfig, labelEnrichment?: ILabelEnrichment) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const logger = new AppLogger();
    const startTime = Date.now();

    res.on('finish', () => {
      try {
        const { controllerName, methodName } = req as any;

        logger.info(`Controller: ${controllerName}, Method: ${methodName}`);

        const apiLabel = findApiLabel(controllerName, methodName);
        logger.withFields({ controller: controllerName, endpoint: methodName, httpMethod: req.method, path: req.path }).info('Request metrics middleware');

        if (apiLabel) {
          let labels: Attributes = { ...apiLabel, method: req.method };

          if (labelEnrichment) {
            labels = labelEnrichment.enrichLabels(req, labels);
          }

          metrics.increment(config.requestCounterName, labels);

          const duration = Date.now() - startTime;
          metrics.increment(config.responseCounterName, { ...labels, statuscode: res.statusCode });
          metrics.record(config.requestDurationName, labels, duration);
          metrics.record(config.responseDurationName, { ...labels, statuscode: res.statusCode }, duration);
        }
      } catch (error) {
        logger.withFields({ error }).error('error in requestMetricsMiddleware');
      }
    });

    next();
  };
};
