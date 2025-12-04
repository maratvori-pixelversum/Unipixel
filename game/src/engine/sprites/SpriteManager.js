/**
 * SpriteManager - Main coordinator for sprite-based rendering system
 *
 * Manages all sprite generation, caching, and rendering:
 * - Pre-generates sprites for entire star systems
 * - Manages sprite caching and memory
 * - Provides simple API for game engine
 * - Coordinates all sprite generators
 *
 * Performance Benefits:
 * - 100x+ faster than pixel-by-pixel rendering
 * - Pre-generated sprites = zero CPU cost per frame
 * - Simple blit operations = minimal GPU overhead
 * - Expected: 120-144 FPS on modern hardware
 */

import { CelestialSpriteGenerator } from './CelestialSpriteGenerator.js';
import { ShipSpriteGenerator } from './ShipSpriteGenerator.js';
import { ObjectSpriteGenerator } from './ObjectSpriteGenerator.js';
import { SpriteRenderer } from './SpriteRenderer.js';

export class SpriteManager {
  constructor(game) {
    this.game = game;

    // Initialize all sprite generators
    this.celestialGen = new CelestialSpriteGenerator();
    this.shipGen = new ShipSpriteGenerator();
    this.objectGen = new ObjectSpriteGenerator();

    // Initialize sprite renderer
    this.renderer = new SpriteRenderer(game);

    // Connect renderer to sprite sheet generators
    this.renderer.spriteSheetGen = this.celestialGen;

    // Sprite cache (by entity ID)
    this.spriteCache = new Map();

    // Generation queue (async sprite generation)
    this.generationQueue = [];
    this.generating = false;

    // Sprite library state
    this.libraryLoaded = false;

    // Performance tracking
    this.stats = {
      spritesGenerated: 0,
      spritesRendered: 0,
      generationTime: 0
    };

    console.log('[SpriteManager] Initialized');
  }

  /**
   * Load sprite library (call once during game initialization)
   * This pre-generates hundreds of unique celestial body sprites
   *
   * @param {Object} options - Configuration options
   * @param {Boolean} options.fullQuality - Generate 80/40 sprites per type (takes longer)
   * @param {Boolean} options.lowQuality - Generate 5/3 sprites per type (faster)
   * @param {Function} progressCallback - Optional callback(progress, stage)
   */
  async loadSpriteLibrary(options = {}, progressCallback = null) {
    if (this.libraryLoaded) {
      console.log('[SpriteManager] Sprite library already loaded');
      return true;
    }

    console.log('[SpriteManager] ===== LOADING SPRITE LIBRARY =====');

    // Configure library quality
    if (options.fullQuality || options.lowQuality || Object.keys(options).length > 0) {
      this.celestialGen.configureLibrary(options);
    }

    // Load the library
    const success = await this.celestialGen.loadLibrary(progressCallback);

    if (success) {
      this.libraryLoaded = true;
      console.log('[SpriteManager] ===== SPRITE LIBRARY LOADED =====');
    } else {
      console.error('[SpriteManager] Failed to load sprite library');
    }

    return success;
  }

