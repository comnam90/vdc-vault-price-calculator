import { useState } from "react";

import { CalculatorForm } from "@/components/calculator/calculator-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CalculatorInputs } from "@/types/calculator";

function App() {
  const [inputs, setInputs] = useState<CalculatorInputs | null>(null);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--viridis)_16%,transparent),transparent_38%),radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--electric-azure)_18%,transparent),transparent_34%)]" />
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.85fr)]">
          <CalculatorForm onInputsChange={setInputs} />

          <Card className="border-border/70 rounded-[1.75rem] bg-[color:var(--card-tint-neutral)]/55">
            <CardHeader className="border-border/70 gap-3 border-b">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-xl tracking-[-0.03em]">
                  Operator brief
                </CardTitle>
                <Badge
                  variant="outline"
                  className="rounded-md border-[color:var(--viridis)]/25 bg-[color:var(--success-muted)] px-2.5 py-1 font-mono text-[0.68rem] tracking-[0.2em] text-[color:var(--dark-mineral)] uppercase"
                >
                  Live
                </Badge>
              </div>
              <CardDescription>
                The next phase will fill this panel with comparison outputs. For
                now it confirms the active scenario state.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 py-6 text-sm">
              <div className="border-border/70 bg-background/80 grid gap-2 rounded-2xl border p-4">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
                  Active selection
                </p>
                {inputs ? (
                  <dl className="grid gap-3">
                    <div className="border-border/70 flex items-center justify-between gap-3 border-b pb-3">
                      <dt className="text-muted-foreground">Region ID</dt>
                      <dd className="font-mono text-xs tracking-[0.14em] uppercase">
                        {inputs.regionId}
                      </dd>
                    </div>
                    <div className="border-border/70 flex items-center justify-between gap-3 border-b pb-3">
                      <dt className="text-muted-foreground">Term</dt>
                      <dd className="font-medium">
                        {inputs.termYears}{" "}
                        {inputs.termYears === 1 ? "Year" : "Years"}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground">Capacity</dt>
                      <dd className="font-medium">{inputs.capacityTiB} TiB</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-muted-foreground leading-6">
                    Pick a region and capacity to stage an estimate-ready
                    scenario.
                  </p>
                )}
              </div>

              <div className="grid gap-2 rounded-2xl border border-dashed border-[color:var(--electric-azure)]/30 bg-[color:var(--info-muted)]/45 p-4">
                <p className="text-xs font-semibold tracking-[0.24em] text-[color:var(--electric-azure)] uppercase">
                  Console note
                </p>
                <p className="text-muted-foreground leading-6">
                  Regional pricing and result visualization land next; this
                  shell keeps the operator workflow grounded and immediately
                  legible on mobile.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default App;
