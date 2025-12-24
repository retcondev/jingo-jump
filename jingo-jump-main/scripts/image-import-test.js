import { PrismaClient } from '../generated/prisma/index.js';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const prisma = new PrismaClient();
const basePath = "/Users/mike/Library/CloudStorage/GoogleDrive-mike@retconmedia.com/My Drive/jingo jump images/Categories";

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// MANUAL OVERRIDES FOR PROBLEMATIC MATCHES
// ============================================
const MANUAL_MATCHES = {
  // Format: "ImageCategory/ProductFolder": "productId"

  // Unmatched folders - map to correct products
  "Combo Units/Dual Lane Castle Combo": "cmj80q0on0083nckdpipwf76i", // Dual Lane Wet Dry Castle Combo
  "Combo Units/5×1 Multi Activity Playground": "cmj8130fw01glnckdgu5hx76h", // 5x1 Multi Activity Playground

  // JUNGLE BOUNCER FIXES - be explicit about each one
  "Bouncers 13 x 13/Aloha Jungle Bouncer": "cmj80qda20099nckd8qltvlkz", // Aloha Jungle Bouncer 13x13
  "Bouncers 13 x 13/Jungle Bouncer": "cmj81220301ddnckd7yebcfif", // Jungle Bouncer (13x13, NOT Aloha)
  "Bouncers 13 x 13/Jungle Bouncer 2": "cmj811syh01cfnckdgvbaetxx", // Jungle Bouncer 2
  "Bouncers 15x15/Jungle Bouncer": "cmj811gp001b5nckdu5h1ur5j", // Jungle Bouncer 15x15

  // Medium Castle fix
  "Bouncers 13 x 13/Medium Castle": "cmj812lgr01f3nckd4143tjvd", // Medium Castle (not Marble Medium)

  // Front Slide Jungle Combo should match the actual product
  "Combo Units/Front Slide Jungle Combo": null, // Will need to find correct product

  // Modular Castle Combo should match the non-OPEN BOX version if exists
  "Combo Units/Modular Castle Combo": null, // Will check
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getAllPngFiles() {
  const output = execSync(`find "${basePath}" -name "*.png" -type f`, { encoding: 'utf-8' });
  return output.trim().split('\n').filter(Boolean);
}

function parsePath(filePath) {
  const relativePath = filePath.replace(basePath + '/', '');
  const parts = relativePath.split('/');
  const category = parts[0];
  const productFolder = parts[1];
  const filename = parts[parts.length - 1];
  const isOriginal = parts.some(p =>
    p.toLowerCase() === 'original' ||
    p.toLowerCase() === 'originals' ||
    p.toLowerCase() === 'orignals'
  );
  return { fullPath: filePath, category, productFolder, filename, isOriginal };
}

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSize(str) {
  const match = str.match(/(\d+)\s*x\s*(\d+)/i) || str.match(/(\d+)x(\d+)/i);
  if (match) return `${match[1]}x${match[2]}`;
  const sizeMatch = str.match(/\b(13|15)\b/);
  if (sizeMatch) return `${sizeMatch[1]}x${sizeMatch[1]}`;
  return null;
}

// ============================================
// MAIN MATCHING LOGIC
// ============================================

async function buildMatchingPlan(testOnly = false, testLimit = 5) {
  console.log('========================================');
  console.log('STEP 1: BUILDING MATCHING PLAN');
  console.log('========================================\n');

  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, category: true }
  });
  console.log(`✓ Loaded ${products.length} products from database\n`);

  const pngFiles = getAllPngFiles();
  const parsedFiles = pngFiles.map(parsePath).filter(f => !f.isOriginal);
  console.log(`✓ Found ${parsedFiles.length} PNG files (excluding originals)\n`);

  // Group by folder
  const folderGroups = new Map();
  for (const file of parsedFiles) {
    const key = `${file.category}/${file.productFolder}`;
    if (!folderGroups.has(key)) {
      folderGroups.set(key, { category: file.category, productFolder: file.productFolder, files: [] });
    }
    folderGroups.get(key).files.push(file);
  }

  // Match each folder
  const matches = [];
  const unmatched = [];

  for (const [key, group] of folderGroups) {
    const { category, productFolder, files } = group;

    // Skip backgrounds
    if (category === 'Backgrounds') {
      console.log(`⏭ Skipping: ${key} (backgrounds folder)`);
      continue;
    }

    // Check for manual override first
    if (MANUAL_MATCHES.hasOwnProperty(key)) {
      const manualProductId = MANUAL_MATCHES[key];
      if (manualProductId) {
        const product = products.find(p => p.id === manualProductId);
        if (product) {
          matches.push({
            key,
            imageCategory: category,
            imageFolder: productFolder,
            productId: product.id,
            productName: product.name,
            productCategory: product.category,
            files: files.map(f => f.fullPath),
            matchType: 'MANUAL'
          });
          continue;
        }
      } else {
        // Manual override set to null - skip for now
        unmatched.push({ key, imageCategory: category, imageFolder: productFolder, files: files.map(f => f.fullPath), reason: 'Manual skip' });
        continue;
      }
    }

    // Auto-match logic
    const normalizedFolder = normalize(productFolder);
    const folderSize = extractSize(category) || extractSize(productFolder);

    let expectedDbCategory = null;
    if (category.toLowerCase().includes('bouncer') && category.includes('13')) {
      expectedDbCategory = 'Bouncers 13 x 13';
    } else if (category.toLowerCase().includes('bouncer') && category.includes('15')) {
      expectedDbCategory = 'Bouncers 15x15';
    }

    let bestMatch = null;
    let matchScore = 0;

    for (const product of products) {
      const normalizedProduct = normalize(product.name);
      const productSize = extractSize(product.name) || extractSize(product.category || '');

      let score = 0;

      if (normalizedProduct.includes(normalizedFolder) || normalizedFolder.includes(normalizedProduct)) {
        score += 10;
      }

      if (expectedDbCategory && product.category === expectedDbCategory) {
        score += 5;
      }

      if (folderSize && productSize && folderSize === productSize) {
        score += 3;
      }

      if (folderSize && productSize && folderSize !== productSize) {
        score -= 5;
      }

      if (score > matchScore) {
        matchScore = score;
        bestMatch = product;
      }
    }

    if (bestMatch && matchScore >= 10) {
      matches.push({
        key,
        imageCategory: category,
        imageFolder: productFolder,
        productId: bestMatch.id,
        productName: bestMatch.name,
        productCategory: bestMatch.category,
        files: files.map(f => f.fullPath),
        matchType: 'AUTO',
        score: matchScore
      });
    } else {
      unmatched.push({
        key,
        imageCategory: category,
        imageFolder: productFolder,
        files: files.map(f => f.fullPath),
        reason: bestMatch ? `Best: ${bestMatch.name} (score: ${matchScore})` : 'No match'
      });
    }
  }

  // If test mode, limit matches
  if (testOnly) {
    console.log(`\n🧪 TEST MODE: Limiting to first ${testLimit} matches\n`);
    matches.splice(testLimit);
  }

  return { matches, unmatched, products };
}

