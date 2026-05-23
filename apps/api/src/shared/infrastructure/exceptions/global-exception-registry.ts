import { Injectable } from '@nestjs/common';

@Injectable()
export class GlobalExceptionRegistry {
  private readonly statusCodes = new Map<string, number>();

  register(registry: Map<string, number>): void {
    registry.forEach((status, name) => {
      this.statusCodes.set(name, status);
    });
  }

  getStatusCode(exceptionName: string): number | undefined {
    return this.statusCodes.get(exceptionName);
  }
}
