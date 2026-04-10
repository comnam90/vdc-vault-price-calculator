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

  it("parses egress=0 as excludeEgress: true", () => {
    const result = parseUrlParams(
      "?region=aws-us-east-1&term=3&capacity=50&egress=0",
    );
    expect(result.excludeEgress).toBe(true);
  });

  it("omits excludeEgress when egress param is absent", () => {
    const result = parseUrlParams("?region=aws-us-east-1&term=3&capacity=50");
    expect(result).not.toHaveProperty("excludeEgress");
  });

  it("omits excludeEgress when egress=1 (egress included)", () => {
    const result = parseUrlParams("?egress=1");
    expect(result).not.toHaveProperty("excludeEgress");
  });

  it("ignores invalid egress param values", () => {
    const result = parseUrlParams("?egress=true");
    expect(result).not.toHaveProperty("excludeEgress");
  });
});

describe("serialiseUrlParams", () => {
  it("serialises all three fields in stable order", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
      restorePercentage: 20,
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
      restorePercentage: 20,
    };
    expect(serialiseUrlParams(inputs)).toBe(
      "region=azure-eastus2&term=1&capacity=1",
    );
  });

  it("round-trips non-default restorePercentage through parseUrlParams", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-eu-west-1",
      termYears: 5,
      capacityTiB: 250,
      restorePercentage: 50,
    };
    const result = parseUrlParams("?" + serialiseUrlParams(inputs));
    expect(result.restorePercentage).toBe(50);
    expect(result.regionId).toBe("aws-eu-west-1");
    expect(result.termYears).toBe(5);
    expect(result.capacityTiB).toBe(250);
  });

  it("includes egress=0 when excludeEgress is true", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
      excludeEgress: true,
      restorePercentage: 20,
    };
    expect(serialiseUrlParams(inputs)).toContain("egress=0");
  });

  it("omits egress param when excludeEgress is false", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
      excludeEgress: false,
      restorePercentage: 20,
    };
    expect(serialiseUrlParams(inputs)).not.toContain("egress");
  });

  it("omits egress param when excludeEgress is absent", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
      restorePercentage: 20,
    };
    expect(serialiseUrlParams(inputs)).not.toContain("egress");
  });

  it("round-trips excludeEgress: true through parseUrlParams", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-eu-west-1",
      termYears: 5,
      capacityTiB: 250,
      excludeEgress: true,
      restorePercentage: 20,
    };
    const result = parseUrlParams("?" + serialiseUrlParams(inputs));
    expect(result.excludeEgress).toBe(true);
  });

  it("omits restore param when restorePercentage is 20 (default)", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
      restorePercentage: 20,
    };
    expect(serialiseUrlParams(inputs)).not.toContain("restore");
  });

  it("includes restore=50 when restorePercentage is 50", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
      restorePercentage: 50,
    };
    expect(serialiseUrlParams(inputs)).toContain("restore=50");
  });

  it("includes restore=0 when restorePercentage is 0", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
      restorePercentage: 0,
    };
    expect(serialiseUrlParams(inputs)).toContain("restore=0");
  });
});

describe("parseUrlParams restore param", () => {
  it("parses restore=50 as restorePercentage: 50", () => {
    const result = parseUrlParams("?restore=50");
    expect(result.restorePercentage).toBe(50);
  });

  it("parses restore=0 as restorePercentage: 0", () => {
    const result = parseUrlParams("?restore=0");
    expect(result.restorePercentage).toBe(0);
  });

  it("parses restore=100 as restorePercentage: 100", () => {
    const result = parseUrlParams("?restore=100");
    expect(result.restorePercentage).toBe(100);
  });

  it("omits restorePercentage when restore param is absent", () => {
    const result = parseUrlParams("?region=aws-us-east-1");
    expect(result).not.toHaveProperty("restorePercentage");
  });

  it("ignores restore=101 (above maximum)", () => {
    const result = parseUrlParams("?restore=101");
    expect(result).not.toHaveProperty("restorePercentage");
  });

  it("ignores restore=-1 (below minimum)", () => {
    const result = parseUrlParams("?restore=-1");
    expect(result).not.toHaveProperty("restorePercentage");
  });

  it("ignores restore=abc (non-numeric)", () => {
    const result = parseUrlParams("?restore=abc");
    expect(result).not.toHaveProperty("restorePercentage");
  });

  it("round-trips restorePercentage=75 through serialiseUrlParams", () => {
    const inputs: CalculatorInputs = {
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
      restorePercentage: 75,
    };
    const result = parseUrlParams("?" + serialiseUrlParams(inputs));
    expect(result.restorePercentage).toBe(75);
  });
});
