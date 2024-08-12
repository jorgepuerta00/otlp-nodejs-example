import 'reflect-metadata'; 
import express, { Express, Request } from 'express';
import { config } from 'dotenv';
import { ILabelEnrichment, requestMetricsMiddleware } from './src/middleware/request-metrics.middleware';
import { MetricsManager } from './src/metrics/metrics.manager';
import { OrderController } from './orders.controller';
import { TestController } from './ordertest.controller';
import { registerApis } from './src/core/api-registry';
import { sdk } from './src/config/instrumentation';
import { CustomLogger, Formatting } from '@apex-org/bbox';
import { Attributes } from './src';

class AppLogger extends CustomLogger {
  constructor(format: Formatting = 'json') {
    super(format);
  }
}

export class CustomLabelEnrichment implements ILabelEnrichment {

  enrichLabels(req: Request, labels: Attributes): Attributes {
    const preparerId = this.getPreparerId(req);
    console.log('Preparer ID:', preparerId); 
    return { ...labels, preparerId };
  }

  private getPreparerId(req: Request): string {
    const { query = {}, headers = {}, body = {} } = req;

    console.log('Headers:', headers);
    console.log('Query Params:', query);
    console.log('Body:', body);
    
    const possibleValues = [
      headers.siteId,
      headers.preparerid,
      body.clientNumber,
      body.siteId,
      query.clientNumber,
      query.siteId,
      query.preparerid,
    ];
  
    return possibleValues.find(value => value !== undefined && value !== null) || '';
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
const requestDurationName = process.env.REQUEST_DURATION_NAME || 'http_request_duration';
const responseDurationName = process.env.RESPONSE_DURATION_NAME || 'http_response_duration';
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

// Create a metrics manager instance
const metrics = MetricsManager.builder(meterName, version)
    .addCounter(requestCounterName, meterDescription)
    .addCounter(responseCounterName, meterDescription)
    .addHistogram(requestDurationName, meterDescription)
    .addHistogram(responseDurationName, meterDescription)
    .setBaseAttributes({ app: appName, environment })
    .build();

const app: Express = express();

// Register middleware to parse JSON bodies
app.use(express.json());

// Register APIs from controllers
registerApis([OrderController]);

// Apply the request metrics middleware
app.use(requestMetricsMiddleware(metrics, httpMetricsConfig, new CustomLabelEnrichment()));

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
