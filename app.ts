import 'reflect-metadata'; 
import express, { Express } from 'express';
import { config } from 'dotenv';
import { requestMetricsMiddleware } from './src/middleware/request-metrics.middleware';
import { HttpMetrics } from './src/metrics/httpMetrics';
import { OrderController } from './orders.controller';
import { TestController } from './ordertest.controller';
import { registerApis } from './src/core/api-registry';
import { sdk } from './src/config/instrumentation';
import { CustomLogger, Formatting } from '@apex-org/bbox';

class AppLogger extends CustomLogger {
  constructor(format: Formatting = 'json') {
    super(format);
  }
}

const logger = new AppLogger();

// Load environment variables from .env file
config();

// Start the OpenTelemetry SDK
sdk.start();
logger.info('OpenTelemetry SDK started');

// Get environment variables
const meterName = process.env.METER_NAME || 'http_counter_meter';
const version = process.env.VERSION || '1.0.0';
const meterDescription = process.env.METER_DESCRIPTION || 'Meter for counting HTTP requests and responses';
const requestCounterName = process.env.REQUEST_COUNTER_NAME || 'http_request_count';
const responseCounterName = process.env.RESPONSE_COUNTER_NAME || 'http_response_count';
const appName = process.env.APP_NAME || 'defaultApp';
const environment = process.env.ENVIRONMENT || 'development';
const PORT: number = parseInt(process.env.PORT || '8080');

// Configuration for HTTP metrics
const httpMetricsConfig = {
  meterName,
  version,
  meterDescription,
  requestCounterName,
  responseCounterName,
};

// Get an instance of HttpMetrics
var httpMetrics = HttpMetrics.getInstance(httpMetricsConfig);

// Set base attributes for metrics
httpMetrics.setBaseAttributes({ app: appName, environment });

const app: Express = express();

// Register APIs from controllers
registerApis([OrderController]);

// Apply the request metrics middleware
app.use(requestMetricsMiddleware(httpMetricsConfig));

// Instantiate the controllers
const orderController = new OrderController();
const testController = new TestController();

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
