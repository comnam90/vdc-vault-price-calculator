import { describe, expect, it } from "vitest";
import {
  formatUSD,
  formatUSDCompact,
  formatPerTbMonth,
} from "@/lib/format-utils";

describe("formatUSD", () => {
  it("formats 1234 as $1,234.00", () => {
    expect(formatUSD(1234)).toBe("$1,234.00");
  });

  it("formats 1234.56 as $1,234.56", () => {
    expect(formatUSD(1234.56)).toBe("$1,234.56");
  });

  it("formats 0 as $0.00", () => {
    expect(formatUSD(0)).toBe("$0.00");
  });

  it("formats 1234567.89 as $1,234,567.89", () => {
    expect(formatUSD(1234567.89)).toBe("$1,234,567.89");
  });
});

describe("formatUSDCompact", () => {
  it("formats 1234 as $1.2K", () => {
    expect(formatUSDCompact(1234)).toBe("$1.2K");
  });

  it("formats 1234567 as $1.2M", () => {
    expect(formatUSDCompact(1234567)).toBe("$1.2M");
  });

  it("formats 42 as $42 (no suffix for small amounts)", () => {
    expect(formatUSDCompact(42)).toBe("$42");
  });
});

describe("formatPerTbMonth", () => {
  it("formats 14 as $14/TB/mo", () => {
    expect(formatPerTbMonth(14)).toBe("$14/TB/mo");
  });

  it("returns TBD for null", () => {
    expect(formatPerTbMonth(null)).toBe("TBD");
  });
});
