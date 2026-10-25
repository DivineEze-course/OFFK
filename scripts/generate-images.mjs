/**
 * OFFK demo artwork generator.
 *
 * This sandbox has no outbound network access to stock-photo providers, so the
 * demo listings ship with locally generated, brand-consistent SVG illustrations
 * instead of photographs. Running `node scripts/generate-images.mjs` rewrites
 * every asset in `public/images/`. Swap these paths for real photography by
 * updating `src/data/properties.ts` only — no component changes required.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "images");

/** Deterministic pseudo-random generator so re-runs produce identical art. */
function rng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}


const W = 1200;
const H = 900;

/* ---------------------------------------------------------------- helpers */

function wallAndFloor(p, floorY = 620) {
  return `
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.wallTop}"/>
      <stop offset="1" stop-color="${p.wallBottom}"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.floorShade}"/>
      <stop offset="1" stop-color="${p.floor}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  <rect y="${floorY}" width="${W}" height="${H - floorY}" fill="url(#floor)"/>
  <rect y="${floorY - 6}" width="${W}" height="6" fill="${p.trim}" opacity="0.55"/>`;
}

function window_(x, y, w, h, p, opts = {}) {
  const skyH = h * 0.62;
  const sill = 10;
  return `
  <g>
    <rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="6" fill="${p.trim}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sky)"/>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.skyTop}"/>
        <stop offset="1" stop-color="${p.skyBottom}"/>
      </linearGradient>
    </defs>
    <circle cx="${x + w * 0.72}" cy="${y + skyH * 0.34}" r="${h * 0.09}" fill="#FFF7DF" opacity="0.95"/>
    <path d="M${x} ${y + skyH} q ${w * 0.18} -${h * 0.14} ${w * 0.38} -${h * 0.02} q ${w * 0.22} -${h * 0.12} ${w * 0.44} ${h * 0.02} L${x + w} ${y + h} L${x} ${y + h} Z" fill="${p.hills}" opacity="0.85"/>
    <rect x="${x + w / 2 - 3}" y="${y}" width="6" height="${h}" fill="${p.trim}"/>
    <rect x="${x}" y="${y + h / 2 - 3}" width="${w}" height="6" fill="${p.trim}"/>
    ${opts.curtain ? `<path d="M${x - 20} ${y - 20} q 40 ${h * 0.5} 8 ${h + 40} l -46 0 l 0 -${h + 40} Z" fill="${p.fabric}" opacity="0.9"/>
    <path d="M${x + w + 20} ${y - 20} q -40 ${h * 0.5} -8 ${h + 40} l 46 0 l 0 -${h + 40} Z" fill="${p.fabric}" opacity="0.9"/>` : ""}
    <rect x="${x - 14}" y="${y + h + 8}" width="${w + 28}" height="${sill}" rx="3" fill="${p.trim}"/>
  </g>`;
}

function plant(x, y, s, p) {
  return `
  <g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="4" rx="46" ry="10" fill="#000" opacity="0.10"/>
    <path d="M-28 0 h56 l-8 54 h-40 Z" fill="${p.terracotta}"/>
    <rect x="-32" y="-8" width="64" height="14" rx="5" fill="${p.terracotta}" opacity="0.85"/>
    <path d="M0 -4 C -6 -60 -44 -74 -52 -66 C -58 -58 -34 -34 -2 -30 Z" fill="${p.leaf}"/>
    <path d="M0 -6 C 8 -78 46 -92 56 -82 C 62 -72 30 -36 4 -30 Z" fill="${p.leafDark}"/>
    <path d="M-2 -8 C -2 -84 10 -108 20 -104 C 28 -100 12 -50 4 -30 Z" fill="${p.leaf}"/>
  </g>`;
}

