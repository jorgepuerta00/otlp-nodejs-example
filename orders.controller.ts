import { Request, Response } from 'express';
import { orderService } from './order.service';
import { Route } from './src/decorators/route.decorator';
import { Controller } from './src/decorators/controller.decorator';

@Controller('/delivery_order')
export class OrderController {
  @Route('orders')
  getOrders(req: Request, res: Response) {
    try {
      const data = orderService.getOrders();
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @Route('orders/:id')
  getOrderById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = orderService.getOrderById(id);
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @Route('orders')
  createOrder(req: Request, res: Response) {
    try {
      const data = orderService.createOrder();
      res.status(201).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @Route('orders/:id/lockdown')
  lockDownOrder(req: Request, res: Response) {
    try {
    const id = req.params.id;
    const data = orderService.lockDownOrder(id);
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @Route('orders/:id')
  updateOrder(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const data = orderService.updateOrder(id);
      res.status(200).send(JSON.stringify(data));
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  @Route('orders/:id')
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
