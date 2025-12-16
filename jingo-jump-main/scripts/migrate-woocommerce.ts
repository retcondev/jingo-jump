/**
 * WooCommerce to Prisma/Supabase Migration Script
 *
 * Usage:
 *   pnpm tsx scripts/migrate-woocommerce.ts --test     # Test with 5 products
 *   pnpm tsx scripts/migrate-woocommerce.ts --full     # Full migration
 *   pnpm tsx scripts/migrate-woocommerce.ts --categories-only  # Only migrate categories
 */

import { PrismaClient } from "../generated/prisma/index.js";
import { createClient } from "@supabase/supabase-js";

// WooCommerce API credentials
const WC_URL = "https://jingojump.com";
const WC_CONSUMER_KEY = "ck_28b25148b46b4092d513acf2d087f6b9b6a2dd91";
const WC_CONSUMER_SECRET = "cs_9c0021850201adb4ac734b10398569e6241cafe8";

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Supabase Admin client
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const BUCKET_NAME = "product-images";

// Types for WooCommerce API responses
interface WCCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: { src: string } | null;
  count: number;
}

interface WCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_quantity: number | null;
  stock_status: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
  }>;
  date_created: string;
  meta_data: Array<{
    id: number;
    key: string;
    value: string | object;
  }>;
}

