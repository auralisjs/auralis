import { AuralisResponseError } from "./auralis-response.error.ts";

export class InternalServerError extends AuralisResponseError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
    this.name = "InternalServerError";
  }
}
