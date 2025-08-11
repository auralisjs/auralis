import { Auralis, AURALIS_REGISTRY_SYMBOL } from "./auralis.ts";

export function Path(path: string): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    const controller = target.constructor;

    if (!Auralis[AURALIS_REGISTRY_SYMBOL].has(controller)) {
      Auralis[AURALIS_REGISTRY_SYMBOL].set(controller, {});
    }

    const controllerRef = Auralis[AURALIS_REGISTRY_SYMBOL].get(controller)!;

    controllerRef.handlers ??= new Map();

    const fn = descriptor.value as Function | undefined;

    if (!fn) {
      return;
    }

    if (!controllerRef.handlers.has(fn)) {
      controllerRef.handlers.set(fn, {});
    }

    const handlerRef = controllerRef.handlers.get(fn)!;
    handlerRef.name = propertyKey.toString();
    handlerRef.path = path;

    console.log("[Path]:", {
      args: [target, propertyKey, descriptor],
      path,
      controller,
    });
  };
}
