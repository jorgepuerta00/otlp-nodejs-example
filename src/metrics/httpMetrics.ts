import { ApiLabelAttributes } from '../core/api-registry';
import { CounterMetric } from '../core/counter.metric';

/**
 * Labels for HTTP metrics.
 */
export interface HttpMetricLabels extends ApiLabelAttributes {
  path: string;
  method: string;
}

/**
 * Class for HTTP metrics.
 * Provides methods to increment request and response counters.
 * Singleton class.
 **/
export class HttpMetrics {
  private static instance: HttpMetrics;
  private requestCounter: CounterMetric;
  private responseCounter: CounterMetric;
  private baseAttributes: ApiLabelAttributes = {};
  private requestCount = 0;
  private responseCount = 0;

  /**
   * Initializes the HttpMetrics class with the specified request and response counter names.
   * @param requestCounterName - The name of the request counter metric.
   * @param responseCounterName - The name of the response counter metric.
   */
  private constructor(requestCounterName: string, responseCounterName: string) {
    this.requestCounter = new CounterMetric('http-metrics', '1.0.0', requestCounterName);
    this.responseCounter = new CounterMetric('http-metrics', '1.0.0', responseCounterName);
  }

  /**
   * Returns the singleton instance of HttpMetrics.
   */
  public static getInstance(
    requestCounterName: string = 'http_request_count',
    responseCounterName: string = 'http_response_count'
  ): HttpMetrics {
    if (!HttpMetrics.instance) {
      HttpMetrics.instance = new HttpMetrics(requestCounterName, responseCounterName);
    }
    return HttpMetrics.instance;
  }

  /**
   * Sets base attributes for metrics.
   * @param attributes - An object containing base attributes such as app name and environment.
   */
  public setBaseAttributes(attributes: ApiLabelAttributes) {
    this.baseAttributes = attributes;
  }

  /**
   * Increments the request counter with labels.
   * @param labels - Labels for the request metric.
   */
  public incrementRequestCounter(labels: HttpMetricLabels): void {
    const combinedLabels = { ...this.baseAttributes, ...labels };
    this.requestCounter.increment(combinedLabels);
    this.requestCount++;
  }

  /**
   * Increments the response counter with labels.
   * @param labels - Labels for the response metric.
   */
  public incrementResponseCounter(labels: HttpMetricLabels & { statuscode: number }): void {
    const combinedLabels = { ...this.baseAttributes, ...labels };
    this.responseCounter.increment(combinedLabels);
    this.responseCount++;
  }

  /**
   * Gets the current request counter instance.
   * @returns The request counter instance.
   */
  public getRequestCounter(): CounterMetric {
    return this.requestCounter;
  }

  /**
   * Gets the current response counter instance.
   * @returns The response counter instance.
   */
  public getResponseCounter(): CounterMetric {
    return this.responseCounter;
  }
}