/// <reference types="node" />

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const indexCss = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

function getDarkSchemeRootBlock(source: string): string {
  const mediaMatch = /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{/.exec(
    source,
  );
  const mediaStart = mediaMatch?.index ?? -1;

  if (mediaStart === -1) {
    throw new Error("Missing prefers-color-scheme dark media block");
  }

  const rootMatch = /:root\s*\{/.exec(source.slice(mediaStart));
  const rootStart = rootMatch === null ? -1 : mediaStart + rootMatch.index;

  if (rootStart === -1) {
    throw new Error("Missing :root block inside dark media query");
  }

  const blockStart = source.indexOf("{", rootStart);
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

  throw new Error("Unclosed dark-mode :root block");
}

describe("dark theme contract", () => {
  it("defines readable semantic foreground tokens for prefers-color-scheme dark", () => {
    const darkRootBlock = getDarkSchemeRootBlock(indexCss);

    expect(darkRootBlock).toContain("--background:");
    expect(darkRootBlock).toContain("--foreground:");
    expect(darkRootBlock).toContain("--card:");
    expect(darkRootBlock).toContain("--card-foreground:");
    expect(darkRootBlock).toContain("--popover:");
    expect(darkRootBlock).toContain("--popover-foreground:");
  });
});
