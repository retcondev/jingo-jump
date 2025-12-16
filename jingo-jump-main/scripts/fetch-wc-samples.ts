import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WC_URL = "https://jingojump.com";
const CONSUMER_KEY = "ck_28b25148b46b4092d513acf2d087f6b9b6a2dd91";
const CONSUMER_SECRET = "cs_9c0021850201adb4ac734b10398569e6241cafe8";

const OUTPUT_DIR = path.join(__dirname, "wc-samples");

async function wcFetch<T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const url = new URL(`${WC_URL}/wp-json/wc/v3/${endpoint}`);
  url.searchParams.set("consumer_key", CONSUMER_KEY);
  url.searchParams.set("consumer_secret", CONSUMER_SECRET);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`WC API Error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function main() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("Fetching products from WooCommerce...\n");

  // Fetch ALL products to analyze every variation
  const allProducts: any[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    console.log(`Fetching page ${page}...`);
    const products = await wcFetch<any[]>("products", {
      per_page: perPage,
      page,
      status: "publish",
    });

    if (products.length === 0) break;
    allProducts.push(...products);
    page++;
  }

  const products = allProducts;

  console.log(`Fetched ${products.length} products\n`);

  for (const p of products) {
    const filename = `${p.sku || p.id}-${p.slug.substring(0, 30)}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Save full product data
    fs.writeFileSync(filepath, JSON.stringify(p, null, 2));
    console.log(`Saved: ${filename}`);

    // Also print a summary
    console.log(`  Name: ${p.name}`);
    console.log(`  Has short_description: ${!!p.short_description}`);
    console.log(`  Has description: ${!!p.description}`);
    console.log(`  short_description length: ${p.short_description?.length || 0}`);
    console.log(`  description length: ${p.description?.length || 0}`);
    console.log("");
  }

  console.log(`\nSaved ${products.length} product JSON files to: ${OUTPUT_DIR}`);
}

main().catch(console.error);
