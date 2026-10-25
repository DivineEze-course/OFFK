import { BadgeCheck, Clock3, CircleCheck, Hourglass, UsersRound, XCircle } from "lucide-react";
import type { AvailabilityStatus, Property } from "@/types/property";
import { Badge, type BadgeTone } from "@/components/ui/badge";

/** Demo verification state — always suffixed with "(demo)" in the UI. */
export function VerificationBadge({ property }: { property: Property }) {
  if (property.verification === "verified-demo") {
    return (
      <Badge tone="success">
        <BadgeCheck className="size-3" aria-hidden="true" />
        Verified by OFFK (demo)
      </Badge>
    );
  }
  return (
    <Badge tone="neutral">
      <Clock3 className="size-3" aria-hidden="true" />
      Verification pending (demo)
    </Badge>
  );
}

const AVAILABILITY: Record<
  AvailabilityStatus,
  { tone: BadgeTone; Icon: typeof CircleCheck }
> = {
  available: { tone: "success", Icon: CircleCheck },
  limited: { tone: "warning", Icon: Hourglass },
  "fully-booked": { tone: "neutral", Icon: XCircle },
  waitlist: { tone: "info", Icon: UsersRound },
};

export function AvailabilityBadge({
  status,
  label,
  className,
}: {
  status: AvailabilityStatus;
  label: string;
  className?: string;
}) {
  const { tone, Icon } = AVAILABILITY[status];
  return (
    <Badge tone={tone} className={className}>
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}
