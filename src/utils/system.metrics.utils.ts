import os from 'os';
import { CpuMetricStrategy, MemoryMetricStrategy } from '../core/metric.strategy';
import { CustomLogger } from '../logger/app.logger';
import { MetricsManager } from '../metrics/metrics.manager';

/*
  SystemMetricsUtils class is a utility class that provides methods to get CPU and Memory usage.
  It has two static methods getCpuUsage and getMemoryUsage.
  getCpuUsage method returns the CPU usage in percentage.
  getMemoryUsage method returns the memory usage in percentage.
*/
export class SystemMetricsUtils {
  static getCpuUsage() {
    const cpus = os.cpus();
    let idleMs = 0;
    let totalMs = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        if (type in cpu.times) {
          totalMs += cpu.times[type as keyof typeof cpu.times];
        }
      }
      idleMs += cpu.times.idle;
    });

    return {
      total: ((totalMs - idleMs) / totalMs) * 100,
    };
  }

  static getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      usedPercent: (usedMem / totalMem) * 100,
    };
  }
}

/*
  setupSystemMetricsObservables method sets up the observables for system metrics.
  It takes the metrics object, cpuUsageName, and memoryUsageName as arguments.
  It sets up the observables for CPU and Memory usage.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setupSystemMetricsObservables(metrics: MetricsManager, cpuUsageName: string, memoryUsageName: string, logger: CustomLogger): void {
  const cpuStrategy = metrics.getStrategy(cpuUsageName) as CpuMetricStrategy;
  cpuStrategy.setCallback(() => {
    const value = cpuStrategy.getMetric().computeCurrentValue();
    const labels = cpuStrategy.getMetric().getCurrentAttributes();
    return { value, labels };
  });

  const memoryStrategy = metrics.getStrategy(memoryUsageName) as MemoryMetricStrategy;
  memoryStrategy.setCallback(() => {
    const value = memoryStrategy.getMetric().computeCurrentValue();
    const labels = memoryStrategy.getMetric().getCurrentAttributes();
    return { value, labels };
  });

  logger.info('System metrics observables set up.');
}