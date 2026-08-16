// Download the avatar pool (80 female + 20 male real portraits from
// randomuser.me), downscale, and emit base64 data URLs as avatars.json.
// Usage: node scripts/download-avatars.js
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const OUT = path.join(__dirname, "..", "avatars.json");

async function fetchBuf(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(url + " -> " + r.status);
  return Buffer.from(await r.arrayBuffer());
}

(async () => {
  const avatars = [];
  let failures = 0;

  // 80 female + 20 male portraits
  const urls = [];
  for (let i = 0; i < 80; i++) urls.push(`https://randomuser.me/api/portraits/women/${i}.jpg`);
  for (let i = 0; i < 20; i++) urls.push(`https://randomuser.me/api/portraits/men/${i}.jpg`);

  for (const url of urls) {
    try {
      const buf = await fetchBuf(url);
      const jpeg = await sharp(buf).resize(128, 128, { fit: "cover" }).jpeg({ quality: 78 }).toBuffer();
      avatars.push("data:image/jpeg;base64," + jpeg.toString("base64"));
    } catch (e) { failures++; console.log("fail:", url, e.message); }
  }

  fs.writeFileSync(OUT, JSON.stringify(avatars), "utf8");
  const bytes = avatars.reduce((a, b) => a + b.length, 0);
  console.log(`done: ${avatars.length} avatars, ~${(bytes / 1024).toFixed(0)}KB, failures=${failures}`);
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
