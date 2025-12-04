#!/usr/bin/env node
/**
 * ULTRA-REALISTIC CELESTIAL SPRITE GENERATOR v2.0
 *
 * High-resolution, heavily detailed sprites with:
 * - Bright, glowing stars with visible corona and CMEs
 * - Chaotically boiling star surfaces
 * - Ultra-detailed planetary surfaces with complex geography
 * - Atmospheric effects with clouds
 * - Realistic moons, asteroids, and gas giants
 */

import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  spritesPerPlanetType: 3,
  spritesPerMoon: 5,
  spritesPerAsteroid: 8,

  stellarClasses: [
    'O', 'B', 'A', 'F', 'G', 'K', 'M',
    'BrownDwarf', 'WhiteDwarf', 'NeutronStar', 'Pulsar',
    'RedGiant', 'BlueGiant', 'RedSuperGiant', 'BlueSuperGiant'
  ],

  planetTypes: [
    'terran', 'rocky', 'desert', 'ice', 'frozen', 'tundra',
    'lava', 'volcanic', 'ocean', 'carbon', 'crystal', 'metal',
    'eyeball', 'tidally_locked', 'radioactive', 'super_earth',
    'jungle', 'gas_giant'
  ],

  // Larger sizes for more detail
  starSizes: {
    'O': 1400, 'B': 1300, 'A': 1100, 'F': 1200, 'G': 1200,
    'K': 900, 'M': 600, 'BrownDwarf': 600, 'WhiteDwarf': 600,
    'NeutronStar': 350, 'Pulsar': 400,
    'RedGiant': 1500, 'BlueGiant': 1500,
    'RedSuperGiant': 1600, 'BlueSuperGiant': 1500
  },

  planetSizes: {
    'terran': 800, 'rocky': 600, 'desert': 700,
    'ice': 650, 'frozen': 600, 'tundra': 650,
    'lava': 650, 'volcanic': 700, 'ocean': 850,
    'carbon': 600, 'crystal': 600, 'metal': 550,
    'eyeball': 650, 'tidally_locked': 650,
    'radioactive': 600, 'super_earth': 1100,
    'jungle': 850, 'gas_giant': 1400
  },

  moonSizes: { min: 250, max: 400 },
  asteroidSizes: { min: 180, max: 350 },

  // More frames for smoother animation
  starFrames: 8,      // Boiling, chaotic animation (matches SpriteManager)
  planetFrames: 24,   // Full rotation
  moonFrames: 16,
  asteroidFrames: 8,

  // Smaller pixels = more detail
  starPixelSize: 2,    // Very fine detail
  planetPixelSize: 2,  // Very fine detail
  moonPixelSize: 2,
  asteroidPixelSize: 2
};

// ============================================================================
// 3D PERLIN NOISE
// ============================================================================
class Noise3D {
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