function framedArt(x, y, w, h, p, seed) {
  const rand = rng(seed);
  const a = [p.art1, p.art2, p.art3][Math.floor(rand() * 3)];
  const b = [p.art2, p.art3, p.art1][Math.floor(rand() * 3)];
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#FFFFFF" opacity="0.96"/>
    <rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" fill="#F6F3EC"/>
    <circle cx="${x + w * 0.38}" cy="${y + h * 0.42}" r="${Math.min(w, h) * 0.2}" fill="${a}"/>
    <path d="M${x + 12} ${y + h - 16} L${x + w * 0.5} ${y + h * 0.5} L${x + w - 12} ${y + h - 16} Z" fill="${b}"/>
  </g>`;
}

function rug(x, y, w, h, p) {
  return `
  <g>
    <ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${p.rug}" opacity="0.85"/>
    <ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2 - 22}" ry="${h / 2 - 14}" fill="none" stroke="${p.rugStripe}" stroke-width="7" opacity="0.7"/>
  </g>`;
}

function lamp(x, y, s, p) {
  return `
  <g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="2" rx="30" ry="8" fill="#000" opacity="0.12"/>
    <rect x="-4" y="-118" width="8" height="118" fill="${p.trim}"/>
    <path d="M-34 -118 h68 l-12 -44 h-44 Z" fill="${p.lampShade}"/>
    <circle cx="0" cy="-96" r="10" fill="#FFF3C9" opacity="0.9"/>
  </g>`;
}

/* ----------------------------------------------------------------- scenes */

const scenes = {
  bedroom(p, seed) {
    const rand = rng(seed);
    const artX = 150 + rand() * 60;
    return `
  ${wallAndFloor(p)}
  ${window_(760, 120, 300, 300, p, { curtain: true })}
  ${framedArt(artX, 150, 190, 150, p, seed)}
  ${rug(240, 700, 620, 130, p)}
  <g>
    <ellipse cx="560" cy="810" rx="330" ry="22" fill="#000" opacity="0.10"/>
    <rect x="250" y="450" width="620" height="120" rx="10" fill="${p.wood}"/>
    <rect x="266" y="366" width="588" height="110" rx="14" fill="${p.linen}"/>
    <rect x="266" y="430" width="588" height="150" rx="12" fill="${p.fabric}"/>
    <path d="M266 470 h588 v110 a12 12 0 0 1 -12 12 h-564 a12 12 0 0 1 -12 -12 Z" fill="${p.fabricShade}" opacity="0.5"/>
    <rect x="292" y="330" width="150" height="90" rx="16" fill="#FFFFFF" opacity="0.95"/>
    <rect x="456" y="330" width="150" height="90" rx="16" fill="#FFFFFF" opacity="0.85"/>
    <rect x="238" y="300" width="34" height="300" rx="8" fill="${p.woodDark}"/>
    <rect x="848" y="300" width="34" height="300" rx="8" fill="${p.woodDark}"/>
  </g>
  <g>
    <rect x="900" y="520" width="130" height="16" rx="6" fill="${p.woodDark}"/>
    <rect x="912" y="536" width="12" height="86" fill="${p.woodDark}"/>
    <rect x="1006" y="536" width="12" height="86" fill="${p.woodDark}"/>
    <circle cx="965" cy="498" r="26" fill="${p.lampShade}"/>
    <rect x="960" y="498" width="10" height="24" fill="${p.trim}"/>
  </g>
  ${plant(1090, 640, 1.15, p)}
  <rect x="0" y="620" width="${W}" height="10" fill="#000" opacity="0.05"/>`;
  },

  studio(p) {
    return `
  ${wallAndFloor(p)}
  ${window_(120, 130, 260, 260, p)}
  <g>
    <ellipse cx="360" cy="800" rx="290" ry="20" fill="#000" opacity="0.10"/>
    <rect x="120" y="470" width="470" height="110" rx="10" fill="${p.wood}"/>
    <rect x="134" y="396" width="442" height="96" rx="12" fill="${p.linen}"/>
    <rect x="134" y="452" width="442" height="140" rx="12" fill="${p.fabric}"/>
    <rect x="156" y="362" width="120" height="76" rx="14" fill="#FFF" opacity="0.92"/>
    <rect x="108" y="330" width="26" height="280" rx="7" fill="${p.woodDark}"/>
    <rect x="576" y="330" width="26" height="280" rx="7" fill="${p.woodDark}"/>
  </g>
  <g>
    <rect x="680" y="470" width="420" height="120" rx="8" fill="${p.cabinet}"/>
    <rect x="668" y="440" width="444" height="34" rx="8" fill="${p.counter}"/>
    <rect x="700" y="486" width="120" height="90" rx="6" fill="${p.cabinetShade}"/>
    <rect x="836" y="486" width="120" height="90" rx="6" fill="${p.cabinetShade}"/>
    <rect x="972" y="486" width="108" height="90" rx="6" fill="${p.cabinetShade}"/>
    <rect x="716" y="300" width="368" height="96" rx="10" fill="${p.cabinetShade}"/>
    <rect x="716" y="300" width="368" height="96" rx="10" fill="none" stroke="${p.trim}" stroke-width="4" opacity="0.5"/>
    <circle cx="740" cy="348" r="7" fill="${p.trim}"/>
    <circle cx="1060" cy="348" r="7" fill="${p.trim}"/>
    <ellipse cx="770" cy="436" rx="42" ry="10" fill="${p.counter}" stroke="${p.trim}" stroke-width="4"/>
    <rect x="880" y="410" width="70" height="30" rx="8" fill="${p.trim}"/>
    <circle cx="900" cy="404" r="12" fill="${p.terracotta}"/>
    <circle cx="930" cy="404" r="12" fill="${p.terracotta}"/>
  </g>
  ${plant(86, 660, 0.9, p)}
  ${rug(320, 720, 520, 110, p)}`;
  },

  kitchen(p) {
    const tiles = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 14; col++) {
        tiles.push(
          `<rect x="${150 + col * 62}" y="${300 + row * 58}" width="54" height="50" rx="4" fill="${p.tile}" opacity="${0.5 + ((row + col) % 3) * 0.16}"/>`,
        );
      }
    }
    return `
  ${wallAndFloor(p, 640)}
  <g>
    <rect x="150" y="130" width="380" height="120" rx="10" fill="${p.cabinetShade}"/>
    <rect x="670" y="130" width="380" height="120" rx="10" fill="${p.cabinetShade}"/>
    <line x1="340" y1="130" x2="340" y2="250" stroke="${p.trim}" stroke-width="4" opacity="0.6"/>
    <line x1="860" y1="130" x2="860" y2="250" stroke="${p.trim}" stroke-width="4" opacity="0.6"/>
  </g>
  ${tiles.join("")}
  <g>
    <rect x="130" y="540" width="940" height="34" rx="8" fill="${p.counter}"/>
    <rect x="140" y="574" width="920" height="180" rx="8" fill="${p.cabinet}"/>
    <line x1="370" y1="574" x2="370" y2="754" stroke="${p.trim}" stroke-width="4" opacity="0.5"/>
    <line x1="600" y1="574" x2="600" y2="754" stroke="${p.trim}" stroke-width="4" opacity="0.5"/>
    <line x1="830" y1="574" x2="830" y2="754" stroke="${p.trim}" stroke-width="4" opacity="0.5"/>
    <ellipse cx="290" cy="556" rx="76" ry="16" fill="${p.floorShade}" stroke="${p.trim}" stroke-width="5"/>
    <rect x="282" y="470" width="12" height="80" fill="${p.trim}"/>
    <path d="M262 470 h52 l-8 -26 h-36 Z" fill="${p.trim}"/>
    <rect x="640" y="512" width="150" height="30" rx="8" fill="${p.trim}"/>
    <circle cx="672" cy="506" r="11" fill="${p.woodDark}"/>
    <circle cx="704" cy="506" r="11" fill="${p.woodDark}"/>
    <circle cx="736" cy="506" r="11" fill="${p.woodDark}"/>
    <path d="M920 542 v-46 a26 26 0 0 1 52 0 v46 Z" fill="${p.terracotta}"/>
    <rect x="966" y="500" width="34" height="12" rx="6" fill="${p.woodDark}"/>
  </g>
  <g>
    <line x1="440" y1="0" x2="440" y2="120" stroke="${p.trim}" stroke-width="6"/>
    <line x1="760" y1="0" x2="760" y2="120" stroke="${p.trim}" stroke-width="6"/>
    <path d="M404 120 h72 l-14 44 h-44 Z" fill="${p.lampShade}"/>
    <path d="M724 120 h72 l-14 44 h-44 Z" fill="${p.lampShade}"/>
    <circle cx="440" cy="170" r="9" fill="#FFF3C9"/>
    <circle cx="760" cy="170" r="9" fill="#FFF3C9"/>
  </g>`;
  },

  living(p, seed) {
    return `
  ${wallAndFloor(p)}
  ${framedArt(220, 140, 220, 170, p, seed + 7)}
  ${framedArt(500, 170, 150, 130, p, seed + 13)}
  ${window_(830, 130, 260, 270, p, { curtain: true })}
  ${rug(220, 700, 700, 140, p)}
  <g>
    <ellipse cx="560" cy="812" rx="360" ry="22" fill="#000" opacity="0.10"/>
    <rect x="230" y="560" width="660" height="130" rx="20" fill="${p.fabric}"/>
    <rect x="250" y="450" width="620" height="140" rx="24" fill="${p.fabric}"/>
    <rect x="208" y="470" width="66" height="220" rx="24" fill="${p.fabricShade}"/>
    <rect x="846" y="470" width="66" height="220" rx="24" fill="${p.fabricShade}"/>
    <rect x="300" y="480" width="170" height="110" rx="16" fill="${p.linen}"/>
    <rect x="486" y="480" width="170" height="110" rx="16" fill="${p.linen}" opacity="0.85"/>
    <rect x="672" y="480" width="170" height="110" rx="16" fill="${p.linen}" opacity="0.7"/>
  </g>
  <g>
    <ellipse cx="560" cy="770" rx="120" ry="16" fill="#000" opacity="0.08"/>
    <rect x="440" y="720" width="240" height="18" rx="9" fill="${p.woodDark}"/>
    <rect x="462" y="738" width="14" height="48" fill="${p.woodDark}"/>
    <rect x="644" y="738" width="14" height="48" fill="${p.woodDark}"/>
    <rect x="486" y="694" width="60" height="26" rx="6" fill="${p.art1}"/>
    <circle cx="600" cy="704" r="15" fill="${p.terracotta}"/>
  </g>
  ${lamp(1060, 700, 1.1, p)}
  ${plant(130, 660, 1.05, p)}`;
  },

  exterior(p) {
    const windows = [];
    for (let f = 0; f < 3; f++) {
      for (let c = 0; c < 5; c++) {
        const x = 250 + c * 130;
        const y = 250 + f * 130;
        windows.push(
          `<rect x="${x}" y="${y}" width="80" height="86" rx="6" fill="${p.glass}" opacity="0.9"/>` +
            `<rect x="${x}" y="${y}" width="80" height="30" rx="6" fill="${p.skyTop}" opacity="0.55"/>` +
            `<line x1="${x + 40}" y1="${y}" x2="${x + 40}" y2="${y + 86}" stroke="${p.trim}" stroke-width="4"/>`,
        );
      }
    }
    const balcony = [];
    for (let c = 0; c < 5; c++) {
      const x = 236 + c * 130;
      balcony.push(`<rect x="${x}" y="${470}" width="108" height="10" rx="5" fill="${p.trim}"/>`);
    }
    return `
  <defs>
    <linearGradient id="skyday" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.skyTop}"/>
      <stop offset="1" stop-color="${p.skyBottom}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#skyday)"/>
  <circle cx="980" cy="140" r="52" fill="#FFF6D8" opacity="0.95"/>
  <ellipse cx="300" cy="150" rx="120" ry="34" fill="#FFFFFF" opacity="0.8"/>
  <ellipse cx="410" cy="170" rx="90" ry="26" fill="#FFFFFF" opacity="0.65"/>
  <path d="M0 640 q 200 -70 420 -20 q 260 60 780 -10 L1200 900 L0 900 Z" fill="${p.hills}" opacity="0.9"/>
  <rect y="720" width="${W}" height="180" fill="${p.floor}"/>
  <rect y="712" width="${W}" height="12" fill="${p.floorShade}"/>
  <g>
    <rect x="210" y="200" width="720" height="520" rx="10" fill="${p.wallTop}"/>
    <rect x="210" y="200" width="720" height="520" rx="10" fill="none" stroke="${p.trim}" stroke-width="6" opacity="0.5"/>
    <rect x="210" y="180" width="720" height="30" rx="8" fill="${p.woodDark}" opacity="0.85"/>
    ${windows.join("")}
    ${balcony.join("")}
    <rect x="520" y="600" width="120" height="120" rx="8" fill="${p.woodDark}"/>
    <rect x="536" y="616" width="88" height="104" rx="6" fill="${p.glass}" opacity="0.8"/>
  </g>
  <rect x="60" y="640" width="1080" height="80" fill="${p.wallBottom}" opacity="0.85"/>
  <rect x="60" y="628" width="1080" height="16" rx="8" fill="${p.trim}" opacity="0.7"/>
  <rect x="520" y="712" width="120" height="188" fill="${p.floorShade}" opacity="0.9"/>
  ${plant(150, 700, 1.5, p)}
  ${plant(1010, 710, 1.8, p)}
  <g>
    <rect x="944" y="560" width="150" height="76" rx="10" fill="${p.woodDark}"/>
    <rect x="956" y="572" width="126" height="52" rx="8" fill="#F7F7F2"/>
    <rect x="972" y="586" width="60" height="10" rx="5" fill="${p.wallTop}"/>
    <rect x="972" y="604" width="90" height="8" rx="4" fill="${p.trim}"/>
    <rect x="1006" y="636" width="14" height="76" fill="${p.woodDark}"/>
  </g>`;
  },

  bathroom(p) {
    const tiles = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 12; col++) {
        tiles.push(
          `<rect x="${100 + col * 86}" y="${120 + row * 70}" width="78" height="62" rx="5" fill="${p.tile}" opacity="${0.45 + ((row + col) % 2) * 0.2}"/>`,
        );
      }
    }
    return `
  ${wallAndFloor(p, 700)}
  ${tiles.join("")}
  <g>
    <rect x="150" y="470" width="420" height="30" rx="10" fill="${p.counter}"/>
    <rect x="170" y="500" width="380" height="160" rx="10" fill="${p.cabinet}"/>
    <line x1="360" y1="500" x2="360" y2="660" stroke="${p.trim}" stroke-width="4" opacity="0.5"/>
    <ellipse cx="360" cy="470" rx="110" ry="24" fill="#FFFFFF"/>
    <ellipse cx="360" cy="470" rx="86" ry="16" fill="${p.floorShade}" opacity="0.5"/>
    <rect x="352" y="404" width="14" height="60" rx="6" fill="${p.trim}"/>
    <path d="M340 404 h38 v-16 a19 19 0 0 0 -38 0 Z" fill="${p.trim}"/>
    <circle cx="360" cy="330" r="86" fill="${p.glass}" opacity="0.5"/>
    <circle cx="360" cy="330" r="86" fill="none" stroke="${p.trim}" stroke-width="8"/>
    <path d="M320 300 a50 50 0 0 1 44 -26" stroke="#FFFFFF" stroke-width="8" fill="none" opacity="0.8"/>
  </g>
  <g>
    <rect x="700" y="180" width="360" height="520" rx="14" fill="${p.glass}" opacity="0.35"/>
    <rect x="700" y="180" width="360" height="520" rx="14" fill="none" stroke="${p.trim}" stroke-width="8"/>
    <line x1="880" y1="180" x2="880" y2="700" stroke="${p.trim}" stroke-width="6"/>
    <rect x="740" y="640" width="280" height="60" rx="10" fill="#FFFFFF" opacity="0.9"/>
    <line x1="800" y1="220" x2="800" y2="300" stroke="${p.trim}" stroke-width="8"/>
    <circle cx="800" cy="316" r="14" fill="${p.trim}"/>
  </g>
  <g>
    <rect x="560" y="380" width="90" height="120" rx="8" fill="${p.fabric}"/>
    <rect x="574" y="394" width="62" height="92" rx="6" fill="#FFFFFF" opacity="0.85"/>
  </g>
  ${plant(1090, 700, 0.95, p)}`;
  },

  lounge(p, seed) {
    return `
  ${wallAndFloor(p)}
  ${window_(140, 130, 250, 280, p)}
  <g>
    <rect x="700" y="120" width="330" height="30" rx="8" fill="${p.woodDark}"/>
    <rect x="700" y="260" width="330" height="26" rx="8" fill="${p.woodDark}"/>
    <rect x="700" y="400" width="330" height="26" rx="8" fill="${p.woodDark}"/>
    ${[0, 1, 2].map((i) => {
      const y = 150 + i * 140;
      const books = [];
      let bx = 714;
      for (let b = 0; b < 9; b++) {
        const bw = 14 + ((seed + b * 7) % 12);
        const bh = 74 + ((seed + b * 13) % 30);
        books.push(`<rect x="${bx}" y="${y + 100 - bh}" width="${bw}" height="${bh}" rx="3" fill="${[p.art1, p.art2, p.art3, p.terracotta][b % 4]}" opacity="0.9"/>`);
        bx += bw + 6;
      }
      return books.join("");
    }).join("")}
  </g>
  ${rug(240, 690, 660, 140, p)}
  <g>
    <ellipse cx="600" cy="806" rx="330" ry="20" fill="#000" opacity="0.10"/>
    <rect x="300" y="520" width="230" height="180" rx="26" fill="${p.fabric}"/>
    <rect x="320" y="540" width="190" height="120" rx="18" fill="${p.linen}" opacity="0.85"/>
    <rect x="670" y="520" width="230" height="180" rx="26" fill="${p.fabricShade}"/>
    <rect x="690" y="540" width="190" height="120" rx="18" fill="${p.linen}" opacity="0.7"/>
  </g>
  <g>
    <ellipse cx="600" cy="760" rx="130" ry="18" fill="#000" opacity="0.08"/>
    <rect x="470" y="700" width="260" height="20" rx="10" fill="${p.wood}"/>
    <rect x="492" y="720" width="14" height="52" fill="${p.woodDark}"/>
    <rect x="694" y="720" width="14" height="52" fill="${p.woodDark}"/>
    <rect x="520" y="668" width="70" height="32" rx="6" fill="${p.art2}"/>
    <circle cx="650" cy="682" r="16" fill="${p.terracotta}"/>
  </g>
  ${plant(120, 660, 1.1, p)}`;
  },

  workspace(p) {
    return `
  ${wallAndFloor(p)}
  ${window_(790, 120, 290, 280, p, { curtain: false })}
  <g>
    <rect x="150" y="200" width="420" height="18" rx="8" fill="${p.woodDark}"/>
    <rect x="170" y="120" width="46" height="80" rx="6" fill="${p.art1}" opacity="0.9"/>
    <rect x="232" y="140" width="40" height="60" rx="6" fill="${p.art2}" opacity="0.9"/>
    <rect x="288" y="106" width="52" height="94" rx="6" fill="${p.art3}" opacity="0.9"/>
    ${plant(420, 196, 0.6, p)}
  </g>
  <g>
    <ellipse cx="520" cy="812" rx="330" ry="20" fill="#000" opacity="0.10"/>
    <rect x="170" y="560" width="700" height="24" rx="10" fill="${p.wood}"/>
    <rect x="190" y="584" width="18" height="200" fill="${p.woodDark}"/>
    <rect x="832" y="584" width="18" height="200" fill="${p.woodDark}"/>
    <rect x="600" y="584" width="230" height="120" rx="8" fill="${p.cabinetShade}"/>
    <line x1="715" y1="584" x2="715" y2="704" stroke="${p.trim}" stroke-width="4" opacity="0.5"/>
    <rect x="330" y="440" width="240" height="120" rx="10" fill="${p.woodDark}"/>
    <rect x="344" y="452" width="212" height="96" rx="6" fill="${p.glass}"/>
    <rect x="420" y="560" width="60" height="10" rx="5" fill="${p.trim}"/>
    <rect x="200" y="500" width="110" height="60" rx="10" fill="${p.linen}"/>
    <rect x="640" y="510" width="90" height="50" rx="8" fill="${p.terracotta}"/>
    <line x1="685" y1="510" x2="685" y2="470" stroke="${p.trim}" stroke-width="6"/>
    <path d="M655 470 h60 l-10 -26 h-40 Z" fill="${p.lampShade}"/>
  </g>
  <g>
    <rect x="360" y="620" width="180" height="20" rx="10" fill="${p.fabric}"/>
    <rect x="372" y="640" width="20" height="150" rx="8" fill="${p.fabricShade}"/>
    <rect x="508" y="640" width="20" height="150" rx="8" fill="${p.fabricShade}"/>
    <rect x="372" y="612" width="156" height="90" rx="18" fill="${p.fabric}"/>
  </g>
  ${rug(300, 760, 500, 100, p)}`;
  },

  balcony(p, seed) {
    const skyline = [];
    for (let i = 0; i < 7; i++) {
      const x = 60 + i * 165;
      const h = 120 + ((seed + i * 37) % 160);
      skyline.push(
        `<rect x="${x}" y="${620 - h}" width="120" height="${h}" rx="6" fill="${p.buildings}" opacity="0.85"/>` +
          `<rect x="${x + 18}" y="${640 - h}" width="24" height="24" rx="4" fill="${p.skyTop}" opacity="0.7"/>` +
          `<rect x="${x + 66}" y="${640 - h}" width="24" height="24" rx="4" fill="${p.skyTop}" opacity="0.5"/>`,
      );
    }
    return `
  <defs>
    <linearGradient id="skybal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.skyTop}"/>
      <stop offset="1" stop-color="${p.skyBottom}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#skybal)"/>
  <circle cx="220" cy="160" r="56" fill="#FFF6D8"/>
  ${skyline.join("")}
  <path d="M0 620 q 240 -60 520 -10 q 320 56 680 -16 L1200 760 L0 760 Z" fill="${p.hills}" opacity="0.9"/>
  <rect y="700" width="${W}" height="200" fill="${p.floor}"/>
  <rect y="690" width="${W}" height="18" rx="8" fill="${p.floorShade}"/>
  <g opacity="0.95">
    <rect x="80" y="470" width="1040" height="14" rx="7" fill="${p.trim}"/>
    ${Array.from({ length: 13 }, (_, i) => `<rect x="${96 + i * 80}" y="484" width="10" height="216" fill="${p.trim}" opacity="0.85"/>`).join("")}
    <rect x="80" y="688" width="1040" height="12" rx="6" fill="${p.trim}" opacity="0.85"/>
  </g>
  <g>
    <rect x="880" y="600" width="180" height="20" rx="10" fill="${p.woodDark}"/>
    <rect x="900" y="620" width="14" height="90" fill="${p.woodDark}"/>
    <rect x="1026" y="620" width="14" height="90" fill="${p.woodDark}"/>
    <rect x="912" y="560" width="60" height="40" rx="8" fill="${p.fabric}"/>
  </g>
  ${plant(140, 660, 1.3, p)}
  ${plant(1090, 690, 1.0, p)}`;
  },

  corridor(p) {
    const doors = [];
    for (let i = 0; i < 4; i++) {
      const t = i / 4;
      const scale = 1 - t * 0.42;
      const cxL = 220 - t * 150;
      const cxR = 980 + t * 150;
      const h = 330 * scale;
      const w = 120 * scale;
      const y = 470 - h * 0.1;
      doors.push(
        `<g opacity="${1 - t * 0.15}">
          <rect x="${cxL - w / 2}" y="${y}" width="${w}" height="${h}" rx="6" fill="${p.wood}"/>
          <circle cx="${cxL + w / 2 - 16 * scale}" cy="${y + h * 0.55}" r="${7 * scale}" fill="${p.trim}"/>
          <rect x="${cxR - w / 2}" y="${y}" width="${w}" height="${h}" rx="6" fill="${p.wood}"/>
          <circle cx="${cxR - w / 2 + 16 * scale}" cy="${y + h * 0.55}" r="${7 * scale}" fill="${p.trim}"/>
        </g>`,
      );
    }
    return `
  <defs>
    <linearGradient id="hall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.wallTop}"/>
      <stop offset="1" stop-color="${p.wallBottom}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hall)"/>
  <path d="M0 0 H1200 L780 470 H420 Z" fill="${p.floorShade}" opacity="0.55"/>
  <path d="M0 900 H1200 L780 470 H420 Z" fill="${p.floor}"/>
  <rect x="420" y="180" width="360" height="290" fill="${p.wallTop}"/>
  <rect x="500" y="250" width="200" height="220" rx="8" fill="${p.glass}" opacity="0.55"/>
  <rect x="500" y="250" width="200" height="220" rx="8" fill="none" stroke="${p.trim}" stroke-width="6"/>
  ${doors.join("")}
  <g>
    <rect x="560" y="120" width="80" height="14" rx="7" fill="${p.lampShade}"/>
    <rect x="490" y="40" width="220" height="12" rx="6" fill="${p.lampShade}" opacity="0.8"/>
    <ellipse cx="600" cy="150" rx="120" ry="40" fill="#FFF3C9" opacity="0.18"/>
  </g>
  <path d="M420 470 h360" stroke="${p.trim}" stroke-width="4" opacity="0.4"/>
  <ellipse cx="600" cy="700" rx="260" ry="40" fill="#FFFFFF" opacity="0.06"/>`;
  },

  shared(p, seed) {
    const bunk = (x, flip) => `
    <g transform="translate(${x} 0) ${flip ? "scale(-1,1) translate(-420 0)" : ""}">
      <ellipse cx="210" cy="812" rx="200" ry="16" fill="#000" opacity="0.10"/>
      <rect x="30" y="330" width="20" height="470" rx="8" fill="${p.woodDark}"/>
      <rect x="370" y="330" width="20" height="470" rx="8" fill="${p.woodDark}"/>
      <rect x="30" y="570" width="360" height="16" rx="8" fill="${p.woodDark}"/>
      <rect x="46" y="470" width="328" height="90" rx="10" fill="${p.linen}"/>
      <rect x="46" y="520" width="328" height="66" rx="10" fill="${p.fabric}"/>
      <rect x="60" y="386" width="300" height="86" rx="10" fill="${p.linen}"/>
      <rect x="60" y="430" width="300" height="58" rx="10" fill="${p.fabricShade}"/>
      <rect x="30" y="710" width="360" height="16" rx="8" fill="${p.woodDark}"/>
      <rect x="46" y="640" width="328" height="72" rx="10" fill="${p.linen}"/>
      <rect x="46" y="676" width="328" height="52" rx="10" fill="${p.fabric}"/>
      <rect x="150" y="330" width="120" height="10" rx="5" fill="${p.trim}"/>
      <rect x="150" y="570" width="120" height="10" rx="5" fill="${p.trim}"/>
      <rect x="150" y="710" width="120" height="10" rx="5" fill="${p.trim}"/>
    </g>`;
    return `
  ${wallAndFloor(p)}
  ${window_(500, 140, 200, 220, p)}
  ${bunk(120, false)}
  ${bunk(1080, true)}
  ${rug(450, 720, 300, 90, p)}
  <g>
    <rect x="540" y="560" width="120" height="250" rx="8" fill="${p.cabinetShade}"/>
    <line x1="600" y1="560" x2="600" y2="810" stroke="${p.trim}" stroke-width="4" opacity="0.5"/>
    <circle cx="586" cy="640" r="7" fill="${p.trim}"/>
    <circle cx="614" cy="640" r="7" fill="${p.trim}"/>
    <circle cx="586" cy="740" r="7" fill="${p.trim}"/>
    <circle cx="614" cy="740" r="7" fill="${p.trim}"/>
  </g>
  ${framedArt(760, 170, 150, 120, p, seed + 3)}`;
  },
};

/* --------------------------------------------------------------- palettes */

/** Warm, photographic-feeling palettes (deliberately off-brand so imagery never competes with UI colour). */
const palettes = [
  { name: "sage", wallTop: "#EFEAE0", wallBottom: "#E3DCCD", floor: "#C9A97E", floorShade: "#B8946A", trim: "#8C7B67", wood: "#B98A5E", woodDark: "#7C5A3A", linen: "#F7F3EA", fabric: "#9DAE97", fabricShade: "#7E9079", lampShade: "#D8C79B", terracotta: "#C4744C", leaf: "#7FA06B", leafDark: "#5F8250", rug: "#E4D8C4", rugStripe: "#C9B693", cabinet: "#B4A48D", cabinetShade: "#A08F78", counter: "#565E5B", tile: "#EDE7DA", glass: "#BFD3D6", art1: "#D8A05B", art2: "#7E9AA0", art3: "#C4744C", hills: "#A9B79A", skyTop: "#D7E4E8", skyBottom: "#EFF3E7", buildings: "#8E9C93", lampShade2: "#D8C79B" },
  { name: "terracotta", wallTop: "#F3E9DF", wallBottom: "#EBD9C8", floor: "#CBA982", floorShade: "#B98F69", trim: "#93715A", wood: "#B27C50", woodDark: "#79502F", linen: "#FBF6EE", fabric: "#D9A184", fabricShade: "#C08467", lampShade: "#E8CFA3", terracotta: "#B75C3C", leaf: "#88A06D", leafDark: "#637D4E", rug: "#EADCC9", rugStripe: "#D2B896", cabinet: "#C09A76", cabinetShade: "#A9825F", counter: "#5C544C", tile: "#F1E8DA", glass: "#C6D2D3", art1: "#C4744C", art2: "#D8A05B", art3: "#7E9AA0", hills: "#B3A98D", skyTop: "#DCE3E4", skyBottom: "#F3E9DA", buildings: "#978C77" },
  { name: "teal", wallTop: "#E7EBE8", wallBottom: "#D9E1DC", floor: "#BCA37F", floorShade: "#A88C69", trim: "#77857E", wood: "#AE8258", woodDark: "#715031", linen: "#F6F5EE", fabric: "#7E9B95", fabricShade: "#61807A", lampShade: "#DCCDA0", terracotta: "#C0714B", leaf: "#79A071", leafDark: "#557B52", rug: "#E6DECD", rugStripe: "#CDBE9E", cabinet: "#9FB0A8", cabinetShade: "#8AA098", counter: "#4F5754", tile: "#E9EFEA", glass: "#B7CFD2", art1: "#7E9AA0", art2: "#D8A05B", art3: "#9DAE97", hills: "#93A899", skyTop: "#D2E0E2", skyBottom: "#EAF0E8", buildings: "#7F948A" },
  { name: "ochre", wallTop: "#F1ECDF", wallBottom: "#E7DFC9", floor: "#C7A579", floorShade: "#B28C61", trim: "#8B7A5C", wood: "#B4854F", woodDark: "#7A5730", linen: "#FBF7EC", fabric: "#D6B36B", fabricShade: "#BC9751", lampShade: "#E4CE99", terracotta: "#BC6A45", leaf: "#84A066", leafDark: "#617E4B", rug: "#EAE0C6", rugStripe: "#D3BF95", cabinet: "#B7A67F", cabinetShade: "#A08D68", counter: "#57544A", tile: "#F2EDDD", glass: "#C2D1CE", art1: "#D8A05B", art2: "#9DAE97", art3: "#C4744C", hills: "#AFAE8C", skyTop: "#DEE5E2", skyBottom: "#F4EDDC", buildings: "#94907A" },
  { name: "slate", wallTop: "#E9EAE6", wallBottom: "#DBDED8", floor: "#B9A489", floorShade: "#A38C71", trim: "#78807A", wood: "#A8825E", woodDark: "#6F4F35", linen: "#F7F6F0", fabric: "#93A0A6", fabricShade: "#77858C", lampShade: "#D5C9A4", terracotta: "#BB6E4E", leaf: "#7DA079", leafDark: "#5B7E58", rug: "#E4E1D6", rugStripe: "#CBC5B2", cabinet: "#A7AFA6", cabinetShade: "#929B93", counter: "#4E5450", tile: "#EBEDE7", glass: "#B9CCD1", art1: "#93A0A6", art2: "#D8A05B", art3: "#7E9AA0", hills: "#9CA79B", skyTop: "#D6DEE1", skyBottom: "#ECEFE8", buildings: "#868F8B" },
  { name: "clay", wallTop: "#F0E6E0", wallBottom: "#E6D6CC", floor: "#C69C77", floorShade: "#B08259", trim: "#8E6F60", wood: "#B37F55", woodDark: "#785136", linen: "#FAF4EE", fabric: "#C98E7A", fabricShade: "#AE7160", lampShade: "#E6CBA2", terracotta: "#AE5C42", leaf: "#83A073", leafDark: "#5F7D54", rug: "#E9DCCF", rugStripe: "#D4BCA3", cabinet: "#BB9C88", cabinetShade: "#A48472", counter: "#584F49", tile: "#F2E8E0", glass: "#C7D0D2", art1: "#C4744C", art2: "#9DAE97", art3: "#D8A05B", hills: "#B09C8E", skyTop: "#E0DFE2", skyBottom: "#F2E7DD", buildings: "#98867C" },
];

/* ------------------------------------------------------------- manifest */

/** propertyId -> ordered scene names used for its gallery (4 images each). */
const propertyArt = {
  "abi-jabi-garden-court": ["exterior", "bedroom", "kitchen", "living"],
  "abi-jabi-roof-studio": ["studio", "kitchen", "balcony", "bathroom"],
  "abi-wuye-shared-loft": ["shared", "workspace", "lounge", "exterior"],
  "abi-karu-private-room": ["bedroom", "corridor", "bathroom", "lounge"],
  "abi-katampe-one-bed": ["living", "kitchen", "bedroom", "exterior"],
  "abi-life-camp-suite": ["studio", "bathroom", "balcony", "workspace"],
  "abi-gwarinpa-shared": ["shared", "lounge", "kitchen", "exterior"],
  "bze-baze-road-studio": ["studio", "kitchen", "bathroom", "exterior"],
  "bze-kuje-family-flat": ["living", "bedroom", "kitchen", "exterior"],
  "bze-gudu-shared-house": ["shared", "corridor", "workspace", "lounge"],
  "bze-apo-two-bed": ["living", "bedroom", "balcony", "kitchen"],
  "bze-jabi-annex": ["workspace", "bedroom", "bathroom", "balcony"],
};

const written = [];

function emit(relPath, svg) {
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, svg, "utf8");
  written.push(relPath);
}

function wrap(inner, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}">
<title>${title}</title>
${inner}
</svg>
`;
}

