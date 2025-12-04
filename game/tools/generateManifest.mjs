#!/usr/bin/env node
/**
 * Generate manifest.json for sprites
 * UPDATED: Reads actual PNG dimensions for variable-sized sprites
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

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
  spritesPerPlanetType: 80,
  spritesPerMoon: 80,
  spritesPerAsteroid: 80,
  stellarClasses: ['O', 'B', 'A', 'F', 'G', 'K', 'M', 'BrownDwarf', 'WhiteDwarf', 'NeutronStar', 'Pulsar', 'RedGiant', 'BlueGiant', 'RedSuperGiant', 'BlueSuperGiant'],
  planetTypes: ['terran', 'rocky', 'desert', 'ice', 'frozen', 'lava', 'volcanic', 'ocean', 'carbon', 'crystal', 'metal', 'eyeball', 'tidally_locked', 'radioactive', 'super_earth', 'jungle', 'chthonian', 'iron_core', 'hycean', 'coreless']
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
      asteroids: {}
    }
  };

  // STARS: Read actual dimensions (variable sizes, 24 frames)
  console.log('Reading star sprite dimensions...');
  for (const stellarClass of CONFIG.stellarClasses) {
    const filePath = path.join(OUTPUT_DIR, 'stars', `star_${stellarClass}.png`);
    if (fs.existsSync(filePath)) {
      const dims = await getPNGDimensions(filePath);
      if (dims) {
        manifest.sprites.stars[stellarClass] = {
          file: `stars/star_${stellarClass}.png`,
          frames: 24,
          width: dims.width,
          height: dims.height
        };
      }
    }
  }

  // PLANETS: Read actual dimensions (variable sizes, 24 frames)
  console.log('Reading planet sprite dimensions...');
  for (const planetType of CONFIG.planetTypes) {
    for (let i = 0; i < CONFIG.spritesPerPlanetType; i++) {
      const key = `${planetType}_${String(i).padStart(3, '0')}`;
      const filePath = path.join(OUTPUT_DIR, 'planets', `planet_${planetType}_${String(i).padStart(3, '0')}.png`);
      if (fs.existsSync(filePath)) {
        const dims = await getPNGDimensions(filePath);
        if (dims) {
          manifest.sprites.planets[key] = {
            file: `planets/planet_${planetType}_${String(i).padStart(3, '0')}.png`,
            frames: 24,
            width: dims.width,
            height: dims.height
          };
        }
      }
    }
  }

  // MOONS: Read actual dimensions (variable sizes, 16 frames)
  console.log('Reading moon sprite dimensions...');
  for (let i = 0; i < CONFIG.spritesPerMoon; i++) {
    const filePath = path.join(OUTPUT_DIR, 'moons', `moon_${String(i).padStart(3, '0')}.png`);
    if (fs.existsSync(filePath)) {
      const dims = await getPNGDimensions(filePath);
      if (dims) {
        manifest.sprites.moons[String(i).padStart(3, '0')] = {
          file: `moons/moon_${String(i).padStart(3, '0')}.png`,
          frames: 16,
          width: dims.width,
          height: dims.height
        };
      }
    }
  }

  // ASTEROIDS: Read actual dimensions (variable sizes, 12 frames)
  console.log('Reading asteroid sprite dimensions...');
  for (let i = 0; i < CONFIG.spritesPerAsteroid; i++) {
    const filePath = path.join(OUTPUT_DIR, 'asteroids', `asteroid_${String(i).padStart(3, '0')}.png`);
    if (fs.existsSync(filePath)) {
      const dims = await getPNGDimensions(filePath);
      if (dims) {
        manifest.sprites.asteroids[String(i).padStart(3, '0')] = {
          file: `asteroids/asteroid_${String(i).padStart(3, '0')}.png`,
          frames: 12,
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
}

// Run async
generateManifest().catch(console.error);
