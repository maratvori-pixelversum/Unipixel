#!/usr/bin/env node
/**
 * ULTIMATE REALISTIC CELESTIAL SPRITE GENERATOR v3.0
 *
 * Features:
 * - NO geometric patterns or pizza slices - fully random organic surfaces
 * - Detailed geographical features: oceans, continents, mountains, craters, volcanoes, etc.
 * - Asymmetrical continent shapes for terrestrial planets
 * - Dense crater fields for moons
 * - Varied asteroid shapes and types
 * - Comets with tails
 * - Black holes with accretion disks
 * - Bright glowing stars with CME and corona effects
 * - Thick atmospheres for gas giants
 * - Ultra-fine pixel detail
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
  // Sprite counts
  starCount: 15,
  planetTypeCount: 40,
  gasGiantCount: 20,
  moonCount: 60,
  asteroidCount: 80,
  cometCount: 10,
  blackHoleCount: 1,

  stellarClasses: ['O', 'B', 'A', 'F', 'G', 'K', 'M',
    'BrownDwarf', 'WhiteDwarf', 'NeutronStar', 'Pulsar',
    'RedGiant', 'BlueGiant', 'RedSuperGiant', 'BlueSuperGiant'],

  planetTypes: ['terran', 'rocky', 'desert', 'ice', 'frozen', 'tundra',
    'lava', 'volcanic', 'ocean', 'carbon', 'crystal', 'metal',
    'eyeball', 'tidally_locked', 'radioactive', 'super_earth', 'jungle',
    'toxic', 'barren', 'savanna'],

  // Sizes (diameter in pixels)
  starSizes: {
    'O': 1400, 'B': 1300, 'A': 1100, 'F': 1200, 'G': 1200,
    'K': 900, 'M': 600, 'BrownDwarf': 600, 'WhiteDwarf': 600,
    'NeutronStar': 350, 'Pulsar': 400,
    'RedGiant': 1500, 'BlueGiant': 1500,
    'RedSuperGiant': 1600, 'BlueSuperGiant': 1500
  },

  planetSize: 800,
  gasGiantSize: 1400,
  moonSize: { min: 250, max: 400 },
  asteroidSize: { min: 180, max: 350 },
  cometSize: 300,
  blackHoleSize: 800,

  // Animation frames
  starFrames: 8,
  planetFrames: 24,
  gasGiantFrames: 24,
  moonFrames: 16,
  asteroidFrames: 8,
  cometFrames: 12,
  blackHoleFrames: 16,

  // Retro pixelart sizes - larger for authentic 16-bit look
  starPixelSize: 4,
  planetPixelSize: 4,
  gasGiantPixelSize: 4,
  moonPixelSize: 4,
  asteroidPixelSize: 4,
  cometPixelSize: 4,
  blackHolePixelSize: 4
};

// ============================================================================
// COLOR PALETTES - ENHANCED WITH MORE COLORS AND BRIGHTNESS
// ============================================================================
const STAR_COLORS = {
  'O': {
    base: '#9bb0ff', bright: '#ffffff', glow: '#aabfff',
    core: '#e0f0ff', mid: '#b5c8ff', edge: '#8099ff',
    flare: '#fff5ff', corona: '#c5d5ff', cme: '#7788ee'
  },
  'B': {
    base: '#aabfff', bright: '#ffffff', glow: '#c0d5ff',
    core: '#f0f8ff', mid: '#cce0ff', edge: '#99b5ff',
    flare: '#fffaff', corona: '#d5e5ff', cme: '#8899ff'
  },
  'A': {
    base: '#cad8ff', bright: '#ffffff', glow: '#dce5ff',
    core: '#ffffff', mid: '#e5f0ff', edge: '#b5c8ff',
    flare: '#fffff8', corona: '#e8f0ff', cme: '#aabbff'
  },
  'F': {
    base: '#f8f7ff', bright: '#ffffff', glow: '#fff8e0',
    core: '#fffffa', mid: '#fffef5', edge: '#f5f0e8',
    flare: '#ffffff', corona: '#fffef0', cme: '#ffe8c0'
  },
  'G': {
    base: '#fff4e8', bright: '#fffef0', glow: '#ffe8b0',
    core: '#ffffee', mid: '#fff8d0', edge: '#ffe0a0',
    flare: '#fffffe', corona: '#fff5c0', cme: '#ffd080'
  },
  'K': {
    base: '#ffd2a1', bright: '#ffe8c0', glow: '#ffb060',
    core: '#ffeed0', mid: '#ffd8a0', edge: '#ffb870',
    flare: '#fff0d0', corona: '#ffc080', cme: '#ff9840'
  },
  'M': {
    base: '#ffb060', bright: '#ffc880', glow: '#ff8030',
    core: '#ffd0a0', mid: '#ffa850', edge: '#ff7020',
    flare: '#ffe0b0', corona: '#ff9050', cme: '#ff5010'
  },
  'BrownDwarf': {
    base: '#b85530', bright: '#d06040', glow: '#904020',
    core: '#c86850', mid: '#a84830', edge: '#783020',
    flare: '#e07050', corona: '#985030', cme: '#682010'
  },
  'WhiteDwarf': {
    base: '#f0f8ff', bright: '#ffffff', glow: '#d0e8ff',
    core: '#ffffff', mid: '#f8fcff', edge: '#d8e8ff',
    flare: '#ffffff', corona: '#e0f0ff', cme: '#b8d8ff'
  },
  'NeutronStar': {
    base: '#e0e0ff', bright: '#ffffff', glow: '#c0c0ff',
    core: '#ffffff', mid: '#f0f0ff', edge: '#b8b8ff',
    flare: '#ffffff', corona: '#d0d0ff', cme: '#9898ff'
  },
  'Pulsar': {
    base: '#00ffff', bright: '#ffffff', glow: '#00cccc',
    core: '#e0ffff', mid: '#80ffff', edge: '#00dddd',
    flare: '#ffffff', corona: '#40ffff', cme: '#00aaaa'
  },
  'RedGiant': {
    base: '#ff6347', bright: '#ff9977', glow: '#ff4020',
    core: '#ffaa88', mid: '#ff7755', edge: '#ff3010',
    flare: '#ffc0a0', corona: '#ff5030', cme: '#ee2000'
  },
  'BlueGiant': {
    base: '#4169e1', bright: '#88aaff', glow: '#2040c0',
    core: '#aaccff', mid: '#6688ff', edge: '#2050dd',
    flare: '#d0e0ff', corona: '#4060ff', cme: '#0030bb'
  },
  'RedSuperGiant': {
    base: '#ff4500', bright: '#ff7744', glow: '#dd2000',
    core: '#ff9966', mid: '#ff5522', edge: '#cc1000',
    flare: '#ffbb88', corona: '#ff3311', cme: '#aa0000'
  },
  'BlueSuperGiant': {
    base: '#1e90ff', bright: '#66aaff', glow: '#0060dd',
    core: '#99ccff', mid: '#4488ff', edge: '#0050cc',
    flare: '#ccddff', corona: '#2070ff', cme: '#0040aa'
  }
};

// ENHANCED PLANET PALETTES - More vibrant and varied colors
const PLANET_PALETTES = {
  // Terrestrial colors with continents - enhanced brightness
  land: ['#a08560', '#b89578', '#755a2d', '#9d7b20', '#826445', '#8a6a50'],
  ocean: ['#2a4a7f', '#3d6a9b', '#2a5d8e', '#265283', '#1f4874'],
  ice: ['#f0ffff', '#d8f6ff', '#c0e8fc', '#a8d8f0', '#98c8e4'],
  desert: ['#eab530', '#d1aa7b', '#e2c49c', '#f6ce9a', '#d8b892', '#c8a46a'],
  vegetation: ['#32ab32', '#3eab67', '#4cc381', '#107410', '#456e4b'],
  mountain: ['#797979', '#809090', '#8898a9', '#909090', '#a0a0a0'],
  lava: ['#ff5510', '#ff7357', '#ff8f60', '#ff1010', '#ec2443'],
  toxic: ['#aadd42', '#bdff3f', '#8fff10', '#42dd42', '#10ff10'],
  crystal: ['#ea80e6', '#fe92fe', '#edb0ed', '#ca65e3', '#a380eb'],
  metal: ['#d0d0d0', '#b9b9b9', '#e3e3e3', '#909090', '#797979'],
  // Additional enhanced palettes
  volcanic: ['#ff3300', '#ff6600', '#ff9933', '#cc3300', '#ff5500'],
  frozen: ['#e8f8ff', '#d0e8f8', '#b8d8f0', '#a0c8e8', '#88b8e0'],
  radioactive: ['#88ff00', '#99ff33', '#aaff55', '#77ee00', '#66dd00'],
  clouds: ['#ffffff', '#f8f8f8', '#f0f0f0', '#e8e8e8', '#e0e0e0']
};

// ============================================================================
// IMPROVED 3D PERLIN NOISE - More organic, less geometric
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

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
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

    return this.lerp(w,
      this.lerp(v,
        this.lerp(u, this.grad(this.perm[AA], x, y, z), this.grad(this.perm[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.perm[AB], x, y - 1, z), this.grad(this.perm[BB], x - 1, y - 1, z))
      ),
      this.lerp(v,
        this.lerp(u, this.grad(this.perm[AA + 1], x, y, z - 1), this.grad(this.perm[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.perm[AB + 1], x, y - 1, z - 1), this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1))
      )
    );
  }

  // Fractal Brownian Motion - creates organic detail
  fbm(x, y, z, octaves) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value / maxValue;
  }

  // Turbulence - creates chaotic patterns
  turbulence(x, y, z, octaves) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;

    for (let i = 0; i < octaves; i++) {
      value += Math.abs(this.noise(x * frequency, y * frequency, z * frequency)) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value;
  }

  // Ridged noise - creates mountain ridges
  ridged(x, y, z, octaves) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;

    for (let i = 0; i < octaves; i++) {
      const n = 1 - Math.abs(this.noise(x * frequency, y * frequency, z * frequency));
      value += n * n * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
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
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t
  };
}

// ============================================================================
// ENHANCED STAR GENERATOR - Ultra-bright, detailed, realistic with CME and corona
// ============================================================================
function generateStar(stellarClass, index) {
  const size = CONFIG.starSizes[stellarClass];
  const frames = CONFIG.starFrames;
  const pixelSize = CONFIG.starPixelSize;
  const colors = STAR_COLORS[stellarClass];

  console.log(`  Generating ${stellarClass} star #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 10000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

  // Convert all colors to RGB
  const baseColor = hexToRgb(colors.base);
  const brightColor = hexToRgb(colors.bright);
  const glowColor = hexToRgb(colors.glow);
  const coreColor = hexToRgb(colors.core);
  const midColor = hexToRgb(colors.mid);
  const edgeColor = hexToRgb(colors.edge);
  const flareColor = hexToRgb(colors.flare);
  const coronaColor = hexToRgb(colors.corona);
  const cmeColor = hexToRgb(colors.cme);

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
        const normalizedDist = dist / radius;
        const angle = Math.atan2(dy, dx);

        let r = 0, g = 0, b = 0, a = 0;

        // EXTENDED CORONA (outermost layer) - Much brighter and more expansive
        if (dist > radius && dist < radius * 3.5) {
          const coronaDist = (dist - radius) / (radius * 2.5);
          let coronaIntensity = Math.pow(1 - Math.min(1, coronaDist), 2.5);

          // Turbulent corona with streamer-like structures
          const coronaNoise = noise.fbm(
            dx * 0.005 + time * 18,
            dy * 0.005 + time * 15,
            time * 25,
            7
          );

          // Add radial streamers
          const streamerNoise = noise.fbm(
            angle * 8 + time * 10,
            dist * 0.01,
            time * 12,
            5
          );

          coronaIntensity *= (0.7 + coronaNoise * 0.5 + streamerNoise * 0.3);
          coronaIntensity = Math.max(0, coronaIntensity);

          r = coronaColor.r * 1.3;
          g = coronaColor.g * 1.3;
          b = coronaColor.b * 1.3;
          a = coronaIntensity * 240;
        }

        // CME (Coronal Mass Ejections) - Bright plasma eruptions
        if (dist > radius * 0.95 && dist < radius * 2.8) {
          const cmeNoise = noise.fbm(
            angle * 5 + time * 30,
            dist * 0.015 + time * 20,
            time * 35,
            6
          );

          // Create eruption effect
          if (cmeNoise > 0.65) {
            const eruptionIntensity = Math.pow((cmeNoise - 0.65) * 2.85, 2);
            const fadeOut = 1 - Math.min(1, (dist - radius) / (radius * 1.8));
            const cmeStrength = eruptionIntensity * fadeOut;

            const cmeR = cmeColor.r * 1.5;
            const cmeG = cmeColor.g * 1.5;
            const cmeB = cmeColor.b * 1.5;

            r = Math.max(r, cmeR * cmeStrength);
            g = Math.max(g, cmeG * cmeStrength);
            b = Math.max(b, cmeB * cmeStrength);
            a = Math.max(a, cmeStrength * 255);
          }
        }

        // STAR SURFACE - Complex, detailed granulation
        if (dist <= radius) {
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          // 3D world coordinates for proper spherical mapping
          const worldScale = 20;
          const nx = (dx / radius);
          const ny = (dy / radius);
          const nz = z;

          // Rotate around Y axis for animation
          const cosRot = Math.cos(time * Math.PI * 2);
          const sinRot = Math.sin(time * Math.PI * 2);
          const rotX = nx * cosRot - nz * sinRot;
          const rotZ = nx * sinRot + nz * cosRot;

          const worldX = rotX * worldScale;
          const worldY = ny * worldScale;
          const worldZ = rotZ * worldScale;

          // Multi-scale granulation (convection cells at different sizes)
          const largeGranules = noise.fbm(worldX * 0.3, worldY * 0.3, worldZ * 0.3, 4);
          const mediumGranules = noise.fbm(worldX * 0.8, worldY * 0.8, worldZ * 0.8, 5);
          const smallGranules = noise.fbm(worldX * 2.0, worldY * 2.0, worldZ * 2.0, 6);
          const microDetail = noise.fbm(worldX * 5.0, worldY * 5.0, worldZ * 5.0, 4);

          // Combine granulation layers
          const granulation = largeGranules * 0.4 + mediumGranules * 0.3 +
                             smallGranules * 0.2 + microDetail * 0.1;

          // Sunspots / star spots (darker regions) - more visible on cooler stars
          const spotScale = ['M', 'K', 'G', 'BrownDwarf'].includes(stellarClass) ? 1.5 : 0.8;
          const spotNoise = noise.fbm(worldX * 0.6, worldY * 0.6, worldZ * 0.6, 5);
          const hasSpot = spotNoise < -0.4 && normalizedDist < 0.85;
          const spotIntensity = hasSpot ? Math.pow((-0.4 - spotNoise) * 2, 1.5) * spotScale : 0;

          // Solar flares (very bright spots)
          const flareNoise = noise.fbm(worldX * 1.5 + time * 50, worldY * 1.5, worldZ * 1.5, 4);
          const hasFlare = flareNoise > 0.7 && normalizedDist < 0.9;
          const flareIntensity = hasFlare ? Math.pow((flareNoise - 0.7) * 3.33, 2) : 0;

          // Base brightness - much brighter overall
          let baseBrightness = 1.2 - normalizedDist * 0.3; // Increased from 1.0

          // Add granulation variation
          baseBrightness += granulation * 0.25;

          // Apply spot darkening
          baseBrightness *= (1 - spotIntensity * 0.7);

          // Choose color based on radial position with smooth transitions
          let surfaceColor;
          if (normalizedDist < 0.15) {
            // Core - brightest, whitest
            surfaceColor = lerpColor(coreColor, flareColor, normalizedDist / 0.15);
          } else if (normalizedDist < 0.5) {
            // Inner-mid region
            const t = (normalizedDist - 0.15) / 0.35;
            surfaceColor = lerpColor(coreColor, midColor, t);
          } else if (normalizedDist < 0.85) {
            // Mid-outer region
            const t = (normalizedDist - 0.5) / 0.35;
            surfaceColor = lerpColor(midColor, edgeColor, t);
          } else {
            // Edge region
            const t = (normalizedDist - 0.85) / 0.15;
            surfaceColor = lerpColor(edgeColor, baseColor, t);
          }

          r = surfaceColor.r * baseBrightness;
          g = surfaceColor.g * baseBrightness;
          b = surfaceColor.b * baseBrightness;

          // Add solar flares (extremely bright white-hot regions)
          if (hasFlare) {
            r = r * (1 - flareIntensity) + flareColor.r * flareIntensity * 1.5;
            g = g * (1 - flareIntensity) + flareColor.g * flareIntensity * 1.5;
            b = b * (1 - flareIntensity) + flareColor.b * flareIntensity * 1.5;
          }

          // Add chromatic variation for realism
          const chromaNoise = noise.noise(worldX * 3, worldY * 3, worldZ * 3);
          r += chromaNoise * 15;
          g += chromaNoise * 12;
          b += chromaNoise * 10;

          // 3D lighting with limb darkening (edges slightly darker for spherical look)
          const limbDarkening = 0.5 + 0.5 * Math.pow(z, 0.35);
          r *= limbDarkening;
          g *= limbDarkening;
          b *= limbDarkening;

          // Boost overall brightness significantly
          const brightBoost = 1.3; // 30% brighter
          r *= brightBoost;
          g *= brightBoost;
          b *= brightBoost;

          // Clamp values
          r = Math.max(0, Math.min(255, r));
          g = Math.max(0, Math.min(255, g));
          b = Math.max(0, Math.min(255, b));
          a = 255;
        }

        if (a > 0) {
          ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${a / 255})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size, frames };
}

// ============================================================================
// PLANET GENERATOR - Organic continents, oceans, mountains, etc.
// ============================================================================
function generatePlanet(type, index) {
  const size = CONFIG.planetSize;
  const frames = CONFIG.planetFrames;
  const pixelSize = CONFIG.planetPixelSize;

  console.log(`  Generating ${type} planet #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 10000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.42;

  const isTerrestrial = ['terran', 'ocean', 'jungle', 'super_earth', 'savanna'].includes(type);
  const hasAtmosphere = isTerrestrial || type === 'toxic';
  const isLava = type === 'lava' || type === 'volcanic';
  const isIcy = type === 'ice' || type === 'frozen' || type === 'tundra';
  const isDesert = type === 'desert' || type === 'barren';

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
        if (hasAtmosphere && dist > radius && dist < radius * 1.2) {
          const atmosDist = (dist - radius) / (radius * 0.2);
          let atmosIntensity = Math.pow(1 - atmosDist, 2);

          // Random atmosphere turbulence
          const atmosNoise = noise.fbm(dx * 0.01, dy * 0.01, rotation * 5, 4);
          atmosIntensity *= (0.7 + atmosNoise * 0.5);

          if (isTerrestrial) {
            r = 120 * atmosIntensity;
            g = 160 * atmosIntensity;
            b = 255 * atmosIntensity;
          } else if (type === 'toxic') {
            r = 100 * atmosIntensity;
            g = 200 * atmosIntensity;
            b = 50 * atmosIntensity;
          }
          a = atmosIntensity * 180;
        }

        // Planet surface - RANDOM PIXELS like concept art!
        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          // Add rotation offset to pixel coordinates
          const rotatedPx = px + Math.floor(rotation * 50);

          // PURE RANDOM VARIATION per pixel
          const random1 = Math.abs((Math.sin(rotatedPx * 12.9898 + py * 78.233) * 43758.5453) % 1);
          const random2 = Math.abs((Math.sin(rotatedPx * 63.123 + py * 21.456) * 12345.6789) % 1);
          const random3 = Math.abs((Math.sin(rotatedPx * 45.678 + py * 92.345) * 98765.4321) % 1);
          const random4 = Math.abs((Math.sin(rotatedPx * 73.456 + py * 34.567) * 56789.1234) % 1);

          // Elevation based on random values
          const elevation = (random1 + random2 * 0.5 + random3 * 0.3 - 0.9);

          // Get base colors for planet type
          const surfaceColor = getPlanetSurfaceColorSimple(type, elevation, random1, random2, random3, random4);
          r = surfaceColor.r;
          g = surfaceColor.g;
          b = surfaceColor.b;

          // Add clouds for terrestrial planets - random
          if (isTerrestrial && random1 > 0.7) {
            const cloudBrightness = 220 + random2 * 30;
            const cloudDensity = (random1 - 0.7) * 3;
            r = r * (1 - cloudDensity * 0.7) + cloudBrightness * cloudDensity;
            g = g * (1 - cloudDensity * 0.7) + cloudBrightness * cloudDensity;
            b = b * (1 - cloudDensity * 0.7) + (cloudBrightness + 10) * cloudDensity;
          }

          // 3D lighting with day/night
          const lightDir = { x: 1, y: 0, z: 0.3 };
          const normal = { x: dx / radius, y: dy / radius, z: z };
          const dotProduct = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
          const lightIntensity = Math.max(0, dotProduct);

          // Soft terminator
          const dayIntensity = 0.12 + lightIntensity * 0.88;
          const limbDarkening = 0.5 + 0.5 * Math.pow(z, 0.28);

          r *= dayIntensity * limbDarkening;
          g *= dayIntensity * limbDarkening;
          b *= dayIntensity * limbDarkening;

          a = 255;
        }

        if (a > 0) {
          ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${a / 255})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size, frames };
}

// SIMPLE planet color - random pixels!
function getPlanetSurfaceColorSimple(type, elevation, r1, r2, r3, r4) {
  let r, g, b;

  // Base colors with random variation
  switch (type) {
    case 'terran':
    case 'super_earth':
      if (elevation < -0.3) {
        // Ocean - blue
        r = 20 + r1 * 80;
        g = 50 + r2 * 100;
        b = 120 + r3 * 100;
      } else if (elevation < 0.1) {
        // Land - green/brown
        r = 60 + r1 * 80;
        g = 100 + r2 * 80;
        b = 40 + r3 * 50;
      } else {
        // Mountains - grey
        r = 80 + r1 * 60;
        g = 75 + r2 * 60;
        b = 70 + r3 * 60;
      }
      break;

    default:
      // Use palette colors with random variation
      const paletteMap = {
        'ocean': PLANET_PALETTES.ocean,
        'desert': PLANET_PALETTES.desert,
        'ice': PLANET_PALETTES.ice,
        'lava': PLANET_PALETTES.lava,
        'toxic': PLANET_PALETTES.toxic,
        'metal': PLANET_PALETTES.metal
      };

      const palette = paletteMap[type] || PLANET_PALETTES.land;
      const baseColor = hexToRgb(palette[Math.floor(r1 * palette.length)]);

      r = baseColor.r * (0.7 + r2 * 0.6);
      g = baseColor.g * (0.7 + r3 * 0.6);
      b = baseColor.b * (0.7 + r4 * 0.6);
  }

  return { r, g, b };
}

// Planet surface color based on terrain type - ULTRA DETAILED with many colors (OLD - NOT USED)
function getPlanetSurfaceColorOLD(type, elevation, moisture, temperature, biome, worldX, worldY, worldZ, noise) {
  const e = (elevation + 1) * 0.5; // Normalize to 0-1
  const m = (moisture + 1) * 0.5;
  const t = (temperature + 1) * 0.5;
  const bio = (biome + 1) * 0.5;

  let r, g, b;

  switch (type) {
    case 'terran':
    case 'super_earth':
      // ULTRA-DETAILED terrain with many colors
      if (e < 0.35) {
        // Very deep ocean - dark blue with variation
        const depthVariation = noise.fbm(worldX * 15, worldY * 15, worldZ * 15, 3) * 0.3;
        r = 10 + e * 50 + depthVariation * 30;
        g = 25 + e * 80 + depthVariation * 40;
        b = 60 + e * 120 + depthVariation * 50;
      } else if (e < 0.42) {
        // Ocean - varying shades of blue/green
        const waterVariation = noise.fbm(worldX * 20, worldY * 20, worldZ * 20, 3) * 0.2;
        r = 30 + e * 70 + waterVariation * 40;
        g = 70 + e * 100 + waterVariation * 50;
        b = 130 + e * 80 + waterVariation * 60;
      } else if (e < 0.46) {
        // Shallow water / coast - turquoise
        const coastVariation = noise.fbm(worldX * 25, worldY * 25, worldZ * 25, 3) * 0.15;
        r = 50 + e * 130 + coastVariation * 50;
        g = 140 + e * 80 + coastVariation * 40;
        b = 170 + e * 60 + coastVariation * 30;
      } else if (e < 0.49) {
        // Beach / sand
        const sandVariation = noise.fbm(worldX * 30, worldY * 30, worldZ * 30, 3) * 0.2;
        r = 180 + sandVariation * 50;
        g = 160 + sandVariation * 40;
        b = 100 + sandVariation * 30;
      } else if (e > 0.80) {
        // Snow-capped mountains
        const snowVariation = noise.fbm(worldX * 20, worldY * 20, worldZ * 20, 3) * 0.1;
        r = 220 + snowVariation * 35;
        g = 225 + snowVariation * 30;
        b = 235 + snowVariation * 20;
      } else if (e > 0.72) {
        // High mountains - rocky grey/brown
        const rockVariation = noise.fbm(worldX * 18, worldY * 18, worldZ * 18, 3) * 0.25;
        r = 90 + rockVariation * 60;
        g = 85 + rockVariation * 55;
        b = 75 + rockVariation * 50;
      } else if (e > 0.65) {
        // Mountains / hills
        const hillVariation = noise.fbm(worldX * 22, worldY * 22, worldZ * 22, 3) * 0.2;
        r = 100 + hillVariation * 50 + t * 20;
        g = 110 + hillVariation * 45 + t * 15;
        b = 80 + hillVariation * 40 + t * 10;
      } else if (m > 0.65 && t > 0.55) {
        // Dense forests - dark green with variation
        const forestVariation = noise.fbm(worldX * 28, worldY * 28, worldZ * 28, 3) * 0.3;
        r = 20 + forestVariation * 50 + bio * 40;
        g = 80 + forestVariation * 70 + bio * 50;
        b = 30 + forestVariation * 40 + bio * 30;
      } else if (m > 0.50 && t > 0.45) {
        // Light forests / mixed vegetation
        const mixedVegVariation = noise.fbm(worldX * 25, worldY * 25, worldZ * 25, 3) * 0.25;
        r = 60 + mixedVegVariation * 60 + bio * 30;
        g = 120 + mixedVegVariation * 70 + bio * 40;
        b = 50 + mixedVegVariation * 50 + bio * 25;
      } else if (m > 0.35) {
        // Grasslands / plains - yellow-green
        const grassVariation = noise.fbm(worldX * 24, worldY * 24, worldZ * 24, 3) * 0.25;
        r = 100 + grassVariation * 70 + t * 30;
        g = 130 + grassVariation * 60 + t * 25;
        b = 60 + grassVariation * 50 + t * 20;
      } else if (m < 0.25 && t > 0.6) {
        // Hot desert - yellow/orange sand
        const desertVariation = noise.fbm(worldX * 20, worldY * 20, worldZ * 20, 3) * 0.3;
        r = 200 + desertVariation * 45;
        g = 170 + desertVariation * 50;
        b = 90 + desertVariation * 60;
      } else if (m < 0.30) {
        // Dry badlands / rocky desert
        const badlandVariation = noise.fbm(worldX * 22, worldY * 22, worldZ * 22, 3) * 0.25;
        r = 150 + badlandVariation * 60;
        g = 120 + badlandVariation * 50;
        b = 80 + badlandVariation * 40;
      } else {
        // Scrubland / mixed terrain
        const scrubVariation = noise.fbm(worldX * 26, worldY * 26, worldZ * 26, 3) * 0.2;
        r = 110 + scrubVariation * 50 + bio * 30;
        g = 115 + scrubVariation * 45 + bio * 25;
        b = 70 + scrubVariation * 40 + bio * 20;
      }
      break;

    case 'ocean':
      // Mostly water
      if (e < 0.65) {
        const c = PLANET_PALETTES.ocean[Math.floor(Math.random() * PLANET_PALETTES.ocean.length)];
        const rgb = hexToRgb(c);
        r = rgb.r * (0.5 + e * 0.8);
        g = rgb.g * (0.5 + e * 0.8);
        b = rgb.b * (0.5 + e * 0.8);
      } else {
        // Small islands
        const c = PLANET_PALETTES.land[Math.floor(Math.random() * PLANET_PALETTES.land.length)];
        const rgb = hexToRgb(c);
        r = rgb.r;
        g = rgb.g;
        b = rgb.b;
      }
      break;

    case 'jungle':
      // Dense vegetation
      const c = PLANET_PALETTES.vegetation[Math.floor(Math.random() * PLANET_PALETTES.vegetation.length)];
      const rgb = hexToRgb(c);
      const variation = 0.7 + e * 0.5;
      r = rgb.r * variation;
      g = rgb.g * variation;
      b = rgb.b * variation;
      break;

    case 'desert':
    case 'barren':
      const dc = PLANET_PALETTES.desert[Math.floor(Math.random() * PLANET_PALETTES.desert.length)];
      const drgb = hexToRgb(dc);
      r = drgb.r * (0.7 + e * 0.5);
      g = drgb.g * (0.7 + e * 0.5);
      b = drgb.b * (0.7 + e * 0.5);
      break;

    case 'ice':
    case 'frozen':
    case 'tundra':
      const ic = PLANET_PALETTES.ice[Math.floor(Math.random() * PLANET_PALETTES.ice.length)];
      const irgb = hexToRgb(ic);
      r = irgb.r * (0.8 + e * 0.3);
      g = irgb.g * (0.8 + e * 0.3);
      b = irgb.b * (0.8 + e * 0.3);
      break;

    case 'lava':
    case 'volcanic':
      if (e > 0.6) {
        // Lava flows
        const lc = PLANET_PALETTES.lava[Math.floor(Math.random() * PLANET_PALETTES.lava.length)];
        const lrgb = hexToRgb(lc);
        const glow = 1 + e * 0.5;
        r = Math.min(255, lrgb.r * glow);
        g = Math.min(255, lrgb.g * glow);
        b = Math.min(255, lrgb.b * glow);
      } else {
        // Cooled rock
        r = 40 + e * 50;
        g = 30 + e * 40;
        b = 25 + e * 35;
      }
      break;

    case 'toxic':
      const tc = PLANET_PALETTES.toxic[Math.floor(Math.random() * PLANET_PALETTES.toxic.length)];
      const trgb = hexToRgb(tc);
      r = trgb.r * (0.6 + e * 0.6);
      g = trgb.g * (0.6 + e * 0.6);
      b = trgb.b * (0.6 + e * 0.6);
      break;

    case 'crystal':
      const cc = PLANET_PALETTES.crystal[Math.floor(Math.random() * PLANET_PALETTES.crystal.length)];
      const crgb = hexToRgb(cc);
      r = crgb.r * (0.8 + e * 0.4);
      g = crgb.g * (0.8 + e * 0.4);
      b = crgb.b * (0.8 + e * 0.4);
      break;

    case 'metal':
      const mc = PLANET_PALETTES.metal[Math.floor(Math.random() * PLANET_PALETTES.metal.length)];
      const mrgb = hexToRgb(mc);
      r = mrgb.r * (0.7 + e * 0.5);
      g = mrgb.g * (0.7 + e * 0.5);
      b = mrgb.b * (0.7 + e * 0.5);
      break;

    default:
      // Rocky
      r = 100 + e * 100;
      g = 90 + e * 90;
      b = 80 + e * 80;
  }

  return { r, g, b };
}

// ============================================================================
// GAS GIANT GENERATOR - Thick atmosphere with bands
// ============================================================================
function generateGasGiant(index) {
  const size = CONFIG.gasGiantSize;
  const frames = CONFIG.gasGiantFrames;
  const pixelSize = CONFIG.gasGiantPixelSize;

  console.log(`  Generating gas giant #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 10000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.42;

  // Random color scheme for gas giant
  const hue = Math.random() * 360;
  const saturation = 40 + Math.random() * 30;

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

        // Thick atmosphere glow
        if (dist > radius && dist < radius * 1.25) {
          const atmosDist = (dist - radius) / (radius * 0.25);
          let atmosIntensity = Math.pow(1 - atmosDist, 2);

          const atmosNoise = noise.fbm(dx * 0.008, dy * 0.008, rotation * 5, 4);
          atmosIntensity *= (0.7 + atmosNoise * 0.5);

          // Convert HSL to RGB for atmosphere
          const lightness = 60 * atmosIntensity;
          const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
          const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
          const m = lightness / 100 - c / 2;

          let r1, g1, b1;
          if (hue < 60) { r1 = c; g1 = x; b1 = 0; }
          else if (hue < 120) { r1 = x; g1 = c; b1 = 0; }
          else if (hue < 180) { r1 = 0; g1 = c; b1 = x; }
          else if (hue < 240) { r1 = 0; g1 = x; b1 = c; }
          else if (hue < 300) { r1 = x; g1 = 0; b1 = c; }
          else { r1 = c; g1 = 0; b1 = x; }

          r = (r1 + m) * 255;
          g = (g1 + m) * 255;
          b = (b1 + m) * 255;
          a = atmosIntensity * 200;
        }

        // Gas giant surface - horizontal bands
        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          // Use Y coordinate for banding but add turbulence
          const bandCoord = dy / radius * 15 + rotation * 8;
          const turbulence = noise.fbm(dx / radius * 6, dy / radius * 6, rotation * 4, 6) * 2;
          const bandValue = Math.sin(bandCoord + turbulence) * 0.5 + 0.5;

          // Multiple band colors
          const lightness = 35 + bandValue * 35;
          const localSaturation = saturation + (noise.fbm(dx * 0.01, dy * 0.01, rotation, 4) * 20);

          const c = (1 - Math.abs(2 * lightness / 100 - 1)) * localSaturation / 100;
          const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
          const m = lightness / 100 - c / 2;

          let r1, g1, b1;
          if (hue < 60) { r1 = c; g1 = x; b1 = 0; }
          else if (hue < 120) { r1 = x; g1 = c; b1 = 0; }
          else if (hue < 180) { r1 = 0; g1 = c; b1 = x; }
          else if (hue < 240) { r1 = 0; g1 = x; b1 = c; }
          else if (hue < 300) { r1 = x; g1 = 0; b1 = c; }
          else { r1 = c; g1 = 0; b1 = x; }

          r = (r1 + m) * 255;
          g = (g1 + m) * 255;
          b = (b1 + m) * 255;

          // Add storm spots
          const stormNoise = noise.fbm(dx / radius * 4, dy / radius * 4, rotation * 2, 6);
          if (stormNoise > 0.7) {
            const stormIntensity = (stormNoise - 0.7) * 3;
            r *= (1 + stormIntensity * 0.4);
            g *= (1 + stormIntensity * 0.3);
            b *= (1 + stormIntensity * 0.2);
          }

          // 3D lighting
          const lightDir = { x: 1, y: 0, z: 0.3 };
          const normal = { x: dx / radius, y: dy / radius, z: z };
          const dotProduct = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
          const lightIntensity = Math.max(0, dotProduct);

          const dayIntensity = 0.2 + lightIntensity * 0.8;
          const limbDarkening = 0.6 + 0.4 * Math.pow(z, 0.25);

          r *= dayIntensity * limbDarkening;
          g *= dayIntensity * limbDarkening;
          b *= dayIntensity * limbDarkening;

          a = 255;
        }

        if (a > 0) {
          ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${a / 255})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size, frames };
}

// ============================================================================
// MOON GENERATOR - Crater fields
// ============================================================================
function generateMoon(index) {
  const size = CONFIG.moonSize.min + Math.floor(Math.random() * (CONFIG.moonSize.max - CONFIG.moonSize.min));
  const frames = CONFIG.moonFrames;
  const pixelSize = CONFIG.moonPixelSize;

  console.log(`  Generating moon #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 10000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.42;

  const isIcy = Math.random() > 0.6;
  const baseHue = isIcy ? 200 : 30;

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

        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          // DIRECT 3D NOISE - NO PATTERNS!
          let nx = dx / radius;
          let ny = dy / radius;
          let nz = z;

          // Rotate around Y axis
          const cosRot = Math.cos(rotation);
          const sinRot = Math.sin(rotation);
          const rotX = nx * cosRot - nz * sinRot;
          const rotZ = nx * sinRot + nz * cosRot;

          const scale = 15;
          const worldX = rotX * scale;
          const worldY = ny * scale;
          const worldZ = rotZ * scale;

          // Base terrain
          const terrain = noise.fbm(worldX * 0.8, worldY * 0.8, worldZ * 0.8, 6);

          // CRATER FIELD - using ridged noise
          const craters = noise.ridged(worldX * 2, worldY * 2, worldZ * 2, 6);
          const smallCraters = noise.ridged(worldX * 6, worldY * 6, worldZ * 6, 4);

          // Combine terrain
          const elevation = terrain * 0.4 + craters * 0.4 + smallCraters * 0.2;

          // Base color
          const lightness = 35 + (elevation + 1) * 25;
          if (isIcy) {
            r = 180 + elevation * 40;
            g = 200 + elevation * 35;
            b = 220 + elevation * 30;
          } else {
            r = 90 + elevation * 80;
            g = 85 + elevation * 75;
            b = 75 + elevation * 70;
          }

          // 3D lighting
          const lightDir = { x: 1, y: 0, z: 0.3 };
          const normal = { x: dx / radius, y: dy / radius, z: z };
          const dotProduct = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
          const lightIntensity = Math.max(0, dotProduct);

          const dayIntensity = 0.1 + lightIntensity * 0.9;
          const limbDarkening = 0.4 + 0.6 * Math.pow(z, 0.3);

          r *= dayIntensity * limbDarkening;
          g *= dayIntensity * limbDarkening;
          b *= dayIntensity * limbDarkening;

          a = 255;
        }

        if (a > 0) {
          ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${a / 255})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size, frames };
}

// ============================================================================
// ASTEROID GENERATOR - Varied shapes and types
// ============================================================================
function generateAsteroid(index) {
  const size = CONFIG.asteroidSize.min + Math.floor(Math.random() * (CONFIG.asteroidSize.max - CONFIG.asteroidSize.min));
  const frames = CONFIG.asteroidFrames;
  const pixelSize = CONFIG.asteroidPixelSize;

  console.log(`  Generating asteroid #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 10000);

  const centerX = size / 2;
  const centerY = size / 2;
  const baseRadius = size * 0.35;

  // Asteroid type affects color
  const asteroidType = Math.random();
  let colorBase;
  if (asteroidType < 0.3) {
    // Rocky (S-type)
    colorBase = { r: 140, g: 130, b: 110 };
  } else if (asteroidType < 0.6) {
    // Carbonaceous (C-type)
    colorBase = { r: 60, g: 55, b: 50 };
  } else if (asteroidType < 0.8) {
    // Metallic (M-type)
    colorBase = { r: 180, g: 170, b: 160 };
  } else {
    // Icy
    colorBase = { r: 200, g: 210, b: 220 };
  }

  // Irregular shape factor
  const irregularity = 0.25 + Math.random() * 0.35;

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const angle = (frame / frames) * Math.PI * 2;

    const pixelWidth = Math.ceil(size / pixelSize);
    const pixelHeight = Math.ceil(size / pixelSize);

    for (let py = 0; py < pixelHeight; py++) {
      for (let px = 0; px < pixelWidth; px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pixelAngle = Math.atan2(dy, dx);

        // Irregular shape using noise
        const shapeNoise = noise.fbm(
          Math.cos(pixelAngle + angle) * 4,
          Math.sin(pixelAngle + angle) * 4,
          angle * 2,
          6
        );
        const radius = baseRadius * (1 + shapeNoise * irregularity);

        let r = 0, g = 0, b = 0, a = 0;

        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          // Surface detail with craters
          const worldX = dx / baseRadius * 8 + angle * 3;
          const worldY = dy / baseRadius * 8;
          const worldZ = z * 8;

          const surface = noise.fbm(worldX, worldY, worldZ, 6);
          const craters = noise.ridged(worldX * 2, worldY * 2, worldZ * 2, 5);

          const detail = surface * 0.6 + craters * 0.4;

          r = colorBase.r * (0.7 + detail * 0.5);
          g = colorBase.g * (0.7 + detail * 0.5);
          b = colorBase.b * (0.7 + detail * 0.5);

          // 3D lighting
          const lightDir = { x: 0.8, y: -0.3, z: 0.5 };
          const normal = { x: dx / radius, y: dy / radius, z: z };
          const dotProduct = Math.max(0, normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z);

          const lighting = 0.3 + dotProduct * 0.7;
          const limbDarkening = 0.5 + 0.5 * Math.pow(z, 0.4);

          r *= lighting * limbDarkening;
          g *= lighting * limbDarkening;
          b *= lighting * limbDarkening;

          a = 255;
        }

        if (a > 0) {
          ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${a / 255})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size, frames };
}

// ============================================================================
// COMET GENERATOR - Nucleus with tail
// ============================================================================
function generateComet(index) {
  const size = CONFIG.cometSize;
  const frames = CONFIG.cometFrames;
  const pixelSize = CONFIG.cometPixelSize;

  console.log(`  Generating comet #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 10000);

  const centerX = size / 2;
  const centerY = size / 2;
  const nucleusRadius = size * 0.08;

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

        // Tail - extends to the left
        if (dx < 0 && Math.abs(dy) < size * 0.4) {
          const tailDist = -dx / (size * 0.4);
          if (tailDist < 1) {
            const tailWidth = 1 - Math.abs(dy) / (size * 0.4);
            const tailNoise = noise.fbm(dx * 0.01, dy * 0.01, time * 10, 5);
            let tailIntensity = Math.pow(1 - tailDist, 2) * tailWidth * (0.7 + tailNoise * 0.5);

            r = 180 * tailIntensity;
            g = 200 * tailIntensity;
            b = 255 * tailIntensity;
            a = tailIntensity * 150;
          }
        }

        // Coma - glow around nucleus
        if (dist < nucleusRadius * 4) {
          const comaDist = dist / (nucleusRadius * 4);
          const comaNoise = noise.fbm(dx * 0.05, dy * 0.05, time * 8, 4);
          let comaIntensity = Math.pow(1 - comaDist, 2) * (0.8 + comaNoise * 0.4);

          r = Math.max(r, 200 * comaIntensity);
          g = Math.max(g, 220 * comaIntensity);
          b = Math.max(b, 255 * comaIntensity);
          a = Math.max(a, comaIntensity * 200);
        }

        // Nucleus - solid center
        if (dist < nucleusRadius) {
          const surfaceNoise = noise.fbm(dx / nucleusRadius * 10, dy / nucleusRadius * 10, time * 5, 5);
          const brightness = 0.6 + surfaceNoise * 0.4;

          r = 100 * brightness;
          g = 90 * brightness;
          b = 80 * brightness;
          a = 255;
        }

        if (a > 0) {
          ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${a / 255})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size, frames };
}

// ============================================================================
// BLACK HOLE GENERATOR - Accretion disk and gravitational lensing
// ============================================================================
function generateBlackHole() {
  const size = CONFIG.blackHoleSize;
  const frames = CONFIG.blackHoleFrames;
  const pixelSize = CONFIG.blackHolePixelSize;

  console.log(`  Generating black hole (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000));

  const centerX = size / 2;
  const centerY = size / 2;
  const eventHorizonRadius = size * 0.12;
  const accretionDiskInner = eventHorizonRadius * 1.5;
  const accretionDiskOuter = size * 0.45;

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

        // Event horizon - pure black
        if (dist < eventHorizonRadius) {
          r = 0; g = 0; b = 0; a = 255;
        }
        // Accretion disk
        else if (dist >= accretionDiskInner && dist < accretionDiskOuter) {
          const angle = Math.atan2(dy, dx);
          const diskNoise = noise.fbm(
            Math.cos(angle + rotation) * 8,
            Math.sin(angle + rotation) * 8,
            dist / accretionDiskOuter * 10,
            6
          );

          // Disk intensity based on distance from event horizon
          const diskProgress = (dist - accretionDiskInner) / (accretionDiskOuter - accretionDiskInner);
          let intensity = (1 - diskProgress) * (0.7 + diskNoise * 0.5);

          // Hot inner regions
          if (diskProgress < 0.3) {
            r = 255 * intensity;
            g = 200 * intensity;
            b = 100 * intensity;
          } else if (diskProgress < 0.6) {
            r = 255 * intensity;
            g = 150 * intensity;
            b = 50 * intensity;
          } else {
            r = 200 * intensity;
            g = 100 * intensity;
            b = 50 * intensity;
          }

          a = intensity * 220;
        }
        // Gravitational lensing effect
        else if (dist < accretionDiskOuter * 1.3) {
          const lensingDist = (dist - accretionDiskOuter) / (accretionDiskOuter * 0.3);
          const lensingNoise = noise.fbm(dx * 0.01, dy * 0.01, rotation * 3, 4);
          let lensingIntensity = Math.pow(1 - lensingDist, 3) * (0.5 + lensingNoise * 0.5);

          r = 50 * lensingIntensity;
          g = 80 * lensingIntensity;
          b = 120 * lensingIntensity;
          a = lensingIntensity * 100;
        }

        if (a > 0) {
          ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${a / 255})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size, frames };
}

// ============================================================================
// MAIN GENERATION
// ============================================================================
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   ULTIMATE REALISTIC SPRITE GENERATOR v3.0              ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Create output directories
  const dirs = ['stars', 'planets', 'gas_giants', 'moons', 'asteroids', 'comets', 'black_holes'];
  for (const dir of dirs) {
    const dirPath = path.join(OUTPUT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  const args = process.argv.slice(2);
  const generateAll = args.includes('--all');
  const generateStars = generateAll || args.includes('--stars');
  const generatePlanets = generateAll || args.includes('--planets');
  const generateGasGiants = generateAll || args.includes('--gas-giants');
  const generateMoons = generateAll || args.includes('--moons');
  const generateAsteroids = generateAll || args.includes('--asteroids');
  const generateComets = generateAll || args.includes('--comets');
  const generateBlackHoles = generateAll || args.includes('--black-holes');

  if (!generateAll && !generateStars && !generatePlanets && !generateGasGiants &&
      !generateMoons && !generateAsteroids && !generateComets && !generateBlackHoles) {
    console.log('Usage: node generateRealisticSprites.mjs [options]');
    console.log('Options:');
    console.log('  --all          Generate all sprites');
    console.log('  --stars        Generate only stars');
    console.log('  --planets      Generate only planets');
    console.log('  --gas-giants   Generate only gas giants');
    console.log('  --moons        Generate only moons');
    console.log('  --asteroids    Generate only asteroids');
    console.log('  --comets       Generate only comets');
    console.log('  --black-holes  Generate only black holes');
    return;
  }

  // Generate stars
  if (generateStars) {
    console.log('=== Generating Ultra-Bright Stars ===');
    const starsToGenerate = Math.ceil(CONFIG.starCount / CONFIG.stellarClasses.length);
    for (const stellarClass of CONFIG.stellarClasses) {
      const numStars = stellarClass === 'G' ? starsToGenerate + (CONFIG.starCount % CONFIG.stellarClasses.length) : starsToGenerate;
      for (let i = 0; i < numStars; i++) {
        const result = generateStar(stellarClass, i);
        const filename = `star_${stellarClass}_${String(i).padStart(3, '0')}.png`;
        const buffer = result.canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(OUTPUT_DIR, 'stars', filename), buffer);
      }
    }
    console.log(`✓ Generated ${CONFIG.starCount} star sprites\n`);
  }

  // Generate planets
  if (generatePlanets) {
    console.log('=== Generating Ultra-Detailed Planets ===');
    const planetsPerType = Math.ceil(CONFIG.planetTypeCount / CONFIG.planetTypes.length);
    for (const type of CONFIG.planetTypes) {
      for (let i = 0; i < planetsPerType; i++) {
        const result = generatePlanet(type, i);
        const filename = `planet_${type}_${String(i).padStart(3, '0')}.png`;
        const buffer = result.canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(OUTPUT_DIR, 'planets', filename), buffer);
      }
    }
    console.log(`✓ Generated ${CONFIG.planetTypeCount} planet sprites\n`);
  }

  // Generate gas giants
  if (generateGasGiants) {
    console.log('=== Generating Gas Giants ===');
    for (let i = 0; i < CONFIG.gasGiantCount; i++) {
      const result = generateGasGiant(i);
      const filename = `gas_giant_${String(i).padStart(3, '0')}.png`;
      const buffer = result.canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(OUTPUT_DIR, 'gas_giants', filename), buffer);
    }
    console.log(`✓ Generated ${CONFIG.gasGiantCount} gas giant sprites\n`);
  }

  // Generate moons
  if (generateMoons) {
    console.log('=== Generating Moons ===');
    for (let i = 0; i < CONFIG.moonCount; i++) {
      const result = generateMoon(i);
      const filename = `moon_${String(i).padStart(3, '0')}.png`;
      const buffer = result.canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(OUTPUT_DIR, 'moons', filename), buffer);
    }
    console.log(`✓ Generated ${CONFIG.moonCount} moon sprites\n`);
  }

  // Generate asteroids
  if (generateAsteroids) {
    console.log('=== Generating Asteroids ===');
    for (let i = 0; i < CONFIG.asteroidCount; i++) {
      const result = generateAsteroid(i);
      const filename = `asteroid_${String(i).padStart(3, '0')}.png`;
      const buffer = result.canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(OUTPUT_DIR, 'asteroids', filename), buffer);
    }
    console.log(`✓ Generated ${CONFIG.asteroidCount} asteroid sprites\n`);
  }

  // Generate comets
  if (generateComets) {
    console.log('=== Generating Comets ===');
    for (let i = 0; i < CONFIG.cometCount; i++) {
      const result = generateComet(i);
      const filename = `comet_${String(i).padStart(3, '0')}.png`;
      const buffer = result.canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(OUTPUT_DIR, 'comets', filename), buffer);
    }
    console.log(`✓ Generated ${CONFIG.cometCount} comet sprites\n`);
  }

  // Generate black holes
  if (generateBlackHoles) {
    console.log('=== Generating Black Holes ===');
    for (let i = 0; i < CONFIG.blackHoleCount; i++) {
      const result = generateBlackHole();
      const filename = `black_hole_${String(i).padStart(3, '0')}.png`;
      const buffer = result.canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(OUTPUT_DIR, 'black_holes', filename), buffer);
    }
    console.log(`✓ Generated ${CONFIG.blackHoleCount} black hole sprite\n`);
  }

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   GENERATION COMPLETE!                                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
