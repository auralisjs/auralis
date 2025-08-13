import { HttpMethod } from "./http-method.decorator.ts";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST
 */
export function Post(path: string): MethodDecorator {
  return HttpMethod("POST", path);
}
