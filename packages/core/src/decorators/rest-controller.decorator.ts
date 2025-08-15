import type { Constructor } from "../utilities/constructor.util.ts";
import { ensureControllerRef } from "../utilities/registry.util.ts";

export function RestController(path: string): ClassDecorator {
  return function (target) {
    const controller = target as unknown as Constructor;

    const controllerRef = ensureControllerRef(controller);

    // TODO @Shinigami92 2025-08-11: Is `args[0].name` needed?
    controllerRef.path = path;
    controllerRef.responseHeaders ??= {};
    controllerRef.responseHeaders["Content-Type"] =
      "application/json; charset=utf-8";

    if (process.env.AURALIS_DEBUG) {
      console.debug("[RestController]:", {
        args: [target],
        controller,
        path,
      });
    }
  };
}
