import { Request, Response } from 'express';
import { orderService } from './order.service';
import { ApiLabels } from './src/decorators/api-labels.decorator';

export class TestController {
  @ApiLabels({ method: 'GET', path: '', api: '/orders' })
  getOrders(req: Request, res: Response) {
    try {
      const data = orderService.getOrders();
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @ApiLabels({ method: 'GET', path: '/:id', api: '/orders' })
  getOrderById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = orderService.getOrderById(id);
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @ApiLabels({ method: 'POST', path: '', api: '/orders' })
  createOrder(req: Request, res: Response) {
    try {
      const data = orderService.createOrder();
      res.status(201).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @ApiLabels({ method: 'POST', path: '/:id/lockdown', api: '/orders' })
  lockDownOrder(req: Request, res: Response) {
    try {
    const id = req.params.id;
    const data = orderService.lockDownOrder(id);
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @ApiLabels({ method: 'POST', path: '/:id', api: '/orders' })
  updateOrder(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = orderService.updateOrder(id);
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @ApiLabels({ method: 'DELETE', path: '/:id', api: '/orders' })
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
