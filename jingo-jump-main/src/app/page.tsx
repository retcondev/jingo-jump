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