  noise(x, y, z) {
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

  fbm(x, y, z, octaves = 8, persistence = 0.5) {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return (value / maxValue) * 0.5 + 0.5;
  }

  turbulence(x, y, z, octaves = 8) {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += Math.abs(this.noise(x * frequency, y * frequency, z * frequency)) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value / maxValue;
  }

  ridged(x, y, z, octaves = 8) {
    let value = 0, amplitude = 1, frequency = 1, weight = 1;
    for (let i = 0; i < octaves; i++) {
      let signal = this.noise(x * frequency, y * frequency, z * frequency);
      signal = 1 - Math.abs(signal);
      signal *= signal * weight;
      weight = Math.min(1, Math.max(0, signal * 2));
      value += signal * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return Math.min(1, Math.max(0, value * 0.5));
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
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t)
  };
}

// ============================================================================
// STAR COLORS
// ============================================================================
const STAR_COLORS = {
  'O': { base: '#aaccff', bright: '#ffffff', glow: '#5588ff' },
  'B': { base: '#bbddff', bright: '#ffffff', glow: '#6699ff' },
  'A': { base: '#ddeeff', bright: '#ffffff', glow: '#aabbee' },
  'F': { base: '#fffff8', bright: '#ffffff', glow: '#eeeeee' },
  'G': { base: '#fff4ea', bright: '#ffffaa', glow: '#ffeecc' },
  'K': { base: '#ffcc88', bright: '#ffee66', glow: '#ffaa66' },
  'M': { base: '#ff9966', bright: '#ffcc44', glow: '#ff7744' },
  'BrownDwarf': { base: '#8b4513', bright: '#cd853f', glow: '#6a3a1a' },
  'WhiteDwarf': { base: '#f0f0ff', bright: '#ffffff', glow: '#d0d0ff' },
  'NeutronStar': { base: '#00ffff', bright: '#ffffff', glow: '#00cccc' },
  'Pulsar': { base: '#ff00ff', bright: '#ffffff', glow: '#cc00cc' },
  'RedGiant': { base: '#ff6347', bright: '#ffaa77', glow: '#ff4420' },
  'BlueGiant': { base: '#5080f0', bright: '#c0d0ff', glow: '#3050c0' },
  'RedSuperGiant': { base: '#ff2000', bright: '#ff8060', glow: '#aa0000' },
  'BlueSuperGiant': { base: '#0066ff', bright: '#88ccff', glow: '#0030cc' }
};

// ============================================================================
// PLANET COLORS - Expanded palettes
// ============================================================================
const PLANET_COLORS = {
  terran: {
    deep_ocean: ['#001428', '#002846', '#003d5c'],
    ocean: ['#0066aa', '#0088cc', '#00aaee'],
    shallow: ['#33ccff', '#66ddff'],
    beach: ['#c8b090', '#e8d0b0', '#f8e0d0'],
    grass: ['#2d5016', '#3d7026', '#5d9046', '#7daa66', '#9dcc88'],
    forest: ['#0a3a0a', '#1a4a1a', '#2a6a2a', '#4a8a4a'],
    mountain: ['#4b3b2b', '#6b5b4b', '#8b7b6b', '#ab9b8b'],
    snow: ['#d8e8f8', '#f0f8ff', '#ffffff'],
    cloud: ['#ffffff', '#f8fcff'],
    cities: ['#ffdd88', '#ffee99'] // Light pollution at night
  },

  rocky: {
    dark: ['#1a1512', '#2a251f', '#3a352c'],
    surface: ['#3a2d22', '#4a3d32', '#6a5d52', '#8a7d72'],
    crater: ['#0a0502', '#1a1512'],
    highland: ['#aa9d92', '#cabaa0', '#eadac0'],
    dust: ['#b89060', '#c8a070']
  },

  desert: {
    sand_dark: ['#b89060', '#c8a070'],
    sand: ['#d2b48c', '#e6c8a0', '#fadcb4'],
    dune_shadow: ['#a07850', '#b08860'],
    rock: ['#6a5a4a', '#7a6a5a', '#8a7a6a', '#aa9a8a'],
    canyon_deep: ['#503020', '#604030'],
    canyon: ['#705040', '#907060']
  },

  ice: {
    deep: ['#2060a0', '#3070a0', '#4080b0'],
    surface: ['#70b0d0', '#80c8e0', '#a0e0f0', '#c0f0ff'],
    crevasse: ['#081018', '#102030', '#203040'],
    snow: ['#d0e8ff', '#e0f0ff', '#f0f8ff', '#ffffff']
  },

  lava: {
    molten_bright: ['#ffff00', '#ffee00'],
    molten_hot: ['#ffaa00', '#ff8800', '#ff6600'],
    molten: ['#ff4400', '#ff3300'],
    cooling: ['#ff2200', '#cc0000', '#aa0000'],
    crust_warm: ['#3a2a2a', '#4a3a3a', '#5a4a4a'],
    crust: ['#1a1a1a', '#2a2a2a']
  },

  ocean: {
    deep: ['#000814', '#001428', '#002846', '#004878'],
    mid: ['#0066aa', '#0088cc', '#0098dc'],
    surface: ['#20c0ff', '#40d0ff', '#60e0ff'],
    foam: ['#d0f8ff', '#e0fcff', '#ffffff']
  },

  jungle: {
    canopy_dark: ['#0a4a0a', '#1a5a1a'],
    canopy: ['#2a7a2a', '#4a9a4a', '#6aba6a'],
    understory: ['#0a3a0a', '#1a4a1a', '#2a6a2a'],
    flower: ['#ff6688', '#ff88aa', '#ffaacc'],
    river: ['#4a7a7a', '#6a9a9a']
  },

  gas_giant: {
    band1_dark: ['#6b4914', '#7b5914'],
    band1: ['#8b6914', '#9b7934', '#ab8934'],
    band2_light: ['#e2c594', '#f2d5a4', '#fce5b4'],
    band2: ['#c49564', '#d4a574'],
    storm: ['#cc3322', '#ee6644', '#ff8866'],
    cloud: ['#ffffff', '#f8f8ff']
  }
};

// Copy more types from terran as template
const moreTypes = ['frozen', 'tundra', 'volcanic', 'carbon', 'crystal', 'metal',
                   'eyeball', 'tidally_locked', 'radioactive', 'super_earth'];
moreTypes.forEach(type => {
  if (!PLANET_COLORS[type]) {
    PLANET_COLORS[type] = { ...PLANET_COLORS.terran };
  }
});

// ============================================================================
// ULTRA-REALISTIC STAR GENERATOR
// ============================================================================
function generateStar(stellarClass) {
  const size = CONFIG.starSizes[stellarClass];
  const frames = CONFIG.starFrames;
  const pixelSize = CONFIG.starPixelSize;
  const colors = STAR_COLORS[stellarClass] || STAR_COLORS['G'];

  console.log(`  Generating ${stellarClass} star (${size}x${size}px, ${frames} frames, pixel:${pixelSize})...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000));

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.38;

  const baseColor = hexToRgb(colors.base);
  const brightColor = hexToRgb(colors.bright);
  const glowColor = hexToRgb(colors.glow);

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const time = frame / frames;

    const pixelWidth = Math.ceil(size / pixelSize);
    const pixelHeight = Math.ceil(size / pixelSize);

    for (let py = 0; py < pixelHeight; py++) {
      for (let px = 0; px < pixelWidth; px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let r = 0, g = 0, b = 0, a = 0;

        // BRIGHT OUTER GLOW (Corona)
        if (dist > radius && dist < radius * 2.5) {
          const glowDist = (dist - radius) / (radius * 1.5);
          let glowIntensity = Math.pow(1 - Math.min(1, glowDist), 3);

          // Turbulent corona
          const coronaTurb = noise.turbulence(
            dx * 0.015, dy * 0.015, time * 8, 6
          );
          glowIntensity *= (0.7 + coronaTurb * 0.6);

          // BRIGHT glow
          r = glowColor.r + (brightColor.r - glowColor.r) * 0.5;
          g = glowColor.g + (brightColor.g - glowColor.g) * 0.5;
          b = glowColor.b + (brightColor.b - glowColor.b) * 0.5;
          a = glowIntensity * 200;
        }

        // STAR SURFACE - CHAOTIC AND BOILING
        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          const theta = Math.atan2(dy, dx);
          const phi = Math.acos(Math.max(-1, Math.min(1, dy / Math.max(1, dist))));
          const rotatedTheta = theta + time * Math.PI * 2;

          const texU = rotatedTheta / Math.PI;
          const texV = phi / Math.PI;

          // CHAOTIC BOILING SURFACE - Many layers
          const bigCells = noise.fbm(texU * 2, texV * 2, time * 4, 8);
          const medCells = noise.fbm(texU * 6, texV * 6, time * 6, 6);
          const fineCells = noise.fbm(texU * 12, texV * 12, time * 8, 4);
          const turb = noise.turbulence(texU * 8, texV * 8, time * 10, 6);

          // Coronal holes (dark spots)
          const holes = noise.fbm(texU * 3, texV * 3, time * 2, 5);
          const isDarkSpot = holes < 0.25;

          // CMEs and bright flares
          const cme = noise.fbm(texU * 4 + time * 20, texV * 4, time * 15, 4);
          const isCME = cme > 0.8;

          // Combine surface features
          let brightness = 0.4 + bigCells * 0.25 + medCells * 0.2 + fineCells * 0.15;

          // Dark coronal holes
          if (isDarkSpot) {
            brightness *= 0.3;
          }

          // BRIGHT CME flares
          if (isCME) {
            brightness = Math.min(1.5, brightness + (cme - 0.8) * 5);
          }

          // 3D lighting
          const lightDir = { x: 0.3, y: -0.5, z: 0.8 };
          const normal = { x: dx / radius, y: dy / radius, z: z };
          const dotProduct = Math.max(0, normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z);
          const diffuse = 0.6 + dotProduct * 0.4;

          // Limb darkening (but less extreme)
          const limbDarkening = 0.6 + 0.4 * Math.pow(z, 0.3);

          brightness *= diffuse * limbDarkening;

          // BRIGHT core
          const coreBoost = Math.pow(Math.max(0, 1 - normalizedDist * 1.2), 2) * 0.6;

          // Mix colors based on brightness
          const mixFactor = Math.min(1, brightness);
          r = baseColor.r * (1 - mixFactor) + brightColor.r * mixFactor + brightColor.r * coreBoost;
          g = baseColor.g * (1 - mixFactor) + brightColor.g * mixFactor + brightColor.g * coreBoost;
          b = baseColor.b * (1 - mixFactor) + brightColor.b * mixFactor + brightColor.b * coreBoost;

          // Make it BRIGHT
          r = Math.min(255, r * 1.3);
          g = Math.min(255, g * 1.3);
          b = Math.min(255, b * 1.3);
          a = 255;
        }

        // Draw pixel
        if (a > 0) {
          ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${a / 255})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size };
}

// ============================================================================
// ULTRA-DETAILED PLANET GENERATOR
// ============================================================================
function generatePlanet(type, index) {
  const size = CONFIG.planetSizes[type];
  const frames = CONFIG.planetFrames;
  const pixelSize = CONFIG.planetPixelSize;
  const colors = PLANET_COLORS[type] || PLANET_COLORS.terran;

  console.log(`    ${type}_${String(index).padStart(3, '0')} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 10000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.42;

  const hasAtmosphere = ['terran', 'ocean', 'jungle', 'super_earth'].includes(type);
  const isGasGiant = type === 'gas_giant';

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const rotation = (frame / frames) * Math.PI * 2;

    const pixelWidth = Math.ceil(size / pixelSize);
    const pixelHeight = Math.ceil(size / pixelSize);

    for (let py = 0; py < pixelHeight; py++) {
      for (let px = 0; px < pixelWidth; px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let r = 0, g = 0, b = 0, a = 0;

        // Atmosphere glow
        if (hasAtmosphere && dist > radius && dist < radius * 1.15) {
          const atmosDist = (dist - radius) / (radius * 0.15);
          const atmosIntensity = Math.pow(1 - atmosDist, 2);
          r = 100 * atmosIntensity;
          g = 150 * atmosIntensity;
          b = 255 * atmosIntensity;
          a = atmosIntensity * 150;
        }

        // Planet surface
        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          const theta = Math.atan2(dx, z);
          const phi = Math.asin(Math.max(-1, Math.min(1, dy / Math.max(1, dist))));
          const rotatedTheta = theta + rotation;

          const texU = rotatedTheta / Math.PI;
          const texV = phi / Math.PI;

          // ULTRA-DETAILED TERRAIN
          const largeScale = noise.fbm(texU * 2, texV * 2, 0, 8);
          const mediumScale = noise.fbm(texU * 6, texV * 6, 0, 8);
          const smallScale = noise.fbm(texU * 16, texV * 16, 0, 6);
          const microDetail = noise.fbm(texU * 32, texV * 32, 0, 4);

          const elevation = largeScale * 0.5 + mediumScale * 0.25 + smallScale * 0.15 + microDetail * 0.1;
          const moisture = noise.fbm(texU * 3, texV * 3, 100, 8);
          const temperature = (1 - Math.abs(phi) * 0.7) * (1 - elevation * 0.2);

          // Get surface color
          const surfaceColor = getPlanetSurfaceColor(type, elevation, moisture, temperature, colors, isGasGiant, texU, texV, phi, noise);
          r = surfaceColor.r;
          g = surfaceColor.g;
          b = surfaceColor.b;

          // Add clouds for atmosphere planets
          if (hasAtmosphere && colors.cloud) {
            const cloudNoise = noise.fbm(texU * 5 + rotation * 0.2, texV * 5, 200, 6);
            if (cloudNoise > 0.6) {
              const cloudDensity = (cloudNoise - 0.6) * 2.5;
              const cloudColor = hexToRgb(colors.cloud[0]);
              r = r * (1 - cloudDensity * 0.9) + cloudColor.r * cloudDensity;
              g = g * (1 - cloudDensity * 0.9) + cloudColor.g * cloudDensity;
              b = b * (1 - cloudDensity * 0.9) + cloudColor.b * cloudDensity;
            }
          }

          // 3D lighting with day/night
          const lightDir = { x: 1, y: 0, z: 0.3 };
          const normal = { x: dx / radius, y: dy / radius, z: z };
          const dotProduct = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
          const lightIntensity = Math.max(0, dotProduct);

          // Softer terminator
          const dayIntensity = 0.15 + lightIntensity * 0.85;
          const limbDarkening = 0.5 + 0.5 * Math.pow(z, 0.3);

          r *= dayIntensity * limbDarkening;
          g *= dayIntensity * limbDarkening;
          b *= dayIntensity * limbDarkening;
          a = 255;
        }

        // Draw pixel
        if (a > 0) {
          ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${a / 255})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size };
}

// ============================================================================
// GET PLANET SURFACE COLOR
// ============================================================================
function getPlanetSurfaceColor(type, elevation, moisture, temperature, colors, isGasGiant, texU, texV, latitude, noise) {
  if (isGasGiant) {
    // Gas giant bands
    const bandNoise = noise.fbm(texU * 1, texV * 8, 0, 6);
    const bandPattern = Math.sin(latitude * 15 + bandNoise * 4);
    const turbulence = noise.turbulence(texU * 4, texV * 2, 0, 6) * 0.3;

    const bandValue = (bandPattern + 1) * 0.5 + turbulence;

    let colorKey;
    if (bandValue < 0.25) colorKey = 'band1_dark';
    else if (bandValue < 0.5) colorKey = 'band1';
    else if (bandValue < 0.75) colorKey = 'band2';
    else colorKey = 'band2_light';

    const bandColors = colors[colorKey] || colors.band1 || ['#aa8844'];
    const colorIndex = Math.floor((bandValue * bandColors.length)) % bandColors.length;

    // Storm features
    const stormNoise = noise.fbm(texU * 3, texV * 3, 50, 5);
    if (stormNoise > 0.75 && Math.abs(latitude) < 0.5) {
      const stormColors = colors.storm || ['#cc4422'];
      return hexToRgb(stormColors[0]);
    }

    return hexToRgb(bandColors[colorIndex]);
  }

  // Terrestrial planets
  switch (type) {
    case 'terran':
      if (elevation < 0.35) {
        const depth = 0.35 - elevation;
        if (depth > 0.15) return hexToRgb(colors.deep_ocean[0]);
        if (depth > 0.08) return hexToRgb(colors.ocean[0]);
        return hexToRgb(colors.shallow[0]);
      }
      if (elevation < 0.37) return hexToRgb(colors.beach[0]);
      if (elevation > 0.8) return hexToRgb(elevation > 0.88 ? colors.snow[0] : colors.mountain[0]);
      if (moisture > 0.6) {
        return hexToRgb(colors.forest[Math.floor(moisture * colors.forest.length) % colors.forest.length]);
      }
      return hexToRgb(colors.grass[Math.floor(elevation * colors.grass.length) % colors.grass.length]);

    case 'desert':
      if (elevation < 0.3) return hexToRgb(colors.canyon_deep ? colors.canyon_deep[0] : colors.sand_dark[0]);
      if (elevation > 0.75) return hexToRgb(colors.rock[0]);
      const duneNoise = Math.sin(texU * 30 + texV * 20) > 0;
      return hexToRgb(duneNoise ? colors.sand[0] : colors.sand_dark[0]);

    case 'ice':
      if (elevation < 0.25) return hexToRgb(colors.crevasse[0]);
      if (elevation > 0.8) return hexToRgb(colors.snow[0]);
      return hexToRgb(colors.surface[Math.floor(elevation * colors.surface.length) % colors.surface.length]);

    case 'lava':
      if (elevation < 0.38) {
        const heat = 1 - elevation / 0.38;
        if (heat > 0.85) return hexToRgb(colors.molten_bright ? colors.molten_bright[0] : colors.molten_hot[0]);
        if (heat > 0.6) return hexToRgb(colors.molten_hot[0]);
        if (heat > 0.4) return hexToRgb(colors.molten[0]);
        return hexToRgb(colors.cooling[0]);
      }
      return hexToRgb(elevation > 0.6 ? colors.crust_warm[0] : colors.crust[0]);

    case 'ocean':
      const depth = 1 - elevation;
      if (depth > 0.7) return hexToRgb(colors.deep[0]);
      if (depth > 0.4) return hexToRgb(colors.mid[0]);
      if (depth > 0.15) return hexToRgb(colors.surface[0]);
      return hexToRgb(colors.foam[0]);

    case 'jungle':
      if (elevation < 0.3) return hexToRgb(colors.river[0]);
      if (moisture > 0.6) {
        return hexToRgb(colors.canopy[Math.floor(elevation * colors.canopy.length) % colors.canopy.length]);
      }
      return hexToRgb(colors.understory ? colors.understory[0] : colors.canopy_dark[0]);

    default:
      // Generic rocky
      const rockColors = colors.surface || colors.grass || ['#888888'];
      return hexToRgb(rockColors[Math.floor(elevation * rockColors.length) % rockColors.length]);
  }
}

// ============================================================================
// MOON GENERATOR
// ============================================================================
function generateMoon(index) {
  const size = CONFIG.moonSizes.min + Math.floor(Math.random() * (CONFIG.moonSizes.max - CONFIG.moonSizes.min));
  const frames = CONFIG.moonFrames;
  const pixelSize = CONFIG.moonPixelSize;

  console.log(`    moon_${String(index).padStart(3, '0')} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 20000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.45;

  // Moon colors (rocky/icy)
  const isIcy = Math.random() > 0.5;
  const baseColors = isIcy
    ? ['#a0c0e0', '#b0d0f0', '#c0e0ff', '#d0f0ff']
    : ['#4a3d32', '#6a5d52', '#8a7d72', '#aa9d92'];

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const rotation = (frame / frames) * Math.PI * 2;

    const pixelWidth = Math.ceil(size / pixelSize);
    const pixelHeight = Math.ceil(size / pixelSize);

    for (let py = 0; py < pixelHeight; py++) {
      for (let px = 0; px < pixelWidth; px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          const theta = Math.atan2(dx, z) + rotation;
          const phi = Math.asin(Math.max(-1, Math.min(1, dy / Math.max(1, dist))));

          const texU = theta / Math.PI;
          const texV = phi / Math.PI;

          // Detailed cratered surface
          const elevation = noise.fbm(texU * 4, texV * 4, 0, 8);
          const craters = noise.ridged(texU * 8, texV * 8, 0, 6);
          const detail = noise.fbm(texU * 16, texV * 16, 0, 4);

          const combined = elevation * 0.6 + craters * 0.3 + detail * 0.1;
          const colorIndex = Math.floor(combined * baseColors.length) % baseColors.length;
          const baseColor = hexToRgb(baseColors[colorIndex]);

          // Lighting
          const lightDir = { x: 1, y: 0, z: 0.5 };
          const normal = { x: dx / radius, y: dy / radius, z: z };
          const dotProduct = Math.max(0, normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z);
          const lightIntensity = 0.3 + dotProduct * 0.7;
          const limbDarkening = 0.4 + 0.6 * Math.pow(z, 0.4);

          const finalIntensity = lightIntensity * limbDarkening;

          const r = baseColor.r * finalIntensity;
          const g = baseColor.g * finalIntensity;
          const b = baseColor.b * finalIntensity;

          ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size };
}

// ============================================================================
// ASTEROID GENERATOR
// ============================================================================
function generateAsteroid(index) {
  const baseSize = CONFIG.asteroidSizes.min + Math.floor(Math.random() * (CONFIG.asteroidSizes.max - CONFIG.asteroidSizes.min));
  const frames = CONFIG.asteroidFrames;
  const pixelSize = CONFIG.asteroidPixelSize;

  console.log(`    asteroid_${String(index).padStart(3, '0')} (${baseSize}x${baseSize}px, ${frames} frames)...`);

  const canvas = createCanvas(baseSize * frames, baseSize);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 30000);

  const centerX = baseSize / 2;
  const centerY = baseSize / 2;

  // Irregular shape
  const irregularity = 0.3 + Math.random() * 0.3;

  const colors = ['#3a2d22', '#4a3d32', '#5a4d42', '#6a5d52'];

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * baseSize;
    const rotation = (frame / frames) * Math.PI * 2;

    const pixelWidth = Math.ceil(baseSize / pixelSize);
    const pixelHeight = Math.ceil(baseSize / pixelSize);

    for (let py = 0; py < pixelHeight; py++) {
      for (let px = 0; px < pixelWidth; px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) + rotation;

        // Irregular radius
        const shapeNoise = noise.fbm(Math.cos(angle) * 3, Math.sin(angle) * 3, 0, 5);
        const radius = (baseSize * 0.4) * (1 + (shapeNoise - 0.5) * irregularity);

        if (dist <= radius) {
          const normalizedDist = dist / radius;

          // Rough surface
          const surface = noise.fbm(dx * 0.1, dy * 0.1, rotation, 6);
          const craters = noise.ridged(dx * 0.2, dy * 0.2, 0, 4);

          const combined = surface * 0.7 + craters * 0.3;
          const colorIndex = Math.floor(combined * colors.length) % colors.length;
          const baseColor = hexToRgb(colors[colorIndex]);

          // Simple lighting
          const lightAngle = Math.atan2(dy, dx) - Math.PI * 0.25;
          const lightIntensity = 0.4 + Math.cos(lightAngle) * 0.6;

          const r = baseColor.r * lightIntensity;
          const g = baseColor.g * lightIntensity;
          const b = baseColor.b * lightIntensity;

          ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size: baseSize };
}

// ============================================================================
// MAIN GENERATION FUNCTIONS
// ============================================================================
async function generateAllStars() {
  console.log('\n=== Generating Ultra-Realistic Stars ===');
  const starsDir = path.join(OUTPUT_DIR, 'stars');
  if (!fs.existsSync(starsDir)) fs.mkdirSync(starsDir, { recursive: true });

  for (const stellarClass of CONFIG.stellarClasses) {
    const { canvas } = generateStar(stellarClass);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(starsDir, `star_${stellarClass}.png`), buffer);
    console.log(`  ✓ Saved: star_${stellarClass}.png`);
  }

  console.log(`✓ Generated ${CONFIG.stellarClasses.length} stars`);
}

async function generateAllPlanets() {
  console.log('\n=== Generating Ultra-Detailed Planets ===');
  const planetsDir = path.join(OUTPUT_DIR, 'planets');
  if (!fs.existsSync(planetsDir)) fs.mkdirSync(planetsDir, { recursive: true });

  let count = 0;
  for (const type of CONFIG.planetTypes) {
    console.log(`  ${type}:`);
    for (let i = 0; i < CONFIG.spritesPerPlanetType; i++) {
      const { canvas } = generatePlanet(type, i);
      const buffer = canvas.toBuffer('image/png');
      const filename = `planet_${type}_${String(i).padStart(3, '0')}.png`;
      fs.writeFileSync(path.join(planetsDir, filename), buffer);
      count++;
    }
    console.log(`  ✓ Generated ${CONFIG.spritesPerPlanetType} ${type} planets`);
  }

  console.log(`✓ Generated ${count} planet sprites`);
}

async function generateAllMoons() {
  console.log('\n=== Generating Moons ===');
  const moonsDir = path.join(OUTPUT_DIR, 'moons');
  if (!fs.existsSync(moonsDir)) fs.mkdirSync(moonsDir, { recursive: true });

  for (let i = 0; i < CONFIG.spritesPerMoon; i++) {
    const { canvas } = generateMoon(i);
    const buffer = canvas.toBuffer('image/png');
    const filename = `moon_${String(i).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(moonsDir, filename), buffer);
  }

  console.log(`✓ Generated ${CONFIG.spritesPerMoon} moons`);
}

async function generateAllAsteroids() {
  console.log('\n=== Generating Asteroids ===');
  const asteroidsDir = path.join(OUTPUT_DIR, 'asteroids');
  if (!fs.existsSync(asteroidsDir)) fs.mkdirSync(asteroidsDir, { recursive: true });

  for (let i = 0; i < CONFIG.spritesPerAsteroid; i++) {
    const { canvas } = generateAsteroid(i);
    const buffer = canvas.toBuffer('image/png');
    const filename = `asteroid_${String(i).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(asteroidsDir, filename), buffer);
  }

  console.log(`✓ Generated ${CONFIG.spritesPerAsteroid} asteroids`);
}

// ============================================================================
// CLI EXECUTION
// ============================================================================
const args = process.argv.slice(2);
const shouldGenerateStars = args.includes('--all') || args.includes('--stars');
const shouldGeneratePlanets = args.includes('--all') || args.includes('--planets');
const shouldGenerateMoons = args.includes('--all') || args.includes('--moons');
const shouldGenerateAsteroids = args.includes('--all') || args.includes('--asteroids');

if (!shouldGenerateStars && !shouldGeneratePlanets && !shouldGenerateMoons && !shouldGenerateAsteroids) {
  console.log('Usage: node generateRealisticSprites.mjs [options]');
  console.log('Options:');
  console.log('  --all        Generate all sprites');
  console.log('  --stars      Generate only star sprites');
  console.log('  --planets    Generate only planet sprites');
  console.log('  --moons      Generate only moon sprites');
  console.log('  --asteroids  Generate only asteroid sprites');
  process.exit(1);
}

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   ULTRA-REALISTIC CELESTIAL SPRITE GENERATOR v2.0        ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

(async () => {
  const startTime = Date.now();

  if (shouldGenerateStars) await generateAllStars();
  if (shouldGeneratePlanets) await generateAllPlanets();
  if (shouldGenerateMoons) await generateAllMoons();
  if (shouldGenerateAsteroids) await generateAllAsteroids();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✓ Total generation time: ${elapsed}s`);
  console.log('\nNext: Run `node tools/generateManifest.mjs` to update manifest\n');
})();