  /**
   * Pre-generate all sprites for current star system
   * This should be called when loading a new system
   * @param {Object} systemData - System data including star, planets, etc.
   * @param {Function} progressCallback - Optional callback(progress, stage) for tracking progress
   */
  async generateSystemSprites(systemData, progressCallback = null) {
    console.log('[SpriteManager] ==== GENERATING SYSTEM SPRITES ====');
    console.log(`[SpriteManager] System: ${systemData.name || 'Unknown'}, Seed: ${systemData.seed}`);

    // Validate system data
    if (!systemData || typeof systemData.seed === 'undefined') {
      console.error('[SpriteManager] Invalid system data provided');
      return false;
    }

    const startTime = performance.now();

    // Calculate total sprites to generate for progress tracking
    let totalSprites = 0;
    let completedSprites = 0;

    if (systemData.star) totalSprites++;
    if (systemData.planets) {
      totalSprites += systemData.planets.length;
      systemData.planets.forEach(p => {
        if (p.moons) totalSprites += p.moons.length;
      });
    }
    if (systemData.asteroids) totalSprites += systemData.asteroids.length;
    if (systemData.stations) totalSprites += systemData.stations.length;

    const updateProgress = (stage) => {
      const progress = totalSprites > 0 ? (completedSprites / totalSprites) * 100 : 0;
      if (progressCallback) {
        progressCallback(progress, stage);
      }
    };

    try {
      // Generate star sprite
      if (systemData.star) {
        updateProgress('Generating star sprite...');
        console.log('[SpriteManager] Generating star sprite...');

        // PERFORMANCE FIX: Use the actual star radius from the system data
        // Stars are HUGE: Red dwarf = 480px, Sun = 1200px, Giants = 3000-7200px
        const starRadius = systemData.star.radius || 1200;

        // CANVAS SIZE LIMIT: Larger sprites for better quality and detail
        // Stars need higher resolution to show surface features
        const MAX_SPRITE_RADIUS = 150;  // ENHANCED: Bigger sprites for more detail
        const spriteRadius = Math.min(starRadius, MAX_SPRITE_RADIUS);

        // PIXEL SIZE: Smaller pixels for heavy pixelation and detail
        // Matches concept art with many tiny pixels
        const BASE_PIXEL_SIZE = 2;  // ENHANCED: Tiny pixels for detailed, heavily pixelated look
        const scaleFactor = starRadius / spriteRadius;
        const adjustedPixelSize = Math.max(BASE_PIXEL_SIZE, Math.ceil(BASE_PIXEL_SIZE * scaleFactor * 0.4));  // Scale adjustment

        console.log(`[SpriteManager] Star radius: ${starRadius}px (sprite: ${spriteRadius}px), class: ${systemData.star.stellarClass || 'G'}, pixelSize: ${adjustedPixelSize}`);

        // FIXED: Normalize stellar class to base letter (M0 -> M, G2 -> G, etc.)
        // This ensures consistent sprite caching regardless of subclass
        const rawStellarClass = systemData.star.stellarClass || systemData.star.type || 'G';
        const normalizedStellarClass = this.normalizeStellarClass(rawStellarClass);

        // Star sprites have 8 frames for smooth but slow animation
        const starSprite = await this.celestialGen.generateStarSprite({
          stellarClass: normalizedStellarClass,
          radius: spriteRadius,  // Use capped sprite radius
          pixelSize: adjustedPixelSize,  // Adjust pixelation based on scale
          seed: systemData.seed,
          animationFrames: 8  // Matches generated sprite frame count
        });

        // Validate sprite was generated
        if (!starSprite || !starSprite.name || !starSprite.image) {
          console.error('[SpriteManager] Failed to generate star sprite - invalid sprite data');
          console.error('[SpriteManager] Star sprite generation failed! Game will use expensive procedural rendering.');
          console.error('[SpriteManager] Star data:', systemData.star);
          console.error('[SpriteManager] Invalid sprite:', starSprite);
        } else {
          // Cache star sprite - FIXED: Use normalized stellar class in ID to match generation
          const rawStellarClass = systemData.star.stellarClass || systemData.star.type || 'G';
          const stellarClass = this.normalizeStellarClass(rawStellarClass);
          const spriteId = `star_${stellarClass}_${systemData.seed}`;

          console.log(`[SpriteManager] Caching star sprite with ID: ${spriteId}`);
          console.log(`[SpriteManager] Star sprite details: name=${starSprite.name}, frames=${starSprite.frameCount}, image=${starSprite.image ? 'valid' : 'NULL'}`);

          // Verify sprite is in CelestialSpriteGenerator cache
          const spriteInGenCache = this.celestialGen.spriteCache.get(starSprite.name);
          if (!spriteInGenCache) {
            console.error(`[SpriteManager] CRITICAL: Star sprite not in CelestialSpriteGenerator cache! name=${starSprite.name}`);
            console.error(`[SpriteManager] Available in celestialGen cache:`, Array.from(this.celestialGen.spriteCache.keys()));
          } else {
            console.log(`[SpriteManager] ✓ Star sprite verified in CelestialSpriteGenerator cache`);
          }

          this.spriteCache.set(spriteId, {
            type: 'star',
            sprite: starSprite,
            data: systemData.star
          });

          this.stats.spritesGenerated++;
          console.log(`[SpriteManager] ✓ Star sprite cached successfully (ID: ${spriteId}, sheet: ${starSprite.name})`);
          console.log(`[SpriteManager] Cache now contains ${this.spriteCache.size} sprites`);
        }

        completedSprites++;
        updateProgress('Star sprite complete');
      }

      // Generate planet sprites
      if (systemData.planets) {
        for (let i = 0; i < systemData.planets.length; i++) {
          const planet = systemData.planets[i];

          updateProgress(`Generating planet ${i + 1}/${systemData.planets.length}...`);
          console.log(`[SpriteManager] Generating planet ${i + 1}/${systemData.planets.length} (${planet.type})...`);

          try {
            // Planet sprites have 24 frames for full rotation cycle
            const maxPlanetRadius = 60;  // ENHANCED: Bigger for more detail
            const planetSprite = await this.celestialGen.generatePlanetSprite({
              type: planet.type || 'terran',
              radius: Math.min(planet.radius || 50, maxPlanetRadius),
              pixelSize: 2,  // ENHANCED: Tiny pixels for detailed surfaces
              seed: systemData.seed + i * 1000,
              animationFrames: 24  // Matches generated sprite frame count
            });

            // Validate sprite was generated
            if (!planetSprite || !planetSprite.name) {
              console.error(`[SpriteManager] Failed to generate planet ${i + 1} sprite - invalid sprite data`);
              completedSprites++;
              continue;
            }

            // Cache planet sprite
            const planetId = `planet_${systemData.seed}_${i}`;
            this.spriteCache.set(planetId, {
              type: 'planet',
              sprite: planetSprite,
              data: planet,
              index: i
            });

            this.stats.spritesGenerated++;
            completedSprites++;
          } catch (error) {
            console.error(`[SpriteManager] Error generating planet ${i + 1} sprite:`, error.message);
            completedSprites++;
            continue;
          }

          // Generate moon sprites
          if (planet.moons && planet.moons.length > 0) {
            for (let j = 0; j < planet.moons.length; j++) {
              const moon = planet.moons[j];

              updateProgress(`Generating moon ${j + 1}/${planet.moons.length} for planet ${i + 1}...`);
              console.log(`[SpriteManager] Generating moon ${j + 1}/${planet.moons.length} for planet ${i + 1}...`);

              try {
                // ENHANCED: Bigger moons with detail
                const maxMoonRadius = 25;  // ENHANCED: More visible
                const moonSprite = await this.celestialGen.generateMoonSprite({
                  type: moon.type || 'rocky',
                  radius: Math.min(moon.radius || 20, maxMoonRadius),
                  pixelSize: 2,  // ENHANCED: Tiny pixels for surface detail
                  seed: systemData.seed + i * 1000 + j * 100
                });

                // Validate sprite was generated
                if (!moonSprite || !moonSprite.name) {
                  console.error(`[SpriteManager] Failed to generate moon ${j + 1} for planet ${i + 1} sprite - invalid sprite data`);
                  completedSprites++;
                  continue;
                }

                // Cache moon sprite
                const moonId = `moon_${systemData.seed}_${i}_${j}`;
                this.spriteCache.set(moonId, {
                  type: 'moon',
                  sprite: moonSprite,
                  data: moon,
                  planetIndex: i,
                  moonIndex: j
                });

                this.stats.spritesGenerated++;
                completedSprites++;
              } catch (error) {
                console.error(`[SpriteManager] Error generating moon ${j + 1} for planet ${i + 1} sprite:`, error.message);
                completedSprites++;
                continue;
              }
            }
          }
        }
      }

      // Generate asteroid sprites
      if (systemData.asteroids && systemData.asteroids.length > 0) {
        console.log(`[SpriteManager] Generating ${systemData.asteroids.length} asteroid sprites...`);
        for (let i = 0; i < systemData.asteroids.length; i++) {
          const asteroid = systemData.asteroids[i];
          const spriteId = `asteroid_${systemData.seed}_${i}`;

          updateProgress(`Generating asteroid ${i + 1}/${systemData.asteroids.length}...`);

          try {
            const asteroidSprite = await this.objectGen.generateAsteroidSprite({
              type: asteroid.type || 'rocky',
              radius: asteroid.radius || 20,
              pixelSize: 2,
              seed: systemData.seed + i * 500,
              irregularity: 0.3
            });

            if (asteroidSprite && asteroidSprite.name) {
              this.spriteCache.set(spriteId, {
                type: 'asteroid',
                sprite: asteroidSprite,
                data: asteroid,
                index: i
              });
              this.stats.spritesGenerated++;
            }
            completedSprites++;
          } catch (error) {
            console.error(`[SpriteManager] Error generating asteroid ${i + 1} sprite:`, error.message);
            completedSprites++;
          }
        }
      }

      // Generate station sprites
      if (systemData.stations && systemData.stations.length > 0) {
        console.log(`[SpriteManager] Generating ${systemData.stations.length} station sprites...`);
        for (let i = 0; i < systemData.stations.length; i++) {
          const station = systemData.stations[i];
          const spriteId = `station_${systemData.seed}_${i}`;

          updateProgress(`Generating station ${i + 1}/${systemData.stations.length}...`);

          try {
            const stationSprite = await this.objectGen.generateStationSprite({
              type: station.type || 'trading',
              size: station.size || 60,
              pixelSize: 2,
              seed: systemData.seed + i * 700,
              animationFrames: 2 // ULTRA-OPTIMIZED: Minimal frames for stations
            });

            if (stationSprite && stationSprite.name) {
              this.spriteCache.set(spriteId, {
                type: 'station',
                sprite: stationSprite,
                data: station,
                index: i
              });
              this.stats.spritesGenerated++;
            }
            completedSprites++;
          } catch (error) {
            console.error(`[SpriteManager] Error generating station ${i + 1} sprite:`, error.message);
            completedSprites++;
          }
        }
      }

      updateProgress('Sprite generation complete');

      const endTime = performance.now();
      this.stats.generationTime = endTime - startTime;

      console.log('[SpriteManager] ==== SPRITE GENERATION COMPLETE ====');
      console.log(`[SpriteManager] Generated ${this.stats.spritesGenerated} sprites in ${this.stats.generationTime.toFixed(2)}ms`);
      console.log(`[SpriteManager] Cache size: ${this.spriteCache.size} sprites`);

      return true;
    } catch (error) {
      console.error('[SpriteManager] Error generating system sprites:', error);
      return false;
    }
  }

