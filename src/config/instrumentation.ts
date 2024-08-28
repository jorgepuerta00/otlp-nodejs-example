import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { FileLogExporter } from '../exporter/file-log-exporter';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { CustomLogger } from '../logger/app.logger';

export interface OtlInstrumentationConfig {
  serviceName: string;
  serviceVersion: string;
  logFilePath?: string;
}

export class OtlInstrumentation {
  private sdk: NodeSDK | null = null;
  private logger: CustomLogger;
  private traceExporter: OTLPTraceExporter;
  private metricExporter: OTLPMetricExporter;
  private provider: BasicTracerProvider;

  constructor(private config: OtlInstrumentationConfig, logger: CustomLogger) {
    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: this.config.serviceName,
      [SEMRESATTRS_SERVICE_VERSION]: this.config.serviceVersion,
    });

    this.logger = logger;
    this.traceExporter = new OTLPTraceExporter();
    this.metricExporter = new OTLPMetricExporter();

    this.provider = new BasicTracerProvider({ resource });
  }

  public start() {
    try {
      this.provider.register();

      this.sdk = new NodeSDK({
        resource: this.provider.resource,
        traceExporter: this.traceExporter,
        metricReader: new PeriodicExportingMetricReader({
          exporter: this.metricExporter,
        }),
        logRecordProcessor: new SimpleLogRecordProcessor(
          new FileLogExporter(this.config.logFilePath)
        ),
        instrumentations: [
          getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': { enabled: false },
          }),
        ],
      });

      this.sdk.start();
      this.logger.info('Instrumentation SDK has been initialized');

      process.on('SIGTERM', () => {
        this.shutdown();
      });
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
