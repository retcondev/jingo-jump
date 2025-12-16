import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const samplesDir = path.join(__dirname, "wc-samples");

// Stats tracking
const stats = {
  total: 0,
  hasShortDescription: 0,
  hasDescription: 0,
  hasTable: 0,
  hasCenter: 0, // Type 1: Light Commercial style
  noCenter: 0, // Type 2: Commercial style
  hasSizesWithColon: 0,
  hasSizesWithoutColon: 0,
  hasDescriptionInHtml: 0, // Has "This..." description in short_description
  hasDescriptionField: 0, // Has separate description field
  missingSize: 0,
  missingWeight: 0,
  missingRiders: 0,
  noTableNoDesc: 0,
  uniquePatterns: new Map<string, number>(),
  problemProducts: [] as string[],
  labelVariations: new Map<string, Set<string>>(),
};

// Updated parse function from migrate script - handles all 4 HTML structure types
function parseSpecs(html: string) {
  const specs: Record<string, string | number | null> = {};

  const cleanValue = (val: string): string => {
    return val
      .trim()
      .replace(/&#8242;/g, "'")
      .replace(/&#8243;/g, '"')
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ");
  };

  const extractTableValue = (label: string): string | null => {
    const patterns = [
      // <strong> with colored span
      new RegExp(
        `<strong>${label}:?</strong>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>[\\s\\S]*?<span[^>]*color:[^>]*#003366[^>]*>([^<]+)</span>`,
        "i"
      ),
      // <strong> with any span
      new RegExp(
        `<strong>${label}:?</strong>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>[\\s\\S]*?<span[^>]*>([^<]+)</span>`,
        "i"
      ),
      // <b> with colored span (Art Panels)
      new RegExp(
        `<b>${label}:?</b>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>[\\s\\S]*?<span[^>]*color:[^>]*#003366[^>]*>([^<]+)</span>`,
        "i"
      ),
      // <b> with any span
      new RegExp(
        `<b>${label}:?</b>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>[\\s\\S]*?<span[^>]*>([^<]+)</span>`,
        "i"
      ),
      // Plain text
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

  // Try multiple size label variations
  let sizeValue = extractTableValue("Sizes?");
  if (!sizeValue) sizeValue = extractTableValue("Size");
  if (!sizeValue) {
    const length = extractTableValue("Length");
    const height = extractTableValue("Height");
    if (length && height) sizeValue = `${length} L x ${height} H`;
    else if (length) sizeValue = length;
    else if (height) sizeValue = height;
  }
  specs.size = sizeValue;

  specs.weight = extractTableValue("Weight \\(lbs\\)");

  // Try Model # and Item #
  let modelValue = extractTableValue("Model #");
  if (!modelValue) modelValue = extractTableValue("Item #");
  specs.model = modelValue;

  // Try Riders and Players
  let ridersValue = extractTableValue("Riders");
  if (!ridersValue) ridersValue = extractTableValue("Players");
  specs.riders = ridersValue;

  const descRegex =
    /<span[^>]*font-size:\s*medium[^>]*>[\s\S]*?(This[^<]+(?:commercial|inflatable|bouncer|slide|design|feature|quality|vinyl|grade|durable)[^<]*)<\/span>/i;
  const descMatch = html.match(descRegex);
  if (descMatch?.[1]) {
    specs.cleanDescription = cleanValue(descMatch[1]);
  }

  return specs;
}

// Find all unique label patterns in HTML
function findLabels(html: string): string[] {
  const labelMatch = html.match(/<strong>([^<]+)<\/strong>/gi) || [];
  return labelMatch.map((m) =>
    m.replace(/<\/?strong>/gi, "").trim()
  );
}

console.log("=== Analyzing ALL 347 WooCommerce Products ===\n");

const files = fs.readdirSync(samplesDir).filter((f) => f.endsWith(".json"));

for (const file of files) {
  stats.total++;
  const data = JSON.parse(fs.readFileSync(path.join(samplesDir, file), "utf8"));
  const shortDesc = data.short_description || "";
  const desc = data.description || "";

  // Track basic stats
  if (shortDesc) stats.hasShortDescription++;
  if (desc) stats.hasDescription++;

  // Track if has table
  const hasTable = shortDesc.includes("<table");
  if (hasTable) stats.hasTable++;

  // Track HTML structure type
  const hasCenter = shortDesc.includes("<center>");
  if (hasCenter) stats.hasCenter++;
  else if (hasTable) stats.noCenter++;

  // Track label variations
  const labels = findLabels(shortDesc);
  for (const label of labels) {
    if (!stats.labelVariations.has(label)) {
      stats.labelVariations.set(label, new Set());
    }
    stats.labelVariations.get(label)!.add(data.sku || data.id);
  }

  // Check for size label variations
  if (shortDesc.includes("<strong>Sizes:</strong>")) stats.hasSizesWithColon++;
  if (shortDesc.includes("<strong>Sizes</strong>"))
    stats.hasSizesWithoutColon++;

  // Parse specs
  const specs = parseSpecs(shortDesc);

  // Track missing fields
  if (!specs.size && hasTable) {
    stats.missingSize++;
    stats.problemProducts.push(`MISSING SIZE: ${data.name} (${data.sku})`);
  }

  if (!specs.weight && !data.weight && hasTable) {
    stats.missingWeight++;
    stats.problemProducts.push(`MISSING WEIGHT: ${data.name} (${data.sku})`);
  }

  if (!specs.riders && hasTable) {
    stats.missingRiders++;
  }

  // Track description sources
  if (specs.cleanDescription) stats.hasDescriptionInHtml++;
  if (desc && desc.length > 10) stats.hasDescriptionField++;

  // Track products with no table and no description
  if (!hasTable && !desc) {
    stats.noTableNoDesc++;
    stats.problemProducts.push(`NO TABLE/DESC: ${data.name} (${data.sku})`);
  }

  // Categorize pattern
  let pattern = "";
  if (hasTable) {
    pattern += hasCenter ? "TABLE+CENTER" : "TABLE-NOCENTER";
    pattern += specs.cleanDescription ? "+HTML_DESC" : "";
  } else {
    pattern = "NO_TABLE";
  }
  pattern += desc ? "+WC_DESC" : "";

  stats.uniquePatterns.set(
    pattern,
    (stats.uniquePatterns.get(pattern) || 0) + 1
  );
}

console.log("=== SUMMARY STATS ===\n");
console.log(`Total products: ${stats.total}`);
console.log(`Has short_description: ${stats.hasShortDescription}`);
console.log(`Has description field: ${stats.hasDescription}`);
console.log(`Has table in HTML: ${stats.hasTable}`);
console.log(`  - With <center> (Type 1): ${stats.hasCenter}`);
console.log(`  - Without <center> (Type 2): ${stats.noCenter}`);
console.log(`Label "Sizes:" (with colon): ${stats.hasSizesWithColon}`);
console.log(`Label "Sizes" (no colon): ${stats.hasSizesWithoutColon}`);
console.log(`Has description in HTML: ${stats.hasDescriptionInHtml}`);
console.log(`Has WC description field: ${stats.hasDescriptionField}`);

console.log("\n=== PARSING ISSUES ===\n");
console.log(`Missing size (with table): ${stats.missingSize}`);
console.log(`Missing weight (no WC weight): ${stats.missingWeight}`);
console.log(`Missing riders: ${stats.missingRiders}`);
console.log(`No table AND no description: ${stats.noTableNoDesc}`);

console.log("\n=== UNIQUE PATTERNS ===\n");
const sortedPatterns = [...stats.uniquePatterns.entries()].sort(
  (a, b) => b[1] - a[1]
);
for (const [pattern, count] of sortedPatterns) {
  console.log(`  ${pattern}: ${count}`);
}

console.log("\n=== ALL LABEL VARIATIONS FOUND ===\n");
const sortedLabels = [...stats.labelVariations.entries()].sort(
  (a, b) => b[1].size - a[1].size
);
for (const [label, skus] of sortedLabels) {
  console.log(`  "${label}": ${skus.size} products`);
}

if (stats.problemProducts.length > 0) {
  console.log("\n=== PROBLEM PRODUCTS (first 20) ===\n");
  for (const problem of stats.problemProducts.slice(0, 20)) {
    console.log(`  ${problem}`);
  }
  if (stats.problemProducts.length > 20) {
    console.log(`  ... and ${stats.problemProducts.length - 20} more`);
  }
}
