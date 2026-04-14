import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { parseUrlParams, serialiseUrlParams } from "@/lib/url-params";
import type { CalculatorInputs } from "@/types/calculator";

interface UseUrlStateResult {
  initialValues: Partial<CalculatorInputs>;
  urlDerivedInputs: Partial<CalculatorInputs>;
  urlKey: string;
  syncToUrl: (inputs: CalculatorInputs | null) => void;
}

export function useUrlState(): UseUrlStateResult {
  const initialValues = useMemo(
    () => parseUrlParams(window.location.search),
    [],
  );

  const [currentSearch, setCurrentSearch] = useState(window.location.search);

  const urlDerivedInputs = useMemo(
    () => parseUrlParams(currentSearch),
    [currentSearch],
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentSearch(window.location.search);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const pushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pushTimeoutRef.current !== null) {
        clearTimeout(pushTimeoutRef.current);
      }
    };
  }, []);

  const syncToUrl = useCallback((inputs: CalculatorInputs | null) => {
    if (pushTimeoutRef.current !== null) {
      clearTimeout(pushTimeoutRef.current);
      pushTimeoutRef.current = null;
    }

    if (inputs === null) {
      history.replaceState(null, "", window.location.pathname);
      return;
    }

    const search = "?" + serialiseUrlParams(inputs);
    const url = window.location.pathname + search;

    pushTimeoutRef.current = setTimeout(() => {
      history.pushState(null, "", url);
      pushTimeoutRef.current = null;
    }, 300);
  }, []);

  return { initialValues, urlDerivedInputs, urlKey: currentSearch, syncToUrl };
}
