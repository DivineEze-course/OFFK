"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { createStoredValue, useStoredValue } from "@/lib/stored-value";

interface DemoUser {
  name: string;
  email: string;
}

interface DemoSessionContextValue {
  /** `null` when the demo visitor has not "signed in" yet. */
  user: DemoUser | null;
  ready: boolean;
  signInDemo: () => void;
  signOutDemo: () => void;
}

const DemoSessionContext = createContext<DemoSessionContextValue | null>(null);

const DEMO_USER: DemoUser = {
  name: "Chidinma O.",
  email: "chidinma.demo@offk.example",
};

/**
 * A pretend session used only to demo the signed-in navigation and dashboard
 * states. No authentication happens — there is no backend in this template,
 * and the flag lives in localStorage on this device only.
 */
const sessionStore = createStoredValue<boolean>({
  key: "offk.demo-user",
  fallback: false,
  parse: (raw) => raw === "active",
  serialize: (value) => (value ? "active" : ""),
});

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const { value: active, ready } = useStoredValue(sessionStore);

  const signInDemo = useCallback(() => sessionStore.write(true), []);
  const signOutDemo = useCallback(() => sessionStore.write(false), []);

  const user = active ? DEMO_USER : null;
  const value = useMemo(
    () => ({ user, ready, signInDemo, signOutDemo }),
    [user, ready, signInDemo, signOutDemo],
  );

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession(): DemoSessionContextValue {
  const context = useContext(DemoSessionContext);
  if (!context) throw new Error("useDemoSession must be used inside <DemoSessionProvider>");
  return context;
}
