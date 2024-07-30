class OrderService {
  createOrder() {
    return "Order created";
  }

  getOrders() {
    return "List of orders";
  }

  getOrderById(id: string) {
    return `Order with id ${id}`;
  }

  updateOrder(id: string) {
    return "Order updated";
  }

  deleteOrder(id: string) {
    return "Order deleted";
  }
}

export const orderService = new OrderService();