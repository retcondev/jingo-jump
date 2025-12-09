import type { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Jingo Jump account to track orders and manage purchases.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <SignInForm />;
}
