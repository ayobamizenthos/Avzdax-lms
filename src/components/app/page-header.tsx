export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-[1.9rem] leading-tight text-ink text-balance">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[0.98rem] text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        {icon ? <span className="text-brand">{icon}</span> : null}
      </div>
      <p className="mt-3 font-display text-3xl text-ink">{value}</p>
      {sublabel ? <p className="mt-1 text-sm text-muted">{sublabel}</p> : null}
    </div>
  );
}