  /**
   * Generate ship sprite (on-demand)
   */
  async generateShipSprite(config) {
    const {
      shipClass = 'fighter',
      palette = 'military',
      size = 40,
      seed = Math.random() * 10000
    } = config;

    const spriteId = `ship_${shipClass}_${palette}_${seed}`;

    // Check cache first
    if (this.spriteCache.has(spriteId)) {
      return this.spriteCache.get(spriteId).sprite;
    }

    // Generate new sprite
    const shipSprite = await this.shipGen.generateShipSprite({
      shipClass,
      palette,
      size,
      pixelSize: 1,
      seed
    });

    // Cache it
    this.spriteCache.set(spriteId, {
      type: 'ship',
      sprite: shipSprite,
      config
    });

    this.stats.spritesGenerated++;

    return shipSprite;
  }

  /**
   * Generate player ship sprite (special)
   */
  async generatePlayerShipSprite(config = {}) {
    const spriteId = 'player_ship';

    // Check cache
    if (this.spriteCache.has(spriteId)) {
      return this.spriteCache.get(spriteId).sprite;
    }

    console.log('[SpriteManager] Generating player ship sprite...');

    const playerSprite = await this.shipGen.generatePlayerShipSprite(config);

    this.spriteCache.set(spriteId, {
      type: 'player_ship',
      sprite: playerSprite,
      config
    });

    this.stats.spritesGenerated++;

    console.log('[SpriteManager] Player ship sprite generated');

    return playerSprite;
  }

