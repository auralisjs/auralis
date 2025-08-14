import { Get, Request, Response, RestController } from "@auralis/core";
import type { IncomingMessage, ServerResponse } from "node:http";

@RestController("/natives")
export class NativeController {
  @Get("/")
  public example(
    @Request req: IncomingMessage,
    @Response res: ServerResponse
  ): object {
    return {
      message: "Hello from the Native Controller!",
      requestHeaders: req.headers,
      responseHeaders: res.getHeaders(),
    };
  }
}
