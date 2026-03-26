import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildMetadata() {
  const photosDir = path.join(__dirname, '../photos');
  const outputPath = path.join(__dirname, '../public/data.json');

  // Ensure public dir exists
  if (!fs.existsSync(path.join(__dirname, '../public'))) {
    fs.mkdirSync(path.join(__dirname, '../public'), { recursive: true });
  }

  // Check if photos directory exists
  if (!fs.existsSync(photosDir)) {
    console.log('ℹ️  No photos directory found. Creating placeholder data.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify({ trips: [], generatedAt: new Date().toISOString() }, null, 2)
    );
    return;
  }

  const trips = [];
  const tripFolders = fs.readdirSync(photosDir)
    .filter(f => {
      const fullPath = path.join(photosDir, f);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort()
    .reverse(); // Newest first

  let totalPhotos = 0;

  for (const tripFolder of tripFolders) {
    const metadataPath = path.join(photosDir, tripFolder, 'metadata.json');
    
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        trips.push(metadata);
        totalPhotos += metadata.photos.length;
      } catch (e) {
        console.error(`✗ Error parsing metadata for ${tripFolder}:`, e.message);
      }
    }
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify({ trips, generatedAt: new Date().toISOString() }, null, 2)
  );
  
  console.log(`✓ Generated data.json with ${trips.length} trips (${totalPhotos} photos)`);
}

buildMetadata().catch(err => {
  console.error('✗ Metadata build failed:', err.message);
  process.exit(1);
});