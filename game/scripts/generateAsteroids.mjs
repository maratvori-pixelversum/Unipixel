#!/usr/bin/env node
/**
 * ULTRA-DETAILED ASTEROID SPRITE GENERATOR
 *
 * Generates detailed asteroid sprites with:
 * - 16 frames for tumbling rotation
 * - Irregular, jagged shapes
 * - Heavily cratered surfaces
 * - Various compositions (rocky, metallic, icy, carbonaceous)
 * - Surface details and impact craters
 */

import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites/asteroids');

const CONFIG = {
  frames: 16,
  asteroidSizes: [120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450],
  pixelSize: 3,
  numAsteroids: 100  // Generate 100 diverse asteroids!
};

// Noise class (simplified for speed)
class Noise3D {
  constructor(seed) {
    this.seed = seed;
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let rng = seed >>> 0;
    for (let i = 255; i > 0; i--) {
      rng = (rng * 1664525 + 1013904223) >>> 0;
      const j = rng % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 256; i++) this.perm[i] = this.perm[i + 256] = p[i];
  }

  noise(x, y, z) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = x * x * x * (x * (x * 6 - 15) + 10);
    const v = y * y * y * (y * (y * 6 - 15) + 10);
    const w = z * z * z * (z * (z * 6 - 15) + 10);
    const A = this.perm[X] + Y, B = this.perm[X + 1] + Y;
    return (1 - w) * ((1 - v) * ((1 - u) * this.grad(this.perm[A + Z], x, y, z) +
      u * this.grad(this.perm[B + Z], x - 1, y, z)) +
      v * ((1 - u) * this.grad(this.perm[A + 1 + Z], x, y - 1, z) +
      u * this.grad(this.perm[B + 1 + Z], x - 1, y - 1, z))) +
      w * ((1 - v) * ((1 - u) * this.grad(this.perm[A + Z + 1], x, y, z - 1) +
      u * this.grad(this.perm[B + Z + 1], x - 1, y, z - 1)) +
      v * ((1 - u) * this.grad(this.perm[A + 1 + Z + 1], x, y - 1, z - 1) +
      u * this.grad(this.perm[B + 1 + Z + 1], x - 1, y - 1, z - 1)));
  }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  fbm(x, y, z, octaves) {
    let v = 0, a = 1, f = 1, m = 0;
    for (let i = 0; i < octaves; i++) {
      v += this.noise(x * f, y * f, z * f) * a;
      m += a; a *= 0.5; f *= 2;
    }
    return v / m;
  }
}

const ASTEROID_TYPES = [
  { name: 'rocky', colors: ['#6a5a4a', '#5a4a3a', '#4a3a2a'], irregularity: 0.4 },
  { name: 'metallic', colors: ['#8a7a6a', '#aa8866', '#ccaa88'], irregularity: 0.3 },
  { name: 'icy', colors: ['#c0d0e0', '#b0c0d0', '#a0b0c0'], irregularity: 0.35 },
  { name: 'carbonaceous', colors: ['#2a2a2a', '#3a3a3a', '#1a1a1a'], irregularity: 0.5 },
  { name: 'stony_iron', colors: ['#9a7a5a', '#8a6a4a', '#7a5a3a'], irregularity: 0.45 },
  { name: 'nickel_iron', colors: ['#b0a090', '#a09080', '#908070'], irregularity: 0.3 },
  { name: 'silicate', colors: ['#a08060', '#907050', '#806040'], irregularity: 0.4 },
  { name: 'ice_rock', colors: ['#d0e0f0', '#c0d0e0', '#b0c0d0'], irregularity: 0.5 },
  { name: 'dark_carbon', colors: ['#1a1a1a', '#0a0a0a', '#000000'], irregularity: 0.55 },
  { name: 'rusty', colors: ['#aa5533', '#995544', '#884433'], irregularity: 0.4 },
  { name: 'bright_metal', colors: ['#d0c0b0', '#c0b0a0', '#b0a090'], irregularity: 0.25 },
  { name: 'dark_metal', colors: ['#5a4a3a', '#4a3a2a', '#3a2a1a'], irregularity: 0.35 }
];

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 128, g: 128, b: 128 };
}

