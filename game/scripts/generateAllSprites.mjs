#!/usr/bin/env node
/**
 * PIXELVERSUM - OPTIMIZED CELESTIAL SPRITE GENERATOR v6.0
 *
 * Generates realistic celestial body sprites with:
 * - Original large sizes (800-1500px)
 * - Optimized noise for FAST generation
 * - 8-12 frames for smooth but slow animation
 * - Segmented generation by celestial body type
 *
 * Usage:
 *   node generateAllSprites.mjs --all              # Generate everything
 *   node generateAllSprites.mjs --stars            # Generate only stars
 *   node generateAllSprites.mjs --planets          # Generate only planets
 *   node generateAllSprites.mjs --moons            # Generate only moons
 *   node generateAllSprites.mjs --asteroids        # Generate only asteroids
 *   node generateAllSprites.mjs --stars --planets  # Generate stars and planets
 */

import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

// ============================================================================
// CONFIGURATION - Original large sizes, optimized frames
// ============================================================================
const CONFIG = {
  // Sprite counts per type
  spritesPerPlanetType: 3,  // 3 variants per planet type
  spritesPerMoon: 5,
  spritesPerAsteroid: 8,

  // All stellar classifications
  stellarClasses: [
    'O', 'B', 'A', 'F', 'G', 'K', 'M',
    'BrownDwarf', 'WhiteDwarf', 'NeutronStar', 'Pulsar',
    'RedGiant', 'BlueGiant', 'RedSuperGiant', 'BlueSuperGiant',
    'WolfRayet', 'CarbonStar', 'SRed', 'Protostar'
  ],

  // Extended planet types - 36 types
  planetTypes: [
    'terran', 'rocky', 'desert', 'ice', 'frozen', 'tundra', 'savanna', 'alpine',
    'lava', 'volcanic', 'magma_ocean', 'sulfur',
    'ocean', 'archipelago', 'swamp', 'tropical',
    'carbon', 'crystal', 'metal', 'iron_core', 'diamond',
    'eyeball', 'tidally_locked', 'radioactive', 'toxic',
    'super_earth', 'mega_earth', 'jungle', 'pangea',
    'gas_giant', 'hot_jupiter', 'ice_giant', 'neptunian',
    'chthonian', 'hycean', 'coreless', 'protoplanet'
  ],

  // ORIGINAL LARGE star sizes
  starSizes: {
    'O': { min: 1200, max: 1500 },
    'B': { min: 1100, max: 1400 },
    'A': { min: 1000, max: 1300 },
    'F': { min: 900, max: 1200 },
    'G': { min: 800, max: 1100 },
    'K': { min: 700, max: 1000 },
    'M': { min: 500, max: 800 },
    'BrownDwarf': { min: 400, max: 600 },
    'WhiteDwarf': { min: 300, max: 500 },
    'NeutronStar': { min: 250, max: 400 },
    'Pulsar': { min: 250, max: 400 },
    'RedGiant': { min: 1300, max: 1500 },
    'BlueGiant': { min: 1200, max: 1450 },
    'RedSuperGiant': { min: 1400, max: 1500 },
    'BlueSuperGiant': { min: 1350, max: 1500 },
    'WolfRayet': { min: 900, max: 1200 },
    'CarbonStar': { min: 1000, max: 1300 },
    'SRed': { min: 600, max: 900 },
    'Protostar': { min: 800, max: 1100 }
  },

  // ORIGINAL LARGE planet sizes
  planetSizes: {
    'terran': { min: 600, max: 900 },
    'rocky': { min: 400, max: 700 },
    'desert': { min: 500, max: 800 },
    'ice': { min: 450, max: 750 },
    'frozen': { min: 400, max: 700 },
    'tundra': { min: 500, max: 800 },
    'savanna': { min: 600, max: 900 },
    'alpine': { min: 500, max: 800 },
    'lava': { min: 450, max: 750 },
    'volcanic': { min: 500, max: 800 },
    'magma_ocean': { min: 600, max: 950 },
    'sulfur': { min: 400, max: 650 },
    'ocean': { min: 700, max: 1000 },
    'archipelago': { min: 600, max: 950 },
    'swamp': { min: 500, max: 800 },
    'tropical': { min: 600, max: 950 },
    'carbon': { min: 450, max: 750 },
    'crystal': { min: 400, max: 700 },
    'metal': { min: 350, max: 650 },
    'iron_core': { min: 350, max: 600 },
    'diamond': { min: 400, max: 700 },
    'eyeball': { min: 500, max: 800 },
    'tidally_locked': { min: 450, max: 750 },
    'radioactive': { min: 400, max: 700 },
    'toxic': { min: 450, max: 750 },
    'super_earth': { min: 800, max: 1100 },
    'mega_earth': { min: 1000, max: 1300 },
    'jungle': { min: 700, max: 1000 },
    'pangea': { min: 750, max: 1050 },
    'gas_giant': { min: 1000, max: 1400 },
    'hot_jupiter': { min: 950, max: 1350 },
    'ice_giant': { min: 800, max: 1100 },
    'neptunian': { min: 750, max: 1050 },
    'chthonian': { min: 600, max: 950 },
    'hycean': { min: 750, max: 1100 },
    'coreless': { min: 500, max: 850 },
    'protoplanet': { min: 350, max: 700 }
  },

  moonSizes: { min: 200, max: 450 },
  asteroidSizes: { min: 150, max: 500 },

  // Fewer frames for slower animation
  starFrames: 8,
  planetFrames: 10,
  moonFrames: 8,
  asteroidFrames: 6
};

