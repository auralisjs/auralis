import { Auralis, AURALIS_REGISTRY_SYMBOL } from "../auralis.ts";
import type { Constructor } from "../utilities/constructor.util.ts";

export const Post: MethodDecorator = (target, propertyKey, descriptor) => {
  const controller = target.constructor as unknown as Constructor;
  const fn = descriptor.value as Function;

  if (!Auralis[AURALIS_REGISTRY_SYMBOL].has(controller)) {
    Auralis[AURALIS_REGISTRY_SYMBOL].set(controller, {});
  }

  const controllerRef = Auralis[AURALIS_REGISTRY_SYMBOL].get(controller)!;
  controllerRef.handlers ??= new Map();

  if (!controllerRef.handlers.has(fn)) {
    controllerRef.handlers.set(fn, {});
  }

  const handlerRef = controllerRef.handlers.get(fn)!;
  handlerRef.method = "POST";

  console.log("[Post]:", {
    owningClass: controller,
    propertyKey,
    fn,
  });
};
