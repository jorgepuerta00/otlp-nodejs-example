import { Request, Response } from 'express';
import { orderService } from './order.service';
import { ApiLabels } from './src/decorators/api-labels.decorator';
import { CustomLogger } from './src/logger/app.logger';

/**
 * Sample controller class using ApiLabels for automatic metrics collection.
 */
export class OrderController {

  constructor(private logger: CustomLogger) {}

  @ApiLabels({ path: '/orders', api: 'delivery_order' })
  getOrders(req: Request, res: Response) {
    try {
      const result = orderService.getOrders();
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  @ApiLabels({ path: '/orders/:id', api: 'delivery_order' })
  getOrderById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const result = orderService.getOrderById(id);
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  @ApiLabels({ path: '/orders', api: 'delivery_order' })
  createOrder(req: Request, res: Response) {
    try {
      const result = orderService.createOrder();
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  @ApiLabels({ path: '/orders/:id/lockdown', api: '/delivery_order' })
  lockDownOrder(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const result = orderService.lockDownOrder(id);
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  @ApiLabels({ path: '/orders/:id', api: '/delivery_order' })
  updateOrder(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const result = orderService.updateOrder(id);
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  @ApiLabels({ path: '/orders/:id', api: '/delivery_order' })
  deleteOrder(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const result = orderService.deleteOrder(id);
      this.handleResponse(res, result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleResponse(res: Response, result: { message: string, statusCode: number }) {
    res.status(result.statusCode).send(result);
    if (result.statusCode === 200 || result.statusCode === 201) {
      this.logger.withFields({ statusCode: result.statusCode }).info(result.message);
    }
    else if (result.statusCode >= 400 && result.statusCode < 500) {
      this.logger.withFields({ statusCode: result.statusCode }).warn(result.message);
    } 
    else {
      this.logger.withFields({ statusCode: result.statusCode }).error(result.message);
    }
  }

  private handleError(res: Response, error: any) {
    res.status(500).send({ message: 'Internal Server Error' });
    this.logger.withFields({ ...error, statusCode: 500 }).error('Internal Server Error');
  }
}
