import { HttpMethod } from "./http-method.decorator.ts";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/DELETE
 */
export function Delete(path: string): MethodDecorator {
  return HttpMethod("DELETE", path);
}
