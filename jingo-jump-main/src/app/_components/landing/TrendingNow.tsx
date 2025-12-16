"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const bannerSlides = [
  {
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/c9a68195a9-3a8ff85ee528f3c319de.png",
    title: "BEST SELLERS",
    cta: "View Popular Units",
    alt: "Best selling inflatable units"
  },
  {
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/1499b30bef-5e40083be32813e9582f.png",
    title: "NEW ARRIVALS",
    cta: "Explore New Collection",
    alt: "New inflatable products"
  },
  {
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/c936dd8ec2-6d83d7823806455adf99.png",
    title: "SUMMER SPECIAL",
    cta: "Shop Water Slides",
    alt: "Summer water slides collection"
  },
  {
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/316840bb87-25764533442e45826d8a.png",
    title: "CLEARANCE SALE",
    cta: "Save Up to 50%",
    alt: "Clearance sale items"
  }
] as const;

type BannerSlide = (typeof bannerSlides)[number];

export function TrendingNow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  // Get previous and next slide indices
  const prevSlideIndex = (currentSlide - 1 + bannerSlides.length) % bannerSlides.length;
  const nextSlideIndex = (currentSlide + 1) % bannerSlides.length;

  // Get slide data with type-safe fallback
  const getSlide = (index: number): BannerSlide => {
    const slide = bannerSlides[index];
    if (!slide) {
      // This should never happen with our modulo logic, but satisfies TypeScript
      return bannerSlides[0];
    }
    return slide;
  };

  const prevSlideData = getSlide(prevSlideIndex);
  const currentSlideData = getSlide(currentSlide);
  const nextSlideData = getSlide(nextSlideIndex);

  return (
    <section id="trending-now" className="pt-6 pb-12 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative h-[500px] flex items-center justify-center group">
          {/* Previous Slide (Left) */}
          <div
            className="absolute left-0 w-[35%] h-[400px] rounded-xl overflow-hidden shadow-lg transition-all duration-700 cursor-pointer opacity-60 hover:opacity-80 z-0"
            onClick={goToPrevious}
          >
            <Image
              className="w-full h-full object-cover"
              src={prevSlideData.image}
              alt={prevSlideData.alt}
              fill
              sizes="35vw"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Current Slide (Center) */}
          <div className="relative w-[55%] h-[500px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 z-10 mx-4">
            <Image
              className="w-full h-full object-cover"
              src={currentSlideData.image}
              alt={currentSlideData.alt}
              fill
              sizes="55vw"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center justify-end pb-16">
              <h2 className="text-5xl font-bold text-white mb-6">{currentSlideData.title}</h2>
              <button className="bg-primary-500 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-primary-600 transition shadow-lg">
                {currentSlideData.cta}
              </button>
            </div>
          </div>

          {/* Next Slide (Right) */}
          <div
            className="absolute right-0 w-[35%] h-[400px] rounded-xl overflow-hidden shadow-lg transition-all duration-700 cursor-pointer opacity-60 hover:opacity-80 z-0"
            onClick={goToNext}
          >
            <Image
              className="w-full h-full object-cover"
              src={nextSlideData.image}
              alt={nextSlideData.alt}
              fill
              sizes="35vw"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-neutral-900" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-neutral-900" />
          </button>

          {/* Dots Navigation */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
