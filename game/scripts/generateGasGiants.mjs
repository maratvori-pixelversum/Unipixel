#!/usr/bin/env node
/**
 * ULTRA-DETAILED GAS GIANT SPRITE GENERATOR
 *
 * Generates highly detailed gas giant sprites with:
 * - 32 frames for smooth rotation animation
 * - Complex atmospheric bands and zones
 * - Great spots (storms like Jupiter's Great Red Spot)
 * - Turbulent cloud patterns
 * - Atmospheric lightning
 * - Hexagonal polar storms (like Saturn)
 * - Wind patterns and jet streams
 * - Variable colors (jovian, ice giant, hot jupiter, etc.)
 * - Detailed atmospheric layers
 */

import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites/gas_giants');

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  frames: 32,
  gasGiantSizes: [1200, 1400, 1600, 1800], // Various sizes
  pixelSize: 4,

  gasGiantTypes: [
    'jovian_tan',      // Jupiter-like (tan/brown bands)
    'jovian_orange',   // Orange/red gas giant
    'ice_giant_blue',  // Neptune/Uranus-like (blue)
    'ice_giant_teal',  // Teal ice giant
    'hot_jupiter',     // Very hot, dark with glow
    'storm_giant',     // Turbulent storm systems
    'purple_giant',    // Purple/violet atmosphere
    'green_giant',     // Green atmospheric composition
    'ringed_giant'     // With prominent ring system
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

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.floor(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// ============================================================================
// GAS GIANT COLOR PALETTES
// ============================================================================
const GAS_GIANT_PALETTES = {
  jovian_tan: {
    lightBands: ['#f4e4d0', '#e0d0b0', '#d0c0a0'],
    darkBands: ['#b0a080', '#a09070', '#908060'],
    storms: ['#dd8855', '#cc7744', '#bb6633'],
    poles: ['#c0b0a0', '#b0a090', '#a09080']
  },
  jovian_orange: {
    lightBands: ['#ffcc88', '#ffbb77', '#ffaa66'],
    darkBands: ['#dd7733', '#cc6622', '#bb5511'],
    storms: ['#ff4422', '#ee3311', '#dd2200'],
    poles: ['#bb8855', '#aa7744', '#996633']
  },
  ice_giant_blue: {
    lightBands: ['#88ccff', '#77bbee', '#66aadd'],
    darkBands: ['#4488cc', '#3377bb', '#2266aa'],
    storms: ['#2255aa', '#114499', '#003388'],
    poles: ['#5599dd', '#4488cc', '#3377bb']
  },
  ice_giant_teal: {
    lightBands: ['#88ffee', '#77eedd', '#66ddcc'],
    darkBands: ['#44ccbb', '#33bbaa', '#22aa99'],
    storms: ['#228899', '#117788', '#006677'],
    poles: ['#55ddcc', '#44ccbb', '#33bbaa']
  },
  hot_jupiter: {
    lightBands: ['#4a3a2a', '#3a2a1a', '#2a1a0a'],
    darkBands: ['#2a1a0a', '#1a0a00', '#0a0000'],
    storms: ['#ff6600', '#ff5500', '#ff4400'],
    poles: ['#3a2a1a', '#2a1a0a', '#1a0a00']
  },
  storm_giant: {
    lightBands: ['#e0d0ff', '#d0c0ee', '#c0b0dd'],
    darkBands: ['#9080cc', '#8070bb', '#7060aa'],
    storms: ['#ff88cc', '#ee77bb', '#dd66aa'],
    poles: ['#b0a0dd', '#a090cc', '#9080bb']
  },
  purple_giant: {
    lightBands: ['#dd99ff', '#cc88ee', '#bb77dd'],
    darkBands: ['#9955cc', '#8844bb', '#7733aa'],
    storms: ['#cc44ff', '#bb33ee', '#aa22dd'],
    poles: ['#aa66dd', '#9955cc', '#8844bb']
  },
  green_giant: {
    lightBands: ['#99ff99', '#88ee88', '#77dd77'],
    darkBands: ['#55aa55', '#449944', '#338833'],
    storms: ['#44bb44', '#33aa33', '#229922'],
    poles: ['#66cc66', '#55bb55', '#44aa44']
  },
  ringed_giant: {
    lightBands: ['#ffeecc', '#eeddbb', '#ddccaa'],
    darkBands: ['#aa9977', '#998866', '#887755'],
    storms: ['#cc9966', '#bb8855', '#aa7744'],
    poles: ['#ccbb99', '#bbaa88', '#aa9977'],
    rings: ['#d0c0b0', '#c0b0a0', '#b0a090']
  }
};

// ============================================================================
// ULTRA-DETAILED GAS GIANT GENERATOR
// ============================================================================
function generateUltraDetailedGasGiant(gasGiantType, index) {
  const size = CONFIG.gasGiantSizes[index % CONFIG.gasGiantSizes.length];
  const frames = CONFIG.frames;
  const pixelSize = CONFIG.pixelSize;

  console.log(`  Generating ${gasGiantType} gas giant #${index} (${size}x${size}px, ${frames} frames)...`);

  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new Noise3D(Math.floor(Math.random() * 1000000) + index * 7000);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.42;

  const palette = GAS_GIANT_PALETTES[gasGiantType] || GAS_GIANT_PALETTES.jovian_tan;

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

        // 3D sphere mapping with fast rotation
        const normalizedDist = dist / radius;
        const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

        const nx = dx / radius;
        const ny = dy / radius;
        const nz = z;

        // FAST rotation for gas giants (they rotate much faster than rocky planets)
        const fastRotation = rotationPhase * 2.5; // 2.5x faster
        const cosRot = Math.cos(fastRotation);
        const sinRot = Math.sin(fastRotation);
        const rotX = nx * cosRot - nz * sinRot;
        const rotZ = nx * sinRot + nz * cosRot;

        const worldScale = 10;
        const worldX = rotX * worldScale;
        const worldY = ny * worldScale;
        const worldZ = rotZ * worldScale;

        // === ATMOSPHERIC FEATURES ===

        // 1. LATITUDE BANDS - Strong horizontal banding
        const latitudeBands = Math.sin(worldY * 3.5) * 0.5 + 0.5;

        // 2. JET STREAMS - Fast-moving wind patterns
        const jetStreams = noise.fbm(worldX * 4.0 + fastRotation * 30, worldY * 0.8, worldZ * 4.0, 6);

        // 3. TURBULENCE - Chaotic cloud patterns
        const turbulence = noise.turbulence(worldX * 2.5 + fastRotation * 20, worldY * 2.5, worldZ * 2.5, 7);

        // 4. GREAT SPOTS - Large storm systems
        const stormNoise = noise.fbm(worldX * 1.2, worldY * 1.2, worldZ * 1.2, 5);
        const hasStorm = stormNoise > 0.55;
        const stormIntensity = hasStorm ? Math.pow((stormNoise - 0.55) / 0.45, 2) : 0;

        // 5. SMALL STORMS - Smaller turbulent features
        const smallStorms = noise.fbm(worldX * 3.5, worldY * 3.5, worldZ * 3.5, 6);
        const hasSmallStorm = smallStorms > 0.65;

        // 6. POLAR FEATURES - Hexagonal storms (like Saturn)
        const polarDistance = Math.abs(ny);
        const isPolar = polarDistance > 0.75;
        const polarPattern = noise.fbm(worldX * 6.0, worldY * 6.0, worldZ * 6.0, 5);

        // 7. ATMOSPHERIC LAYERS - Different cloud deck heights
        const layerDepth = noise.fbm(worldX * 1.5, worldY * 1.5, worldZ * 1.5, 6);

        // 8. LIGHTNING - Occasional atmospheric lightning
        const lightningNoise = noise.fbm(worldX * 5.0 + fastRotation * 50, worldY * 5.0, worldZ * 5.0, 4);
        const hasLightning = lightningNoise > 0.78;

        // === DETERMINE ATMOSPHERIC COLOR ===
        let atmosphereColor;

        // LIGHTNING - Bright flashes
        if (hasLightning) {
          atmosphereColor = '#ffffff';
        }
        // POLAR REGIONS - Special polar storms
        else if (isPolar) {
          const polarColors = palette.poles;
          const polarIdx = Math.floor(polarPattern * (polarColors.length - 1) + 0.5);
          atmosphereColor = polarColors[Math.min(Math.max(polarIdx, 0), polarColors.length - 1)];
        }
        // GREAT SPOTS - Major storms
        else if (stormIntensity > 0.3) {
          const stormColors = palette.storms;
          const stormIdx = Math.floor(stormIntensity * (stormColors.length - 1));
          atmosphereColor = stormColors[Math.min(stormIdx, stormColors.length - 1)];
        }
        // SMALL STORMS
        else if (hasSmallStorm) {
          const stormColors = palette.storms;
          atmosphereColor = stormColors[Math.floor(Math.random() * stormColors.length)];
        }
        // LATITUDE BANDS - Alternating light/dark bands
        else {
          const bandValue = latitudeBands + jetStreams * 0.3 + turbulence * 0.15;

          if (bandValue > 0.55) {
            // Light bands
            const lightColors = palette.lightBands;
            const lightIdx = Math.floor(((bandValue - 0.55) / 0.45) * (lightColors.length - 1));
            atmosphereColor = lightColors[Math.min(lightIdx, lightColors.length - 1)];
          } else {
            // Dark bands
            const darkColors = palette.darkBands;
            const darkIdx = Math.floor((bandValue / 0.55) * (darkColors.length - 1));
            atmosphereColor = darkColors[Math.min(darkIdx, darkColors.length - 1)];
          }
        }

        // Add atmospheric turbulence variation
        const variation = turbulence * 0.08;
        const rgb = hexToRgb(atmosphereColor);

        // 3D lighting (subtle limb darkening for gas giants)
        const light = Math.pow(z, 0.35) * (1 - normalizedDist * 0.15);

        // Apply lighting and variation
        let r = Math.max(0, Math.min(255, (rgb.r + variation * 50) * light));
        let g = Math.max(0, Math.min(255, (rgb.g + variation * 50) * light));
        let b = Math.max(0, Math.min(255, (rgb.b + variation * 50) * light));

        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
      }
    }

    // === ATMOSPHERIC GLOW ===
    const glowRgb = hexToRgb(palette.lightBands[0]);
    const atmosphereSegments = 72;

    for (let i = 0; i < atmosphereSegments; i++) {
      const angle = (i / atmosphereSegments) * Math.PI * 2;
      const glowDist = radius * 1.06;
      const gx = centerX + Math.cos(angle) * glowDist;
      const gy = centerY + Math.sin(angle) * glowDist;

      ctx.fillStyle = `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0.4)`;
      ctx.fillRect(offsetX + Math.floor(gx / pixelSize) * pixelSize,
                   Math.floor(gy / pixelSize) * pixelSize,
                   pixelSize * 2, pixelSize * 2);
    }

    // === RING SYSTEM (for ringed_giant) ===
    if (gasGiantType === 'ringed_giant' && palette.rings) {
      const ringInnerRadius = radius * 1.3;
      const ringOuterRadius = radius * 2.0;
      const ringSegments = 120;

      for (let r = ringInnerRadius; r < ringOuterRadius; r += pixelSize * 2) {
        const ringProgress = (r - ringInnerRadius) / (ringOuterRadius - ringInnerRadius);
        const ringAlpha = 0.6 * (1 - ringProgress);

        // Ring gaps and structure
        const ringStructure = noise.fbm(r * 0.05, frame * 0.1, 0, 4);
        if (ringStructure < -0.2) continue; // Gaps in rings

        const ringColorIdx = Math.floor(ringProgress * (palette.rings.length - 1));
        const ringColor = hexToRgb(palette.rings[Math.min(ringColorIdx, palette.rings.length - 1)]);

        for (let i = 0; i < ringSegments; i++) {
          const angle = (i / ringSegments) * Math.PI * 2;
          // Rings only visible from certain angles (not edge-on)
          const ringAngle = Math.PI * 0.25; // Tilt angle
          const ry = Math.sin(ringAngle);

          const rx = centerX + Math.cos(angle) * r;
          const ry_pos = centerY + Math.sin(angle) * r * ry;

          // Don't draw rings behind planet
          const distFromCenter = Math.sqrt(Math.pow(rx - centerX, 2) + Math.pow(ry_pos - centerY, 2));
          if (distFromCenter < radius * 1.05) continue;

          ctx.fillStyle = `rgba(${ringColor.r}, ${ringColor.g}, ${ringColor.b}, ${ringAlpha})`;
          ctx.fillRect(offsetX + Math.floor(rx / pixelSize) * pixelSize,
                       Math.floor(ry_pos / pixelSize) * pixelSize,
                       pixelSize, pixelSize);
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
  console.log('║   ULTRA-DETAILED GAS GIANT GENERATOR                     ║');
  console.log('║   - 32 FRAMES for smooth fast rotation                  ║');
  console.log('║   - COMPLEX ATMOSPHERIC BANDS                            ║');
  console.log('║   - Great Spots, Storms, Jet Streams                    ║');
  console.log('║   - Polar Features, Lightning                           ║');
  console.log('║   - Ring Systems                                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('=== Generating Ultra-Detailed Gas Giants ===');
  for (let i = 0; i < CONFIG.gasGiantTypes.length; i++) {
    const gasGiantType = CONFIG.gasGiantTypes[i];
    const result = generateUltraDetailedGasGiant(gasGiantType, i);
    const filename = `gas_giant_${gasGiantType}_000.png`;
    const buffer = result.canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
    console.log(`  ✓ Saved ${filename}`);
  }
  console.log(`\n✓ Generated ${CONFIG.gasGiantTypes.length} ultra-detailed gas giant sprites\n`);

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   GENERATION COMPLETE!                                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
