import { Attributes, Histogram } from '@opentelemetry/api';
import { BaseMetric } from '../core/base.metric';
import { CustomLogger } from '../logger/app.logger';

/**
 * Class for histogram metrics.
 * Provides methods to create and record histograms.
 */
export class HistogramMetric extends BaseMetric {
  private histogram: Histogram;
  private logger: CustomLogger;
  private histogramName: string;
  private startTimes: Map<string, number>;

  /**
   * Initializes the HistogramMetric class with the specified meter name, version, and histogram name.
   * @param meterName - The name of the meter used for creating metrics.
   * @param version - The version of the meter.
   * @param histogramName - The name of the histogram metric.
   * @param description - The description of the histogram metric.
   */
  constructor(meterName: string, version: string, histogramName: string, logger: CustomLogger, description: string) {
    super(meterName, version);
    this.logger = logger;
    this.histogramName = histogramName;
    this.histogram = this.getMeter().createHistogram(histogramName, { description });
    this.startTimes = new Map<string, number>();
  }

  /**
   * Records a value for the histogram with labels.
   * @param labels - Labels for the metric.
   * @param value - The value to record.
   */
  public record(labels: Attributes, value: number): void {
    this.histogram.record(value, labels);
    this.logger.withFields({ value, labels, meterName: this.histogramName }).info('Histogram value recorded');
  }

  /**
   * Starts the duration measurement.
   * @param id - A unique identifier for the measurement.
   */
  public startDuration(id: string): void {
    const startTime = Date.now();
    this.startTimes.set(id, startTime);
    this.logger.withFields({ id, startTime }).info('Duration measurement started');
  }

  /**
   * Stops the duration measurement and records the duration.
   * @param id - The unique identifier for the measurement.
   * @param labels - Labels for the metric.
   */
  public stopDuration(id: string, labels: Attributes): void {
    const endTime = Date.now();
    const startTime = this.startTimes.get(id);

    if (startTime !== undefined) {
      const duration = endTime - startTime;
      this.histogram.record(duration, labels);
      this.startTimes.delete(id);
      this.logger.withFields({ id, duration, labels, meterName: this.histogramName }).info('Duration recorded');
    } else {
      this.logger.withFields({ id }).error('No start time found for the given id');
    }
  }

  /**
   * Returns the histogram instance.
   */
  public getHistogram(): Histogram {
    return this.histogram;
  }
}
