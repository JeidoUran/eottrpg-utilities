import { EOTTRPG_CLOCK_NS, registerClockSettings } from "./settings.js";

let observer = null;
let updateInterval = null;

// Base URL robuste (pas besoin de game.modules.get().url)
const MODULE_ROOT = new URL("../..", import.meta.url);
const dialFrameUrl = new URL("assets/img/clock/clock-dial.png", MODULE_ROOT).href;
const timeBaseUrl  = new URL("assets/img/clock/time/", MODULE_ROOT).href;

// 8 secteurs (45°)
const SLICE_COUNT = 8;
const SLICE_SPAN = 360 / SLICE_COUNT; // 45

// Ordre (clockwise depuis le TOP). Ajuste si tu veux.
const SLICE_FILES = [
  "clock-night.png",
  "clock-dawn.png",
  "clock-morning.png",
  "clock-late-morning.png",
  "clock-noon.png",
  "clock-afternoon.png",
  "clock-evening.png",
  "clock-late-evening.png",
];

Hooks.on("ready", () => {
  registerClockSettings();
  if (!game.settings.get(EOTTRPG_CLOCK_NS, "clockEnabled")) return;

  if (!tryAttachClock()) startObserver();
  startUpdater();
});

Hooks.on("shutdown", () => cleanup());

function cleanup() {
  observer?.disconnect();
  observer = null;

  if (updateInterval) window.clearInterval(updateInterval);
  updateInterval = null;

  document.getElementById("eottrpg-halfclock-wrap")?.remove();
}

function startObserver() {
  if (observer) return;

  observer = new MutationObserver(() => {
    if (document.getElementById("eottrpg-halfclock-wrap")) return;
    if (tryAttachClock()) {
      observer.disconnect();
      observer = null;
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function startUpdater() {
  if (updateInterval) return;

  updateInterval = window.setInterval(() => {
    const wrap = document.getElementById("eottrpg-halfclock-wrap");
    if (!wrap) return;

    const bar = document.getElementById("simple-timekeeping");
    if (bar) positionClockRelativeToBar(bar);

    updateClockRotation();
  }, 500);

  Hooks.on?.("updateWorldTime", () => updateClockRotation());
}

function tryAttachClock() {
  const bar = document.getElementById("simple-timekeeping");
  if (!bar) return false;

  if (document.getElementById("eottrpg-halfclock-wrap")) return true;

  const uitop = document.getElementById("ui-top");

  const wrap = document.createElement("div");
  wrap.id = "eottrpg-halfclock-wrap";

  wrap.innerHTML = `
    <div id="eottrpg-halfclock-clip">
      <div id="eottrpg-halfclock-rotor" aria-hidden="true"></div>
      <img id="eottrpg-halfclock-frame" aria-hidden="true" />
    </div>
    <div id="eottrpg-halfclock-hand" aria-hidden="true">
      <img id="eottrpg-halfclock-hand-img"
          src="./modules/eottrpg-utilities/assets/img/clock/clock-hand.png"
          alt="" />
    </div>
  `;

  uitop.appendChild(wrap);

  // Frame (ne tourne pas)
  wrap.querySelector("#eottrpg-halfclock-frame").src = dialFrameUrl;

  // SVG composite (dans le rotor -> tourne)
  const rotor = wrap.querySelector("#eottrpg-halfclock-rotor");
  rotor.innerHTML = "";
  rotor.appendChild(renderCompositeFaceSVG());

  positionClockRelativeToBar(bar);
  updateClockRotation();
  return true;
}

function positionClockRelativeToBar(barEl) {
  const wrap = document.getElementById("eottrpg-halfclock-wrap");
  if (!wrap) return;

  const barRect = barEl.getBoundingClientRect();
  const top = Math.round(barRect.bottom);

  wrap.style.top = `${top}px`;
}

function updateClockRotation() {
  const rotor = document.getElementById("eottrpg-halfclock-rotor");
  if (!rotor) return;

  const cfg = CONFIG.time?.worldCalendarConfig ?? {};
  const minutesPerHour = cfg.minutesPerHour ?? 60;
  const hoursPerDay = cfg.hoursPerDay ?? 24;

  const c = game.time?.components;
  if (!c) return;

  const hour = Number(c.hour ?? 0);
  const minute = Number(c.minute ?? 0);
  const second = Number(c.second ?? 0);

  const dayMinutes = hoursPerDay * minutesPerHour;
  const nowMinutes = hour * minutesPerHour + minute + second / 60;

  const progress = dayMinutes > 0 ? nowMinutes / dayMinutes : 0;
  const baseAngle = progress * 360;

  // rotor tourne sous aiguille fixe
  const final = (baseAngle);
  rotor.style.transform = `rotate(${final}deg)`;
}

/**
 * SVG face: 8 secteurs, chaque secteur = clipPath wedge + image
 * + orientation “flèches” :
 *   chaque image est pré-rotatée pour être “à l’endroit” quand le secteur arrive à 6h (bas / sous l’aiguille)
 */
function renderCompositeFaceSVG() {
  const size = 600;            // espace arbitraire
  const center = size / 2;
  const radius = size / 2;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.id = "eottrpg-halfclock-face";
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const defs = document.createElementNS(svgNS, "defs");
  svg.appendChild(defs);

  // On centre “Night” en haut (-90°), puis clockwise par pas de 45°
  for (let i = 0; i < SLICE_COUNT; i++) {
    const midDeg = -90 + i * SLICE_SPAN;         // centre du secteur
    const startDeg = midDeg - SLICE_SPAN / 2;
    const endDeg   = midDeg + SLICE_SPAN / 2;

    const startRad = (startDeg * Math.PI) / 180;
    const endRad   = (endDeg   * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `Z`,
    ].join(" ");

    const clipId = `eottrpg-clip-${i}`;
    const clipPath = document.createElementNS(svgNS, "clipPath");
    clipPath.setAttribute("id", clipId);
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathData);
    clipPath.appendChild(path);
    defs.appendChild(clipPath);

    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("clip-path", `url(#${clipId})`);

    // On pousse l’image vers l’extérieur pour mieux remplir les “fenêtres”
    const dist = radius * 0.62;
    const midRad = (midDeg * Math.PI) / 180;
    const tx = dist * Math.cos(midRad);
    const ty = dist * Math.sin(midRad);

    const img = document.createElementNS(svgNS, "image");
    img.setAttribute("href", `${timeBaseUrl}${SLICE_FILES[i]}`);

    // Taille image (tweakable)
    const imgSize = 200;
    const offset = (size - imgSize) / 2;

    img.setAttribute("x", offset);
    img.setAttribute("y", offset);
    img.setAttribute("width", imgSize);
    img.setAttribute("height", imgSize);
    img.setAttribute("image-rendering", "auto");
    img.setAttribute("shape-rendering", "geometricPrecision");

    // “slice” = on crop pour remplir, comme Phil
    img.setAttribute("preserveAspectRatio", "xMidYMid slice");

    // Orientation “flèches” :
    // Objectif: quand ce secteur arrive à 6h (90°), l’image est droite.
    // Comme le rotor tourne tout le monde, on pré-rotote l’image de (midDeg - 90).
    const rot = (midDeg - 90);

    img.setAttribute(
      "transform",
      `translate(${tx}, ${ty}) rotate(${rot} ${center} ${center})`
    );

    g.appendChild(img);
    svg.appendChild(g);
  }

  return svg;
}
