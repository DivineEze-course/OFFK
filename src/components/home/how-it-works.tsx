import { CalendarSearch, Heart, MessagesSquare } from "lucide-react";

const STEPS = [
  {
    icon: CalendarSearch,
    step: "01",
    title: "Pick your university and period",
    body: "Nile students shop per semester, Baze students per trimester. OFFK re-quotes every listing in your school's calendar instead of a generic 'per year'.",
  },
  {
    icon: Heart,
    step: "02",
    title: "Filter, compare, save",
    body: "Narrow by area, budget, furnishing, amenities and straight-line distance to campus. Save shortlist entries locally — no account needed for browsing.",
  },
  {
    icon: MessagesSquare,
    step: "03",
    title: "Send an enquiry",
    body: "Each listing carries a demo enquiry form so you can walk the full flow. Nothing is transmitted: this template has no backend and no real bookings.",
  },
];

/** Three-step explanation of the OFFK flow. Static content — no demo state. */
export function HowItWorks() {
  return (
    <section className="page-container py-16 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">How OFFK works</p>
        <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
          From search to shortlist in three steps
        </h2>
      </div>

      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {STEPS.map((item) => (
          <li
            key={item.step}
            className="relative rounded-xl border border-line bg-surface p-6"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-btn-primary-bg text-btn-primary-fg">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="font-display text-3xl font-bold tracking-tight text-line-strong">
                {item.step}
              </span>
            </div>
            <h3 className="font-display mt-5 text-lg font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
