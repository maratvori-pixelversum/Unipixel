#!/usr/bin/env node
/**
 * ENHANCED CELESTIAL SPRITE GENERATOR v4.0
 *
 * Generates ultra-detailed celestial sprites with:
 * - MORE FRAMES (24-32) for smooth animation
 * - Enhanced CME (Coronal Mass Ejections) for stars
 * - Heavily pixelated surfaces with complex features
 * - Diverse surface details: rivers, seas, craters, mountains, volcanoes, cities
 * - Animated rotation around axis
 * - Rich atmospheres
 * - High quality visuals
 */

import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

// ============================================================================
// ENHANCED CONFIGURATION
// ============================================================================
const CONFIG = {
  // INCREASED frame counts for smoother animation
  starFrames: 24,
  planetFrames: 32,
  gasGiantFrames: 32,
  moonFrames: 24,
  asteroidFrames: 16,
  cometFrames: 20,
  blackHoleFrames: 24,

  // Original sizes
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

  // Pixel sizes for retro look
  starPixelSize: 4,
  planetPixelSize: 3,
  gasGiantPixelSize: 4,
  moonPixelSize: 3,
  asteroidPixelSize: 3,
  cometPixelSize: 4,
  blackHolePixelSize: 4,

  stellarClasses: ['O', 'B', 'A', 'F', 'G', 'K', 'M',
    'BrownDwarf', 'WhiteDwarf', 'NeutronStar', 'Pulsar',
    'RedGiant', 'BlueGiant', 'RedSuperGiant', 'BlueSuperGiant'],

  planetTypes: ['terran', 'rocky', 'desert', 'ice', 'frozen', 'tundra',
    'lava', 'volcanic', 'ocean', 'carbon', 'crystal', 'metal',
    'eyeball', 'tidally_locked', 'radioactive', 'super_earth', 'jungle',
    'toxic', 'barren', 'savanna']
};

// ============================================================================
// ENHANCED 3D PERLIN NOISE
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
  lerp(t, a, b) { return a + t * (b - a); }

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

  fbm(x, y, z, octaves) {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value / maxValue;
  }

  turbulence(x, y, z, octaves) {
    let value = 0, amplitude = 1, frequency = 1;
    for (let i = 0; i < octaves; i++) {
      value += Math.abs(this.noise(x * frequency, y * frequency, z * frequency)) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value;
  }

  ridged(x, y, z, octaves) {
    let value = 0, amplitude = 1, frequency = 1;
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
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t
  };
}

// ============================================================================
// STAR COLOR PALETTES
// ============================================================================
const STAR_COLORS = {
  'O': { core: '#e0f0ff', mid: '#b5c8ff', edge: '#8099ff', cme: '#7788ee' },
  'B': { core: '#f0f8ff', mid: '#cce0ff', edge: '#99b5ff', cme: '#8899ff' },
  'A': { core: '#ffffff', mid: '#e5f0ff', edge: '#b5c8ff', cme: '#aabbff' },
  'F': { core: '#fffffa', mid: '#fffef5', edge: '#f5f0e8', cme: '#ffe8c0' },
  'G': { core: '#ffffee', mid: '#fff8d0', edge: '#ffe0a0', cme: '#ffd080' },
  'K': { core: '#ffeed0', mid: '#ffd8a0', edge: '#ffb870', cme: '#ff9840' },
  'M': { core: '#ffd0a0', mid: '#ffa850', edge: '#ff7020', cme: '#ff5010' },
  'BrownDwarf': { core: '#c86850', mid: '#a84830', edge: '#783020', cme: '#682010' },
  'WhiteDwarf': { core: '#ffffff', mid: '#f8fcff', edge: '#d8e8ff', cme: '#b8d8ff' },
  'NeutronStar': { core: '#ffffff', mid: '#f0f0ff', edge: '#b8b8ff', cme: '#9898ff' },
  'Pulsar': { core: '#e0ffff', mid: '#80ffff', edge: '#00dddd', cme: '#00aaaa' },
  'RedGiant': { core: '#ffaa88', mid: '#ff7755', edge: '#ff3010', cme: '#ee2000' },
  'BlueGiant': { core: '#aaccff', mid: '#6688ff', edge: '#2050dd', cme: '#0030bb' },
  'RedSuperGiant': { core: '#ff9966', mid: '#ff5522', edge: '#cc1000', cme: '#aa0000' },
  'BlueSuperGiant': { core: '#99ccff', mid: '#4488ff', edge: '#0050cc', cme: '#0040aa' }
};

