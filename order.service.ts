class OrderService {
  createOrder() {
    return "Order created";
  }

  lockDownOrder(id: string) {
    return `Order lockeddown with id ${id}`;
  }

  getOrders() {
    this.simulateCpuWorkload(100);
    this.simulateMemoryWorkload(1e7);
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

  // Simulate CPU-intensive work by running a large loop
  private simulateCpuWorkload(durationMs: number) {
    const start = Date.now();
    while (Date.now() - start < durationMs) { 
      let x = 0;
      for (let i = 0; i < 1e7; i++) {  
        x += Math.sqrt(i);
      }
    }
  }

  // Simulate memory usage by creating a very large array
  private simulateMemoryWorkload(size: number) {
    const largeArray = new Array(size).fill('memory usage'); 
    return largeArray;
  }
}

export const orderService = new OrderService();