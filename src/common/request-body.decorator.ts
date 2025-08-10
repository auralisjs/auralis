import { Auralis, AURALIS_REGISTRY_SYMBOL } from "./auralis.ts";
import type { Constructor } from "./constructor.util.ts";
import { getParamNames } from "./param-names.util.ts";

export function RequestBody(type: Constructor): ParameterDecorator {
  return function (target, propertyKey, parameterIndex) {
    const controller = target.constructor;

    const fn: Function = controller.prototype[propertyKey!];

    const paramNames = getParamNames(fn);
    let paramName: string = paramNames[parameterIndex];

    if (!Auralis[AURALIS_REGISTRY_SYMBOL].has(controller)) {
      Auralis[AURALIS_REGISTRY_SYMBOL].set(controller, {});
    }

    const controllerRef = Auralis[AURALIS_REGISTRY_SYMBOL].get(controller)!;
    controllerRef.handlers ??= new Map();

    if (!controllerRef.handlers.has(fn)) {
      controllerRef.handlers.set(fn, {});
    }

    const handlerRef = controllerRef.handlers.get(fn)!;
    handlerRef.requestBody = {
      paramName,
      type,
      index: parameterIndex,
    };

    console.log("[RequestBody]:", {
      owningClass: controller,
      propertyKey,
      parameterIndex,
      type,
      paramName,
    });
  };
}
