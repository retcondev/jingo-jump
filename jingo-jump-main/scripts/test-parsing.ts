import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse product specifications from HTML short_description
function parseSpecs(html: string): {
  size?: string;
  weight?: number;
  dimensions?: string;
  modelNumber?: string;
  ageRange?: string;
  cleanDescription?: string;
} {
  const specs: {
    size?: string;
    weight?: number;
    dimensions?: string;
    modelNumber?: string;
    ageRange?: string;
    cleanDescription?: string;
  } = {};

  const extractTableValue = (label: string): string | null => {
    const patterns = [
      new RegExp(
        `<strong>${label}:?</strong>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>[\\s\\S]*?<span[^>]*color:[^>]*#003366[^>]*>([^<]+)</span>`,
        "i"
      ),
      new RegExp(
        `<strong>${label}:?</strong>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>[\\s\\S]*?<span[^>]*>([^<]+)</span>`,
        "i"
      ),
      new RegExp(
        `<strong>${label}:?</strong>[\\s\\S]*?</td>[\\s\\S]*?<td[^>]*>\\s*([^<\\s][^<]*)\\s*</td>`,
        "i"
      ),
    ];

    for (const regex of patterns) {
      const match = html.match(regex);
      if (match?.[1]) {
        const value = match[1]
          .trim()
          .replace(/&#8242;/g, "'")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&");
        if (value && value.length > 0) {
          return value;
        }
      }
    }
    return null;
  };

  const sizeValue = extractTableValue("Sizes?");
  if (sizeValue) specs.size = sizeValue;

  const weightValue = extractTableValue("Weight \\(lbs\\)");
  if (weightValue) {
    const weightNum = parseFloat(weightValue.replace(/[^\d.]/g, ""));
    if (!isNaN(weightNum)) specs.weight = weightNum;
  }

  const modelValue = extractTableValue("Model #");
  if (modelValue) specs.modelNumber = modelValue;

  const ridersValue = extractTableValue("Riders");
  if (ridersValue) specs.ageRange = `${ridersValue} riders`;

  const descRegex =
    /<span[^>]*font-size:\s*medium[^>]*>[\s\S]*?(This[^<]+(?:commercial|inflatable|bouncer|slide|design|feature|quality|vinyl|grade|durable)[^<]*)<\/span>/i;
  const descMatch = html.match(descRegex);
  if (descMatch?.[1]) {
    specs.cleanDescription = descMatch[1].trim();
  }

  return specs;
}

// Test against sample files
const samplesDir = path.join(__dirname, "wc-samples");

// Specific tests for products with descriptions
console.log("=== Testing products WITH description text ===\n");

// 303-75-1 has description in short_description HTML
const palmFile = fs.readFileSync(
  path.join(samplesDir, "303-75-1-18-ft-light-commercial-palm-pa.json"),
  "utf8"
);
const palmData = JSON.parse(palmFile);
const palmSpecs = parseSpecs(palmData.short_description || "");
console.log(`--- ${palmData.name} ---`);
console.log(`  Size: ${palmSpecs.size || "NULL"}`);
console.log(`  Riders: ${palmSpecs.ageRange || "NULL"}`);
console.log(
  `  Description (from HTML): ${palmSpecs.cleanDescription?.substring(0, 120) || "NULL"}...`
);
console.log("");

// 73-56-1 has description in separate field
const tropicalFile = fs.readFileSync(
  path.join(samplesDir, "73-56-1-14-ft-tropical-paradise-water-.json"),
  "utf8"
);
const tropicalData = JSON.parse(tropicalFile);
const tropicalSpecs = parseSpecs(tropicalData.short_description || "");
console.log(`--- ${tropicalData.name} ---`);
console.log(`  Size: ${tropicalSpecs.size || "NULL"}`);
console.log(`  Riders: ${tropicalSpecs.ageRange || "NULL"}`);
console.log(
  `  Description (from HTML): ${tropicalSpecs.cleanDescription || "NULL"}`
);
console.log(`  Description (WC field): ${tropicalData.description}`);
console.log("");

console.log("=== Testing all samples ===\n");
const files = fs.readdirSync(samplesDir).slice(0, 10);

console.log("=== Testing parseSpecs against WC samples ===\n");

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(samplesDir, file), "utf8"));
  const specs = parseSpecs(data.short_description || "");

  console.log(`--- ${data.name} (${data.sku}) ---`);
  console.log(`  Model #: ${specs.modelNumber || "NULL"}`);
  console.log(`  Size: ${specs.size || "NULL"}`);
  console.log(`  Weight (from HTML): ${specs.weight || "NULL"}`);
  console.log(`  Weight (from WC API): ${data.weight || "NULL"}`);
  console.log(`  Riders: ${specs.ageRange || "NULL"}`);
  console.log(
    `  Description: ${specs.cleanDescription?.substring(0, 80) || "NULL"}...`
  );
  console.log(`  Has WC description field: ${data.description ? "YES" : "NO"}`);
  console.log("");
}
