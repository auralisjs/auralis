import type { ControllerMetadata, HandlerMetadata } from "../auralis.ts";
import { Auralis, AURALIS_REGISTRY_SYMBOL } from "../auralis.ts";
import type { Constructor } from "./constructor.util.ts";

export function ensureControllerRef(
  controller: Constructor
): ControllerMetadata {
  if (!Auralis[AURALIS_REGISTRY_SYMBOL].has(controller)) {
    Auralis[AURALIS_REGISTRY_SYMBOL].set(controller, {});
  }

  return Auralis[AURALIS_REGISTRY_SYMBOL].get(controller)!;
}

export function ensureHandlerRef(
  controller: Constructor,
  fn: Function
): { controllerRef: ControllerMetadata; handlerRef: HandlerMetadata } {
  const controllerRef = ensureControllerRef(controller);
  controllerRef.handlers ??= new Map();

  if (!controllerRef.handlers.has(fn)) {
    controllerRef.handlers.set(fn, {});
  }

  const handlerRef = controllerRef.handlers.get(fn)!;

  return { controllerRef, handlerRef };
}
