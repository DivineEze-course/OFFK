import type { ReactNode } from "react";
import { AlertTriangle, FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";

export type BadgeTone = "accent" | "brand" | "success" | "warning" | "info" | "neutral";

const TONES: Record<BadgeTone, string> = {
  accent: "bg-accent text-on-accent",
  brand: "bg-btn-primary-bg text-btn-primary-fg",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  neutral: "bg-surface-2 text-muted border border-line",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Badges used wherever demo/sample data must be clearly flagged. */
export function DemoBadge({ label = "Demo data", className }: { label?: string; className?: string }) {
  return (
    <Badge tone="warning" className={className}>
      <FlaskConical className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}

/** Inline warning strip for "this is sample data / nothing is sent" messaging. */
export function DemoNotice({
  title = "Sample data",
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "demo-strip flex items-start gap-3 rounded-lg border border-warning/25 px-4 py-3 text-sm",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-medium">{title}</p>
        <div className="mt-0.5 text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
