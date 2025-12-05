/**
 * SpriteFileLoader - Loads pre-generated sprite PNG files
 *
 * This replaces runtime sprite generation with instant loading from disk.
 * Sprites are pre-generated once and saved as PNG files in /public/sprites/
 */

export class SpriteFileLoader {
  constructor() {
    this.manifest = null;
    this.loadedSprites = new Map();
    this.basePath = '/sprites/';
    this.loading = new Set();

    // MEMORY OPTIMIZATION: Track cache size for larger sprites
    // Stars: 1000x1000x24 frames = ~24MB each
    // Planets: 600x600x24 frames = ~8.6MB each
    this.maxCacheSize = 200; // Maximum number of sprites to keep in memory
    this.cacheAccessTime = new Map(); // Track last access time for LRU eviction

    console.log('[SpriteFileLoader] Initialized with memory optimization');
  }

  /**
   * Load sprite manifest
   */
  async loadManifest() {
    if (this.manifest) return this.manifest;

    try {
      const response = await fetch(this.basePath + 'manifest.json');
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.statusText}`);
      }

      this.manifest = await response.json();
      console.log('[SpriteFileLoader] Manifest loaded:', this.manifest.version);
      return this.manifest;
    } catch (error) {
      console.error('[SpriteFileLoader] Error loading manifest:', error);
      return null;
    }
  }

  /**
   * Evict least recently used sprites if cache is full
   */
  evictLRUSprites() {
    if (this.loadedSprites.size <= this.maxCacheSize) return;

    // Sort by access time (oldest first)
    const entries = Array.from(this.cacheAccessTime.entries())
      .sort((a, b) => a[1] - b[1]);

    // Remove oldest 20% of sprites
    const toRemove = Math.ceil(this.loadedSprites.size * 0.2);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      const path = entries[i][0];
      this.loadedSprites.delete(path);
      this.cacheAccessTime.delete(path);
    }

    console.log(`[SpriteFileLoader] Evicted ${toRemove} sprites from cache (${this.loadedSprites.size} remaining)`);
  }

  /**
   * Load sprite image from file
   */
  async loadSpriteImage(path) {
    // Check cache first
    if (this.loadedSprites.has(path)) {
      // Update access time for LRU
      this.cacheAccessTime.set(path, Date.now());
      return this.loadedSprites.get(path);
    }

    // Check if already loading
    if (this.loading.has(path)) {
      // Wait for existing load
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (this.loadedSprites.has(path)) {
            clearInterval(check);
            resolve(this.loadedSprites.get(path));
          }
        }, 50);
      });
    }

    this.loading.add(path);

    // Evict old sprites if cache is getting full
    this.evictLRUSprites();

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.loadedSprites.set(path, img);
        this.cacheAccessTime.set(path, Date.now());
        this.loading.delete(path);
        resolve(img);
      };

      img.onerror = () => {
        this.loading.delete(path);
        console.error(`[SpriteFileLoader] Failed to load sprite: ${path}`);
        reject(new Error(`Failed to load sprite: ${path}`));
      };

      img.src = this.basePath + path;
    });
  }

  /**
   * Load star sprite
   */
  async loadStarSprite(stellarClass) {
    if (!this.manifest) {
      await this.loadManifest();
    }

    if (!this.manifest || !this.manifest.sprites.stars[stellarClass]) {
      console.warn(`[SpriteFileLoader] No sprite file for star class: ${stellarClass}`);
      return null;
    }

    const spriteInfo = this.manifest.sprites.stars[stellarClass];

    try {
      const image = await this.loadSpriteImage(spriteInfo.file);

      // Calculate frame dimensions from sprite sheet
      const frameWidth = spriteInfo.width / spriteInfo.frames;
      const frameHeight = spriteInfo.height;

      return {
        image,
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        frameCount: spriteInfo.frames,
        cols: spriteInfo.frames,
        rows: 1
      };
    } catch (error) {
      console.error(`[SpriteFileLoader] Error loading star sprite ${stellarClass}:`, error);
      return null;
    }
  }

  /**
   * Load planet sprite
   */
  async loadPlanetSprite(type, index = 0) {
    if (!this.manifest) {
      await this.loadManifest();
    }

    const key = `${type}_${String(index).padStart(3, '0')}`;

    if (!this.manifest || !this.manifest.sprites.planets[key]) {
      console.warn(`[SpriteFileLoader] No sprite file for planet: ${key}`);
      return null;
    }

    const spriteInfo = this.manifest.sprites.planets[key];

    try {
      const image = await this.loadSpriteImage(spriteInfo.file);

      // Calculate frame dimensions from sprite sheet
      const frameWidth = spriteInfo.width / spriteInfo.frames;
      const frameHeight = spriteInfo.height;

      return {
        image,
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        frameCount: spriteInfo.frames,
        cols: spriteInfo.frames,
        rows: 1
      };
    } catch (error) {
      console.error(`[SpriteFileLoader] Error loading planet sprite ${key}:`, error);
      return null;
    }
  }

  /**
   * Load moon sprite
   */
  async loadMoonSprite(index = 0) {
    if (!this.manifest) {
      await this.loadManifest();
    }

    const key = String(index).padStart(3, '0');

    if (!this.manifest || !this.manifest.sprites.moons[key]) {
      console.warn(`[SpriteFileLoader] No sprite file for moon: ${key}`);
      return null;
    }

    const spriteInfo = this.manifest.sprites.moons[key];

    try {
      const image = await this.loadSpriteImage(spriteInfo.file);

      return {
        image,
        frameWidth: spriteInfo.width / spriteInfo.frames,
        frameHeight: spriteInfo.height,
        frameCount: spriteInfo.frames,
        cols: spriteInfo.frames,
        rows: 1
      };
    } catch (error) {
      console.error(`[SpriteFileLoader] Error loading moon sprite ${key}:`, error);
      return null;
    }
  }

  /**
   * Load asteroid sprite
   */
  async loadAsteroidSprite(index = 0) {
    if (!this.manifest) {
      await this.loadManifest();
    }

    const key = String(index).padStart(3, '0');

    if (!this.manifest || !this.manifest.sprites.asteroids[key]) {
      console.warn(`[SpriteFileLoader] No sprite file for asteroid: ${key}`);
      return null;
    }

    const spriteInfo = this.manifest.sprites.asteroids[key];

    try {
      const image = await this.loadSpriteImage(spriteInfo.file);

      return {
        image,
        frameWidth: spriteInfo.width / spriteInfo.frames,
        frameHeight: spriteInfo.height,
        frameCount: spriteInfo.frames,
        cols: spriteInfo.frames,
        rows: 1
      };
    } catch (error) {
      console.error(`[SpriteFileLoader] Error loading asteroid sprite ${key}:`, error);
      return null;
    }
  }

  /**
   * Load gas giant sprite
   */
  async loadGasGiantSprite(type, index = 0) {
    if (!this.manifest) {
      await this.loadManifest();
    }

    const key = `${type}_${String(index).padStart(3, '0')}`;

    if (!this.manifest || !this.manifest.sprites.gas_giants[key]) {
      console.warn(`[SpriteFileLoader] No sprite file for gas giant: ${key}`);
      return null;
    }

    const spriteInfo = this.manifest.sprites.gas_giants[key];

    try {
      const image = await this.loadSpriteImage(spriteInfo.file);

      return {
        image,
        frameWidth: spriteInfo.width / spriteInfo.frames,
        frameHeight: spriteInfo.height,
        frameCount: spriteInfo.frames,
        cols: spriteInfo.frames,
        rows: 1
      };
    } catch (error) {
      console.error(`[SpriteFileLoader] Error loading gas giant sprite ${key}:`, error);
      return null;
    }
  }

  /**
   * Load black hole sprite
   */
  async loadBlackHoleSprite(type, index = 0) {
    if (!this.manifest) {
      await this.loadManifest();
    }

    const key = `${type}_${String(index).padStart(3, '0')}`;

    if (!this.manifest || !this.manifest.sprites.black_holes[key]) {
      console.warn(`[SpriteFileLoader] No sprite file for black hole: ${key}`);
      return null;
    }

    const spriteInfo = this.manifest.sprites.black_holes[key];

    try {
      const image = await this.loadSpriteImage(spriteInfo.file);

      return {
        image,
        frameWidth: spriteInfo.width / spriteInfo.frames,
        frameHeight: spriteInfo.height,
        frameCount: spriteInfo.frames,
        cols: spriteInfo.frames,
        rows: 1
      };
    } catch (error) {
      console.error(`[SpriteFileLoader] Error loading black hole sprite ${key}:`, error);
      return null;
    }
  }

  /**
   * Check if sprites are available
   */
  async hasSprites() {
    try {
      await this.loadManifest();
      return this.manifest !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get stats
   */
  getStats() {
    if (!this.manifest) {
      return { loaded: false };
    }

    return {
      loaded: true,
      version: this.manifest.version,
      loadedImages: this.loadedSprites.size,
      stars: Object.keys(this.manifest.sprites.stars || {}).length,
      planets: Object.keys(this.manifest.sprites.planets || {}).length,
      moons: Object.keys(this.manifest.sprites.moons || {}).length,
      asteroids: Object.keys(this.manifest.sprites.asteroids || {}).length,
      gas_giants: Object.keys(this.manifest.sprites.gas_giants || {}).length,
      black_holes: Object.keys(this.manifest.sprites.black_holes || {}).length
    };
  }
}
