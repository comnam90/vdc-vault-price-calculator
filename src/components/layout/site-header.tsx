import { Github, Monitor, Moon, ShieldAlert, Sun } from "lucide-react";

import { ShareButton } from "@/components/calculator/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";

const PROVIDERS = ["AWS", "Azure"] as const;

const THEME_ICON = {
  system: <Monitor className="size-4" />,
  dark: <Moon className="size-4" />,
  light: <Sun className="size-4" />,
} as const;

const THEME_LABEL = {
  system: "Switch to dark mode",
  dark: "Switch to light mode",
  light: "Follow system theme",
} as const;

const THEME_TOOLTIP = {
  system: "System theme",
  dark: "Dark mode",
  light: "Light mode",
} as const;

export function SiteHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-border/70 border-b bg-[image:var(--surface-gradient)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end gap-2 border-b border-[color:var(--dark-mineral)]/15 pb-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  aria-label={THEME_LABEL[theme]}
                  className="text-muted-foreground hover:text-foreground rounded-full"
                >
                  {THEME_ICON[theme]}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{THEME_TOOLTIP[theme]}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge className="rounded-md border border-[color:var(--warning)]/40 bg-[color:var(--warning-muted)] px-2.5 py-1 font-mono text-[0.65rem] tracking-[0.2em] text-[color:var(--warning-foreground)] uppercase">
            <ShieldAlert className="size-3" />
            Unofficial
          </Badge>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {PROVIDERS.map((provider) => (
                <Badge
                  key={provider}
                  variant="outline"
                  className="border-border/70 bg-background/70 rounded-md px-2.5 py-1 font-mono text-[0.7rem] tracking-[0.24em] uppercase"
                >
                  {provider}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              <h1 className="font-heading dark:text-foreground max-w-2xl text-3xl font-bold tracking-[-0.04em] text-balance text-[color:var(--dark-mineral)] sm:text-4xl">
                VDC Vault TCO Calculator
              </h1>
              <p className="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-base">
                See the full cost of VDC Vault Foundation and Advanced versus
                building your own cloud storage — broken down by region, term,
                and required capacity.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <ShareButton />
            <Button
              asChild
              variant="outline"
              className="bg-background/80 w-full justify-center rounded-full border-[color:var(--electric-azure)]/35 text-[color:var(--electric-azure)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--electric-azure)_16%,transparent)] hover:bg-[color:var(--info-muted)] sm:w-auto"
            >
              <a
                href="https://github.com/comnam90/vdc-vault-tco-calculator"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
              >
                <Github className="size-4" />
                GitHub repository
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
