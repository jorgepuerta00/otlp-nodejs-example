class OrderService {
  createOrder() {
    return "Order created";
  }

  lockDownOrder(id: string) {
    return `Order lockeddown with id ${id}`;
  }

  getOrders() {
    return "List of orders";
  }

  getOrderById(id: string) {
    return `Order with id ${id}`;
  }

  updateOrder(id: string) {
    return `Order updated with id ${id}`;
  }

  deleteOrder(id: string) {
    return `Order deleted with id ${id}`;
  }
}

export const orderService = new OrderService();