"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

// Video categories with their respective videos
const videoCategories = {
  products: {
    label: "Product Videos",
    videos: [
      {
        id: "rus0mODpuJA",
        title: "JingoJump Product Showcase",
        description: "Discover our premium inflatable products in action",
      },
      {
        id: "JuCEwBERY1Q",
        title: "Commercial Bounce House Demo",
        description: "See our commercial-grade inflatables in use",
      },
      {
        id: "MQxZFKT6QA4",
        title: "Water Slide Features",
        description: "Explore our exciting water slide collection",
      },
      {
        id: "qLTsD5Ma5ng",
        title: "Setup & Installation Guide",
        description: "Learn how to properly set up your inflatable",
      },
      {
        id: "fzOOnILBqzc",
        title: "Customer Success Stories",
        description: "See how JingoJump helps rental businesses succeed",
      },
    ],
  },
  testimonials: {
    label: "Testimonials",
    videos: [
      {
        id: "dQw4w9WgXcQ", // Replace with actual testimonial video ID
        title: "Customer Review - Rental Business Owner",
        description: "Hear from our satisfied customers about their experience",
      },
      {
        id: "dQw4w9WgXcQ", // Replace with actual testimonial video ID
        title: "Success Story - Event Planner",
        description: "How JingoJump inflatables transformed their events",
      },
    ],
  },
  howToOrder: {
    label: "How to Order",
    videos: [
      {
        id: "dQw4w9WgXcQ", // Replace with actual how-to video ID
        title: "Complete Ordering Guide",
        description: "Step-by-step guide to placing your order",
      },
      {
        id: "dQw4w9WgXcQ", // Replace with actual how-to video ID
        title: "Customization Options",
        description: "Learn about our customization and branding options",
      },
    ],
  },
  lightCommercial: {
    label: "Light Commercial",
    videos: [
      {
        id: "dQw4w9WgXcQ", // Replace with actual light commercial video ID
        title: "Light Commercial Bounce Houses",
        description: "Perfect for residential use and small events",
      },
      {
        id: "dQw4w9WgXcQ", // Replace with actual light commercial video ID
        title: "Backyard Inflatables Collection",
        description: "Explore our range of backyard-friendly inflatables",
      },
    ],
  },
};

type CategoryKey = keyof typeof videoCategories;

// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function VideoCarousel() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("products");
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const videos = videoCategories[activeCategory].videos;

  // Reset carousel when category changes
  useEffect(() => {
    setActiveIndex(0);
    setPlayingVideo(null);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeCategory]);

  // Auto-scroll functionality
  useEffect(() => {
    if (isPaused || playingVideo) return;

    const interval = setInterval(() => {
      const newIndex = activeIndex < videos.length - 1 ? activeIndex + 1 : 0;
      scrollToIndex(newIndex);
    }, 4000); // Auto-scroll every 4 seconds

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, playingVideo, videos.length]);

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.scrollWidth / videos.length;
      carouselRef.current.scrollTo({
        left: cardWidth * index,
        behavior: "smooth",
      });
    }
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const newIndex = activeIndex > 0 ? activeIndex - 1 : videos.length - 1;
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeIndex < videos.length - 1 ? activeIndex + 1 : 0;
    scrollToIndex(newIndex);
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.scrollWidth / videos.length;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  const categoryKeys = Object.keys(videoCategories) as CategoryKey[];

  return (
    <section
      className="py-16 px-6 bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Watch Our Videos
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Learn more about our products, setup guides, and customer success stories
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                activeCategory === key
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {videoCategories[key].label}
            </button>
          ))}
        </div>

        {/* Video Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-700 transition-all duration-300 border border-slate-200 shadow-md"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-700 transition-all duration-300 border border-slate-200 shadow-md"
            aria-label="Next video"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {videos.map((video, index) => (
              <div
                key={`${activeCategory}-${index}`}
                className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-center"
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-primary-500 transition-all duration-300 group shadow-lg hover:shadow-xl">
                  {/* Video Thumbnail / Player */}
                  <div className="relative aspect-video bg-slate-100">
                    {playingVideo === video.id ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    ) : (
                      <>
                        {/* YouTube Thumbnail */}
                        <img
                          src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to medium quality thumbnail if maxres doesn't exist
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
                          }}
                        />
                        {/* Play Button Overlay */}
                        <button
                          onClick={() => setPlayingVideo(video.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all duration-300"
                        >
                          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary-500/30">
                            <Play className="w-7 h-7 text-white ml-1" fill="white" />
                          </div>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-primary-500 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2">
                      {video.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-8 bg-primary-500"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <a
            href="https://www.youtube.com/@JingoJump"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105"
          >
            <Play className="w-5 h-5" />
            Visit Our YouTube Channel
          </a>
        </div>
      </div>
    </section>
  );
}