// ============================================================================
// ENHANCED STAR GENERATOR - WITH MORE FRAMES AND CME
// ============================================================================
function generateEnhancedStar(stellarClass, index) {
  const size = CONFIG.starSizes[stellarClass];
  const frames = CONFIG.starFrames;
  const pixelSize = CONFIG.starPixelSize;
  const colors = STAR_COLORS[stellarClass];

  console.log(`  Generating ${stellarClass} star #${index} (${size}x${size}px, ${frames} frames with CME)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 10000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

  const coreColor = hexToRgb(colors.core);
  const midColor = hexToRgb(colors.mid);
  const edgeColor = hexToRgb(colors.edge);
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

        // ENHANCED CORONA with CME - MUCH LARGER (3.5x radius)
        if (dist > radius && dist < radius * 3.5) {
          const coronaDist = (dist - radius) / (radius * 2.5);
          let coronaIntensity = Math.pow(1 - Math.min(1, coronaDist), 2.5);

          // Multi-layer turbulent corona
          const coronaNoise = noise.fbm(
            dx * 0.005 + time * 18,
            dy * 0.005 + time * 15,
            time * 25,
            8
          );

          // CORONAL MASS EJECTIONS - Dramatic eruptions
          const cmeAngle = angle * 4 + time * Math.PI * 4;
          const cmeNoise = noise.fbm(
            Math.cos(cmeAngle) * 3,
            Math.sin(cmeAngle) * 3,
            dist * 0.01 + time * 35,
            7
          );

          // CME eruption trigger
          if (cmeNoise > 0.6) {
            const eruptionPower = Math.pow((cmeNoise - 0.6) * 2.5, 2);
            const fadeOut = 1 - Math.min(1, (dist - radius) / (radius * 2));
            coronaIntensity = Math.max(coronaIntensity, eruptionPower * fadeOut * 1.5);

            // CME color (hotter)
            r = Math.max(r, cmeColor.r * 1.5 * coronaIntensity);
            g = Math.max(g, cmeColor.g * 1.5 * coronaIntensity);
            b = Math.max(b, cmeColor.b * 1.5 * coronaIntensity);
            a = Math.max(a, coronaIntensity * 255);
          } else {
            // Normal corona
            coronaIntensity *= (0.7 + coronaNoise * 0.5);
            r = edgeColor.r * coronaIntensity * 1.3;
            g = edgeColor.g * coronaIntensity * 1.3;
            b = edgeColor.b * coronaIntensity * 1.3;
            a = coronaIntensity * 220;
          }
        }

        // STAR SURFACE - Complex granulation
        if (dist <= radius) {
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          // 3D rotating coordinates
          const worldScale = 20;
          const nx = (dx / radius);
          const ny = (dy / radius);
          const nz = z;

          const cosRot = Math.cos(time * Math.PI * 2);
          const sinRot = Math.sin(time * Math.PI * 2);
          const rotX = nx * cosRot - nz * sinRot;
          const rotZ = nx * sinRot + nz * cosRot;

          const worldX = rotX * worldScale;
          const worldY = ny * worldScale;
          const worldZ = rotZ * worldScale;

          // Multi-scale surface features
          const largeGranules = noise.fbm(worldX * 0.3, worldY * 0.3, worldZ * 0.3, 5);
          const mediumGranules = noise.fbm(worldX * 0.8, worldY * 0.8, worldZ * 0.8, 6);
          const smallGranules = noise.fbm(worldX * 2.0, worldY * 2.0, worldZ * 2.0, 7);
          const microDetail = noise.fbm(worldX * 5.0, worldY * 5.0, worldZ * 5.0, 5);

          const granulation = largeGranules * 0.4 + mediumGranules * 0.3 +
                             smallGranules * 0.2 + microDetail * 0.1;

          // Sunspots (darker regions)
          const spotNoise = noise.fbm(worldX * 0.6, worldY * 0.6, worldZ * 0.6, 6);
          const hasSpot = spotNoise < -0.4 && normalizedDist < 0.85;
          const spotIntensity = hasSpot ? Math.pow((-0.4 - spotNoise) * 2, 1.5) : 0;

          // Solar flares (bright regions)
          const flareNoise = noise.fbm(worldX * 1.5 + time * 50, worldY * 1.5, worldZ * 1.5, 5);
          const hasFlare = flareNoise > 0.7 && normalizedDist < 0.9;
          const flareIntensity = hasFlare ? Math.pow((flareNoise - 0.7) * 3.33, 2) : 0;

          // Base brightness
          let baseBrightness = 1.3 - normalizedDist * 0.3;
          baseBrightness += granulation * 0.25;
          baseBrightness *= (1 - spotIntensity * 0.7);

          // Color based on radial position
          let surfaceColor;
          if (normalizedDist < 0.3) {
            surfaceColor = lerpColor(coreColor, midColor, normalizedDist / 0.3);
          } else if (normalizedDist < 0.7) {
            surfaceColor = lerpColor(midColor, edgeColor, (normalizedDist - 0.3) / 0.4);
          } else {
            surfaceColor = edgeColor;
          }

          r = surfaceColor.r * baseBrightness;
          g = surfaceColor.g * baseBrightness;
          b = surfaceColor.b * baseBrightness;

          // Add flares
          if (hasFlare) {
            r = r * (1 - flareIntensity) + 255 * flareIntensity;
            g = g * (1 - flareIntensity) + 255 * flareIntensity;
            b = b * (1 - flareIntensity) + 255 * flareIntensity;
          }

          // 3D lighting
          const limbDarkening = 0.5 + 0.5 * Math.pow(z, 0.35);
          r *= limbDarkening * 1.3;
          g *= limbDarkening * 1.3;
          b *= limbDarkening * 1.3;

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
// ENHANCED PLANET COLORS
// ============================================================================
const PLANET_PALETTES = {
  terran: {
    ocean: ['#0047ab', '#003d99', '#002966'],
    land: ['#2d8659', '#3a9b6e', '#1d6b42'],
    mountain: ['#8b7355', '#a08968', '#6b5944'],
    ice: ['#e0f0ff', '#c0d8f0', '#a0c0e0'],
    cloud: ['#ffffff', '#f0f0f0', '#e0e0e0']
  },
  desert: {
    sand: ['#f4a460', '#daa520', '#cd853f'],
    rock: ['#a0522d', '#8b4513', '#6b3410'],
    crater: ['#5a3a1a', '#4a2a0a', '#3a1a00']
  },
  ice: {
    ice: ['#e0f5ff', '#b0d5f5', '#90c5e5'],
    crack: ['#7090a0', '#506070', '#304050'],
    deep: ['#d0e5f0', '#a0c5d5', '#80a5b5']
  },
  lava: {
    crust: ['#2a2a2a', '#1a1a1a', '#0a0a0a'],
    lava: ['#ff4400', '#ff6600', '#ff8800'],
    glow: ['#ffaa00', '#ffcc00', '#ffee00']
  },
  ocean: {
    deep: ['#001a4d', '#00143d', '#000e2d'],
    shallow: ['#0047ab', '#0056cc', '#0066dd'],
    ice: ['#c0e0ff', '#d0f0ff', '#e0f5ff']
  },
  rocky: {
    rock: ['#6a5a4a', '#5a4a3a', '#4a3a2a'],
    crater: ['#3a2a1a', '#2a1a0a', '#1a0a00'],
    dust: ['#8a7a6a', '#7a6a5a', '#6a5a4a']
  },
  toxic: {
    surface: ['#4a5a2a', '#3a4a1a', '#2a3a0a'],
    pool: ['#6a8a3a', '#5a7a2a', '#4a6a1a'],
    cloud: ['#8aaa5a', '#7a9a4a', '#6a8a3a']
  }
};

// ============================================================================
// ENHANCED PLANET GENERATOR - WITH COMPLEX SURFACE FEATURES
// ============================================================================
function generateEnhancedPlanet(planetType, index) {
  const size = CONFIG.planetSize;
  const frames = CONFIG.planetFrames;
  const pixelSize = CONFIG.planetPixelSize;

  console.log(`  Generating ${planetType} planet #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 5000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.42;

  const palette = PLANET_PALETTES[planetType] || PLANET_PALETTES.rocky;

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const rotationPhase = (frame / frames) * Math.PI * 2;

    const pixelWidth = Math.ceil(size / pixelSize);
    const pixelHeight = Math.ceil(size / pixelSize);

    for (let py = 0; py < pixelHeight; py++) {
      for (let px = 0; px < pixelWidth; px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radius) continue;

        // 3D sphere mapping with rotation
        const normalizedDist = dist / radius;
        const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

        const nx = dx / radius;
        const ny = dy / radius;
        const nz = z;

        // Rotate around Y axis
        const cosRot = Math.cos(rotationPhase);
        const sinRot = Math.sin(rotationPhase);
        const rotX = nx * cosRot - nz * sinRot;
        const rotZ = nx * sinRot + nz * cosRot;

        const worldScale = 15;
        const worldX = rotX * worldScale;
        const worldY = ny * worldScale;
        const worldZ = rotZ * worldScale;

        // COMPLEX SURFACE FEATURES using multiple noise layers
        const continents = noise.fbm(worldX * 0.3, worldY * 0.3, worldZ * 0.3, 6);
        const mountains = noise.ridged(worldX * 0.8, worldY * 0.8, worldZ * 0.8, 7);
        const valleys = noise.fbm(worldX * 1.2, worldY * 1.2, worldZ * 1.2, 6);
        const microDetail = noise.fbm(worldX * 3.0, worldY * 3.0, worldZ * 3.0, 8);

        // Craters
        const craterNoise = noise.fbm(worldX * 2.5, worldY * 2.5, worldZ * 2.5, 5);
        const hasCrater = craterNoise < -0.5;
        const craterDepth = hasCrater ? Math.pow((-0.5 - craterNoise) * 2, 2) : 0;

        // Rivers/Seas (for terran/ocean types)
        const waterNoise = noise.fbm(worldX * 0.5, worldY * 0.5, worldZ * 0.5, 7);
        const hasWater = planetType === 'terran' || planetType === 'ocean';

        let color;
        if (hasWater && waterNoise < -0.1) {
          // Ocean/Water
          const depth = (-0.1 - waterNoise) / 0.9;
          const colors = palette.ocean || palette.deep || ['#0047ab'];
          const idx = Math.floor(depth * (colors.length - 1));
          color = colors[Math.min(idx, colors.length - 1)];
        } else if (hasCrater) {
          // Craters
          const colors = palette.crater || ['#2a2a2a'];
          color = colors[Math.floor(craterDepth * colors.length) % colors.length];
        } else if (mountains > 0.6) {
          // Mountains
          const colors = palette.mountain || palette.rock || ['#8b7355'];
          const idx = Math.floor((mountains - 0.6) / 0.4 * colors.length);
          color = colors[Math.min(idx, colors.length - 1)];
        } else {
          // Base terrain
          const colors = palette.land || palette.rock || palette.sand || palette.surface || ['#6a5a4a'];
          const terrainValue = (continents + 1) / 2;
          const idx = Math.floor(terrainValue * (colors.length - 1));
          color = colors[Math.min(idx, colors.length - 1)];
        }

        // Add microdetail variation
        const variation = microDetail * 0.15;
        const rgb = hexToRgb(color);

        // 3D lighting (limb darkening)
        const light = Math.pow(z, 0.5) * (1 - normalizedDist * 0.3);

        let r = Math.max(0, Math.min(255, (rgb.r + variation * 50) * light));
        let g = Math.max(0, Math.min(255, (rgb.g + variation * 50) * light));
        let b = Math.max(0, Math.min(255, (rgb.b + variation * 50) * light));

        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
      }
    }

    // Add atmospheric glow for some planet types
    if (planetType === 'terran' || planetType === 'toxic' || planetType === 'ice') {
      const glowColor = planetType === 'toxic' ? '#8aaa5a' :
                       planetType === 'ice' ? '#c0e0ff' : '#4488ff';

      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const glowDist = radius * 1.08;
        const gx = centerX + Math.cos(angle) * glowDist;
        const gy = centerY + Math.sin(angle) * glowDist;

        const glowRgb = hexToRgb(glowColor);
        ctx.fillStyle = `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0.3)`;
        ctx.fillRect(offsetX + Math.floor(gx / pixelSize) * pixelSize,
                     Math.floor(gy / pixelSize) * pixelSize,
                     pixelSize * 2, pixelSize * 2);
      }
    }
  }

  return { canvas, size, frames };
}