// ============================================================================
// FAST NOISE GENERATOR - Optimized with fewer octaves
// ============================================================================
class FastNoise {
  constructor(seed = 12345) {
    this.seed = seed;
    this.perm = new Uint8Array(512);
    this.initPermutation(seed);
  }

  initPermutation(seed) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;

    let rng = seed >>> 0;
    for (let i = 255; i > 0; i--) {
      rng = (rng * 1664525 + 1013904223) >>> 0;
      const j = rng % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }

    for (let i = 0; i < 256; i++) {
      this.perm[i] = this.perm[i + 256] = p[i];
    }
  }

  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(a, b, t) { return a + t * (b - a); }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }

  noise3D(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    const A = this.perm[X] + Y;
    const AA = this.perm[A] + Z;
    const AB = this.perm[A + 1] + Z;
    const B = this.perm[X + 1] + Y;
    const BA = this.perm[B] + Z;
    const BB = this.perm[B + 1] + Z;

    return this.lerp(
      this.lerp(
        this.lerp(this.grad(this.perm[AA], x, y, z), this.grad(this.perm[BA], x - 1, y, z), u),
        this.lerp(this.grad(this.perm[AB], x, y - 1, z), this.grad(this.perm[BB], x - 1, y - 1, z), u),
        v
      ),
      this.lerp(
        this.lerp(this.grad(this.perm[AA + 1], x, y, z - 1), this.grad(this.perm[BA + 1], x - 1, y, z - 1), u),
        this.lerp(this.grad(this.perm[AB + 1], x, y - 1, z - 1), this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1), u),
        v
      ),
      w
    );
  }

  // Optimized FBM with fewer octaves (4 instead of 12)
  fbm(x, y, z = 0, octaves = 4) {
    let value = 0, amp = 1, freq = 1, max = 0;
    for (let i = 0; i < octaves; i++) {
      value += this.noise3D(x * freq, y * freq, z * freq) * amp;
      max += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return (value / max) * 0.5 + 0.5;
  }

  // Fast turbulence (4 octaves)
  turbulence(x, y, z = 0, octaves = 4) {
    let value = 0, amp = 1, freq = 1, max = 0;
    for (let i = 0; i < octaves; i++) {
      value += Math.abs(this.noise3D(x * freq, y * freq, z * freq)) * amp;
      max += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return value / max;
  }

  // Ridged noise for mountains (4 octaves)
  ridged(x, y, z = 0, octaves = 4) {
    let value = 0, amp = 1, freq = 1, weight = 1;
    for (let i = 0; i < octaves; i++) {
      let signal = this.noise3D(x * freq, y * freq, z * freq);
      signal = 1 - Math.abs(signal);
      signal *= signal * weight;
      weight = Math.min(1, Math.max(0, signal * 2));
      value += signal * amp;
      amp *= 0.5;
      freq *= 2;
    }
    return Math.min(1, Math.max(0, value * 0.5));
  }

  // Simple domain warp (1 iteration for speed)
  warp(x, y, z = 0, strength = 1) {
    const wx = x + this.fbm(x + 5.2, y + 1.3, z, 3) * strength;
    const wy = y + this.fbm(x + 7.8, y + 3.7, z, 3) * strength;
    return { x: wx, y: wy };
  }
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 128, g: 128, b: 128 };
}

function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
}

