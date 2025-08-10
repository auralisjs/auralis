import { Auralis, AURALIS_REGISTRY_SYMBOL } from "./auralis.ts";

export const Get: MethodDecorator = (target, propertyKey, descriptor) => {
  const controller = target.constructor;
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
  handlerRef.method = "GET";

  console.log("[Get]:", {
    owningClass: controller,
    propertyKey,
    fn,
  });
};
