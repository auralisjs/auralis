import { glob } from "fs/promises";
import { createServer, IncomingMessage } from "http";
import { resolve } from "path";
import { pathToFileURL } from "url";

export const AURALIS_REGISTRY_SYMBOL = Symbol("auralis:registry");

export class Auralis {
  static [AURALIS_REGISTRY_SYMBOL]: Map<
    Function,
    {
      path?: string;
      handlers?: Map<
        Function,
        {
          name?: string;
          method?: "GET";
          path?: string;
          pathVariables?: Map<
            string,
            {
              type: Function;
              index: number;
            }
          >;
        }
      >;
    }
  > = new Map();

  #handlers: Array<{
    fn: Function;
    name: string;
    method: "GET";
    path: string;
    pathVariables?: Map<
      string,
      {
        type: Function;
        index: number;
      }
    >;
  }> = [];

  async initialize() {
    // Load controllers so that their decorators are registered
    for await (const entry of glob("./**/*.controller.js", {
      withFileTypes: true,
    })) {
      console.log("Loading controller:", entry.name);
      await import(pathToFileURL(resolve(entry.parentPath, entry.name)).href);
    }

    console.dir(Auralis[AURALIS_REGISTRY_SYMBOL], {
      depth: Number.POSITIVE_INFINITY,
    });

    for (const [controller, controllerMetadata] of Auralis[
      AURALIS_REGISTRY_SYMBOL
    ]) {
      if (
        !controllerMetadata.handlers ||
        controllerMetadata.handlers.size === 0
      ) {
        console.warn(
          `[Auralis]: Controller ${controller.name} has no handlers registered.`
        );
        continue;
      }

      if (!controllerMetadata.path) {
        console.warn(
          `[Auralis]: Controller ${controller.name} has no path registered.`
        );
        continue;
      }

      for (const [handler, handlerMetadata] of controllerMetadata.handlers) {
        if (!handlerMetadata.name) {
          console.warn(`[Auralis]: Handler has no name registered.`);
          continue;
        }

        if (!handlerMetadata.path) {
          console.warn(
            `[Auralis]: Handler ${handlerMetadata.name} has no path registered.`
          );
          continue;
        }

        if (!handlerMetadata.method) {
          console.warn(
            `[Auralis]: Handler ${handlerMetadata.name} has no method registered.`
          );
          continue;
        }

        this.#handlers.push({
          fn: handler,
          name: handlerMetadata.name,
          method: handlerMetadata.method,
          path: controllerMetadata.path + handlerMetadata.path,
          pathVariables: handlerMetadata.pathVariables,
        });
      }
    }
  }

  async listen(port: number) {
    const server = createServer((req, res) => {
      console.log("Request received:", req.method, req.url);

      const handlerRef = this.#handlers.find(
        (handler) =>
          handler.method === req.method && pathMatches(handler.path, req)
      );

      if (handlerRef) {
        console.log("[Auralis]: Found handler for", req.url, handlerRef);

        const parametersForHandler: any[] = [];

        if (handlerRef.pathVariables) {
          const regexPattern = handlerRef.path.replace(
            /:(\w+)/g,
            (_, name) => `(?<${name}>[^/]+)`
          );
          const regex = new RegExp(regexPattern);
          const match = regex.exec(req.url!);

          if (match) {
            console.log("[Auralis]: Extracted path variables", match);

            for (const [
              pathVariableName,
              pathVariableRef,
            ] of handlerRef.pathVariables) {
              parametersForHandler[pathVariableRef.index] =
                pathVariableRef.type(match.groups![pathVariableName]);
            }
          }
        }

        const responseBody = handlerRef.fn(...parametersForHandler);
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(responseBody));
      }

      res.end();
    });

    server.listen(port);
  }
}

function pathMatches(path: string, req: IncomingMessage): boolean {
  // console.log("[pathMatches]: tries to match", path, "with", req.url);

  const requestUrl = req.url;

  if (!requestUrl) {
    return false;
  }

  if (path === requestUrl) {
    return true;
  }

  // trim trailing slash
  const trimmedPath = path.replace(/\/$/, "");
  const trimmedUrl = requestUrl?.replace(/\/$/, "");

  const regexPattern = "^" + trimmedPath.replace(/:(\w+)/g, "([^/]+)") + "$";
  const regex = new RegExp(regexPattern);

  return regex.test(trimmedUrl);
}
