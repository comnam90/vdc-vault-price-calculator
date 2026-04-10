"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Slider({
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        "data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-input relative h-1.5 w-full grow overflow-hidden rounded-full"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-[color:var(--viridis)]"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className={cn(
          "bg-background block size-4 rounded-full border-2 border-[color:var(--viridis)] shadow",
          "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };
