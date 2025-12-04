/**
 * CelestialSpriteGenerator - File-based sprite loading system
 *
 * Loads pre-generated ultra-detailed celestial body sprites from PNG files
 * - 80 unique sprites per planet type
 * - All stellar classifications
 * - Ultra-realistic 3D appearance with Phong shading
 * - Heavily pixelated with thousands of tiny pixels
 * - Complex geological features and animated textures
 */

import { SpriteFileLoader } from './SpriteFileLoader.js';

export class CelestialSpriteGenerator {
  constructor() {
    this.spriteLoader = new SpriteFileLoader();
    this.spriteCache = new Map();
    // Alias for compatibility with SpriteRenderer
    this.spriteSheets = this.spriteCache;
    this.libraryLoaded = false;

    console.log('[CelestialSpriteGenerator] Initialized with file-based sprite loading');
  }

  /**
   * Load the sprite library (loads manifest from disk)
   * @param {Function} progressCallback - Optional callback(progress, stage) for tracking
   */
  async loadLibrary(progressCallback = null) {
    if (this.libraryLoaded) {
      console.log('[CelestialSpriteGenerator] Library already loaded');
      return true;
    }

    console.log('[CelestialSpriteGenerator] Loading sprite manifest...');

    if (progressCallback) {
      progressCallback(10, 'Loading sprite manifest');
    }

    const hasSprites = await this.spriteLoader.hasSprites();

    if (hasSprites) {
      this.libraryLoaded = true;
      const stats = this.spriteLoader.getStats();
      console.log('[CelestialSpriteGenerator] ✓ Sprite library loaded successfully');
      console.log('[CelestialSpriteGenerator] Library stats:', stats);

      if (progressCallback) {
        progressCallback(100, 'Sprite library ready');
      }

      return true;
    } else {
      console.error('[CelestialSpriteGenerator] Failed to load sprite library');

      if (progressCallback) {
        progressCallback(0, 'Failed to load sprites');
      }

      return false;
    }
  }

  /**
   * Check if library is loaded and ready
   */
  isLibraryReady() {
    return this.libraryLoaded;
  }

  /**
   * Configure library (compatibility method - no-op for file-based loading)
   */
  configureLibrary(options = {}) {
    console.log('[CelestialSpriteGenerator] Configuration options ignored (file-based loading)');
    return this;
  }

  /**
   * Generate star sprite by loading from file
   */
  async generateStarSprite(config) {
    const {
      stellarClass = 'G',
      radius = 256,
      seed = Math.random() * 10000
    } = config;

    const cacheKey = `star_${stellarClass}_${Math.floor(seed)}`;

    if (this.spriteCache.has(cacheKey)) {
      return this.spriteCache.get(cacheKey);
    }

    console.log(`[CelestialSpriteGenerator] Loading ${stellarClass} star sprite from file...`);

    try {
      const spriteData = await this.spriteLoader.loadStarSprite(stellarClass);

      if (!spriteData) {
        console.error(`[CelestialSpriteGenerator] Failed to load star sprite for class ${stellarClass}`);
        return null;
      }

      const result = {
        name: cacheKey,
        image: spriteData.image,
        width: spriteData.image.width,
        height: spriteData.image.height,
        frameWidth: spriteData.frameWidth,
        frameHeight: spriteData.frameHeight,
        cols: spriteData.cols,
        rows: spriteData.rows,
        frameCount: spriteData.frameCount,
        frames: []
      };

      // Create frame metadata
      for (let i = 0; i < spriteData.frameCount; i++) {
        const col = i % result.cols;
        const row = Math.floor(i / result.cols);
        result.frames.push({
          index: i,
          x: col * result.frameWidth,
          y: row * result.frameHeight,
          width: result.frameWidth,
          height: result.frameHeight
        });
      }

      this.spriteCache.set(cacheKey, result);
      console.log(`[CelestialSpriteGenerator] ✓ Star sprite loaded: ${cacheKey}`);

      return result;
    } catch (error) {
      console.error('[CelestialSpriteGenerator] Error loading star sprite:', error);
      return null;
    }
  }