function getRandom(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

// ============================================================================
// STAR PALETTES
// ============================================================================
const STAR_PALETTES = {
  'O': { core: ['#9bb0ff', '#aabbff', '#ccdeff', '#eef5ff', '#ffffff'], glow: '#6688ee' },
  'B': { core: ['#aabbff', '#bbccff', '#ddeeff', '#f0f8ff', '#ffffff'], glow: '#88aaff' },
  'A': { core: ['#cad7ff', '#e4edff', '#f1f8ff', '#fafcff', '#ffffff'], glow: '#bbc8ff' },
  'F': { core: ['#f8f7ff', '#fefeff', '#fffff8', '#fffffc', '#ffffff'], glow: '#f0efff' },
  'G': { core: ['#fff4ea', '#ffeccc', '#ffd466', '#ffee88', '#ffffcc'], glow: '#ffeecc' },
  'K': { core: ['#ffd2a1', '#ffba78', '#ff8828', '#ffaa44', '#ffcc66'], glow: '#ffccaa' },
  'M': { core: ['#ffb56c', '#ff9944', '#ff5500', '#ff7722', '#ff9944'], glow: '#ff9966' },
  'BrownDwarf': { core: ['#8b4513', '#a0522d', '#cd853f', '#daa06d', '#e8c090'], glow: '#a0522d' },
  'WhiteDwarf': { core: ['#e8e8ff', '#f0f0ff', '#f8f8ff', '#fcfcff', '#ffffff'], glow: '#e0e0ff' },
  'NeutronStar': { core: ['#00cccc', '#00dddd', '#00ffff', '#80ffff', '#ffffff'], glow: '#00cccc' },
  'Pulsar': { core: ['#cc00cc', '#dd00dd', '#ff00ff', '#ff80ff', '#ffffff'], glow: '#cc00cc' },
  'RedGiant': { core: ['#ff4020', '#ff5030', '#ff6347', '#ff8060', '#ffaa88'], glow: '#ff7050' },
  'BlueGiant': { core: ['#4169e1', '#5070e8', '#7090f8', '#90b0ff', '#c0d0ff'], glow: '#6080e0' },
  'RedSuperGiant': { core: ['#cc0000', '#dd0000', '#ff2000', '#ff5030', '#ff8060'], glow: '#ff4020' },
  'BlueSuperGiant': { core: ['#0044ff', '#0066ff', '#0088ff', '#44aaff', '#88ccff'], glow: '#2060ff' },
  'WolfRayet': { core: ['#00aadd', '#00ccff', '#00eeff', '#44ffff', '#88ffff'], glow: '#0099cc' },
  'CarbonStar': { core: ['#cc0000', '#dd1100', '#ff3300', '#ff5511', '#ff8844'], glow: '#ff5511' },
  'SRed': { core: ['#ff2222', '#ff4444', '#ff6666', '#ff8888', '#ffaaaa'], glow: '#ff7777' },
  'Protostar': { core: ['#ff6600', '#ff8822', '#ffaa44', '#ffcc77', '#ffee99'], glow: '#ffbb66' }
};

// ============================================================================
// PLANET PALETTES
// ============================================================================
const PLANET_PALETTES = {
  terran: {
    ocean: ['#003366', '#004080', '#0066cc', '#0088dd'],
    land: ['#4a7c59', '#5d8a4a', '#7daa6a', '#8abc99'],
    mountain: ['#6b5b4b', '#8b7b6b', '#ab9b8b'],
    snow: ['#e8f4f8', '#f8fcfe', '#ffffff'],
    cloud: '#ffffff'
  },
  rocky: {
    surface: ['#4a3d32', '#6a5d52', '#8a7d72', '#aa9d92'],
    crater: ['#1a1512', '#2a251f', '#3a352c'],
    highlight: ['#b0a090', '#d0c0b0']
  },
  desert: {
    sand: ['#d2b48c', '#e6c8a0', '#fadcb4'],
    dune: ['#c8a070', '#e8c090'],
    rock: ['#8a7a6a', '#aa9a8a'],
    canyon: ['#705040', '#907060']
  },
  ice: {
    surface: ['#90c8e0', '#b0e0f0', '#d0f8ff'],
    deep: ['#4080a0', '#60a0c0'],
    crevasse: ['#203040', '#405060']
  },
  frozen: {
    nitrogen: ['#b8c8ff', '#d8e8ff', '#f8fcff'],
    methane: ['#ffc8d8', '#ffe8f4'],
    dark: ['#182028', '#384050']
  },
  tundra: {
    permafrost: ['#8090a0', '#a0b0c0', '#c0d0e0'],
    moss: ['#4a5a3a', '#6a7a5a'],
    rock: ['#5a5a5a', '#7a7a7a']
  },
  savanna: {
    grass: ['#a08040', '#c0a060', '#e0c080'],
    earth: ['#8a6a4a', '#aa8a6a'],
    tree: ['#4a6a3a', '#6a8a5a']
  },
  alpine: {
    rock: ['#6a6a7a', '#8a8a9a'],
    snow: ['#e8f0f8', '#ffffff'],
    meadow: ['#5a8a5a', '#7aaa7a']
  },
  lava: {
    hot: ['#ffff00', '#ff8800', '#ff4400'],
    cooling: ['#ff3300', '#cc0000'],
    crust: ['#1a1a1a', '#3a3a3a', '#5a5a5a']
  },
  volcanic: {
    basalt: ['#2a2a30', '#4a4a50', '#6a6a70'],
    ash: ['#505050', '#707070', '#909090'],
    lava: ['#ff4400', '#ff6600', '#ff8800']
  },
  magma_ocean: {
    magma: ['#ff6600', '#ff8800', '#ffaa00'],
    cooling: ['#cc4400', '#aa2200'],
    crust: ['#2a1a1a', '#4a3a3a']
  },
  sulfur: {
    yellow: ['#ccaa00', '#eecc00', '#ffee00'],
    orange: ['#cc6600', '#ee8800'],
    red: ['#aa2200', '#cc4400']
  },
  ocean: {
    deep: ['#000814', '#002846', '#004878'],
    surface: ['#0098dc', '#20c0ff', '#60d0ff'],
    foam: ['#e0f8ff', '#ffffff']
  },
  archipelago: {
    ocean: ['#004080', '#0066cc', '#0099ee'],
    island: ['#4a7c59', '#6a9c79'],
    beach: ['#e8d4b0', '#f8e4d0']
  },
  swamp: {
    water: ['#2a4a3a', '#3a5a4a'],
    vegetation: ['#3a5a2a', '#5a7a4a'],
    mud: ['#4a3a2a', '#6a5a4a']
  },
  tropical: {
    ocean: ['#0088cc', '#00aaee'],
    jungle: ['#2a7a2a', '#4a9a4a'],
    beach: ['#f0dcc0', '#fff4e0']
  },
  carbon: {
    graphite: ['#1a1a1a', '#3a3a3a', '#5a5a5a'],
    diamond: ['#c8d8e8', '#e8f4ff', '#ffffff']
  },
  crystal: {
    amethyst: ['#6a2a8a', '#8a4aaa', '#aa6aca'],
    quartz: ['#f0e8f8', '#fcf8fe', '#ffffff']
  },
  metal: {
    iron: ['#4a4a5a', '#6a6a7a', '#8a8a9a'],
    rust: ['#6a3a2a', '#8a5a4a'],
    shine: ['#e0e8f0', '#f8fcff']
  },
  iron_core: {
    core: ['#3a3a4a', '#5a5a6a'],
    surface: ['#6a6a7a', '#8a8a9a']
  },
  diamond: {
    surface: ['#e8f0f8', '#f8faff', '#ffffff'],
    facet: ['#c8d8e8', '#d8e8f8']
  },
  eyeball: {
    hot: ['#ff6600', '#ff8800'],
    cold: ['#80c0e0', '#c0e8ff'],
    terminator: ['#4a6a8a', '#6a8aaa']
  },
  tidally_locked: {
    day: ['#ffcc88', '#ffeebb'],
    night: ['#1a2a3a', '#2a3a4a'],
    twilight: ['#6a5a4a', '#8a7a6a']
  },
  radioactive: {
    glow: ['#00ff00', '#44ff44', '#88ff88'],
    waste: ['#4a6a2a', '#6a8a4a'],
    crater: ['#2a4a2a', '#4a6a4a']
  },
  toxic: {
    acid: ['#88cc00', '#aaee00', '#ccff22'],
    sludge: ['#445500', '#667700'],
    gas: ['#99aa44', '#bbcc66']
  },
  super_earth: {
    ocean: ['#003366', '#005588'],
    land: ['#5a8c6a', '#7aac8a'],
    atmosphere: ['#aaccee', '#cceeff']
  },
  mega_earth: {
    surface: ['#4a6a5a', '#6a8a7a'],
    ocean: ['#004488', '#0066aa'],
    cloud: ['#d0e0f0', '#ffffff']
  },
  jungle: {
    canopy: ['#2a7a2a', '#4a9a4a', '#6aba6a'],
    deep: ['#0a4a0a', '#2a6a2a'],
    flower: ['#ff6688', '#ffaacc']
  },
  pangea: {
    land: ['#7a9a6a', '#9aba8a'],
    ocean: ['#004080', '#0066bb'],
    desert: ['#c8a070', '#e8c090']
  },
  gas_giant: {
    band1: ['#8b6914', '#ab8934', '#cba954'],
    band2: ['#d4a574', '#f2d5a4', '#fce5b4'],
    storm: ['#cc4422', '#ee6644']
  },
  hot_jupiter: {
    band1: ['#ff6644', '#ff8866'],
    band2: ['#ffaa88', '#ffccaa'],
    glow: ['#ff4422', '#ff6644']
  },
  ice_giant: {
    atmosphere: ['#1a4a7a', '#3a6a9a', '#5a8aba'],
    methane: ['#40a0c0', '#60c0e0'],
    storm: ['#ffffff', '#e8e8ff']
  },
  neptunian: {
    deep: ['#1a3a6a', '#2a4a7a'],
    upper: ['#4a7aaa', '#6a9aca'],
    storm: ['#ffffff', '#e0e0ff']
  },
  chthonian: {
    core: ['#4a3a3a', '#6a5a5a'],
    surface: ['#8a7a7a', '#aa9a9a'],
    scar: ['#2a1a1a', '#4a3a3a']
  },
  hycean: {
    ocean: ['#004080', '#0066bb', '#0099ee'],
    atmosphere: ['#80c0e0', '#c0e8ff'],
    cloud: ['#ffffff', '#f0f8ff']
  },
  coreless: {
    mantle: ['#6a5a4a', '#8a7a6a'],
    surface: ['#aa9a8a', '#cabaa0']
  },
  protoplanet: {
    debris: ['#4a4040', '#6a6060'],
    hot: ['#ff8844', '#ffaa66'],
    dust: ['#8a7a6a', '#aa9a8a']
  }
};

// ============================================================================
// STAR GENERATOR - Optimized
// ============================================================================
function generateStar(stellarClass) {
  const sizeRange = CONFIG.starSizes[stellarClass] || CONFIG.starSizes['G'];
  const size = getRandom(sizeRange.min, sizeRange.max);
  const frames = CONFIG.starFrames;
  const palette = STAR_PALETTES[stellarClass] || STAR_PALETTES['G'];

  console.log(`  Generating ${stellarClass} star (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new FastNoise(Math.floor(Math.random() * 1000000));

  const isGiant = ['RedGiant', 'BlueGiant', 'RedSuperGiant', 'BlueSuperGiant'].includes(stellarClass);
  const radius = size * 0.35; // Keep star within bounds
  const centerX = size / 2;
  const centerY = size / 2;

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const time = frame / frames;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * size + x) * 4;

        // Outer glow
        if (dist < radius * 2.5 && dist > radius) {
          const glowFalloff = Math.pow(1 - (dist - radius) / (radius * 1.5), 2);
          if (glowFalloff > 0.01) {
            const glowColor = hexToRgb(palette.glow);
            const intensity = glowFalloff * 0.4;
            data[idx] = glowColor.r * intensity;
            data[idx + 1] = glowColor.g * intensity;
            data[idx + 2] = glowColor.b * intensity;
            data[idx + 3] = Math.floor(intensity * 255);
          }
        }

        // Star surface
        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          // Spherical coordinates for texture
          const phi = Math.atan2(dy, dx) + time * Math.PI * 2;
          const theta = Math.acos(Math.max(-1, Math.min(1, dy / radius)));
          const texX = phi * 2;
          const texY = theta * 2;

          // Surface features
          const granulation = noise.fbm(texX * 4, texY * 4, time * 2, 4) * 0.15;
          const cells = noise.fbm(texX * 2, texY * 2, time, 3) * 0.1;

          // Sunspots
          let spotDarkening = 1.0;
          const spotNoise = noise.fbm(texX * 3, texY * 3, time * 0.2, 3);
          if (spotNoise < 0.2 && Math.abs(normalizedDist) < 0.8) {
            spotDarkening = 0.5 + spotNoise * 2.5;
          }

          // Limb darkening
          const limbDarkening = 0.5 + 0.5 * Math.pow(z, 0.4);

          let brightness = (0.6 + granulation + cells) * spotDarkening * limbDarkening;
          brightness = Math.max(0.2, Math.min(1.2, brightness));

          // Color from palette
          const colorIdx = Math.min(palette.core.length - 1, Math.floor(brightness * palette.core.length));
          const color = hexToRgb(palette.core[colorIdx]);

          data[idx] = Math.min(255, color.r * brightness);
          data[idx + 1] = Math.min(255, color.g * brightness);
          data[idx + 2] = Math.min(255, color.b * brightness);
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, offsetX, 0);
  }

  return { canvas, size };
}

// ============================================================================
// PLANET GENERATOR - Optimized
// ============================================================================
function generatePlanet(type, index) {
  const sizeRange = CONFIG.planetSizes[type] || CONFIG.planetSizes.terran;
  const size = getRandom(sizeRange.min, sizeRange.max);
  const frames = CONFIG.planetFrames;
  const palette = PLANET_PALETTES[type] || PLANET_PALETTES.terran;

  console.log(`    ${type}_${String(index).padStart(3, '0')} (${size}x${size}px)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new FastNoise(Math.floor(Math.random() * 1000000) + index * 10000);

  const radius = size * 0.42; // Keep planet within bounds with room for atmosphere
  const centerX = size / 2;
  const centerY = size / 2;

  const isGasGiant = ['gas_giant', 'hot_jupiter', 'ice_giant', 'neptunian'].includes(type);
  const hasAtmosphere = ['terran', 'ocean', 'jungle', 'tropical', 'super_earth', 'mega_earth', 'hycean'].includes(type);

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const time = frame / frames;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * size + x) * 4;

        // Atmosphere glow
        if (hasAtmosphere && dist > radius && dist < radius * 1.15) {
          const atmosFalloff = 1 - (dist - radius) / (radius * 0.15);
          if (atmosFalloff > 0) {
            data[idx] = 150 * atmosFalloff;
            data[idx + 1] = 200 * atmosFalloff;
            data[idx + 2] = 255 * atmosFalloff;
            data[idx + 3] = Math.floor(atmosFalloff * 100);
          }
        }

        // Planet surface
        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          // Spherical coordinates
          const lat = Math.asin(dy / Math.max(1, dist));
          const lon = Math.atan2(dx, z) + time * Math.PI * 2;
          const texX = lon * 2;
          const texY = lat * 4;

          let r, g, b;

          if (isGasGiant) {
            // Gas giant bands
            const bandNoise = noise.fbm(texX * 0.5, texY * 2, time * 0.5, 3);
            const bandValue = (Math.sin(lat * 12 + bandNoise * 2) + 1) * 0.5;
            const turbulence = noise.turbulence(texX * 2, texY * 1, time, 3) * 0.2;

            const band1 = palette.band1 || ['#aa8844', '#ccaa66'];
            const band2 = palette.band2 || ['#ddcc88', '#ffeeaa'];
            const color1 = hexToRgb(band1[Math.floor(bandNoise * band1.length)]);
            const color2 = hexToRgb(band2[Math.floor(bandNoise * band2.length)]);

            r = color1.r * (1 - bandValue) + color2.r * bandValue;
            g = color1.g * (1 - bandValue) + color2.g * bandValue;
            b = color1.b * (1 - bandValue) + color2.b * bandValue;

            // Storm
            const stormNoise = noise.fbm(texX * 3, texY * 3, time * 0.3, 3);
            if (stormNoise > 0.75 && Math.abs(lat) < 0.5) {
              const storm = palette.storm || ['#cc4422'];
              const stormColor = hexToRgb(storm[0]);
              const stormIntensity = (stormNoise - 0.75) * 4;
              r = r * (1 - stormIntensity) + stormColor.r * stormIntensity;
              g = g * (1 - stormIntensity) + stormColor.g * stormIntensity;
              b = b * (1 - stormIntensity) + stormColor.b * stormIntensity;
            }
          } else {
            // Terrestrial planet
            const warped = noise.warp(texX, texY, time * 0.5, 1);
            const elevation = noise.fbm(warped.x * 2, warped.y * 2, time * 0.3, 4);
            const detail = noise.fbm(warped.x * 6, warped.y * 6, time * 0.5, 3) * 0.3;

            const totalElev = elevation + detail * 0.3;

            // Get colors based on type
            const colors = getTerrainColors(type, totalElev, lat, palette);
            r = colors.r;
            g = colors.g;
            b = colors.b;
          }

          // Limb darkening
          const limbDarkening = 0.4 + 0.6 * Math.pow(z, 0.5);
          r *= limbDarkening;
          g *= limbDarkening;
          b *= limbDarkening;

          data[idx] = Math.min(255, Math.max(0, r));
          data[idx + 1] = Math.min(255, Math.max(0, g));
          data[idx + 2] = Math.min(255, Math.max(0, b));
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, offsetX, 0);
  }

  return { canvas, size };
}

