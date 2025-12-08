"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingCart, Menu, X, Phone } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Products", href: "/shop", highlight: true },
  { label: "Hot Deals", href: "/shop/clearance" },
  { label: "Commercial Units", href: "/shop/commercial" },
  { label: "Water Slides", href: "/shop/water-slides" },
  { label: "Combo Units", href: "/shop/combo" },
  { label: "Bouncers", href: "/shop/bouncers" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export function FloatingNavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Two-Tier Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-lg" : ""
        }`}
      >
        {/* Top Bar - White background */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-3">
            {/* 5-column grid for true center alignment */}
            <div className="grid grid-cols-[1fr_1fr_auto_1fr_1fr] items-center gap-4">
              {/* Column 1: Phone Number */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" strokeWidth={2} />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  1-800-546-4648
                </span>
                <span className="text-sm font-medium text-gray-700 sm:hidden">
                  Call Us
                </span>
              </div>

              {/* Column 2: Search Input */}
              <div className="hidden md:flex items-center justify-end">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-52 pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <button
                    className="absolute right-1 p-1.5 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4 text-white" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Column 3: Center Logo */}
              <Link
                href="/"
                className="flex justify-center group transition-transform hover:scale-105 duration-300"
              >
                <Image
                  src="/logo.png"
                  alt="Jingo Jump"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </Link>

              {/* Column 4: My Account Button */}
              <div className="hidden md:flex items-center justify-start">
                <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-500 transition-all">
                  <User className="w-4 h-4" strokeWidth={2} />
                  My Account
                </button>
              </div>

              {/* Column 5: View Cart */}
              <div className="flex items-center justify-end gap-2">
                {/* Mobile Search Button */}
                <button
                  className="md:hidden p-2 text-gray-600 hover:text-primary-500 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" strokeWidth={2} />
                </button>

                {/* View Cart Button */}
                <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-500 transition-all">
                  <ShoppingCart className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">View Cart</span>
                  <span className="flex items-center justify-center w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full">
                    {cartCount}
                  </span>
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-600 hover:text-primary-500 transition-colors"
                  aria-label="Menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" strokeWidth={2} />
                  ) : (
                    <Menu className="w-6 h-6" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Brand color (Primary/Yellow) background */}
        <div className="bg-primary-500 hidden lg:block">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center justify-center gap-8 py-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const isHighlight = link.highlight;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3 py-1.5 text-sm font-semibold transition-all duration-200 rounded ${
                      isActive
                        ? "bg-primary-700 text-white"
                        : isHighlight
                        ? "text-white hover:bg-primary-600"
                        : "text-white/90 hover:text-white hover:bg-primary-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Slide-out Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-lg font-bold text-gray-900">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" strokeWidth={2} />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                className="absolute right-1 p-2 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-white" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-primary-500 text-white"
                      : "text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-100 my-3" />

            {/* Account Link */}
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all">
              <User className="w-5 h-5" strokeWidth={2} />
              My Account
            </button>

            {/* Cart Link */}
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all">
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              View Cart
              <span className="ml-auto flex items-center justify-center w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full">
                {cartCount}
              </span>
            </button>
          </nav>

          {/* Drawer Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" strokeWidth={2} />
              <span className="font-medium">1-800-546-4648</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
