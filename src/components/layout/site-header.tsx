"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Building2, Heart, LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import { Wordmark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useFavourites } from "@/components/favourites/favourites-provider";
import { useDemoSession } from "@/components/account/demo-session-provider";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { label: "Explore", href: "/properties" },
  { label: "Universities", href: "/universities" },
  { label: "Saved", href: "/saved" },
  { label: "List your property", href: "/landlord" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, ready: favouritesReady } = useFavourites();
  const { user, signOutDemo } = useDemoSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  /** Used by every in-header link so overlays close as part of the click. */
  const closeOverlays = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // Close the profile menu on outside click / Escape.
  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  // Lock background scroll while the mobile sheet is open, and make the
  // hardware/browser back gesture close it instead of leaving it stranded.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onPopState = () => setMenuOpen(false);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("popstate", onPopState);
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/85">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Wordmark />

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeOverlays}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href) ? "text-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              {link.label}
              {link.href === "/saved" && favouritesReady && count > 0 ? (
                <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-on-accent">
                  {count}
                </span>
              ) : null}
              {isActive(link.href) ? (
                <span aria-hidden="true" className="absolute inset-x-3 -bottom-[21px] h-0.5 bg-accent" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/saved"
            aria-label={`Saved properties${favouritesReady && count > 0 ? ` (${count})` : ""}`}
            className="relative inline-flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface-2 lg:hidden"
          >
            <Heart className="size-[18px]" aria-hidden="true" />
            {favouritesReady && count > 0 ? (
              <span className="absolute right-1 top-1 size-2 rounded-full bg-accent" aria-hidden="true" />
            ) : null}
          </Link>

          <ThemeToggle />

          {/* Profile / sign in */}
          {user ? (
            <div ref={profileRef} className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
              >
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-btn-primary-bg text-[11px] font-semibold text-btn-primary-fg">
                  {user.name.charAt(0)}
                </span>
                {user.name.split(" ")[0]}
              </button>
              {profileOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface py-1.5 shadow-lg shadow-black/5"
                >
                  <MenuLink href="/dashboard" icon={<LayoutDashboard className="size-4" />} onClick={closeOverlays}>
                    Student dashboard
                  </MenuLink>
                  <MenuLink href="/saved" icon={<Heart className="size-4" />} onClick={closeOverlays}>
                    Saved properties
                  </MenuLink>
                  <MenuLink href="/landlord" icon={<Building2 className="size-4" />} onClick={closeOverlays}>
                    Landlord dashboard
                  </MenuLink>
                  <div className="my-1.5 border-t border-line" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      signOutDemo();
                      closeOverlays();
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-surface-2"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Sign out (demo)
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className={buttonClasses("primary", "sm", "hidden lg:inline-flex")}
            >
              <UserRound className="size-4" aria-hidden="true" />
              Sign in
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-label="Open navigation menu"
            className="inline-flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface-2 lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-canvas lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <Wordmark />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
              className="inline-flex size-10 items-center justify-center rounded-lg text-ink hover:bg-surface-2"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeOverlays}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "font-display flex items-center justify-between rounded-xl px-4 py-4 text-2xl font-semibold tracking-tight transition-colors",
                      isActive(link.href) ? "bg-surface-2 text-ink" : "text-ink hover:bg-surface-2",
                    )}
                  >
                    {link.label}
                    {link.href === "/saved" && favouritesReady && count > 0 ? (
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-on-accent">
                        {count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-line pt-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Account</p>
              <div className="mt-4 space-y-3">
                {user ? (
                  <>
                    <p className="text-sm text-muted">
                      Signed in as <span className="font-medium text-ink">{user.name}</span> (demo)
                    </p>
                    <Link
                      href="/dashboard"
                      onClick={closeOverlays}
                      className={buttonClasses("outline", "md", "w-full")}
                    >
                      <LayoutDashboard className="size-4" aria-hidden="true" />
                      Student dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        signOutDemo();
                        closeOverlays();
                      }}
                      className={buttonClasses("ghost", "md", "w-full")}
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      Sign out (demo)
                    </button>
                  </>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={closeOverlays}
                    className={buttonClasses("primary", "md", "w-full")}
                  >
                    <UserRound className="size-4" aria-hidden="true" />
                    Sign in / Create account
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function MenuLink({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition-colors hover:bg-surface-2"
    >
      <span aria-hidden="true" className="text-muted">
        {icon}
      </span>
      {children}
    </Link>
  );
}
