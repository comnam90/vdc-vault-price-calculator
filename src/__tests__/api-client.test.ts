import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearRegionCache, fetchRegions } from "@/lib/api-client";
import type { Region } from "@/types/region";

const mockRegions: Region[] = [
  {
    id: "aws-us-east-1",
    name: "US East (N. Virginia)",
    provider: "AWS",
    coords: [37.9, -77.4],
    aliases: ["us-east-1"],
    services: {
      vdc_vault: [{ edition: "Foundation", tier: "Core" }],
    },
  },
  {
    id: "azure-eastus",
    name: "East US",
    provider: "Azure",
    coords: [37.3, -78.6],
    aliases: ["eastus"],
    services: {
      vdc_vault: [{ edition: "Advanced", tier: "Non-Core" }],
    },
  },
];

describe("fetchRegions", () => {
  beforeEach(() => {
    clearRegionCache();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns all regions from a successful response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockRegions), { status: 200 }),
    );

    const regions = await fetchRegions();

    expect(regions).toEqual(mockRegions);
  });

  it("calls fetch only once across two successive fetchRegions() calls", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(mockRegions), { status: 200 }),
    );

    await fetchRegions();
    await fetchRegions();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("throws API error: 500 for a non-OK response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500 }),
    );

    await expect(fetchRegions()).rejects.toThrow("API error: 500");
  });

  it("propagates the original network error for a rejected fetch", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network failure"));

    await expect(fetchRegions()).rejects.toThrow("Network failure");
  });
});
