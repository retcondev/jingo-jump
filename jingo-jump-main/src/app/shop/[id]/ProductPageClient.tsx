"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Truck,
  Shield,
  Star,
  Box,
  Image as ImageIcon,
  Play,
  Users,
  Zap,
  Award,
} from "lucide-react";
import { mockProducts } from "~/data/mockProducts";
import { ProductCard } from "~/app/_components/shop/ProductCard";
import { ModelViewer } from "~/app/_components/shop/ModelViewer";
import { useCart } from "~/context/CartContext";
import { api } from "~/trpc/react";
import { parseBadge, type Product } from "~/types/product";

interface ProductPageClientProps {
  initialProduct: Product | null;
  slug: string;
}

export default function ProductPageClient({
  initialProduct,
  slug,
}: ProductPageClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewMode, setViewMode] = useState<"images" | "3d">("images");
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const { addToCart } = useCart();

  // Use initial product from server, or fetch client-side for mock data fallback
  const product: Product | null = initialProduct ?? (() => {
    // Check if it's a numeric ID for mock data
    const isNumericId = /^\d+$/.test(slug);
    if (isNumericId) {
      const numericId = parseInt(slug);
      return mockProducts.find((p) => p.id === numericId) ?? null;
    }
    // Try to find by matching name/slug in mock data
    const slugMatch = mockProducts.find(
      (p) =>
        p.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
    );
    return slugMatch ?? null;
  })();

  // Get related products from database if we have a DB product
  const { data: relatedFromDb } = api.products.getRelated.useQuery(
    {
      productId: typeof product?.id === "string" ? product.id : "",
      category: product?.category ?? "",
      limit: 4,
    },
    { enabled: !!product && typeof product.id === "string" }
  );

  // Fallback related products from mock data
  const relatedProducts: Product[] = relatedFromDb
    ? relatedFromDb.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.categoryRelation?.name ?? "",
        description: p.description ?? "",
        price: p.price,
        image: p.images[0]?.url,
        gradient: p.gradient,
        badge: parseBadge(p.badge),
        size: p.size,
        ageRange: p.ageRange,
        slug: p.slug,
      }))
    : mockProducts
        .filter((p) => p.category === product?.category && p.id !== product?.id)
        .slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link
          href="/shop"
          className="text-primary-500 hover:text-primary-600 underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  // Build image gallery - use images array if available, otherwise use single image
  const productImages: string[] = product.images?.length
    ? [...product.images.map((img) => img.url), "video"]
    : product.image
      ? [product.image, product.image, product.image, "video"]
      : ["video"];

  const has3DModel =
    product.id === 1 || product.slug === "rainbow-rush-water-slide";

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-neutral-50">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 xl:px-12 mt-20 lg:mt-[140px]">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-semibold text-neutral-500">
          <Link href="/" className="transition-colors hover:text-primary-500">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href="/shop"
            className="transition-colors hover:text-primary-500"
          >
            Shop
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href="/shop"
            className="transition-colors hover:text-primary-500"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-neutral-900">{product.name}</span>
        </nav>

        {/* Product Section - Improved 60/40 Layout */}
        <div className="grid gap-12 lg:grid-cols-[1fr_580px]">
          {/* Left Column - Images/3D - Sticky on Desktop */}
          <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            {/* View Mode Toggle */}
            {has3DModel && (
              <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-md border border-neutral-200">
                <button
                  onClick={() => setViewMode("images")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all ${
                    viewMode === "images"
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-transparent text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <ImageIcon className="h-5 w-5" />
                  Images
                </button>
                <button
                  onClick={() => setViewMode("3d")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all ${
                    viewMode === "3d"
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-transparent text-neutral-600 hover:bg-neutral-50"
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
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
                  {productImages[selectedImage] === "video" ? (
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
                    <div className="relative flex h-[500px] items-center justify-center p-8 bg-white">
                      {product.badge && (
                        <span
                          className={`absolute left-6 top-6 z-10 rounded-full px-5 py-2 text-sm font-black uppercase tracking-wide text-white shadow-lg ${
                            product.badge === "NEW"
                              ? "bg-accent-purple-500"
                              : product.badge === "POPULAR"
                                ? "bg-info-500"
                                : "bg-error-500"
                          }`}
                        >
                          {product.badge}
                        </span>
                      )}
                      {productImages[selectedImage] && (
                        <Image
                          src={productImages[selectedImage]}
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
                        selectedImage === idx
                          ? "border-primary-500"
                          : "border-neutral-200 hover:border-neutral-300"
                      } ${img === "video" ? "bg-neutral-800" : "bg-white"}`}
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
                                <Play className="h-6 w-6 fill-primary-500 text-primary-500" />
                              </div>
                            </div>
                          </>
                        ) : img ? (
                          <Image
                            src={img}
                            alt={`${product.name} view ${idx + 1}`}
                            width={128}
                            height={128}
                            className="h-full w-full object-contain"
                          />
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-5">
            {/* Category */}
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {product.category}
            </p>

            {/* Title */}
            <h1 className="text-3xl font-black leading-tight text-slate-900">
              {product.name}
            </h1>

            {/* Reviews */}
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-700">4.9</span>
              <span className="text-slate-400">(127 reviews)</span>
            </div>

            {/* Stock Indicator */}
            {(product.stockQuantity ?? 0) > 0 && (product.stockQuantity ?? 0) <= 10 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-warning-700">Only {product.stockQuantity} left</span>
                  <span className="text-slate-400">Selling fast</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-warning-100">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-warning-500 to-warning-600 transition-all"
                    style={{ width: `${((product.stockQuantity ?? 0) / 10) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-success-500"></span>
                <span className="font-medium text-success-600">In Stock</span>
              </div>
            )}

            {/* Price - Clean & Simple */}
            <div className="border-y border-slate-100 py-5">
              {product.salePrice ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-slate-900">
                    ${product.salePrice.toLocaleString()}
                  </span>
                  <span className="text-lg text-slate-400 line-through">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    Save ${(product.price - product.salePrice).toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-black text-slate-900">
                  ${product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>

            {/* Specs - Inline text, not cards */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {product.size && (
                <div><span className="text-slate-400">Size:</span> <span className="font-semibold text-slate-700">{product.size}</span></div>
              )}
              {product.riders && (
                <div><span className="text-slate-400">Capacity:</span> <span className="font-semibold text-slate-700">{product.riders} riders</span></div>
              )}
              {product.weight && (
                <div><span className="text-slate-400">Weight:</span> <span className="font-semibold text-slate-700">{product.weight} lbs</span></div>
              )}
              {product.blowers && (
                <div><span className="text-slate-400">Blowers:</span> <span className="font-semibold text-slate-700">{product.blowers}</span></div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-slate-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-lg font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-12 py-2 text-center font-semibold text-slate-900 outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-lg font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 rounded-xl bg-primary-500 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                >
                  Add to Cart
                </button>
              </div>

              <button className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                Request Quote
              </button>
            </div>

            {/* Trust Row */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-primary-50 py-3 text-center">
                <Truck className="h-5 w-5 text-primary-500" />
                <span className="text-xs font-semibold text-slate-700">Free Shipping</span>
                <span className="text-[10px] text-slate-500">Orders $500+</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-primary-50 py-3 text-center">
                <Shield className="h-5 w-5 text-primary-500" />
                <span className="text-xs font-semibold text-slate-700">{product.warranty ?? "Warranty"}</span>
                <span className="text-[10px] text-slate-500">Full Coverage</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-primary-50 py-3 text-center">
                <Award className="h-5 w-5 text-primary-500" />
                <span className="text-xs font-semibold text-slate-700">Certified</span>
                <span className="text-[10px] text-slate-500">ASTM & CPSC</span>
              </div>
            </div>

            {/* More Details Link */}
            <button
              onClick={() => setShowAllSpecs(!showAllSpecs)}
              className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              {showAllSpecs ? "Hide" : "View all"} specifications
              <ChevronDown className={`h-4 w-4 transition-transform ${showAllSpecs ? "rotate-180" : ""}`} />
            </button>

            {showAllSpecs && (
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {product.size && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Size</span>
                      <span className="font-medium text-slate-900">{product.size}</span>
                    </div>
                  )}
                  {product.riders && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Capacity</span>
                      <span className="font-medium text-slate-900">{product.riders} riders</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Weight</span>
                      <span className="font-medium text-slate-900">{product.weight} lbs</span>
                    </div>
                  )}
                  {product.blowers && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Blowers</span>
                      <span className="font-medium text-slate-900">{product.blowers}</span>
                    </div>
                  )}
                  {product.operators && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Operators</span>
                      <span className="font-medium text-slate-900">{product.operators}</span>
                    </div>
                  )}
                  {product.modelNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Model #</span>
                      <span className="font-medium text-slate-900">{product.modelNumber}</span>
                    </div>
                  )}
                  {product.warranty && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Warranty</span>
                      <span className="font-medium text-slate-900">{product.warranty}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description & Details */}
        <div className="mt-16 space-y-6">
          {/* Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="mb-6 text-3xl font-bold text-slate-900">
              Product Description
            </h2>
            <div className="prose max-w-none">
              {product.description ? (
                <p className="text-base leading-relaxed text-slate-600">
                  {product.description}
                </p>
              ) : (
                <>
                  <p className="text-base leading-relaxed text-slate-600">
                    The <strong className="text-slate-900">{product.name}</strong>{" "}
                    is the ultimate addition to your commercial inflatable
                    inventory. Designed with both fun and profitability in mind,
                    this premium inflatable delivers an unforgettable experience
                    that will keep your customers coming back for more.
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    Built with commercial-grade 18oz PVC vinyl, this inflatable is
                    engineered to withstand the rigors of daily rental use. The
                    vibrant, eye-catching design appeals to a wide range of age
                    groups, making it perfect for birthday parties, school events,
                    corporate gatherings, and community festivals.
                  </p>
                </>
              )}
            </div>

            {/* Key Features */}
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-primary-50 p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                  <CheckCircle2 className="h-5 w-5 text-primary-500" />
                </div>
                <p className="text-sm font-bold text-slate-900">Commercial Grade</p>
                <p className="text-xs text-slate-500">18oz PVC Vinyl</p>
              </div>
              <div className="rounded-xl bg-primary-50 p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                  <Shield className="h-5 w-5 text-primary-500" />
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {product.warranty ?? "Warranty Included"}
                </p>
                <p className="text-xs text-slate-500">Full Coverage</p>
              </div>
              <div className="rounded-xl bg-primary-50 p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                  <Award className="h-5 w-5 text-primary-500" />
                </div>
                <p className="text-sm font-bold text-slate-900">Lead-Free</p>
                <p className="text-xs text-slate-500">Safety Certified</p>
              </div>
              <div className="rounded-xl bg-primary-50 p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                  <Star className="h-5 w-5 text-primary-500" />
                </div>
                <p className="text-sm font-bold text-slate-900">Fire Retardant</p>
                <p className="text-xs text-slate-500">ASTM Compliant</p>
              </div>
            </div>
          </div>

          {/* Shipping, Warranty & Business Info - 3 Column Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Shipping Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Truck className="h-5 w-5 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Shipping</h3>
              </div>
              <div className="space-y-2.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span><strong className="text-slate-900">Free Shipping</strong> on orders $500+</span>
                </div>
                {product.weight && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                    <span>Product Weight: <strong className="text-slate-900">{product.weight} lbs</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Ships in <strong className="text-slate-900">2-3 business days</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Delivery via <strong className="text-slate-900">freight carrier</strong></span>
                </div>
              </div>
            </div>

            {/* Warranty */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Shield className="h-5 w-5 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Warranty</h3>
              </div>
              {product.warranty && (
                <div className="mb-4 rounded-lg bg-primary-50 px-4 py-2">
                  <p className="text-center text-lg font-bold text-primary-700">
                    {product.warranty} Coverage
                  </p>
                </div>
              )}
              <div className="space-y-2.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Covers <strong className="text-slate-900">manufacturing defects</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span><strong className="text-slate-900">30-day returns</strong> on unused items</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span><strong className="text-slate-900">Free repair kit</strong> included</span>
                </div>
              </div>
            </div>

            {/* ROI Potential */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Zap className="h-5 w-5 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">ROI Potential</h3>
              </div>
              <div className="mb-4 rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">Avg. Rental Price</p>
                <p className="text-2xl font-black text-slate-900">$200-400/day</p>
              </div>
              <div className="space-y-2.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span>Pay off in <strong className="text-slate-900">5-10 rentals</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span><strong className="text-slate-900">High demand</strong> for events</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-500" />
                  <span><strong className="text-slate-900">Year-round</strong> rental potential</span>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Jingo Jump */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h3 className="mb-6 text-center text-2xl font-bold text-slate-900">Why Choose Jingo Jump?</h3>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <Award className="h-6 w-6 text-primary-500" />
                </div>
                <p className="font-bold text-slate-900">20+ Years</p>
                <p className="text-sm text-slate-500">Industry Experience</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <Users className="h-6 w-6 text-primary-500" />
                </div>
                <p className="font-bold text-slate-900">10,000+</p>
                <p className="text-sm text-slate-500">Happy Customers</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <Truck className="h-6 w-6 text-primary-500" />
                </div>
                <p className="font-bold text-slate-900">USA Based</p>
                <p className="text-sm text-slate-500">Fast Shipping</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <Shield className="h-6 w-6 text-primary-500" />
                </div>
                <p className="font-bold text-slate-900">ASTM & CPSC</p>
                <p className="text-sm text-slate-500">Safety Certified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 text-3xl font-black text-neutral-900">
              Similar Products
            </h2>
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