function getTerrainColors(type, elevation, lat, palette) {
  let r = 128, g = 128, b = 128;

  // Get first available color array from palette
  const getColor = (arr, idx = 0) => {
    if (!arr || arr.length === 0) return { r: 128, g: 128, b: 128 };
    return hexToRgb(arr[Math.min(idx, arr.length - 1)]);
  };

  switch (type) {
    case 'terran':
    case 'super_earth':
    case 'mega_earth':
      if (elevation < 0.35) {
        const c = getColor(palette.ocean, Math.floor(elevation * 10));
        r = c.r; g = c.g; b = c.b;
      } else if (elevation < 0.5) {
        const c = getColor(palette.land, 0);
        r = c.r; g = c.g; b = c.b;
      } else if (elevation < 0.7) {
        const c = getColor(palette.land, 2);
        r = c.r; g = c.g; b = c.b;
      } else if (elevation < 0.85) {
        const c = getColor(palette.mountain, 1);
        r = c.r; g = c.g; b = c.b;
      } else {
        const c = getColor(palette.snow, 1);
        r = c.r; g = c.g; b = c.b;
      }
      break;

    case 'rocky':
      const rockIdx = Math.floor(elevation * 4);
      const rc = getColor(palette.surface, rockIdx);
      r = rc.r; g = rc.g; b = rc.b;
      if (elevation < 0.2) {
        const cc = getColor(palette.crater, 1);
        r = cc.r; g = cc.g; b = cc.b;
      }
      break;

    case 'desert':
      if (elevation < 0.6) {
        const sc = getColor(palette.sand, Math.floor(elevation * 5));
        r = sc.r; g = sc.g; b = sc.b;
      } else {
        const dc = getColor(palette.dune, Math.floor((elevation - 0.6) * 5));
        r = dc.r; g = dc.g; b = dc.b;
      }
      break;

    case 'ice':
    case 'frozen':
      const ic = getColor(palette.surface || palette.nitrogen, Math.floor(elevation * 3));
      r = ic.r; g = ic.g; b = ic.b;
      break;

    case 'lava':
    case 'volcanic':
    case 'magma_ocean':
      if (elevation > 0.6) {
        const hc = getColor(palette.hot || palette.lava || palette.magma, 1);
        r = hc.r; g = hc.g; b = hc.b;
      } else {
        const cc = getColor(palette.crust || palette.basalt, 1);
        r = cc.r; g = cc.g; b = cc.b;
      }
      break;

    case 'ocean':
    case 'hycean':
      const oc = getColor(palette.ocean || palette.deep, Math.floor(elevation * 4));
      r = oc.r; g = oc.g; b = oc.b;
      break;

    case 'jungle':
    case 'tropical':
      if (elevation < 0.3) {
        const wc = getColor(palette.ocean, 0);
        r = wc.r; g = wc.g; b = wc.b;
      } else {
        const jc = getColor(palette.canopy || palette.jungle, Math.floor(elevation * 3));
        r = jc.r; g = jc.g; b = jc.b;
      }
      break;

    case 'radioactive':
      if (elevation > 0.7) {
        const gc = getColor(palette.glow, 1);
        r = gc.r; g = gc.g; b = gc.b;
      } else {
        const wc = getColor(palette.waste, 0);
        r = wc.r; g = wc.g; b = wc.b;
      }
      break;

    case 'toxic':
      const tc = getColor(palette.acid || palette.sludge, Math.floor(elevation * 2));
      r = tc.r; g = tc.g; b = tc.b;
      break;

    case 'carbon':
      const cc = getColor(palette.graphite, Math.floor(elevation * 3));
      r = cc.r; g = cc.g; b = cc.b;
      break;

    case 'crystal':
      const crc = getColor(palette.amethyst || palette.quartz, Math.floor(elevation * 3));
      r = crc.r; g = crc.g; b = crc.b;
      break;

    case 'metal':
    case 'iron_core':
      const mc = getColor(palette.iron || palette.core, Math.floor(elevation * 3));
      r = mc.r; g = mc.g; b = mc.b;
      break;

    default:
      // Generic fallback - use first available palette entry
      const keys = Object.keys(palette);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const fc = getColor(palette[firstKey], Math.floor(elevation * 3));
        r = fc.r; g = fc.g; b = fc.b;
      }
  }

  return { r, g, b };
}

