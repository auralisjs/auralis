import { AuralisResponseError } from "./auralis-response.error.ts";

export class NotFoundResponseError extends AuralisResponseError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
