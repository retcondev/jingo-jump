"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const slides = [
  {
    image: "/hero-images/1.png",
    badge: "New Collection 2025",
    heading: "Welcome to",
    subheading: "Wholesale Commercial-Grade Inflatables for Your Business",
  },
  {
    image: "/hero-images/2.png",
    badge: "Premium Quality",
    heading: "Elevate Your",
    subheading: "Top-Tier Bounce Houses & Water Slides at Wholesale Prices",
  },
] as const;

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState<0 | 1>(0);
  const slide = slides[currentSlide];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => ((prev + 1) % slides.length) as 0 | 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative h-[375px] flex items-center justify-center overflow-hidden mt-[100px]">
      {/* Background Images */}
      {slides.map((slideItem, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slideItem.image}
            alt={`Hero background ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Left/Right Navigation Buttons */}
      <button
        onClick={() => setCurrentSlide((prev) => ((prev - 1 + slides.length) % slides.length) as 0 | 1)}
        className="absolute left-4 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => ((prev + 1) % slides.length) as 0 | 1)}
        className="absolute right-4 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center">
          <div className="text-left max-w-4xl">
            {/* Heading */}
            <h1 className="mb-6 tracking-tight">
              <span
                key={`heading-${currentSlide}`}
                className="block text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 mb-2 leading-tight animate-fade-in"
              >
                {slide.heading}
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl font-black text-white pb-3 leading-tight">
                JingoJump
              </span>
            </h1>

            {/* Subheading */}
            <p
              key={`subheading-${currentSlide}`}
              className="text-base sm:text-lg md:text-xl mb-8 font-light text-white/70 max-w-2xl leading-relaxed animate-fade-in"
            >
              {slide.subheading}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/shop" className="group relative px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-semibold text-base overflow-hidden transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20">
                <span className="relative z-10 flex items-center gap-2">
                  Browse Wholesale Inventory
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-primary-400/20 to-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <button className="group px-8 py-4 bg-white/5 backdrop-blur-sm text-white border border-white/20 rounded-full font-semibold text-base transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-105">
                Request Catalog
              </button>
            </div>

          </div>
      </div>
    </section>
  );
}
