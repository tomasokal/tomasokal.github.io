import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function addTrip() {
  console.log('\n🗺️  Photo Portfolio - Add Trip Wizard\n');
  
  const tripId = await question('Trip ID (e.g., japan-2024): ');
  const title = await question('Trip title (e.g., Japan Spring 2024): ');
  const description = await question('Trip description (e.g., Cherry blossoms and temples): ');
  const startDate = await question('Start date (YYYY-MM-DD): ');
  const endDate = await question('End date (YYYY-MM-DD): ');
  const locationName = await question('Location name (e.g., Japan): ');
  const lat = parseFloat(await question('Center latitude (e.g., 35.6762): '));
  const lng = parseFloat(await question('Center longitude (e.g., 139.6503): '));
  const coverPhotoId = await question('Cover photo ID (e.g., _DSC0001): ');

  const photosDir = path.join(__dirname, '../photos', tripId);

  // Create directory
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
    console.log(`✓ Created directory: ${photosDir}`);
  } else {
    console.log(`ℹ️  Directory already exists: ${photosDir}`);
  }

  // Create metadata template
  const metadata = {
    trip: {
      id: tripId,
      title: title,
      description: description,
      startDate: startDate,
      endDate: endDate,
      location: {
        name: locationName,
        center: [lat, lng]
      },
      coverPhotoId: coverPhotoId
    },
    locations: [
      { name: locationName, lat: lat, lng: lng, order: 0 }
    ],
    photos: [
      {
        id: '_DSC0001',
        title: 'Example Photo',
        description: 'Add your photo description here',
        location: locationName,
        date: new Date().toISOString(),
        exif: {
          camera: 'Your Camera Model',
          lens: 'Your Lens',
          focalLength: 50,
          aperture: 'f/2.8',
          shutterSpeed: '1/250',
          iso: 100
        }
      }
    ]
  };

  const metadataPath = path.join(photosDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`✓ Created metadata template: ${metadataPath}`);

  console.log('\n📝 Next steps:');
  console.log(`1. Copy your photos to: ${photosDir}`);
  console.log('2. Edit the metadata.json file with your photo details');
  console.log('3. Run: npm run build');
  console.log('4. Run: npm run dev (to preview locally)');
  console.log('5. Run: git add . && git commit && git push');
  console.log('\n✨ Done!\n');

  rl.close();
}

addTrip().catch(err => {
  console.error('✗ Error:', err.message);
  rl.close();
  process.exit(1);
});