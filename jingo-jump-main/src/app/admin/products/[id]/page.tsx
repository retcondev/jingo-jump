"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { ProductForm } from "../../_components/ProductForm";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const { data: product, isLoading, error } = api.adminProducts.get.useQuery({
    id: productId,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <p className="text-lg font-medium text-slate-900">Product not found</p>
        <p className="mt-1 text-sm text-slate-500">
          The product you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      productId={productId}
      initialData={{
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        price: product.price,
        salePrice: product.salePrice,
        costPrice: product.costPrice,
        categoryId: product.categoryId ?? "",
        subcategory: product.subcategory,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold ?? 5,
        trackInventory: product.trackInventory,
        gradient: product.gradient,
        size: product.size,
        ageRange: product.ageRange,
        weight: product.weight,
        dimensions: product.dimensions,
        status: product.status,
        badge: product.badge,
        featured: product.featured,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
      }}
      initialImages={product.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        position: img.position,
      }))}
    />
  );
}
