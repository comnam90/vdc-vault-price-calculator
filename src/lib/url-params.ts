import type { CalculatorInputs } from "@/types/calculator";

const TERM_MIN = 1;
const TERM_MAX = 5;
const CAPACITY_MIN = 1;

export function parseUrlParams(search: string): Partial<CalculatorInputs> {
  const params = new URLSearchParams(search);
  const result: Partial<CalculatorInputs> = {};

  const region = params.get("region");
  if (region !== null && region.length > 0) {
    result.regionId = region;
  }

  const termRaw = params.get("term");
  if (termRaw !== null) {
    const term = parseInt(termRaw, 10);
    if (!isNaN(term) && term >= TERM_MIN && term <= TERM_MAX) {
      result.termYears = term;
    }
  }

  const capacityRaw = params.get("capacity");
  if (capacityRaw !== null) {
    const capacity = parseInt(capacityRaw, 10);
    if (!isNaN(capacity) && capacity >= CAPACITY_MIN) {
      result.capacityTiB = capacity;
    }
  }

  return result;
}

export function serialiseUrlParams(inputs: CalculatorInputs): string {
  const params = new URLSearchParams();
  params.set("region", inputs.regionId);
  params.set("term", String(inputs.termYears));
  params.set("capacity", String(inputs.capacityTiB));
  return params.toString();
}
