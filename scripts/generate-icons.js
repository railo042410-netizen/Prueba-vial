import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, drawFn) {
  // RGBA buffer with filter byte per row
  const rowStride = width * 4 + 1;
  const raw = Buffer.alloc(height * rowStride);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    raw[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw);

  function writeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(calculateCrc32(body), 0);
    return Buffer.concat([len, body, crc]);
  }

  function calculateCrc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    signature,
    writeChunk('IHDR', ihdr),
    writeChunk('IDAT', compressed),
    writeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawVialIcon(x, y, w, h) {
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background: Deep slate #020617
  let r = 2, g = 6, b = 23, a = 255;

  // Outer gold rim
  if (dist > 0.82 && dist < 0.90) {
    r = 245; g = 158; b = 11; // Amber #F59E0B
  } else if (dist >= 0.50 && dist <= 0.65) {
    // Steering wheel circle
    r = 251; g = 191; b = 36; // Amber gold
  } else if (dist < 0.22) {
    // Center hub
    r = 30; g = 41; b = 59; // Slate 800
    if (dist > 0.18) {
      r = 245; g = 158; b = 11; // Hub gold ring
    } else {
      // White car inside hub
      if (Math.abs(nx) < 0.10 && Math.abs(ny) < 0.08) {
        r = 255; g = 255; b = 255;
      }
    }
  }

  // Steering wheel spokes (horizontal and down)
  if (Math.abs(ny) < 0.06 && dist >= 0.20 && dist <= 0.55) {
    r = 251; g = 191; b = 36;
  }
  if (Math.abs(nx) < 0.06 && ny > 0.20 && ny < 0.55) {
    r = 251; g = 191; b = 36;
  }

  // Colombian flag accent bar at top
  if (ny > -0.78 && ny < -0.72 && Math.abs(nx) < 0.4) {
    r = 252; g = 209; b = 22; // Yellow
  } else if (ny >= -0.72 && ny < -0.68 && Math.abs(nx) < 0.4) {
    r = 0; g = 56; b = 147; // Blue
  } else if (ny >= -0.68 && ny < -0.64 && Math.abs(nx) < 0.4) {
    r = 206; g = 17; b = 38; // Red
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate all standard PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, drawVialIcon));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, drawVialIcon));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, drawVialIcon));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, drawVialIcon));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, drawVialIcon));

console.log('PWA icons successfully generated in /public/');
