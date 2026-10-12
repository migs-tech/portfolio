// Crops and compresses the raw images in /source-images into web-ready assets.
// Run with: npm run images
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { MONOGRAM, MONOGRAM_COLORS, monogramSvg } from '../src/lib/monogram.js';

const SRC = 'source-images';
const OUT = 'src/assets/images';
await mkdir(OUT, { recursive: true });

// Phone screenshots from a real device: crop away the status bar.
const phoneCrop = (w, h) => ({ left: 0, top: 110, width: w, height: h - 110 });

const jobs = [
  // OJTrack mobile app, from a real device.
  { in: 'mobile-trainee-home.jpg', out: 'ojtrack-mobile-trainee', crop: phoneCrop(1080, 2400), sizes: [720, 360] },
  { in: 'mobile-supervisor-home.jpg', out: 'ojtrack-mobile-supervisor', crop: phoneCrop(1080, 2400), sizes: [720, 360] },
  { in: 'mobile-role-select.jpg', out: 'ojtrack-mobile-roles', crop: phoneCrop(1080, 2400), sizes: [720, 360] },
  // Live sites, captured headless at 1440px wide and 2x pixel density. Full-page
  // captures need no crop; section captures lose 4px at the top, where the
  // neighbouring section's border shows.
  { in: 'ojtrack-live-app.png', out: 'ojtrack-web-app', trimTop: 4, sizes: [1440, 720] },
  { in: 'ojtrack-live-steps.png', out: 'ojtrack-web-steps', trimTop: 4, sizes: [1440, 720] },
  { in: 'ojtrack-live-features.png', out: 'ojtrack-web-features', trimTop: 4, sizes: [1440, 720] },
  { in: 'ojtrack-live-rating.png', out: 'ojtrack-web-rating', trimTop: 4, sizes: [1440, 720] },
  { in: 'primesys-live-hero.png', out: 'primesys-web-landing', sizes: [1440, 720] },
  { in: 'primesys-live-stages.png', out: 'primesys-web-stages', sizes: [1440, 720] },
  { in: 'primesys-live-roles.png', out: 'primesys-web-roles', trimTop: 4, sizes: [1440, 720] },
  { in: 'primesys-live-features.png', out: 'primesys-web-features', trimTop: 4, sizes: [1440, 720] },
  { in: 'primesys-live-login.png', out: 'primesys-web-login', sizes: [1440, 720] },
  // The live PRimeSys landing page at phone width (390px, 2x).
  { in: 'primesys-live-mobile.png', out: 'primesys-mobile-landing', sizes: [720, 360] },
  // 909x909 headshot, cropped to the 4:5 portrait frame used in the hero.
  { in: 'portrait.jpg', out: 'portrait', crop: { left: 91, top: 0, width: 727, height: 909 }, sizes: [720, 480] },
  // Graduation photo for the back of the hero photo card; already 720x900 (4:5).
  { in: 'portrait-graduation.jpg', out: 'portrait-graduation', sizes: [720, 480] },
  // Round avatar (head and shoulders), used by the logo on hover, the footer and the contact card.
  { in: 'portrait.jpg', out: 'avatar', crop: { left: 110, top: 30, width: 690, height: 690 }, sizes: [320, 160] },
  // Certificates. Signatures are blurred (`redact`, in source pixels) before
  // anything is resized, and photo metadata such as GPS is dropped on output.
  // Only page 1 of the OJT certificate PDF is used: the other pages are other
  // students' certificates. Don't add a full transcript (TOR) here.
  {
    in: 'diploma.jpg',
    out: 'cert-diploma',
    redact: [
      { left: 192, top: 642, width: 86, height: 44 }, // Registrar
      { left: 492, top: 636, width: 160, height: 164 }, // Campus Director, SUC President
      { left: 818, top: 623, width: 80, height: 80 }, // VP for Academic Affairs (starts below the date line)
    ],
    sizes: [1170, 600],
  },
  {
    in: 'ojt-certificate.png',
    out: 'cert-ojt',
    redact: [{ left: 532, top: 1220, width: 176, height: 112 }], // Chief HR Officer
    sizes: [900, 450],
  },
];

