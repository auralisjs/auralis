import { Auralis, AURALIS_REGISTRY_SYMBOL } from "../auralis.ts";
import type { Constructor } from "../utilities/constructor.util.ts";
import { getParamNames } from "../utilities/param-names.util.ts";

export function RequestBody(type: Constructor): ParameterDecorator {
  return function (target, propertyKey, parameterIndex) {
    const controller = target.constructor as unknown as Constructor;

    const fn: Function = controller.prototype[propertyKey!];

    const paramNames = getParamNames(fn);
    const paramName: string = paramNames[parameterIndex];

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

    if (process.env.AURALIS_DEBUG) {
      console.debug("[RequestBody]:", {
        owningClass: controller,
        propertyKey,
        parameterIndex,
        type,
        paramName,
      });
    }
  };
}
