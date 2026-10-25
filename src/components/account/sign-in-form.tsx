"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { useDemoSession } from "@/components/account/demo-session-provider";
import { Field, TextInput } from "@/components/ui/field";
import { buttonClasses } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type Mode = "signin" | "signup";

/**
 * Demo authentication UI. The form validates locally and flips the pretend
 * session flag in localStorage — no credentials are stored or transmitted.
 */
export function SignInForm() {
  const { user, signInDemo, signOutDemo } = useDemoSession();
  const formId = useId();

  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  if (user) {
    return (
      <div className="page-container max-w-xl py-16">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <h1 className="font-display mt-5 text-2xl font-bold tracking-tight text-ink">
            Signed in (demo)
          </h1>
          <p className="mt-3 text-sm text-muted">
            You&apos;re browsing as <span className="font-medium text-ink">{user.name}</span> ·{" "}
            {user.email}. This is a pretend session held in localStorage.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/dashboard" className={buttonClasses("primary", "md")}>
              Open student dashboard
            </Link>
            <button type="button" onClick={signOutDemo} className={buttonClasses("ghost", "md")}>
              Sign out (demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="page-container max-w-xl py-16">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <h1 className="font-display mt-5 text-2xl font-bold tracking-tight text-ink">
            {mode === "signin" ? "Welcome back" : "Account created"} (demo)
          </h1>
          <p className="mt-3 text-sm text-muted">
            Nothing was submitted anywhere — no password was stored and no session token exists. The
            demo session simply flips a local flag so you can see signed-in navigation.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/dashboard" className={buttonClasses("primary", "md")}>
              Continue to dashboard
            </Link>
            <Link href="/properties" className={buttonClasses("outline", "md")}>
              Browse listings instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container grid max-w-5xl gap-10 py-12 lg:grid-cols-[1fr_1.1fr] lg:py-16">
      <div className="max-w-md">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Account</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {mode === "signin" ? "Sign in to OFFK" : "Create your OFFK account"}
        </h1>
        <p className="mt-4 text-base text-muted">
          Accounts unlock the student dashboard, saved-listing sync messaging and the landlord
          workspace — all of which run on sample data in this template.
        </p>

        <ul className="mt-6 space-y-3">
          {[
            "Track demo enquiries from one place",
            "See your shortlist alongside your budget",
            "Switch to the landlord workspace anytime",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-muted">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <DemoNotice title="No real authentication">
            This form performs client-side validation only. Credentials are never stored, hashed or
            sent — there is no backend in this template.
          </DemoNotice>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="inline-flex rounded-xl border border-line bg-surface-2 p-1"
        >
          {(
            [
              { id: "signin", label: "Sign in" },
              { id: "signup", label: "Create account" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mode === tab.id}
              onClick={() => setMode(tab.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                mode === tab.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            signInDemo();
            setDone(true);
          }}
          className="mt-6 space-y-4"
        >
          {mode === "signup" ? (
            <Field label="Full name" htmlFor={`${formId}-name`}>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint"
                  aria-hidden="true"
                />
                <TextInput
                  id={`${formId}-name`}
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="e.g. Chidinma Okafor"
                  className="pl-10"
                />
              </div>
            </Field>
          ) : null}

          <Field label="Email" htmlFor={`${formId}-email`}>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint"
                aria-hidden="true"
              />
              <TextInput
                id={`${formId}-email`}
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </Field>

          <Field
            label="Password"
            htmlFor={`${formId}-password`}
            hint="Anything you type is discarded on submit — demo only."
          >
            <div className="relative">
              <Lock
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint"
                aria-hidden="true"
              />
              <TextInput
                id={`${formId}-password`}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="pr-11 pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-faint hover:text-ink"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </Field>

          <button type="submit" className={buttonClasses("primary", "md", "w-full")}>
            {mode === "signin" ? "Sign in (demo)" : "Create account (demo)"}
          </button>

          <p className="text-center text-xs text-faint">
            By continuing you agree that this is a frontend template with no live service behind it.
          </p>
        </form>
      </div>
    </div>
  );
}
