import { Auralis, AURALIS_REGISTRY_SYMBOL } from "../auralis.ts";
import type { Constructor } from "../utilities/constructor.util.ts";

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

    if (!Auralis[AURALIS_REGISTRY_SYMBOL].has(controller)) {
      Auralis[AURALIS_REGISTRY_SYMBOL].set(controller, {});
    }

    const controllerRef = Auralis[AURALIS_REGISTRY_SYMBOL].get(controller)!;
    controllerRef.handlers ??= new Map();

    if (!controllerRef.handlers.has(fn)) {
      controllerRef.handlers.set(fn, {});
    }

    const handlerRef = controllerRef.handlers.get(fn)!;
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
