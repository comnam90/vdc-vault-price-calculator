import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUrlState } from "@/hooks/use-url-state";
import type { CalculatorInputs } from "@/types/calculator";

const INPUTS: CalculatorInputs = {
  regionId: "aws-us-east-1",
  termYears: 3,
  capacityTiB: 50,
};

function setLocationSearch(search: string) {
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...window.location, search, pathname: "/" },
  });
}

describe("useUrlState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(history, "pushState");
    vi.spyOn(history, "replaceState");
    setLocationSearch("");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("returns empty initialValues when no URL params present", () => {
    const { result } = renderHook(() => useUrlState());
    expect(result.current.initialValues).toEqual({});
  });

  it("parses all three fields from URL on mount", () => {
    setLocationSearch("?region=aws-us-east-1&term=3&capacity=50");
    const { result } = renderHook(() => useUrlState());
    expect(result.current.initialValues).toEqual({
      regionId: "aws-us-east-1",
      termYears: 3,
      capacityTiB: 50,
    });
  });

  it("urlKey matches window.location.search on mount", () => {
    setLocationSearch("?region=aws-us-east-1&term=3&capacity=50");
    const { result } = renderHook(() => useUrlState());
    expect(result.current.urlKey).toBe(
      "?region=aws-us-east-1&term=3&capacity=50",
    );
  });

  it("syncToUrl(null) calls replaceState immediately with no query string", () => {
    const { result } = renderHook(() => useUrlState());
    act(() => {
      result.current.syncToUrl(null);
    });
    expect(history.replaceState).toHaveBeenCalledWith(null, "", "/");
    expect(history.pushState).not.toHaveBeenCalled();
  });

  it("syncToUrl(inputs) calls pushState after 300ms debounce", () => {
    const { result } = renderHook(() => useUrlState());
    act(() => {
      result.current.syncToUrl(INPUTS);
    });
    expect(history.pushState).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(history.pushState).toHaveBeenCalledWith(
      null,
      "",
      "/?region=aws-us-east-1&term=3&capacity=50",
    );
  });

  it("debounce: rapid syncToUrl calls result in only one pushState", () => {
    const { result } = renderHook(() => useUrlState());
    act(() => {
      result.current.syncToUrl({ ...INPUTS, capacityTiB: 10 });
      result.current.syncToUrl({ ...INPUTS, capacityTiB: 20 });
      result.current.syncToUrl({ ...INPUTS, capacityTiB: 30 });
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(history.pushState).toHaveBeenCalledTimes(1);
    expect(history.pushState).toHaveBeenCalledWith(
      null,
      "",
      "/?region=aws-us-east-1&term=3&capacity=30",
    );
  });

  it("popstate event updates urlDerivedInputs and urlKey", () => {
    const { result } = renderHook(() => useUrlState());
    expect(result.current.urlDerivedInputs).toEqual({});

    act(() => {
      setLocationSearch("?region=aws-us-east-1&term=2&capacity=100");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current.urlDerivedInputs).toEqual({
      regionId: "aws-us-east-1",
      termYears: 2,
      capacityTiB: 100,
    });
    expect(result.current.urlKey).toBe(
      "?region=aws-us-east-1&term=2&capacity=100",
    );
  });

  it("popstate to empty URL resets urlDerivedInputs", () => {
    setLocationSearch("?region=aws-us-east-1&term=3&capacity=50");
    const { result } = renderHook(() => useUrlState());

    act(() => {
      setLocationSearch("");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current.urlDerivedInputs).toEqual({});
    expect(result.current.urlKey).toBe("");
  });

  it("removes popstate listener on unmount", () => {
    const { result, unmount } = renderHook(() => useUrlState());
    unmount();

    act(() => {
      setLocationSearch("?region=aws-us-east-1&term=1&capacity=1");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // urlDerivedInputs should not have updated after unmount
    expect(result.current.urlDerivedInputs).toEqual({});
  });
});
