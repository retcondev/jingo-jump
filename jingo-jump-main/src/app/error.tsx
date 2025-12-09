"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-error/10">
            <AlertTriangle className="h-10 w-10 text-error" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-neutral-600 mb-8">
          We encountered an unexpected error. Please try again or return to the homepage.
        </p>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-8 p-4 bg-neutral-100 rounded-lg text-left">
            <p className="text-xs font-mono text-neutral-600 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-neutral-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-300 transition-colors"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
        </div>

        {/* Brand Footer */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-sm font-black text-white">JJ</span>
            </div>
            <span className="text-sm font-medium text-neutral-500">Jingo Jump</span>
          </div>
        </div>
      </div>
    </div>
  );
}
