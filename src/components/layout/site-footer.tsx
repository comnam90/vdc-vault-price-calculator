export function SiteFooter() {
  return (
    <footer className="border-border/70 bg-background/95 border-t">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 text-sm sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8">
        <div className="text-muted-foreground space-y-2">
          <p className="text-foreground font-medium">
            Not affiliated with Veeam.
          </p>
          <p>
            Data sources combine published hyperscaler pricing, regional
            availability, and repository-maintained assumptions for comparison
            workflows.
          </p>
        </div>
        <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs tracking-[0.2em] uppercase sm:w-max">
          <dt>Version</dt>
          <dd className="text-foreground text-right">{__APP_VERSION__}</dd>
          <dt>Commit</dt>
          <dd className="text-foreground text-right">{__APP_COMMIT__}</dd>
        </dl>
      </div>
    </footer>
  );
}
