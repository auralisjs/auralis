import type { IncomingMessage, ServerResponse } from "node:http";

export abstract class AuralisResponseError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }

  handle(res: ServerResponse & { req: IncomingMessage }): void {
    res.statusCode = this.statusCode;
    res.setHeader("Content-Type", "application/json");
    res.write(
      JSON.stringify({
        error: this.name,
        message: this.message,
        statusCode: this.statusCode,
      })
    );
  }
}
