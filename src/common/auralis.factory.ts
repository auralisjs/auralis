import { Auralis } from "./auralis.ts";

export class AuralisFactory {
  static async create(): Promise<Auralis> {
    const instance = new Auralis();

    await instance.initialize();

    return instance;
  }
}
