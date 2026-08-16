// Build lib/client.js: inject avatars.json into the AVATARS array and
// src/wechat-skin.css into the WECHAT_CSS literal. Index-based replacement
// (robust against the data URLs' content).
// Usage: node scripts/build.js
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const JS = path.join(ROOT, "lib", "client.js");
const AVATARS_JSON = path.join(ROOT, "avatars.json");
const CSS_SRC = path.join(ROOT, "src", "wechat-skin.css");

let avatars = [];
try {
  avatars = JSON.parse(fs.readFileSync(AVATARS_JSON, "utf8"));
} catch (e) {
  console.warn("avatars.json not found — building with an empty avatar pool:", e.message);
}

let css = fs.readFileSync(CSS_SRC, "utf8");
css = css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

let js = fs.readFileSync(JS, "utf8");

// --- replace AVATARS array (base64 data URLs never contain ']') ---
const avStart = js.indexOf("const AVATARS = ");
if (avStart < 0) { console.error("AVATARS declaration not found"); process.exit(1); }
const avEnd = js.indexOf("];", avStart);
if (avEnd < 0) { console.error("AVATARS array terminator not found"); process.exit(1); }
js = js.slice(0, avStart) + "const AVATARS = " + JSON.stringify(avatars) + ";" + js.slice(avEnd + 2);

// --- replace WECHAT_CSS literal ---
const cssMarker = "const WECHAT_CSS = `";
const cs = js.indexOf(cssMarker);
if (cs < 0) { console.error("WECHAT_CSS declaration not found"); process.exit(1); }
const ce = js.indexOf("`;", cs + cssMarker.length);
if (ce < 0) { console.error("WECHAT_CSS terminator not found"); process.exit(1); }
js = js.slice(0, cs) + "const WECHAT_CSS = `\n" + css + "\n`;" + js.slice(ce + 2);

fs.writeFileSync(JS, js, "utf8");
console.log(`built lib/client.js: ${js.length} bytes, ${avatars.length} avatars, css ${css.length} chars`);
