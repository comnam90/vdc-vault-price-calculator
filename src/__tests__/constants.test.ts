import { describe, expect, it } from "vitest";
import {
  ANNUAL_EGRESS_FACTOR,
  ANNUAL_READ_FACTOR,
  MONTHS_PER_YEAR,
  OPERATION_SIZE_MB,
  TIB_TO_GB,
  TIB_TO_MB,
  VDC_API_BASE,
} from "@/lib/constants";

describe("constants", () => {
  it("VDC_API_BASE points to the correct endpoint", () => {
    expect(VDC_API_BASE).toBe("https://vdcmap.bcthomas.com/api/v1");
  });

  it("OPERATION_SIZE_MB is 1", () => {
    expect(OPERATION_SIZE_MB).toBe(1);
  });

  it("ANNUAL_READ_FACTOR is 0.2 (20%)", () => {
    expect(ANNUAL_READ_FACTOR).toBe(0.2);
  });

  it("ANNUAL_EGRESS_FACTOR is 0.2 (20%)", () => {
    expect(ANNUAL_EGRESS_FACTOR).toBe(0.2);
  });

  it("TIB_TO_GB is 1024", () => {
    expect(TIB_TO_GB).toBe(1024);
  });

  it("TIB_TO_MB is 1024 * 1024", () => {
    expect(TIB_TO_MB).toBe(1024 * 1024);
  });

  it("MONTHS_PER_YEAR is 12", () => {
    expect(MONTHS_PER_YEAR).toBe(12);
  });
});
