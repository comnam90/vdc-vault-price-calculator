import { useMemo } from "react";
import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

const TERM_OPTIONS = [1, 2, 3, 4, 5] as const;
const TERM_LABEL_ID = "term-selector-label";

interface TermSelectorProps {
  value?: number;
  onTermChange: (years: number) => void;
}

export function TermSelector({ value = 1, onTermChange }: TermSelectorProps) {
  const selectedValue = useMemo(() => {
    return TERM_OPTIONS.includes(value as (typeof TERM_OPTIONS)[number])
      ? value
      : 1;
  }, [value]);

  const handleArrowNavigation = (
    event: KeyboardEvent<HTMLButtonElement>,
    years: number,
  ) => {
    const currentIndex = TERM_OPTIONS.indexOf(
      years as (typeof TERM_OPTIONS)[number],
    );

    if (currentIndex === -1) {
      return;
    }

    const nextIndexByKey: Record<string, number> = {
      ArrowRight: (currentIndex + 1) % TERM_OPTIONS.length,
      ArrowDown: (currentIndex + 1) % TERM_OPTIONS.length,
      ArrowLeft: (currentIndex - 1 + TERM_OPTIONS.length) % TERM_OPTIONS.length,
      ArrowUp: (currentIndex - 1 + TERM_OPTIONS.length) % TERM_OPTIONS.length,
    };

    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextValue = TERM_OPTIONS[nextIndex];
    onTermChange(nextValue);
    document.getElementById(`term-${nextValue}`)?.focus();
  };

  return (
    <fieldset className="grid gap-2">
      <legend id={TERM_LABEL_ID} className="text-sm leading-none font-medium">
        Commitment term
      </legend>
      <div
        role="radiogroup"
        aria-labelledby={TERM_LABEL_ID}
        className="border-border/70 flex flex-wrap gap-2 rounded-2xl border bg-[color:var(--card-tint-neutral)]/70 p-2"
      >
        {TERM_OPTIONS.map((years) => {
          const isSelected = years === selectedValue;

          return (
            <button
              key={years}
              id={`term-${years}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onTermChange(years)}
              onKeyDown={(event) => handleArrowNavigation(event, years)}
              className={cn(
                "min-w-[calc(50%-0.25rem)] flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors md:min-w-0",
                isSelected
                  ? "bg-background text-foreground border-[color:var(--viridis)]/30 shadow-[0_10px_30px_-18px_var(--viridis)]"
                  : "text-muted-foreground hover:bg-background/70 hover:text-foreground border-transparent bg-transparent",
              )}
            >
              {years} {years === 1 ? "Year" : "Years"}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
