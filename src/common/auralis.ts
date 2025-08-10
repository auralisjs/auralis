import { glob } from "fs/promises";
import { createServer, IncomingMessage } from "http";
import { resolve } from "path";
import { pathToFileURL } from "url";
import { AuralisResponseError } from "./auralis-response.error.ts";
import type { Constructor } from "./constructor.util.ts";
import { InternalServerError } from "./internal-server-response.error.ts";
import { NotFoundResponseError } from "./not-found-response.error.ts";

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
          method?: "GET" | "POST" | "PUT";
          path?: string;
          pathVariables?: Map<
            string,
            {
              type: Function;
              index: number;
            }
          >;
          requestBody?: {
            paramName: string;
            type: Constructor;
            index: number;
          };
        }
      >;
    }
  > = new Map();

  #handlers: Array<{
    fn: Function;
    name: string;
    method: "GET" | "POST" | "PUT";
    path: string;
    pathVariables?: Map<
      string,
      {
        type: Function;
        index: number;
      }
    >;
    requestBody?: {
      paramName: string;
      type: Constructor;
      index: number;
    };
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
          requestBody: handlerMetadata.requestBody,
        });
      }
    }
  }

  async listen(port: number) {
    const server = createServer(async (req, res) => {
      console.log("Request received:", req.method, req.url);

      try {
        const handlerRef = this.#handlers.find(
          (handler) =>
            handler.method === req.method && pathMatches(handler.path, req)
        );

        if (handlerRef) {
          console.log("[Auralis]: Found handler for", req.url, handlerRef);

          const parametersForHandler: any[] = [];

          // Extract path variables if they exist
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

          // Extract request body if it exists
          if (handlerRef.requestBody) {
            const { type, index } = handlerRef.requestBody;

            const rawBody = await new Promise<string>((resolve) => {
              let data = "";
              req
                .on("data", (chunk) => {
                  data += chunk;
                })
                .on("end", () => {
                  resolve(data);
                });
            });

            parametersForHandler[index] = new type(JSON.parse(rawBody));
          }

          const responseBody = handlerRef.fn(...parametersForHandler);
          res.setHeader("Content-Type", "application/json");
          res.write(JSON.stringify(responseBody));
        } else {
          const notFoundResponse = new NotFoundResponseError(
            `No handler found for ${req.method} ${req.url}`
          );
          notFoundResponse.handle(res);
        }
      } catch (error) {
        console.error("[Auralis]: Error handling request", error);

        if (error instanceof AuralisResponseError) {
          error.handle(res);
        } else {
          const internalServerError = new InternalServerError();
          internalServerError.cause = error;
          internalServerError.handle(res);
        }
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
