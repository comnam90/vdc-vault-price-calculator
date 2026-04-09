import { describe, expect, it } from "vitest";

import { parseUrlParams, serialiseUrlParams } from "@/lib/url-params";
import type { CalculatorInputs } from "@/types/calculator";

describe("parseUrlParams", () => {
  it("returns empty object for empty string", () => {
    expect(parseUrlParams("")).toEqual({});
  });

  it("returns empty object for bare question mark", () => {
    expect(parseUrlParams("?")).toEqual({});
  });

  it("parses all three valid fields", () => {
    expect(parseUrlParams("?region=aws-us-east-1&term=3&capacity=50")).toEqual({
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
    });
  });

  it("works without leading question mark", () => {
    expect(parseUrlParams("region=aws-us-east-1&term=1&capacity=10")).toEqual({
      regionId: "aws-us-east-1",
      termYears: 1,
      capacityTiB: 10,
    });
  });

  it("parses only region when other params are absent", () => {
    const result = parseUrlParams("?region=azure-eastus");
    expect(result).toEqual({ regionId: "azure-eastus" });
    expect(result).not.toHaveProperty("termYears");
    expect(result).not.toHaveProperty("capacityTiB");
  });

  it("omits term=0 (below minimum)", () => {
    const result = parseUrlParams("?region=aws-us-east-1&term=0&capacity=10");
    expect(result).not.toHaveProperty("termYears");
  });

  it("omits term=6 (above maximum)", () => {
    const result = parseUrlParams("?region=aws-us-east-1&term=6&capacity=10");
    expect(result).not.toHaveProperty("termYears");
  });

  it("omits term=abc (non-numeric)", () => {
    const result = parseUrlParams("?term=abc");
    expect(result).not.toHaveProperty("termYears");
  });

  it("accepts term=5 (maximum)", () => {
    expect(parseUrlParams("?term=5")).toEqual({ termYears: 5 });
  });

  it("accepts term=1 (minimum)", () => {
    expect(parseUrlParams("?term=1")).toEqual({ termYears: 1 });
  });

  it("omits capacity=0", () => {
    const result = parseUrlParams("?capacity=0");
    expect(result).not.toHaveProperty("capacityTiB");
  });

  it("omits capacity=-1 (negative)", () => {
    const result = parseUrlParams("?capacity=-1");
    expect(result).not.toHaveProperty("capacityTiB");
  });

  it("omits capacity=abc (non-numeric)", () => {
    const result = parseUrlParams("?capacity=abc");
    expect(result).not.toHaveProperty("capacityTiB");
  });

  it("accepts capacity=1 (minimum)", () => {
    expect(parseUrlParams("?capacity=1")).toEqual({ capacityTiB: 1 });
  });

  it("accepts large capacity values", () => {
    expect(parseUrlParams("?capacity=10000")).toEqual({ capacityTiB: 10000 });
  });

  it("ignores unknown params", () => {
    const result = parseUrlParams("?region=aws-us-east-1&foo=bar&term=2");
    expect(result).toEqual({ regionId: "aws-us-east-1", termYears: 2 });
  });
});

describe("serialiseUrlParams", () => {
  it("serialises all three fields in stable order", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
    };
    expect(serialiseUrlParams(inputs)).toBe(
      "region=aws-us-east-1&term=3&capacity=50",
    );
  });

  it("encodes region IDs with hyphens correctly", () => {
    const inputs: CalculatorInputs = {
      regionId: "azure-eastus2",
      termYears: 1,
      capacityTiB: 1,
    };
    expect(serialiseUrlParams(inputs)).toBe(
      "region=azure-eastus2&term=1&capacity=1",
    );
  });

  it("round-trips through parseUrlParams", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-eu-west-1",
      termYears: 5,
      capacityTiB: 250,
    };
    const result = parseUrlParams("?" + serialiseUrlParams(inputs));
    expect(result).toEqual(inputs);
  });
});