// ============================================================================
// MOON GENERATOR - Optimized
// ============================================================================
function generateMoon(index) {
  const size = getRandom(CONFIG.moonSizes.min, CONFIG.moonSizes.max);
  const frames = CONFIG.moonFrames;

  console.log(`    moon_${String(index).padStart(3, '0')} (${size}x${size}px)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new FastNoise(Math.floor(Math.random() * 1000000) + index * 10000);

  const radius = size * 0.42;
  const centerX = size / 2;
  const centerY = size / 2;

  // Moon type
  const types = ['rocky', 'icy', 'volcanic'];
  const moonType = types[index % types.length];

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const time = frame / frames;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * size + x) * 4;

        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          const lon = Math.atan2(dx, z) + time * Math.PI * 2;
          const lat = Math.asin(dy / Math.max(1, dist));

          const elevation = noise.fbm(lon * 3, lat * 3, index, 4);
          const craters = noise.fbm(lon * 8, lat * 8, index + 100, 3);

          let r, g, b;

          if (moonType === 'rocky') {
            const base = 80 + elevation * 60;
            r = base; g = base * 0.95; b = base * 0.9;
            if (craters < 0.25) {
              r *= 0.6; g *= 0.6; b *= 0.6;
            }
          } else if (moonType === 'icy') {
            const base = 180 + elevation * 50;
            r = base * 0.9; g = base * 0.95; b = base;
            if (craters < 0.2) {
              r *= 0.7; g *= 0.75; b *= 0.8;
            }
          } else {
            const base = 60 + elevation * 40;
            r = base * 1.2; g = base * 0.8; b = base * 0.6;
            if (elevation > 0.7) {
              r = 255; g = 100 + elevation * 100; b = 0;
            }
          }

          const limbDarkening = 0.4 + 0.6 * Math.pow(z, 0.5);
          r *= limbDarkening;
          g *= limbDarkening;
          b *= limbDarkening;

          data[idx] = Math.min(255, Math.max(0, r));
          data[idx + 1] = Math.min(255, Math.max(0, g));
          data[idx + 2] = Math.min(255, Math.max(0, b));
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, offsetX, 0);
  }

  return { canvas, size };
}

// ============================================================================
// ASTEROID GENERATOR - Optimized
// ============================================================================
function generateAsteroid(index) {
  const size = getRandom(CONFIG.asteroidSizes.min, CONFIG.asteroidSizes.max);
  const frames = CONFIG.asteroidFrames;

  console.log(`    asteroid_${String(index).padStart(3, '0')} (${size}x${size}px)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new FastNoise(Math.floor(Math.random() * 1000000) + index * 10000);

  const centerX = size / 2;
  const centerY = size / 2;

  // Irregular shape parameters
  const baseRadius = size * 0.35;
  const irregularity = 0.15 + Math.random() * 0.15;

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const time = frame / frames;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) + time * Math.PI * 2;
        const idx = (y * size + x) * 4;

        // Irregular shape
        const shapeNoise = noise.fbm(angle * 3, index, 0, 3);
        const localRadius = baseRadius * (1 + (shapeNoise - 0.5) * irregularity * 2);

        if (dist <= localRadius) {
          const normalizedDist = dist / localRadius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          const surfaceNoise = noise.fbm(angle * 5 + time * Math.PI * 2, normalizedDist * 5, index, 3);

          const baseColor = 70 + surfaceNoise * 50;
          let r = baseColor * 1.1;
          let g = baseColor;
          let b = baseColor * 0.9;

          // Craters
          const craterNoise = noise.fbm(angle * 10, normalizedDist * 10, index + 50, 3);
          if (craterNoise < 0.2) {
            r *= 0.6; g *= 0.6; b *= 0.6;
          }

          const limbDarkening = 0.3 + 0.7 * Math.pow(z, 0.6);
          r *= limbDarkening;
          g *= limbDarkening;
          b *= limbDarkening;

          data[idx] = Math.min(255, Math.max(0, r));
          data[idx + 1] = Math.min(255, Math.max(0, g));
          data[idx + 2] = Math.min(255, Math.max(0, b));
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, offsetX, 0);
  }

  return { canvas, size };
}

