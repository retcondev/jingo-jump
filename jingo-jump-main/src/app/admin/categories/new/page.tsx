"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryForm from "../_components/CategoryForm";

export default function NewCategoryPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">New Category</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new product category
          </p>
        </div>
      </div>

      <CategoryForm />
    </div>
  );
}
