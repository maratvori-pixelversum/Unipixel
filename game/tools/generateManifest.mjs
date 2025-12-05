#!/usr/bin/env node
/**
 * Generate manifest.json for sprites
 * UPDATED: Reads actual PNG dimensions for variable-sized sprites
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

/**
 * Read PNG dimensions from file
 */
async function getPNGDimensions(filePath) {
  try {
    const image = await loadImage(filePath);
    return { width: image.width, height: image.height };
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

const CONFIG = {
  spritesPerPlanetType: 3,
  spritesPerMoon: 80,
  spritesPerAsteroid: 200,  // Increased for more asteroid diversity
  spritesPerGasGiant: 20,
  spritesPerBlackHole: 10,
  spritesPerComet: 20,
  stellarClasses: ['O', 'B', 'A', 'F', 'G', 'K', 'M', 'BrownDwarf', 'WhiteDwarf', 'NeutronStar', 'Pulsar', 'RedGiant', 'BlueGiant', 'RedSuperGiant', 'BlueSuperGiant'],
  planetTypes: ['terran', 'rocky', 'desert', 'ice', 'frozen', 'tundra', 'lava', 'volcanic', 'ocean', 'carbon', 'crystal', 'metal', 'eyeball', 'tidally_locked', 'radioactive', 'super_earth', 'jungle'],
  gasGiantTypes: ['hot_jupiter', 'jovian_orange', 'jovian_tan', 'ice_giant_blue', 'ice_giant_teal', 'green_giant', 'purple_giant', 'storm_giant', 'ringed_giant'],
  blackHoleTypes: ['stellar', 'intermediate', 'supermassive', 'active_quasar', 'dormant']
};

async function generateManifest() {
  console.log('Generating manifest.json with actual PNG dimensions...');

  const manifest = {
    version: '4.0.0',
    generated: new Date().toISOString(),
    description: 'Ultra high-detail sprites with variable sizes and organic terrain features',
    sprites: {
      stars: {},
      planets: {},
      moons: {},
      asteroids: {},
      gas_giants: {},
      black_holes: {},
      comets: {}
    }
  };

  // STARS: Read actual dimensions and calculate frames
  console.log('Reading star sprite dimensions...');
  for (const stellarClass of CONFIG.stellarClasses) {
    const filePath = path.join(OUTPUT_DIR, 'stars', `star_${stellarClass}_000.png`);
    if (fs.existsSync(filePath)) {
      const dims = await getPNGDimensions(filePath);
      if (dims) {
        const frames = Math.round(dims.width / dims.height);
        manifest.sprites.stars[stellarClass] = {
          file: `stars/star_${stellarClass}_000.png`,
          frames: frames,
          width: dims.width,
          height: dims.height
        };
      }
    }
  }

  // PLANETS: Read actual dimensions and calculate frames
  console.log('Reading planet sprite dimensions...');
  for (const planetType of CONFIG.planetTypes) {
    for (let i = 0; i < CONFIG.spritesPerPlanetType; i++) {
      const key = `${planetType}_${String(i).padStart(3, '0')}`;
      const filePath = path.join(OUTPUT_DIR, 'planets', `planet_${planetType}_${String(i).padStart(3, '0')}.png`);
      if (fs.existsSync(filePath)) {
        const dims = await getPNGDimensions(filePath);
        if (dims) {
          const frames = Math.round(dims.width / dims.height);
          manifest.sprites.planets[key] = {
            file: `planets/planet_${planetType}_${String(i).padStart(3, '0')}.png`,
            frames: frames,
            width: dims.width,
            height: dims.height
          };
        }
      }
    }
  }

  // MOONS: Read actual dimensions and calculate frames
  console.log('Reading moon sprite dimensions...');
  for (let i = 0; i < CONFIG.spritesPerMoon; i++) {
    const filePath = path.join(OUTPUT_DIR, 'moons', `moon_${String(i).padStart(3, '0')}.png`);
    if (fs.existsSync(filePath)) {
      const dims = await getPNGDimensions(filePath);
      if (dims) {
        const frames = Math.round(dims.width / dims.height);
        manifest.sprites.moons[String(i).padStart(3, '0')] = {
          file: `moons/moon_${String(i).padStart(3, '0')}.png`,
          frames: frames,
          width: dims.width,
          height: dims.height
        };
      }
    }
  }

  // ASTEROIDS: Read actual dimensions and calculate frames
  console.log('Reading asteroid sprite dimensions...');
  for (let i = 0; i < CONFIG.spritesPerAsteroid; i++) {
    const filePath = path.join(OUTPUT_DIR, 'asteroids', `asteroid_${String(i).padStart(3, '0')}.png`);
    if (fs.existsSync(filePath)) {
      const dims = await getPNGDimensions(filePath);
      if (dims) {
        const frames = Math.round(dims.width / dims.height);
        manifest.sprites.asteroids[String(i).padStart(3, '0')] = {
          file: `asteroids/asteroid_${String(i).padStart(3, '0')}.png`,
          frames: frames,
          width: dims.width,
          height: dims.height
        };
      }
    }
  }

  // GAS GIANTS: Read actual dimensions and calculate frames
  console.log('Reading gas giant sprite dimensions...');
  for (const gasGiantType of CONFIG.gasGiantTypes) {
    for (let i = 0; i < CONFIG.spritesPerGasGiant; i++) {
      const key = `${gasGiantType}_${String(i).padStart(3, '0')}`;
      const filePath = path.join(OUTPUT_DIR, 'gas_giants', `gas_giant_${gasGiantType}_${String(i).padStart(3, '0')}.png`);
      if (fs.existsSync(filePath)) {
        const dims = await getPNGDimensions(filePath);
        if (dims) {
          const frames = Math.round(dims.width / dims.height);
          manifest.sprites.gas_giants[key] = {
            file: `gas_giants/gas_giant_${gasGiantType}_${String(i).padStart(3, '0')}.png`,
            frames: frames,
            width: dims.width,
            height: dims.height
          };
        }
      }
    }
  }

  // BLACK HOLES: Read actual dimensions and calculate frames
  console.log('Reading black hole sprite dimensions...');
  for (const blackHoleType of CONFIG.blackHoleTypes) {
    for (let i = 0; i < CONFIG.spritesPerBlackHole; i++) {
      const key = `${blackHoleType}_${String(i).padStart(3, '0')}`;
      const filePath = path.join(OUTPUT_DIR, 'black_holes', `black_hole_${blackHoleType}_${String(i).padStart(3, '0')}.png`);
      if (fs.existsSync(filePath)) {
        const dims = await getPNGDimensions(filePath);
        if (dims) {
          const frames = Math.round(dims.width / dims.height);
          manifest.sprites.black_holes[key] = {
            file: `black_holes/black_hole_${blackHoleType}_${String(i).padStart(3, '0')}.png`,
            frames: frames,
            width: dims.width,
            height: dims.height
          };
        }
      }
    }
  }

  // COMETS: Read actual dimensions and calculate frames
  console.log('Reading comet sprite dimensions...');
  for (let i = 0; i < CONFIG.spritesPerComet; i++) {
    const key = String(i).padStart(3, '0');
    const filePath = path.join(OUTPUT_DIR, 'comets', `comet_${String(i).padStart(3, '0')}.png`);
    if (fs.existsSync(filePath)) {
      const dims = await getPNGDimensions(filePath);
      if (dims) {
        const frames = Math.round(dims.width / dims.height);
        manifest.sprites.comets[key] = {
          file: `comets/comet_${String(i).padStart(3, '0')}.png`,
          frames: frames,
          width: dims.width,
          height: dims.height
        };
      }
    }
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('✓ manifest.json created with actual dimensions');
  console.log(`  Stars: ${Object.keys(manifest.sprites.stars).length}`);
  console.log(`  Planets: ${Object.keys(manifest.sprites.planets).length}`);
  console.log(`  Moons: ${Object.keys(manifest.sprites.moons).length}`);
  console.log(`  Asteroids: ${Object.keys(manifest.sprites.asteroids).length}`);
  console.log(`  Gas Giants: ${Object.keys(manifest.sprites.gas_giants).length}`);
  console.log(`  Black Holes: ${Object.keys(manifest.sprites.black_holes).length}`);
  console.log(`  Comets: ${Object.keys(manifest.sprites.comets).length}`);
}

// Run async
generateManifest().catch(console.error);