// Helper to make WooCommerce API requests
async function wcFetch<T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const url = new URL(`${WC_URL}/wp-json/wc/v3/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString(
    "base64"
  );

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error(`WC API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

// Helper to get total pages from WooCommerce
async function wcGetTotalPages(
  endpoint: string,
  perPage: number = 100
): Promise<number> {
  const url = new URL(`${WC_URL}/wp-json/wc/v3/${endpoint}`);
  url.searchParams.set("per_page", String(perPage));

  const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString(
    "base64"
  );

  const response = await fetch(url.toString(), {
    method: "HEAD",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return parseInt(response.headers.get("x-wp-totalpages") || "1", 10);
}

// Generate unique slug
function generateSlug(name: string, existingSlugs: Set<string>): string {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  existingSlugs.add(slug);
  return slug;
}

// Generate unique SKU
function generateSku(sku: string, existingSkus: Set<string>): string {
  if (!sku) {
    sku = `WC-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  let finalSku = sku;
  let counter = 1;

  while (existingSkus.has(finalSku)) {
    finalSku = `${sku}-${counter}`;
    counter++;
  }

  existingSkus.add(finalSku);
  return finalSku;
}

// Download image and upload to Supabase
async function migrateImage(
  imageUrl: string,
  productId: string,
  index: number,
  supabase: ReturnType<typeof createClient>
): Promise<string | null> {
  try {
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`  Failed to download image: ${imageUrl}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get file extension from URL
    const urlPath = new URL(imageUrl).pathname;
    const ext = urlPath.split(".").pop()?.toLowerCase() || "jpg";

    // Generate filename
    const fileName = `${productId}/${index}-${Date.now()}.${ext}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error(`  Supabase upload error: ${error.message}`);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return publicUrl;
  } catch (err) {
    console.error(`  Error migrating image: ${err}`);
    return null;
  }
}

// Parsed specifications structure - matches Prisma schema fields
interface ParsedSpecs {
  // Common specs
  modelNumber?: string;
  size?: string;
  weight?: number;
  warranty?: string;
  // Inflatable specs
  pieces?: number;
  blowers?: number;
  operators?: number;
  riders?: string;
  indoor?: boolean;
  outdoor?: boolean;
  // Motor/Blower specs
  power?: string;
  voltage?: string;
  frequency?: string;
  phase?: string;
  rpm?: number;
  amps?: number;
  // Description extracted from HTML
  cleanDescription?: string;
}

// Parse product specifications from HTML short_description
// Handles multiple HTML structures found across 347 products:
// Type 1 (Light Commercial): <center> tags, <strong> labels, no colons (Sizes, Riders)
// Type 2 (Commercial): no <center>, <strong> labels with colons (Sizes:, Riders:)
// Type 3 (Art Panels): <b> tags instead of <strong>, uses Length:/Height: instead of Sizes
// Type 4 (Packages/Accessories): no table, description in WC description field
function parseSpecs(html: string): ParsedSpecs {
  const specs: ParsedSpecs = {};

  // Helper to clean extracted values
  const cleanValue = (val: string): string => {
    return val
      .trim()
      .replace(/&#8242;/g, "'") // foot symbol '
      .replace(/&#8243;/g, '"') // inch symbol "
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ");
  };

  // Helper to extract value from table row
  // Handles both <strong> and <b> tags, with/without colons
  const extractTableValue = (label: string): string | null => {
    // Pattern variations to handle all HTML structures found
    const patterns = [
      // Pattern 1: <strong>Label</strong> with colored span value (most common)
      new RegExp(
        `<strong>${label}:?</strong>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>[\\s\\S]*?<span[^>]*color:[^>]*#003366[^>]*>([^<]+)</span>`,
        "i"
      ),
      // Pattern 2: <strong>Label</strong> with any span value
      new RegExp(
        `<strong>${label}:?</strong>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>[\\s\\S]*?<span[^>]*>([^<]+)</span>`,
        "i"
      ),
      // Pattern 3: <b>Label</b> with colored span (Art Panels use <b> tag)
      new RegExp(
        `<b>${label}:?</b>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>[\\s\\S]*?<span[^>]*color:[^>]*#003366[^>]*>([^<]+)</span>`,
        "i"
      ),
      // Pattern 4: <b>Label</b> with any span
      new RegExp(
        `<b>${label}:?</b>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>[\\s\\S]*?<span[^>]*>([^<]+)</span>`,
        "i"
      ),
      // Pattern 5: Plain text value in td (rare)
      new RegExp(
        `<(?:strong|b)>${label}:?</(?:strong|b)>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>\\s*([^<\\s][^<]*)\\s*</td>`,
        "i"
      ),
    ];

    for (const regex of patterns) {
      const match = html.match(regex);
      if (match?.[1]) {
        const value = cleanValue(match[1]);
        if (value && value.length > 0) {
          return value;
        }
      }
    }
    return null;
  };

  // ============ COMMON SPECS ============

  // Model Number - try "Model #" and "Item #" (Art Panels use Item #)
  let modelValue = extractTableValue("Model #");
  if (!modelValue) modelValue = extractTableValue("Item #");
  if (modelValue) specs.modelNumber = modelValue;

  // Size/Dimensions - try multiple label variations
  let sizeValue = extractTableValue("Sizes?");
  if (!sizeValue) sizeValue = extractTableValue("Size");
  // For Art Panels: try to build size from Length + Height
  if (!sizeValue) {
    const length = extractTableValue("Length");
    const height = extractTableValue("Height");
    if (length && height) {
      sizeValue = `${length} L x ${height} H`;
    } else if (length) {
      sizeValue = length;
    } else if (height) {
      sizeValue = height;
    }
  }
  if (sizeValue) specs.size = sizeValue;

  // Weight (unit weight from HTML table, NOT WC shipping weight)
  const weightValue = extractTableValue("Weight \\(lbs\\)");
  if (weightValue) {
    const weightNum = parseFloat(weightValue.replace(/[^\d.]/g, ""));
    if (!isNaN(weightNum)) specs.weight = weightNum;
  }

  // Warranty
  const warrantyValue = extractTableValue("Warranty");
  if (warrantyValue) specs.warranty = warrantyValue;

  // ============ INFLATABLE SPECS ============

  // Pieces
  const piecesValue = extractTableValue("Pieces");
  if (piecesValue) {
    const piecesNum = parseInt(piecesValue, 10);
    if (!isNaN(piecesNum)) specs.pieces = piecesNum;
  }

  // Blowers
  const blowersValue = extractTableValue("Blowers");
  if (blowersValue) {
    const blowersNum = parseInt(blowersValue, 10);
    if (!isNaN(blowersNum)) specs.blowers = blowersNum;
  }

  // Operators
  const operatorsValue = extractTableValue("Operators");
  if (operatorsValue) {
    const operatorsNum = parseInt(operatorsValue, 10);
    if (!isNaN(operatorsNum)) specs.operators = operatorsNum;
  }

  // Riders - try "Riders" and "Players"
  let ridersValue = extractTableValue("Riders");
  if (!ridersValue) ridersValue = extractTableValue("Players");
  if (ridersValue) specs.riders = ridersValue;

  // Indoor/Outdoor - parse Yes/No to boolean
  const indoorValue = extractTableValue("Indoor");
  if (indoorValue) {
    specs.indoor = indoorValue.toLowerCase() === "yes";
  }

  const outdoorValue = extractTableValue("Outdoor");
  if (outdoorValue) {
    specs.outdoor = outdoorValue.toLowerCase() === "yes";
  }

  // ============ MOTOR/BLOWER SPECS ============

  // Power (e.g., "1 HP", "1.5 HP")
  const powerValue = extractTableValue("Power");
  if (powerValue) specs.power = powerValue;

  // Voltage (e.g., "115 V")
  const voltageValue = extractTableValue("Voltage");
  if (voltageValue) specs.voltage = voltageValue;

  // Frequency (e.g., "60 HZ")
  const frequencyValue = extractTableValue("Frequency");
  if (frequencyValue) specs.frequency = frequencyValue;

  // Phase (e.g., "Single")
  const phaseValue = extractTableValue("Phase");
  if (phaseValue) specs.phase = phaseValue;

  // RPM (e.g., 3350)
  const rpmValue = extractTableValue("R\\.P\\.M\\.");
  if (rpmValue) {
    const rpmNum = parseInt(rpmValue.replace(/[^\d]/g, ""), 10);
    if (!isNaN(rpmNum)) specs.rpm = rpmNum;
  }

  // Amps (e.g., 7.5)
  const ampsValue = extractTableValue("AMPS");
  if (ampsValue) {
    const ampsNum = parseFloat(ampsValue.replace(/[^\d.]/g, ""));
    if (!isNaN(ampsNum)) specs.amps = ampsNum;
  }

  // ============ DESCRIPTION ============

  // Extract the descriptive text from span with font-size: medium
  const descRegex =
    /<span[^>]*font-size:\s*medium[^>]*>[\s\S]*?(This[^<]+(?:commercial|inflatable|bouncer|slide|design|feature|quality|vinyl|grade|durable)[^<]*)<\/span>/i;
  const descMatch = html.match(descRegex);
  if (descMatch?.[1]) {
    specs.cleanDescription = cleanValue(descMatch[1]);
  }

  return specs;
}

// Strip HTML tags from description
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Migrate categories
async function migrateCategories(): Promise<Map<number, string>> {
  console.log("\n=== Migrating Categories ===\n");

  const wcCategories = await wcFetch<WCCategory[]>("products/categories", {
    per_page: 100,
  });

  const categoryMap = new Map<number, string>(); // WC ID -> Prisma ID
  const existingSlugs = new Set<string>();

  // Get existing slugs
  const existingCategories = await prisma.category.findMany({
    select: { slug: true },
  });
  existingCategories.forEach((c) => existingSlugs.add(c.slug));

  for (const wcCat of wcCategories) {
    // Skip uncategorized
    if (wcCat.slug === "uncategorized") continue;

    // Decode HTML entities in name
    const cleanName = wcCat.name.replace(/&amp;/g, "&");
    const slug = generateSlug(cleanName, existingSlugs);

    try {
      // Check if category already exists by name (check both encoded and decoded)
      const existing = await prisma.category.findFirst({
        where: {
          OR: [{ name: wcCat.name }, { name: cleanName }],
        },
      });

      if (existing) {
        categoryMap.set(wcCat.id, existing.id);
        console.log(`  ✓ Category exists: ${cleanName}`);
        continue;
      }

      const category = await prisma.category.create({
        data: {
          name: cleanName,
          slug,
          description: stripHtml(wcCat.description) || null,
          image: wcCat.image?.src || null,
          position: 0,
          featured: false,
        },
      });

      categoryMap.set(wcCat.id, category.id);
      console.log(`  ✓ Created category: ${wcCat.name}`);
    } catch (err) {
      console.error(`  ✗ Failed to create category ${wcCat.name}:`, err);
    }
  }

  console.log(`\nMigrated ${categoryMap.size} categories`);
  return categoryMap;
}

// Migrate products
async function migrateProducts(
  categoryMap: Map<number, string>,
  limit?: number
): Promise<void> {
  console.log("\n=== Migrating Products ===\n");

  const supabase = getSupabaseAdmin();

  // Get existing slugs and SKUs
  const existingProducts = await prisma.product.findMany({
    select: { slug: true, sku: true },
  });
  const existingSlugs = new Set(existingProducts.map((p) => p.slug));
  const existingSkus = new Set(existingProducts.map((p) => p.sku));

  // Calculate pages to fetch
  const perPage = limit ? Math.min(limit, 100) : 100;
  const totalPages = limit ? 1 : await wcGetTotalPages("products", perPage);

  let totalMigrated = 0;
  let totalFailed = 0;

  for (let page = 1; page <= totalPages; page++) {
    console.log(`\nFetching page ${page}/${totalPages}...`);

    const wcProducts = await wcFetch<WCProduct[]>("products", {
      per_page: perPage,
      page,
      status: "publish",
    });

    const productsToProcess = limit
      ? wcProducts.slice(0, limit - totalMigrated)
      : wcProducts;

    for (const wcProduct of productsToProcess) {
      console.log(`\nProcessing: ${wcProduct.name}`);

      try {
        // Check if product already exists by WC SKU
        if (wcProduct.sku && existingSkus.has(wcProduct.sku)) {
          console.log(`  → Skipping (SKU exists): ${wcProduct.sku}`);
          continue;
        }

        // Generate unique slug and SKU
        const slug = generateSlug(wcProduct.name, existingSlugs);
        const sku = generateSku(wcProduct.sku, existingSkus);

        // Parse specs from description
        const specs = parseSpecs(
          wcProduct.short_description || wcProduct.description
        );

        // Get category ID
        const primaryCategory = wcProduct.categories[0];
        const categoryId = primaryCategory
          ? categoryMap.get(primaryCategory.id)
          : undefined;

        // Determine badge
        let badge: string | null = null;
        if (wcProduct.on_sale) badge = "SALE";
        else if (wcProduct.featured) badge = "POPULAR";

        // Extract Yoast SEO meta data
        const yoastTitle = wcProduct.meta_data.find(
          (m) => m.key === "_yoast_wpseo_title"
        )?.value as string | undefined;
        const yoastDesc = wcProduct.meta_data.find(
          (m) => m.key === "_yoast_wpseo_metadesc"
        )?.value as string | undefined;

        // Determine stock quantity - use stock_status if quantity not available
        const stockQty =
          wcProduct.stock_quantity ??
          (wcProduct.stock_status === "instock" ? 10 : 0);

        // Create product
        const product = await prisma.product.create({
          data: {
            name: wcProduct.name,
            slug,
            sku,
            // Use clean description extracted from short_description, fallback to stripped HTML
            description:
              specs.cleanDescription ||
              stripHtml(wcProduct.description || wcProduct.short_description) ||
              null,
            price: parseFloat(wcProduct.regular_price) || 0,
            salePrice: wcProduct.sale_price
              ? parseFloat(wcProduct.sale_price)
              : null,
            categoryId: categoryId || null,
            category: primaryCategory?.name.replace(/&amp;/g, "&") || null,
            stockQuantity: stockQty,
            trackInventory: wcProduct.stock_quantity !== null,

            // ============ PRODUCT SPECIFICATIONS ============
            // Common specs
            modelNumber: specs.modelNumber || null,
            size: specs.size || null,
            // Use unit weight from HTML table FIRST (actual product weight)
            // WC API weight is shipping weight which is higher
            weight: specs.weight
              ? specs.weight
              : wcProduct.weight
                ? parseFloat(wcProduct.weight)
                : null,
            warranty: specs.warranty || null,

            // Inflatable specs
            pieces: specs.pieces || null,
            blowers: specs.blowers || null,
            operators: specs.operators || null,
            riders: specs.riders || null,
            indoor: specs.indoor ?? null,
            outdoor: specs.outdoor ?? null,

            // Motor/Blower specs
            power: specs.power || null,
            voltage: specs.voltage || null,
            frequency: specs.frequency || null,
            phase: specs.phase || null,
            rpm: specs.rpm || null,
            amps: specs.amps || null,

            // Legacy fields (for backward compatibility)
            ageRange: specs.riders ? `${specs.riders} riders` : null,
            dimensions:
              wcProduct.dimensions.length &&
              wcProduct.dimensions.width &&
              wcProduct.dimensions.height
                ? `${wcProduct.dimensions.length}x${wcProduct.dimensions.width}x${wcProduct.dimensions.height}`
                : null,
            // ============ END SPECIFICATIONS ============

            status: wcProduct.stock_status === "outofstock" ? "ARCHIVED" : "ACTIVE",
            badge,
            featured: wcProduct.featured,
            // SEO fields from Yoast
            metaTitle: yoastTitle || null,
            metaDescription: yoastDesc || null,
            // Set publishedAt from WC date_created
            publishedAt: wcProduct.date_created
              ? new Date(wcProduct.date_created)
              : null,
          },
        });

        console.log(`  ✓ Created product: ${product.id}`);

        // Migrate images
        if (wcProduct.images.length > 0) {
          console.log(`  → Migrating ${wcProduct.images.length} images...`);

          for (let i = 0; i < wcProduct.images.length; i++) {
            const wcImage = wcProduct.images[i];
            if (!wcImage) continue;

            const imageUrl = await migrateImage(
              wcImage.src,
              product.id,
              i,
              supabase as Parameters<typeof migrateImage>[3]
            );

            if (imageUrl) {
              await prisma.productImage.create({
                data: {
                  productId: product.id,
                  url: imageUrl,
                  alt: wcImage.alt || wcImage.name || null,
                  position: i,
                },
              });
              console.log(`    ✓ Image ${i + 1} uploaded`);
            }
          }
        }

        totalMigrated++;
      } catch (err) {
        console.error(`  ✗ Failed to migrate product: ${err}`);
        totalFailed++;
      }

      // Stop if we've hit the limit
      if (limit && totalMigrated >= limit) break;
    }

    if (limit && totalMigrated >= limit) break;
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Successfully migrated: ${totalMigrated} products`);
  console.log(`Failed: ${totalFailed} products`);
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes("--test");
  const isFull = args.includes("--full");
  const categoriesOnly = args.includes("--categories-only");

  if (!isTest && !isFull && !categoriesOnly) {
    console.log("Usage:");
    console.log(
      "  pnpm tsx scripts/migrate-woocommerce.ts --test            # Test with 5 products"
    );
    console.log(
      "  pnpm tsx scripts/migrate-woocommerce.ts --full            # Full migration"
    );
    console.log(
      "  pnpm tsx scripts/migrate-woocommerce.ts --categories-only # Only categories"
    );
    process.exit(1);
  }

  console.log("========================================");
  console.log("  WooCommerce Migration Script");
  console.log("========================================");
  console.log(`Mode: ${isTest ? "TEST (5 products)" : isFull ? "FULL" : "CATEGORIES ONLY"}`);

  try {
    // Migrate categories first
    const categoryMap = await migrateCategories();

    if (!categoriesOnly) {
      // Migrate products
      await migrateProducts(categoryMap, isTest ? 5 : undefined);
    }
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
