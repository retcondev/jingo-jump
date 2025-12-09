"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, ShoppingCart, Heart, Share2, CheckCircle2, Truck, Shield, Star, Box, Image as ImageIcon, Play } from "lucide-react";
import { mockProducts } from "~/data/mockProducts";
import { ProductCard } from "~/app/_components/shop/ProductCard";
import { ModelViewer } from "~/app/_components/shop/ModelViewer";
import { useCart } from "~/context/CartContext";

export default function ProductPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const product = mockProducts.find(p => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewMode, setViewMode] = useState<"images" | "3d">("images");
  const { addToCart } = useCart();

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  // Get related products (same category, excluding current)
  const relatedProducts = mockProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const productImages = [product.image, product.image, product.image, "video"]; // Using same image multiple times for demo, last one is video
  const has3DModel = product.id === 1; // Only Rainbow Rush has 3D model for now

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 xl:px-12 mt-[140px]">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Link href="/" className="transition-colors hover:text-[primary-500]">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/shop" className="transition-colors hover:text-[primary-500]">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/shop" className="transition-colors hover:text-[primary-500]">{product.category}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-900">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Column - Images/3D */}
          <div className="space-y-4">
            {/* View Mode Toggle */}
            {has3DModel && (
              <div className="flex gap-2 rounded-xl bg-white p-2 shadow-sm border border-slate-200">
                <button
                  onClick={() => setViewMode("images")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-bold transition-all ${
                    viewMode === "images"
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <ImageIcon className="h-5 w-5" />
                  Images
                </button>
                <button
                  onClick={() => setViewMode("3d")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-bold transition-all ${
                    viewMode === "3d"
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Box className="h-5 w-5" />
                  3D View
                </button>
              </div>
            )}

            {/* Main Display Area */}
            {viewMode === "3d" && has3DModel ? (
              <div className="h-[500px]">
                <ModelViewer modelUrl="/3d.glb" />
              </div>
            ) : (
              <>
                {/* Main Image or Video */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  {selectedImage === 3 ? (
                    // Video Display
                    <div className="relative h-[500px] bg-black">
                      <video
                        src="/product-video.mp4"
                        controls
                        className="h-full w-full"
                        autoPlay
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    // Image Display
                    <div className="relative flex h-[500px] items-center justify-center p-8 bg-white">
                      {product.badge && (
                        <span className={`absolute left-6 top-6 z-10 rounded-full px-5 py-2 text-sm font-black uppercase tracking-wide text-white shadow-lg ${
                          product.badge === "NEW" ? "bg-fuchsia-600" :
                          product.badge === "POPULAR" ? "bg-purple-500" : "bg-red-500"
                        }`}>
                          {product.badge}
                        </span>
                      )}
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={600}
                          height={500}
                          className="h-full w-full object-contain"
                          priority
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                <div className="grid grid-cols-4 gap-4">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`overflow-hidden rounded-xl border-2 transition-all ${
                        selectedImage === idx ? "border-[primary-500]" : "border-slate-200 hover:border-slate-300"
                      } ${img === "video" ? "bg-slate-800" : "bg-white"}`}
                    >
                      <div className="relative flex h-32 items-center justify-center p-4">
                        {img === "video" ? (
                          <>
                            <video
                              src="/product-video.mp4"
                              className="h-full w-full object-cover"
                              muted
                              playsInline
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white hover:scale-110">
                                <Play className="h-6 w-6 fill-[primary-500] text-[primary-500]" />
                              </div>
                            </div>
                          </>
                        ) : img ? (
                          <Image src={img} alt={`${product.name} view ${idx + 1}`} width={128} height={128} className="h-full w-full object-contain" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-400">{product.category}</p>
              <h1 className="mb-4 text-5xl font-black text-slate-900">{product.name}</h1>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-600">(127 reviews)</span>
              </div>
              <p className="text-lg leading-relaxed text-slate-600">{product.description}</p>
            </div>

            {/* Price */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-baseline gap-3">
                <span className="text-5xl font-black text-slate-900">${product.price}</span>
                <span className="text-lg font-bold text-slate-400">WHOLESALE</span>
              </div>
              <p className="text-sm text-slate-600">Bulk pricing available for orders of 5+ units</p>
            </div>

            {/* Specifications */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-black text-slate-900">Specifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="font-semibold text-slate-600">Size</span>
                  <span className="font-bold text-slate-900">{product.size}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="font-semibold text-slate-600">Age Range</span>
                  <span className="font-bold text-slate-900">{product.ageRange}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="font-semibold text-slate-600">Material</span>
                  <span className="font-bold text-slate-900">18oz PVC Vinyl</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="font-semibold text-slate-600">Weight Capacity</span>
                  <span className="font-bold text-slate-900">800 lbs</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-600">Setup Time</span>
                  <span className="font-bold text-slate-900">10-15 minutes</span>
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-700">Quantity:</label>
                <div className="flex items-center rounded-xl border-2 border-slate-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 border-x-2 border-slate-300 py-2 text-center font-bold text-slate-900 outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 font-bold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-4 font-black uppercase tracking-wide text-white shadow-lg transition-all hover:bg-primary-600 hover:-translate-y-1 hover:shadow-xl active:scale-95"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
                <button className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-4 font-black uppercase tracking-wide text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white">
                  Request Quote
                </button>
              </div>

              <div className="flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-all hover:border-red-500 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                  Save
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-all hover:border-[primary-500] hover:text-[primary-500]">
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">Commercial Grade</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">2-Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-primary-100 p-3">
                  <Truck className="h-6 w-6 text-primary-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">Fast Shipping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Details Tabs */}
        <div className="mt-16 space-y-8">
          {/* Description Section */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-10 shadow-lg">
            <h2 className="mb-6 text-4xl font-black text-slate-900">Product Description</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg leading-relaxed text-slate-700">
                The <strong className="text-slate-900">{product.name}</strong> is the ultimate addition to your commercial inflatable inventory. Designed with both fun and profitability in mind, this premium water slide delivers an unforgettable experience that will keep your customers coming back for more.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-700">
                Built with commercial-grade 18oz PVC vinyl, this inflatable is engineered to withstand the rigors of daily rental use. The vibrant, eye-catching design features a stunning rainbow color scheme that appeals to a wide range of age groups, making it perfect for birthday parties, school events, corporate gatherings, and community festivals.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-700">
                The dual-lane design promotes friendly competition while maximizing throughput - more riders per hour means higher rental revenue for your business. The integrated splash pool at the bottom provides a refreshing landing zone and extends play value, while reinforced safety netting and secure entrance ramps ensure peace of mind for operators and parents alike.
              </p>
              
              <div className="mt-8 rounded-xl bg-gradient-to-r from-primary-500/10 to-primary-100 p-6 border-l-4 border-primary-500">
                <h4 className="mb-2 text-xl font-black text-slate-900">Why Rental Businesses Love This Product</h4>
                <p className="text-slate-700">
                  With typical rental rates of $300-500 per day and an average of 15-20 bookings per season, this inflatable can generate $4,500-10,000 annually - providing a complete return on investment within the first year. Its universal appeal and striking appearance make it one of the most requested items in any rental fleet.
                </p>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-lg">
            <h2 className="mb-6 text-3xl font-black text-slate-900">What&apos;s Included</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-600" />
                <div>
                  <h4 className="font-bold text-slate-900">Complete Inflatable Unit</h4>
                  <p className="text-sm text-slate-600">Fully assembled and ready for inflation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-600" />
                <div>
                  <h4 className="font-bold text-slate-900">Heavy-Duty Storage Bag</h4>
                  <p className="text-sm text-slate-600">Weather-resistant carrying case with handles</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-600" />
                <div>
                  <h4 className="font-bold text-slate-900">Ground Stakes & Tethers</h4>
                  <p className="text-sm text-slate-600">Professional-grade anchoring system</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-600" />
                <div>
                  <h4 className="font-bold text-slate-900">Repair Kit</h4>
                  <p className="text-sm text-slate-600">Vinyl patches and adhesive for minor repairs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-600" />
                <div>
                  <h4 className="font-bold text-slate-900">Setup Instructions</h4>
                  <p className="text-sm text-slate-600">Detailed manual with safety guidelines</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-green-600" />
                <div>
                  <h4 className="font-bold text-slate-900">2-Year Warranty</h4>
                  <p className="text-sm text-slate-600">Full manufacturer coverage included</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 rounded-xl bg-blue-50 p-6 border border-blue-200">
              <p className="text-sm font-semibold text-blue-900">
                <strong>Note:</strong> Blower not included. We recommend a 1.5HP commercial blower (available separately). See our recommended equipment section for compatible blowers and accessories.
              </p>
            </div>
          </div>

          {/* Features & Benefits */}
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-lg">
            <h2 className="mb-6 text-3xl font-black text-slate-900">Features & Benefits</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200">
                  <CheckCircle2 className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900">Commercial-Grade Material</h4>
                  <p className="text-sm leading-relaxed text-slate-600">Constructed with 18oz PVC vinyl for maximum durability and longevity in commercial use. Triple-stitched seams and reinforced stress points.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                  <Shield className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900">Safety First Design</h4>
                  <p className="text-sm leading-relaxed text-slate-600">Features reinforced netting, safety ramps, non-slip climbing surfaces, and meets all ASTM F2374 safety standards.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200">
                  <CheckCircle2 className="h-6 w-6 text-primary-700" />
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900">Quick Setup & Takedown</h4>
                  <p className="text-sm leading-relaxed text-slate-600">Easy inflation system allows for setup in 10-15 minutes. Deflates and packs away in under 20 minutes for efficient event turnaround.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200">
                  <Star className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900">High Profit Potential</h4>
                  <p className="text-sm leading-relaxed text-slate-600">Premium rental rates ($300-500/day) and durable construction ensure excellent ROI. Popular year-round in warm climates.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-pink-200">
                  <Heart className="h-6 w-6 text-pink-700" />
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900">Eye-Catching Design</h4>
                  <p className="text-sm leading-relaxed text-slate-600">Vibrant rainbow colors and modern styling attract attention and bookings. Perfect for social media marketing.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-teal-200">
                  <CheckCircle2 className="h-6 w-6 text-teal-700" />
                </div>
                <div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900">Easy Maintenance</h4>
                  <p className="text-sm leading-relaxed text-slate-600">Smooth vinyl surface cleans easily with mild soap and water. UV-resistant materials prevent fading and degradation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-lg">
            <h2 className="mb-6 text-3xl font-black text-slate-900">Technical Specifications</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-xl font-bold text-slate-900">Dimensions & Capacity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-600">Inflated Size</span>
                    <span className="font-bold text-slate-900">{product.size} ft</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-600">Height</span>
                    <span className="font-bold text-slate-900">14 ft</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-600">Weight Capacity</span>
                    <span className="font-bold text-slate-900">800 lbs</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-600">Max Users</span>
                    <span className="font-bold text-slate-900">6-8 Children</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">Product Weight</span>
                    <span className="font-bold text-slate-900">185 lbs</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-xl font-bold text-slate-900">Materials & Requirements</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-600">Material</span>
                    <span className="font-bold text-slate-900">18oz PVC Vinyl</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-600">Blower Required</span>
                    <span className="font-bold text-slate-900">1.5 HP</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-600">Power</span>
                    <span className="font-bold text-slate-900">110V (15A Circuit)</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-600">Setup Time</span>
                    <span className="font-bold text-slate-900">10-15 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-600">Age Range</span>
                    <span className="font-bold text-slate-900">{product.ageRange} years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Returns */}
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-primary-100 p-3">
                  <Truck className="h-6 w-6 text-[primary-500]" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Shipping Info</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <p><strong className="text-slate-900">Free Shipping:</strong> On orders over $500 within the continental US</p>
                <p><strong className="text-slate-900">Processing Time:</strong> Ships within 2-3 business days</p>
                <p><strong className="text-slate-900">Delivery Time:</strong> 5-7 business days via freight carrier</p>
                <p><strong className="text-slate-900">International:</strong> Contact us for international shipping rates</p>
                <p className="pt-2 text-xs italic">* Expedited shipping available at checkout</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Warranty & Returns</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <p><strong className="text-slate-900">2-Year Warranty:</strong> Covers manufacturing defects and material issues</p>
                <p><strong className="text-slate-900">30-Day Returns:</strong> Return unused products within 30 days</p>
                <p><strong className="text-slate-900">Customer Support:</strong> Dedicated B2B support team available</p>
                <p><strong className="text-slate-900">Extended Warranty:</strong> Optional 5-year coverage available</p>
                <p className="pt-2 text-xs italic">* See full warranty terms for details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 text-3xl font-black text-slate-900">Similar Products</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}