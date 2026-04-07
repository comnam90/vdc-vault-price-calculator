import { useEffect, useState } from "react";
import { fetchRegions } from "@/lib/api-client";
import type { Region } from "@/types/region";

interface UseRegionsResult {
  regions: Region[];
  isLoading: boolean;
  error: string | null;
}

export function useRegions(): UseRegionsResult {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchRegions()
      .then((data) => {
        if (!cancelled) {
          setRegions(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { regions, isLoading, error };
}
