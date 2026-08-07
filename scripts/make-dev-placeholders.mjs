/* Generates procedural PNG placeholders for /dev/components.
 *
 * These are DEV-ONLY assets so the gallery reads like a real page instead of a
 * grid of grey boxes. design-process.md §3 warns that placeholder content
 * "trains the eye wrong" — a component library reviewed against blank
 * rectangles hides every contrast, crop and legibility problem it exists to
 * surface.
 *
 * Everything is generated, not sourced: implementationplan.md Phase 2 makes
 * "Zero stock photography anywhere" an acceptance criterion, and §0.2 bans
 * stock outright. Real project photography replaces all of this at Phase 2.
 *
 * Colours come from the design.md §2.1.2 ramps so the gallery sits inside the
 * palette. Everything is seeded, so the output is byte-identical run to run and
 * does not churn in git.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "public", "dev");

/* ── PNG encoding ─────────────────────────────────────────────────────── */

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i += 1) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function writePng(path, width, height, shade) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y += 1) {
    raw[offset] = 0;
    offset += 1;
    for (let x = 0; x < width; x += 1) {
      const rgb = shade(x / width, y / height, x, y);
      raw[offset] = clamp255(rgb[0]);
      raw[offset + 1] = clamp255(rgb[1]);
      raw[offset + 2] = clamp255(rgb[2]);
      offset += 3;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;

  writeFileSync(
    path,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", ihdr),
      chunk("IDAT", deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}

/* ── maths ────────────────────────────────────────────────────────────── */

const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const mix = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/** mulberry32 — small, fast, and seeded so output is reproducible. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Value-noise lattice with bilinear interpolation. */
function makeNoise(seed, size = 256) {
  const random = rng(seed);
  const grid = new Float32Array(size * size);
  for (let i = 0; i < grid.length; i += 1) grid[i] = random();

  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smooth(x - xi);
    const yf = smooth(y - yi);
    const at = (ax, ay) =>
      grid[(((ay % size) + size) % size) * size + (((ax % size) + size) % size)];
    return lerp(
      lerp(at(xi, yi), at(xi + 1, yi), xf),
      lerp(at(xi, yi + 1), at(xi + 1, yi + 1), xf),
      yf,
    );
  };
}

/** Fractional Brownian motion — the workhorse for every natural texture here. */
function makeFbm(seed) {
  const noise = makeNoise(seed);
  return (x, y, octaves = 4, lacunarity = 2, gain = 0.5) => {
    let sum = 0;
    let amplitude = 1;
    let total = 0;
    let fx = x;
    let fy = y;
    for (let i = 0; i < octaves; i += 1) {
      sum += noise(fx, fy) * amplitude;
      total += amplitude;
      amplitude *= gain;
      fx *= lacunarity;
      fy *= lacunarity;
    }
    return sum / total;
  };
}

/* ── palette (design.md §2.1.2) ───────────────────────────────────────── */

const hex = (value) => [
  parseInt(value.slice(1, 3), 16),
  parseInt(value.slice(3, 5), 16),
  parseInt(value.slice(5, 7), 16),
];

const C = {
  basalt950: hex("#0B0B09"),
  basalt900: hex("#0E0E0C"),
  basalt800: hex("#161613"),
  basalt700: hex("#21211D"),
  basalt600: hex("#3A3A34"),
  basalt500: hex("#5C5C53"),
  basalt400: hex("#8A8A7E"),
  basalt300: hex("#B5B5A8"),
  basalt200: hex("#D9D6CC"),
  basalt100: hex("#EAE7DE"),
  basalt050: hex("#F5F2ED"),
  basalt000: hex("#FBFAF7"),
  brass700: hex("#7D6229"),
  brass600: hex("#96762F"),
  brass500: hex("#B08D3F"),
  brass400: hex("#C7A65C"),
  brass300: hex("#DCC48F"),
  brass100: hex("#F0E6CE"),
  kota800: hex("#2A322E"),
  kota600: hex("#3A423E"),
  kota400: hex("#64706A"),
  blueprint700: hex("#1E3550"),
  blueprint500: hex("#2B4B6F"),
  blueprint300: hex("#7C9BBA"),
  blueprint100: hex("#DCE6EF"),
  teak: hex("#6B4226"),
  teakLight: hex("#A9713F"),
};

/* §8.1 — the house grade: documentary, grain-tolerant. A little grain across
 * everything is what makes inconsistent source quality read as a deliberate
 * style rather than as a mistake. */
function grain(base, amount, gx, gy, seed) {
  const n = ((Math.sin(gx * 12.9898 + gy * 78.233 + seed) * 43758.5453) % 1 + 1) % 1;
  const d = (n - 0.5) * amount;
  return [base[0] + d, base[1] + d, base[2] + d];
}

function vignette(rgb, u, v, strength = 0.45) {
  const dx = u - 0.5;
  const dy = v - 0.5;
  const d = Math.sqrt(dx * dx + dy * dy) / 0.707;
  const factor = 1 - strength * d * d;
  return [rgb[0] * factor, rgb[1] * factor, rgb[2] * factor];
}

/* ── scene generators ─────────────────────────────────────────────────── */

/**
 * An interior: back wall, floor with perspective falloff, a window throwing
 * directional light, and a soft cast shadow. At thumbnail size this reads as a
 * photograph of a room, which is the whole point.
 */
function interior({
  seed,
  wall,
  floor,
  accent,
  windowSide = "left",
  brightness = 1,
  warmth = 1,
}) {
  const fbm = makeFbm(seed);
  const horizon = 0.62;
  const winX0 = windowSide === "left" ? 0.06 : 0.62;
  const winX1 = windowSide === "left" ? 0.38 : 0.94;
  const winY0 = 0.12;
  const winY1 = 0.5;

  return (u, v, px, py) => {
    let rgb;

    if (v < horizon) {
      // Back wall — plaster mottling plus light falloff from the window.
      const mottle = fbm(u * 6, v * 6, 4) - 0.5;
      rgb = mix(wall, C.basalt000, 0.06 + mottle * 0.12);

      const inWindow = u > winX0 && u < winX1 && v > winY0 && v < winY1;
      if (inWindow) {
        /* Daylight, not a flat white rectangle. Three things stop it reading
         * as a broken placeholder: the glow falls off toward the reveal, the
         * mullion is soft rather than a hard 1px cross, and a faint warm
         * gradient runs down the pane the way real sky does. */
        const inset = Math.min(
          Math.min(u - winX0, winX1 - u) / (winX1 - winX0),
          Math.min(v - winY0, winY1 - v) / (winY1 - winY0),
        );
        const falloff = Math.min(1, inset * 6);
        const sky = mix([255, 255, 255], C.brass100, (v - winY0) / (winY1 - winY0) * 0.5);
        rgb = mix(wall, sky, 0.35 + falloff * 0.62);

        const mullionX = Math.abs(u - (winX0 + winX1) / 2);
        const mullionY = Math.abs(v - (winY0 + winY1) / 2);
        const mullion = Math.exp(-mullionX * 380) + Math.exp(-mullionY * 300);
        rgb = mix(rgb, C.basalt700, Math.min(mullion, 1) * 0.55);
      } else {
        // Light falls off with distance from the window centre.
        const cx = (winX0 + winX1) / 2;
        const cy = (winY0 + winY1) / 2;
        const d = Math.sqrt((u - cx) ** 2 + ((v - cy) * 0.8) ** 2);
        const light = clamp01(1 - d * 1.15);
        rgb = mix(rgb, C.brass100, light * 0.35);
        rgb = mix(rgb, C.basalt900, clamp01(d - 0.35) * 0.35);
      }
    } else {
      // Floor — perspective compression toward the horizon, plus board joints.
      const depth = (v - horizon) / (1 - horizon);
      const persp = 1 / (0.25 + depth * 1.6);
      const boardY = Math.floor(v * persp * 7);
      const jointY = (v * persp * 7) % 1 < 0.045;
      const boardShift = ((boardY * 37) % 11) / 11 - 0.5;

      const graining = fbm(u * 22 * persp * 0.4, v * 90, 3) - 0.5;
      rgb = mix(floor, C.basalt900, 0.1 + boardShift * 0.12 + graining * 0.16);
      if (jointY) rgb = mix(rgb, C.basalt900, 0.35);

      // Light pooling in from the window, and a soft cast shadow.
      const pool = clamp01(1 - Math.abs(u - (winX0 + winX1) / 2) * 1.5) * (1 - depth * 0.8);
      rgb = mix(rgb, C.brass100, pool * 0.3);
      rgb = mix(rgb, C.basalt950, clamp01(depth - 0.45) * 0.3);
    }

    // A single accent object — a low form standing on the floor.
    const objX0 = windowSide === "left" ? 0.58 : 0.12;
    const objX1 = objX0 + 0.26;
    if (u > objX0 && u < objX1 && v > 0.44 && v < 0.78) {
      const top = v < 0.5;
      const shade = top ? 0.18 : 0.02 + (v - 0.5) * 0.25;
      rgb = mix(accent, C.basalt950, shade);
      if (Math.abs(u - objX0) < 0.004 || Math.abs(u - objX1) < 0.004) {
        rgb = mix(rgb, C.basalt950, 0.3);
      }
    }

    rgb = [rgb[0] * brightness, rgb[1] * brightness * (warmth * 0.99 + 0.01), rgb[2] * brightness * (2 - warmth)];
    rgb = vignette(rgb, u, v, 0.4);
    return grain(rgb, 7, px, py, seed);
  };
}

/** Teak: directional grain with knots. */
function woodGrain(seed) {
  const fbm = makeFbm(seed);
  return (u, v, px, py) => {
    const warp = fbm(u * 3, v * 9, 4) * 0.35;
    const rings = Math.sin((u * 14 + warp * 9) * Math.PI) * 0.5 + 0.5;
    const fine = fbm(u * 60, v * 8, 3) - 0.5;
    let rgb = mix(C.teak, C.teakLight, rings * 0.7 + fine * 0.3);
    const knot = Math.exp(-((u - 0.68) ** 2 + (v - 0.34) ** 2) * 220);
    rgb = mix(rgb, C.basalt900, knot * 0.55);
    rgb = vignette(rgb, u, v, 0.25);
    return grain(rgb, 8, px, py, seed);
  };
}

/** Terrazzo: scattered chips of varying size over a pale matrix. */
function terrazzo(seed) {
  const random = rng(seed);
  const chips = Array.from({ length: 120 }, () => ({
    x: random(),
    y: random(),
    r: 0.012 + random() * 0.035,
    tone: random(),
  }));
  return (u, v, px, py) => {
    let rgb = mix(C.basalt050, C.basalt100, 0.5);
    for (const chip of chips) {
      const dx = u - chip.x;
      const dy = v - chip.y;
      if (dx * dx + dy * dy < chip.r * chip.r) {
        const palette =
          chip.tone < 0.35 ? C.kota600 : chip.tone < 0.6 ? C.basalt400 : chip.tone < 0.85 ? C.basalt700 : C.brass500;
        rgb = mix(palette, C.basalt200, 0.15);
        break;
      }
    }
    rgb = vignette(rgb, u, v, 0.2);
    return grain(rgb, 6, px, py, seed);
  };
}

/** Brushed brass: anisotropic streaks plus a moving specular band. */
function brushedBrass(seed) {
  const fbm = makeFbm(seed);
  return (u, v, px, py) => {
    const streak = fbm(u * 220, v * 2.5, 2) - 0.5;
    const specular = Math.exp(-((v - 0.38) ** 2) * 26);
    let rgb = mix(C.brass700, C.brass400, 0.45 + streak * 0.55);
    rgb = mix(rgb, C.brass100, specular * 0.55);
    rgb = mix(rgb, C.basalt900, clamp01(v - 0.7) * 0.4);
    rgb = vignette(rgb, u, v, 0.3);
    return grain(rgb, 9, px, py, seed);
  };
}

/** Lime plaster: soft, broad mottling with trowel direction. */
function limePlaster(seed) {
  const fbm = makeFbm(seed);
  return (u, v, px, py) => {
    const broad = fbm(u * 4 + v * 1.2, v * 4, 5) - 0.5;
    const trowel = fbm(u * 30 + v * 18, v * 12, 2) - 0.5;
    let rgb = mix(C.basalt100, C.basalt000, 0.5 + broad * 0.9 + trowel * 0.18);
    rgb = mix(rgb, C.brass100, clamp01(broad + 0.3) * 0.18);
    rgb = vignette(rgb, u, v, 0.28);
    return grain(rgb, 6, px, py, seed);
  };
}

/**
 * §3.15 behind-the-wall: concealed works. Concrete with a rebar grid, conduit
 * runs, or a membrane — the actual subject matter of the module.
 */
function concealedWork(seed, kind) {
  const fbm = makeFbm(seed);
  return (u, v, px, py) => {
    // Concrete substrate.
    const speckle = fbm(u * 40, v * 40, 4) - 0.5;
    const broad = fbm(u * 5, v * 5, 3) - 0.5;
    let rgb = mix(C.basalt400, C.basalt300, 0.5 + broad * 0.8 + speckle * 0.35);

    if (kind === "rebar") {
      const barX = (u * 9) % 1 < 0.07;
      const barY = (v * 7) % 1 < 0.08;
      if (barX || barY) {
        const shade = barX && barY ? 0.15 : 0.3;
        rgb = mix(C.basalt700, C.brass700, shade);
      }
    } else if (kind === "conduit") {
      // Two parallel runs sweeping across the wall.
      for (const offset of [0.34, 0.58]) {
        const path = offset + Math.sin(u * 3.1) * 0.06;
        if (Math.abs(v - path) < 0.035) {
          const across = (v - path) / 0.035;
          rgb = mix(C.basalt100, C.basalt500, Math.abs(across) * 0.7);
        }
      }
    } else {
      // Membrane: a dark elastomeric coat with a wet sheen and a lap joint.
      const sheen = Math.exp(-((u - 0.35) ** 2 + (v - 0.3) ** 2) * 6);
      rgb = mix(C.kota800, C.kota600, 0.4 + broad * 0.7);
      rgb = mix(rgb, C.basalt300, sheen * 0.35);
      if (Math.abs(v - 0.66) < 0.012) rgb = mix(rgb, C.basalt900, 0.4);
    }

    rgb = vignette(rgb, u, v, 0.42);
    return grain(rgb, 10, px, py, seed);
  };
}

/** §0.3 layer 3 — the technical drawing layer: brass line work on basalt. */
function technicalDrawing(seed) {
  return (u, v, px, py) => {
    let rgb = mix(C.blueprint700, C.blueprint500, 0.35 + v * 0.2);

    // Fine graph grid.
    if ((u * 40) % 1 < 0.04 || (v * 28) % 1 < 0.05) {
      rgb = mix(rgb, C.blueprint300, 0.18);
    }
    // Heavier section lines.
    if ((u * 8) % 1 < 0.02 || (v * 6) % 1 < 0.03) {
      rgb = mix(rgb, C.blueprint300, 0.3);
    }

    // A plan outline: two rooms and an opening.
    const onRect = (x0, y0, x1, y1, t = 0.006) =>
      ((Math.abs(u - x0) < t || Math.abs(u - x1) < t) && v > y0 && v < y1) ||
      ((Math.abs(v - y0) < t || Math.abs(v - y1) < t) && u > x0 && u < x1);

    if (onRect(0.12, 0.18, 0.56, 0.74)) rgb = C.brass400;
    if (onRect(0.56, 0.18, 0.86, 0.5)) rgb = C.brass400;
    // Dimension line with ticks.
    if (Math.abs(v - 0.86) < 0.003 && u > 0.12 && u < 0.86) rgb = C.brass300;
    if ((Math.abs(u - 0.12) < 0.004 || Math.abs(u - 0.86) < 0.004) && Math.abs(v - 0.86) < 0.02) {
      rgb = C.brass300;
    }

    return grain(rgb, 5, px, py, seed);
  };
}

/** A workspace: drawings and samples on a desk, shot from above. */
function worktable(seed) {
  const fbm = makeFbm(seed);
  return (u, v, px, py) => {
    const wood = fbm(u * 8, v * 50, 3) - 0.5;
    let rgb = mix(C.basalt600, C.basalt500, 0.5 + wood * 0.5);

    // A sheet of drawings, rotated slightly.
    const rx = (u - 0.42) * Math.cos(0.12) - (v - 0.5) * Math.sin(0.12);
    const ry = (u - 0.42) * Math.sin(0.12) + (v - 0.5) * Math.cos(0.12);
    if (Math.abs(rx) < 0.3 && Math.abs(ry) < 0.34) {
      rgb = mix(C.basalt050, C.basalt000, 0.5);
      if ((rx * 26) % 1 < 0.05 || (ry * 20) % 1 < 0.06) rgb = mix(rgb, C.blueprint300, 0.5);
      if (Math.abs(rx + 0.1) < 0.12 && Math.abs(ry - 0.05) < 0.1) {
        rgb = mix(rgb, C.blueprint500, 0.55);
      }
      // Paper edge shadow.
      if (Math.abs(Math.abs(rx) - 0.3) < 0.008 || Math.abs(Math.abs(ry) - 0.34) < 0.008) {
        rgb = mix(rgb, C.basalt700, 0.3);
      }
    }

    // Two material samples.
    if ((u - 0.82) ** 2 + (v - 0.32) ** 2 < 0.012) rgb = mix(C.teak, C.teakLight, 0.5);
    if ((u - 0.86) ** 2 + (v - 0.66) ** 2 < 0.009) rgb = mix(C.brass500, C.brass300, 0.4);

    rgb = vignette(rgb, u, v, 0.5);
    return grain(rgb, 8, px, py, seed);
  };
}

/* ── the asset list ───────────────────────────────────────────────────── */

mkdirSync(OUT_DIR, { recursive: true });

const jobs = [
  // Hero: a dark interior, so the §1.5 wordmark scrim has something to sit on.
  ["hero.png", 1440, 900, interior({ seed: 11, wall: C.basalt700, floor: C.basalt800, accent: C.kota600, windowSide: "right", brightness: 0.86, warmth: 1.04 })],

  ["project-1.png", 520, 325, interior({ seed: 21, wall: C.basalt100, floor: C.teak, accent: C.kota600 })],
  ["project-2.png", 520, 325, interior({ seed: 22, wall: C.basalt200, floor: C.basalt600, accent: C.brass500, windowSide: "right" })],
  ["project-3.png", 520, 325, interior({ seed: 23, wall: C.basalt050, floor: C.teakLight, accent: C.basalt400 })],

  // Before/after: identical framing and crop (§3.14 requires this), differing
  // only in finish — which is exactly what the slider is comparing.
  ["before.png", 520, 293, interior({ seed: 31, wall: C.basalt500, floor: C.basalt600, accent: C.basalt500, brightness: 0.78, warmth: 0.94 })],
  ["after.png", 520, 293, interior({ seed: 31, wall: C.basalt050, floor: C.teak, accent: C.brass500, brightness: 1.04 })],

  ["team-1.png", 400, 300, worktable(41)],
  ["service-1.png", 520, 390, technicalDrawing(51)],
  ["article-1.png", 520, 293, interior({ seed: 61, wall: C.basalt100, floor: C.teakLight, accent: C.brass400, windowSide: "right" })],

  ["btw-1.png", 360, 270, concealedWork(71, "membrane")],
  ["btw-2.png", 360, 270, concealedWork(72, "conduit")],
  ["btw-3.png", 360, 270, concealedWork(73, "rebar")],
  ["btw-4.png", 360, 270, concealedWork(74, "conduit")],
  ["btw-5.png", 360, 270, concealedWork(75, "membrane")],

  ["material-1.png", 220, 220, woodGrain(81)],
  ["material-2.png", 220, 220, terrazzo(82)],
  ["material-3.png", 220, 220, brushedBrass(83)],
  ["material-4.png", 220, 220, limePlaster(84)],
];

// Gallery: mixed crops at varying heights so the masonry actually staggers.
const galleryScenes = [
  interior({ seed: 91, wall: C.basalt100, floor: C.teak, accent: C.kota600 }),
  woodGrain(92),
  interior({ seed: 93, wall: C.basalt200, floor: C.basalt600, accent: C.brass500, windowSide: "right" }),
  terrazzo(94),
  interior({ seed: 95, wall: C.basalt050, floor: C.teakLight, accent: C.brass400 }),
  limePlaster(96),
];
galleryScenes.forEach((scene, index) => {
  const height = index % 3 === 0 ? 560 : index % 2 === 0 ? 320 : 440;
  jobs.push([`gallery-${index + 1}.png`, 420, height, scene]);
});

for (const [name, width, height, shade] of jobs) {
  writePng(join(OUT_DIR, name), width, height, shade);
}

console.log(`Wrote ${jobs.length} procedural placeholders to public/dev/`);