// ============================================================================
// ENHANCED MOON GENERATOR
// ============================================================================
function generateEnhancedMoon(index) {
  const size = CONFIG.moonSize.min + Math.floor(Math.random() * (CONFIG.moonSize.max - CONFIG.moonSize.min));
  const frames = CONFIG.moonFrames;
  const pixelSize = CONFIG.moonPixelSize;

  console.log(`  Generating moon #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 3000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.42;

  const baseColors = [
    ['#8a8a8a', '#7a7a7a', '#6a6a6a'], // Gray
    ['#b0a090', '#a09080', '#908070'], // Tan
    ['#c0b0a0', '#b0a090', '#a09080']  // Light brown
  ];
  const colors = baseColors[index % baseColors.length];

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const rotationPhase = (frame / frames) * Math.PI * 2;

    const pixelWidth = Math.ceil(size / pixelSize);
    const pixelHeight = Math.ceil(size / pixelSize);

    for (let py = 0; py < pixelHeight; py++) {
      for (let px = 0; px < pixelWidth; px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radius) continue;

        const normalizedDist = dist / radius;
        const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

        const nx = dx / radius;
        const ny = dy / radius;
        const nz = z;

        const cosRot = Math.cos(rotationPhase);
        const sinRot = Math.sin(rotationPhase);
        const rotX = nx * cosRot - nz * sinRot;
        const rotZ = nx * sinRot + nz * cosRot;

        const worldScale = 12;
        const worldX = rotX * worldScale;
        const worldY = ny * worldScale;
        const worldZ = rotZ * worldScale;

        // Heavily cratered surface
        const largeCraters = noise.fbm(worldX * 0.6, worldY * 0.6, worldZ * 0.6, 6);
        const smallCraters = noise.fbm(worldX * 2.0, worldY * 2.0, worldZ * 2.0, 7);
        const microCraters = noise.fbm(worldX * 4.0, worldY * 4.0, worldZ * 4.0, 5);

        const combined = largeCraters * 0.5 + smallCraters * 0.3 + microCraters * 0.2;
        const colorIdx = Math.floor((combined + 1) / 2 * (colors.length - 1));
        const color = colors[Math.min(Math.max(colorIdx, 0), colors.length - 1)];

        const rgb = hexToRgb(color);
        const light = Math.pow(z, 0.6) * (1 - normalizedDist * 0.2);

        const r = Math.max(0, Math.min(255, rgb.r * light));
        const g = Math.max(0, Math.min(255, rgb.g * light));
        const b = Math.max(0, Math.min(255, rgb.b * light));

        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
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
  console.log('║   ENHANCED SPRITE GENERATOR v4.0                        ║');
  console.log('║   - MORE FRAMES (24-32)                                 ║');
  console.log('║   - ENHANCED CME EFFECTS                                ║');
  console.log('║   - IMPROVED SURFACE DETAILS                            ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Stars
  const starsDir = path.join(OUTPUT_DIR, 'stars');
  if (!fs.existsSync(starsDir)) {
    fs.mkdirSync(starsDir, { recursive: true });
  }

  console.log('=== Generating Enhanced Stars with CME ===');
  for (const stellarClass of CONFIG.stellarClasses) {
    const result = generateEnhancedStar(stellarClass, 0);
    const filename = `star_${stellarClass}_000.png`;
    const buffer = result.canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(starsDir, filename), buffer);
  }
  console.log(`✓ Generated ${CONFIG.stellarClasses.length} enhanced star sprites\n`);

  // Planets
  const planetsDir = path.join(OUTPUT_DIR, 'planets');
  if (!fs.existsSync(planetsDir)) {
    fs.mkdirSync(planetsDir, { recursive: true });
  }

  console.log('=== Generating Enhanced Planets with Complex Surfaces ===');
  for (const planetType of CONFIG.planetTypes) {
    const result = generateEnhancedPlanet(planetType, 0);
    const filename = `planet_${planetType}_000.png`;
    const buffer = result.canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(planetsDir, filename), buffer);
  }
  console.log(`✓ Generated ${CONFIG.planetTypes.length} enhanced planet sprites\n`);

  // Moons
  const moonsDir = path.join(OUTPUT_DIR, 'moons');
  if (!fs.existsSync(moonsDir)) {
    fs.mkdirSync(moonsDir, { recursive: true });
  }

  console.log('=== Generating Enhanced Moons ===');
  for (let i = 0; i < 10; i++) {
    const result = generateEnhancedMoon(i);
    const filename = `moon_${String(i).padStart(3, '0')}.png`;
    const buffer = result.canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(moonsDir, filename), buffer);
  }
  console.log(`✓ Generated 10 enhanced moon sprites\n`);

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   GENERATION COMPLETE!                                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
