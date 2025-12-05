#!/usr/bin/env node
/**
 * ULTRA-DETAILED MOON SPRITE GENERATOR
 *
 * Generates heavily detailed moon sprites with:
 * - 24 frames for smooth rotation animation
 * - Heavily cratered surfaces with multiple crater sizes
 * - Detailed surface texture and regolith
 * - Mountain ranges and valleys
 * - Maria (dark plains)
 * - Rilles (grooves) and scarps
 * - Ray systems from impacts
 * - Varying compositions (rocky, icy, volcanic)
 */

import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites/moons');

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  frames: 24,
  moonSize: { min: 250, max: 400 },
  pixelSize: 3,
  numMoons: 15  // Generate 15 diverse moons
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

// ============================================================================
// MOON TYPES AND PALETTES
// ============================================================================
const MOON_TYPES = [
  {
    name: 'rocky_gray',
    colors: ['#9a9a9a', '#8a8a8a', '#7a7a7a', '#6a6a6a', '#5a5a5a'],
    craterColors: ['#4a4a4a', '#3a3a3a', '#2a2a2a'],
    mariaColors: ['#5a5a5a', '#4a4a4a', '#3a3a3a']
  },
  {
    name: 'rocky_tan',
    colors: ['#c0b0a0', '#b0a090', '#a09080', '#908070', '#807060'],
    craterColors: ['#706050', '#605040', '#504030'],
    mariaColors: ['#706050', '#605040', '#504030']
  },
  {
    name: 'rocky_brown',
    colors: ['#a08060', '#907050', '#806040', '#705030', '#604020'],
    craterColors: ['#503010', '#402000', '#301000'],
    mariaColors: ['#604020', '#503010', '#402000']
  },
  {
    name: 'icy',
    colors: ['#e0f0ff', '#d0e0f0', '#c0d0e0', '#b0c0d0', '#a0b0c0'],
    craterColors: ['#90a0b0', '#8090a0', '#708090'],
    mariaColors: ['#90a0b0', '#8090a0', '#708090']
  },
  {
    name: 'volcanic',
    colors: ['#6a5a4a', '#5a4a3a', '#4a3a2a', '#3a2a1a', '#2a1a0a'],
    craterColors: ['#1a0a00', '#0a0000', '#000000'],
    mariaColors: ['#2a1a0a', '#1a0a00', '#0a0000'],
    lavaColors: ['#ff4400', '#ff6600', '#ff8800']
  }
];

