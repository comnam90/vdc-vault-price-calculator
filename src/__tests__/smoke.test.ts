import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("can import App", async () => {
    const mod = await import("@/App");
    expect(mod.default).toBeDefined();
  });
});
