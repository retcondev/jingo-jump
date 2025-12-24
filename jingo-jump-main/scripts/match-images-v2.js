import { PrismaClient } from '../generated/prisma/index.js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const prisma = new PrismaClient();
const basePath = "/Users/mike/Library/CloudStorage/GoogleDrive-mike@retconmedia.com/My Drive/jingo jump images/Categories";

// Get all PNG files using find command
function getAllPngFiles() {
  const output = execSync(`find "${basePath}" -name "*.png" -type f`, { encoding: 'utf-8' });
  return output.trim().split('\n').filter(Boolean);
}

// Parse path to extract category and product folder
function parsePath(filePath) {
  const relativePath = filePath.replace(basePath + '/', '');
  const parts = relativePath.split('/');

  // Structure: Category/ProductFolder/filename.png
  // or Category/ProductFolder/Original/filename.png (skip original folders)

  const category = parts[0]; // e.g., "Bouncers 13 x 13", "Combo Units"
  const productFolder = parts[1]; // e.g., "Pink Castle", "Balloon Combo"
  const filename = parts[parts.length - 1];

  // Skip if it's in an 'original' subfolder
  const isOriginal = parts.some(p =>
    p.toLowerCase() === 'original' ||
    p.toLowerCase() === 'originals' ||
    p.toLowerCase() === 'orignals'
  );

  return {
    fullPath: filePath,
    category,
    productFolder,
    filename,
    isOriginal
  };
}

// Normalize for matching
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract size from folder or name (13, 15, 10x10, etc.)
function extractSize(str) {
  const match = str.match(/(\d+)\s*x\s*(\d+)/i) || str.match(/(\d+)x(\d+)/i);
  if (match) return `${match[1]}x${match[2]}`;

  // Check for just "13" or "15" at the end
  const sizeMatch = str.match(/\b(13|15)\b/);
  if (sizeMatch) return `${sizeMatch[1]}x${sizeMatch[1]}`;

  return null;
}

async function main() {
  // Get all products from database
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, category: true }
  });

  console.log(`Found ${products.length} products in database\n`);

  // Get all PNG files
  const pngFiles = getAllPngFiles();
  console.log(`Found ${pngFiles.length} PNG files\n`);

  // Parse all files
  const parsedFiles = pngFiles.map(parsePath).filter(f => !f.isOriginal);
  console.log(`After filtering originals: ${parsedFiles.length} files\n`);

  // Group by product folder
  const folderGroups = new Map();
  for (const file of parsedFiles) {
    const key = `${file.category}/${file.productFolder}`;
    if (!folderGroups.has(key)) {
      folderGroups.set(key, {
        category: file.category,
        productFolder: file.productFolder,
        files: []
      });
    }
    folderGroups.get(key).files.push(file);
  }

  console.log(`=== ${folderGroups.size} UNIQUE PRODUCT FOLDERS ===\n`);

  // Match each folder to a product
  const matches = [];
  const unmatched = [];

  for (const [key, group] of folderGroups) {
    const { category, productFolder, files } = group;
    const normalizedFolder = normalize(productFolder);
    const folderSize = extractSize(category) || extractSize(productFolder);

    // Determine expected DB category based on image folder category
    let expectedDbCategory = null;
    if (category.toLowerCase().includes('bouncer') && category.includes('13')) {
      expectedDbCategory = 'Bouncers 13 x 13';
    } else if (category.toLowerCase().includes('bouncer') && category.includes('15')) {
      expectedDbCategory = 'Bouncers 15x15';
    } else if (category.toLowerCase().includes('combo')) {
      expectedDbCategory = 'Combo Units';
    } else if (category.toLowerCase().includes('water') || category.toLowerCase().includes('slide')) {
      expectedDbCategory = null; // Various water slide categories
    }

    // Find best matching product
    let bestMatch = null;
    let matchScore = 0;

    for (const product of products) {
      const normalizedProduct = normalize(product.name);
      const productSize = extractSize(product.name) || extractSize(product.category || '');

      let score = 0;

      // Exact folder name match in product name
      if (normalizedProduct.includes(normalizedFolder) || normalizedFolder.includes(normalizedProduct)) {
        score += 10;
      }

      // Category match
      if (expectedDbCategory && product.category === expectedDbCategory) {
        score += 5;
      }

      // Size match
      if (folderSize && productSize && folderSize === productSize) {
        score += 3;
      }

      // Penalize if sizes don't match
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
        imageCategory: category,
        imageFolder: productFolder,
        productId: bestMatch.id,
        productName: bestMatch.name,
        productCategory: bestMatch.category,
        files: files.map(f => f.fullPath),
        score: matchScore
      });
    } else {
      unmatched.push({
        imageCategory: category,
        imageFolder: productFolder,
        files: files.map(f => f.fullPath),
        bestGuess: bestMatch ? `${bestMatch.name} (score: ${matchScore})` : 'none'
      });
    }
  }

  // Print matches
  console.log(`\n=== MATCHED (${matches.length}) ===\n`);
  for (const m of matches) {
    console.log(`✓ [${m.imageCategory}] "${m.imageFolder}"`);
    console.log(`  → "${m.productName}" [${m.productCategory}]`);
    console.log(`  Files: ${m.files.length}`);
    m.files.forEach(f => console.log(`    - ${path.basename(f)}`));
    console.log();
  }

  // Print unmatched
  console.log(`\n=== UNMATCHED FOLDERS (${unmatched.length}) ===\n`);
  for (const u of unmatched) {
    console.log(`✗ [${u.imageCategory}] "${u.imageFolder}"`);
    console.log(`  Best guess: ${u.bestGuess}`);
    console.log(`  Files: ${u.files.length}`);
    u.files.forEach(f => console.log(`    - ${path.basename(f)}`));
    console.log();
  }

  // Summary
  const totalImages = matches.reduce((sum, m) => sum + m.files.length, 0);
  console.log('\n=== SUMMARY ===');
  console.log(`Matched folders: ${matches.length}`);
  console.log(`Unmatched folders: ${unmatched.length}`);
  console.log(`Total images to import: ${totalImages}`);
}

main().then(() => prisma.$disconnect()).catch(e => {
  console.error(e);
  prisma.$disconnect();
});
