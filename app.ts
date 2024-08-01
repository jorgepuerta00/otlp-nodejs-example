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

const appName = process.env.APP_NAME || 'defaultApp';
const environment = process.env.ENVIRONMENT || 'development';
const PORT: number = parseInt(process.env.PORT || '8080');

// Initialize HttpMetrics with custom metric names
const httpMetrics = HttpMetrics.getInstance('custom_request_count', 'custom_response_count');

// Set base attributes for metrics
httpMetrics.setBaseAttributes({ app: appName, environment });

const app: Express = express();

// Register APIs from controllers
registerApis([OrderController, TestController]);

// Apply the request metrics middleware
app.use(requestMetricsMiddleware);

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
