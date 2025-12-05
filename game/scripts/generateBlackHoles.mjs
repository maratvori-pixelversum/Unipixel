#!/usr/bin/env node
/**
 * ULTRA-DETAILED BLACK HOLE SPRITE GENERATOR
 *
 * Generates highly detailed black hole sprites with:
 * - 24 frames for smooth rotation animation
 * - Event horizon (pure black center)
 * - Accretion disk with hot plasma
 * - Gravitational lensing effects
 * - Relativistic jets (for some black holes)
 * - Hawking radiation glow
 * - Variable disk colors (red/orange/yellow/white based on heat)
 */

import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites/black_holes');

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  frames: 24,
  blackHoleSizes: [600, 800, 1000], // Event horizon sizes
  pixelSize: 4,

  blackHoleTypes: [
    'stellar',           // Stellar-mass black hole
    'intermediate',      // Intermediate-mass black hole
    'supermassive',      // Supermassive black hole (galactic core)
    'active_quasar',     // Active quasar (very bright accretion)
    'dormant'            // Dormant black hole (minimal accretion)
  ]
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

  turbulence(x, y, z, octaves) {
    let value = 0, amplitude = 1, frequency = 1;
    for (let i = 0; i < octaves; i++) {
      value += Math.abs(this.noise(x * frequency, y * frequency, z * frequency)) * amplitude;
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
// BLACK HOLE PALETTES
// ============================================================================
const BLACK_HOLE_PALETTES = {
  stellar: {
    accretionHot: ['#ffffff', '#ffffaa', '#ffff88'],
    accretionWarm: ['#ffaa55', '#ff8844', '#ff6633'],
    accretionCool: ['#ff4422', '#ff2211', '#cc0000'],
    hasJets: true,
    jetColor: '#88aaff',
    lensingColor: '#ffffff'
  },
  intermediate: {
    accretionHot: ['#ffffee', '#ffffdd', '#ffffcc'],
    accretionWarm: ['#ffcc88', '#ffaa66', '#ff8844'],
    accretionCool: ['#ff5533', '#ff3322', '#dd1100'],
    hasJets: true,
    jetColor: '#99bbff',
    lensingColor: '#ffffff'
  },
  supermassive: {
    accretionHot: ['#ffffff', '#ffffee', '#ffffdd'],
    accretionWarm: ['#ffddaa', '#ffcc99', '#ffbb88'],
    accretionCool: ['#ff7744', '#ff5522', '#ff3300'],
    hasJets: true,
    jetColor: '#aaccff',
    lensingColor: '#ffffff'
  },
  active_quasar: {
    accretionHot: ['#ffffff', '#ffffff', '#ffffee'],
    accretionWarm: ['#ffffcc', '#ffffaa', '#ffff88'],
    accretionCool: ['#ffaa66', '#ff8844', '#ff6622'],
    hasJets: true,
    jetColor: '#ddeeFF',
    lensingColor: '#ffffff'
  },
  dormant: {
    accretionHot: ['#ffaa88', '#ff9977', '#ff8866'],
    accretionWarm: ['#ff6644', '#ff4433', '#ff2222'],
    accretionCool: ['#cc1100', '#aa0000', '#880000'],
    hasJets: false,
    jetColor: null,
    lensingColor: '#888888'
  }
};

// ============================================================================
// ULTRA-DETAILED BLACK HOLE GENERATOR
// ============================================================================
function generateUltraDetailedBlackHole(blackHoleType, index) {
  const baseSize = CONFIG.blackHoleSizes[index % CONFIG.blackHoleSizes.length];
  // Black holes need extra space for accretion disk and jets
  const size = baseSize * 2;
  const frames = CONFIG.frames;
  const pixelSize = CONFIG.pixelSize;

  console.log(`  Generating ${blackHoleType} black hole #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 9000);

  const centerX = size / 2;
  const centerY = size / 2;
  const eventHorizonRadius = baseSize * 0.15; // Event horizon is small

  const palette = BLACK_HOLE_PALETTES[blackHoleType] || BLACK_HOLE_PALETTES.stellar;

  // Determine activity level
  const activityLevel = blackHoleType === 'active_quasar' ? 1.0 :
                        blackHoleType === 'dormant' ? 0.2 :
                        blackHoleType === 'supermassive' ? 0.8 : 0.6;

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const rotationPhase = (frame / frames) * Math.PI * 2;

    const pixelWidth = Math.ceil(size / pixelSize);
    const pixelHeight = Math.ceil(size / pixelSize);

    // === ACCRETION DISK ===
    // The accretion disk rotates extremely fast
    const fastRotation = rotationPhase * 5.0; // 5x faster rotation

    for (let py = 0; py < pixelHeight; py++) {
      for (let px = 0; px < pixelWidth; px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Calculate angle for rotation
        const angle = Math.atan2(dy, dx);

        // === EVENT HORIZON (pure black) ===
        if (dist < eventHorizonRadius) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
          continue;
        }

        // === GRAVITATIONAL LENSING (ring around event horizon) ===
        if (dist >= eventHorizonRadius && dist < eventHorizonRadius * 1.3) {
          const lensingIntensity = 1 - ((dist - eventHorizonRadius) / (eventHorizonRadius * 0.3));
          const lensingRgb = hexToRgb(palette.lensingColor);
          const alpha = 0.3 * lensingIntensity;
          ctx.fillStyle = `rgba(${lensingRgb.r}, ${lensingRgb.g}, ${lensingRgb.b}, ${alpha})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
          continue;
        }

        // === ACCRETION DISK ===
        const diskInnerRadius = eventHorizonRadius * 1.5;
        const diskOuterRadius = baseSize * 0.8;

        if (dist >= diskInnerRadius && dist < diskOuterRadius) {
          // Calculate disk position with rotation
          const rotatedAngle = angle - fastRotation * (1 - (dist - diskInnerRadius) / (diskOuterRadius - diskInnerRadius));

          // Disk turbulence and structure
          const diskNoise = noise.fbm(
            Math.cos(rotatedAngle) * dist * 0.05,
            Math.sin(rotatedAngle) * dist * 0.05,
            frame * 0.1,
            6
          );

          const turbulence = noise.turbulence(
            Math.cos(rotatedAngle) * dist * 0.1 + fastRotation * 10,
            Math.sin(rotatedAngle) * dist * 0.1,
            frame * 0.2,
            5
          );

          // Skip gaps in disk
          if (diskNoise < -0.3) continue;

          // Calculate temperature (hotter near event horizon)
          const diskProgress = (dist - diskInnerRadius) / (diskOuterRadius - diskInnerRadius);
          const temperature = (1 - diskProgress) + turbulence * 0.2;

          // Select color based on temperature
          let diskColor;
          if (temperature > 0.7) {
            // White hot
            const hotColors = palette.accretionHot;
            const idx = Math.floor((temperature - 0.7) / 0.3 * (hotColors.length - 1));
            diskColor = hotColors[Math.min(idx, hotColors.length - 1)];
          } else if (temperature > 0.4) {
            // Warm
            const warmColors = palette.accretionWarm;
            const idx = Math.floor((temperature - 0.4) / 0.3 * (warmColors.length - 1));
            diskColor = warmColors[Math.min(idx, warmColors.length - 1)];
          } else {
            // Cool
            const coolColors = palette.accretionCool;
            const idx = Math.floor(temperature / 0.4 * (coolColors.length - 1));
            diskColor = coolColors[Math.min(idx, coolColors.length - 1)];
          }

          // Apply activity level and opacity
          const diskOpacity = 0.8 * activityLevel * (1 - diskProgress * 0.5);
          const rgb = hexToRgb(diskColor);

          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${diskOpacity})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }

        // === OUTER GLOW ===
        const glowRadius = diskOuterRadius * 1.5;
        if (dist >= diskOuterRadius && dist < glowRadius && activityLevel > 0.3) {
          const glowProgress = (dist - diskOuterRadius) / (glowRadius - diskOuterRadius);
          const glowAlpha = 0.3 * activityLevel * (1 - glowProgress);

          const glowRgb = hexToRgb(palette.accretionWarm[1]);
          ctx.fillStyle = `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, ${glowAlpha})`;
          ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    // === RELATIVISTIC JETS ===
    if (palette.hasJets && activityLevel > 0.5) {
      const jetRgb = hexToRgb(palette.jetColor);
      const jetLength = baseSize * 2;
      const jetWidth = eventHorizonRadius * 0.5;

      // Top jet
      for (let jy = centerY - jetLength; jy < centerY - eventHorizonRadius; jy += pixelSize) {
        const jetDist = centerY - jy;
        const jetProgress = jetDist / jetLength;
        const jetAlpha = 0.7 * activityLevel * (1 - jetProgress);

        // Add turbulence to jet
        const jetTurbulence = noise.fbm(0, jy * 0.1, fastRotation * 5, 4);
        const jetWidthVariation = jetWidth * (1 + jetTurbulence * 0.5);

        for (let jx = centerX - jetWidthVariation; jx <= centerX + jetWidthVariation; jx += pixelSize) {
          const distFromCenter = Math.abs(jx - centerX);
          const edgeFade = 1 - (distFromCenter / jetWidthVariation);

          ctx.fillStyle = `rgba(${jetRgb.r}, ${jetRgb.g}, ${jetRgb.b}, ${jetAlpha * edgeFade})`;
          ctx.fillRect(
            offsetX + Math.floor(jx / pixelSize) * pixelSize,
            Math.floor(jy / pixelSize) * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      }

      // Bottom jet
      for (let jy = centerY + eventHorizonRadius; jy < centerY + jetLength; jy += pixelSize) {
        const jetDist = jy - centerY;
        const jetProgress = jetDist / jetLength;
        const jetAlpha = 0.7 * activityLevel * (1 - jetProgress);

        // Add turbulence to jet
        const jetTurbulence = noise.fbm(0, jy * 0.1, fastRotation * 5, 4);
        const jetWidthVariation = jetWidth * (1 + jetTurbulence * 0.5);

        for (let jx = centerX - jetWidthVariation; jx <= centerX + jetWidthVariation; jx += pixelSize) {
          const distFromCenter = Math.abs(jx - centerX);
          const edgeFade = 1 - (distFromCenter / jetWidthVariation);

          ctx.fillStyle = `rgba(${jetRgb.r}, ${jetRgb.g}, ${jetRgb.b}, ${jetAlpha * edgeFade})`;
          ctx.fillRect(
            offsetX + Math.floor(jx / pixelSize) * pixelSize,
            Math.floor(jy / pixelSize) * pixelSize,
            pixelSize,
            pixelSize
          );
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
  console.log('║   ULTRA-DETAILED BLACK HOLE GENERATOR                    ║');
  console.log('║   - 24 FRAMES for rotating accretion disk               ║');
  console.log('║   - EVENT HORIZON (pure black)                          ║');
  console.log('║   - ACCRETION DISK with hot plasma                      ║');
  console.log('║   - GRAVITATIONAL LENSING effects                       ║');
  console.log('║   - RELATIVISTIC JETS                                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('=== Generating Ultra-Detailed Black Holes ===');
  for (let i = 0; i < CONFIG.blackHoleTypes.length; i++) {
    const blackHoleType = CONFIG.blackHoleTypes[i];
    const result = generateUltraDetailedBlackHole(blackHoleType, i);
    const filename = `black_hole_${blackHoleType}_000.png`;
    const buffer = result.canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
    console.log(`  ✓ Saved ${filename}`);
  }
  console.log(`\n✓ Generated ${CONFIG.blackHoleTypes.length} ultra-detailed black hole sprites\n`);

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   GENERATION COMPLETE!                                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
