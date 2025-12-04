/**
 * Performance Optimizer - Ensures 30-60 FPS gameplay
 *
 * Optimizations:
 * - Object pooling for particles and projectiles
 * - Spatial culling for off-screen objects
 * - Adaptive quality based on FPS
 * - Batch rendering optimizations
 * - Memory management
 */

export class PerformanceOptimizer {
  constructor(game) {
    this.game = game;

    // Performance monitoring
    this.frameTimes = [];
    this.maxFrameSamples = 60;
    this.currentFPS = 60;
    this.averageFPS = 60;

    // Adaptive quality settings
    this.qualityLevel = 2; // 0 = low, 1 = medium, 2 = high
    this.autoAdjustQuality = true;

    // Object pools - OPTIMIZED: Increased pool size for better reuse
    this.particlePool = [];
    this.projectilePool = [];
    this.explosionPool = []; // NEW: Pool for explosion effects
    this.maxPoolSize = 1000; // OPTIMIZED: Increased from 500 to 1000

    // Culling - OPTIMIZED: Reduced padding for more aggressive culling
    this.cullPadding = 150; // OPTIMIZED: Reduced from 200 to 150 for better performance

    // Performance thresholds
    this.targetFPS = 60;
    this.minAcceptableFPS = 30;
    this.qualityAdjustThreshold = 5; // Seconds before adjusting quality
    this.lastQualityAdjust = 0;

    // Frame time tracking for better FPS calculation
    this.lastFrameTime = performance.now();
  }

  /**
   * Update performance monitoring and adaptive quality
   * OPTIMIZED: More accurate frame time tracking
   */
  update(dt) {
    // OPTIMIZED: Use performance.now() for more accurate frame time tracking
    const now = performance.now();
    const actualFrameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Track frame time
    const frameTime = actualFrameTime; // Already in ms
    this.frameTimes.push(frameTime);

    if (this.frameTimes.length > this.maxFrameSamples) {
      this.frameTimes.shift();
    }

    // Calculate FPS with better averaging
    if (this.frameTimes.length > 0) {
      const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      // OPTIMIZED: Clamp minimum frame time to avoid division by very small numbers
      this.currentFPS = 1000 / Math.max(avgFrameTime, 1);
      // OPTIMIZED: Smooth FPS display with exponential moving average
      this.averageFPS = this.averageFPS * 0.9 + this.currentFPS * 0.1;
    }

    // Adaptive quality adjustment
    if (this.autoAdjustQuality && this.game.time - this.lastQualityAdjust > this.qualityAdjustThreshold) {
      this.adjustQualityBasedOnFPS();
      this.lastQualityAdjust = this.game.time;
    }

    // OPTIMIZED: Periodically cleanup pools to prevent memory bloat
    if (this.game.time % 10 < 0.1) {
      this.optimizePools();
    }
  }

  /**
   * Adjust quality settings based on current FPS
   */
  adjustQualityBasedOnFPS() {
    if (this.averageFPS < 25 && this.qualityLevel > 0) {
      // Decrease quality
      this.qualityLevel--;
      console.log(`[Performance] FPS low (${this.averageFPS.toFixed(1)}), reducing quality to level ${this.qualityLevel}`);
      this.applyQualitySettings();
    } else if (this.averageFPS > 55 && this.qualityLevel < 2) {
      // Increase quality
      this.qualityLevel++;
      console.log(`[Performance] FPS good (${this.averageFPS.toFixed(1)}), increasing quality to level ${this.qualityLevel}`);
      this.applyQualitySettings();
    }
  }

  /**
   * Apply quality settings to game systems
   */
  applyQualitySettings() {
    const game = this.game;

    switch (this.qualityLevel) {
      case 0: // Low quality
        game.maxParticles = 100;
        game.maxStars = 50;
        game.particleLifetime = 0.5;
        game.enableGlow = false;
        game.enableScanlines = false;
        break;

      case 1: // Medium quality
        game.maxParticles = 300;
        game.maxStars = 150;
        game.particleLifetime = 1.0;
        game.enableGlow = true;
        game.enableScanlines = false;
        break;

      case 2: // High quality
        game.maxParticles = 500;
        game.maxStars = 300;
        game.particleLifetime = 1.5;
        game.enableGlow = true;
        game.enableScanlines = true;
        break;
    }
  }

