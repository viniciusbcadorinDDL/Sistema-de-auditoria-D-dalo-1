export function PageHeader({
  crumb,
  title,
  actions,
}: {
  crumb?: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        {crumb && (
          <div className="text-[13px] text-muted-foreground">{crumb}</div>
        )}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
