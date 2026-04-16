import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";

describe("useAnimatedCounter", () => {
  let matchMediaSpy: ReturnType<typeof vi.spyOn>;

  function mockReducedMotion(prefers: boolean) {
    matchMediaSpy = vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: prefers,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    });
  }

  afterEach(() => {
    matchMediaSpy?.mockRestore();
    vi.restoreAllMocks();
  });

  it("returns the target value immediately when prefers-reduced-motion is set", () => {
    mockReducedMotion(true);

    const { result } = renderHook(() => useAnimatedCounter(12345));

    expect(result.current).toBe(12345);
  });

  it("returns the target value after animation completes", async () => {
    mockReducedMotion(false);
    vi.useFakeTimers();

    const { result } = renderHook(() => useAnimatedCounter(5000, 300));

    // Should start at 0 (or some intermediate value)
    // Advance well past the animation duration
    await act(async () => {
      // Simulate enough RAF ticks to complete
      for (let i = 0; i < 30; i++) {
        vi.advanceTimersByTime(20);
        await Promise.resolve();
      }
    });

    expect(result.current).toBe(5000);

    vi.useRealTimers();
  });

  it("updates when target changes", async () => {
    mockReducedMotion(true);
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ target }) => useAnimatedCounter(target),
      { initialProps: { target: 100 } },
    );

    expect(result.current).toBe(100);

    rerender({ target: 200 });

    // Reduced-motion path uses a single RAF, so advance one frame
    await act(async () => {
      vi.advanceTimersByTime(20);
      await Promise.resolve();
    });

    expect(result.current).toBe(200);

    vi.useRealTimers();
  });

  it("starts from 0 on initial render when motion is enabled", () => {
    mockReducedMotion(false);
    vi.useFakeTimers();

    const { result } = renderHook(() => useAnimatedCounter(5000, 600));

    // On initial render before any RAF tick, value should be 0
    expect(result.current).toBe(0);

    vi.useRealTimers();
  });

  it("continues from intermediate value when target changes mid-animation", async () => {
    mockReducedMotion(false);
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ target }) => useAnimatedCounter(target, 600),
      { initialProps: { target: 5000 } },
    );

    // Advance to ~25% of animation
    await act(async () => {
      for (let i = 0; i < 8; i++) {
        vi.advanceTimersByTime(20);
        await Promise.resolve();
      }
    });

    const midValue = result.current;
    expect(midValue).toBeGreaterThan(0);
    expect(midValue).toBeLessThan(5000);

    // Change target while animation is running
    rerender({ target: 10000 });

    // Let cleanup + one new tick run
    await act(async () => {
      vi.advanceTimersByTime(20);
      await Promise.resolve();
    });

    // New animation must continue from midValue, not restart from old target (5000).
    // With the bug, cleanup sets fromRef to 5000, so the first tick yields ≥ 5000.
    // With the fix, fromRef holds midValue, so the first tick stays < 5000.
    expect(result.current).toBeGreaterThanOrEqual(midValue);
    expect(result.current).toBeLessThan(5000);

    vi.useRealTimers();
  });
});
