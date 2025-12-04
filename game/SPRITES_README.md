# Pixelversum Sprite System

## Overview
All celestial body sprites are **pre-generated PNG files** stored in `/public/sprites/`. No runtime generation occurs - sprites load instantly from disk.

## Sprite Specifications

### Stars (15 total)
- **Resolution**: 1000×1000px per frame ⬆️ INCREASED
- **Animation**: 24 frames (horizontal sprite sheet: 24,000×1000px) ⬆️ INCREASED
- **File Size**: ~30MB per star sprite (~450MB total)
- **Classes**: O, B, A, F, G, K, M, BrownDwarf, WhiteDwarf, NeutronStar, Pulsar, RedGiant, BlueGiant, RedSuperGiant, BlueSuperGiant
- **Features**: Glowing coronas extending 3.5× radius, CMEs, granulation, sunspots, limb darkening, magnetic fields
- **Detail Level**: Ultra-high resolution with 8-12 octave Perlin noise

### Planets (1,600 total)
- **Resolution**: 600×600px per frame ⬆️ INCREASED
- **Animation**: 24 frames (horizontal sprite sheet: 14,400×600px) ⬆️ INCREASED
- **File Size**: ~12MB per planet sprite (~19GB total)
- **Types**: 20 types × 80 unique variants each
- **Types**: terran, rocky, desert, ice, frozen, lava, volcanic, ocean, carbon, crystal, metal, eyeball, tidally_locked, radioactive, super_earth, jungle, chthonian, iron_core, hycean, coreless
- **Features**:
  - Rivers flowing from highlands to oceans (8 octave FBM)
  - Lakes in localized low areas (5 octave noise)
  - Seas and oceans with depth variation
  - Mountain ranges using 9-octave ridged noise
  - Canyons using 7-octave inverted ridged noise
  - Volcanoes with lava flows
  - Glaciers and ice caps with crevasses
  - Desert dunes with wind patterns
  - Cloud systems with 8-octave turbulence
  - City lights on terran planet night sides
  - Atmospheric glow on habitable planets
  - 6+ color variations per terrain type
- **Detail Level**: Thousands of tiny pixels creating ultra-detailed geological features

### Moons (80 total)
- **Resolution**: 240×240px per frame ⬆️ INCREASED
- **Animation**: 16 frames (horizontal sprite sheet: 3,840×240px) ⬆️ INCREASED
- **File Size**: ~2MB per moon sprite (~160MB total)
- **Types**: rocky, icy, volcanic, captured_asteroid
- **Features**: Heavy cratering with multi-scale impacts, varied terrain types

### Asteroids (80 total)
- **Resolution**: 300×300px per frame ⬆️ INCREASED
- **Animation**: 12 frames (horizontal sprite sheet: 3,600×300px) ⬆️ INCREASED
- **File Size**: ~3MB per asteroid sprite (~240MB total)
- **Types**: rocky, metallic, carbonaceous, icy
- **Features**: Irregular shapes, surface boulders, impact craters, realistic rotation

## File Structure
```
/public/sprites/
├── manifest.json          # Sprite metadata (v3.0.0)
├── stars/                 # 15 star PNG files
├── planets/               # 1,600 planet PNG files
├── moons/                 # 80 moon PNG files
└── asteroids/             # 80 asteroid PNG files
```

## Generation
To regenerate all sprites (takes 45-90 minutes due to increased resolution):
```bash
npm run generate:sprites
```

This runs `/scripts/generateAllSprites.mjs` which creates all PNG files using Node.js canvas.

⚠️ **Note**: Generation creates ~20GB of sprite data. Ensure adequate disk space.

## Technical Details
- **Noise Algorithm**: Advanced Perlin noise with 8-12 octaves for ultra-high detail
- **Techniques**:
  - Fractal Brownian Motion (FBM) for base terrain
  - Domain warping for organic features
  - Ridged noise (9 octaves) for mountains
  - Inverted ridged (7 octaves) for canyons
  - Turbulence (8 octaves) for clouds
- **Lighting**: Phong shading for realistic 3D spherical appearance with proper highlights
- **Variety**: Seeded random generation ensures reproducible sprites
- **Loading**: Sprites load via SpriteFileLoader.js from manifest.json with LRU cache eviction
- **Memory Management**:
  - LRU cache with 200 sprite limit
  - Automatic eviction of least recently used sprites
  - Prevents memory issues with large sprite files

## Code Architecture
- `scripts/generateAllSprites.mjs` - Sprite generation script
- `src/engine/sprites/SpriteFileLoader.js` - Loads PNG sprites from disk
- `src/engine/sprites/CelestialSpriteGenerator.js` - High-level sprite management
- `src/engine/sprites/SpriteManager.js` - Rendering and caching
- `tools/generateManifest.mjs` - Creates manifest.json metadata

## Removed Files
All old runtime generation code has been removed:
- ❌ `EnhancedCelestialBodies.js` (old planet generation)
- ❌ `NewCelestialSpriteGenerator.js` (old runtime generation)
- ❌ `AdvancedCelestialSpriteLibrary.js` (old library system)
- ❌ `SpritePersistence.js` (old IndexedDB caching)
