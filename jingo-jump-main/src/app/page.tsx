import type { Metadata } from "next";
import {
  FAQSection,
  FeaturedProducts,
  HeroSection,
  NavBar,
  NewsletterCTA,
  ShopByType,
  SiteFooter,
  TrendingNow,
  VideoCarousel,
} from "./_components/landing";

export const metadata: Metadata = {
  title: "Jingo Jump - Commercial Bounce Houses, Water Slides & Inflatables",
  description:
    "Shop premium commercial bounce houses, water slides & inflatables. Durable designs for rental businesses. Top quality at competitive prices.",
  alternates: {
    canonical: "https://jingojump.com",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <HeroSection />
      <ShopByType />
      <TrendingNow />
      <FeaturedProducts />
      <NewsletterCTA />
      <VideoCarousel />
      <FAQSection />
      <SiteFooter />
    </div>
  );
}
