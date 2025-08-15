import type { Constructor } from "../utilities/constructor.util.ts";
import { ensureHandlerRef } from "../utilities/registry.util.ts";

export type HttpMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "PATCH";

export function HttpMethod(method: HttpMethod, path: string): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const controller = (
      typeof target === "function" ? target : target.constructor
    ) as Constructor;
    const fn = descriptor.value as (...args: unknown[]) => unknown;

    const { handlerRef } = ensureHandlerRef(controller, fn);

    handlerRef.name = propertyKey.toString();
    handlerRef.method = method;
    handlerRef.path = path;

    if (process.env.AURALIS_DEBUG) {
      console.debug(`[${method}]:`, {
        args: [target, propertyKey, descriptor],
        controller,
        fn,
        path,
      });
    }
  };
}
