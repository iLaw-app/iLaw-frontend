process.chdir(__dirname);
const sharp = require('./node_modules/sharp');

// Find actual content bounds (non-white rows) in the extracted image,
// then scale that region to 1576x3416
async function fix(num) {
  const src = `assets/tutorial/tutorial_${num}_fixed.png`;

  const { data, info } = await sharp(src)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Find last row that has any non-white/non-transparent pixel
  let contentBottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const a = channels === 4 ? data[i + 3] : 255;
      if (a > 10 && (r < 245 || g < 245 || b < 245)) {
        contentBottom = y;
        break;
      }
    }
  }
  contentBottom += 1; // exclusive end

  console.log(`tutorial_${num}: content bottom row = ${contentBottom} / ${height}`);

  await sharp(src)
    .extract({ left: 0, top: 0, width, height: contentBottom })
    .resize(1576, 3416, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(`assets/tutorial/tutorial_${num}_fixed2.png`);

  // Replace original with fixed
  require('fs').renameSync(
    `assets/tutorial/tutorial_${num}_fixed2.png`,
    `assets/tutorial/tutorial_${num}_fixed.png`
  );
  console.log(`✓ tutorial_${num}_fixed.png updated`);
}

(async () => {
  await fix(6);
  await fix(7);
  console.log('Done!');
})().catch(console.error);