// Blurs each `redact` region of the source image and returns the result as a buffer.
async function redacted(path, regions) {
  const base = await sharp(path).png().toBuffer();
  const patches = await Promise.all(
    regions.map(async (region) => ({
      input: await sharp(base).extract(region).blur(14).toBuffer(),
      left: region.left,
      top: region.top,
    })),
  );
  return sharp(base).composite(patches).png().toBuffer();
}

for (const job of jobs) {
  const source = job.redact ? await redacted(`${SRC}/${job.in}`, job.redact) : `${SRC}/${job.in}`;
  for (const width of job.sizes) {
    let img = sharp(source);
    if (job.trimTop) {
      const { width: w, height: h } = await img.metadata();
      img = img.extract({ left: 0, top: job.trimTop, width: w, height: h - job.trimTop });
    }
    if (job.crop) img = img.extract(job.crop);
    const suffix = width === job.sizes[0] ? '' : `-${width}`;
    const file = `${OUT}/${job.out}${suffix}.webp`;
    const info = await img.resize({ width, withoutEnlargement: true }).webp({ quality: 82, smartSubsample: true }).toFile(file);
    console.log(file, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
  }
}

// Open Graph preview image (1200x630).
const portrait = await sharp(`${SRC}/portrait.jpg`)
  .extract({ left: 150, top: 0, width: 609, height: 640 })
  .resize(420, 441)
  .toBuffer();

const ogText = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f5f4f0"/>
  <g stroke="#e3e1da" stroke-width="1">
    ${Array.from({ length: 21 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="630"/>`).join('')}
    ${Array.from({ length: 16 }, (_, i) => `<line x1="0" y1="${i * 40}" x2="800" y2="${i * 40}"/>`).join('')}
  </g>
  <g transform="translate(72 112) scale(1.25)">
    <rect width="64" height="64" rx="${MONOGRAM.radius}" fill="${MONOGRAM_COLORS.light.bg}"/>
    <path d="${MONOGRAM.letters}" fill="${MONOGRAM_COLORS.light.fg}" fill-rule="evenodd"/>
    <path d="${MONOGRAM.accent}" fill="${MONOGRAM_COLORS.light.accent}"/>
  </g>
  <text x="72" y="250" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="50" font-weight="700" fill="#16181d">Felix Miguel M. Atenin</text>
  <text x="72" y="312" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="32" fill="#2457c5">IT Support &amp; Web Developer</text>
  <text x="72" y="380" font-family="Consolas, Menlo, monospace" font-size="22" fill="#5b5f68">IT Support · Web Development · Mobile Development</text>
  <text x="72" y="540" font-family="Consolas, Menlo, monospace" font-size="20" fill="#5b5f68">Tandag City, Surigao del Sur, Philippines</text>
</svg>`);

await sharp(ogText)
  .composite([{ input: portrait, left: 1200 - 420 - 56, top: 94 }])
  .jpeg({ quality: 82 })
  .toFile('public/og-image.jpg');
console.log('public/og-image.jpg');

// Icons from the FA monogram (src/lib/monogram.js): browser tabs, phone home
// screens and the web manifest. The SVG favicon follows the system's dark mode.
await writeFile('public/favicon.svg', monogramSvg({ adaptive: true }));
console.log('public/favicon.svg');

for (const size of [32, 64, 192, 512]) {
  const file = `public/favicon-${size}.png`;
  await sharp(Buffer.from(monogramSvg({ size }))).png().toFile(file);
  console.log(file);
}

// iOS applies its own rounded corners, so the touch icon stays square.
await sharp(Buffer.from(monogramSvg({ size: 180, square: true }))).png().toFile('public/apple-touch-icon.png');
console.log('public/apple-touch-icon.png');
