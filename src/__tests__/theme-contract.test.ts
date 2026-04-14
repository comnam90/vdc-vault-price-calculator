/// <reference types="node" />

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const indexCss = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

function getDarkClassBlock(source: string): string {
  const classMatch = /^\.dark\s*\{/m.exec(source);
  const classStart = classMatch?.index ?? -1;

  if (classStart === -1) {
    throw new Error("Missing .dark class block");
  }

  const blockStart = source.indexOf("{", classStart);
  let depth = 0;

  for (let index = blockStart; index < source.length; index += 1) {
    const char = source[index];

    if (char === "{") {
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(blockStart + 1, index);
      }
    }
  }

  throw new Error("Unclosed .dark class block");
}

describe("dark theme contract", () => {
  it("defines readable semantic foreground tokens in the .dark class block", () => {
    const darkClassBlock = getDarkClassBlock(indexCss);

    expect(darkClassBlock).toContain("--background:");
    expect(darkClassBlock).toContain("--foreground:");
    expect(darkClassBlock).toContain("--card:");
    expect(darkClassBlock).toContain("--card-foreground:");
    expect(darkClassBlock).toContain("--popover:");
    expect(darkClassBlock).toContain("--popover-foreground:");
  });
});
