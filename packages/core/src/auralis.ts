import { glob } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:http";
import type { Server } from "node:net";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { AuralisPlugin } from "./auralis.plugin.ts";
import type { HttpMethod } from "./decorators/http-method.decorator.ts";
import { AuralisResponseError } from "./errors/auralis-response.error.ts";
import { InternalServerError } from "./errors/internal-server-response.error.ts";
import { NotFoundResponseError } from "./errors/not-found-response.error.ts";
import type { Constructor } from "./utilities/constructor.util.ts";

export const AURALIS_REGISTRY_SYMBOL = Symbol("auralis:registry");

export interface HandlerMetadata {
  name?: string;
  method?: HttpMethod;
  path?: string;
  responseHeaders?: Record<string, string>;
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
  passRequest?: {
    paramName: string;
    index: number;
  };
  passResponse?: {
    paramName: string;
    index: number;
  };
}

export interface ControllerMetadata {
  path?: string;
  responseHeaders?: Record<string, string>;
  handlers?: Map<Function, HandlerMetadata>;
}

interface AuralisControllerHandler {
  controller: Constructor;
  fn: Function;
  name: string;
  method: HttpMethod;
  path: string;
  responseHeaders?: Record<string, string>;
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
  passRequest?: {
    paramName: string;
    index: number;
  };
  passResponse?: {
    paramName: string;
    index: number;
  };
}

export interface AuralisPluginHandler {
  name: string;
  method: HttpMethod;
  path: string;
  fn: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
}

export type AuralisHandler = AuralisControllerHandler | AuralisPluginHandler;

export class Auralis {
  static [AURALIS_REGISTRY_SYMBOL]: Map<Constructor, ControllerMetadata> =
    new Map();

  #handlers: AuralisHandler[] = [];

  #server?: Server;

  get handlers(): ReadonlyArray<AuralisHandler> {
    return this.#handlers;
  }

  get server(): Server {
    if (!this.#server) {
      throw new Error("[Auralis]: Server is not initialized");
    }

    return this.#server;
  }

