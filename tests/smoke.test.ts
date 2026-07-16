import { describe, expect, it } from "vitest";

describe("project bootstrap", () => {
  it("exposes a stable package identity", () => {
    expect("are-they-tanking").toMatch(/tanking/);
  });
});
