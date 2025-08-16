import supertest from "supertest";
import { expect, it } from "vitest";
import { app } from "./app.ts";

it("should run a server", async () => {
  const response = await supertest(app.server).get("/");

  expect(response.status).toBe(404);
  expect(response.body).toEqual({
    error: "NotFoundError",
    message: "No handler found for GET /",
    statusCode: 404,
  });
});