  /**
   * Get a particle from the pool (object pooling)
   */
  getParticleFromPool() {
    if (this.particlePool.length > 0) {
      return this.particlePool.pop();
    }
    return null; // Caller should create new particle
  }

  /**
   * Return a particle to the pool
   */
  returnParticleToPool(particle) {
    if (this.particlePool.length < this.maxPoolSize) {
      // Reset particle properties
      particle.life = 0;
      particle.maxLife = 0;
      particle.vx = 0;
      particle.vy = 0;
      particle.x = 0;
      particle.y = 0;

      this.particlePool.push(particle);
    }
  }

  /**
   * Get a projectile from the pool
   */
  getProjectileFromPool() {
    if (this.projectilePool.length > 0) {
      return this.projectilePool.pop();
    }
    return null;
  }

  /**
   * Return a projectile to the pool
   */
  returnProjectileToPool(projectile) {
    if (this.projectilePool.length < this.maxPoolSize) {
      // Reset projectile
      projectile.active = false;
      projectile.x = 0;
      projectile.y = 0;
      projectile.vx = 0;
      projectile.vy = 0;
      projectile.life = 0;

      this.projectilePool.push(projectile);
    }
  }

  /**
   * Check if object is visible on screen (spatial culling)
   * OPTIMIZED: Faster boundary checks with early exit
   */
  isOnScreen(x, y, radius = 50) {
    const cam = this.game.camera;
    const pad = this.cullPadding;

    // OPTIMIZED: Early exit checks for performance
    if (x + radius < cam.x - pad) return false;
    if (x - radius > cam.x + this.game.width + pad) return false;
    if (y + radius < cam.y - pad) return false;
    if (y - radius > cam.y + this.game.height + pad) return false;

    return true;
  }

  /**
   * Get distance from camera center (for LOD calculations)
   */
  getDistanceFromCamera(x, y) {
    const cam = this.game.camera;
    const centerX = cam.x + this.game.width / 2;
    const centerY = cam.y + this.game.height / 2;

    const dx = x - centerX;
    const dy = y - centerY;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Batch similar draw calls to reduce state changes
   */
  shouldBatchRender(type) {
    // Group similar render types together
    // E.g., all particles, all asteroids, etc.
    return this.qualityLevel >= 1;
  }

  /**
   * Clean up unused objects (memory management)
   */
  cleanup() {
    const game = this.game;

    // Remove dead particles
    if (game.particles) {
      // CRASH FIX: Hard limit to prevent memory issues
      const maxAllowedParticles = game.maxParticles * 2; // 2x safety margin

      for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        if (p.life <= 0) {
          this.returnParticleToPool(p);
          game.particles.splice(i, 1);
        }
      }

      // CRASH FIX: Aggressive cleanup if still over limit
      if (game.particles.length > maxAllowedParticles) {
        console.warn(`[Performance] Particle overflow! Removing ${game.particles.length - maxAllowedParticles} particles`);
        // Remove oldest particles (from beginning of array)
        const removeCount = game.particles.length - maxAllowedParticles;
        for (let i = 0; i < removeCount; i++) {
          if (game.particles[0]) {
            this.returnParticleToPool(game.particles[0]);
          }
          game.particles.shift();
        }
      }
    }

    // Remove inactive projectiles
    if (game.projectiles) {
      for (let i = game.projectiles.length - 1; i >= 0; i--) {
        const proj = game.projectiles[i];
        if (!proj.active || proj.life <= 0) {
          this.returnProjectileToPool(proj);
          game.projectiles.splice(i, 1);
        }
      }

      // CRASH FIX: Hard limit for projectiles (max 200)
      if (game.projectiles.length > 200) {
        console.warn(`[Performance] Projectile overflow! Removing ${game.projectiles.length - 200} projectiles`);
        while (game.projectiles.length > 200) {
          if (game.projectiles[0]) {
            this.returnProjectileToPool(game.projectiles[0]);
          }
          game.projectiles.shift();
        }
      }
    }

    // Remove destroyed asteroids
    if (game.asteroids) {
      for (let i = game.asteroids.length - 1; i >= 0; i--) {
        if (game.asteroids[i].destroyed) {
          game.asteroids.splice(i, 1);
        }
      }
    }

    // Remove expired explosions
    if (game.explosions) {
      for (let i = game.explosions.length - 1; i >= 0; i--) {
        if (game.explosions[i].frame >= game.explosions[i].maxFrames) {
          game.explosions.splice(i, 1);
        }
      }

      // CRASH FIX: Hard limit for explosions (max 50)
      if (game.explosions.length > 50) {
        console.warn(`[Performance] Explosion overflow! Removing ${game.explosions.length - 50} explosions`);
        game.explosions.splice(0, game.explosions.length - 50);
      }
    }
  }

