import { Request, Response } from 'express';
import { orderService } from './order.service';
import { ApiLabels } from './src/decorators/api-labels.decorator';

/**
 * Sample controller class using ApiLabels for automatic metrics collection.
 */
export class OrderController {
  @ApiLabels({ path: '/orders', api: 'delivery_order' })
  getOrders(req: Request, res: Response) {
    try {
      const data = orderService.getOrders();
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @ApiLabels({ path: '/orders/:id', api: 'delivery_order' })
  getOrderById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = orderService.getOrderById(id);
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @ApiLabels({ path: '/orders', api: 'delivery_order' })
  createOrder(req: Request, res: Response) {
    try {
      const data = orderService.createOrder();
      res.status(201).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @ApiLabels({ path: '/orders/:id/lockdown', api: '/delivery_order' })
  lockDownOrder(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data = orderService.lockDownOrder(id);
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @ApiLabels({ path: '/orders/:id', api: '/delivery_order' })
  updateOrder(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = orderService.updateOrder(id);
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @ApiLabels({ path: '/orders/:id', api: '/delivery_order' })
  deleteOrder(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = orderService.deleteOrder(id);
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }
}
