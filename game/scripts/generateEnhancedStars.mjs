#!/usr/bin/env node
/**
 * ENHANCED STAR SPRITE GENERATOR
 *
 * Fixes:
 * - Much smaller pixel sizes (1px for fine detail)
 * - Proper canvas sizing to avoid cutoff
 * - Smooth edge fadeout to blend with space
 * - Maintains all visual features (corona, CME, granulation)
 */

import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites/stars');

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  frames: 24,
  pixelSize: 1, // MUCH TINIER PIXELS!

  // Increase canvas sizes to fit full corona without cutoff
  starSizes: {
    'O': { core: 1400, canvas: 2400 },
    'B': { core: 1300, canvas: 2200 },
    'A': { core: 1100, canvas: 1900 },
    'F': { core: 1200, canvas: 2000 },
    'G': { core: 1200, canvas: 2000 },
    'K': { core: 900, canvas: 1600 },
    'M': { core: 600, canvas: 1100 },
    'BrownDwarf': { core: 600, canvas: 1100 },
    'WhiteDwarf': { core: 600, canvas: 1100 },
    'NeutronStar': { core: 350, canvas: 700 },
    'Pulsar': { core: 400, canvas: 800 },
    'RedGiant': { core: 1500, canvas: 2600 },
    'BlueGiant': { core: 1500, canvas: 2600 },
    'RedSuperGiant': { core: 1600, canvas: 2800 },
    'BlueSuperGiant': { core: 1500, canvas: 2600 }
  },

  stellarClasses: ['O', 'B', 'A', 'F', 'G', 'K', 'M',
    'BrownDwarf', 'WhiteDwarf', 'NeutronStar', 'Pulsar',
    'RedGiant', 'BlueGiant', 'RedSuperGiant', 'BlueSuperGiant']
};

