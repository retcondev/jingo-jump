"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingCart, Menu, X, Phone, ChevronDown, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "~/context/CartContext";
import type { Product } from "~/types/product";

// Mega menu data with colored sections
const megaMenuData = {
  products: {
    label: "Products",
    href: "/shop",
    sections: [
      {
        title: "Bouncers",
        color: "bg-pink-50",
        titleColor: "text-pink-600",
        items: [
          { label: "Bouncers 13x13", href: "/shop?category=bouncers-13x13" },
          { label: "Bouncers 15x15", href: "/shop?category=bouncers-15x15" },
          { label: "Standard Bouncers", href: "/shop?category=standard-bouncers" },
          { label: "Light-Commercial", href: "/shop?category=light-commercial" },
        ],
      },
      {
        title: "Water Fun",
        color: "bg-blue-50",
        titleColor: "text-blue-600",
        items: [
          { label: "Water Slides", href: "/shop?category=water-slides" },
          { label: "Combo Units", href: "/shop?category=combo-units" },
          { label: "Slides & Obstacles", href: "/shop?category=obstacle-courses" },
        ],
      },
      {
        title: "Commercial",
        color: "bg-amber-50",
        titleColor: "text-amber-600",
        items: [
          { label: "Commercial Units", href: "/shop?category=commercial-units" },
          { label: "Package Deals", href: "/shop?category=package-deals" },
          { label: "Sports & Games", href: "/shop?category=interactive-games" },
        ],
      },
      {
        title: "Special",
        color: "bg-green-50",
        titleColor: "text-green-600",
        items: [
          { label: "Open Box Products", href: "/shop?category=open-box" },
          { label: "Clearance Sale", href: "/shop?category=clearance" },
          { label: "Accessories", href: "/shop?category=accessories" },
          { label: "Art Panels", href: "/shop?category=art-panels" },
        ],
      },
    ],
  },
  businessInfo: {
    label: "Business Info",
    href: "/business-info",
    sections: [
      {
        title: "Resources",
        color: "bg-indigo-50",
        titleColor: "text-indigo-600",
        items: [
          { label: "Inflatable Insurance", href: "/insurance" },
          { label: "Business Opportunity", href: "/business-info/opportunity" },
          { label: "Manuals and Safety Documents", href: "/business-info/manuals" },
          // { label: "Financing Info", href: "/business-info/financing" },
        ],
      },
    ],
  },
};

const simpleLinks = [
  { label: "Catalog Request", href: "/catalog-request" },
  { label: "Contact Us", href: "/contact" },
  { label: "About Us", href: "/about" },
  { label: "Video", href: "/video" },
  // { label: "Blog", href: "/blog" },
];

