import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer id="footer" className="relative bg-linear-to-b from-gray-900 to-neutral-900 text-white overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105">
              <Image
                src="/logo.png"
                alt="JingoJump Logo"
                width={100}
                height={100}
                className="rounded-lg"
              />
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed text-sm">
              Premium commercial inflatables for unforgettable events and endless fun. Creating memories that bounce!
            </p>
            <div className="flex space-x-3">
              <a href="#" className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-primary-500 transition-all duration-300">
                <i className="fa-brands fa-facebook text-lg group-hover:scale-110 transition-transform"></i>
              </a>
              <a href="#" className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-primary-500 transition-all duration-300">
                <i className="fa-brands fa-instagram text-lg group-hover:scale-110 transition-transform"></i>
              </a>
              <a href="#" className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-primary-500 transition-all duration-300">
                <i className="fa-brands fa-twitter text-lg group-hover:scale-110 transition-transform"></i>
              </a>
              <a href="#" className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-primary-500 transition-all duration-300">
                <i className="fa-brands fa-youtube text-lg group-hover:scale-110 transition-transform"></i>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm flex items-center group">
                  <i className="fa-solid fa-chevron-right text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  Bounce Houses
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm flex items-center group">
                  <i className="fa-solid fa-chevron-right text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  Water Slides
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm flex items-center group">
                  <i className="fa-solid fa-chevron-right text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  Combos
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm flex items-center group">
                  <i className="fa-solid fa-chevron-right text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  Obstacle Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm flex items-center group">
                  <i className="fa-solid fa-chevron-right text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm flex items-center group">
                  <i className="fa-solid fa-chevron-right text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/catalog-request" className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm flex items-center group">
                  <i className="fa-solid fa-chevron-right text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  Request Catalog
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors duration-200 text-sm flex items-center group">
                  <i className="fa-solid fa-chevron-right text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  Shipping Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">Stay Connected</h4>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              Subscribe for exclusive deals, new product launches, and event inspiration.
            </p>
            <form className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <button className="w-full bg-linear-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} JingoJump. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">Privacy Policy</a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">Terms of Service</a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
