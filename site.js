/* TORQ — site behaviour. Contact details come from config.js. */
(function () {
  "use strict";
  window.TORQ_READY = true; // tells the head safety-net that the script arrived
  var root = document.documentElement;
  var skipLoader = /\b(lite|failsafe)\b/.test(root.className); // Data Saver / 2G / script arrived late
  var C = window.TORQ || {};
  var tracks = C.tracks || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* =====================================================================
     Vehicles — original side-view illustrations, coloured with CSS vars
     ===================================================================== */
  function wheel(cx, cy, r, tread, hub) {
    return '<g class="v-wheel"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#0d0d0d"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - tread / 2 - 1) + '" fill="none" stroke="#2d2d2d" stroke-width="' + tread + '" stroke-dasharray="' + (tread * .9) + ' ' + (tread * .65) + '"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + hub + '" style="fill:var(--rim,#ccc)"/>' +
      '<path d="M' + cx + ' ' + (cy - hub) + 'V' + (cy + hub) + 'M' + (cx - hub) + ' ' + cy + 'H' + (cx + hub) + '" stroke="#111" stroke-width="3"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (hub / 3.5) + '" fill="#111"/></g>';
  }
  var VEHICLES = {
    buggy:
      '<svg viewBox="0 0 240 122" aria-hidden="true">' +
      '<g class="v-body">' +
      '<path d="M150 40 L164 4" stroke="#111" stroke-width="2.5" fill="none"/><circle cx="164" cy="4" r="3" style="fill:var(--vc2,#111)"/>' +
      '<path d="M46 58 L38 26 M60 58 L52 26" stroke="#111" stroke-width="5" fill="none"/>' +
      '<path d="M12 18 L76 22 L74 33 L14 29 Z" style="fill:var(--vc)"/><path d="M12 18 L76 22" stroke="#000" stroke-opacity=".35" stroke-width="2"/>' +
      '<path d="M64 62 L58 88 M178 60 L184 88" style="stroke:var(--vc2,#111)" stroke-width="6" stroke-dasharray="3 2" fill="none"/>' +
      '<path d="M24 74 L30 60 Q70 46 100 40 Q128 31 160 39 L198 53 Q216 59 222 72 L222 78 L24 78 Z" style="fill:var(--vc)"/>' +
      '<path d="M106 42 Q130 34 154 42 L148 55 L108 57 Z" fill="#111" fill-opacity=".88"/>' +
      '<path d="M30 70 L220 70" stroke="#000" stroke-opacity=".28" stroke-width="4"/>' +
      '<circle cx="80" cy="62" r="8" style="fill:var(--vc2,#111)"/>' +
      '<rect x="18" y="76" width="210" height="8" rx="3" fill="#161616"/>' +
      '</g>' + wheel(58, 94, 26, 6, 12) + wheel(186, 94, 26, 6, 12) + '</svg>',
    truck:
      '<svg viewBox="0 0 280 180" aria-hidden="true">' +
      '<g class="v-body">' +
      '<path d="M84 104 L78 130 M196 104 L202 130" style="stroke:var(--vc2,#111)" stroke-width="7" stroke-dasharray="4 3" fill="none"/>' +
      '<rect x="40" y="98" width="200" height="12" rx="3" fill="#161616"/>' +
      '<path d="M28 100 L30 76 L84 70 L106 42 L172 42 L190 70 L250 74 L254 100 Z" style="fill:var(--vc)"/>' +
      '<path d="M113 49 L166 49 L180 70 L102 70 Z" fill="#111" fill-opacity=".88"/>' +
      '<path d="M30 90 L252 92" stroke="#000" stroke-opacity=".3" stroke-width="7"/>' +
      '<rect x="116" y="32" width="46" height="7" fill="#111"/>' +
      '<circle cx="126" cy="35" r="4" fill="#FFE27A"/><circle cx="139" cy="35" r="4" fill="#FFE27A"/><circle cx="152" cy="35" r="4" fill="#FFE27A"/>' +
      '<rect x="246" y="78" width="9" height="7" fill="#FFF6C0"/>' +
      '</g>' + wheel(70, 138, 40, 10, 18) + wheel(212, 138, 40, 10, 18) + '</svg>',
    digger:
      '<svg viewBox="0 0 320 220" aria-hidden="true">' +
      '<g class="ex-base">' +
      '<rect x="20" y="168" width="170" height="38" rx="19" fill="#141414"/>' +
      '<rect class="ex-tread" x="24" y="172" width="162" height="30" rx="15" fill="none" stroke="#3a3a3a" stroke-width="5" stroke-dasharray="6 5"/>' +
      '<circle cx="42" cy="187" r="10" fill="#2a2a2a"/><circle cx="74" cy="187" r="10" fill="#2a2a2a"/><circle cx="106" cy="187" r="10" fill="#2a2a2a"/><circle cx="138" cy="187" r="10" fill="#2a2a2a"/><circle cx="168" cy="187" r="10" fill="#2a2a2a"/>' +
      '<path d="M24 166 L24 128 L40 120 L150 120 L162 132 L162 166 Z" style="fill:var(--vc)"/>' +
      '<rect x="16" y="128" width="28" height="34" rx="6" fill="#1b1b1b"/>' +
      '<path d="M30 156 H150" stroke="#111" stroke-width="8" stroke-dasharray="10 10"/>' +
      '<path d="M108 120 L108 70 L148 70 L160 120 Z" style="fill:var(--vc)"/>' +
      '<path d="M114 76 L144 76 L152 114 L114 114 Z" fill="#111" fill-opacity=".85"/>' +
      '<rect x="60" y="106" width="8" height="16" fill="#111"/>' +
      '</g>' +
      '<g class="ex-boom">' +
      '<path d="M140 136 L148 118 L236 52 L248 64 L160 138 Z" style="fill:var(--vc)"/>' +
      '<path d="M152 150 L210 94" stroke="#bfbfbf" stroke-width="6"/>' +
      '<circle cx="150" cy="128" r="6" fill="#111"/>' +
      '<g class="ex-arm">' +
      '<path d="M232 56 L248 50 L276 148 L262 152 Z" style="fill:var(--vc)"/>' +
      '<circle cx="240" cy="58" r="6" fill="#111"/>' +
      '<g class="ex-bucket">' +
      '<path d="M262 146 L286 144 L294 172 L270 184 L250 176 Z" fill="#2a2a2a"/>' +
      '<path d="M252 178 l-5 7 M261 182 l-4 7 M270 185 l-3 7" stroke="#2a2a2a" stroke-width="4"/>' +
      '<circle cx="269" cy="150" r="5" fill="#111"/>' +
      '</g></g></g></svg>',
  };
  $$("[data-vehicle]").forEach(function (el) { el.innerHTML = VEHICLES[el.getAttribute("data-vehicle")] || ""; });

  /* =====================================================================
     Torn paper edges (random jagged clip-paths)
     ===================================================================== */
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function tornClip(edges, amp) {
    var all = edges === "all", pts = [], x, y;
    var top = all || edges.indexOf("top") > -1, bottom = all || edges.indexOf("bottom") > -1;
    if (top) { for (x = 0; x <= 100; x += 1.5 + rnd() * 3) pts.push(x.toFixed(1) + "% " + (rnd() * amp).toFixed(1) + "px"); pts.push("100% " + (rnd() * amp).toFixed(1) + "px"); }
    else { pts.push("0 0", "100% 0"); }
    if (all) for (y = 4; y < 96; y += 4 + rnd() * 8) pts.push("calc(100% - " + (rnd() * amp * .7).toFixed(1) + "px) " + y.toFixed(1) + "%");
    if (bottom) { for (x = 100; x >= 0; x -= 1.5 + rnd() * 3) pts.push(x.toFixed(1) + "% calc(100% - " + (rnd() * amp).toFixed(1) + "px)"); pts.push("0 calc(100% - " + (rnd() * amp).toFixed(1) + "px)"); }
    else { pts.push("100% 100%", "0 100%"); }
    if (all) for (y = 96; y > 4; y -= 4 + rnd() * 8) pts.push((rnd() * amp * .7).toFixed(1) + "px " + y.toFixed(1) + "%");
    return "polygon(" + pts.join(",") + ")";
  }
  $$("[data-torn]").forEach(function (el) {
    var edges = el.getAttribute("data-torn");
    var amp = /zone|section|footer|ld-half/.test(el.className) ? 14 : 8;
    el.style.clipPath = tornClip(edges, amp);
  });

  /* =====================================================================
     Paint & mud splats
     ===================================================================== */
  function splatSVG(color) {
    var n = 16, R = 46, pts = [], i, a, r;
    for (i = 0; i < n; i++) {
      a = (i / n) * Math.PI * 2 + rnd() * .2;
      r = R * (.72 + rnd() * .35);
      if (rnd() < .28) r = R * (1.3 + rnd() * .55);
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (i = 0; i < n; i++) { // smooth closed curve (Catmull-Rom → Bézier)
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }
    var extra = "";
    for (i = 0; i < 6; i++) { // droplets
      a = rnd() * Math.PI * 2; r = R * (1.5 + rnd() * .9);
      extra += '<circle cx="' + (Math.cos(a) * r).toFixed(1) + '" cy="' + (Math.sin(a) * r).toFixed(1) + '" r="' + (2 + rnd() * 6).toFixed(1) + '"/>';
    }
    for (i = 0; i < 2; i++) { // drips
      var dx = -20 + rnd() * 40, len = 20 + rnd() * 40;
      extra += '<path d="M' + dx.toFixed(1) + ' 20 V' + (40 + len).toFixed(1) + '" stroke="' + color + '" stroke-width="' + (5 + rnd() * 5).toFixed(1) + '" stroke-linecap="round"/>';
    }
    return '<svg viewBox="-100 -100 200 200" fill="' + color + '"><path d="' + d + '"/>' + extra + "</svg>";
  }
  $$("[data-splats]").forEach(function (box) {
    var count = +box.getAttribute("data-splats");
    var mud = box.getAttribute("data-color") === "mud";
    var wall = box.getAttribute("data-place") === "wall"; // hero: paint only around the photos, never behind text
    var colors = mud ? ["#3B2513", "#4E321A", "#2A1A0D", "#5A3A1E"] : ["#0a0908", "#0a0908", "#FFC400", "#E4572E", "#0a0908"];
    for (var i = 0; i < count; i++) {
      var s = document.createElement("span");
      s.className = "splat";
      var size = mud ? 120 + rnd() * 200 : 70 + rnd() * 150;
      // keep splats toward the edges so they frame the content
      var left = wall ? (rnd() < .5 ? -4 + rnd() * 14 : 90 + rnd() * 14) : rnd() < .5 ? rnd() * 22 : 74 + rnd() * 24;
      var top = mud ? rnd() * 70 : wall ? 5 + rnd() * 90 : 8 + rnd() * 84;
      if (wall) size *= .8;
      s.style.cssText = "width:" + size + "px;height:" + size + "px;left:" + left + "%;top:" + top + "%;margin:-" + size / 2 + "px 0 0 -" + size / 2 + "px;--sr:" + Math.round(rnd() * 360) + "deg;--sd:" + (0.2 + i * 0.12).toFixed(2) + "s;--so:" + (mud ? .92 : colors[i % colors.length] === "#0a0908" ? .55 : .8);
      s.innerHTML = splatSVG(colors[i % colors.length]);
      box.appendChild(s);
    }
  });

  /* =====================================================================
     Links built from config
     ===================================================================== */
  var waDigits = String(C.whatsapp || "").replace(/\D/g, "");
  var phoneDigits = String(C.phone || "").replace(/[^\d+]/g, "");
  var telHref = phoneDigits ? "tel:" + phoneDigits : "#contact";
  var mapsQuery = encodeURIComponent(C.mapsQuery || C.address || "");
  var directionsHref = "https://www.google.com/maps/dir/?api=1&destination=" + mapsQuery;
  var lastTrack = null; // the track the visitor last looked at

  function waHref(trackKey) {
    var t = trackKey && tracks[trackKey];
    var msg = t ? String(C.waTrack || "").replace("{track}", t.name) : C.waGeneral || "";
    return "https://wa.me/" + waDigits + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }
  function waDisplay() {
    if (waDigits.length === 12 && waDigits.indexOf("91") === 0) return "+91 " + waDigits.slice(2, 7) + " " + waDigits.slice(7);
    return waDigits ? "+" + waDigits : "";
  }
  function contactUs(trackKey) {
    var a = document.createElement("a");
    a.className = "pending";
    a.href = waHref(trackKey);
    a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Contact us";
    return a;
  }
  // "https://www.instagram.com/<handle>?utm…" → "@<handle>"
  var igHandle = (String(C.instagram || "").match(/instagram\.com\/([A-Za-z0-9_.]+)/) || [])[1];
  var values = { address: C.address, hours: C.hours, phone: C.phone, whatsappDisplay: waDisplay(), instagramHandle: igHandle ? "@" + igHandle : "" };
  // city label in the hero ("RC Gaming Arena // <city>") — simply hidden when not set
  $$("[data-city]").forEach(function (el) {
    if (!C.city) return; // stays hidden
    el.querySelector("b").textContent = C.city;
    el.hidden = false;
  });
  $$("[data-bind]").forEach(function (el) {
    var v = values[el.getAttribute("data-bind")];
    if (v) el.textContent = v;
    else { el.textContent = "Contact us"; el.classList.add("pending"); }
  });
  $$("[data-tel]").forEach(function (a) { a.href = telHref; });
  $$("[data-directions]").forEach(function (a) { a.href = directionsHref; });
  $$("[data-instagram]").forEach(function (a) { a.href = C.instagram || "#"; });
  function resolveWa(a) {
    var mode = a.getAttribute("data-wa");
    a.href = waHref(mode === "last" ? lastTrack : mode === "general" ? null : mode);
  }
  $$("[data-wa]").forEach(function (a) {
    resolveWa(a);
    a.addEventListener("click", function () { resolveWa(a); });
  });
  $$("[data-field]").forEach(function (cell) {
    var key = cell.getAttribute("data-key");
    var v = (tracks[key] || {})[cell.getAttribute("data-field")];
    cell.textContent = "";
    if (v) cell.textContent = v; else cell.appendChild(contactUs(key));
  });
  $$(".ticket .t-more").forEach(function (a) { a.addEventListener("click", function () { lastTrack = a.closest(".ticket").getAttribute("data-track"); }); });

  /* =====================================================================
     Header: mobile menu
     ===================================================================== */
  var header = $(".header");
  var waFloat = $(".wa-float");
  var hero = $(".hero");
  var menuBtn = $(".menu-btn");
  var nav = $("#nav");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false); });

  /* =====================================================================
     Loader — the buggy drives the progress bar
     ===================================================================== */
  var loader = $("#loader");
  var heroCar = $(".hero-car");
  function startPage() {
    document.body.classList.add("loaded");
    if (heroCar && !reduceMotion) {
      setTimeout(function () { heroCar.classList.add("spin"); }, 1300);
      setTimeout(function () { heroCar.classList.remove("spin"); }, 3200);
    }
    onScroll();
  }
  if (!loader || reduceMotion || skipLoader) {
    if (loader) loader.remove();
    startPage();
  } else {
    var ldPct = $("#ldPct"), ldTip = $("#ldTip"), ldCar = $("#ldCar");
    ldCar.classList.add("spin");
    document.documentElement.style.overflow = "hidden";
    var TIPS = ["Charging the batteries…", "Pumping the tyres…", "Grading the dirt…", "Fuelling the excavator…", "Checking the start lights…", "Warming up the engines…"];
    var tipI = 0;
    var tipTimer = setInterval(function () { tipI = (tipI + 1) % TIPS.length; ldTip.textContent = TIPS[tipI]; }, 650);

    // real progress: only what the first screen needs (fonts + wall texture).
    // Photos keep loading in the background and slap in when ready.
    var jobs = [], done = 0;
    if (document.fonts && document.fonts.ready) jobs.push(document.fonts.ready);
    jobs.push(new Promise(function (res) { var i = new Image(); i.onload = i.onerror = res; i.src = "assets/tex/concrete.jpg"; }));
    jobs.forEach(function (j) { j.then(function () { done++; }); });

    // first visit: a short show (~1s); refresh in the same session: near-instant
    var seen = false;
    try { seen = sessionStorage.getItem("torqLoaded") === "1"; sessionStorage.setItem("torqLoaded", "1"); } catch (e) {}
    var t0 = performance.now(), shown = 0, finished = false, MIN = seen ? 350 : 1000, MAX = 2500;
    var finish = function () {
      if (finished) return;
      finished = true;
      clearInterval(tipTimer);
      loader.style.setProperty("--p", 1);
      ldPct.textContent = "100";
      ldTip.textContent = "GO GO GO!";
      setTimeout(function () {
        loader.classList.add("done");
        document.documentElement.style.overflow = "";
        setTimeout(startPage, 300);
        setTimeout(function () { loader.remove(); }, 900);
      }, 80);
    };
    (function tick(now) {
      if (finished) return;
      var el = now - t0;
      var real = jobs.length ? done / jobs.length : 1;
      if (el > MAX) real = 1;
      var cap = Math.min(real, el / MIN);
      shown += (cap - shown) * 0.25;
      if (cap - shown < 0.01) shown = cap;
      loader.style.setProperty("--p", shown.toFixed(4));
      ldPct.textContent = Math.round(shown * 100);
      if (shown >= 0.999) finish(); else requestAnimationFrame(tick);
    })(t0);
    // hard stop that doesn't rely on animation frames (low-power mode / throttled tabs)
    setTimeout(finish, MAX + 300);
    loader.addEventListener("click", finish);
    document.addEventListener("keydown", function k() { finish(); document.removeEventListener("keydown", k); });
  }

  /* =====================================================================
     Off-road terrain + monster truck rig
     ===================================================================== */
  var zoneOff = $("#zone-offroad");
  var truckRig = $(".truck-rig", zoneOff), truck = $(".truck", zoneOff), dustLayer = $(".dust-layer", zoneOff);
  var TERR_H = 220;
  function groundH(xn) { // ground height in px (from bottom) at normalised x
    var t = Math.PI * 2 * xn;
    return TERR_H * (0.3 + 0.12 * Math.sin(t * 2.2 + .5) + 0.06 * Math.sin(t * 5.3 + 1.7) + 0.025 * Math.sin(t * 13));
  }
  (function buildTerrain() {
    var d = "M0 " + TERR_H;
    // small random jitter gives a rough, rocky edge without a costly SVG filter
    for (var x = 0; x <= 1440; x += 8) d += " L" + x + " " + (TERR_H - groundH(x / 1440) + (rnd() - 0.5) * 7).toFixed(1);
    d += " L1440 " + TERR_H + " Z";
    $("#terrainPath").setAttribute("d", d);
  })();
  var lastTruckX = null, lastDust = 0;
  var M = {}; // cached layout sizes (measured on load/resize, never mid-scroll)
  function updateTruck(p) {
    var W = M.rigW, w = M.truckW;
    var x = lerp(-w * 1.1, W + w * 0.1, clamp01((p - 0.12) / 0.76));
    var rear = x + w * 0.25, front = x + w * 0.757;
    var h1 = groundH(rear / W), h2 = groundH(front / W);
    var ang = Math.atan2(h2 - h1, front - rear) * 180 / Math.PI;
    truck.style.transform = "translate(" + x.toFixed(1) + "px," + (-(h1 + h2) / 2 + 4).toFixed(1) + "px) rotate(" + (-ang).toFixed(2) + "deg)";
    truck.style.setProperty("--wr", ((x / (w * 40 / 280)) * 180 / Math.PI).toFixed(1) + "deg");
    if (lastTruckX !== null && Math.abs(x - lastTruckX) > 1.5 && performance.now() - lastDust > 45) {
      lastDust = performance.now();
      var dz = document.createElement("i");
      dz.className = "dust";
      dz.style.left = (rear - w * 0.1).toFixed(0) + "px";
      dz.style.top = (M.offH - h1 - 8).toFixed(0) + "px";
      dz.style.setProperty("--dx", (x > lastTruckX ? -70 : 70) + "px");
      dustLayer.appendChild(dz);
      setTimeout(function () { dz.remove(); }, 1200);
    }
    lastTruckX = x;
  }

  /* =====================================================================
     Construction: digger drives with scroll, drops sand every dig cycle
     ===================================================================== */
  var zoneCon = $("#zone-construction");
  var diggerRig = $(".digger-rig", zoneCon), sandLayer = $(".sand-layer", zoneCon);
  function dropSand() {
    if (zoneCon.classList.contains("is-paused") || document.hidden) return; // nobody is watching
    var bucket = $(".ex-bucket", diggerRig);
    if (!bucket) return;
    var b = bucket.getBoundingClientRect(), z = sandLayer.getBoundingClientRect();
    for (var i = 0; i < 16; i++) {
      var g = document.createElement("i");
      g.className = "sand";
      g.style.left = (b.left - z.left + b.width * (.3 + Math.random() * .5)).toFixed(0) + "px";
      g.style.top = (b.top - z.top + b.height * .7).toFixed(0) + "px";
      g.style.setProperty("--sx", (Math.random() * 40 - 10).toFixed(0) + "px");
      g.style.setProperty("--sy", (60 + Math.random() * 80).toFixed(0) + "px");
      g.style.animationDelay = (Math.random() * .3).toFixed(2) + "s";
      sandLayer.appendChild(g);
      (function (el) { setTimeout(function () { el.remove(); }, 1600); })(g);
    }
  }
  function startDigger() {
    diggerRig.classList.add("dig");
    setTimeout(function () { dropSand(); setInterval(dropSand, 4000); }, 3500); // bucket dumps at ~88% of the 4s cycle
  }

  /* =====================================================================
     Route: the car drives past each booking step
     ===================================================================== */
  var route = $("#route"), roadCar = $(".road-car", route), steps = $$(".step", route);
  var wide = window.matchMedia("(min-width: 900px)");
  var carIdle = null, lastRp = -1;
  function updateRoute(r, vh) {
    var rp = clamp01((vh * 0.72 - r.top) / r.height);
    route.style.setProperty("--rp", rp.toFixed(4));
    steps.forEach(function (s, i) { s.classList.toggle("on", rp >= M.stepPos[i] - 0.02); });
    if (Math.abs(rp - lastRp) > 0.0005 && !reduceMotion) {
      roadCar.classList.add("spin");
      clearTimeout(carIdle);
      carIdle = setTimeout(function () { roadCar.classList.remove("spin"); }, 160);
    }
    lastRp = rp;
  }

  /* =====================================================================
     Scroll loop: header, progress, live scenes, zones
     ===================================================================== */
  var liveEls = $$(".zone, .tapes, .footer");
  var zones = $$(".zone");
  var pausables = $$(".hero, .tapes, .zone, .footer"); // looping animations stop when off-screen
  var ticking = false;
  function goLive(el) {
    el.classList.add("is-live");
    if (el === zoneCon && !reduceMotion) startDigger();
  }
  function measure() {
    M.vh = window.innerHeight;
    M.heroH = hero.offsetHeight;
    M.max = document.documentElement.scrollHeight - M.vh;
    M.rigW = truckRig.clientWidth;
    M.truckW = truck.offsetWidth;
    M.offH = zoneOff.offsetHeight;
    M.stepPos = steps.map(function (s) {
      return wide.matches ? (s.offsetLeft + s.offsetWidth / 2) / route.offsetWidth : (s.offsetTop + s.offsetHeight / 2) / route.offsetHeight;
    });
  }
  measure();
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      // 1) READ everything first (no layout thrashing)…
      var y = window.scrollY, vh = M.vh;
      var liveR = liveEls.map(function (el) { return el.getBoundingClientRect(); });
      var zoneR = zones.map(function (z) { return z.getBoundingClientRect(); });
      var pauseR = pausables.map(function (el) { return el.getBoundingClientRect(); });
      var ro = zoneR[1], rc = zoneR[2];
      var routeR = route.getBoundingClientRect();
      var revR = reveals.map(function (el) { return el.getBoundingClientRect().top; });

      // 2) …then WRITE
      header.classList.toggle("is-scrolled", y > 12);
      waFloat.classList.toggle("is-visible", y > M.heroH * 0.6);
      header.style.setProperty("--p", M.max > 0 ? Math.min(1, y / M.max).toFixed(4) : 0);

      pausables.forEach(function (el, i) {
        el.classList.toggle("is-paused", pauseR[i].bottom < -100 || pauseR[i].top > vh + 100);
      });
      liveEls = liveEls.filter(function (el, i) {
        if (liveR[i].top < vh * 0.75 && liveR[i].bottom > 0) { goLive(el); return false; }
        return true;
      });
      zoneR.forEach(function (r, i) {
        if (r.top < vh * 0.5 && r.bottom > vh * 0.5) lastTrack = zones[i].getAttribute("data-zone");
      });
      if (ro.bottom > 0 && ro.top < vh) updateTruck(clamp01((vh - ro.top) / (ro.height + vh)));
      if (rc.bottom > 0 && rc.top < vh) diggerRig.style.setProperty("--dx", ((0.5 - clamp01((vh - rc.top) / (rc.height + vh))) * 180).toFixed(1) + "px");
      if (routeR.bottom > 0 && routeR.top < vh) updateRoute(routeR, vh);
      revealFallback(revR, vh);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  var resizeT = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { measure(); onScroll(); }, 120);
  }, { passive: true });
  window.addEventListener("load", function () { measure(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); onScroll(); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  function revealFallback(tops, vh) { // safety net for anchor jumps / fast flicks
    if (!reveals.length) return;
    reveals = reveals.filter(function (el, i) {
      if (el.classList.contains("is-in")) return false;
      if (tops[i] < vh * 1.1) { el.classList.add("is-in"); return false; } // start just before it's on screen
      return true;
    });
  }

  /* Scrolling is left 100% to the browser (its own smooth scrolling is the most responsive);
     a script-driven "smooth wheel" felt laggy whenever the page was busy. */
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
    liveEls.forEach(goLive);
    liveEls = [];
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px 12% 0px", threshold: 0 }); // fire slightly before entering the screen
    reveals.forEach(function (el) { io.observe(el); });
  }
  onScroll();

  /* =====================================================================
     Booking form → WhatsApp
     ===================================================================== */
  var bookModal = $("#bookModal");
  var form = $("#bookForm");
  var doneBox = $("#bookDone");
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

  var timeSel = $("#bfTime");
  (C.timeSlots || []).forEach(function (slot) {
    var o = document.createElement("option");
    o.value = o.textContent = slot;
    timeSel.appendChild(o);
  });

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function prettyDate(iso) { // 2026-11-15 → 15 November 2026
    var p = iso.split("-");
    return +p[2] + " " + MONTHS[+p[1] - 1] + " " + p[0];
  }
  function cleanPhone(v) { // accepts +91 / 0 prefixes, spaces, dashes
    var d = String(v).replace(/\D/g, "");
    if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
    if (d.length === 11 && d.charAt(0) === "0") d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : "";
  }
  function setError(input, errEl, show) {
    errEl.hidden = !show;
    if (input) input.setAttribute("aria-invalid", show ? "true" : "false");
    return !show;
  }

  function openBooking(trackKey) {
    form.hidden = false;
    doneBox.hidden = true;
    $$(".field-error, .form-error", form).forEach(function (e) { e.hidden = true; });
    $$("[aria-invalid]", form).forEach(function (e) { e.removeAttribute("aria-invalid"); });
    $("#bfDate").min = todayISO();
    if (trackKey && tracks[trackKey]) {
      lastTrack = trackKey;
      var r = $('input[name="track"][value="' + trackKey + '"]', form);
      if (r) r.checked = true;
    }
    if (typeof bookModal.showModal === "function") {
      bookModal.showModal();
      document.body.style.overflow = "hidden";
      setTimeout(function () { $("#bfName").focus(); }, 50);
    } else {
      window.open(waHref(trackKey), "_blank", "noopener");
    }
  }

  $$("[data-book]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-book");
      openBooking(mode === "last" ? lastTrack : mode);
    });
  });
  $(".modal-close", bookModal).addEventListener("click", function () { bookModal.close(); });
  bookModal.addEventListener("click", function (e) { if (e.target === bookModal) bookModal.close(); });
  bookModal.addEventListener("close", function () { document.body.style.overflow = ""; });

  form.addEventListener("input", function (e) {
    var err = e.target.getAttribute("aria-describedby");
    if (err && e.target.getAttribute("aria-invalid") === "true") setError(e.target, $("#" + err), false);
    if (e.target.name === "track") $("#bfTrackErr").hidden = true;
  });
  form.addEventListener("change", function (e) {
    if (e.target.name === "track") { $("#bfTrackErr").hidden = true; lastTrack = e.target.value; }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#bfName").value.trim().replace(/\s+/g, " ");
    var phone = cleanPhone($("#bfPhone").value);
    var trackInput = $('input[name="track"]:checked', form);
    var date = $("#bfDate").value;
    var time = timeSel.value;

    var ok = [
      setError($("#bfName"), $("#bfNameErr"), name.length < 2),
      setError($("#bfPhone"), $("#bfPhoneErr"), !phone),
      setError(null, $("#bfTrackErr"), !trackInput),
      setError($("#bfDate"), $("#bfDateErr"), !date || date < todayISO()),
      setError(timeSel, $("#bfTimeErr"), !time),
    ];
    if (ok.indexOf(false) !== -1) {
      var firstErr = $(".field-error:not([hidden])", form);
      var field = firstErr && firstErr.closest(".field").querySelector("input, select");
      if (field) field.focus();
      return;
    }

    var msg = [
      "New Booking Request - TORQ",
      "Name: " + name,
      "Phone: " + phone,
      "Track: " + tracks[trackInput.value].name,
      "Date: " + prettyDate(date),
      "Preferred Time: " + time,
    ].join("\n");
    var url = "https://wa.me/" + waDigits + "?text=" + encodeURIComponent(msg);
    var payload = {
      name: name, phone: phone, track: trackInput.value, date: date, time: time,
      company: $("#bfCompany").value,
    };

    // No server (or opened as a local file): open WhatsApp on the visitor's phone.
    var endpoint = C.bookingEndpoint;
    if (!endpoint || location.protocol === "file:") {
      showDone("handoff", name, phone, url);
      var w = window.open(url, "_blank");
      if (w) w.opener = null;
      else window.location.href = url; // popup blocked → open in the same tab
      return;
    }

    // Offline? Don't wait — go straight to the WhatsApp fallback.
    if (navigator.onLine === false) { showDone("fallback", name, phone, url); return; }

    // Slow network: give the server 12 seconds, then fall back to WhatsApp instead of spinning forever.
    setSending(true);
    var settled = false;
    var ctrl = window.AbortController ? new AbortController() : null;
    var finish = function (sent) {
      if (settled) return; // a late reply after the timeout is ignored
      settled = true;
      clearTimeout(timer);
      setSending(false);
      showDone(sent ? "sent" : "fallback", name, phone, url);
    };
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); finish(false); }, 12000);
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined,
    })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (b) { return res.ok && b.ok; }); })
      .catch(function () { return false; })
      .then(finish);
  });

  function setSending(on) {
    var btn = $("#bfSubmit");
    btn.disabled = on;
    btn.firstElementChild.outerHTML = on // swap the icon (svg ⇄ spinner)
      ? '<span class="spinner" aria-hidden="true"></span>'
      : '<svg width="20" height="20" aria-hidden="true"><use href="#i-wa"/></svg>';
    btn.querySelector("span:last-child").textContent = on ? "Sending…" : "Send Booking Request";
  }

  function showDone(kind, name, phone, url) {
    var title = $("#doneTitle"), text = $("#doneText"), link = $("#bookReopen");
    link.href = url;
    if (kind === "sent") {
      title.textContent = "Request sent!";
      text.textContent = "Thanks, " + name.split(" ")[0] + ". We’ve received your booking request and will contact you on " + phone + " to confirm your slot.";
      link.hidden = true;
    } else if (kind === "handoff") {
      title.textContent = "Almost done!";
      text.innerHTML = "Your booking request is ready in WhatsApp. Just press <strong>Send</strong> and we’ll confirm your slot.";
      link.textContent = "WhatsApp didn’t open? Tap here";
      link.hidden = false;
    } else {
      title.textContent = "One more step";
      text.textContent = "We couldn’t send your request automatically. Tap below to send it to us on WhatsApp instead.";
      link.textContent = "Send on WhatsApp";
      link.hidden = false;
    }
    form.hidden = true;
    doneBox.hidden = false;
    title.focus();
  }

  /* =====================================================================
     Map: load only when near the viewport
     ===================================================================== */
  var mapFrame = $("#mapFrame");
  function loadMap() {
    if (mapFrame.querySelector("iframe")) return;
    var f = document.createElement("iframe");
    f.src = "https://www.google.com/maps?q=" + mapsQuery + "&output=embed";
    f.title = "Map showing TORQ" + (C.address ? " at " + C.address : "");
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer-when-downgrade";
    f.allowFullscreen = true;
    f.addEventListener("load", function () { mapFrame.removeAttribute("data-loading"); });
    mapFrame.appendChild(f);
  }
  if ("IntersectionObserver" in window) {
    var mio = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { loadMap(); mio.disconnect(); }
    }, { rootMargin: "400px 0px" });
    mio.observe(mapFrame);
  } else loadMap();

  /* =====================================================================
     Local business schema (from config)
     ===================================================================== */
  var schema = {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    name: "TORQ",
    slogan: "Elevate Every Game.",
    description: "RC gaming centre with an RC racing track, an RC off-road track and an RC construction zone.",
    image: new URL("assets/og-image.jpg", location.href).href,
    logo: new URL("assets/logo.svg", location.href).href,
    url: location.origin + location.pathname,
    telephone: phoneDigits || undefined,
    address: C.address ? {
      "@type": "PostalAddress",
      streetAddress: C.address,
      addressLocality: C.city || undefined,
      addressCountry: "IN",
    } : undefined,
    areaServed: C.city || undefined,
    sameAs: C.instagram ? [C.instagram] : undefined,
  };
  var s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(schema);
  document.head.appendChild(s);
})();
