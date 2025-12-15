"use client";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NavBar, SiteFooter } from "../_components/landing";
import { Mail, Phone, MapPin, CheckCircle, BookOpen, Truck, DollarSign } from "lucide-react";

export default function CatalogRequestPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    businessType: "",
    hearAboutUs: "",
    comments: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const benefits = [
    {
      icon: BookOpen,
      title: "Full Product Catalog",
      description: "Browse our complete collection of commercial-grade inflatables",
    },
    {
      icon: DollarSign,
      title: "Wholesale Pricing",
      description: "Exclusive pricing information for business customers",
    },
    {
      icon: Truck,
      title: "Shipping Details",
      description: "Comprehensive shipping and delivery information",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-[140px] pb-20 px-6 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
            Request Your Free Catalog
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
            Get our comprehensive wholesale catalog delivered straight to your door.
            Discover our full range of commercial inflatables, pricing, and specifications.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#1a1a1a] mb-1">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {isSubmitted ? (
            <div className="text-center py-16 px-8 bg-gray-50 rounded-2xl">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">Thank You!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your catalog request has been received. We&apos;ll send your free catalog within 5-7 business days.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-105"
              >
                Browse Products Online
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4">
                  Fill Out Your Information
                </h2>
                <p className="text-gray-600">
                  Complete the form below and we&apos;ll mail your free catalog right away.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Mailing Address */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-6">Mailing Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        name="zip"
                        required
                        value={formData.zip}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                      >
                        <option>United States</option>
                        <option>Canada</option>
                        <option>Mexico</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-6">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type
                      </label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select...</option>
                        <option>Party Rental Company</option>
                        <option>Event Planner</option>
                        <option>Amusement Park</option>
                        <option>Church/Religious Organization</option>
                        <option>School/Educational Institution</option>
                        <option>Recreation Center</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How did you hear about us?
                      </label>
                      <select
                        name="hearAboutUs"
                        value={formData.hearAboutUs}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select...</option>
                        <option>Google Search</option>
                        <option>Social Media</option>
                        <option>Trade Show</option>
                        <option>Referral</option>
                        <option>Advertisement</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comments or Questions
                      </label>
                      <textarea
                        name="comments"
                        rows={4}
                        value={formData.comments}
                        onChange={handleChange}
                        placeholder="Tell us about your business or any specific products you're interested in..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12 py-4 bg-primary-500 text-white font-bold text-lg rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? "Submitting..." : "Request Free Catalog"}
                  </button>
                  <p className="mt-4 text-sm text-gray-500">
                    Your information is secure and will never be shared.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* Contact Info Banner */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Call Us</p>
                <a href="tel:1-800-546-4648" className="font-semibold text-[#1a1a1a] hover:text-primary-500 transition-colors">
                  1-800-546-4648
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Us</p>
                <a href="mailto:info@jingojump.com" className="font-semibold text-[#1a1a1a] hover:text-primary-500 transition-colors">
                  info@jingojump.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
