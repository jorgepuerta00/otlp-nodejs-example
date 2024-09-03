import { Request, Response, NextFunction } from 'express';
import { findApiLabel } from '../decorators/api-registry';
import { MetricsManager, HttpMetricsConfig } from '../metrics/metrics.manager';
import { Attributes, trace, context, Span, propagation, SpanStatusCode  } from '@opentelemetry/api';
import { CustomLogger } from '../logger/app.logger';

/**
 * Interface for a label enrichment strategy, which enriches the labels for a given request.
 */
export interface ILabelEnrichment {
  enrichLabels(req: Request): Attributes;
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
export const requestMetricsMiddleware = (metrics: MetricsManager, config: HttpMetricsConfig, logger: CustomLogger, labelEnrichment?: ILabelEnrichment) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    const span = startHttpSpan(req);
    const ctx = trace.setSpan(context.active(), span);

    context.with(ctx, () => {
      res.on('finish', () => {
        finishHttpSpan(span, req, res);

        try {
          const { controllerName, methodName } = req as any;

          const apiLabel = findApiLabel(controllerName, methodName);
          logger.withFields({ httpMethod: req.method, path: req.path }).info('Request metrics middleware');

          if (apiLabel) {
            let labels: Attributes = { ...apiLabel, controller: controllerName, endpoint: methodName, httpMethod: req.method };
            labels = mergeLabels(req, labels, labelEnrichment);

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
    });
  };
};

/**
 * Private method to merge existing labels with enriched labels.
 * @param req The HTTP request object.
 * @param labels The existing labels to be enriched.
 * @param labelEnrichment The enrichment strategy (if any).
 * @returns The merged labels.
 */
function mergeLabels(req: Request, labels: Attributes, labelEnrichment?: ILabelEnrichment): Attributes {
  if (labelEnrichment) {
    const enrichedLabels = labelEnrichment.enrichLabels(req);
    return { ...labels, ...enrichedLabels }; 
  }
  return labels;
}

/**
 * Helper method to start a new span for an HTTP request.
 *
 * @param tracer - The tracer to use for starting the span.
 * @param req - The HTTP request object.
 * @returns The started span.
 */
export function startHttpSpan(req: Request): Span {
  const tracer = trace.getTracer('http-traces', 'semver:1.0.0');
  const extractedContext = propagation.extract(context.active(), req.headers);
  return tracer.startSpan(`HTTP ${req.method} ${req.url}`, undefined, extractedContext);
}

/**
 * Helper method to set attributes on a span and end it.
 *
 * @param span - The span to finish.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 */
export function finishHttpSpan(span: Span, req: Request, res: Response): void {
  if (span) {
    span.setAttributes({
      'http.method': req.method,
      'http.url': req.url,
      'http.status_code': res.statusCode,
    });

    if (res.statusCode >= 400) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: `HTTP status ${res.statusCode}` });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
    }

    span.end();
  }
}