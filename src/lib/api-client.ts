import { VDC_API_BASE } from "@/lib/constants";
import type { Region } from "@/types/region";

let regionCache: Region[] | null = null;
let inflightRequest: Promise<Region[]> | null = null;

export function fetchRegions(): Promise<Region[]> {
  if (regionCache !== null) return Promise.resolve(regionCache);
  if (inflightRequest !== null) return inflightRequest;

  inflightRequest = fetch(`${VDC_API_BASE}/regions?service=vdc_vault`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json() as Promise<{ data: Region[] }>;
    })
    .then((json) => {
      regionCache = json.data;
      inflightRequest = null;
      return regionCache;
    })
    .catch((err: unknown) => {
      inflightRequest = null;
      throw err;
    });

  return inflightRequest;
}

export function clearRegionCache(): void {
  regionCache = null;
  inflightRequest = null;
}
