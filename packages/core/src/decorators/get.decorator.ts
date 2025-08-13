import { HttpMethod } from "./http-method.decorator.ts";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/GET
 */
export function Get(path: string): MethodDecorator {
  return HttpMethod("GET", path);
}
