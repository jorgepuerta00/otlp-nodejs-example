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

  constructor(logger: CustomLogger) {
    this.counter = new CounterMetric('test_counter_meter', '1.0.0', 'test_request_count', logger, 'test response count metric for test controller');
  }

  public getOrders = async (req: Request, res: Response) => {
    this.incrementCounter('getOrders', 'GET', '/orders');
    try {
      const data = await orderService.getOrders();
      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public getOrderById = async (req: Request, res: Response) => {
    const id = req.params.id;
    this.incrementCounter('getOrderById', 'GET', `/orders/id:`);
    try {
      const data = await orderService.getOrderById(id);
      if (data) {
        this.handleSuccess(res, data);
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public createOrder = async (req: Request, res: Response) => {
    this.incrementCounter('createOrder', 'POST', '/orders');
    try {
      const data = await orderService.createOrder();
      this.handleSuccess(res, data, 201);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public lockDownOrder = async (req: Request, res: Response) => {
    const id = req.params.id;
    this.incrementCounter('lockDownOrder', 'POST', `/orders/id:/lockdown`);
    try {
      const data = await orderService.lockDownOrder(id);
      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public updateOrder = async (req: Request, res: Response) => {
    const id = req.params.id;
    this.incrementCounter('updateOrder', 'PUT', `/orders/id:`);
    try {
      const data = await orderService.updateOrder(id);
      if (data) {
        this.handleSuccess(res, data);
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public deleteOrder = async (req: Request, res: Response) => {
    const id = req.params.id;
    this.incrementCounter('deleteOrder', 'DELETE', `/orders/id:`);
    try {
      const data = await orderService.deleteOrder(id);
      if (data) {
        this.handleSuccess(res, data);
      } else {
        res.status(404).json({ error: 'Order not found' });
      }
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private incrementCounter(method: string, httpMethod: string, path: string) {
    this.counter.increment({ ...this.labels, method, http: httpMethod, path });
  }

  private handleSuccess(res: Response, data: any, statusCode: number = 200) {
    res.status(statusCode).json(data);
  }

  private handleError(res: Response, error: any) {
    console.error(error); 
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
