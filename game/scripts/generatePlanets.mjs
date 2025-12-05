#!/usr/bin/env node
/**
 * ULTRA-DETAILED PLANET SPRITE GENERATOR
 *
 * Generates highly detailed planet sprites with:
 * - 32 frames for smooth rotation animation
 * - Heavily pixelated surfaces with complex features
 * - Rivers, seas, oceans, lakes
 * - Craters of various sizes
 * - Mountains, mountain ranges, volcanoes
 * - Ice caps and glaciers
 * - Cities and settlements (lights)
 * - Atmospheric effects and clouds
 * - Diverse biomes and terrain types
 * - Detailed unique complex surface patterns
 */

import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites/planets');

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  frames: 32,
  planetSize: 800,
  pixelSize: 3,

  planetTypes: [
    'terran', 'rocky', 'desert', 'ice', 'frozen', 'tundra',
    'lava', 'volcanic', 'ocean', 'carbon', 'crystal', 'metal',
    'eyeball', 'tidally_locked', 'radioactive', 'super_earth', 'jungle',
    'toxic', 'barren', 'savanna', 'arctic', 'tropical', 'arid', 'swamp',
    'continental', 'island', 'pangaea', 'archipelago', 'canyon', 'mesa',
    'rift', 'shield', 'supervolcano', 'geothermal', 'primordial', 'dead',
    'storm', 'windy', 'fog', 'dust', 'ash', 'sulfur', 'methane', 'ammonia',
    'silicate', 'iron', 'nickel', 'diamond', 'graphite', 'ruby', 'sapphire',
    'emerald', 'quartz', 'obsidian', 'marble', 'granite', 'basalt',
    'sandstone', 'limestone', 'shale', 'slate', 'gneiss', 'schist'
  ]
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

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.floor(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function lerpColor(c1, c2, t) {
  return {
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t
  };
}

// ============================================================================
// PLANET COLOR PALETTES - EXPANDED
// ============================================================================
const PLANET_PALETTES = {
  terran: {
    deepOcean: ['#001a4d', '#00143d', '#000e2d'],
    ocean: ['#0047ab', '#003d99', '#002966'],
    shallowWater: ['#2080c0', '#1870b0', '#1060a0'],
    sand: ['#f4e4a0', '#e0d090', '#d0c080'],
    grass: ['#2d8659', '#3a9b6e', '#1d6b42'],
    forest: ['#1d5b32', '#2d6b42', '#0d4b22'],
    mountain: ['#8b7355', '#a08968', '#6b5944'],
    snowPeak: ['#f0f8ff', '#e0e8f0', '#d0d8e0'],
    ice: ['#e0f0ff', '#c0d8f0', '#a0c0e0'],
    cloud: ['#ffffff', '#f0f0f0', '#e0e0e0'],
    city: ['#ffcc00', '#ffaa00', '#ff8800']
  },
  ocean: {
    deepOcean: ['#000a2d', '#00061d', '#00020d'],
    ocean: ['#001a4d', '#00143d', '#000e2d'],
    shallowWater: ['#0047ab', '#003d99', '#002966'],
    ice: ['#c0e0ff', '#d0f0ff', '#e0f5ff'],
    island: ['#6a5a4a', '#5a4a3a', '#4a3a2a']
  },
  desert: {
    sand: ['#f4a460', '#daa520', '#cd853f'],
    darkSand: ['#c89050', '#b08040', '#987030'],
    rock: ['#a0522d', '#8b4513', '#6b3410'],
    crater: ['#5a3a1a', '#4a2a0a', '#3a1a00'],
    dune: ['#e0b080', '#d0a070', '#c09060']
  },
  ice: {
    ice: ['#e0f5ff', '#b0d5f5', '#90c5e5'],
    darkIce: ['#a0c5d5', '#80a5b5', '#608595'],
    crack: ['#7090a0', '#506070', '#304050'],
    deep: ['#d0e5f0', '#a0c5d5', '#80a5b5']
  },
  lava: {
    crust: ['#2a2a2a', '#1a1a1a', '#0a0a0a'],
    coolingLava: ['#aa3300', '#882200', '#661100'],
    lava: ['#ff4400', '#ff6600', '#ff8800'],
    brightLava: ['#ffaa00', '#ffcc00', '#ffee00'],
    ash: ['#4a4a4a', '#3a3a3a', '#2a2a2a']
  },
  volcanic: {
    rock: ['#3a2a1a', '#2a1a0a', '#1a0a00'],
    ash: ['#5a5a5a', '#4a4a4a', '#3a3a3a'],
    lava: ['#ff5500', '#ff7700', '#ff9900'],
    smoke: ['#6a6a6a', '#5a5a5a', '#4a4a4a']
  },
  rocky: {
    rock: ['#6a5a4a', '#5a4a3a', '#4a3a2a'],
    darkRock: ['#4a3a2a', '#3a2a1a', '#2a1a0a'],
    crater: ['#3a2a1a', '#2a1a0a', '#1a0a00'],
    dust: ['#8a7a6a', '#7a6a5a', '#6a5a4a'],
    iron: ['#aa7755', '#996644', '#885533']
  },
  jungle: {
    canopy: ['#0d4b22', '#1d5b32', '#0d3b12'],
    forest: ['#1d6b42', '#2d7b52', '#1d5b32'],
    clearing: ['#3a9b6e', '#4aab7e', '#3a8b5e'],
    river: ['#2080c0', '#1870b0', '#1060a0'],
    mountain: ['#5a6a4a', '#4a5a3a', '#3a4a2a']
  },
  toxic: {
    surface: ['#4a5a2a', '#3a4a1a', '#2a3a0a'],
    pool: ['#6a8a3a', '#5a7a2a', '#4a6a1a'],
    cloud: ['#8aaa5a', '#7a9a4a', '#6a8a3a'],
    waste: ['#5a6a3a', '#4a5a2a', '#3a4a1a']
  },
  frozen: {
    ice: ['#e0f0ff', '#c0d8f0', '#a0c0e0'],
    darkIce: ['#90b0d0', '#7090b0', '#507090'],
    snow: ['#ffffff', '#f0f8ff', '#e0f0f8'],
    rock: ['#6a7a8a', '#5a6a7a', '#4a5a6a']
  },
  tundra: {
    snow: ['#f0f8ff', '#e0f0f8', '#d0e8f0'],
    ice: ['#c0d8f0', '#b0c8e0', '#a0b8d0'],
    rock: ['#6a7a8a', '#5a6a7a', '#4a5a6a'],
    moss: ['#4a5a4a', '#3a4a3a', '#2a3a2a']
  },
  savanna: {
    grass: ['#c0b060', '#b0a050', '#a09040'],
    dryGrass: ['#d0c080', '#c0b070', '#b0a060'],
    tree: ['#5a6a3a', '#4a5a2a', '#3a4a1a'],
    soil: ['#8a6a4a', '#7a5a3a', '#6a4a2a']
  },
  barren: {
    rock: ['#5a4a3a', '#4a3a2a', '#3a2a1a'],
    dust: ['#7a6a5a', '#6a5a4a', '#5a4a3a'],
    crater: ['#2a1a0a', '#1a0a00', '#0a0000']
  },
  carbon: {
    graphite: ['#2a2a2a', '#1a1a1a', '#0a0a0a'],
    diamond: ['#6a8a9a', '#5a7a8a', '#4a6a7a'],
    tar: ['#1a1a0a', '#0a0a00', '#000000']
  },
  crystal: {
    crystal: ['#a0d0ff', '#80b0e0', '#6090c0'],
    darkCrystal: ['#5070a0', '#405080', '#304060'],
    shine: ['#d0f0ff', '#c0e0f0', '#b0d0e0']
  },
  metal: {
    iron: ['#8a7a6a', '#7a6a5a', '#6a5a4a'],
    rust: ['#aa5533', '#994422', '#883311'],
    shine: ['#c0b0a0', '#b0a090', '#a09080']
  },
  arctic: {
    ice: ['#f0f8ff', '#e0f0ff', '#d0e8f8'],
    snow: ['#ffffff', '#f8fcff', '#f0f8ff'],
    rock: ['#8090a0', '#708090', '#607080']
  },
  tropical: {
    jungle: ['#0d4b22', '#1d5b32', '#2d6b42'],
    beach: ['#f4e4a0', '#e0d090', '#d0c080'],
    ocean: ['#0080c0', '#0070b0', '#0060a0']
  },
  arid: {
    sand: ['#e0b080', '#d0a070', '#c09060'],
    rock: ['#b08050', '#a07040', '#906030'],
    dune: ['#f0c090', '#e0b080', '#d0a070']
  },
  swamp: {
    mud: ['#4a5a3a', '#3a4a2a', '#2a3a1a'],
    water: ['#5a6a4a', '#4a5a3a', '#3a4a2a'],
    vegetation: ['#2d5b32', '#1d4b22', '#0d3b12']
  },
  continental: {
    land: ['#6a8a5a', '#5a7a4a', '#4a6a3a'],
    mountain: ['#8a7a6a', '#7a6a5a', '#6a5a4a'],
    ocean: ['#2080c0', '#1070b0', '#0060a0']
  },
  island: {
    sand: ['#f4e4a0', '#e0d090', '#d0c080'],
    vegetation: ['#3a9b6e', '#2a8b5e', '#1a7b4e'],
    ocean: ['#0080c0', '#0070b0', '#0060a0']
  },
  pangaea: {
    central: ['#5a7a4a', '#4a6a3a', '#3a5a2a'],
    coast: ['#6a8a5a', '#5a7a4a', '#4a6a3a'],
    ocean: ['#1080c0', '#0070b0', '#0060a0']
  },
  archipelago: {
    island: ['#6a8a5a', '#5a7a4a', '#4a6a3a'],
    water: ['#2080c0', '#1870b0', '#1060a0'],
    reef: ['#4090d0', '#3080c0', '#2070b0']
  },
  canyon: {
    rim: ['#d0a070', '#c09060', '#b08050'],
    wall: ['#b08050', '#a07040', '#906030'],
    floor: ['#906030', '#805020', '#704010']
  },
  mesa: {
    top: ['#e0b080', '#d0a070', '#c09060'],
    cliff: ['#c09060', '#b08050', '#a07040'],
    desert: ['#d0a070', '#c09060', '#b08050']
  },
  rift: {
    valley: ['#5a6a4a', '#4a5a3a', '#3a4a2a'],
    wall: ['#7a6a5a', '#6a5a4a', '#5a4a3a'],
    lava: ['#ff6600', '#ff5500', '#ff4400']
  },
  shield: {
    lava: ['#4a3a2a', '#3a2a1a', '#2a1a0a'],
    flow: ['#6a5a4a', '#5a4a3a', '#4a3a2a'],
    vent: ['#ff5500', '#ff4400', '#ff3300']
  },
  supervolcano: {
    caldera: ['#3a2a1a', '#2a1a0a', '#1a0a00'],
    lava: ['#ff4400', '#ff5500', '#ff6600'],
    ash: ['#5a5a5a', '#4a4a4a', '#3a3a3a']
  },
  geothermal: {
    hot: ['#ff8844', '#ff7733', '#ff6622'],
    warm: ['#dd6633', '#cc5522', '#bb4411'],
    steam: ['#e0e0e0', '#d0d0d0', '#c0c0c0']
  },
  primordial: {
    proto: ['#8a6a4a', '#7a5a3a', '#6a4a2a'],
    molten: ['#ff6600', '#ff5500', '#ff4400'],
    forming: ['#a07a5a', '#906a4a', '#805a3a']
  },
  dead: {
    surface: ['#4a4a4a', '#3a3a3a', '#2a2a2a'],
    crater: ['#2a2a2a', '#1a1a1a', '#0a0a0a'],
    dust: ['#5a5a5a', '#4a4a4a', '#3a3a3a']
  },
  storm: {
    cloud: ['#8090a0', '#708090', '#607080'],
    dark: ['#506070', '#405060', '#304050'],
    lightning: ['#d0e0f0', '#c0d0e0', '#b0c0d0']
  },
  windy: {
    sand: ['#d0b080', '#c0a070', '#b09060'],
    dune: ['#e0c090', '#d0b080', '#c0a070'],
    dust: ['#b09060', '#a08050', '#907040']
  },
  fog: {
    mist: ['#d0d8e0', '#c0c8d0', '#b0b8c0'],
    surface: ['#8090a0', '#708090', '#607080'],
    dense: ['#a0b0c0', '#90a0b0', '#8090a0']
  },
  dust: {
    fine: ['#c0a080', '#b09070', '#a08060'],
    coarse: ['#a08060', '#907050', '#806040'],
    settled: ['#907050', '#806040', '#705030']
  },
  ash: {
    light: ['#b0b0b0', '#a0a0a0', '#909090'],
    dark: ['#606060', '#505050', '#404040'],
    volcanic: ['#707070', '#606060', '#505050']
  },
  sulfur: {
    yellow: ['#ffff00', '#eeee00', '#dddd00'],
    orange: ['#ffaa00', '#ff9900', '#ff8800'],
    deposit: ['#cccc00', '#bbbb00', '#aaaa00']
  },
  methane: {
    ice: ['#c0e0ff', '#b0d0f0', '#a0c0e0'],
    liquid: ['#8090ff', '#7080ee', '#6070dd'],
    atmosphere: ['#90a0ff', '#8090ee', '#7080dd']
  },
  ammonia: {
    ice: ['#e0f0ff', '#d0e0f0', '#c0d0e0'],
    clouds: ['#b0c0d0', '#a0b0c0', '#90a0b0'],
    surface: ['#c0d0e0', '#b0c0d0', '#a0b0c0']
  },
  silicate: {
    rock: ['#8a7a6a', '#7a6a5a', '#6a5a4a'],
    mineral: ['#a09080', '#908070', '#807060'],
    crystal: ['#b0a090', '#a09080', '#908070']
  },
  iron: {
    surface: ['#8a6a5a', '#7a5a4a', '#6a4a3a'],
    oxide: ['#aa5533', '#995544', '#884433'],
    pure: ['#9a8a7a', '#8a7a6a', '#7a6a5a']
  },
  nickel: {
    surface: ['#b0a090', '#a09080', '#908070'],
    alloy: ['#c0b0a0', '#b0a090', '#a09080'],
    deposit: ['#a09080', '#908070', '#807060']
  },
  diamond: {
    crystal: ['#f0f8ff', '#e0f0ff', '#d0e8f8'],
    shine: ['#ffffff', '#f0f8ff', '#e0f0ff'],
    facet: ['#d0e8f8', '#c0d8e8', '#b0c8d8']
  },
  graphite: {
    layer: ['#3a3a3a', '#2a2a2a', '#1a1a1a'],
    surface: ['#4a4a4a', '#3a3a3a', '#2a2a2a'],
    deposit: ['#2a2a2a', '#1a1a1a', '#0a0a0a']
  },
  ruby: {
    red: ['#ff0044', '#ee0033', '#dd0022'],
    dark: ['#aa0022', '#990011', '#880000'],
    shine: ['#ff4466', '#ff3355', '#ff2244']
  },
  sapphire: {
    blue: ['#0044ff', '#0033ee', '#0022dd'],
    dark: ['#0022aa', '#001199', '#000088'],
    shine: ['#4466ff', '#3355ff', '#2244ff']
  },
  emerald: {
    green: ['#00ff44', '#00ee33', '#00dd22'],
    dark: ['#00aa22', '#009911', '#008800'],
    shine: ['#44ff66', '#33ff55', '#22ff44']
  },
  quartz: {
    clear: ['#f0f0f0', '#e0e0e0', '#d0d0d0'],
    milky: ['#e0e0e0', '#d0d0d0', '#c0c0c0'],
    crystal: ['#ffffff', '#f0f0f0', '#e0e0e0']
  },
  obsidian: {
    black: ['#1a1a1a', '#0a0a0a', '#000000'],
    glassy: ['#2a2a2a', '#1a1a1a', '#0a0a0a'],
    shine: ['#3a3a3a', '#2a2a2a', '#1a1a1a']
  },
  marble: {
    white: ['#f0f0f0', '#e0e0e0', '#d0d0d0'],
    vein: ['#d0d0d0', '#c0c0c0', '#b0b0b0'],
    surface: ['#e0e0e0', '#d0d0d0', '#c0c0c0']
  },
  granite: {
    speckled: ['#c0b0a0', '#b0a090', '#a09080'],
    dark: ['#8a7a6a', '#7a6a5a', '#6a5a4a'],
    light: ['#d0c0b0', '#c0b0a0', '#b0a090']
  },
  basalt: {
    dark: ['#4a4a4a', '#3a3a3a', '#2a2a2a'],
    columnar: ['#5a5a5a', '#4a4a4a', '#3a3a3a'],
    flow: ['#3a3a3a', '#2a2a2a', '#1a1a1a']
  },
  sandstone: {
    red: ['#d08060', '#c07050', '#b06040'],
    tan: ['#d0b090', '#c0a080', '#b09070'],
    layered: ['#c09060', '#b08050', '#a07040']
  },
  limestone: {
    white: ['#e0d0c0', '#d0c0b0', '#c0b0a0'],
    cream: ['#f0e0d0', '#e0d0c0', '#d0c0b0'],
    weathered: ['#d0c0b0', '#c0b0a0', '#b0a090']
  },
  shale: {
    layered: ['#7a6a5a', '#6a5a4a', '#5a4a3a'],
    dark: ['#5a4a3a', '#4a3a2a', '#3a2a1a'],
    split: ['#6a5a4a', '#5a4a3a', '#4a3a2a']
  },
  slate: {
    gray: ['#7a7a7a', '#6a6a6a', '#5a5a5a'],
    blue: ['#6a7a8a', '#5a6a7a', '#4a5a6a'],
    split: ['#6a6a6a', '#5a5a5a', '#4a4a4a']
  },
  gneiss: {
    banded: ['#9a8a7a', '#8a7a6a', '#7a6a5a'],
    light: ['#b0a090', '#a09080', '#908070'],
    dark: ['#7a6a5a', '#6a5a4a', '#5a4a3a']
  },
  schist: {
    shiny: ['#8a8a8a', '#7a7a7a', '#6a6a6a'],
    foliated: ['#7a7a7a', '#6a6a6a', '#5a5a5a'],
    mica: ['#9a9a9a', '#8a8a8a', '#7a7a7a']
  }
};

// ============================================================================
// ULTRA-DETAILED PLANET GENERATOR
// ============================================================================
function generateUltraDetailedPlanet(planetType, index) {
  const size = CONFIG.planetSize;
  const frames = CONFIG.frames;
  const pixelSize = CONFIG.pixelSize;

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

    // Create height map for the entire planet
    const heightMap = [];

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

        // === COMPLEX SURFACE FEATURES ===

        // 1. CONTINENTS - Large land masses
        const continents = noise.fbm(worldX * 0.25, worldY * 0.25, worldZ * 0.25, 6);

        // 2. MOUNTAIN RANGES - Ridged noise for sharp peaks
        const mountains = noise.ridged(worldX * 0.8, worldY * 0.8, worldZ * 0.8, 7);

        // 3. VALLEYS AND CANYONS - Inverse ridged
        const valleys = 1 - noise.ridged(worldX * 1.0, worldY * 1.0, worldZ * 1.0, 6);

        // 4. MICRO DETAIL - Small surface texture
        const microDetail = noise.fbm(worldX * 3.5, worldY * 3.5, worldZ * 3.5, 8);

        // 5. CRATERS - Multiple scales
        const largeCraters = noise.fbm(worldX * 1.8, worldY * 1.8, worldZ * 1.8, 5);
        const smallCraters = noise.fbm(worldX * 4.5, worldY * 4.5, worldZ * 4.5, 6);
        const hasCrater = largeCraters < -0.55 || smallCraters < -0.65;
        const craterDepth = hasCrater ?
          (largeCraters < -0.55 ? Math.pow((-0.55 - largeCraters) * 3, 2) :
           Math.pow((-0.65 - smallCraters) * 2.5, 2)) : 0;

        // 6. RIVERS AND WATER SYSTEMS
        const waterNoise = noise.fbm(worldX * 0.45, worldY * 0.45, worldZ * 0.45, 7);
        const riverNoise = noise.fbm(worldX * 2.2, worldY * 2.2, worldZ * 2.2, 6);

        // 7. VOLCANOES - Hot spots with elevation
        const volcanoNoise = noise.fbm(worldX * 1.5 + 1000, worldY * 1.5 + 1000, worldZ * 1.5 + 1000, 5);
        const hasVolcano = volcanoNoise > 0.65 && (planetType === 'volcanic' || planetType === 'lava');
        const volcanoHeight = hasVolcano ? Math.pow((volcanoNoise - 0.65) * 2.857, 1.5) : 0;

        // 8. ICE CAPS - Polar regions
        const polarDistance = Math.abs(ny); // Distance from equator
        const hasIceCap = polarDistance > 0.7 && (planetType === 'terran' || planetType === 'ice' || planetType === 'frozen' || planetType === 'tundra');
        const iceCapStrength = hasIceCap ? Math.pow((polarDistance - 0.7) / 0.3, 2) : 0;

        // 9. CITIES - Artificial light clusters (for terran/super_earth)
        const cityNoise = noise.fbm(worldX * 5.0 + 500, worldY * 5.0 + 500, worldZ * 5.0 + 500, 4);
        const hasCity = cityNoise > 0.72 && continents > 0.0 && (planetType === 'terran' || planetType === 'super_earth') && !hasIceCap;

        // 10. CLOUDS - Atmospheric layer
        const cloudNoise = noise.fbm(worldX * 1.8 + rotationPhase * 2, worldY * 1.8, worldZ * 1.8, 7);
        const hasClouds = cloudNoise > 0.45 && (planetType === 'terran' || planetType === 'ocean' || planetType === 'jungle' || planetType === 'toxic');

        // Calculate final elevation/height
        let elevation = continents * 0.4 + mountains * 0.3 + valleys * 0.15 + microDetail * 0.15;
        elevation += volcanoHeight * 0.5;
        elevation -= craterDepth * 0.6;

        // Store height and features for this pixel
        const pixelIndex = py * pixelWidth + px;
        heightMap[pixelIndex] = {
          elevation,
          continents,
          mountains,
          valleys,
          waterNoise,
          riverNoise,
          craterDepth,
          volcanoHeight,
          iceCapStrength,
          hasCity,
          hasClouds,
          cloudNoise,
          microDetail,
          z,
          normalizedDist,
          worldX,
          worldY,
          worldZ
        };
      }
    }

    // Render pixels with all surface features
    for (let py = 0; py < pixelHeight; py++) {
      for (let px = 0; px < pixelWidth; px++) {
        const x = px * pixelSize + pixelSize / 2;
        const y = py * pixelSize + pixelSize / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radius) continue;

        const pixelIndex = py * pixelWidth + px;
        const data = heightMap[pixelIndex];
        if (!data) continue;

        const { elevation, continents, mountains, waterNoise, riverNoise, craterDepth,
                volcanoHeight, iceCapStrength, hasCity, hasClouds, cloudNoise,
                microDetail, z, normalizedDist } = data;

        // === DETERMINE TERRAIN TYPE AND COLOR ===
        let terrainColor;

        // CLOUDS - Top layer (semi-transparent)
        if (hasClouds && cloudNoise > 0.5) {
          const cloudColors = palette.cloud || ['#ffffff', '#f0f0f0', '#e0e0e0'];
          const cloudIdx = Math.floor((cloudNoise - 0.5) / 0.5 * (cloudColors.length - 1));
          terrainColor = cloudColors[Math.min(cloudIdx, cloudColors.length - 1)];
        }
        // ICE CAPS
        else if (iceCapStrength > 0.3) {
          const iceColors = palette.ice || palette.snow || ['#e0f0ff', '#c0d8f0', '#a0c0e0'];
          const iceIdx = Math.floor(iceCapStrength * (iceColors.length - 1));
          terrainColor = iceColors[Math.min(iceIdx, iceColors.length - 1)];
        }
        // CITIES - Lights visible
        else if (hasCity) {
          const cityColors = palette.city || ['#ffcc00', '#ffaa00', '#ff8800'];
          terrainColor = cityColors[Math.floor(Math.random() * cityColors.length)];
        }
        // VOLCANOES - Active lava
        else if (volcanoHeight > 0.3) {
          const lavaColors = palette.lava || palette.brightLava || ['#ff4400', '#ff6600', '#ff8800'];
          const lavaIdx = Math.floor(volcanoHeight * (lavaColors.length - 1));
          terrainColor = lavaColors[Math.min(lavaIdx, lavaColors.length - 1)];
        }
        // CRATERS - Dark depressions
        else if (craterDepth > 0.2) {
          const craterColors = palette.crater || ['#2a2a2a', '#1a1a1a', '#0a0a0a'];
          const craterIdx = Math.floor(craterDepth * (craterColors.length - 1));
          terrainColor = craterColors[Math.min(craterIdx, craterColors.length - 1)];
        }
        // WATER - Oceans, seas, rivers, lakes
        else if (planetType === 'ocean' || planetType === 'terran' || planetType === 'jungle') {
          if (waterNoise < -0.1) {
            // Deep ocean
            const depth = (-0.1 - waterNoise) / 0.9;
            const oceanColors = palette.deepOcean || palette.ocean || ['#001a4d', '#00143d', '#000e2d'];
            const oceanIdx = Math.floor(depth * (oceanColors.length - 1));
            terrainColor = oceanColors[Math.min(oceanIdx, oceanColors.length - 1)];
          } else if (waterNoise < 0.0) {
            // Shallow water / coastal
            const shallowColors = palette.shallowWater || palette.ocean || ['#2080c0', '#1870b0', '#1060a0'];
            terrainColor = shallowColors[Math.floor(Math.random() * shallowColors.length)];
          } else if (riverNoise < -0.3 && continents < 0.3) {
            // Rivers
            const riverColors = palette.shallowWater || ['#2080c0', '#1870b0'];
            terrainColor = riverColors[Math.floor(Math.random() * riverColors.length)];
          } else if (continents < 0.0) {
            // Land near water / beaches
            const sandColors = palette.sand || ['#f4e4a0', '#e0d090', '#d0c080'];
            terrainColor = sandColors[Math.floor(Math.random() * sandColors.length)];
          } else if (mountains > 0.65) {
            // Mountain peaks
            const mountainColors = palette.mountain || palette.snowPeak || ['#8b7355', '#a08968', '#6b5944'];
            const mountainIdx = Math.floor((mountains - 0.65) / 0.35 * (mountainColors.length - 1));
            terrainColor = mountainColors[Math.min(mountainIdx, mountainColors.length - 1)];
          } else if (continents > 0.3) {
            // Forests / dense vegetation
            const forestColors = palette.forest || palette.canopy || palette.grass || ['#1d5b32', '#2d6b42', '#0d4b22'];
            terrainColor = forestColors[Math.floor((continents - 0.3) / 0.7 * (forestColors.length - 1))];
          } else {
            // Grasslands
            const grassColors = palette.grass || palette.clearing || ['#2d8659', '#3a9b6e', '#1d6b42'];
            terrainColor = grassColors[Math.floor(continents / 0.3 * (grassColors.length - 1))];
          }
        }
        // HIGH MOUNTAINS
        else if (mountains > 0.65) {
          const mountainColors = palette.mountain || palette.rock || ['#8b7355', '#a08968', '#6b5944'];
          const mountainIdx = Math.floor((mountains - 0.65) / 0.35 * (mountainColors.length - 1));
          terrainColor = mountainColors[Math.min(mountainIdx, mountainColors.length - 1)];
        }
        // BASE TERRAIN based on planet type
        else {
          const baseColors = Object.values(palette)[0];
          const terrainValue = (elevation + 1) / 2;
          const terrainIdx = Math.floor(terrainValue * (baseColors.length - 1));
          terrainColor = baseColors[Math.min(terrainIdx, baseColors.length - 1)];
        }

        // Add microdetail variation
        const variation = microDetail * 0.12;
        const rgb = hexToRgb(terrainColor);

        // 3D lighting (limb darkening) - enhanced
        const light = Math.pow(z, 0.45) * (1 - normalizedDist * 0.25);

        // Apply lighting and variation
        let r = Math.max(0, Math.min(255, (rgb.r + variation * 40) * light));
        let g = Math.max(0, Math.min(255, (rgb.g + variation * 40) * light));
        let b = Math.max(0, Math.min(255, (rgb.b + variation * 40) * light));

        ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        ctx.fillRect(offsetX + px * pixelSize, py * pixelSize, pixelSize, pixelSize);
      }
    }

    // === ATMOSPHERIC GLOW ===
    const hasAtmosphere = planetType === 'terran' || planetType === 'ocean' ||
                          planetType === 'jungle' || planetType === 'toxic' ||
                          planetType === 'ice' || planetType === 'frozen' ||
                          planetType === 'super_earth';

    if (hasAtmosphere) {
      const glowColor = planetType === 'toxic' ? '#8aaa5a' :
                       planetType === 'ice' || planetType === 'frozen' ? '#c0e0ff' :
                       '#4488ff';

      const glowRgb = hexToRgb(glowColor);
      const atmosphereSegments = 64;

      for (let i = 0; i < atmosphereSegments; i++) {
        const angle = (i / atmosphereSegments) * Math.PI * 2;
        const glowDist = radius * 1.08;
        const gx = centerX + Math.cos(angle) * glowDist;
        const gy = centerY + Math.sin(angle) * glowDist;

        ctx.fillStyle = `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0.35)`;
        ctx.fillRect(offsetX + Math.floor(gx / pixelSize) * pixelSize,
                     Math.floor(gy / pixelSize) * pixelSize,
                     pixelSize * 2, pixelSize * 2);
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
  console.log('║   ULTRA-DETAILED PLANET GENERATOR                        ║');
  console.log('║   - 32 FRAMES for smooth rotation                       ║');
  console.log('║   - COMPLEX SURFACE FEATURES                            ║');
  console.log('║   - Rivers, Seas, Craters, Mountains, Volcanoes         ║');
  console.log('║   - Cities, Ice Caps, Clouds                            ║');
  console.log('║   - Heavily Pixelated Surfaces                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('=== Generating Ultra-Detailed Planets ===');

  // Allow filtering by environment variable
  let typesToGenerate = CONFIG.planetTypes;
  if (process.env.PLANET_TYPES) {
    typesToGenerate = process.env.PLANET_TYPES.split(',');
    console.log(`Generating specific types: ${typesToGenerate.join(', ')}`);
  }

  for (const planetType of typesToGenerate) {
    const result = generateUltraDetailedPlanet(planetType, 0);
    const filename = `planet_${planetType}_000.png`;
    const buffer = result.canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
    console.log(`  ✓ Saved ${filename}`);
  }
  console.log(`\n✓ Generated ${typesToGenerate.length} ultra-detailed planet sprites\n`);

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   GENERATION COMPLETE!                                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