// ============================================================================
// ULTRA-DETAILED MOON GENERATOR
// ============================================================================
function generateUltraDetailedMoon(index) {
  const size = CONFIG.moonSize.min + Math.floor(Math.random() * (CONFIG.moonSize.max - CONFIG.moonSize.min));
  const frames = CONFIG.frames;
  const pixelSize = CONFIG.pixelSize;

  // Select moon type
  const moonType = MOON_TYPES[index % MOON_TYPES.length];

  console.log(`  Generating ${moonType.name} moon #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 3000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.42;

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

        const worldScale = 12;
        const worldX = rotX * worldScale;
        const worldY = ny * worldScale;
        const worldZ = rotZ * worldScale;

        // === COMPLEX SURFACE FEATURES ===

        // 1. BASE TERRAIN - Fine regolith texture
        const baseTexture = noise.fbm(worldX * 4.0, worldY * 4.0, worldZ * 4.0, 8);

        // 2. LARGE CRATERS - Major impacts
        const largeCraters = noise.fbm(worldX * 0.8, worldY * 0.8, worldZ * 0.8, 6);
        const hasLargeCrater = largeCraters < -0.5;
        const largeCraterDepth = hasLargeCrater ? Math.pow((-0.5 - largeCraters) * 2.5, 2) : 0;

        // 3. MEDIUM CRATERS - Common impacts
        const mediumCraters = noise.fbm(worldX * 2.0, worldY * 2.0, worldZ * 2.0, 7);
        const hasMediumCrater = mediumCraters < -0.58;
        const mediumCraterDepth = hasMediumCrater ? Math.pow((-0.58 - mediumCraters) * 2.4, 2) : 0;

        // 4. SMALL CRATERS - Pockmarks everywhere
        const smallCraters = noise.fbm(worldX * 4.5, worldY * 4.5, worldZ * 4.5, 7);
        const hasSmallCrater = smallCraters < -0.62;
        const smallCraterDepth = hasSmallCrater ? Math.pow((-0.62 - smallCraters) * 2.2, 1.8) : 0;

        // 5. MARIA - Dark smooth plains (ancient lava flows)
        const maria = noise.fbm(worldX * 0.4, worldY * 0.4, worldZ * 0.4, 5);
        const isMaria = maria < -0.3;

        // 6. MOUNTAINS AND HIGHLANDS - Ridged terrain
        const mountains = noise.ridged(worldX * 1.2, worldY * 1.2, worldZ * 1.2, 7);
        const isMountain = mountains > 0.7;

        // 7. RILLES - Groove-like features
        const rilles = noise.fbm(worldX * 1.8, worldY * 1.8, worldZ * 1.8, 6);
        const isRille = Math.abs(rilles) < 0.08;

        // 8. RAY SYSTEMS - Bright ejecta from impacts
        const rays = noise.fbm(worldX * 3.0 + 500, worldY * 3.0 + 500, worldZ * 3.0 + 500, 5);
        const hasRays = largeCraterDepth > 0.3 && rays > 0.5;

        // 9. VOLCANIC FEATURES (for volcanic moons)
        let hasLava = false;
        if (moonType.name === 'volcanic') {
          const volcanoNoise = noise.fbm(worldX * 1.5 + 1000, worldY * 1.5 + 1000, worldZ * 1.5 + 1000, 5);
          hasLava = volcanoNoise > 0.68;
        }

        // Calculate total crater depth
        const totalCraterDepth = Math.max(largeCraterDepth, mediumCraterDepth, smallCraterDepth);

        // === DETERMINE TERRAIN COLOR ===
        let terrainColor;

        // LAVA (volcanic moons only)
        if (hasLava && moonType.lavaColors) {
          const lavaColors = moonType.lavaColors;
          terrainColor = lavaColors[Math.floor(Math.random() * lavaColors.length)];
        }
        // RAY SYSTEMS - Bright ejecta
        else if (hasRays) {
          // Brighten the base color
          const baseRgb = hexToRgb(moonType.colors[0]);
          const r = Math.min(255, baseRgb.r + 60);
          const g = Math.min(255, baseRgb.g + 60);
          const b = Math.min(255, baseRgb.b + 60);
          terrainColor = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
        }
        // DEEP CRATERS
        else if (totalCraterDepth > 0.4) {
          const craterColors = moonType.craterColors;
          const craterIdx = Math.floor(totalCraterDepth * (craterColors.length - 1));
          terrainColor = craterColors[Math.min(craterIdx, craterColors.length - 1)];
        }
        // CRATER RIMS - Slightly elevated
        else if (totalCraterDepth > 0.15 && totalCraterDepth < 0.35) {
          // Use lighter colors for crater walls
          const rimColors = moonType.colors.slice(0, 2);
          terrainColor = rimColors[Math.floor(Math.random() * rimColors.length)];
        }
        // MARIA - Dark smooth plains
        else if (isMaria && !isMountain) {
          const mariaColors = moonType.mariaColors;
          terrainColor = mariaColors[Math.floor(Math.random() * mariaColors.length)];
        }
        // RILLES - Grooves
        else if (isRille) {
          const rilleColors = moonType.craterColors;
          terrainColor = rilleColors[Math.floor(Math.random() * rilleColors.length)];
        }
        // MOUNTAINS - Highlands
        else if (isMountain) {
          // Use lighter colors for mountains
          const mountainColors = moonType.colors.slice(0, 3);
          terrainColor = mountainColors[Math.floor((mountains - 0.7) / 0.3 * (mountainColors.length - 1))];
        }
        // BASE TERRAIN
        else {
          const colors = moonType.colors;
          const terrainValue = (baseTexture + 1) / 2;
          const colorIdx = Math.floor(terrainValue * (colors.length - 1));
          terrainColor = colors[Math.min(colorIdx, colors.length - 1)];
        }

        // Add fine texture variation
        const variation = baseTexture * 0.1;
        const rgb = hexToRgb(terrainColor);

        // 3D lighting (limb darkening) - heavily cratered moons have rough lighting
        const roughness = totalCraterDepth * 0.3;
        const light = Math.pow(z, 0.6 - roughness) * (1 - normalizedDist * 0.2);

        // Apply lighting and variation
        let r = Math.max(0, Math.min(255, (rgb.r + variation * 30) * light));
        let g = Math.max(0, Math.min(255, (rgb.g + variation * 30) * light));
        let b = Math.max(0, Math.min(255, (rgb.b + variation * 30) * light));

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
  console.log('║   ULTRA-DETAILED MOON GENERATOR                          ║');
  console.log('║   - 24 FRAMES for smooth rotation                       ║');
  console.log('║   - HEAVILY CRATERED SURFACES                           ║');
  console.log('║   - Maria, Rilles, Mountains, Ray Systems               ║');
  console.log('║   - Diverse Compositions (Rocky, Icy, Volcanic)         ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('=== Generating Ultra-Detailed Moons ===');
  for (let i = 0; i < CONFIG.numMoons; i++) {
    const result = generateUltraDetailedMoon(i);
    const filename = `moon_${String(i).padStart(3, '0')}.png`;
    const buffer = result.canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
    console.log(`  ✓ Saved ${filename}`);
  }
  console.log(`\n✓ Generated ${CONFIG.numMoons} ultra-detailed moon sprites\n`);

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   GENERATION COMPLETE!                                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