// ============================================================================
// MAIN GENERATION FUNCTIONS
// ============================================================================
async function generateStars() {
  console.log('\n=== GENERATING STARS ===\n');
  const starsDir = path.join(OUTPUT_DIR, 'stars');
  fs.mkdirSync(starsDir, { recursive: true });

  const manifest = { type: 'stars', sprites: {} };

  for (const stellarClass of CONFIG.stellarClasses) {
    const { canvas, size } = generateStar(stellarClass);
    const filename = `star_${stellarClass}.png`;
    const filepath = path.join(starsDir, filename);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);

    manifest.sprites[stellarClass] = {
      file: filename,
      frameWidth: size,
      frameHeight: size,
      frameCount: CONFIG.starFrames,
      variants: 1
    };
  }

  fs.writeFileSync(
    path.join(starsDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\nStars complete: ${CONFIG.stellarClasses.length} stellar classes`);
}

async function generatePlanets() {
  console.log('\n=== GENERATING PLANETS ===\n');
  const planetsDir = path.join(OUTPUT_DIR, 'planets');
  fs.mkdirSync(planetsDir, { recursive: true });

  const manifest = { type: 'planets', sprites: {} };

  for (const planetType of CONFIG.planetTypes) {
    console.log(`  Generating ${planetType} planets...`);
    manifest.sprites[planetType] = { variants: [] };

    for (let i = 0; i < CONFIG.spritesPerPlanetType; i++) {
      const { canvas, size } = generatePlanet(planetType, i);
      const filename = `planet_${planetType}_${String(i).padStart(3, '0')}.png`;
      const filepath = path.join(planetsDir, filename);

      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(filepath, buffer);

      manifest.sprites[planetType].variants.push({
        file: filename,
        frameWidth: size,
        frameHeight: size,
        frameCount: CONFIG.planetFrames
      });
    }
  }

  fs.writeFileSync(
    path.join(planetsDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\nPlanets complete: ${CONFIG.planetTypes.length} types x ${CONFIG.spritesPerPlanetType} variants`);
}

