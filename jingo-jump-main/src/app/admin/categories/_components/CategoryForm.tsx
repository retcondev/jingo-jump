"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "~/trpc/react";
import { Upload, X, Loader2 } from "lucide-react";
import {
  Button,
  Card,
  Input,
  Textarea,
  Checkbox,
} from "~/components/ui";

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    position: number;
    featured: boolean;
  };
}

interface UploadResponse {
  url: string;
  path: string;
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!category;

  const [formData, setFormData] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    image: category?.image ?? "",
    position: category?.position ?? 0,
    featured: category?.featured ?? false,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const utils = api.useUtils();

  const createCategory = api.adminCategories.create.useMutation({
    onSuccess: () => {
      void utils.adminCategories.list.invalidate();
      router.push("/admin/categories");
    },
    onError: (error) => {
      const message = error.message;
      if (message.includes("name")) {
        setErrors({ name: message });
      } else if (message.includes("slug")) {
        setErrors({ slug: message });
      } else {
        setErrors({ submit: message });
      }
    },
  });

  const updateCategory = api.adminCategories.update.useMutation({
    onSuccess: () => {
      void utils.adminCategories.list.invalidate();
      router.push("/admin/categories");
    },
    onError: (error) => {
      const message = error.message;
      if (message.includes("name")) {
        setErrors({ name: message });
      } else if (message.includes("slug")) {
        setErrors({ slug: message });
      } else {
        setErrors({ submit: message });
      }
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("productId", "categories");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = (await response.json()) as UploadResponse;
      setFormData((prev) => ({ ...prev, image: data.url }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || null,
      image: formData.image || null,
      position: formData.position,
      featured: formData.featured,
    };

    if (isEditing && category) {
      await updateCategory.mutateAsync({ id: category.id, ...data });
    } else {
      await createCategory.mutateAsync(data);
    }
  };

  const isLoading = createCategory.isPending ?? updateCategory.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Category Details</h2>

            <div className="space-y-4">
              <Input
                label="Category Name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                error={errors.name}
                placeholder="e.g., Bounce Houses"
                required
              />

              <div>
                <Input
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  error={errors.slug}
                  placeholder="e.g., bounce-houses"
                  required
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  URL-friendly identifier. Auto-generated from name.
                </p>
              </div>

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this category..."
                rows={4}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Category Image</h2>

            {formData.image ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={formData.image}
                  alt="Category image"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">
                      Click to upload
                    </span>
                  </>
                )}
              </label>
            )}
          </Card>

          {/* Settings */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Settings</h2>

            <div className="space-y-4">
              <div>
                <Input
                  label="Display Position"
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData((prev) => ({ ...prev, position: parseInt(e.target.value) || 0 }))}
                  min={0}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Lower numbers appear first
                </p>
              </div>

              <div>
                <Checkbox
                  label="Featured Category"
                  checked={formData.featured}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Featured categories are highlighted on the homepage
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/categories")}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {isEditing ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
