/* =====================================================================
   TORQ booking → WhatsApp (Meta WhatsApp Business Cloud API)
   Runs on Netlify as a server function, so the access token stays secret.

   Environment variables (Netlify → Site configuration → Environment variables):
     WA_TOKEN            Permanent System User access token
     WA_PHONE_NUMBER_ID  "Phone number ID" of the business sender number
     WA_TO               Number that receives bookings, e.g. 91XXXXXXXXXX
     WA_TEMPLATE         Approved template name (default: new_booking_request)
     WA_TEMPLATE_LANG    Template language code (default: en)
     WA_API_VERSION      Graph API version (default: v23.0)
     ALLOWED_ORIGIN      Optional, e.g. https://torq.example – blocks other sites
   ===================================================================== */

const TRACKS = {
  racing: "RC Racing Track",
  offroad: "RC Off-Road Track",
  construction: "RC Construction Zone",
};
const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// Template parameters can't contain new lines, tabs or 4+ spaces in a row.
const clean = (v, max) => String(v ?? "").replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, max);

function cleanPhone(v) {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : "";
}

// a real calendar date in YYYY-MM-DD form (rejects things like 2026-13-45)
function validDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = new Date(s + "T00:00:00Z");
  return !isNaN(t) && t.toISOString().slice(0, 10) === s;
}

function istToday() {
  // today's date in India (UTC+5:30), as YYYY-MM-DD
  return new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { ok: false, error: "Method not allowed" });

  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && req.headers.get("origin") !== allowed) return json(403, { ok: false, error: "Forbidden" });

  let data;
  try { data = await req.json(); } catch { return json(400, { ok: false, error: "Invalid request" }); }

  // honeypot: real visitors never fill this hidden field
  if (data.company) return json(200, { ok: true });

  const name = clean(data.name, 60);
  const phone = cleanPhone(data.phone);
  const track = TRACKS[data.track];
  const date = String(data.date ?? "");
  const time = clean(data.time, 40);

  const errors = [];
  if (name.length < 2) errors.push("name");
  if (!phone) errors.push("phone");
  if (!track) errors.push("track");
  if (!validDate(date) || date < istToday()) errors.push("date");
  if (!time) errors.push("time");
  if (errors.length) return json(400, { ok: false, error: "Invalid fields", fields: errors });

  const [y, m, d] = date.split("-");
  const prettyDate = `${+d} ${MONTHS[+m - 1]} ${y}`;

  const { WA_TOKEN, WA_PHONE_NUMBER_ID, WA_TO } = process.env;
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID || !WA_TO) {
    console.error("WhatsApp env vars missing");
    return json(500, { ok: false, error: "Not configured" });
  }
  const version = process.env.WA_API_VERSION || "v23.0";

  let res;
  try {
    res = await fetch(`https://graph.facebook.com/${version}/${WA_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    signal: AbortSignal.timeout(8000), // never hang: the website falls back to WhatsApp after 12 s
    headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: WA_TO.replace(/\D/g, ""),
      type: "template",
      template: {
        name: process.env.WA_TEMPLATE || "new_booking_request",
        language: { code: process.env.WA_TEMPLATE_LANG || "en" },
        components: [{
          type: "body",
          parameters: [name, phone, track, prettyDate, time].map((text) => ({ type: "text", text })),
        }],
      },
    }),
    });
  } catch (err) {
    console.error("WhatsApp API unreachable", err && err.name, err && err.message);
    return json(504, { ok: false, error: "Could not send" });
  }

  if (!res.ok) {
    console.error("WhatsApp API error", res.status, await res.text());
    return json(502, { ok: false, error: "Could not send" });
  }
  return json(200, { ok: true });
};