  async initialize(): Promise<void> {
    // Load controllers so that their decorators are registered
    for await (const entry of glob("./**/*.controller.js", {
      withFileTypes: true,
    })) {
      if (process.env.AURALIS_DEBUG) {
        console.debug("[Auralis] Loading controller:", entry.name);
      }

      await import(pathToFileURL(resolve(entry.parentPath, entry.name)).href);
    }

    if (process.env.AURALIS_DEBUG) {
      console.dir(Auralis[AURALIS_REGISTRY_SYMBOL], {
        depth: Number.POSITIVE_INFINITY,
      });
    }

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
          controller,
          fn: handler,
          name: handlerMetadata.name,
          method: handlerMetadata.method,
          path: controllerMetadata.path + handlerMetadata.path,
          responseHeaders: {
            ...controllerMetadata.responseHeaders,
            ...handlerMetadata.responseHeaders,
          },
          pathVariables: handlerMetadata.pathVariables,
          requestBody: handlerMetadata.requestBody,
          passRequest: handlerMetadata.passRequest,
          passResponse: handlerMetadata.passResponse,
        });
      }
    }

    this.#initServer();
  }

  #initServer(): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.#server = createServer(async (req, res) => {
      if (process.env.AURALIS_DEBUG) {
        console.debug("[Auralis] Request received:", req.method, req.url);
      }

      try {
        const handlerRef = this.#handlers.find(
          (handler) =>
            handler.method === req.method && pathMatches(handler.path, req)
        );

        if (handlerRef) {
          if (process.env.AURALIS_DEBUG) {
            console.debug("[Auralis]: Found handler for", req.method, req.url);
          }

          if ("controller" in handlerRef) {
            const parametersForHandler: unknown[] = [];

            // Extract path variables if they exist
            if (handlerRef.pathVariables) {
              const regexPattern = handlerRef.path.replaceAll(
                /:(\w+)/g,
                (_, name) => `(?<${name as string}>[^/]+)`
              );
              const regex = new RegExp(regexPattern);
              const match = regex.exec(req.url!);

              if (match) {
                if (process.env.AURALIS_DEBUG) {
                  console.debug("[Auralis]: Extracted path variables", match);
                }

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
                    data += chunk as string;
                  })
                  .on("end", () => {
                    resolve(data);
                  });
              });

              parametersForHandler[index] = new type(JSON.parse(rawBody));
            }

            if (handlerRef.responseHeaders) {
              for (const [name, value] of Object.entries(
                handlerRef.responseHeaders
              )) {
                res.setHeader(name, value);
              }
            }

            if (handlerRef.passRequest) {
              const { index } = handlerRef.passRequest;
              parametersForHandler[index] = req;
            }

            if (handlerRef.passResponse) {
              const { index } = handlerRef.passResponse;
              parametersForHandler[index] = res;
            }

            const controllerInstance = new handlerRef.controller();
            const boundFn = handlerRef.fn.bind(controllerInstance);

            const responseBody = await boundFn(...parametersForHandler);

            if (!res.writableEnded && responseBody) {
              res.write(JSON.stringify(responseBody));
            }

            if (!res.headersSent && responseBody === void 0) {
              res.statusCode = 204;
            }
          } else {
            await handlerRef.fn(req, res);
          }
        } else {
          const notFoundResponse = new NotFoundResponseError(
            `No handler found for ${req.method!} ${req.url!}`
          );
          notFoundResponse.handle(res);
        }
      } catch (error) {
        if (process.env.AURALIS_DEBUG) {
          console.error("[Auralis]: Error handling request", error);
        }

        if (error instanceof AuralisResponseError) {
          error.handle(res);
        } else {
          const internalServerError = new InternalServerError();
          internalServerError.cause = error;
          internalServerError.handle(res);
        }
      }

      if (!res.writableEnded) {
        res.end();
      }
    });
  }

  use<TPluginOptions extends object>(
    plugin: AuralisPlugin<TPluginOptions>,
    options?: TPluginOptions
  ): this {
    if (process.env.AURALIS_DEBUG) {
      console.debug("[Auralis] Using plugin:", plugin.name);
    }

    plugin.register(this, options);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async listen(port: number): Promise<void> {
    this.#server?.listen(port);
  }

  getUrl(): string {
    if (!this.#server) {
      throw new Error("Server is not running");
    }

    const address = this.#server.address();

    if (!address) {
      throw new Error("Server is not running");
    }

    if (typeof address === "string") {
      return address;
    }

    // Map unspecified addresses to localhost for ergonomics
    const isUnspecified =
      address.address === "::" || address.address === "0.0.0.0";
    const host = isUnspecified ? "localhost" : address.address;

    if (address.family === "IPv6" && !isUnspecified) {
      return `http://[${host}]:${address.port.toString()}`;
    }

    return `http://${host}:${address.port.toString()}`;
  }

  addPluginHandler(
    metadata: Pick<AuralisPluginHandler, "name" | "method" | "path">,
    fn: AuralisPluginHandler["fn"]
  ): this {
    this.#handlers.push({
      name: metadata.name,
      method: metadata.method,
      path: metadata.path,
      fn,
    });
    return this;
  }
}

function pathMatches(path: string, req: IncomingMessage): boolean {
  if (process.env.AURALIS_DEBUG) {
    // console.debug("[pathMatches]: tries to match", path, "with", req.url);
  }

  const requestUrl = req.url;

  if (!requestUrl) {
    return false;
  }

  if (path === requestUrl) {
    return true;
  }

  // trim trailing slash
  const trimmedPath = path.replace(/\/$/, "");
  const trimmedUrl = requestUrl.replace(/\/$/, "");

  const regexPattern = `^${trimmedPath.replaceAll(/:(\w+)/g, "([^/]+)")}$`;
  const regex = new RegExp(regexPattern);

  return regex.test(trimmedUrl);
}
