import { Request, Response } from 'express';
import { orderService } from './order.service';
import { CounterMetric } from './src/metrics/counter.metric';
import { CustomLogger } from './src/logger/app.logger';

/**
 * Sample controller class using ApiLabels for manual metrics collection.
 */
export class TestController {
  private counter: CounterMetric;
  private labels: { [key: string]: string } = { controller: 'TestController' };

  constructor(private logger: CustomLogger) {
    this.counter = new CounterMetric('test_counter_meter', '1.0.0', 'test_request_count', logger, 'test response count metric for test controller');
  }

  public getOrders = (req: Request, res: Response) => {
    this.incrementCounter('getOrders', 'GET', '/orders');
    try {
      const result = orderService.getOrders();
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public getOrderById = (req: Request, res: Response) => {
    const id = req.params.id;
    this.incrementCounter('getOrderById', 'GET', `/orders/${id}`);
    try {
      const result = orderService.getOrderById(id);
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public createOrder = (req: Request, res: Response) => {
    this.incrementCounter('createOrder', 'POST', '/orders');
    try {
      const result = orderService.createOrder();
      this.handleResponse(res, result, 201);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public lockDownOrder = (req: Request, res: Response) => {
    const id = req.params.id;
    this.incrementCounter('lockDownOrder', 'POST', `/orders/${id}/lockdown`);
    try {
      const result = orderService.lockDownOrder(id);
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public updateOrder = (req: Request, res: Response) => {
    const id = req.params.id;
    this.incrementCounter('updateOrder', 'PUT', `/orders/${id}`);
    try {
      const result = orderService.updateOrder(id);
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public deleteOrder = (req: Request, res: Response) => {
    const id = req.params.id;
    this.incrementCounter('deleteOrder', 'DELETE', `/orders/${id}`);
    try {
      const result = orderService.deleteOrder(id);
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private incrementCounter(method: string, httpMethod: string, path: string) {
    this.counter.increment({ ...this.labels, method, http: httpMethod, path });
  }

  private handleResponse(res: Response, result: { message: string, statusCode: number }, defaultStatusCode: number = 200) {
    res.status(result.statusCode || defaultStatusCode).json(result);
    this.logger.withFields({ statusCode: result.statusCode }).info(result.message);
  }

  private handleError(res: Response, error: any) {
    res.status(500).json({ error: 'Internal Server Error' });
    this.logger.withFields({ error }).error('Internal Server Error');
  }
}
