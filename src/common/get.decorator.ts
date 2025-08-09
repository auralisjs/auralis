import { METHOD_REGISTRY } from "./method.registry.ts";

export function Get(): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    METHOD_REGISTRY.push({
      method: "GET",
      fn: descriptor.value as Function,
    });
  };
}