// ============================================
// VERIFICATION STEP
// ============================================

async function verifyMatchingPlan(matches, unmatched) {
  console.log('\n========================================');
  console.log('STEP 2: VERIFICATION - REVIEW MATCHES');
  console.log('========================================\n');

  console.log(`Total matched folders: ${matches.length}`);
  console.log(`Total unmatched folders: ${unmatched.length}`);
  console.log(`Total images to process: ${matches.reduce((sum, m) => sum + m.files.length, 0)}\n`);

  console.log('--- MATCHES TO PROCESS ---\n');
  for (const m of matches) {
    const badge = m.matchType === 'MANUAL' ? '🔧' : '🤖';
    console.log(`${badge} [${m.imageCategory}] "${m.imageFolder}"`);
    console.log(`   → Product: "${m.productName}" (${m.productCategory})`);
    console.log(`   → Product ID: ${m.productId}`);
    console.log(`   → Images (${m.files.length}):`);
    m.files.forEach((f, i) => console.log(`      ${i + 1}. ${path.basename(f)}`));
    console.log();
  }

  if (unmatched.length > 0) {
    console.log('--- UNMATCHED (will be skipped) ---\n');
    for (const u of unmatched) {
      console.log(`⚠️  [${u.imageCategory}] "${u.imageFolder}" - ${u.reason}`);
    }
  }

  return true;
}

// ============================================
// CHECK CURRENT IMAGES
// ============================================

async function checkCurrentImages(matches) {
  console.log('\n========================================');
  console.log('STEP 3: CHECK CURRENT IMAGES IN DATABASE');
  console.log('========================================\n');

  const productIds = matches.map(m => m.productId);

  const currentImages = await prisma.productImage.findMany({
    where: { productId: { in: productIds } },
    select: { id: true, url: true, alt: true, position: true, productId: true }
  });

  console.log(`Found ${currentImages.length} existing images for ${productIds.length} products\n`);

  const imagesByProduct = {};
  for (const img of currentImages) {
    if (!imagesByProduct[img.productId]) {
      imagesByProduct[img.productId] = [];
    }
    imagesByProduct[img.productId].push(img);
  }

  for (const m of matches) {
    const existing = imagesByProduct[m.productId] || [];
    console.log(`📦 "${m.productName}"`);
    console.log(`   Current images: ${existing.length}`);
    if (existing.length > 0) {
      existing.forEach((img, i) => {
        const urlShort = img.url.length > 60 ? img.url.substring(0, 60) + '...' : img.url;
        console.log(`      ${i + 1}. ${urlShort}`);
      });
    }
    console.log(`   New images to add: ${m.files.length}`);
    console.log();
  }

  return imagesByProduct;
}

// ============================================
// DRY RUN - SHOW WHAT WOULD HAPPEN
// ============================================

