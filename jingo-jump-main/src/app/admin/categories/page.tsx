"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "~/trpc/react";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Star,
  FolderOpen,
  Package,
} from "lucide-react";
import {
  Button,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "~/components/ui";

export default function CategoriesPage() {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const { data: categories, isLoading, refetch } = api.adminCategories.list.useQuery();

  const deleteCategory = api.adminCategories.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const toggleFeatured = api.adminCategories.toggleFeatured.useMutation({
    onSuccess: () => refetch(),
  });

  const reorderCategories = api.adminCategories.reorder.useMutation({
    onSuccess: () => refetch(),
  });

  const handleDelete = async (id: string, name: string, productCount: number) => {
    if (productCount > 0) {
      alert(`Cannot delete "${name}" because it has ${productCount} product(s). Reassign products first.`);
      return;
    }
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteCategory.mutateAsync({ id });
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !categories) return;
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !categories) return;

    const draggedIndex = categories.findIndex((c) => c.id === draggedId);
    const targetIndex = categories.findIndex((c) => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedIndex, 1);
    if (removed) {
      newCategories.splice(targetIndex, 0, removed);
    }

    const reorderedCategories = newCategories.map((cat, index) => ({
      id: cat.id,
      position: index + 1,
    }));

    await reorderCategories.mutateAsync({ categories: reorderedCategories });
    setDraggedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product categories
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            Add Category
          </Button>
        </Link>
      </div>

      {/* Categories Table */}
      {isLoading ? (
        <Card className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative mx-auto h-12 w-12">
              <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500">Loading categories...</p>
          </div>
        </Card>
      ) : !categories?.length ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            <FolderOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first category.
          </p>
          <Link href="/admin/categories/new" className="mt-6">
            <Button icon={<Plus className="h-4 w-4" />}>
              Add Category
            </Button>
          </Link>
        </Card>
      ) : (
        <Card>
          <p className="mb-4 text-sm text-gray-500">
            Drag and drop to reorder categories. The order determines display priority on the storefront.
          </p>
          <Table>
            <TableHeader>
              <TableRow interactive={false}>
                <TableHead className="w-12"></TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  draggable
                  onDragStart={() => handleDragStart(category.id)}
                  onDragOver={(e) => handleDragOver(e, category.id)}
                  onDrop={(e) => handleDrop(e, category.id)}
                  className={draggedId === category.id ? "opacity-50" : ""}
                >
                  <TableCell>
                    <button className="cursor-grab text-gray-400 hover:text-gray-600">
                      <GripVertical className="h-5 w-5" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FolderOpen className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {category.name}
                        </p>
                        {category.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">
                    {category.slug}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {category._count.products}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleFeatured.mutate({ id: category.id })}
                      className={`rounded-lg p-2 transition-colors ${
                        category.featured
                          ? "bg-amber-100 text-amber-600"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                      title={category.featured ? "Remove from featured" : "Add to featured"}
                    >
                      <Star className={`h-4 w-4 ${category.featured ? "fill-current" : ""}`} />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id, category.name, category._count.products)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                        disabled={category._count.products > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
