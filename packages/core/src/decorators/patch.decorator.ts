import { HttpMethod } from "./http-method.decorator.ts";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH
 */
export function Patch(path: string): MethodDecorator {
  return HttpMethod("PATCH", path);
}
