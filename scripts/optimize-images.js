import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function optimizeImages() {
  const photosDir = path.join(__dirname, '../photos');
  const outputDir = path.join(__dirname, '../public/images');

  // Ensure output dir exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Check if photos directory exists
  if (!fs.existsSync(photosDir)) {
    console.log('ℹ️  No photos to optimize');
    return;
  }

  const tripFolders = fs.readdirSync(photosDir)
    .filter(f => {
      const fullPath = path.join(photosDir, f);
      return fs.statSync(fullPath).isDirectory();
    });

  let totalProcessed = 0;

  for (const tripFolder of tripFolders) {
    const tripPath = path.join(photosDir, tripFolder);
    const outputTripDir = path.join(outputDir, tripFolder);

    // Create trip output dir
    if (!fs.existsSync(outputTripDir)) {
      fs.mkdirSync(outputTripDir, { recursive: true });
    }

    // Get image files
    const files = fs.readdirSync(tripPath)
      .filter(f => /\.(jpg|jpeg|png)$/i.test(f));

    if (files.length === 0) {
      console.log(`⏭️  ${tripFolder} (no images)`);
      continue;
    }

    console.log(`\n📸 Processing ${tripFolder} (${files.length} images)...`);

    for (const file of files) {
      const inputPath = path.join(tripPath, file);
      const baseName = path.parse(file).name;
      const thumbPath = path.join(outputTripDir, `${baseName}-thumb.webp`);
      const mediumPath = path.join(outputTripDir, `${baseName}-medium.webp`);
      const fullPath = path.join(outputTripDir, `${baseName}.webp`);
      const jpgPath = path.join(outputTripDir, `${baseName}.jpg`);

      // Skip if already processed (write-once assumption)
      if (fs.existsSync(thumbPath) && fs.existsSync(mediumPath) && fs.existsSync(fullPath)) {
        console.log(`  ⏭️  ${baseName}`);
        totalProcessed++;
        continue;
      }

      try {
        // Thumbnail (300x300, WebP for grid view)
        await sharp(inputPath)
          .resize(300, 300, { fit: 'cover' })
          .webp({ quality: 80 })
          .toFile(thumbPath);

        // Medium (1000x1000, WebP for mobile/tablet)
        await sharp(inputPath)
          .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(mediumPath);

        // Full-res WebP (for desktop)
        await sharp(inputPath)
          .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 90 })
          .toFile(fullPath);

        // Fallback JPEG
        await sharp(inputPath)
          .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toFile(jpgPath);

        console.log(`  ✓ ${baseName}`);
        totalProcessed++;
      } catch (err) {
        console.error(`  ✗ ${baseName}: ${err.message}`);
      }
    }
  }

  console.log(`\n✓ Optimized ${totalProcessed} images`);
}

optimizeImages().catch(err => {
  console.error('✗ Image optimization failed:', err.message);
  process.exit(1);
});