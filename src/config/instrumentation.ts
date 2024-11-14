import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { BasicTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { SimpleLogRecordProcessor, LogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { FileLogExporter } from '../exporter/file-log-exporter';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { CustomLogger } from '../logger/app.logger';
import { propagation } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

/**
 * Configuration for OpenTelemetry instrumentation.
 * Enables tracing, metrics, and logging.
 * Example:
 * ```
 * const config: OtlInstrumentationConfig = {
 *  serviceName: 'my-service',
 *  serviceVersion: '1.0.0',
 *  logFilePath: 'logs/app.log',
 *  enableTracing: true,
 *  enableMetrics: true,
 *  enableLogging: true,
 * };
 */
export interface OtlInstrumentationConfig {
  serviceName: string;
  serviceVersion: string;
  otlEndpoint: string;
  logFilePath?: string;
  enableTracing?: boolean;
  enableMetrics?: boolean;
  enableLogging?: boolean;
}

export interface IOtlInstrumentation {
  start(): void;
}

class TracingConfig {
  private traceExporter: OTLPTraceExporter | undefined;
  private provider: BasicTracerProvider | undefined;

  constructor(resource: Resource, enableTracing?: boolean) {
    if (enableTracing) {
      this.traceExporter = new OTLPTraceExporter();
      this.provider = new BasicTracerProvider({ resource });
    }
  }

  getTraceExporter(): OTLPTraceExporter | undefined {
    return this.traceExporter;
  }

  getProvider(): BasicTracerProvider | undefined {
    return this.provider;
  }
}

class MetricsConfig {
  private metricExporter: OTLPMetricExporter | undefined;

  constructor(otlEndpoint: string, enableMetrics?: boolean) {
    if (enableMetrics) {
      this.metricExporter = new OTLPMetricExporter(
        {
          url: otlEndpoint,
        },
      );
    }
  }

  getMetricExporter(): OTLPMetricExporter | undefined {
    return this.metricExporter;
  }
}

class LoggingConfig {
  private logRecordProcessor: LogRecordProcessor | undefined;

  constructor(logFilePath?: string, enableLogging?: boolean) {
    if (enableLogging && logFilePath) {
      this.logRecordProcessor = new SimpleLogRecordProcessor(new FileLogExporter(logFilePath));
    }
  }

  getLogRecordProcessor(): LogRecordProcessor | undefined {
    return this.logRecordProcessor;
  }
}

/**
 * OpenTelemetry instrumentation class.
 * Initializes the OpenTelemetry SDK with tracing, metrics, and logging.
 */
export class OtlInstrumentation implements IOtlInstrumentation {
  private sdk: NodeSDK | null = null;
  private logger: CustomLogger;
  private tracingConfig: TracingConfig;
  private metricsConfig: MetricsConfig;
  private loggingConfig: LoggingConfig;

  constructor(private config: OtlInstrumentationConfig, logger: CustomLogger) {
    const resource = new Resource({
      [ATTR_SERVICE_NAME]: this.config.serviceName,
      [ATTR_SERVICE_VERSION]: this.config.serviceVersion,
    });

    this.logger = logger;
    this.tracingConfig = new TracingConfig(resource, this.config.enableTracing);
    this.metricsConfig = new MetricsConfig(this.config.otlEndpoint, this.config.enableMetrics);
    this.loggingConfig = new LoggingConfig(this.config.logFilePath, this.config.enableLogging);
  }

  /**
   * Starts the OpenTelemetry instrumentation.
   */
  public start() {
    try {
      if (this.config.enableTracing) {
        propagation.setGlobalPropagator(new W3CTraceContextPropagator());

        const provider = this.tracingConfig.getProvider();
        const traceExporter = this.tracingConfig.getTraceExporter();
        if (provider && traceExporter) {
          provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
          provider.register();
        }
      }

      this.sdk = new NodeSDK({
        resource: this.config.enableTracing ? this.tracingConfig.getProvider()?.resource : undefined,
        traceExporter: this.config.enableTracing ? this.tracingConfig.getTraceExporter() : undefined,
        metricReader: this.config.enableMetrics ? new PeriodicExportingMetricReader({
          exporter: this.metricsConfig.getMetricExporter()!,
        }) : undefined,
        logRecordProcessor: this.loggingConfig.getLogRecordProcessor(),
        instrumentations: [
          getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': { enabled: false },
          }),
        ],
      });

      this.sdk.start();
      this.logger.info('Instrumentation SDK has been initialized');

      process.on('SIGTERM', () => this.shutdown());
    } catch (error) {
      this.logger.withFields({ error }).error('Failed to initialize instrumentation');
    }
  }

  private shutdown() {
    if (this.sdk) {
      this.sdk.shutdown()
        .then(() => this.logger.info('Instrumentation SDK has been shut down'))
        .catch((error) => this.logger.withFields({ error }).error('Error shutting down instrumentation SDK'))
        .finally(() => process.exit(0));
    }
  }
}
