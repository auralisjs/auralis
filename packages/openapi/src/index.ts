import type { Auralis } from "@auralis/core";
import { definePlugin } from "@auralis/core";
import type { ServerResponse } from "node:http";
import type { OpenAPIV3_1 } from "openapi-types";
import { stringify } from "yaml";

const HttpMethods = {
  GET: "get",
  PUT: "put",
  POST: "post",
  DELETE: "delete",
  OPTIONS: "options",
  HEAD: "head",
  PATCH: "patch",
  TRACE: "trace",
} as const;

function generateOpenAPISpec(app: Auralis): OpenAPIV3_1.Document {
  // https://swagger.io/docs/specification/v3_0/basic-structure/

  const paths: OpenAPIV3_1.PathsObject = {};
  const components: OpenAPIV3_1.ComponentsObject = {
    schemas: {},
  };

  for (const handler of app.handlers) {
    const { method, path, name } = handler;

    if (method === "CONNECT") {
      continue; // Skip CONNECT method for OpenAPI
    }

    paths[path] ??= {};

    if ("controller" in handler) {
      const contentType =
        handler.responseHeaders?.["Content-Type"] ?? "application/json";

      paths[path][HttpMethods[method]] = {
        tags: [handler.controller.name],
        operationId: name,
        responses: {
          200: {
            description: "Successful response",
            content: {
              [contentType]: {
                // TODO @Shinigami92 2025-08-18: Implement response schema
              },
            },
          },
        },
      };
    }
  }

  return {
    openapi: "3.1.0",
    info: {
      // TODO @Shinigami92 2025-08-18: Pass info from outside
      title: "Auralis API",
      description: "API documentation for Auralis",
      version: "1.0.0",
    },

    servers: [
      {
        url: app.getUrl(),
        // TODO @Shinigami92 2025-08-18: pass server description from outside
        description: "Auralis server",
      },
    ],

    paths,
    components,
  };
}

function cors(res: ServerResponse): void {
  // TODO @Shinigami92 2025-08-18: add cors property to app
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.setHeader("Access-Control-Max-Age", 2592000); // 30 days
  res.setHeader("Access-Control-Allow-Headers", "content-type");
}

export const OpenAPI = definePlugin({
  name: "auralis:openapi",
  register(app, options) {
    console.log("Registering OpenAPI plugin with options:", options);

    let openapiSpec: OpenAPIV3_1.Document | null = null;
    let openapiSpecYaml: string | null = null;

    app.addPluginHandler(
      {
        name: "auralis:openapi:generate",
        method: "GET",
        path: "/openapi.json",
      },
      (req, res) => {
        if (!openapiSpec) {
          openapiSpec = generateOpenAPISpec(app);
        }

        cors(res);

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(openapiSpec));
      }
    );

    app.addPluginHandler(
      {
        name: "auralis:openapi:generate",
        method: "GET",
        path: "/openapi.yaml",
      },
      (req, res) => {
        if (!openapiSpec) {
          openapiSpec = generateOpenAPISpec(app);
        }

        if (!openapiSpecYaml) {
          openapiSpecYaml = stringify(openapiSpec);
        }

        cors(res);

        res.setHeader("Content-Type", "application/yaml; charset=utf-8");
        res.end(openapiSpecYaml);
      }
    );
  },
});
