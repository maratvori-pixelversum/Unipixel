#!/usr/bin/env node
/**
 * Combine manifests from subdirectories into main manifest.json
 * This is simpler and doesn't require the 'canvas' package
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SPRITES_DIR = path.join(__dirname, '../public/sprites');

async function combineManifests() {
  console.log('Combining manifests from subdirectories...');

  const manifest = {
    version: '4.0.0',
    generated: new Date().toISOString(),
    description: 'Combined sprite manifest from all subdirectories',
    sprites: {
      stars: {},
      planets: {},
      moons: {},
      asteroids: {}
    }
  };

  // Load stars manifest
  const starsManifestPath = path.join(SPRITES_DIR, 'stars', 'manifest.json');
  if (fs.existsSync(starsManifestPath)) {
    const starsManifest = JSON.parse(fs.readFileSync(starsManifestPath, 'utf8'));
    console.log(`Found ${Object.keys(starsManifest.sprites).length} stars in stars/manifest.json`);

    // Convert stars manifest format
    for (const [key, data] of Object.entries(starsManifest.sprites)) {
      manifest.sprites.stars[key] = {
        file: `stars/${data.file}`,
        frames: data.frameCount || 8,
        width: data.frameWidth * (data.frameCount || 8),
        height: data.frameHeight
      };
    }
  }

  // Scan planet files
  const planetsDir = path.join(SPRITES_DIR, 'planets');
  if (fs.existsSync(planetsDir)) {
    const planetFiles = fs.readdirSync(planetsDir).filter(f => f.endsWith('.png'));
    console.log(`Found ${planetFiles.length} planet sprite files`);

    for (const file of planetFiles) {
      // Extract type and index from filename: planet_terran_000.png
      const match = file.match(/planet_([a-z_]+)_(\d{3})\.png/);
      if (match) {
        const type = match[1];
        const index = match[2];
        const key = `${type}_${index}`;

        manifest.sprites.planets[key] = {
          file: `planets/${file}`,
          frames: 3, // Assuming 3 frames based on existing files
          width: 0, // Will be set by actual image dimensions
          height: 0
        };
      }
    }
  }

  // Scan moon files
  const moonsDir = path.join(SPRITES_DIR, 'moons');
  if (fs.existsSync(moonsDir)) {
    const moonFiles = fs.readdirSync(moonsDir).filter(f => f.endsWith('.png'));
    console.log(`Found ${moonFiles.length} moon sprite files`);

    for (const file of moonFiles) {
      const match = file.match(/moon_(\d{3})\.png/);
      if (match) {
        const index = match[1];
        manifest.sprites.moons[index] = {
          file: `moons/${file}`,
          frames: 3,
          width: 0,
          height: 0
        };
      }
    }
  }

  // Scan asteroid files
  const asteroidsDir = path.join(SPRITES_DIR, 'asteroids');
  if (fs.existsSync(asteroidsDir)) {
    const asteroidFiles = fs.readdirSync(asteroidsDir).filter(f => f.endsWith('.png'));
    console.log(`Found ${asteroidFiles.length} asteroid sprite files`);

    for (const file of asteroidFiles) {
      const match = file.match(/asteroid_(\d{3})\.png/);
      if (match) {
        const index = match[1];
        manifest.sprites.asteroids[index] = {
          file: `asteroids/${file}`,
          frames: 3,
          width: 0,
          height: 0
        };
      }
    }
  }

  // Write manifest
  fs.writeFileSync(
    path.join(SPRITES_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('✓ manifest.json created');
  console.log(`  Stars: ${Object.keys(manifest.sprites.stars).length}`);
  console.log(`  Planets: ${Object.keys(manifest.sprites.planets).length}`);
  console.log(`  Moons: ${Object.keys(manifest.sprites.moons).length}`);
  console.log(`  Asteroids: ${Object.keys(manifest.sprites.asteroids).length}`);
}

combineManifests().catch(console.error);
