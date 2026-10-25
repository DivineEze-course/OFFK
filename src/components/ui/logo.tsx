import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * OFFK wordmark: a geometric "home" glyph + typographic mark.
 * Purely typographic/SVG — no logo asset required.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8", className)}
      fill="none"
    >
      {/* House silhouette in the current ink colour */}
      <path
        d="M4 13.2 16 4l12 9.2V26a2.5 2.5 0 0 1-2.5 2.5h-19A2.5 2.5 0 0 1 4 26Z"
        fill="currentColor"
      />
      {/* Lime "door" block — the accent that carries the brand */}
      <path d="M11.5 28.5V18.5h9v10Z" fill="var(--c-accent)" />
      <rect x="15" y="22" width="2" height="6.5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function Wordmark({
  className,
  href = "/",
  markClassName,
}: {
  className?: string;
  href?: string | null;
  markClassName?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="font-display text-xl font-bold tracking-tight">
        OFFK
        <span aria-hidden="true" className="ml-0.5 inline-block size-1.5 translate-y-[-7px] rounded-full bg-accent" />
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="OFFK home" className="text-ink transition-opacity hover:opacity-80">
      {content}
    </Link>
  );
}
