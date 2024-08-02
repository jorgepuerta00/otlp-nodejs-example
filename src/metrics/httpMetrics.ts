import { ApiLabelAttributes } from '../core/api-registry';
import { CounterMetric } from '../core/counter.metric';

/**
 * Configuration for HTTP metrics.
 */
export interface HttpMetricsConfig {
  meterName: string;
  version: string;
  meterDescription: string;
  requestCounterName: string;
  responseCounterName: string;
}

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
  private meterDescription: string;

  /**
   * Initializes the HttpMetrics class with the specified request and response counter names.
   * @param requestCounterName - The name of the request counter metric.
   * @param responseCounterName - The name of the response counter metric.
   */
  private constructor(config: HttpMetricsConfig) {
    this.requestCounter = new CounterMetric(config.meterName, config.version, config.requestCounterName);
    this.responseCounter = new CounterMetric(config.meterName, config.version, config.responseCounterName);
    this.meterDescription = config.meterDescription;
  }

  /**
   * Returns the singleton instance of HttpMetrics.
   */
  public static getInstance(config: HttpMetricsConfig): HttpMetrics {
    if (!HttpMetrics.instance) {
      HttpMetrics.instance = new HttpMetrics(config);
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
  }

  /**
   * Increments the response counter with labels.
   * @param labels - Labels for the response metric.
   */
  public incrementResponseCounter(labels: HttpMetricLabels & { statuscode: number }): void {
    const combinedLabels = { ...this.baseAttributes, ...labels };
    this.responseCounter.increment(combinedLabels);
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

  /**
   * Returns the description of the meter.
   */
  public getMeterDescription(): string {
    return this.meterDescription;
  }
}