import { HelpCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface-alt)]/50 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-surface-alt)] text-[var(--text-muted)] border border-[var(--border-default)]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="max-w-xs mb-6 text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
