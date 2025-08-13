import { HttpMethod } from "./http-method.decorator.ts";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT
 */
export function Put(path: string): MethodDecorator {
  return HttpMethod("PUT", path);
}
