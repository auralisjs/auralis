import { describe, expect, it } from "vitest";
import { Auralis, AURALIS_REGISTRY_SYMBOL } from "./auralis.ts";

describe("auralis", () => {
  it("should export the Auralis class", () => {
    expect(Auralis).toBeInstanceOf(Function);
  });

  it("should be instantiable", () => {
    const instance = new Auralis();
    expect(instance).toBeInstanceOf(Auralis);
  });

  it("should export the auralis registry symbol", () => {
    expect(AURALIS_REGISTRY_SYMBOL).toBeTypeOf("symbol");
  });

  it("should access the auralis registry", () => {
    expect(Auralis[AURALIS_REGISTRY_SYMBOL]).instanceOf(Map);
  });
});