  /**
   * Generate planet sprite by loading from file
   */
  async generatePlanetSprite(config) {
    const {
      type = 'terran',
      radius = 128,
      seed = Math.random() * 10000
    } = config;

    const cacheKey = `planet_${type}_${Math.floor(seed)}`;

    if (this.spriteCache.has(cacheKey)) {
      return this.spriteCache.get(cacheKey);
    }

    console.log(`[CelestialSpriteGenerator] Loading ${type} planet sprite from file...`);

    try {
      // Use seed to select which of the 80 variants to load
      const index = Math.floor(seed) % 80;
      const spriteData = await this.spriteLoader.loadPlanetSprite(type, index);

      if (!spriteData) {
        console.error(`[CelestialSpriteGenerator] Failed to load planet sprite for type ${type} index ${index}`);
        return null;
      }

      const result = {
        name: cacheKey,
        image: spriteData.image,
        width: spriteData.image.width,
        height: spriteData.image.height,
        frameWidth: spriteData.frameWidth,
        frameHeight: spriteData.frameHeight,
        cols: spriteData.cols,
        rows: spriteData.rows,
        frameCount: spriteData.frameCount,
        frames: []
      };

      // Create frame metadata
      for (let i = 0; i < spriteData.frameCount; i++) {
        const col = i % result.cols;
        const row = Math.floor(i / result.cols);
        result.frames.push({
          index: i,
          x: col * result.frameWidth,
          y: row * result.frameHeight,
          width: result.frameWidth,
          height: result.frameHeight
        });
      }

      this.spriteCache.set(cacheKey, result);
      console.log(`[CelestialSpriteGenerator] ✓ Planet sprite loaded: ${cacheKey}`);

      return result;
    } catch (error) {
      console.error('[CelestialSpriteGenerator] Error loading planet sprite:', error);
      return null;
    }
  }

  /**
   * Generate moon sprite by loading from file
   */
  async generateMoonSprite(config) {
    const {
      type = 'rocky',
      radius = 64,
      seed = Math.random() * 10000
    } = config;

    const cacheKey = `moon_${Math.floor(seed)}`;

    if (this.spriteCache.has(cacheKey)) {
      return this.spriteCache.get(cacheKey);
    }

    console.log(`[CelestialSpriteGenerator] Loading moon sprite from file...`);

    try {
      // Use seed to select which of the 80 variants to load
      const index = Math.floor(seed) % 80;
      const spriteData = await this.spriteLoader.loadMoonSprite(index);

      if (!spriteData) {
        console.error(`[CelestialSpriteGenerator] Failed to load moon sprite index ${index}`);
        return null;
      }

      const result = {
        name: cacheKey,
        image: spriteData.image,
        width: spriteData.image.width,
        height: spriteData.image.height,
        frameWidth: spriteData.frameWidth,
        frameHeight: spriteData.frameHeight,
        cols: spriteData.cols,
        rows: spriteData.rows,
        frameCount: spriteData.frameCount,
        frames: []
      };

      // Create frame metadata
      for (let i = 0; i < spriteData.frameCount; i++) {
        const col = i % result.cols;
        const row = Math.floor(i / result.cols);
        result.frames.push({
          index: i,
          x: col * result.frameWidth,
          y: row * result.frameHeight,
          width: result.frameWidth,
          height: result.frameHeight
        });
      }

      this.spriteCache.set(cacheKey, result);
      console.log(`[CelestialSpriteGenerator] ✓ Moon sprite loaded: ${cacheKey}`);

      return result;
    } catch (error) {
      console.error('[CelestialSpriteGenerator] Error loading moon sprite:', error);
      return null;
    }
  }

  /**
   * Generate asteroid sprite by loading from file
   */
  async generateAsteroidSprite(config) {
    const {
      size = 32,
      seed = Math.random() * 10000
    } = config;

    const cacheKey = `asteroid_${size}_${seed}`;

    if (this.spriteCache.has(cacheKey)) {
      return this.spriteCache.get(cacheKey);
    }

    console.log(`[CelestialSpriteGenerator] Loading asteroid sprite from file...`);

    try {
      // Use seed to select which of the 80 variants to load
      const index = Math.floor(seed) % 80;
      const spriteData = await this.spriteLoader.loadAsteroidSprite(index);

      if (!spriteData) {
        console.error(`[CelestialSpriteGenerator] Failed to load asteroid sprite index ${index}`);
        return null;
      }

      const result = {
        name: cacheKey,
        image: spriteData.image,
        width: spriteData.image.width,
        height: spriteData.image.height,
        frameWidth: spriteData.frameWidth,
        frameHeight: spriteData.frameHeight,
        cols: spriteData.cols,
        rows: spriteData.rows,
        frameCount: spriteData.frameCount,
        frames: []
      };

      // Create frame metadata
      for (let i = 0; i < spriteData.frameCount; i++) {
        const col = i % result.cols;
        const row = Math.floor(i / result.cols);
        result.frames.push({
          index: i,
          x: col * result.frameWidth,
          y: row * result.frameHeight,
          width: result.frameWidth,
          height: result.frameHeight
        });
      }

      this.spriteCache.set(cacheKey, result);
      console.log(`[CelestialSpriteGenerator] ✓ Asteroid sprite loaded: ${cacheKey}`);

      return result;
    } catch (error) {
      console.error('[CelestialSpriteGenerator] Error loading asteroid sprite:', error);
      return null;
    }
  }