  /**
   * Generate asteroid sprites (batch)
   */
  async generateAsteroidSprites(asteroids, systemSeed) {
    console.log(`[SpriteManager] Generating ${asteroids.length} asteroid sprites...`);

    for (let i = 0; i < asteroids.length; i++) {
      const asteroid = asteroids[i];
      const spriteId = `asteroid_${systemSeed}_${i}`;

      // Skip if already cached
      if (this.spriteCache.has(spriteId)) continue;

      const asteroidSprite = await this.objectGen.generateAsteroidSprite({
        type: asteroid.type || 'rocky',
        radius: asteroid.radius || 20,
        pixelSize: 2,
        seed: systemSeed + i * 500,
        irregularity: 0.3
      });

      this.spriteCache.set(spriteId, {
        type: 'asteroid',
        sprite: asteroidSprite,
        data: asteroid,
        index: i
      });

      this.stats.spritesGenerated++;
    }

    console.log(`[SpriteManager] ${asteroids.length} asteroid sprites generated`);
  }

  /**
   * Generate station sprites
   */
  async generateStationSprites(stations, systemSeed) {
    console.log(`[SpriteManager] Generating ${stations.length} station sprites...`);

    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      const spriteId = `station_${systemSeed}_${i}`;

      // Skip if cached
      if (this.spriteCache.has(spriteId)) continue;

      const stationSprite = await this.objectGen.generateStationSprite({
        type: station.type || 'trading',
        size: 60,
        pixelSize: 1,
        seed: systemSeed + i * 2000
      });

      this.spriteCache.set(spriteId, {
        type: 'station',
        sprite: stationSprite,
        data: station,
        index: i
      });

      this.stats.spritesGenerated++;
    }

