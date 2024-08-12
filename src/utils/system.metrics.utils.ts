import os from 'os';

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
