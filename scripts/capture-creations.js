import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projects = [
  { id: 'PROJECT_001', slug: 'fortunato',     url: 'https://tomasokal.com/fortunato' },
  { id: 'PROJECT_002', slug: 'toggleSwitch',  url: 'https://tomasokal.com/toggleSwitch' },
  { id: 'PROJECT_003', slug: 'grid-1',        url: 'https://tomasokal.com/grid-1' },
  { id: 'PROJECT_004', slug: 'scifi-1',       url: 'https://tomasokal.com/scifi-1' },
];

// Viewport size for crisp screenshots (2x for retina-quality)
const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };

// How many seconds to let the page render/animate before capturing
const RENDER_DELAY_MS = 5000;

async function captureCreations() {
  const outputDir = path.join(__dirname, '../public/images/creations');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🚀 Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--mute-audio',           // silence any audio
      '--autoplay-policy=no-user-gesture-required',
      '--no-sandbox',
    ],
  });

  for (const project of projects) {
    const outPath = path.join(outputDir, `${project.slug}.webp`);

    // Skip if screenshot already exists (use --force flag to regenerate)
    if (!process.argv.includes('--force') && fs.existsSync(outPath)) {
      console.log(`⏭️  ${project.id} — ${project.slug}.webp already exists (use --force to overwrite)`);
      continue;
    }

    console.log(`\n📸 Capturing ${project.id} (${project.url})...`);

    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    try {
      await page.goto(project.url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Give Three.js / WebGL scenes time to render
      console.log(`   ⏳ Waiting ${RENDER_DELAY_MS / 1000}s for render...`);
      await new Promise((r) => setTimeout(r, RENDER_DELAY_MS));

      await page.screenshot({
        path: outPath,
        type: 'webp',
        quality: 85,
      });

      console.log(`   ✅ Saved ${project.slug}.webp`);
    } catch (err) {
      console.error(`   ❌ Failed to capture ${project.slug}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n🏁 Done! Screenshots saved to public/images/creations/');
}

captureCreations().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