    console.log(`[SpriteManager] ${stations.length} station sprites generated`);
  }

  /**
   * Get sprite from cache
   */
  getSprite(spriteId) {
    const cached = this.spriteCache.get(spriteId);
    return cached ? cached.sprite : null;
  }

  /**
   * Render sprite (delegates to SpriteRenderer)
   */
  renderSprite(ctx, spriteId, x, y, rotation = 0, options = {}) {
    const cached = this.spriteCache.get(spriteId);
    if (!cached || !cached.sprite || !cached.sprite.name) {
      return false;
    }

    this.renderer.renderSprite(ctx, cached.sprite.name, x, y, rotation, options);
    this.stats.spritesRendered++;

    return true;
  }

  /**
   * Render animated sprite
   */
  renderAnimatedSprite(ctx, spriteId, x, y, time, options = {}) {
    const cached = this.spriteCache.get(spriteId);
    if (!cached || !cached.sprite || !cached.sprite.name) {
      return false;
    }

    // Additional validation before rendering
    if (spriteId.startsWith('star_') && !this._validatedStarSprite) {
      console.log(`[SpriteManager] Validating star sprite before render: ${cached.sprite.name}`);
      console.log(`[SpriteManager] Sprite has image: ${cached.sprite.image ? 'YES' : 'NO'}`);
      console.log(`[SpriteManager] Sprite in celestialGen cache: ${this.celestialGen.getSpriteSheet(cached.sprite.name) ? 'YES' : 'NO'}`);
      this._validatedStarSprite = true;
    }

    const rendered = this.renderer.renderAnimatedSprite(ctx, cached.sprite.name, x, y, time, options);
    if (rendered) {
      this.stats.spritesRendered++;
    }

    return rendered;
  }

  /**
   * Update viewport for culling
   */
  updateViewport(camX, camY, width, height) {
    this.renderer.updateViewport(camX, camY, width, height);
  }

  /**
   * Clear sprite cache (for new system)
   */
  clearCache() {
    console.log(`[SpriteManager] Clearing sprite cache (${this.spriteCache.size} sprites)`);
    this.spriteCache.clear();
    this.stats.spritesGenerated = 0;
    this.stats.spritesRendered = 0;

    // Reset debug flags
    this._missingStarLogged = false;
    this._validatedStarSprite = false;

    // Clear missing sheets tracking to avoid stale warnings
    if (this.renderer && this.renderer.clearMissingSheets) {
      this.renderer.clearMissingSheets();
    }
  }

  /**
   * Get performance stats
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.spriteCache.size,
      rendererStats: this.renderer.getStats()
    };
  }

  /**
   * Normalize stellar class to base letter for consistent caching
   * Examples: M0 -> M, M5 -> M, G2 -> G, K8 -> K, BrownDwarf -> BrownDwarf
   */
  normalizeStellarClass(stellarClass) {
    if (!stellarClass) return 'G'; // Default to G-class

    // If it's a special type (multi-character), return as-is
    const specialTypes = ['BlackHole', 'NeutronStar', 'Pulsar', 'Magnetar', 'QuasarCore',
                          'WhiteDwarf', 'BrownDwarf', 'RedGiant', 'BlueGiant', 'YellowGiant',
                          'RedSuperGiant', 'BlueSuperGiant', 'OrangeGiant'];
    if (specialTypes.includes(stellarClass)) {
      return stellarClass;
    }

    // Extract base letter from subclass (M0 -> M, G2 -> G, K5 -> K, etc.)
    const baseClassMatch = stellarClass.match(/^([OBAFGKM])/);
    if (baseClassMatch) {
      return baseClassMatch[1];
    }

    // If no match, return as-is (shouldn't happen)
    return stellarClass;
  }

  /**
   * Enable sprite-based rendering
   */
  enable() {
    this.enabled = true;
    console.log('[SpriteManager] Sprite-based rendering ENABLED');
  }

  /**
   * Disable sprite-based rendering (fallback to old system)
   */
  disable() {
    this.enabled = false;
    console.log('[SpriteManager] Sprite-based rendering DISABLED');
  }

  /**
   * Check if sprite system is enabled
   */
  isEnabled() {
    return this.enabled === true;
  }
}
