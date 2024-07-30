import { Request, Response } from 'express';
import { Route } from './decorators';
import { incrementResponseCounter } from './metrics';
import { orderService } from './order.service';

export class OrderController {
  @Route('/orders')
  getOrders(req: Request, res: Response) {
    try {
      const data = orderService.getOrders();
      res.status(200).send(JSON.stringify(data));
      incrementResponseCounter('/orders', 'GET', 200);
    } catch (error) {
      res.status(500).send('Internal Server Error');
      incrementResponseCounter('/orders', 'GET', 500);
    }
  }

  @Route('/orders/:id')
  getOrderById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = orderService.getOrderById(id);
      res.status(200).send(JSON.stringify(data));
      incrementResponseCounter('/orders/:id', 'GET', 200);
    } catch (error) {
      res.status(500).send('Internal Server Error');
      incrementResponseCounter('/orders/:id', 'GET', 500);
    }
  }

  @Route('/orders')
  createOrder(req: Request, res: Response) {
    try {
      const data = orderService.createOrder();
      res.status(201).send(JSON.stringify(data));
      incrementResponseCounter('/orders', 'POST', 201);
    } catch (error) {
      res.status(500).send('Internal Server Error');
      incrementResponseCounter('/orders', 'POST', 500);
    }
  }

  @Route('/orders/:id')
  updateOrder(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = orderService.updateOrder(id);
      res.status(200).send(JSON.stringify(data));
      incrementResponseCounter('/orders/:id', 'PUT', 200);
    } catch (error) {
      res.status(500).send('Internal Server Error');
      incrementResponseCounter('/orders/:id', 'PUT', 500);
    }
  }

  @Route('/orders/:id')
  deleteOrder(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = orderService.deleteOrder(id);
      res.status(200).send(JSON.stringify(data));
      incrementResponseCounter('/orders/:id', 'DELETE', 200);
    } catch (error) {
      res.status(500).send('Internal Server Error');
      incrementResponseCounter('/orders/:id', 'DELETE', 500);
    }
  }
}
