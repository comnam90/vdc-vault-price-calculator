import { Check, Link2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void handleShare()}
      aria-label={copied ? "Link copied to clipboard" : "Copy shareable link"}
      className={cn(
        "w-full justify-center rounded-full transition-colors sm:w-auto",
        copied
          ? "border-[color:var(--viridis)]/40 bg-[color:var(--success-muted)] text-[color:var(--viridis)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--viridis)_20%,transparent)] hover:bg-[color:var(--success-muted)]"
          : "bg-background/80 border-[color:var(--electric-azure)]/35 text-[color:var(--electric-azure)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--electric-azure)_16%,transparent)] hover:bg-[color:var(--info-muted)]",
      )}
    >
      {copied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Link2 className="size-4" aria-hidden="true" />
      )}
      {copied ? "Copied!" : "Copy link"}
    </Button>
  );
}
