import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { UniversityProvider } from "@/components/university/university-provider";
import { FavouritesProvider } from "@/components/favourites/favourites-provider";
import { DemoSessionProvider } from "@/components/account/demo-session-provider";

export const metadata: Metadata = {
  title: {
    default: "OFFK — Find your space. Own your student experience.",
    template: "%s · OFFK",
  },
  description:
    "OFFK helps students at Nigerian universities discover off-campus accommodation with transparent, university-aware pricing. Demo template — all listings are sample data.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#101713" },
  ],
};

/**
 * Applies the stored (or system) theme before first paint so there is no
 * flash of the wrong theme. Kept in sync with ThemeProvider's storage key.
 */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("offk.theme");var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",dark);r.dataset.theme=dark?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <UniversityProvider>
            <FavouritesProvider>
              <DemoSessionProvider>
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </DemoSessionProvider>
            </FavouritesProvider>
          </UniversityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
