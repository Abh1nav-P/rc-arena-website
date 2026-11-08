/* =====================================================================
   Creates config.js at deploy time from Netlify environment variables,
   so the real phone number, Instagram and address never live in GitHub.

   Netlify → Site configuration → Environment variables:
     TORQ_PHONE       e.g. +91 98765 43210
     TORQ_WHATSAPP    e.g. 919876543210   (country code + number, digits only)
     TORQ_INSTAGRAM   e.g. https://www.instagram.com/your_handle
     TORQ_CITY        e.g. Kochi
     TORQ_ADDRESS     full address
     TORQ_MAPS_QUERY  optional — defaults to TORQ_ADDRESS
     TORQ_HOURS       optional, e.g. 10:00 AM – 10:00 PM

   Locally nothing happens if you already have your own config.js.
   ===================================================================== */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const env = process.env;
if (existsSync("config.js") && !env.NETLIFY) {
  console.log("config.js already exists — leaving it untouched.");
  process.exit(0);
}

const values = {
  phone: env.TORQ_PHONE,
  whatsapp: (env.TORQ_WHATSAPP || "").replace(/\D/g, ""),
  instagram: env.TORQ_INSTAGRAM,
  city: env.TORQ_CITY,
  address: env.TORQ_ADDRESS,
  mapsQuery: env.TORQ_MAPS_QUERY || env.TORQ_ADDRESS,
  hours: env.TORQ_HOURS,
};

let config = readFileSync("config.example.js", "utf8");
for (const [key, val] of Object.entries(values)) {
  if (!val) continue;
  // replace   key: "",   with the real (safely escaped) value
  config = config.replace(new RegExp(`(\\n\\s*${key}:\\s*)""`), `$1${JSON.stringify(String(val).trim())}`);
}
writeFileSync("config.js", config);
const filled = Object.keys(values).filter((k) => values[k]);
console.log(`config.js created (${filled.length ? filled.join(", ") : "no TORQ_* variables set — site will show 'Contact us'"})`);

// Put the city back into the page title & descriptions on the live site (helps local search)
if (env.TORQ_CITY) {
  const city = env.TORQ_CITY.trim().replace(/[<>"&]/g, "");
  let html = readFileSync("index.html", "utf8");
  html = html
    .replace("Construction Arena</title>", `Construction Arena in ${city}</title>`)
    .replace('content="TORQ is an RC gaming arena.', `content="TORQ is an RC gaming arena in ${city}.`)
    .replace("construction adventures. Book your ride", `construction adventures in ${city}. Book your ride`);
  writeFileSync("index.html", html);
  console.log(`index.html: city "${city}" added to title and descriptions`);
}
