import { GaugeMetric } from './gauge.metric';
import { SystemMetricsUtils } from '../utils/system.metrics.utils';
import { Attributes } from '@opentelemetry/api';
import { Components } from '../utils/enums';
import { CustomLogger } from '../logger/app.logger';

/**
 * Class representing a memory usage metric.
 * Extends the generic GaugeMetric class to provide specific logic for memory usage.
 */
export class MemoryMetric extends GaugeMetric {
  constructor(meterName: string, version: string, gaugeName: string, logger: CustomLogger, description: string) {
    super(meterName, version, gaugeName, logger, description);
  }

  /**
   * The callback to observe the current memory usage.
   */
  public computeCurrentValue(): number {
    const memoryUsage = SystemMetricsUtils.getMemoryUsage();
    return memoryUsage.usedPercent;
  }

  /**
   * Return the attributes specific to the memory metric.
   */
  public getCurrentAttributes(): Attributes {
    return { component: Components.SYSTEM, metric_type: Components.MEMORY };
  }
}
