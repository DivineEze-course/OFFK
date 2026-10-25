import type { ReactNode } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClasses } from "./button";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{eyebrow}</p>
        ) : null}
        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {description ? <p className="mt-3 text-base text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className={buttonClasses("outline", "sm")}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      <div className="text-faint">{icon ?? <SearchX className="size-8" aria-hidden="true" />}</div>
      <h3 className="font-display mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? (
        <Link href={action.href} className={buttonClasses("primary", "sm", "mt-6")}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
