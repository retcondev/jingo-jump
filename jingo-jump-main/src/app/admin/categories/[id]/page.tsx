"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import CategoryForm from "../_components/CategoryForm";
import { Card } from "~/components/ui";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: category, isLoading, error } = api.adminCategories.get.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <Card className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-900">Category not found</h2>
        <p className="mt-2 text-gray-500">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/admin/categories"
          className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
        >
          Back to categories
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update {category.name}
          </p>
        </div>
      </div>

      <CategoryForm category={category} />
    </div>
  );
}