async function generateMoons() {
  console.log('\n=== GENERATING MOONS ===\n');
  const moonsDir = path.join(OUTPUT_DIR, 'moons');
  fs.mkdirSync(moonsDir, { recursive: true });

  const manifest = { type: 'moons', sprites: { variants: [] } };

  for (let i = 0; i < CONFIG.spritesPerMoon; i++) {
    const { canvas, size } = generateMoon(i);
    const filename = `moon_${String(i).padStart(3, '0')}.png`;
    const filepath = path.join(moonsDir, filename);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);

    manifest.sprites.variants.push({
      file: filename,
      frameWidth: size,
      frameHeight: size,
      frameCount: CONFIG.moonFrames
    });
  }

  fs.writeFileSync(
    path.join(moonsDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\nMoons complete: ${CONFIG.spritesPerMoon} variants`);
}

async function generateAsteroids() {
  console.log('\n=== GENERATING ASTEROIDS ===\n');
  const asteroidsDir = path.join(OUTPUT_DIR, 'asteroids');
  fs.mkdirSync(asteroidsDir, { recursive: true });

  const manifest = { type: 'asteroids', sprites: { variants: [] } };

  for (let i = 0; i < CONFIG.spritesPerAsteroid; i++) {
    const { canvas, size } = generateAsteroid(i);
    const filename = `asteroid_${String(i).padStart(3, '0')}.png`;
    const filepath = path.join(asteroidsDir, filename);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);

    manifest.sprites.variants.push({
      file: filename,
      frameWidth: size,
      frameHeight: size,
      frameCount: CONFIG.asteroidFrames
    });
  }

  fs.writeFileSync(
    path.join(asteroidsDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\nAsteroids complete: ${CONFIG.spritesPerAsteroid} variants`);
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  const args = process.argv.slice(2);

  const generateAll = args.includes('--all') || args.length === 0;
  const doStars = generateAll || args.includes('--stars');
  const doPlanets = generateAll || args.includes('--planets');
  const doMoons = generateAll || args.includes('--moons');
  const doAsteroids = generateAll || args.includes('--asteroids');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     PIXELVERSUM CELESTIAL SPRITE GENERATOR v6.0            ║');
  console.log('║     Optimized for fast generation with large sizes         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Usage:');
  console.log('  node generateAllSprites.mjs --all        # Generate everything');
  console.log('  node generateAllSprites.mjs --stars      # Stars only');
  console.log('  node generateAllSprites.mjs --planets    # Planets only');
  console.log('  node generateAllSprites.mjs --moons      # Moons only');
  console.log('  node generateAllSprites.mjs --asteroids  # Asteroids only');
  console.log('');
  console.log(`Generating: ${[
    doStars && 'stars',
    doPlanets && 'planets',
    doMoons && 'moons',
    doAsteroids && 'asteroids'
  ].filter(Boolean).join(', ')}`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const startTime = Date.now();

  if (doStars) await generateStars();
  if (doPlanets) await generatePlanets();
  if (doMoons) await generateMoons();
  if (doAsteroids) await generateAsteroids();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`Generation complete in ${elapsed}s`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