  /**
   * Get sprite memory usage estimate
   * OPTIMIZED FOR LARGER SPRITES: Track memory usage of loaded sprites
   */
  getSpriteMemoryUsage() {
    if (!this.game.spriteManager || !this.game.spriteManager.celestialGen || !this.game.spriteManager.celestialGen.spriteLoader) {
      return { loaded: 0, estimatedMB: 0 };
    }

    const loader = this.game.spriteManager.celestialGen.spriteLoader;
    const loadedCount = loader.loadedSprites.size;

    // Estimate memory usage based on sprite sizes:
    // Stars: ~30MB each, Planets: ~12MB each, Moons: ~2MB, Asteroids: ~3MB
    // Average estimate: ~10MB per sprite
    const estimatedMB = Math.round(loadedCount * 10);

    return {
      loaded: loadedCount,
      cached: loader.loadedSprites.size,
      maxCache: loader.maxCacheSize,
      estimatedMB: estimatedMB
    };
  }

  /**
   * Get performance stats for display
   */
  getStats() {
    const spriteMemory = this.getSpriteMemoryUsage();

    return {
      fps: Math.round(this.currentFPS),
      avgFPS: Math.round(this.averageFPS),
      qualityLevel: ['Low', 'Medium', 'High'][this.qualityLevel],
      particles: this.game.particles?.length || 0,
      projectiles: this.game.projectiles?.length || 0,
      pooledParticles: this.particlePool.length,
      pooledProjectiles: this.projectilePool.length,
      spritesLoaded: spriteMemory.loaded,
      spriteMemoryMB: spriteMemory.estimatedMB
    };
  }

  /**
   * Force quality level (disable auto-adjust)
   */
  setQuality(level) {
    this.qualityLevel = Math.max(0, Math.min(2, level));
    this.autoAdjustQuality = false;
    this.applyQualitySettings();
  }

  /**
   * Enable auto quality adjustment
   */
  enableAutoQuality() {
    this.autoAdjustQuality = true;
  }

  /**
   * OPTIMIZED: Periodically trim pools to prevent excessive memory usage
   */
  optimizePools() {
    const targetPoolSize = Math.floor(this.maxPoolSize * 0.7);

    // Trim particle pool if it's too large
    if (this.particlePool.length > targetPoolSize) {
      this.particlePool.length = targetPoolSize;
    }

    // Trim projectile pool if it's too large
    if (this.projectilePool.length > targetPoolSize) {
      this.projectilePool.length = targetPoolSize;
    }

    // Trim explosion pool if it exists and is too large
    if (this.explosionPool && this.explosionPool.length > targetPoolSize) {
      this.explosionPool.length = targetPoolSize;
    }
  }

  /**
   * OPTIMIZED: Get explosion from pool
   */
  getExplosionFromPool() {
    if (this.explosionPool.length > 0) {
      return this.explosionPool.pop();
    }
    return null;
  }

  /**
   * OPTIMIZED: Return explosion to pool
   */
  returnExplosionToPool(explosion) {
    if (this.explosionPool.length < this.maxPoolSize) {
      explosion.frame = 0;
      explosion.maxFrames = 0;
      explosion.x = 0;
      explosion.y = 0;
      this.explosionPool.push(explosion);
    }
  }
}
