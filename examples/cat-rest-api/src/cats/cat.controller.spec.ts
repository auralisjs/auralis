import supertest from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../app.ts";

describe("CatController /cats", () => {
  it("GET /", async () => {
    const response = await supertest(app.server).get("/cats");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: "1aefd497-bb47-47e3-b160-cb69c5ba0ff4",
        name: "Kami",
        age: 4,
      },
    ]);
  });

  it("POST /", async () => {
    const response = await supertest(app.server).post("/cats").send({
      name: "Mr Kettles",
      age: 5,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: expect.any(String),
      name: "Mr Kettles",
      age: 5,
    });
  });

  it("GET /:id", async () => {
    const response = await supertest(app.server).get(
      "/cats/1aefd497-bb47-47e3-b160-cb69c5ba0ff4"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "1aefd497-bb47-47e3-b160-cb69c5ba0ff4",
      name: "Kami",
      age: 4,
    });
  });

  it("PUT /:id", async () => {
    const response = await supertest(app.server)
      .put("/cats/1aefd497-bb47-47e3-b160-cb69c5ba0ff4")
      .send({
        name: "Ms Moneypenny",
        age: 6,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "1aefd497-bb47-47e3-b160-cb69c5ba0ff4",
      name: "Ms Moneypenny",
      age: 6,
    });
  });

  it("PATCH /:id", async () => {
    const response = await supertest(app.server)
      .patch("/cats/1aefd497-bb47-47e3-b160-cb69c5ba0ff4")
      .send({
        name: "Ms Moneypenny",
        age: 6,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "1aefd497-bb47-47e3-b160-cb69c5ba0ff4",
      name: "Ms Moneypenny",
      age: 6,
    });
  });

  it("DELETE /:id", async () => {
    const response = await supertest(app.server).delete(
      "/cats/1aefd497-bb47-47e3-b160-cb69c5ba0ff4"
    );

    expect(response.status).toBe(204);
  });
});
