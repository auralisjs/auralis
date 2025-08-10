import { Auralis, AURALIS_REGISTRY_SYMBOL } from "./auralis.ts";

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
const ARGUMENT_NAMES = /([^\s,]+)/g;

function getParamNames(func: Function) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, "");
  const result = fnStr
    .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
    .match(ARGUMENT_NAMES);

  return result || [];
}

export function PathVariable(type = String): ParameterDecorator {
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
    handlerRef.pathVariables ??= new Map();
    handlerRef.pathVariables.set(paramName, { type, index: parameterIndex });

    console.log("[PathVariable]:", {
      owningClass: controller,
      propertyKey,
      parameterIndex,
      type,
      paramName,
    });
  };
}
