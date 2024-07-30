import express, { Express } from 'express';
import { config } from 'dotenv';
import { requestMetricsMiddleware } from './request-metrics.middleware';
import { OrderController } from './orders.controller';
import { setBaseAttributes } from './metrics';
import 'reflect-metadata';

// Load environment variables from .env file
config();

const appName = process.env.APP_NAME || 'defaultApp';
const environment = process.env.ENVIRONMENT || 'development';
const PORT: number = parseInt(process.env.PORT || '8080');

const app: Express = express();

// Set base attributes for metrics
setBaseAttributes({ app: appName, environment });

// Apply the request metrics middleware
app.use(requestMetricsMiddleware);

// Instantiate the controller
const orderController = new OrderController();

// Define routes using the controller methods
app.get('/orders', orderController.getOrders);
app.get('/orders/:id', orderController.getOrderById);
app.post('/orders', orderController.createOrder);
app.put('/orders/:id', orderController.updateOrder);
app.delete('/orders/:id', orderController.deleteOrder);

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