function generateAsteroid(index) {
  const size = CONFIG.asteroidSizes[index % CONFIG.asteroidSizes.length];
  const type = ASTEROID_TYPES[index % ASTEROID_TYPES.length];
  const frames = CONFIG.frames;
  const pixelSize = CONFIG.pixelSize;

  console.log(`  Generating ${type.name} asteroid #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 4000);

  const centerX = size / 2;
  const centerY = size / 2;
  const baseRadius = size * 0.38;

  // Create unique shape modulation for this asteroid
  const shapeSeeds = Array.from({length: 8}, () => Math.random() * 10);

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const rotPhase = (frame / frames) * Math.PI * 2;

    for (let py = 0; py < Math.ceil(size / pixelSize); py++) {
      for (let px = 0; px < Math.ceil(size / pixelSize); px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // ENHANCED: Multi-layer irregular shape with unique character
        const angle = Math.atan2(dy, dx);

        // Large-scale deformations (overall shape)
        const shape1 = noise.fbm(Math.cos(angle) * 3 + shapeSeeds[0],
                                  Math.sin(angle) * 3 + shapeSeeds[1],
                                  rotPhase * 1.5, 4);
        // Medium bumps and protrusions
        const shape2 = noise.fbm(Math.cos(angle * 3) * 6 + shapeSeeds[2],
                                  Math.sin(angle * 3) * 6 + shapeSeeds[3],
                                  rotPhase * 2, 5);
        // Fine surface irregularities
        const shape3 = noise.fbm(Math.cos(angle * 7) * 12 + shapeSeeds[4],
                                  Math.sin(angle * 7) * 12 + shapeSeeds[5],
                                  rotPhase * 2.5, 6);

        // Combine shape layers with irregularity factor
        const irregularity = type.irregularity;
        const shapeMod = shape1 * irregularity * 0.6 +
                         shape2 * irregularity * 0.3 +
                         shape3 * irregularity * 0.1;

        const irregularRadius = baseRadius * (0.6 + shapeMod * 0.8 + 0.2);

        if (dist > irregularRadius) continue;

        // ENHANCED: Multiple surface feature layers
        // Large craters and depressions
        const largeCraters = noise.fbm(dx * 0.06, dy * 0.06, rotPhase * 2, 5);
        const hasLargeCrater = largeCraters < -0.55;

        // Medium craters
        const mediumCraters = noise.fbm(dx * 0.12, dy * 0.12, rotPhase * 1.5, 5);
        const hasMediumCrater = mediumCraters < -0.6;

        // Small pockmarks
        const smallCraters = noise.fbm(dx * 0.2, dy * 0.2, rotPhase, 4);
        const hasSmallCrater = smallCraters < -0.65;

        // Surface texture variation
        const surfaceNoise = noise.fbm(dx * 0.08, dy * 0.08, rotPhase * 3, 7);
        const microDetail = noise.fbm(dx * 0.3, dy * 0.3, rotPhase * 4, 5);

        // Determine crater depth
        let craterDepth = 0;
        if (hasLargeCrater) craterDepth = 0.8;
        else if (hasMediumCrater) craterDepth = 0.6;
        else if (hasSmallCrater) craterDepth = 0.4;

        // Color selection with micro-variations
        const textureValue = (surfaceNoise + microDetail * 0.3 + 1) / 2;
        const colorIdx = Math.floor(textureValue * (type.colors.length - 1));
        const color = type.colors[Math.min(Math.max(colorIdx, 0), type.colors.length - 1)];
        const rgb = hexToRgb(color);

        // ENHANCED: 3D lighting with rough surface
        const normalizedDist = dist / irregularRadius;
        const baseLight = 1 - normalizedDist * 0.45;

        // Surface roughness affects lighting
        const roughness = Math.abs(surfaceNoise) * 0.15;
        const light = baseLight * (1 - roughness) * (1 - craterDepth * 0.5);

        let r = Math.max(0, Math.min(255, rgb.r * light));
        let g = Math.max(0, Math.min(255, rgb.g * light));
        let b = Math.max(0, Math.min(255, rgb.b * light));

        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  return { canvas, size, frames };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   ULTRA-DETAILED ASTEROID GENERATOR                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (let i = 0; i < CONFIG.numAsteroids; i++) {
    const result = generateAsteroid(i);
    const filename = `asteroid_${String(i).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), result.canvas.toBuffer('image/png'));
    console.log(`  ✓ Saved ${filename}`);
  }
  console.log(`\n✓ Generated ${CONFIG.numAsteroids} asteroid sprites\n`);
}

main().catch(console.error);
