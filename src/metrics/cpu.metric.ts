import { GaugeMetric } from './gauge.metric';
import { SystemMetricsUtils } from '../utils/system.metrics.utils';
import { Attributes } from '@opentelemetry/api';
import { Components } from '../utils/enums';

/**
 * Class representing a CPU usage metric.
 * Extends the generic GaugeMetric class to provide specific logic for CPU usage.
 */
export class CpuMetric extends GaugeMetric {
  constructor(meterName: string, version: string, gaugeName: string, description?: string) {
    super(meterName, version, gaugeName, description);
  }

  /**
   * The callback to observe the current CPU usage.
   */
  public computeCurrentValue(): number {
    const cpuUsage = SystemMetricsUtils.getCpuUsage();
    return cpuUsage.total;
  }

  /**
   * Return the attributes specific to the CPU metric.
   */
  public getCurrentAttributes(): Attributes {
    return { component: Components.SYSTEM, metricType: Components.CPU };
  }
}