  /**
   * Generate system sprites (star + planets + moons)
   */
  async generateSystemSprites(systemData) {
    console.log('[CelestialSpriteGenerator] Generating sprites for system:', systemData);

    const sprites = {
      star: null,
      planets: [],
      moons: []
    };

    // Generate star sprite
    if (systemData.star) {
      sprites.star = await this.generateStarSprite({
        stellarClass: systemData.star.stellarClass || 'G',
        radius: 256,
        seed: systemData.seed
      });
    }

    // Generate planet sprites
    if (systemData.planets) {
      for (let i = 0; i < systemData.planets.length; i++) {
        const planet = systemData.planets[i];

        // Map planet types to new system
        let planetType = planet.type || planet.planetType || 'rocky';

        // Convert old type names to new ones
        const typeMapping = {
          'terran_planet': 'terran',
          'rocky_planet': 'rocky',
          'desert_planet': 'desert',
          'ice_planet': 'ice',
          'gas_giant': 'terran',  // Fallback to terran for now
          'ice_giant': 'ice',
          'volcanic_planet': 'lava',
          'lava_planet': 'lava',
          'ocean_planet': 'ocean'
        };

        planetType = typeMapping[planetType] || planetType;

        const planetSprite = await this.generatePlanetSprite({
          type: planetType,
          radius: 96,
          seed: systemData.seed + i * 1000
        });

        sprites.planets.push({
          index: i,
          sprite: planetSprite,
          data: planet
        });

        // Generate moon sprites
        if (planet.moons) {
          for (let j = 0; j < planet.moons.length; j++) {
            const moon = planet.moons[j];
            const moonSprite = await this.generateMoonSprite({
              type: moon.type || moon.moonType || 'rocky',
              radius: 48,
              seed: systemData.seed + i * 1000 + j * 100
            });

            sprites.moons.push({
              planetIndex: i,
              moonIndex: j,
              sprite: moonSprite,
              data: moon
            });
          }
        }
      }
    }

    console.log('[CelestialSpriteGenerator] ✓ System sprites generated');

    return sprites;
  }

  /**
   * Get sprite sheet by name (compatibility method)
   */
  getSpriteSheet(name) {
    return this.spriteCache.get(name);
  }

  /**
   * Check if sprite sheet exists
   */
  hasSpriteSheet(name) {
    return this.spriteCache.has(name);
  }

  /**
   * Get frame by rotation angle
   */
  getFrameByRotation(sheetName, rotation) {
    const sheet = this.spriteCache.get(sheetName);
    if (!sheet || !sheet.frames) return null;

    // Normalize rotation to 0-2π
    const normalizedRotation = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // Calculate which frame corresponds to this rotation
    const frameIndex = Math.floor((normalizedRotation / (Math.PI * 2)) * sheet.frameCount);
    return sheet.frames[frameIndex % sheet.frameCount];
  }

  /**
   * Get frame by index
   */
  getFrame(sheetName, frameIndex) {
    const sheet = this.spriteCache.get(sheetName);
    if (!sheet || !sheet.frames) return null;

    return sheet.frames[frameIndex % sheet.frameCount];
  }

  /**
   * Get sprite sheet generator (compatibility method)
   */
  getSpriteSheetGenerator() {
    return this;
  }

  /**
   * Clear sprite cache
   */
  clearCache() {
    this.spriteCache.clear();
    console.log('[CelestialSpriteGenerator] Cache cleared');
  }
}
