import 'reflect-metadata';
import express, { Express } from 'express';
import { config } from 'dotenv';
import { requestMetricsMiddleware } from './src/middleware/request-metrics.middleware';
import { MetricsManager } from './src/metrics/metrics.manager';
import { OrderController } from './orders.controller';
import { TestController } from './ordertest.controller';
import { registerApis } from './src/core/api-registry';
import { createSDK } from './src/config/instrumentation';
import { CustomLabelEnrichment } from './custom.enrichement';
import { CpuMetricStrategy, MemoryMetricStrategy } from './src/core/metric.strategy';
import { LoggerBuilder } from './src/logger/logger.builder';

// Load environment variables from .env file
config();

// Create a logger instance
const logger = new LoggerBuilder('syrax-logger', process.env.LOKI_URL || 'http://localhost:3100')
  .addOTLPLogExporter()
  .addOTLPConsoleLog()
  .addWistonConsoleLog({ formatType: 'human', colorsEnabled: true })
  .build();

// Create an OpenTelemetry SDK instance
const sdk = createSDK({
  serviceName: process.env.SERVICE_NAME || 'MyApp',
  serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
});

// Start the OpenTelemetry SDK
sdk.start();
logger.info('OpenTelemetry SDK started');

// Get environment variables
const meterName = process.env.METER_NAME || 'http_counter_meter';
const version = process.env.METER_VERSION || '1.0.0';
const requestCounterName = process.env.REQUEST_COUNTER_NAME || 'http_request_count';
const responseCounterName = process.env.RESPONSE_COUNTER_NAME || 'http_response_count';
const requestDurationName = process.env.REQUEST_DURATION_NAME || 'http_request_duration';
const responseDurationName = process.env.RESPONSE_DURATION_NAME || 'http_response_duration';
const cpuUsageName = process.env.CPU_USAGE_NAME || 'cpu_usage';
const memoryUsageName = process.env.MEMORY_USAGE_NAME || 'memory_usage';
const appName = process.env.APP_NAME || 'defaultApp';
const environment = process.env.ENVIRONMENT || 'development';
const PORT: number = parseInt(process.env.PORT || '8080');

// Configuration for HTTP metrics
const httpMetricsConfig = {
  requestCounterName,
  responseCounterName,
  requestDurationName,
  responseDurationName,
};

// Create a metrics manager instance for HTTP metrics
const metrics = MetricsManager.builder(meterName, version, logger)
  .addCounter(requestCounterName, 'Counter for HTTP requests')
  .addCounter(responseCounterName, 'Counter for HTTP responses')
  .addHistogram(requestDurationName, 'Histogram for HTTP request duration')
  .addHistogram(responseDurationName, 'Histogram for HTTP response duration')
  .addGaugeCpu(cpuUsageName, 'Gauge for CPU usage')
  .addGaugeMemory(memoryUsageName, 'Gauge for Memory usage')
  .setBaseAttributes({ app: appName, environment })
  .build();

const app: Express = express();

// Register middleware to parse JSON bodies
app.use(express.json());

// Register APIs from controllers
registerApis([OrderController]);

// Apply the request metrics middleware
app.use(
  requestMetricsMiddleware(
    metrics,
    httpMetricsConfig,
    logger,
    new CustomLabelEnrichment()
  )
);

// Instantiate the controllers
const orderController = new OrderController();
const testController = new TestController(logger);

// Define routes using the controller methods
app.get('/delivery_order/orders', orderController.getOrders.bind(orderController));
app.get('/delivery_order/orders/:id', orderController.getOrderById.bind(orderController));
app.post('/delivery_order/orders', orderController.createOrder.bind(orderController));
app.post('/delivery_order/orders/:id/lockdown', orderController.lockDownOrder.bind(orderController));
app.post('/delivery_order/orders/:id', orderController.updateOrder.bind(orderController));
app.delete('/delivery_order/orders/:id', orderController.deleteOrder.bind(orderController));

app.get('/orders', testController.getOrders.bind(testController));
app.get('/orders/:id', testController.getOrderById.bind(testController));
app.post('/orders', testController.createOrder.bind(testController));
app.post('/orders/:id/lockdown', testController.lockDownOrder.bind(testController));
app.post('/orders/:id', testController.updateOrder.bind(testController));
app.delete('/orders/:id', testController.deleteOrder.bind(testController));

// Start the server
app.listen(PORT, () => {
  logger.info(`Listening for requests on http://localhost:${PORT}`);
});

function setupSystemMetricsObservables() {
  // Set the callback for CPU usage
  const cpuStrategy = metrics.getStrategy(cpuUsageName) as CpuMetricStrategy;
  cpuStrategy.setCallback(() => {
    const value = cpuStrategy.getMetric().computeCurrentValue();
    const labels = cpuStrategy.getMetric().getCurrentAttributes();
    return { value, labels };
  });

  // Set the callback for Memory usage
  const memoryStrategy = metrics.getStrategy(memoryUsageName) as MemoryMetricStrategy;
  memoryStrategy.setCallback(() => {
    const value = memoryStrategy.getMetric().computeCurrentValue();
    const labels = memoryStrategy.getMetric().getCurrentAttributes();
    return { value, labels };
  });

  logger.info('System metrics observables set up.');
}

setupSystemMetricsObservables();