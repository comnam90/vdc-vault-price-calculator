import { VDC_API_BASE } from "@/lib/constants";
import type { Region } from "@/types/region";

let regionCache: Region[] | null = null;

export async function fetchRegions(): Promise<Region[]> {
  if (regionCache !== null) return regionCache;

  const response = await fetch(`${VDC_API_BASE}/regions?service=vdc_vault`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  regionCache = (await response.json()) as Region[];
  return regionCache;
}

export function clearRegionCache(): void {
  regionCache = null;
}
