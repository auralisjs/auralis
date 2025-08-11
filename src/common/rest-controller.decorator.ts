import { Auralis, AURALIS_REGISTRY_SYMBOL } from "./auralis.ts";

export function RestController(path: string): ClassDecorator {
  return function (target) {
    const controller = target;

    if (!Auralis[AURALIS_REGISTRY_SYMBOL].has(controller)) {
      Auralis[AURALIS_REGISTRY_SYMBOL].set(controller, {});
    }

    const controllerRef = Auralis[AURALIS_REGISTRY_SYMBOL].get(controller)!;

    // TODO @Shinigami92 2025-08-11: Is `args[0].name` needed?
    controllerRef.path = path;
    controllerRef.responseHeaders ??= {};
    controllerRef.responseHeaders["Content-Type"] =
      "application/json; charset=utf-8";

    console.log("[RestController]:", {
      path,
      controller,
    });
  };
}
