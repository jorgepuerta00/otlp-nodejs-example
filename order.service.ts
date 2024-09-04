class OrderService {
  createOrder() {
    this.simulateCpuWorkload();
    this.simulateMemoryWorkload();
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
    this.simulateCpuWorkload();
    this.simulateMemoryWorkload();
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
    this.simulateCpuWorkload();
    this.simulateMemoryWorkload();
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
    this.simulateCpuWorkload();
    this.simulateMemoryWorkload();
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
    this.simulateCpuWorkload();
    this.simulateMemoryWorkload();
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
    this.simulateCpuWorkload();
    this.simulateMemoryWorkload();
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

  // Simulate CPU-intensive work with a random duration between 0 and 50 ms
  private simulateCpuWorkload() {
    // Generate a random duration between 0ms and 50ms
    const randomDurationMs = Math.floor(Math.random() * 51); // 0 to 50 ms
    const start = Date.now();
    
    while (Date.now() - start < randomDurationMs) {
      let x = 0;
      for (let i = 0; i < 1e7; i++) {  
        x += Math.sqrt(i);
      }
    }
  }

  // Simulate memory usage with a random array size between 0 and half of 1e7 (5e6)
  private simulateMemoryWorkload() {
    // Generate a random size between 0 and 5e6
    const randomArraySize = Math.floor(Math.random() * (5e6 + 1)); // 0 to 5e6
    
    const largeArray = new Array(randomArraySize).fill('memory usage');
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