import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NavBar, SiteFooter } from "../_components/landing";
import {
  Award,
  Users,
  Shield,
  Truck,
  Heart,
  Target,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Jingo Jump - Commercial Inflatable Manufacturer",
  description:
    "Learn about Jingo Jump, your trusted source for commercial-grade bounce houses, water slides, and inflatables. Quality products for rental businesses since 2005.",
};

export default function AboutPage() {
  const stats = [
    { value: "18+", label: "Years in Business" },
    { value: "10,000+", label: "Products Sold" },
    { value: "50+", label: "Countries Served" },
    { value: "99%", label: "Customer Satisfaction" },
  ];

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description:
        "Every product undergoes rigorous safety testing and meets or exceeds industry standards. Your customers' safety is our top priority.",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description:
        "We use only commercial-grade materials and reinforced stitching to ensure our inflatables withstand years of heavy use.",
    },
    {
      icon: Heart,
      title: "Customer Focus",
      description:
        "We're committed to your success. From product selection to after-sales support, we're here every step of the way.",
    },
    {
      icon: Target,
      title: "Innovation",
      description:
        "We continuously develop new designs and improve our products to keep you ahead of the competition.",
    },
  ];

  const features = [
    "Commercial-grade 18oz PVC vinyl",
    "Reinforced double & quadruple stitching",
    "Heavy-duty D-rings and anchor points",
    "Lead-free and fire-retardant materials",
    "UV-resistant printing and coatings",
    "Comprehensive warranty coverage",
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-[140px] pb-24 px-6 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
                About JingoJump
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed animate-fade-in">
                For over 18 years, we&apos;ve been the trusted partner for party rental businesses,
                event planners, and entertainment venues across the globe. Our mission is simple:
                deliver the highest quality commercial inflatables at competitive wholesale prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-500 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Browse Products
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="JingoJump Logo"
                    width={200}
                    height={200}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  JingoJump was founded with a simple belief: party rental businesses deserve
                  access to the same quality commercial inflatables as the big players, but at
                  prices that make sense for growing companies.
                </p>
                <p>
                  What started as a small operation has grown into one of the most trusted names
                  in the commercial inflatable industry. Today, we serve thousands of customers
                  across more than 50 countries, from small family-owned rental companies to
                  large entertainment venues.
                </p>
                <p>
                  Our success is built on three pillars: uncompromising quality, competitive
                  pricing, and exceptional customer service. We&apos;re not just selling
                  products—we&apos;re helping entrepreneurs build successful businesses.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-6">Why Choose JingoJump?</h3>
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, from product development to customer service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="group p-8 bg-white rounded-2xl border border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-all duration-300">
                  <value.icon className="w-7 h-7 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white lg:col-span-1">
              <Users className="w-12 h-12 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Built for Business</h3>
              <p className="text-white/90 leading-relaxed">
                We understand the rental business because we&apos;ve worked alongside rental
                companies for nearly two decades. Our products are designed to maximize your ROI
                with durability that lasts.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm lg:col-span-1">
              <Truck className="w-12 h-12 text-primary-500 mb-6" />
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">Fast Shipping</h3>
              <p className="text-gray-600 leading-relaxed">
                Most orders ship within 3-5 business days. We partner with reliable carriers to
                ensure your products arrive safely and on time, anywhere in the world.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm lg:col-span-1">
              <Award className="w-12 h-12 text-primary-500 mb-6" />
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">Industry Certified</h3>
              <p className="text-gray-600 leading-relaxed">
                Our manufacturing facilities meet international quality standards. Every product
                is tested for safety and durability before it leaves our warehouse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful rental businesses who trust JingoJump for their
            commercial inflatable needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-500 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Browse Products
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/catalog-request"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              Request Catalog
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