export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { totalItems, openCart } = useCart();
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.role && ["ADMIN", "MANAGER", "STAFF"].includes(session.user.role);

  // Search functionality disabled - can be re-implemented with API call
  const searchResults = useMemo((): Product[] => {
    return [];
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Two-Tier Header */}
      <header
        id="header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-lg" : ""
        }`}
      >
        {/* Top Bar - White background */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-8 lg:px-12 py-4">
            {/* Flexbox container with logo absolutely centered */}
            <div className="flex items-center justify-between relative">
              {/* Left Section - Phone & Search */}
              <div className="flex items-center gap-6">
                {/* Phone Number */}
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" strokeWidth={2} />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    1-800-546-4648
                  </span>
                  <span className="text-sm font-medium text-gray-700 sm:hidden">
                    Call
                  </span>
                </div>

                {/* Search Input with Dropdown */}
                <div className="hidden md:block relative" ref={searchRef}>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      className="w-56 pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    <button
                      className="absolute right-1 p-1.5 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors"
                      aria-label="Search"
                    >
                      <Search className="w-4 h-4 text-white" strokeWidth={2} />
                    </button>
                  </div>

                  {/* Search Results Dropdown */}
                  {isSearchFocused && searchQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 w-80">
                      {searchResults.length > 0 ? (
                        <>
                          <div className="p-3 bg-gray-50 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {searchResults.length} Products Found
                            </span>
                          </div>
                          <div className="max-h-[400px] overflow-y-auto">
                            {searchResults.map((product) => (
                              <Link
                                key={product.id}
                                href={`/shop/${product.id}`}
                                onClick={handleProductClick}
                                className="flex items-center gap-3 p-3 hover:bg-primary-50 transition-colors border-b border-gray-50 last:border-b-0"
                              >
                                {/* Product Image */}
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                  {product.image && typeof product.image === 'string' ? (
                                    <Image
                                      src={product.image}
                                      alt={product.name}
                                      width={56}
                                      height={56}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-white" />
                                  )}
                                </div>
                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 truncate">
                                    {product.category}
                                  </p>
                                  <p className="text-sm font-bold text-primary-500 mt-0.5">
                                    ${typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                                  </p>
                                </div>
                                {/* Badge */}
                                {product.badge && (
                                  <span
                                    className={`px-2 py-0.5 text-xs font-bold rounded-full shrink-0 ${
                                      product.badge === "NEW"
                                        ? "bg-green-100 text-green-700"
                                        : product.badge === "POPULAR"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {product.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                          <Link
                            href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                            onClick={handleProductClick}
                            className="block p-3 bg-gray-50 text-center text-sm font-semibold text-primary-500 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                          >
                            View All Results →
                          </Link>
                        </>
                      ) : (
                        <div className="p-6 text-center">
                          <div className="text-4xl mb-2">🔍</div>
                          <p className="text-sm text-gray-500">
                            No products found for &ldquo;{searchQuery}&rdquo;
                          </p>
                          <Link
                            href="/shop"
                            onClick={handleProductClick}
                            className="text-sm font-semibold text-primary-500 hover:text-primary-600 mt-2 inline-block"
                          >
                            Browse All Products
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Center Logo - Absolutely positioned for true center */}
              <Link
                href="/"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group transition-transform hover:scale-105 duration-300"
              >
                <Image
                  src="/hero-images/Untitled design - 2025-12-04T135937.399.png"
                  alt="Jingo Jump"
                  width={150}
                  height={50}
                  className="object-contain px-2 pb-2 pt-[13px]"
                />
              </Link>

              {/* Right Section - Account & Cart */}
              <div className="flex items-center gap-4">
                {/* Mobile Search Button */}
                <button
                  className="md:hidden p-2 text-gray-600 hover:text-primary-500 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" strokeWidth={2} />
                </button>

                {/* My Account Button */}
                <div className="hidden md:block relative" ref={accountMenuRef}>
                  {status === "loading" ? (
                    <div className="px-4 py-1.5 border border-gray-300 rounded-full">
                      <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
                    </div>
                  ) : session ? (
                    <>
                      <button
                        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                        className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-500 transition-all"
                      >
                        <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-600">
                            {session.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                          </span>
                        </div>
                        <span className="max-w-[100px] truncate">
                          {session.user?.name?.split(" ")[0] ?? "Account"}
                        </span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isAccountMenuOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Account Dropdown */}
                      {isAccountMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                          <div className="p-3 border-b border-gray-100 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {session.user?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                          <div className="py-1">
                            {isAdmin && (
                              <Link
                                href="/admin"
                                onClick={() => setIsAccountMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                              >
                                <LayoutDashboard className="w-4 h-4" />
                                Admin Panel
                              </Link>
                            )}
                            <Link
                              href="/account"
                              onClick={() => setIsAccountMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              My Account
                            </Link>
                            <Link
                              href="/account/orders"
                              onClick={() => setIsAccountMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              My Orders
                            </Link>
                            <Link
                              href="/account/profile"
                              onClick={() => setIsAccountMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>
                          </div>
                          <div className="border-t border-gray-100 py-1">
                            <button
                              onClick={() => {
                                setIsAccountMenuOpen(false);
                                void signOut({ callbackUrl: "/" });
                              }}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/signin"
                      className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-500 transition-all"
                    >
                      <User className="w-4 h-4" strokeWidth={2} />
                      Sign In
                    </Link>
                  )}
                </div>

                {/* View Cart Button */}
                <button
                  onClick={openCart}
                  className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-primary-500 hover:text-primary-500 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" strokeWidth={2} />
                  <span className="hidden sm:inline">View Cart</span>
                  <span className="flex items-center justify-center w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full">
                    {totalItems}
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

        {/* Bottom Bar - Brand color (Primary/Orange) background with Mega Menus */}
        <div className="bg-primary-500 hidden lg:block">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center justify-center gap-2">
              {/* Products Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMenu("products")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className={`flex items-center gap-1 px-4 py-3 text-base font-semibold transition-all duration-200 ${
                    activeMenu === "products"
                      ? "bg-primary-700 text-white"
                      : "text-white hover:bg-primary-600"
                  }`}
                >
                  {megaMenuData.products.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === "products" ? "rotate-180" : ""}`} />
                </button>

                {/* Mega Menu Dropdown */}
                <div
                  className={`absolute top-full left-0 w-[700px] bg-white rounded-b-xl shadow-2xl transition-all duration-200 ${
                    activeMenu === "products"
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2"
                  }`}
                >
                  <div className="grid grid-cols-4 gap-0">
                    {megaMenuData.products.sections.map((section) => (
                      <div key={section.title} className={`p-4 ${section.color}`}>
                        <h3 className={`font-bold text-sm mb-3 ${section.titleColor}`}>
                          {section.title}
                        </h3>
                        <ul className="space-y-2">
                          {section.items.map((item) => (
                            <li key={item.label}>
                              <Link
                                href={item.href}
                                className="text-sm text-gray-700 hover:text-primary-500 transition-colors block py-1"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-b-xl">
                    <Link
                      href="/shop"
                      className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      View All Products →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Business Info Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => setActiveMenu("businessInfo")}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className={`flex items-center gap-1 px-4 py-3 text-base font-semibold transition-all duration-200 ${
                    activeMenu === "businessInfo"
                      ? "bg-primary-700 text-white"
                      : "text-white hover:bg-primary-600"
                  }`}
                >
                  {megaMenuData.businessInfo.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeMenu === "businessInfo" ? "rotate-180" : ""}`} />
                </button>

                {/* Mega Menu Dropdown */}
                <div
                  className={`absolute top-full left-0 w-[350px] bg-white rounded-b-xl shadow-2xl transition-all duration-200 ${
                    activeMenu === "businessInfo"
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2"
                  }`}
                >
                  <div className="grid grid-cols-1 gap-0">
                    {megaMenuData.businessInfo.sections.map((section) => (
                      <div key={section.title} className={`p-4 ${section.color}`}>
                        <h3 className={`font-bold text-sm mb-3 ${section.titleColor}`}>
                          {section.title}
                        </h3>
                        <ul className="space-y-2">
                          {section.items.map((item) => (
                            <li key={item.label}>
                              <Link
                                href={item.href}
                                className="text-sm text-gray-700 hover:text-primary-500 transition-colors block py-1"
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simple Links */}
              {simpleLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-3 text-base font-semibold transition-all duration-200 ${
                    pathname === link.href
                      ? "bg-primary-700 text-white"
                      : "text-white/90 hover:text-white hover:bg-primary-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
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

          {/* Mobile Search with Results */}
          <div className="p-4 border-b border-gray-100" ref={mobileSearchRef}>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                className="absolute right-1 p-2 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-white" strokeWidth={2} />
              </button>
            </div>

            {/* Mobile Search Results */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="mt-3 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                {searchResults.length > 0 ? (
                  <>
                    <div className="max-h-[250px] overflow-y-auto">
                      {searchResults.slice(0, 4).map((product) => (
                        <Link
                          key={product.id}
                          href={`/shop/${product.id}`}
                          onClick={handleProductClick}
                          className="flex items-center gap-3 p-3 hover:bg-white transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {product.image && typeof product.image === 'string' ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-sm font-bold text-primary-500">
                              ${typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                      onClick={handleProductClick}
                      className="block p-3 text-center text-sm font-semibold text-primary-500 hover:bg-white transition-colors"
                    >
                      View All Results →
                    </Link>
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500">No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {/* Products Section */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">Products</h3>
              {megaMenuData.products.sections.map((section) => (
                <div key={section.title} className="mb-3">
                  <h4 className={`text-xs font-semibold ${section.titleColor} px-4 mb-1`}>{section.title}</h4>
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-3" />

            {/* Business Info Section */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">Business Info</h3>
              {megaMenuData.businessInfo.sections.map((section) => (
                <div key={section.title} className="mb-3">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-3" />

            {/* Simple Links */}
            {simpleLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-primary-500 text-white"
                    : "text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-100 my-3" />

            {/* Account Links */}
            {session ? (
              <>
                {/* User Info */}
                <div className="px-4 py-3 mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user?.email}
                  </p>
                </div>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5" strokeWidth={2} />
                    Admin Panel
                  </Link>
                )}

                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all"
                >
                  <User className="w-5 h-5" strokeWidth={2} />
                  My Account
                </Link>

                <Link
                  href="/account/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all"
                >
                  <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                  My Orders
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    void signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <LogOut className="w-5 h-5" strokeWidth={2} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all"
                >
                  <User className="w-5 h-5" strokeWidth={2} />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-all"
                >
                  Create Account
                </Link>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 my-3" />

            {/* Cart Link */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openCart();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              View Cart
              <span className="ml-auto flex items-center justify-center w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full">
                {totalItems}
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
