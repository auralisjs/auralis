import { Auralis, AURALIS_REGISTRY_SYMBOL } from "./auralis.ts";

export function Path(path: string): ClassDecorator & MethodDecorator {
  return function (...args: any[]) {
    const isClassDecorator = typeof args[0] === "function";

    const controller = isClassDecorator ? args[0] : args[0].constructor;

    if (!Auralis[AURALIS_REGISTRY_SYMBOL].has(controller)) {
      Auralis[AURALIS_REGISTRY_SYMBOL].set(controller, {});
    }

    const controllerRef = Auralis[AURALIS_REGISTRY_SYMBOL].get(controller)!;

    if (isClassDecorator) {
      // TODO @Shinigami92 2025-08-10: Is `args[0].name` needed?
      controllerRef.path = path;
    } else {
      controllerRef.handlers ??= new Map();

      const fn = args[2].value;

      if (!controllerRef.handlers.has(fn)) {
        controllerRef.handlers.set(fn, {});
      }

      const handlerRef = controllerRef.handlers.get(fn)!;
      handlerRef.name = args[1];
      handlerRef.path = path;
    }

    console.log("[Path]:", {
      args,
      path,
      controller,
      isClassDecorator,
    });
  };
}
