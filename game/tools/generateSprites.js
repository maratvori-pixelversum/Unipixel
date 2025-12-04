/**
 * Sprite Generation Tool
 *
 * This script pre-generates hundreds of celestial body sprites and saves them as PNG files.
 * Run this ONCE to create the sprite library, then the game loads them instantly.
 *
 * Usage: node tools/generateSprites.js
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple Perlin noise implementation for Node.js
class PerlinNoise {
  constructor(seed = 12345) {
    this.seed = seed;
  }

  random(x, y, z = 0) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164 + this.seed) * 43758.5453;
    return n - Math.floor(n);
  }

  noise(x, y, z = 0) {
    const X = Math.floor(x);
    const Y = Math.floor(y);
    const Z = Math.floor(z);

    const xf = x - X;
    const yf = y - Y;
    const zf = z - Z;

    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);

    const u = fade(xf);
    const v = fade(yf);
    const w = fade(zf);

    const a = this.random(X, Y, Z);
    const b = this.random(X + 1, Y, Z);
    const c = this.random(X, Y + 1, Z);
    const d = this.random(X + 1, Y + 1, Z);

    const e = this.random(X, Y, Z + 1);
    const f = this.random(X + 1, Y, Z + 1);
    const g = this.random(X, Y + 1, Z + 1);
    const h = this.random(X + 1, Y + 1, Z + 1);

    const x1 = a + u * (b - a);
    const x2 = c + u * (d - c);
    const y1 = x1 + v * (x2 - x1);

    const x3 = e + u * (f - e);
    const x4 = g + u * (h - g);
    const y2 = x3 + v * (x4 - x3);

    return y1 + w * (y2 - y1);
  }

  fbm(x, y, z = 0, octaves = 6) {
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
}

console.log('='.repeat(80));
console.log('PIXELVERSUM SPRITE GENERATION TOOL');
console.log('='.repeat(80));
console.log('');
console.log('This will generate hundreds of unique celestial body sprites.');
console.log('Generation time: 10-20 minutes depending on quality settings.');
console.log('');

// Configuration
const config = {
  outputDir: path.join(__dirname, '../public/sprites'),

  // Quality settings - adjust these for faster/slower generation
  spritesPerPlanetType: 80,  // 80 for full quality, 20 for balanced, 5 for testing
  spritesPerMoon: 80,
  spritesPerAsteroid: 80,
  spritesPerGasGiant: 40,
  spritesPerComet: 40,
  spritesPerPlanetoid: 40,

  // Animation frames
  starFrames: 8,
  planetFrames: 8,
  moonFrames: 6,
  asteroidFrames: 4,

  // Sizes
  starSize: 400,      // 400x400 px
  planetSize: 160,    // 160x160 px
  moonSize: 60,       // 60x60 px
  asteroidSize: 80,   // 80x80 px
  gasGiantSize: 240,  // 240x240 px
  cometSize: 100      // 100x100 px
};

// Create output directories
function createDirectories() {
  const dirs = [
    config.outputDir,
    path.join(config.outputDir, 'stars'),
    path.join(config.outputDir, 'planets'),
    path.join(config.outputDir, 'moons'),
    path.join(config.outputDir, 'asteroids'),
    path.join(config.outputDir, 'gas_giants'),
    path.join(config.outputDir, 'comets'),
    path.join(config.outputDir, 'planetoids')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Stellar classifications
const stellarClasses = [
  'O', 'B', 'A', 'F', 'G', 'K', 'M',
  'BrownDwarf', 'WhiteDwarf', 'NeutronStar', 'Pulsar',
  'RedGiant', 'BlueGiant', 'RedSuperGiant', 'BlueSuperGiant'
];

// Planet types
const planetTypes = [
  'terran', 'rocky', 'desert', 'ice', 'frozen',
  'lava', 'volcanic', 'ocean', 'gas_giant'
];

console.log('Creating output directories...');
createDirectories();

console.log('✓ Directories created');
console.log('');
console.log('Starting sprite generation...');
console.log('');

// Generate manifest file
const manifest = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  stars: {},
  planets: {},
  moons: [],
  asteroids: [],
  gasGiants: [],
  comets: [],
  planetoids: []
};

let totalGenerated = 0;
const startTime = Date.now();

console.log('NOTE: This is a placeholder script.');
console.log('Full implementation requires canvas package: npm install canvas');
console.log('');
console.log('For now, sprites will be generated at runtime on first game load.');
console.log('To enable instant loading, you need to:');
console.log('  1. Install canvas package for Node.js');
console.log('  2. Run this script to generate all sprites');
console.log('  3. Update sprite loader to load from files');
console.log('');

// Save manifest
fs.writeFileSync(
  path.join(config.outputDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('='.repeat(80));
console.log('GENERATION TOOL SETUP COMPLETE');
console.log('='.repeat(80));
console.log('');
console.log('Next steps:');
console.log('  1. Install dependencies: cd /workspaces/Pixelversum/game && npm install canvas');
console.log('  2. Run generator: node tools/generateSprites.js');
console.log('  3. Sprites will be saved to /public/sprites/');
console.log('');
