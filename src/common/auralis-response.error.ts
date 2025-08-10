import type { ServerResponse, IncomingMessage } from "http";

export abstract class AuralisResponseError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }

  handle(
    res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
  ): void {
    res.statusCode = this.statusCode;
    res.setHeader("Content-Type", "application/json");
    res.write(
      JSON.stringify({
        error: this.name,
        message: this.message,
        statusCode: this.statusCode,
      })
    );
    res.end();
  }
}
