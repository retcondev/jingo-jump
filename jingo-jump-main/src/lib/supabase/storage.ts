import { createClient } from "./server";

const BUCKET_NAME = "product-images";

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return { error: error.message };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return { url: publicUrl, path: data.path };
}

export async function deleteProductImage(
  path: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    console.error("Delete error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function listProductImages(
  productId: string
): Promise<{ files: string[]; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(productId);

  if (error) {
    console.error("List error:", error);
    return { files: [], error: error.message };
  }

  const files =
    data?.map((file) => {
      const {
        data: { publicUrl },
      } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${productId}/${file.name}`);
      return publicUrl;
    }) ?? [];

  return { files };
}

export function getPublicUrl(path: string): string {
  // Construct the public URL directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}
