import { glob } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { METHOD_REGISTRY } from "./common/method.registry.ts";
import { PATH_REGISTRY } from "./common/path.decorator.ts";

const AuralisFactory = {
  create: async () => {
    const handlers: Array<{
      path: string;
      method: "GET";
      fn: Function;
    }> = [];

    const app = {
      listen: async (port: number) => {
        const server = createServer((req, res) => {
          const handler = handlers.find(
            ({ path, method }) => method === req.method && path === req.url
          );

          if (handler) {
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify(handler.fn(req, res)));
          }

          res.end();
        });

        server.listen(port);
      },
    };

    // Load controllers so that their decorators are registered
    for await (const entry of glob("./**/*.controller.*", {
      cwd: import.meta.dirname,
      withFileTypes: true,
    })) {
      await import(pathToFileURL(resolve(entry.parentPath, entry.name)).href);
    }

    const controllerPathEntries = PATH_REGISTRY.filter(
      (entry) => entry.kind === "Controller"
    );

    for (const entry of PATH_REGISTRY) {
      if (entry.kind === "Route") {
        const controller = controllerPathEntries.find(
          (e) => e.controller.prototype[entry.name] === entry.fn
        );

        if (!controller) {
          console.warn(`Controller not found for route: ${entry.name}`);
          continue;
        }

        handlers.push({
          path: controller.path + entry.path,
          method:
            METHOD_REGISTRY.find(({ fn }) => fn === entry.fn)?.method ?? "GET",
          fn: entry.fn,
        });
      }
    }

    console.log(handlers);

    return app;
  },
};

async function bootstrap() {
  const app = await AuralisFactory.create();

  await app.listen(4000);
}

bootstrap();
