import type { Constructor } from "../utilities/constructor.util.ts";
import { ensureControllerRef } from "../utilities/registry.util.ts";

/**
 * Controller decorator for defining a controller class.
 *
 * This decorator does not apply response headers.
 *
 * @param path The base path for the controller that usually starts with a slash.
 *
 * @see `RestController` if you want to create a RESTful controller.
 */
export function Controller(path: string): ClassDecorator {
  return function (target) {
    const controller = target as unknown as Constructor;

    const controllerRef = ensureControllerRef(controller);

    controllerRef.path = path;
    controllerRef.responseHeaders ??= {};

    if (process.env.AURALIS_DEBUG) {
      console.debug("[Controller]:", {
        args: [target],
        controller,
        path,
      });
    }
  };
}
