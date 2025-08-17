import { AuralisFactory } from "@auralis/core";
import { OpenAPI } from "@auralis/openapi";

const app = await AuralisFactory.create();
app.use(OpenAPI, {});

export { app };
