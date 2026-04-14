import { useEffect, useRef, useState } from "react";

const DEFAULT_DURATION = 600;

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useAnimatedCounter(
  target: number,
  duration = DEFAULT_DURATION,
): number {
  const [value, setValue] = useState(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return target;
    }

    return 0;
  });

  const fromRef = useRef(value);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const id = requestAnimationFrame(() => {
        setValue(target);
        fromRef.current = target;
      });
      return () => cancelAnimationFrame(id);
    }

    const from = fromRef.current;
    const delta = target - from;

    if (delta === 0) {
      return;
    }

    let start: number | null = null;
    let rafId: number;

    function tick(timestamp: number) {
      if (start === null) {
        start = timestamp;
      }

      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = from + delta * easeOut(progress);

      setValue(Math.round(current));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setValue(target);
        fromRef.current = target;
      }
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      fromRef.current = target;
    };
  }, [target, duration]);

  return value;
}
