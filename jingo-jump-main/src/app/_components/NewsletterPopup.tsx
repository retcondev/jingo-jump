"use client";

import { useState, useEffect } from "react";
import { X, Mail, Gift } from "lucide-react";

const POPUP_STORAGE_KEY = "newsletter_popup_shown";
const POPUP_DELAY_MS = 2000; // 2 seconds (change back to 15000 for production)

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if popup has already been shown
    const hasShown = localStorage.getItem(POPUP_STORAGE_KEY);
    if (hasShown) return;

    // Show popup after 15 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark as shown so it doesn't appear again
    localStorage.setItem(POPUP_STORAGE_KEY, "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Simulate API call - replace with actual API integration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSuccess(true);
      localStorage.setItem(POPUP_STORAGE_KEY, "true");

      // Close popup after showing success message
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fade-in_0.3s_ease-out,slide-up_0.3s_ease-out]">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
          aria-label="Close popup"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Get 15% Off!
          </h2>
          <p className="text-white/90 text-sm md:text-base">
            Sign up for our newsletter and save on your first order
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                You&apos;re In!
              </h3>
              <p className="text-neutral-600 text-sm">
                Check your email for your 15% discount code.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-neutral-800 placeholder:text-neutral-400 transition-all"
                  />
                </div>
              </div>

              {error && (
                <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? "Subscribing..." : "Get My 15% Off"}
              </button>

              <p className="mt-4 text-xs text-neutral-500 text-center">
                By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
