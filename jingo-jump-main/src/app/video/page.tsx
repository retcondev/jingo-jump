"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { NavBar, SiteFooter } from "../_components/landing";

// All videos organized by category
const videoCategories = {
  products: {
    title: "Product Showcases",
    description: "Discover our premium inflatable products in action",
    videos: [
      { id: "rus0mODpuJA", title: "JingoJump Product Showcase" },
      { id: "JuCEwBERY1Q", title: "Commercial Bounce House Demo" },
      { id: "MQxZFKT6QA4", title: "Water Slide Features" },
      { id: "qLTsD5Ma5ng", title: "Setup & Installation Guide" },
      { id: "fzOOnILBqzc", title: "Customer Success Stories" },
    ],
  },
  lightCommercial: {
    title: "Light Commercial",
    description: "Perfect for residential use and small events",
    videos: [
      { id: "eJH1KvoEopc", title: "Light Commercial Bounce House 1" },
      { id: "GwQf8sT6E08", title: "Light Commercial Bounce House 2" },
      { id: "qs6Qty-06zA", title: "Light Commercial Bounce House 3" },
    ],
  },
  testimonials: {
    title: "Customer Testimonials",
    description: "Hear from our satisfied customers about their experience",
    videos: [
      { id: "hRxy1OdPjAg", title: "Customer Testimonial 1" },
      { id: "rHyz6ZbPHlA", title: "Customer Testimonial 2" },
      { id: "A15RqsABZn8", title: "Customer Testimonial 3" },
      { id: "E7pr-0acJOE", title: "Customer Testimonial 4" },
      { id: "m2MT_qjx1kU", title: "Customer Testimonial 5" },
      { id: "s8_rLqMGyfU", title: "Customer Testimonial 6" },
      { id: "hvHIq4_EHoc", title: "Customer Testimonial 7" },
    ],
  },
};

export default function VideoPage() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <div className="pt-40 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Video Gallery
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Watch our collection of product showcases, customer testimonials, and light commercial inflatables
            </p>
          </div>

          {/* Video Categories */}
          {Object.entries(videoCategories).map(([key, category]) => (
            <div key={key} className="mb-16">
              {/* Category Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                  {category.title}
                </h2>
                <p className="text-neutral-600">{category.description}</p>
              </div>

              {/* Videos Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.videos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white border-2 border-neutral-200 rounded-xl overflow-hidden hover:border-primary-500 hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Video Thumbnail / Player */}
                    <div className="relative aspect-video bg-neutral-100">
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
                          <Image
                            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                            alt={video.title}
                            fill
                            className="object-cover"
                            unoptimized
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
                    <div className="p-4">
                      <h3 className="font-bold text-neutral-900 text-base group-hover:text-primary-500 transition-colors">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* YouTube Channel CTA */}
          <div className="text-center bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-12 text-white mt-12">
            <h2 className="text-3xl font-bold mb-4">Want to See More?</h2>
            <p className="text-lg mb-6 text-white/90">
              Visit our YouTube channel for more videos, tutorials, and product showcases
            </p>
            <a
              href="https://www.youtube.com/@JingoJump"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-neutral-100 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Play className="w-5 h-5" />
              Visit Our YouTube Channel
            </a>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
