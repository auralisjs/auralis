import { Auralis } from "../auralis.ts";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class, unicorn/no-static-only-class
export class AuralisFactory {
  static async create(): Promise<Auralis> {
    const instance = new Auralis();

    await instance.initialize();

    return instance;
  }
}
