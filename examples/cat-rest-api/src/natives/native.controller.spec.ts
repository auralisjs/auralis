import supertest from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../app.ts";

describe("NativeController /natives", () => {
  it("GET /", async () => {
    const response = await supertest(app.server).get("/natives");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Hello from the Native Controller!",
      requestHeaders: {
        "accept-encoding": "gzip, deflate",
        connection: "close",
        host: expect.stringContaining("127.0.0.1:"),
      },
      responseHeaders: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  });
});
