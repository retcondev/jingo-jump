import { z } from "zod";
import { type Prisma } from "../../generated/prisma";

// Badge schema for safe validation
export const BadgeSchema = z.enum(["NEW", "POPULAR", "SALE"]);
export type Badge = z.infer<typeof BadgeSchema>;

// Helper to safely parse badge values from database
export function parseBadge(value: unknown): Badge | null {
  const result = BadgeSchema.safeParse(value);
  return result.success ? result.data : null;
}

// Product type compatible with both mock data and database
export interface Product {
  id: number | string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  gradient?: string | null;
  badge?: Badge | null;
  slug?: string;
  salePrice?: number | null;
  images?: Array<{ id: string; url: string; alt?: string | null }>;

  // ============ PRODUCT SPECIFICATIONS ============
  // Common specs (all product types)
  modelNumber?: string | null;
  size?: string | null;
  weight?: number | null;
  warranty?: string | null;

  // Inflatable specs (bouncers, slides, combos, obstacle courses)
  pieces?: number | null;
  blowers?: number | null;
  operators?: number | null;
  riders?: string | null;
  indoor?: boolean | null;
  outdoor?: boolean | null;

  // Motor/Blower specs
  power?: string | null;
  voltage?: string | null;
  frequency?: string | null;
  phase?: string | null;
  rpm?: number | null;
  amps?: number | null;

  // Legacy fields (backward compatibility)
  ageRange?: string | null;
  dimensions?: string | null;
  // ============ END SPECIFICATIONS ============

  // Other fields
  stockQuantity?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

// Database product type derived from Prisma schema with images relation
export type DBProduct = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

// Helper to convert DB product to Product for components
export function dbProductToProduct(dbProduct: DBProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category ?? "Uncategorized",
    description: dbProduct.description ?? "",
    price: dbProduct.price,
    image: dbProduct.images[0]?.url,
    gradient: dbProduct.gradient,
    badge: parseBadge(dbProduct.badge),
    slug: dbProduct.slug,
    salePrice: dbProduct.salePrice,
    images: dbProduct.images,

    // ============ PRODUCT SPECIFICATIONS ============
    // Common specs
    modelNumber: dbProduct.modelNumber,
    size: dbProduct.size,
    weight: dbProduct.weight,
    warranty: dbProduct.warranty,

    // Inflatable specs
    pieces: dbProduct.pieces,
    blowers: dbProduct.blowers,
    operators: dbProduct.operators,
    riders: dbProduct.riders,
    indoor: dbProduct.indoor,
    outdoor: dbProduct.outdoor,

    // Motor/Blower specs
    power: dbProduct.power,
    voltage: dbProduct.voltage,
    frequency: dbProduct.frequency,
    phase: dbProduct.phase,
    rpm: dbProduct.rpm,
    amps: dbProduct.amps,

    // Legacy fields
    ageRange: dbProduct.ageRange,
    dimensions: dbProduct.dimensions,
    // ============ END SPECIFICATIONS ============

    stockQuantity: dbProduct.stockQuantity,
    metaTitle: dbProduct.metaTitle,
    metaDescription: dbProduct.metaDescription,
  };
}

export interface FilterOptions {
  categories: Array<{ id: string; label: string; count: number }>;
  sizes: Array<{ id: string; label: string; count: number }>;
  ageRanges: Array<{ id: string; label: string; count: number }>;
  priceRange: {
    min: number;
    max: number;
  };
}

// Helper function to categorize product size into Small, Medium, or Large
export function categorizeSizeFromDimensions(sizeString: string | null | undefined): "small" | "medium" | "large" | null {
  if (!sizeString) return null;

  // Extract dimensions from string like "15' H x 15' L x 15' W"
  const regex = /(\d+)'\s*H\s*x\s*(\d+)'\s*L\s*x\s*(\d+)'\s*W/i;
  const matches = regex.exec(sizeString);
  if (!matches) return null;

  const height = parseInt(matches[1] ?? "0");
  const length = parseInt(matches[2] ?? "0");
  const width = parseInt(matches[3] ?? "0");

  // Calculate volume or use max dimension to categorize
  const maxDimension = Math.max(height, length, width);
  const volume = height * length * width;

  // Small: Max dimension <= 15' or volume <= 3000
  if (maxDimension <= 15 || volume <= 3000) {
    return "small";
  }

  // Large: Max dimension >= 25' or volume >= 8000
  if (maxDimension >= 25 || volume >= 8000) {
    return "large";
  }

  // Medium: Everything in between
  return "medium";
}
