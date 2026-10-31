const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/.user_uploaded/media_1793407049510_d9ccd6f1.jpg';

async function generate() {
  console.log('1. Loading master image...');
  const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Flood fill background checkerboard detection
  const isBgCandidate = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const isGray = Math.abs(r - g) <= 12 && Math.abs(g - b) <= 12 && Math.abs(r - b) <= 12;
    const isBright = r > 190 && g > 190 && b > 190;
    if (isGray && isBright) {
      isBgCandidate[i] = 1;
    }
  }

  const isBg = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    queue.push(x, (height - 1) * width + x);
    isBg[x] = 1;
    isBg[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width, y * width + (width - 1));
    isBg[y * width] = 1;
    isBg[(y * width) + (width - 1)] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (const n of neighbors) {
      if (n !== -1 && !isBg[n] && isBgCandidate[n]) {
        isBg[n] = 1;
        queue.push(n);
      }
    }
  }

  // Create clean transparent RGBA
  const out = Buffer.alloc(width * height * 4);
  const BRAND_BLUE = [41, 161, 221]; // #29A1DD

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const sIdx = idx * 3;
      const dIdx = idx * 4;

      if (isBg[idx]) {
        out[dIdx] = 0;
        out[dIdx + 1] = 0;
        out[dIdx + 2] = 0;
        out[dIdx + 3] = 0;
        continue;
      }

      const r = data[sIdx];
      const g = data[sIdx + 1];
      const b = data[sIdx + 2];
      const diff = b - r;

      // Inside MERICA text area
      const isRibbon = (y >= 610 && y <= 725 && x >= 540 && x <= 800);

      if (isRibbon) {
        out[dIdx] = r;
        out[dIdx + 1] = g;
        out[dIdx + 2] = b;
        out[dIdx + 3] = 255;
      } else if (diff >= 110) {
        out[dIdx] = BRAND_BLUE[0];
        out[dIdx + 1] = BRAND_BLUE[1];
        out[dIdx + 2] = BRAND_BLUE[2];
        out[dIdx + 3] = 255;
      } else if (diff > 10) {
        const alpha = Math.min(255, Math.max(0, Math.round((diff / 140) * 255)));
        out[dIdx] = BRAND_BLUE[0];
        out[dIdx + 1] = BRAND_BLUE[1];
        out[dIdx + 2] = BRAND_BLUE[2];
        out[dIdx + 3] = alpha;
      } else {
        out[dIdx] = 0;
        out[dIdx + 1] = 0;
        out[dIdx + 2] = 0;
        out[dIdx + 3] = 0;
      }
    }
  }

  // Convert raw RGBA buffer to trimmed PNG
  const trimmedPngBuffer = await sharp(out, { raw: { width, height, channels: 4 } })
    .trim()
    .png()
    .toBuffer();

  const trimmedMeta = await sharp(trimmedPngBuffer).metadata();
  console.log('2. Master logo trimmed dimensions:', trimmedMeta.width, 'x', trimmedMeta.height);

  // Save transparent masters
  await sharp(trimmedPngBuffer).toFile('public/images/logo-icon-official.png');
  await sharp(trimmedPngBuffer).toFile('public/images/logo-icon-transparent.png');
  await sharp(trimmedPngBuffer).toFile('public/images/logo-nu.png');

  // Helper to place trimmed logo inside square canvas with padding
  async function makePaddedIcon(size, paddingRatio, bgColor = null) {
    const targetContentSize = Math.max(8, Math.round(size * (1 - paddingRatio * 2)));
    const resizedLogo = await sharp(trimmedPngBuffer)
      .resize({
        width: targetContentSize,
        height: targetContentSize,
        fit: 'inside',
        withoutEnlargement: false
      })
      .png()
      .toBuffer();

    let base = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: bgColor ? bgColor : { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });

    return base.composite([{
      input: resizedLogo,
      gravity: 'centre'
    }]).png().toBuffer();
  }

  // Favicons
  console.log('3. Generating favicons...');
  const fav16 = await makePaddedIcon(16, 0.05);
  const fav32 = await makePaddedIcon(32, 0.05);
  const fav48 = await makePaddedIcon(48, 0.05);

  fs.writeFileSync('public/favicon-16x16.png', fav16);
  fs.writeFileSync('public/favicon-32x32.png', fav32);
  fs.writeFileSync('public/favicon-48x48.png', fav48);

  // Multi-size favicon.ico
  function createIco(pngBuffers) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // ICO type
    header.writeUInt16LE(pngBuffers.length, 4); // count

    let offset = 6 + (pngBuffers.length * 16);
    const directoryEntries = [];
    for (const buf of pngBuffers) {
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      const entry = Buffer.alloc(16);
      entry.writeUInt8(w >= 256 ? 0 : w, 0);
      entry.writeUInt8(h >= 256 ? 0 : h, 1);
      entry.writeUInt8(0, 2); // palette
      entry.writeUInt8(0, 3); // reserved
      entry.writeUInt16LE(1, 4); // color planes
      entry.writeUInt16LE(32, 6); // bpp
      entry.writeUInt32LE(buf.length, 8); // size
      entry.writeUInt32LE(offset, 12); // offset
      offset += buf.length;
      directoryEntries.push(entry);
    }
    return Buffer.concat([header, ...directoryEntries, ...pngBuffers]);
  }

  const icoBuffer = createIco([fav16, fav32, fav48]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('src/app/favicon.ico', icoBuffer);
  console.log('Favicon.ico created successfully (size:', icoBuffer.length, 'bytes)');

  // App Icons
  console.log('4. Generating Mobile App Icons...');
  const BRAND_NAVY = { r: 10, g: 37, b: 64, alpha: 1 }; // #0A2540

  // 192x192 & 512x512 with brand navy background for home screen & splash
  const icon192 = await makePaddedIcon(192, 0.12, BRAND_NAVY);
  const icon512 = await makePaddedIcon(512, 0.12, BRAND_NAVY);
  fs.writeFileSync('public/icons/icon-192.png', icon192);
  fs.writeFileSync('public/icons/icon-512.png', icon512);

  // Maskable icons (with 20% safe margin as per W3C PWA spec)
  const maskable192 = await makePaddedIcon(192, 0.2, BRAND_NAVY);
  const maskable512 = await makePaddedIcon(512, 0.2, BRAND_NAVY);
  fs.writeFileSync('public/icons/icon-maskable-192.png', maskable192);
  fs.writeFileSync('public/icons/icon-maskable-512.png', maskable512);

  // Apple touch icon (180x180, iOS non-transparent standard)
  const appleTouch = await makePaddedIcon(180, 0.15, BRAND_NAVY);
  fs.writeFileSync('public/icons/apple-touch-icon.png', appleTouch);

  // Next.js App Router icons
  fs.writeFileSync('src/app/icon.png', icon512);
  fs.writeFileSync('src/app/apple-icon.png', appleTouch);

  // SVG wrappers
  const iconPngB64 = icon512.toString('base64');
  function makeSvg(size) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <image width="${size}" height="${size}" href="data:image/png;base64,${iconPngB64}" />
</svg>\n`;
  }
  fs.writeFileSync('public/icon.svg', makeSvg(64));
  fs.writeFileSync('src/app/icon.svg', makeSvg(64));
  fs.writeFileSync('public/icons/icon-192.svg', makeSvg(192));
  fs.writeFileSync('public/icons/icon-512.svg', makeSvg(512));

  console.log('All icons generated and written successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
