"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "~/trpc/react";
import {
  Plus,
  Search,
  Upload,
  Pencil,
  Trash2,
  Eye,
  Package,
} from "lucide-react";
import type { ProductStatus } from "../../../../generated/prisma";
import {
  Button,
  Card,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "~/components/ui";

const statusVariants: Record<ProductStatus, "success" | "default" | "error"> = {
  ACTIVE: "success",
  DRAFT: "default",
  ARCHIVED: "error",
};

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [categoryId, setCategoryId] = useState("");

  const { data, isLoading, refetch } = api.adminProducts.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    status: status || undefined,
    categoryId: categoryId || undefined,
  });

  const { data: categories } = api.adminCategories.list.useQuery();

  const deleteProduct = api.adminProducts.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProduct.mutateAsync({ id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/import">
            <Button variant="outline" icon={<Upload className="h-4 w-4" />}>
              Import
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button icon={<Plus className="h-4 w-4" />}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ProductStatus | "");
              setPage(1);
            }}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Products Table */}
      {isLoading ? (
        <Card className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative mx-auto h-12 w-12">
              <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
              <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500">Loading products...</p>
          </div>
        </Card>
      ) : !data?.products.length ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first product.
          </p>
          <Link href="/admin/products/new" className="mt-6">
            <Button icon={<Plus className="h-4 w-4" />}>
              Add Product
            </Button>
          </Link>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow interactive={false}>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.name}
                      </p>
                      {product.badge && (
                        <Badge variant="pink" size="sm" className="mt-1">
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {product.sku}
                </TableCell>
                <TableCell>{product.categoryRelation?.name ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.salePrice && (
                      <span className="text-sm text-red-500 line-through">
                        ${product.salePrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-semibold ${
                      product.stockQuantity <= (product.lowStockThreshold ?? 5)
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {product.stockQuantity}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[product.status]}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/shop/${product.slug}`}
                      target="_blank"
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * 20 + 1} to{" "}
            {Math.min(page * 20, data.pagination.total)} of{" "}
            {data.pagination.total} products
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
