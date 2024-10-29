/* eslint-disable @typescript-eslint/no-explicit-any */
import { Attributes, trace, context, Span, propagation, SpanStatusCode  } from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';
import { findApiLabel } from '../decorators/api-registry';
import { MetricsManager, HttpMetricsConfig } from '../metrics/metrics.manager';
import { ILabelEnrichment } from '../metrics/label.metrics.enrichment';
import { CustomAttributeMapping } from '../logger/http.attribute.mapping';
import { CustomLogger } from '../logger/app.logger';
import { buildRequestMessage, buildResponseMessage } from '../logger/http.log.builder';

/**
 * Middleware function for tracking request and response metrics.
 * This middleware extracts API labels and increments counters for requests and responses.
 *
 * @param config - The configuration for HTTP metrics.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function in the stack.
 */
export const requestMetricsMiddleware = (
  metrics: MetricsManager, 
  config: HttpMetricsConfig, 
  logger: CustomLogger, 
  labelEnrichment?: ILabelEnrichment,
  customRequestAttributes?: CustomAttributeMapping 
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestSpan = startHttpSpan(req);
    const requestCtx = trace.setSpan(context.active(), requestSpan);
    let responseBody: any;

    overrideSendToCaptureBody(res, (body) => (responseBody = body));

    const requestReceivedSpan = trace.getTracer('http-traces', 'semver:1.0.0').startSpan('Request Received', undefined, requestCtx);
    context.with(trace.setSpan(context.active(), requestReceivedSpan), () => {
      const requestMessage = buildRequestMessage(req, customRequestAttributes);
      logger.withFields(requestMessage).info('Request received');

      res.on('finish', () => {
        const responseSentSpan = trace.getTracer('http-traces', 'semver:1.0.0').startSpan('Response Sent', undefined, requestCtx);
        context.with(trace.setSpan(context.active(), responseSentSpan), () => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { controllerName, methodName } = req as any;
            const apiLabel = findApiLabel(controllerName, methodName);

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
            logger.withFields({ error }).error(`unhandled exception in the endpoint ${req.method}`);
          } finally {
            const responseMessage = buildResponseMessage(req, res, responseBody, startTime);
            logger.withFields(responseMessage).info('Response sent');

            responseSentSpan.end();
            requestReceivedSpan.end();
            finishHttpSpan(requestSpan, req, res);
          }
        });
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

/**
 * Override res.send to capture response body for logging.
 */
function overrideSendToCaptureBody(res: Response, captureCallback: (body: any) => void) {
  const originalSend = res.send;
  res.send = function (body) {
    captureCallback(parseBody(body));
    return originalSend.call(this, body);
  };
}

/**
 * Parse response body safely to handle JSON and non-JSON responses.
 */
function parseBody(body: any): any {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}