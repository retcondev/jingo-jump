"use client";

import Link from "next/link";
import { useState } from "react";
import { NavBar, SiteFooter } from "../_components/landing";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Headphones,
  FileText,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
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

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone",
      description: "Mon-Fri from 8am to 5pm PST",
      value: "1-800-546-4648",
      href: "tel:1-800-546-4648",
    },
    {
      icon: Mail,
      title: "Email",
      description: "We'll respond within 24 hours",
      value: "info@jingojump.com",
      href: "mailto:info@jingojump.com",
    },
    {
      icon: MapPin,
      title: "Office",
      description: "Visit our showroom",
      value: "Los Angeles, CA",
      href: "#",
    },
  ];

  const quickLinks = [
    {
      icon: MessageSquare,
      title: "Sales Inquiry",
      description: "Get wholesale pricing and bulk order information",
      href: "#contact-form",
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Get help with existing orders or products",
      href: "#contact-form",
    },
    {
      icon: FileText,
      title: "Request Catalog",
      description: "Get our full product catalog mailed to you",
      href: "/catalog-request",
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
            Get In Touch
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
            Have questions about our commercial inflatables? We&apos;re here to help you find
            the perfect products for your business.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-500 transition-all duration-300">
                  <method.icon className="w-8 h-8 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-[#1a1a1a] mb-1">{method.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{method.description}</p>
                <p className="font-semibold text-primary-500">{method.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1a1a1a] mb-10">
            How Can We Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="group flex items-start gap-4 p-6 border border-gray-200 rounded-2xl hover:border-primary-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-primary-500 transition-all duration-300">
                  <link.icon className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#1a1a1a] mb-1 group-hover:text-primary-500 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column - Info */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-6">
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Whether you&apos;re looking for wholesale pricing, have questions about our products,
                or need support with an existing order, our team is ready to assist you.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] mb-1">Business Hours</h3>
                    <p className="text-gray-600 text-sm">Monday - Friday: 8:00 AM - 5:00 PM PST</p>
                    <p className="text-gray-600 text-sm">Saturday - Sunday: Closed</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] mb-1">Phone Support</h3>
                    <a
                      href="tel:1-800-546-4648"
                      className="text-primary-500 font-medium hover:text-primary-600 transition-colors"
                    >
                      1-800-546-4648
                    </a>
                    <p className="text-gray-600 text-sm">Toll-free within the US</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a1a] mb-1">Email</h3>
                    <a
                      href="mailto:info@jingojump.com"
                      className="text-primary-500 font-medium hover:text-primary-600 transition-colors"
                    >
                      info@jingojump.com
                    </a>
                    <p className="text-gray-600 text-sm">We respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">Message Sent!</h3>
                  <p className="text-gray-600 mb-8">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        company: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="text-primary-500 font-semibold hover:text-primary-600 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
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
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Your Company"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select a subject...</option>
                      <option value="sales">Sales / Wholesale Pricing</option>
                      <option value="product">Product Information</option>
                      <option value="order">Order Status / Support</option>
                      <option value="warranty">Warranty / Returns</option>
                      <option value="shipping">Shipping Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                      placeholder="How can we help you today?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-all duration-300 hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map / Location Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4">Visit Our Showroom</h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            Want to see our inflatables in person? Schedule a visit to our Los Angeles showroom
            and experience the quality firsthand.
          </p>
          <div className="bg-gray-100 rounded-2xl h-80 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <p className="text-gray-600">Los Angeles, California</p>
              <p className="text-sm text-gray-500 mt-2">Contact us to schedule a showroom visit</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
