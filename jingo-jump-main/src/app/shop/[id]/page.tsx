import type { Metadata } from "next";
import { db } from "~/server/db";
import { ProductStatus } from "../../../../generated/prisma";
import ProductPageClient from "./ProductPageClient";
import { parseBadge, type Product } from "~/types/product";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Fetch product from database
async function getProduct(slug: string) {
  // Skip DB query for purely numeric IDs (legacy mock data)
  if (/^\d+$/.test(slug)) {
    return null;
  }

  const product = await db.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      status: ProductStatus.ACTIVE,
    },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
      categoryRelation: true,
    },
  });

  return product;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | Jingo Jump",
      description: "The requested product could not be found.",
    };
  }

  const title = product.metaTitle ?? `${product.name} | Jingo Jump`;
  const description =
    product.metaDescription ??
    product.description ??
    `Buy ${product.name} - Commercial grade inflatable from Jingo Jump. High quality PVC vinyl construction with warranty.`;

  const imageUrl = product.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const dbProduct = await getProduct(id);

  // Convert DB product to Product type for client component
  const initialProduct: Product | null = dbProduct
    ? {
        id: dbProduct.id,
        name: dbProduct.name,
        category: dbProduct.categoryRelation?.name ?? "",
        description: dbProduct.description ?? "",
        price: dbProduct.price,
        image: dbProduct.images[0]?.url,
        gradient: dbProduct.gradient,
        badge: parseBadge(dbProduct.badge),
        size: dbProduct.size,
        ageRange: dbProduct.ageRange,
        slug: dbProduct.slug,
        salePrice: dbProduct.salePrice,
        images: dbProduct.images,
        weight: dbProduct.weight,
        dimensions: dbProduct.dimensions,
        stockQuantity: dbProduct.stockQuantity,
        metaTitle: dbProduct.metaTitle,
        metaDescription: dbProduct.metaDescription,
        
        // ============ PRODUCT SPECIFICATIONS ============
        // Common specs
        modelNumber: dbProduct.modelNumber,
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
        // ============ END SPECIFICATIONS ============
      }
    : null;

  return <ProductPageClient initialProduct={initialProduct} slug={id} />;
}
