class OrderService {
  createOrder() {
    const statusCode = this.simulateStatusCode();
    if (statusCode === 201 || statusCode === 200) {
      return { message: "Order created", statusCode };
    } else if (statusCode === 500) {
      throw new Error("Internal Server Error");
    } else {
      return { message: "Failed to create order", statusCode };
    }
  }

  lockDownOrder(id: string) {
    const statusCode = this.simulateStatusCode();
    if (statusCode === 200 || statusCode === 201) {
      return { message: `Order locked down with id ${id}`, statusCode };
    } else if (statusCode === 404) {
      return { message: `Order not found with id ${id}`, statusCode };
    } else if (statusCode === 500) {
      throw new Error("Internal Server Error");
    } else {
      return { message: `Failed to lock down order with id ${id}`, statusCode };
    }
  }

  getOrders() {
    this.simulateCpuWorkload(100);
    this.simulateMemoryWorkload(1e7);
    const statusCode = this.simulateStatusCode();
    if (statusCode === 200 || statusCode === 201) {
      return { message: "List of orders", statusCode };
    } else if (statusCode === 500) {
      throw new Error("Internal Server Error");
    } else {
      return { message: "Failed to retrieve orders", statusCode };
    }
  }

  getOrderById(id: string) {
    const statusCode = this.simulateStatusCode();
    if (statusCode === 200 || statusCode === 201) {
      return { message: `Order with id ${id}`, statusCode };
    } else if (statusCode === 404) {
      return { message: `Order not found with id ${id}`, statusCode };
    } else if (statusCode === 500) {
      throw new Error("Internal Server Error");
    } else {
      return { message: `Failed to retrieve order with id ${id}`, statusCode };
    }
  }

  updateOrder(id: string) {
    const statusCode = this.simulateStatusCode();
    if (statusCode === 200 || statusCode === 201) {
      return { message: `Order updated with id ${id}`, statusCode };
    } else if (statusCode === 404) {
      return { message: `Order not found with id ${id}`, statusCode };
    } else if (statusCode === 500) {
      throw new Error("Internal Server Error");
    } else {
      return { message: `Failed to update order with id ${id}`, statusCode };
    }
  }

  deleteOrder(id: string) {
    const statusCode = this.simulateStatusCode();
    if (statusCode === 200 || statusCode === 201) {
      return { message: `Order deleted with id ${id}`, statusCode };
    } else if (statusCode === 404) {
      return { message: `Order not found with id ${id}`, statusCode };
    } else if (statusCode === 500) {
      throw new Error("Internal Server Error");
    } else {
      return { message: `Failed to delete order with id ${id}`, statusCode };
    }
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

  // Simulate random status codes
  private simulateStatusCode() {
    const possibleStatusCodes = [200, 201, 400, 404, 500];
    const randomIndex = Math.floor(Math.random() * possibleStatusCodes.length);
    return possibleStatusCodes[randomIndex];
  }
}

export const orderService = new OrderService();