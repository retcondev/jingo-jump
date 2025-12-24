import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Jingo Jump account to track orders and manage purchases.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
