
import 'reflect-metadata'; 
import express, { Express } from 'express';
import { config } from 'dotenv';
import { requestMetricsMiddleware } from './src/middleware/request-metrics.middleware';
import { OrderController } from './orders.controller';
import { setBaseAttributes } from './src/core/metrics';
import { scanControllers } from './src/core/metadata-scanner';

// Load environment variables from .env file
config();

const appName = process.env.APP_NAME || 'defaultApp';
const environment = process.env.ENVIRONMENT || 'development';
const PORT: number = parseInt(process.env.PORT || '8080');

const app: Express = express();

// Scan the controllers to register routes
scanControllers([OrderController]);

// Set base attributes for metrics
setBaseAttributes({ app: appName, environment });

// Apply the request metrics middleware
app.use(requestMetricsMiddleware);

// Instantiate the controller
const orderController = new OrderController();

// Define routes using the controller methods
app.get('/orders', orderController.getOrders.bind(orderController));
app.get('/orders/:id', orderController.getOrderById.bind(orderController));
app.post('/orders', orderController.createOrder.bind(orderController));
app.post('/orders/:id/lockdown', orderController.lockDownOrder.bind(orderController));
app.post('/orders/:id', orderController.updateOrder.bind(orderController));
app.delete('/orders/:id', orderController.deleteOrder.bind(orderController));

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
