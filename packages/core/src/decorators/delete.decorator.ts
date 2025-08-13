import { HttpMethod } from "./http-method.decorator.ts";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/DELETE
 */
export const Delete: MethodDecorator = HttpMethod("DELETE");
