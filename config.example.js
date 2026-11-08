/* =====================================================================
   TORQ website — example settings (safe to share).

   To run the site with real details:
     1. Copy this file and name the copy  config.js
     2. Fill in the real values below
   config.js is listed in .gitignore, so your real phone number, Instagram
   and address are never uploaded to GitHub.

   On Netlify, config.js is created automatically from environment
   variables — see scripts/make-config.mjs.

   Leave a value empty ("") and the site shows "Contact us" instead.
   ===================================================================== */
window.TORQ = {
  // Contact ------------------------------------------------------------
  phone: "",                         // e.g. "+91 98765 43210" — shown on the site, used for "Call"
  whatsapp: "",                      // e.g. "919876543210" (country code + number, digits only)
  instagram: "",                     // e.g. "https://www.instagram.com/your_handle"

  // Location -----------------------------------------------------------
  city: "",                          // e.g. "Kochi" — shown in the hero
  address: "",                       // full address shown in "Plan Your Visit"
  mapsQuery: "",                     // what Google Maps searches for (usually the same as address)

  // Opening hours, e.g. "10:00 AM – 10:00 PM"
  hours: "",

  // Booking form: where requests are sent (the Netlify function).
  // Leave "" to skip it and open WhatsApp on the visitor's phone instead.
  bookingEndpoint: "/.netlify/functions/booking",

  // Time slots shown in the booking form ("Preferred Time") ------------
  timeSlots: [
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
    "6:00 PM - 8:00 PM",
    "8:00 PM - 10:00 PM",
  ],

  // WhatsApp messages ----------------------------------------------------
  // {track} is replaced with the track name the visitor was looking at.
  waGeneral: "Hi TORQ, I'd like to check ride availability.",
  waTrack: "Hi TORQ, I'd like to check availability for the {track}.",

  // Track duration and price (leave "" to show "Contact us") ------------
  tracks: {
    racing:       { name: "RC Racing Track",      duration: "", price: "" },
    offroad:      { name: "RC Off-Road Track",    duration: "", price: "" },
    construction: { name: "RC Construction Zone", duration: "", price: "" },
  },
};
