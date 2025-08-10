import type { UUID } from "node:crypto";

export class Cat {
  id!: UUID;

  name!: string;

  age!: number;
}
