const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
// Pointing to your new PNG logo
const inputImage = path.join(__dirname, 'public', 'icons', 'logo.png');
const outputDir = path.join(__dirname, 'public', 'icons');

fs.mkdirSync(outputDir, { recursive: true });

Promise.all(
  sizes.map(size =>
    sharp(inputImage)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
      .then(() => console.log(`✓ icon-${size}x${size}.png created!`))
  )
).then(() => console.log('🎉 All 8 PWA icons generated successfully!'));