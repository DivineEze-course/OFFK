import type { Metadata } from "next";
import { SignInForm } from "@/components/account/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Demo sign-in for the OFFK template — no account system or backend is involved.",
};

export default function SignInPage() {
  return <SignInForm />;
}
