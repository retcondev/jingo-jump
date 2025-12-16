"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "~/trpc/react";
import { ProductStatus } from "../../../../generated/prisma";
import {
  Save,
  ArrowLeft,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { Button, Card, CardTitle, Input, Textarea, Checkbox } from "~/components/ui";

interface ProductFormData {
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  costPrice: number | null;
  categoryId: string;
  subcategory: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  gradient: string | null;
  size: string | null;
  ageRange: string | null;
  weight: number | null;
  dimensions: string | null;
  status: ProductStatus;
  badge: string | null;
  featured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  initialData?: Partial<ProductFormData>;
  initialImages?: ProductImage[];
}

const defaultData: ProductFormData = {
  sku: "",
  name: "",
  slug: "",
  description: "",
  price: 0,
  salePrice: null,
  costPrice: null,
  categoryId: "",
  subcategory: null,
  stockQuantity: 0,
  lowStockThreshold: 5,
  trackInventory: true,
  gradient: null,
  size: null,
  ageRange: null,
  weight: null,
  dimensions: null,
  status: ProductStatus.DRAFT,
  badge: null,
  featured: false,
  metaTitle: null,
  metaDescription: null,
};

const sizes = [
  "Small (Under 15ft)",
  "Medium (15-20ft)",
  "Large (20-30ft)",
  "Extra Large (30ft+)",
];

const ageRanges = [
  "Toddlers (1-3)",
  "Kids (4-8)",
  "Tweens (9-12)",
  "Teens (13+)",
  "All Ages",
];

const badges = ["NEW", "POPULAR", "SALE", "BEST SELLER"];

export function ProductForm({
  mode,
  productId,
  initialData,
  initialImages = [],
}: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    ...defaultData,
    ...initialData,
  });
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories from database
  const { data: categories } = api.adminCategories.list.useQuery();

  const createProduct = api.adminProducts.create.useMutation({
    onSuccess: () => {
      router.push("/admin/products");
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const updateProduct = api.adminProducts.update.useMutation({
    onSuccess: () => {
      router.push("/admin/products");
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const addImage = api.adminProducts.addImage.useMutation();
  const deleteImage = api.adminProducts.deleteImage.useMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? value === "" ? null : Number(value)
          : value === "" ? null : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleImageUpload = useCallback(
    async (files: FileList) => {
      if (!productId && mode === "create") {
        setErrors((prev) => ({
          ...prev,
          images: "Save the product first to upload images",
        }));
        return;
      }

      setUploading(true);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });

      try {
        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("productId", productId!);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const data = (await response.json()) as { error?: string };
            throw new Error(data.error ?? "Upload failed");
          }

          const { url } = (await response.json()) as { url: string };

          const newImage = await addImage.mutateAsync({
            productId: productId!,
            url,
            alt: file.name,
          });

          setImages((prev) => [...prev, newImage]);
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          images: error instanceof Error ? error.message : "Upload failed",
        }));
      } finally {
        setUploading(false);
      }
    },
    [productId, mode, addImage]
  );

  const handleRemoveImage = async (imageId: string) => {
    try {
      await deleteImage.mutateAsync({ id: imageId });
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        images: error instanceof Error ? error.message : "Delete failed",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const data = {
      ...formData,
      description: formData.description ?? undefined,
      salePrice: formData.salePrice ?? undefined,
      costPrice: formData.costPrice ?? undefined,
      subcategory: formData.subcategory ?? undefined,
      gradient: formData.gradient ?? undefined,
      size: formData.size ?? undefined,
      ageRange: formData.ageRange ?? undefined,
      weight: formData.weight ?? undefined,
      dimensions: formData.dimensions ?? undefined,
      badge: formData.badge ?? undefined,
      metaTitle: formData.metaTitle ?? undefined,
      metaDescription: formData.metaDescription ?? undefined,
    };

    if (mode === "create") {
      await createProduct.mutateAsync(data);
    } else {
      await updateProduct.mutateAsync({ ...data, id: productId! });
    }
  };

  const isLoading = createProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl p-2.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === "create" ? "Add New Product" : "Edit Product"}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === "create"
                ? "Create a new product for your catalog"
                : "Update product details"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            icon={!isLoading ? <Save className="h-4 w-4" /> : undefined}
          >
            {mode === "create" ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </div>

      {errors.submit && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {errors.submit}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card>
            <CardTitle className="mb-6">Basic Information</CardTitle>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="SKU *"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  error={errors.sku}
                  placeholder="e.g., BH-001"
                />
                <Input
                  label="Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Product name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  URL Slug *
                </label>
                <div className="flex gap-2">
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    error={errors.slug}
                    placeholder="product-url-slug"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Generate
                  </Button>
                </div>
              </div>

              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Product description..."
              />
            </div>
          </Card>

          {/* Images */}
          <Card>
            <CardTitle className="mb-6">Images</CardTitle>
            {mode === "create" && (
              <p className="mb-4 text-sm font-medium text-amber-600">
                Save the product first to upload images.
              </p>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt ?? "Product"}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {mode === "edit" && (
                  <label
                    className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-500 ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-8 w-8" />
                        <span className="mt-2 text-xs font-medium">Add Image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading}
                      onChange={(e) =>
                        e.target.files && handleImageUpload(e.target.files)
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {errors.images && (
                <p className="text-sm font-medium text-red-500">{errors.images}</p>
              )}
            </div>
          </Card>

          {/* Pricing */}
          <Card>
            <CardTitle className="mb-6">Pricing</CardTitle>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-8 pr-3 text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                      errors.price ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Sale Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice ?? ""}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-8 pr-3 text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Cost Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice ?? ""}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-8 pr-3 text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Inventory */}
          <Card>
            <CardTitle className="mb-6">Inventory</CardTitle>
            <div className="space-y-4">
              <Checkbox
                name="trackInventory"
                checked={formData.trackInventory}
                onChange={handleChange}
                label="Track inventory"
              />
              {formData.trackInventory && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Stock Quantity"
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    min={0}
                  />
                  <Input
                    label="Low Stock Threshold"
                    type="number"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    min={0}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* SEO */}
          <Card>
            <CardTitle className="mb-6">SEO</CardTitle>
            <div className="space-y-4">
              <Input
                label="Meta Title"
                name="metaTitle"
                value={formData.metaTitle ?? ""}
                onChange={handleChange}
                placeholder="SEO title (defaults to product name)"
              />
              <Textarea
                label="Meta Description"
                name="metaDescription"
                value={formData.metaDescription ?? ""}
                onChange={handleChange}
                rows={3}
                placeholder="SEO description"
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardTitle className="mb-4">Status</CardTitle>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value={ProductStatus.DRAFT}>Draft</option>
              <option value={ProductStatus.ACTIVE}>Active</option>
              <option value={ProductStatus.ARCHIVED}>Archived</option>
            </select>
          </Card>

          {/* Organization */}
          <Card>
            <CardTitle className="mb-4">Organization</CardTitle>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.categoryId ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Select category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">{errors.categoryId}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Size
                </label>
                <select
                  name="size"
                  value={formData.size ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Select size</option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Age Range
                </label>
                <select
                  name="ageRange"
                  value={formData.ageRange ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Select age range</option>
                  {ageRanges.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Badge
                </label>
                <select
                  name="badge"
                  value={formData.badge ?? ""}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">No badge</option>
                  {badges.map((badge) => (
                    <option key={badge} value={badge}>
                      {badge}
                    </option>
                  ))}
                </select>
              </div>
              <Checkbox
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                label="Featured product"
              />
            </div>
          </Card>

          {/* Physical Details */}
          <Card>
            <CardTitle className="mb-4">Physical Details</CardTitle>
            <div className="space-y-4">
              <Input
                label="Weight (lbs)"
                type="number"
                name="weight"
                value={formData.weight ?? ""}
                onChange={handleChange}
                step={0.1}
                min={0}
                placeholder="0.0"
              />
              <Input
                label="Dimensions"
                name="dimensions"
                value={formData.dimensions ?? ""}
                onChange={handleChange}
                placeholder="e.g., 15' x 15' x 12'"
              />
              <Input
                label="Gradient (CSS)"
                name="gradient"
                value={formData.gradient ?? ""}
                onChange={handleChange}
                placeholder="e.g., from-pink-400 to-purple-500"
              />
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
