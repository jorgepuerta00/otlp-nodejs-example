import { MetricsBuilder } from '../core/metrics.builder';
import { MetricStrategy } from '../core/metric.strategy';
import { Attributes } from '@opentelemetry/api';
import { CustomLogger } from '../logger/app.logger';

/**
 * Configuration for HTTP metrics.
 * 
 * Example usage:
 * 
 * ```typescript
 * const httpMetricsConfig = {
 *   requestCounterName: process.env.REQUEST_COUNTER_NAME || 'http_request_count',
 *   responseCounterName: process.env.RESPONSE_COUNTER_NAME || 'http_response_count',
 *   requestDurationName: process.env.REQUEST_DURATION_NAME || 'http_request_duration',
 *   responseDurationName: process.env.RESPONSE_DURATION_NAME || 'http_response_duration',
 * };
 * ```
 */
export interface HttpMetricsConfig {
  requestCounterName: string;
  responseCounterName: string;
  requestDurationName: string;
  responseDurationName: string;
}

/**
 * Class representing HTTP metrics for observability.
 * This class is used to track and record various metrics such as counters, histograms, and gauges
 * for HTTP requests, responses, and other related operations.
 * 
 * Example usage:
 * 
 * ```typescript
 * const metrics = MetricsManager.builder(meterName, version, logger)
 *   .addCounter(requestCounterName, 'Counter for HTTP requests')
 *   .addCounter(responseCounterName, 'Counter for HTTP responses')
 *   .addHistogram(requestDurationName, 'Histogram for HTTP request duration')
 *   .addHistogram(responseDurationName, 'Histogram for HTTP response duration')
 *   .addGaugeCpu(cpuUsageName, 'Gauge for CPU usage')
 *   .addGaugeMemory(memoryUsageName, 'Gauge for Memory usage')
 *   .setBaseAttributes({ app: appName, environment })
 *   .build();
 * ```
 */
export class MetricsManager {
  private static instance: MetricsManager | null = null;
  private strategies: Map<string, MetricStrategy>;
  private baseAttributes: Attributes;

  /**
   * Private constructor for the MetricsManager class.
   * This is private to enforce the use of the builder pattern for creating an instance of this class.
   *
   * @param strategies - A map of metric strategies, each responsible for handling a specific type of metric.
   * @param baseAttributes - Base attributes that are common across all metrics (e.g., app name, environment).
   */
  private constructor(strategies: Map<string, MetricStrategy>, baseAttributes: Attributes) {
    this.strategies = strategies;
    this.baseAttributes = baseAttributes;
  }

  /**
   * Increments a counter or a gauge metric based on the provided metric name.
   * 
   * @param metricName - The name of the metric to increment (e.g., request count).
   * @param labels - Additional labels to associate with the metric.
   */
  public increment(metricName: string, labels: Attributes): void {
    const combinedLabels = { ...this.baseAttributes, ...labels };
    this.strategies.get(metricName)?.increment(combinedLabels);
  }

  /**
   * Records a value for a histogram or sets a value for a gauge metric based on the provided metric name.
   * 
   * @param metricName - The name of the metric to record or set the value for (e.g., request duration).
   * @param labels - Additional labels to associate with the metric.
   * @param value - The value to record (for histograms) or set (for gauges).
   */
  public record(metricName: string, labels: Attributes, value: number): void {
    const combinedLabels = { ...this.baseAttributes, ...labels };
    this.strategies.get(metricName)?.record(combinedLabels, value);
  }

  /**
   * Static method to initiate the builder pattern for creating an instance of MetricsManager.
   * 
   * @returns {MetricsBuilder} - An instance of the MetricsBuilder class.
   */
  public static builder(meterName: string, version: string, logger: CustomLogger): MetricsBuilder {
    return new MetricsBuilder(meterName, version, logger);
  }

  /**
   * Retrieves a specific metric strategy by metric name.
   * @param metricName - The name of the metric.
   * @returns The corresponding MetricStrategy, or undefined if not found.
   */
  public getStrategy(metricName: string): MetricStrategy | undefined {
    return this.strategies.get(metricName);
  }

  /**
   * Returns the singleton instance of MetricsManager.
   * If the instance doesn't exist, it creates a new one using the provided configuration.
   * @param strategies - The map of metric strategies.
   * @param baseAttributes - The base attributes for all metrics.
   * @returns The singleton instance of MetricsManager.
   */
  public static getInstance(strategies?: Map<string, MetricStrategy>, baseAttributes?: Attributes): MetricsManager {
    if (!MetricsManager.instance) {
      if (!strategies || !baseAttributes) {
        throw new Error('MetricsManager must be initialized with strategies and base attributes.');
      }
      MetricsManager.instance = new MetricsManager(strategies, baseAttributes);
    }
    return MetricsManager.instance;
  }
}