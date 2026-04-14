import type { CalculatorInputs } from "@/types/calculator";

const TERM_MIN = 1;
const TERM_MAX = 5;
const CAPACITY_MIN = 1;
const CAPACITY_MAX = 100_000;
const RESTORE_MIN = 0;
const RESTORE_MAX = 100;
const DEFAULT_RESTORE_PERCENTAGE = 20;

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
    if (
      !isNaN(capacity) &&
      capacity >= CAPACITY_MIN &&
      capacity <= CAPACITY_MAX
    ) {
      result.capacityTiB = capacity;
    }
  }

  if (params.get("egress") === "0") {
    result.excludeEgress = true;
  }

  const restoreRaw = params.get("restore");
  if (restoreRaw !== null) {
    const restore = parseInt(restoreRaw, 10);
    if (!isNaN(restore) && restore >= RESTORE_MIN && restore <= RESTORE_MAX) {
      result.restorePercentage = restore;
    }
  }

  return result;
}

export function serialiseUrlParams(inputs: CalculatorInputs): string {
  const params = new URLSearchParams();
  params.set("region", inputs.regionId);
  params.set("term", String(inputs.termYears));
  params.set("capacity", String(inputs.capacityTiB));
  if (inputs.excludeEgress === true) {
    params.set("egress", "0");
  }
  if (inputs.restorePercentage !== DEFAULT_RESTORE_PERCENTAGE) {
    params.set("restore", String(inputs.restorePercentage));
  }
  return params.toString();
}