let paletteIndex = 0;
for (const [propertyId, sceneNames] of Object.entries(propertyArt)) {
  sceneNames.forEach((sceneName, i) => {
    const palette = palettes[paletteIndex % palettes.length];
    const seed = 1000 + paletteIndex * 31 + i * 7;
    const inner = scenes[sceneName](palette, seed);
    const title = `${sceneName} illustration for OFFK demo listing ${propertyId}`;
    emit(`properties/${propertyId}-${i + 1}.svg`, wrap(inner, title));
  });
  paletteIndex++;
}

/* Hero + university imagery reuse the same scene engine with fresh palettes. */
const heroSpecs = [
  ["hero/hero-main.svg", "living", palettes[0], 4242],
  ["hero/hero-secondary.svg", "bedroom", palettes[2], 4243],
  ["hero/hero-tertiary.svg", "exterior", palettes[1], 4244],
];
for (const [path, scene, palette, seed] of heroSpecs) {
  emit(path, wrap(scenes[scene](palette, seed), `OFFK hero illustration — ${scene}`));
}

emit("universities/nile.svg", wrap(scenes.exterior(palettes[2], 777), "Illustrated campus-area building near the demo Nile University pin"));
emit("universities/baze.svg", wrap(scenes.corridor(palettes[1], 888), "Illustrated interior corridor of a demo property near the Baze University pin"));
emit("universities/jabi.svg", wrap(scenes.balcony(palettes[0], 991), "Illustrated view over the demo Jabi area"));
emit("universities/wuye.svg", wrap(scenes.lounge(palettes[3], 992), "Illustrated communal lounge in a demo property in the Wuye area"));

writeFileSync(
  join(OUT, "manifest.json"),
  JSON.stringify({ generatedBy: "scripts/generate-images.mjs", files: written }, null, 2),
  "utf8",
);

console.log(`Generated ${written.length} SVG assets under public/images/`);