// ============================================================================
// STAR COLOR PALETTES
// ============================================================================
const STAR_COLORS = {
  'O': {
    core: '#ffffff', mid: '#e0f0ff', edge: '#9bb0ff',
    corona: '#c5d5ff', cme: '#7788ee'
  },
  'B': {
    core: '#ffffff', mid: '#f0f8ff', edge: '#aabfff',
    corona: '#d5e5ff', cme: '#8899ff'
  },
  'A': {
    core: '#ffffff', mid: '#f5faff', edge: '#cad8ff',
    corona: '#e5efff', cme: '#99aadd'
  },
  'F': {
    core: '#fffff8', mid: '#fffef0', edge: '#fff9ea',
    corona: '#fffcf5', cme: '#eecc99'
  },
  'G': {
    core: '#fffff0', mid: '#ffffe0', edge: '#fff4ea',
    corona: '#fff8ee', cme: '#ffcc88'
  },
  'K': {
    core: '#ffffd0', mid: '#ffe8c0', edge: '#ffd2a1',
    corona: '#ffeedd', cme: '#ff9966'
  },
  'M': {
    core: '#ffcc99', mid: '#ffaa66', edge: '#ff9040',
    corona: '#ffbb88', cme: '#ff5522'
  },
  'BrownDwarf': {
    core: '#8b4513', mid: '#654321', edge: '#4a2810',
    corona: '#6a3a1a', cme: '#aa5533'
  },
  'WhiteDwarf': {
    core: '#ffffff', mid: '#f0f8ff', edge: '#e0f0ff',
    corona: '#f5faff', cme: '#c0d8ff'
  },
  'NeutronStar': {
    core: '#ffffff', mid: '#ff00ff', edge: '#8800ff',
    corona: '#cc88ff', cme: '#ff00cc'
  },
  'Pulsar': {
    core: '#ffffff', mid: '#ff00cc', edge: '#cc0099',
    corona: '#ff88cc', cme: '#ff0088'
  },
  'RedGiant': {
    core: '#ffaa66', mid: '#ff6633', edge: '#ff4500',
    corona: '#ff8844', cme: '#ff2200'
  },
  'BlueGiant': {
    core: '#ffffff', mid: '#aaccff', edge: '#6699ff',
    corona: '#bbddff', cme: '#5588ee'
  },
  'RedSuperGiant': {
    core: '#ff8844', mid: '#ff4422', edge: '#ff2200',
    corona: '#ff6633', cme: '#dd1100'
  },
  'BlueSuperGiant': {
    core: '#ffffff', mid: '#99bbff', edge: '#5588ff',
    corona: '#aaccff', cme: '#4477ee'
  }
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
// ENHANCED STAR GENERATOR
// ============================================================================
function generateEnhancedStar(stellarClass, index) {
  const sizes = CONFIG.starSizes[stellarClass];
  const coreSize = sizes.core;
  const canvasSize = sizes.canvas;
  const frames = CONFIG.frames;
  const pixelSize = CONFIG.pixelSize;
  const colors = STAR_COLORS[stellarClass];

  console.log(`  Generating ${stellarClass} star #${index} (${canvasSize}x${canvasSize}px, ${frames} frames, ${pixelSize}px pixels)...`);

  const canvas = createCanvas(canvasSize * frames, canvasSize);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 10000);

  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  const coreRadius = coreSize * 0.4;

  // Convert colors to RGB
  const coreColor = hexToRgb(colors.core);
  const midColor = hexToRgb(colors.mid);
  const edgeColor = hexToRgb(colors.edge);
  const coronaColor = hexToRgb(colors.corona);
  const cmeColor = hexToRgb(colors.cme);

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * canvasSize;
    const time = frame / frames;

    const pixelWidth = Math.ceil(canvasSize / pixelSize);
    const pixelHeight = Math.ceil(canvasSize / pixelSize);

    for (let py = 0; py < pixelHeight; py++) {
      for (let px = 0; px < pixelWidth; px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normalizedDist = dist / coreRadius;
        const angle = Math.atan2(dy, dx);

        let r = 0, g = 0, b = 0, a = 0;

        // === EXTENDED CORONA ===
        // Max distance is controlled to fit in canvas
        const maxCoronaRadius = (canvasSize / 2) * 0.95; // Leave 5% margin
        if (dist > coreRadius && dist < maxCoronaRadius) {
          const coronaDist = (dist - coreRadius) / (maxCoronaRadius - coreRadius);
          let coronaIntensity = Math.pow(1 - coronaDist, 2.5);

          // Turbulent corona
          const coronaNoise = noise.fbm(
            dx * 0.005 + time * 18,
            dy * 0.005 + time * 15,
            time * 25,
            6
          );

          // Radial streamers
          const streamerNoise = noise.fbm(
            angle * 8 + time * 10,
            dist * 0.01,
            time * 12,
            4
          );

          coronaIntensity *= (0.7 + coronaNoise * 0.5 + streamerNoise * 0.3);
          coronaIntensity = Math.max(0, coronaIntensity);

          r = coronaColor.r * 1.3;
          g = coronaColor.g * 1.3;
          b = coronaColor.b * 1.3;
          a = coronaIntensity * 200;
        }

        // === CORONAL MASS EJECTIONS ===
        if (dist > coreRadius * 0.95 && dist < maxCoronaRadius * 0.8) {
          const cmeNoise = noise.fbm(
            angle * 5 + time * 30,
            dist * 0.015 + time * 20,
            time * 35,
            5
          );

          if (cmeNoise > 0.65) {
            const eruptionIntensity = Math.pow((cmeNoise - 0.65) * 2.85, 2);
            const fadeOut = 1 - Math.min(1, (dist - coreRadius) / (maxCoronaRadius * 0.8 - coreRadius));
            const cmeStrength = eruptionIntensity * fadeOut;

            r = Math.max(r, cmeColor.r * 1.5 * cmeStrength);
            g = Math.max(g, cmeColor.g * 1.5 * cmeStrength);
            b = Math.max(b, cmeColor.b * 1.5 * cmeStrength);
            a = Math.max(a, cmeStrength * 255);
          }
        }

        // === STAR SURFACE ===
        if (dist <= coreRadius) {
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          // 3D world coordinates
          const worldScale = 20;
          const nx = dx / coreRadius;
          const ny = dy / coreRadius;
          const nz = z;

          // Rotation
          const cosRot = Math.cos(time * Math.PI * 2);
          const sinRot = Math.sin(time * Math.PI * 2);
          const rotX = nx * cosRot - nz * sinRot;
          const rotZ = nx * sinRot + nz * cosRot;

          const worldX = rotX * worldScale;
          const worldY = ny * worldScale;
          const worldZ = rotZ * worldScale;

          // Multi-scale granulation
          const largeGranules = noise.fbm(worldX * 0.3, worldY * 0.3, worldZ * 0.3, 4);
          const mediumGranules = noise.fbm(worldX * 0.8, worldY * 0.8, worldZ * 0.8, 5);
          const smallGranules = noise.fbm(worldX * 2.0, worldY * 2.0, worldZ * 2.0, 6);
          const microDetail = noise.fbm(worldX * 5.0, worldY * 5.0, worldZ * 5.0, 4);

          const granulation = largeGranules * 0.4 + mediumGranules * 0.3 +
                             smallGranules * 0.2 + microDetail * 0.1;

          // Sunspots
          const spotNoise = noise.fbm(worldX * 0.6, worldY * 0.6, worldZ * 0.6, 5);
          const hasSpot = spotNoise < -0.4 && normalizedDist < 0.85;
          const spotIntensity = hasSpot ? Math.pow((-0.4 - spotNoise) * 2, 1.5) : 0;

          // Solar flares
          const flareNoise = noise.fbm(worldX * 1.5 + time * 50, worldY * 1.5, worldZ * 1.5, 4);
          const hasFlare = flareNoise > 0.7 && normalizedDist < 0.9;
          const flareIntensity = hasFlare ? Math.pow((flareNoise - 0.7) * 3.33, 2) : 0;

          // Base brightness
          let baseBrightness = 1.2 - normalizedDist * 0.3;
          baseBrightness += granulation * 0.25;
          baseBrightness *= (1 - spotIntensity * 0.7);
          baseBrightness += flareIntensity * 0.5;

          // Color based on position
          let surfaceColor;
          if (normalizedDist < 0.15) {
            surfaceColor = coreColor;
          } else if (normalizedDist < 0.5) {
            const t = (normalizedDist - 0.15) / 0.35;
            surfaceColor = lerpColor(coreColor, midColor, t);
          } else if (normalizedDist < 0.85) {
            const t = (normalizedDist - 0.5) / 0.35;
            surfaceColor = lerpColor(midColor, edgeColor, t);
          } else {
            const t = (normalizedDist - 0.85) / 0.15;
            surfaceColor = lerpColor(edgeColor, midColor, t);
          }

          // 3D lighting (limb darkening)
          const light = Math.pow(z, 0.6) * (1 - normalizedDist * 0.15);

          r = surfaceColor.r * baseBrightness * light;
          g = surfaceColor.g * baseBrightness * light;
          b = surfaceColor.b * baseBrightness * light;
          a = 255;
        }

        // Only draw if there's visible color
        if (a > 1) {
          ctx.fillStyle = `rgba(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)}, ${a / 255})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  return { canvas, size: canvasSize, frames };
}

// ============================================================================
// MAIN GENERATION
// ============================================================================
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   ENHANCED STAR GENERATOR v2.0                           ║');
  console.log('║   - 1px TINY PIXELS for ultra-fine detail               ║');
  console.log('║   - PROPER CANVAS SIZING (no cutoff!)                   ║');
  console.log('║   - SMOOTH EDGE FADEOUT                                 ║');
  console.log('║   - 24 FRAMES for smooth animation                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('=== Generating Enhanced Stars ===');
  for (const stellarClass of CONFIG.stellarClasses) {
    const result = generateEnhancedStar(stellarClass, 0);
    const filename = `star_${stellarClass}_000.png`;
    const buffer = result.canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
    console.log(`  ✓ Saved ${filename}`);
  }
  console.log(`\n✓ Generated ${CONFIG.stellarClasses.length} enhanced star sprites\n`);

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   GENERATION COMPLETE!                                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