async function dryRun(matches, currentImagesByProduct) {
  console.log('\n========================================');
  console.log('STEP 4: DRY RUN - WHAT WILL HAPPEN');
  console.log('========================================\n');

  for (const m of matches) {
    const existing = currentImagesByProduct[m.productId] || [];

    console.log(`📦 "${m.productName}"`);
    console.log(`   ❌ DELETE: ${existing.length} existing images`);
    existing.forEach(img => {
      console.log(`      - ${img.id}`);
    });
    console.log(`   ✅ ADD: ${m.files.length} new images`);
    m.files.forEach((f, i) => {
      const filename = path.basename(f);
      const storagePath = `products/${m.productId}/${filename}`;
      console.log(`      + ${storagePath}`);
    });
    console.log();
  }

  console.log('⚠️  This is a DRY RUN - no changes made yet.');
  console.log('   Set DRY_RUN=false to execute.\n');
}

// ============================================
// EXECUTE IMPORT
// ============================================

async function executeImport(matches, currentImagesByProduct, dryRun = true) {
  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made\n');
    return;
  }

  console.log('\n========================================');
  console.log('STEP 5: EXECUTING IMPORT');
  console.log('========================================\n');

  for (const m of matches) {
    console.log(`\n📦 Processing: "${m.productName}"...`);

    // 1. Delete existing images from database
    const existing = currentImagesByProduct[m.productId] || [];
    if (existing.length > 0) {
      console.log(`   Deleting ${existing.length} existing ProductImage records...`);
      await prisma.productImage.deleteMany({
        where: { productId: m.productId }
      });
      console.log(`   ✓ Deleted`);

      // Optionally delete from storage too
      // (You may want to keep old images or clean them up separately)
    }

    // 2. Upload new images to Supabase storage and create records
    console.log(`   Uploading ${m.files.length} new images...`);

    for (let i = 0; i < m.files.length; i++) {
      const filePath = m.files[i];
      const filename = path.basename(filePath);
      const storagePath = `products/${m.productId}/${filename}`;

      try {
        // Read file
        const fileBuffer = fs.readFileSync(filePath);

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(storagePath, fileBuffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (error) {
          console.log(`   ❌ Failed to upload ${filename}: ${error.message}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        // Create ProductImage record
        await prisma.productImage.create({
          data: {
            productId: m.productId,
            url: publicUrl,
            alt: m.productName,
            position: i
          }
        });

        console.log(`   ✓ ${i + 1}/${m.files.length} ${filename}`);
      } catch (err) {
        console.log(`   ❌ Error with ${filename}: ${err.message}`);
      }
    }
  }

  console.log('\n✅ Import complete!');
}

// ============================================
// VERIFY RESULTS
// ============================================

async function verifyResults(matches) {
  console.log('\n========================================');
  console.log('STEP 6: VERIFY RESULTS');
  console.log('========================================\n');

  const productIds = matches.map(m => m.productId);

  const newImages = await prisma.productImage.findMany({
    where: { productId: { in: productIds } },
    select: { id: true, url: true, alt: true, position: true, productId: true },
    orderBy: [{ productId: 'asc' }, { position: 'asc' }]
  });

  const imagesByProduct = {};
  for (const img of newImages) {
    if (!imagesByProduct[img.productId]) {
      imagesByProduct[img.productId] = [];
    }
    imagesByProduct[img.productId].push(img);
  }

  console.log('--- FINAL STATE ---\n');
  for (const m of matches) {
    const images = imagesByProduct[m.productId] || [];
    const expected = m.files.length;
    const actual = images.length;
    const status = actual === expected ? '✅' : '⚠️';

    console.log(`${status} "${m.productName}"`);
    console.log(`   Expected: ${expected} images, Actual: ${actual} images`);
    images.forEach((img, i) => {
      console.log(`      ${i + 1}. ${img.url}`);
    });
    console.log();
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  const TEST_MODE = true;  // Set to false for full run
  const DRY_RUN = false;   // Set to false to actually execute
  const TEST_LIMIT = 5;

  try {
    // Step 1: Build matching plan
    const { matches, unmatched } = await buildMatchingPlan(TEST_MODE, TEST_LIMIT);

    // Step 2: Verify matches
    await verifyMatchingPlan(matches, unmatched);

    // Step 3: Check current images
    const currentImagesByProduct = await checkCurrentImages(matches);

    // Step 4: Dry run
    await dryRun(matches, currentImagesByProduct);

    // Step 5: Execute (if not dry run)
    await executeImport(matches, currentImagesByProduct, DRY_RUN);

    // Step 6: Verify results (only if we executed)
    if (!DRY_RUN) {
      await verifyResults(matches);
    }

    console.log('\n========================================');
    console.log('NEXT STEPS:');
    console.log('========================================');
    console.log('1. Review the matches above');
    console.log('2. If matches look correct, set DRY_RUN = false');
    console.log('3. Run again to execute the import');
    console.log('4. For full import, set TEST_MODE = false');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
