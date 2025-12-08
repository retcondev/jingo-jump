"use client";

import { Mail, Phone } from "lucide-react";
import { useState } from "react";

export function NewsletterCTA() {
  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    // Simulate API call
    setTimeout(() => {
      setMessage("Thank you! We'll contact you shortly.");
      if (activeTab === "phone") {
        setPhoneNumber("");
      } else {
        setEmail("");
      }
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="contact-banner" className="py-12 md:py-16 px-6 bg-gradient-to-r from-primary-500 to-primary-600">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left lg:flex-1">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
              Ready to Grow Your Business?
            </h2>
            <p className="text-base md:text-lg text-white/90">
              Get in touch for wholesale pricing, bulk orders, and exclusive deals
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="lg:flex-1 w-full max-w-xl">
            {/* Tab Selector */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <button
                onClick={() => setActiveTab("phone")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeTab === "phone"
                    ? "bg-white text-primary-500"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Phone className="w-4 h-4" />
                Phone
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  activeTab === "email"
                    ? "bg-white text-primary-500"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-3">
                {activeTab === "phone" ? (
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                    className="flex-1 px-5 py-3 rounded-lg border-2 border-white/30 bg-white/95 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-neutral-800 placeholder:text-neutral-400 font-medium"
                  />
                ) : (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="flex-1 px-5 py-3 rounded-lg border-2 border-white/30 bg-white/95 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-neutral-800 placeholder:text-neutral-400 font-medium"
                  />
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-white text-primary-500 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
              {message && (
                <p className="mt-3 text-sm text-white font-semibold bg-white/20 py-2 px-4 rounded-lg text-center">
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
