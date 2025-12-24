import { PrismaClient } from '../generated/prisma/index.js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const basePath = "/Users/mike/Library/CloudStorage/GoogleDrive-mike@retconmedia.com/My Drive/jingo jump images/Categories";

// Helper to normalize names for matching
function normalize(name) {
  return name
    .toLowerCase()
    .replace(/13x13|15x15|13 x 13|15 x 15|13'x13'|15'x15'/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/[_-]/g, ' ')
    .trim();
}

async function main() {
  // Get all products
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, category: true }
  });

  // Get all image folders (excluding 'original' folders)
  const imageFolders = new Map();

  function walkDir(dir, category = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        const lowerName = entry.name.toLowerCase();

        // Skip 'original' folders
        if (lowerName === 'original' || lowerName === 'originals' || lowerName === 'orignals') {
          continue;
        }

        // Check if this folder has PNG files
        try {
          const files = fs.readdirSync(fullPath);
          const pngs = files.filter(f => f.toLowerCase().endsWith('.png'));
          if (pngs.length > 0) {
            imageFolders.set(entry.name, {
              path: fullPath,
              pngs: pngs,
              category: category || entry.name
            });
          }
        } catch (e) {}

        // Recurse into subdirs
        walkDir(fullPath, category || entry.name);
      }
    }
  }

  walkDir(basePath);

  console.log('=== IMAGE FOLDERS WITH PNGs ===');
  console.log('Total folders:', imageFolders.size);

  // Match products to folders
  const matches = [];
  const unmatchedFolders = [];
  const unmatchedProducts = [];

  for (const [folderName, folderInfo] of imageFolders) {
    const normalizedFolder = normalize(folderName);

    // Find matching product
    const match = products.find(p => {
      const normalizedProduct = normalize(p.name);
      return normalizedProduct === normalizedFolder ||
             normalizedProduct.includes(normalizedFolder) ||
             normalizedFolder.includes(normalizedProduct);
    });

    if (match) {
      matches.push({
        folder: folderName,
        product: match.name,
        productId: match.id,
        pngs: folderInfo.pngs,
        path: folderInfo.path
      });
    } else {
      unmatchedFolders.push({ folder: folderName, pngs: folderInfo.pngs });
    }
  }

  // Find products without matches
  const matchedProductIds = new Set(matches.map(m => m.productId));
  for (const p of products) {
    if (!matchedProductIds.has(p.id)) {
      const cat = p.category || '';
      // Only show products in relevant categories
      if (cat.includes('Bouncer') || cat.includes('Combo') || cat.includes('Water') || cat.includes('Slide')) {
        unmatchedProducts.push({ name: p.name, category: p.category });
      }
    }
  }

  console.log('\n=== MATCHED (' + matches.length + ') ===');
  matches.forEach(m => {
    console.log('✓ "' + m.folder + '" → "' + m.product + '" (' + m.pngs.length + ' PNGs)');
  });

  console.log('\n=== UNMATCHED FOLDERS (' + unmatchedFolders.length + ') ===');
  unmatchedFolders.forEach(f => {
    console.log('✗ "' + f.folder + '" (' + f.pngs.length + ' PNGs)');
  });

  console.log('\n=== PRODUCTS WITHOUT IMAGES (relevant categories) ===');
  console.log('Count:', unmatchedProducts.length);
  unmatchedProducts.slice(0, 30).forEach(p => {
    console.log('  "' + p.name + '" [' + p.category + ']');
  });
  if (unmatchedProducts.length > 30) {
    console.log('  ... and ' + (unmatchedProducts.length - 30) + ' more');
  }
}

main().then(() => prisma.$disconnect()).catch(e => {
  console.error(e);
  prisma.$disconnect();
});
