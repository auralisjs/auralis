import type { Constructor } from "../utilities/constructor.util.ts";
import { getParamNames } from "../utilities/param-names.util.ts";
import { ensureHandlerRef } from "../utilities/registry.util.ts";

export const Response: ParameterDecorator = (
  target,
  propertyKey,
  parameterIndex
) => {
  const controller = target.constructor as unknown as Constructor;

  const fn: Function = controller.prototype[propertyKey!];

  const paramNames = getParamNames(fn);
  const paramName: string = paramNames[parameterIndex];

  const { handlerRef } = ensureHandlerRef(controller, fn);

  handlerRef.passResponse = {
    paramName,
    index: parameterIndex,
  };

  if (process.env.AURALIS_DEBUG) {
    console.debug("[Response]:", {
      args: [target, propertyKey, parameterIndex],
      controller,
      fn,
      paramName,
    });
  }
};
