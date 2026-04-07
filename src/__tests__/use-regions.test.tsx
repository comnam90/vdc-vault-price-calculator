import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRegions } from "@/hooks/use-regions";
import { clearRegionCache } from "@/lib/api-client";
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
];

describe("useRegions", () => {
  beforeEach(() => {
    clearRegionCache();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in loading state with regions=[] and error=null", () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useRegions());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.regions).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("returns regions on successful fetch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ data: mockRegions }), { status: 200 }),
    );

    const { result } = renderHook(() => useRegions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.regions).toEqual(mockRegions);
    expect(result.current.error).toBeNull();
  });

  it("returns error message on failed fetch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500 }),
    );

    const { result } = renderHook(() => useRegions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.regions).toEqual([]);
    expect(result.current.error).toBe("API error: 500");
  });
});
