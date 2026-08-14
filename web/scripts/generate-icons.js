const sharp = require("sharp");
const path = require("path");

const publicDir = path.join(__dirname, "..", "public");

async function generateIcon(size, outputFile) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#ff385c"/>
  <text
    x="${size / 2}"
    y="${Math.round(size * 0.68)}"
    font-family="Arial Black, Arial, Helvetica, sans-serif"
    font-size="${Math.round(size * 0.54)}"
    font-weight="900"
    fill="white"
    text-anchor="middle"
  >A</text>
</svg>`;

  try {
    await sharp(Buffer.from(svg)).png().toFile(path.join(publicDir, outputFile));
    console.log(`✓ ${outputFile} (${size}x${size})`);
  } catch {
    // SVG text rendering failed — fall back to solid color
    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 255, g: 56, b: 92, alpha: 1 } },
    }).png().toFile(path.join(publicDir, outputFile));
    console.log(`✓ ${outputFile} (${size}x${size}, solid color fallback)`);
  }
}

async function main() {
  await generateIcon(512, "icon-512.png");
  await generateIcon(192, "icon-192.png");
  await generateIcon(180, "apple-touch-icon.png");
}

main().catch(console.error);
