/**
 * ParticleManager - Efficient particle system with object pooling
 *
 * Features:
 * - Object pooling to avoid GC pressure
 * - Particle budget system to limit total particles
 * - Batch updates for better cache locality
 * - Automatic cleanup
 */

export class ParticleManager {
  constructor(maxParticles = 1200) { // PERFORMANCE: Reduced from 5000 to 1200 for better FPS
    this.particles = [];
    this.pool = [];
    this.maxParticles = maxParticles;
    this.maxPoolSize = 400; // PERFORMANCE: Reduced pool size

    // Particle budget per type (PERFORMANCE: Drastically reduced for smooth FPS)
    this.budgets = {
      engine: 25,          // Reduced from 100 - still visible but lighter
      engine_exhaust: 60,  // Reduced from 240 - focused visible trail
      rcs: 20,             // Reduced from 80 - short visible bursts
      rcs_puff: 30,        // Reduced from 120 - efficient braking effects
      warp_ring: 15,       // Reduced from 50 - elegant warp effect
      warp_streak: 20,     // Reduced from 75 - clean streaks
      warp_bend: 20,       // Reduced from 75 - smooth bending
      retro: 15,           // Reduced from 50 - visible retro thrust
      shield: 25,          // Reduced from 70 - clear shield hits
      debris: 40,          // Reduced from 150 - chunky debris
      explosion: 80,       // Reduced from 250 - impressive explosions
      default: 80          // Reduced from 300 - general effects
    };

    // Track particles by type
    this.particlesByType = new Map();
  }

  /**
   * Get a particle from the pool or create new
   */
  allocate() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return {};
  }

  /**
   * Return particle to pool
   */
  release(particle) {
    if (this.pool.length < this.maxPoolSize) {
      // Reset all properties
      particle.x = 0;
      particle.y = 0;
      particle.vx = 0;
      particle.vy = 0;
      particle.life = 0;
      particle.maxLife = 0;
      particle.size = 0;
      particle.color = '';
      particle.type = '';
      this.pool.push(particle);
    }
  }

  /**
   * Add particle with budget checking
   */
  addParticle(config) {
    // Check total particle limit
    if (this.particles.length >= this.maxParticles) {
      return null;
    }

    // Check type budget
    const type = config.type || 'default';
    const typeCount = this.particlesByType.get(type) || 0;
    const budget = this.budgets[type] || this.budgets.default;

    if (typeCount >= budget) {
      // Remove oldest particle of this type
      const index = this.particles.findIndex(p => p.type === type);
      if (index !== -1) {
        const old = this.particles.splice(index, 1)[0];
        this.release(old);
        this.particlesByType.set(type, typeCount - 1);
      }
    }

    // Allocate and configure particle
    const particle = this.allocate();
    Object.assign(particle, config);

    this.particles.push(particle);
    this.particlesByType.set(type, (this.particlesByType.get(type) || 0) + 1);

    return particle;
  }

  /**
   * Batch add particles (more efficient)
   */
  addParticles(configs) {
    for (const config of configs) {
      this.addParticle(config);
    }
  }

  /**
   * Update all particles (batch) with spatial culling
   */
  update(dt, cameraX, cameraY, viewportWidth, viewportHeight) {
    // Viewport bounds with buffer for particles just outside view
    const buffer = 200; // Extra space for particles entering/leaving viewport
    const minX = (cameraX || 0) - buffer;
    const maxX = (cameraX || 0) + (viewportWidth || 2000) + buffer;
    const minY = (cameraY || 0) - buffer;
    const maxY = (cameraY || 0) + (viewportHeight || 2000) + buffer;

    // Update in-place for cache efficiency
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.life -= dt;

      if (p.life <= 0) {
        const type = p.type || 'default';
        const count = this.particlesByType.get(type) || 0;
        this.particlesByType.set(type, Math.max(0, count - 1));

        this.release(p);
        this.particles.splice(i, 1);
        continue;
      }

      // Spatial culling: Skip physics for particles far outside viewport
      // but keep updating their life to ensure cleanup
      const inViewport = p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;

      if (inViewport || !cameraX) { // Always update if no camera info provided
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Apply friction if configured
        if (p.friction) {
          p.vx *= p.friction;
          p.vy *= p.friction;
        }
      } else {
        // Particle is far off-screen, just move it simply without friction
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }
  }

  /**
   * Get all particles
   */
  getParticles() {
    return this.particles;
  }

  /**
   * Clear all particles
   */
  clear() {
    for (const p of this.particles) {
      this.release(p);
    }
    this.particles.length = 0;
    this.particlesByType.clear();
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      active: this.particles.length,
      pooled: this.pool.length,
      maxParticles: this.maxParticles,
      byType: Object.fromEntries(this.particlesByType)
    };
  }

  /**
   * Reduce particle creation rate (called when FPS is low)
   */
  reduceCreationRate() {
    // Reduce all budgets by 30%
    for (const type in this.budgets) {
      this.budgets[type] = Math.floor(this.budgets[type] * 0.7);
    }
  }

  /**
   * Restore particle creation rate
   */
  restoreCreationRate() {
    // Restore to defaults
    this.budgets = {
      engine: 50,
      warp_ring: 30,
      warp_streak: 40,
      warp_bend: 40,
      rcs: 20,
      retro: 20,
      shield: 30,
      debris: 100,
      explosion: 150,
      default: 200
    };
  }

  /**
   * Create engine particles with multiple thruster points and types
   * @param {number} x - Ship X position
   * @param {number} y - Ship Y position
   * @param {number} rotation - Ship rotation
   * @param {number} vx - Ship velocity X
   * @param {number} vy - Ship velocity Y
   * @param {number} count - Base particle count multiplier
   * @param {object} palette - Color palette
   * @param {object} options - Engine configuration
   *   - thrusterPoints: Array of {offsetX, offsetY, size} for multiple thrusters
   *   - engineType: 'plasma', 'ion', 'chemical', 'afterburner', 'cruise', 'idle'
   *   - power: 0-1 engine power level
   *   - shipSize: 'small', 'medium', 'large' (determines thruster count)
   */
  createEngineParticles(x, y, rotation, vx, vy, count, palette, options = {}) {
    const particles = [];

    // Default options
    const engineType = options.engineType || 'plasma';
    const power = Math.max(0, Math.min(1, options.power !== undefined ? options.power : 1));
    const shipSize = options.shipSize || 'small';

    // Define thruster points based on ship size or custom points
    let thrusterPoints = options.thrusterPoints;
    if (!thrusterPoints) {
      // Auto-generate thruster points based on ship size
      if (shipSize === 'small') {
        // 2 thrusters
        thrusterPoints = [
          { offsetX: -20, offsetY: -5, size: 1.0 },
          { offsetX: -20, offsetY: 5, size: 1.0 }
        ];
      } else if (shipSize === 'medium') {
        // 4 thrusters
        thrusterPoints = [
          { offsetX: -22, offsetY: -8, size: 1.2 },
          { offsetX: -22, offsetY: 8, size: 1.2 },
          { offsetX: -25, offsetY: -3, size: 0.8 },
          { offsetX: -25, offsetY: 3, size: 0.8 }
        ];
      } else {
        // large: 8+ thrusters
        thrusterPoints = [
          { offsetX: -25, offsetY: -12, size: 1.5 },
          { offsetX: -25, offsetY: 12, size: 1.5 },
          { offsetX: -28, offsetY: -8, size: 1.2 },
          { offsetX: -28, offsetY: 8, size: 1.2 },
          { offsetX: -30, offsetY: -4, size: 1.0 },
          { offsetX: -30, offsetY: 4, size: 1.0 },
          { offsetX: -32, offsetY: 0, size: 1.8 },
          { offsetX: -26, offsetY: 0, size: 0.8 }
        ];
      }
    }

    // Engine type configurations (PERFORMANCE: Reduced particle counts by 60-70%)
    const engineConfigs = {
      plasma: {
        colors: [palette.engineOrange, palette.engineBright, '#ff6600', '#ffaa00'],
        particlesPerThruster: Math.max(1, Math.ceil(1 * count * power)), // Reduced from 3
        speed: 120,
        speedVariation: 60,
        spread: 12,
        life: 0.6, // Slightly longer for visibility
        sizeMin: 3, // Slightly larger for visibility
        sizeMax: 6,
        glow: true,
        coreStream: true // Dense core stream
      },
      ion: {
        colors: ['#00ccff', '#0088ff', '#4499ff', '#88ccff'],
        particlesPerThruster: Math.max(1, Math.ceil(0.8 * count * power)), // Reduced from 2
        speed: 180,
        speedVariation: 40,
        spread: 6,
        life: 0.8, // Longer for visibility
        sizeMin: 2, // Larger for visibility
        sizeMax: 4,
        glow: true,
        coreStream: true
      },
      chemical: {
        colors: ['#ff8800', '#ff6600', '#cc4400', '#ffaa44'],
        particlesPerThruster: Math.max(1, Math.ceil(1.2 * count * power)), // Reduced from 4
        speed: 100,
        speedVariation: 80,
        spread: 18,
        life: 0.7,
        sizeMin: 4, // Larger for visibility
        sizeMax: 8,
        glow: true, // Enable glow for visibility
        smoke: true // Includes smoke trails
      },
      afterburner: {
        colors: ['#ffffff', '#ffff88', '#ff8800', '#ff0000'],
        particlesPerThruster: Math.max(1, Math.ceil(2 * count * power)), // Reduced from 6
        speed: 200,
        speedVariation: 100,
        spread: 20,
        life: 0.5,
        sizeMin: 4, // Larger for visibility
        sizeMax: 10,
        glow: true,
        intense: true // Extra bright
      },
      cruise: {
        colors: [palette.engineOrange, palette.engineBright],
        particlesPerThruster: Math.max(1, Math.ceil(0.6 * count * power)), // Reduced from 1
        speed: 80,
        speedVariation: 30,
        spread: 8,
        life: 0.7,
        sizeMin: 3, // Larger for visibility
        sizeMax: 5,
        glow: true, // Enable glow for visibility
        efficient: true // Fewer particles for cruising
      },
      idle: {
        colors: ['#ff6600', '#ff8844'],
        particlesPerThruster: Math.max(1, Math.ceil(0.4 * count * power)), // Reduced from 0.5
        speed: 40,
        speedVariation: 20,
        spread: 10,
        life: 0.5,
        sizeMin: 2, // Larger for visibility
        sizeMax: 3,
        glow: true // Enable glow for visibility
      }
    };

    const config = engineConfigs[engineType] || engineConfigs.plasma;

    // Create particles for each thruster point
    for (const thruster of thrusterPoints) {
      const thrusterCount = Math.max(1, Math.floor(config.particlesPerThruster * thruster.size));

      // Calculate world position of thruster
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const thrusterX = x + cos * thruster.offsetX - sin * thruster.offsetY;
      const thrusterY = y + sin * thruster.offsetX + cos * thruster.offsetY;

      // Core stream - tight, bright particles along thrust axis (PERFORMANCE: Reduced)
      if (config.coreStream && power > 0.3) {
        const coreCount = Math.max(1, Math.ceil(thrusterCount * 0.25)); // Reduced from 0.4
        for (let i = 0; i < coreCount; i++) {
          const streamOffset = Math.random() * 15;
          const tightSpread = (Math.random() - 0.5) * (config.spread * 0.3);

          particles.push({
            x: thrusterX - cos * streamOffset,
            y: thrusterY - sin * streamOffset,
            vx: -cos * (config.speed * 1.2) + (Math.random() - 0.5) * 20 + vx * 0.5,
            vy: -sin * (config.speed * 1.2) + (Math.random() - 0.5) * 20 + vy * 0.5,
            life: config.life * 0.8,
            maxLife: config.life * 0.8,
            size: (config.sizeMin + config.sizeMax) / 2 * thruster.size,
            color: config.colors[0],
            type: 'engine',
            glow: config.glow
          });
        }
      }

      // Main particle stream
      for (let i = 0; i < thrusterCount; i++) {
        const spread = (Math.random() - 0.5) * config.spread;
        const spreadAngle = rotation + spread * 0.1;
        const speed = config.speed + (Math.random() - 0.5) * config.speedVariation;
        const distance = Math.random() * 12;

        particles.push({
          x: thrusterX - cos * distance + (Math.random() - 0.5) * spread,
          y: thrusterY - sin * distance + (Math.random() - 0.5) * spread,
          vx: -Math.cos(spreadAngle) * speed + vx * 0.5,
          vy: -Math.sin(spreadAngle) * speed + vy * 0.5,
          life: config.life + (Math.random() - 0.5) * 0.2,
          maxLife: config.life,
          size: (Math.random() * (config.sizeMax - config.sizeMin) + config.sizeMin) * thruster.size,
          color: config.colors[Math.floor(Math.random() * config.colors.length)],
          type: 'engine',
          glow: config.glow,
          friction: 0.98
        });
      }

      // Smoke trail for chemical engines (PERFORMANCE: Reduced)
      if (config.smoke && power > 0.5) {
        const smokeCount = Math.max(1, Math.ceil(thrusterCount * 0.15)); // Reduced from 0.3
        for (let i = 0; i < smokeCount; i++) {
          particles.push({
            x: thrusterX - cos * (Math.random() * 20),
            y: thrusterY - sin * (Math.random() * 20),
            vx: -cos * (config.speed * 0.4) + (Math.random() - 0.5) * 40 + vx * 0.3,
            vy: -sin * (config.speed * 0.4) + (Math.random() - 0.5) * 40 + vy * 0.3,
            life: 1.0 + Math.random() * 0.5,
            maxLife: 1.0,
            size: 4 + Math.random() * 6,
            color: '#444444',
            type: 'engine',
            smoke: true,
            friction: 0.95
          });
        }
      }

      // Heat distortion particles for afterburner (PERFORMANCE: Reduced)
      if (config.intense && power > 0.7) {
        const heatCount = Math.max(1, Math.ceil(thrusterCount * 0.1)); // Reduced from 0.2
        for (let i = 0; i < heatCount; i++) {
          particles.push({
            x: thrusterX - cos * (Math.random() * 10),
            y: thrusterY - sin * (Math.random() * 10),
            vx: -cos * config.speed * 0.3 + (Math.random() - 0.5) * 60,
            vy: -sin * config.speed * 0.3 + (Math.random() - 0.5) * 60,
            life: 0.2,
            maxLife: 0.2,
            size: 6 + Math.random() * 4,
            color: 'rgba(255, 255, 255, 0.3)',
            type: 'engine',
            distortion: true
          });
        }
      }
    }

    this.addParticles(particles);
  }

  /**
   * Create side thruster particles for RCS (turning and braking)
   * @param {number} x - Ship X position
   * @param {number} y - Ship Y position
   * @param {number} rotation - Ship rotation
   * @param {number} vx - Ship velocity X
   * @param {number} vy - Ship velocity Y
   * @param {object} palette - Color palette
   * @param {object} options - RCS configuration
   *   - direction: 'left', 'right', 'brake_forward', 'brake_reverse'
   *   - power: 0-1 thruster power level
   *   - shipSize: 'small', 'medium', 'large'
   *   - thrusterPoints: Custom thruster positions
   */
  createSideThrusterParticles(x, y, rotation, vx, vy, palette, options = {}) {
    const particles = [];

    const direction = options.direction || 'left';
    const power = Math.max(0, Math.min(1, options.power !== undefined ? options.power : 1));
    const shipSize = options.shipSize || 'small';

    // Define RCS thruster points based on ship size and direction
    let thrusterPoints = options.thrusterPoints;
    if (!thrusterPoints) {
      // Generate RCS thruster positions
      if (shipSize === 'small') {
        // 2 RCS thrusters
        if (direction === 'left') {
          thrusterPoints = [
            { offsetX: 5, offsetY: 8, angle: Math.PI / 2, size: 0.8 },      // Right side, fires down
            { offsetX: -5, offsetY: -8, angle: -Math.PI / 2, size: 0.8 }     // Left side, fires up
          ];
        } else if (direction === 'right') {
          thrusterPoints = [
            { offsetX: 5, offsetY: -8, angle: -Math.PI / 2, size: 0.8 },     // Right side, fires up
            { offsetX: -5, offsetY: 8, angle: Math.PI / 2, size: 0.8 }       // Left side, fires down
          ];
        } else if (direction === 'brake_forward') {
          thrusterPoints = [
            { offsetX: 15, offsetY: 5, angle: 0, size: 0.9 },                // Front, fires forward
            { offsetX: 15, offsetY: -5, angle: 0, size: 0.9 }
          ];
        } else { // brake_reverse
          thrusterPoints = [
            { offsetX: -20, offsetY: 5, angle: Math.PI, size: 0.9 },         // Rear, fires backward
            { offsetX: -20, offsetY: -5, angle: Math.PI, size: 0.9 }
          ];
        }
      } else if (shipSize === 'medium') {
        // 4 RCS thrusters
        if (direction === 'left') {
          thrusterPoints = [
            { offsetX: 8, offsetY: 10, angle: Math.PI / 2, size: 1.0 },
            { offsetX: -8, offsetY: -10, angle: -Math.PI / 2, size: 1.0 },
            { offsetX: 3, offsetY: 12, angle: Math.PI / 2, size: 0.7 },
            { offsetX: -3, offsetY: -12, angle: -Math.PI / 2, size: 0.7 }
          ];
        } else if (direction === 'right') {
          thrusterPoints = [
            { offsetX: 8, offsetY: -10, angle: -Math.PI / 2, size: 1.0 },
            { offsetX: -8, offsetY: 10, angle: Math.PI / 2, size: 1.0 },
            { offsetX: 3, offsetY: -12, angle: -Math.PI / 2, size: 0.7 },
            { offsetX: -3, offsetY: 12, angle: Math.PI / 2, size: 0.7 }
          ];
        } else if (direction === 'brake_forward') {
          thrusterPoints = [
            { offsetX: 18, offsetY: 6, angle: 0, size: 1.1 },
            { offsetX: 18, offsetY: -6, angle: 0, size: 1.1 }
          ];
        } else {
          thrusterPoints = [
            { offsetX: -22, offsetY: 6, angle: Math.PI, size: 1.1 },
            { offsetX: -22, offsetY: -6, angle: Math.PI, size: 1.1 }
          ];
        }
      } else {
        // large: 6-8 RCS thrusters
        if (direction === 'left') {
          thrusterPoints = [
            { offsetX: 10, offsetY: 14, angle: Math.PI / 2, size: 1.3 },
            { offsetX: -10, offsetY: -14, angle: -Math.PI / 2, size: 1.3 },
            { offsetX: 5, offsetY: 18, angle: Math.PI / 2, size: 1.0 },
            { offsetX: -5, offsetY: -18, angle: -Math.PI / 2, size: 1.0 },
            { offsetX: 0, offsetY: 16, angle: Math.PI / 2, size: 0.8 },
            { offsetX: 0, offsetY: -16, angle: -Math.PI / 2, size: 0.8 }
          ];
        } else if (direction === 'right') {
          thrusterPoints = [
            { offsetX: 10, offsetY: -14, angle: -Math.PI / 2, size: 1.3 },
            { offsetX: -10, offsetY: 14, angle: Math.PI / 2, size: 1.3 },
            { offsetX: 5, offsetY: -18, angle: -Math.PI / 2, size: 1.0 },
            { offsetX: -5, offsetY: 18, angle: Math.PI / 2, size: 1.0 },
            { offsetX: 0, offsetY: -16, angle: -Math.PI / 2, size: 0.8 },
            { offsetX: 0, offsetY: 16, angle: Math.PI / 2, size: 0.8 }
          ];
        } else if (direction === 'brake_forward') {
          thrusterPoints = [
            { offsetX: 22, offsetY: 8, angle: 0, size: 1.4 },
            { offsetX: 22, offsetY: -8, angle: 0, size: 1.4 },
            { offsetX: 20, offsetY: 4, angle: 0, size: 1.0 },
            { offsetX: 20, offsetY: -4, angle: 0, size: 1.0 }
          ];
        } else {
          thrusterPoints = [
            { offsetX: -26, offsetY: 8, angle: Math.PI, size: 1.4 },
            { offsetX: -26, offsetY: -8, angle: Math.PI, size: 1.4 },
            { offsetX: -24, offsetY: 4, angle: Math.PI, size: 1.0 },
            { offsetX: -24, offsetY: -4, angle: Math.PI, size: 1.0 }
          ];
        }
      }
    }

    // RCS thruster configuration - short, intense bursts
    const rcsConfig = {
      colors: ['#00ccff', '#4499ff', '#88ccff', '#ffffff'],
      particlesPerThruster: Math.ceil(2 * power),
      speed: 90,
      speedVariation: 50,
      spread: 15,
      life: 0.3,
      sizeMin: 1,
      sizeMax: 3
    };

    // Create particles for each RCS thruster
    for (const thruster of thrusterPoints) {
      const thrusterCount = Math.max(1, Math.floor(rcsConfig.particlesPerThruster * thruster.size));

      // Calculate world position of thruster
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const thrusterX = x + cos * thruster.offsetX - sin * thruster.offsetY;
      const thrusterY = y + sin * thruster.offsetX + cos * thruster.offsetY;

      // Calculate thrust direction in world space
      const thrustAngle = rotation + thruster.angle;
      const thrustCos = Math.cos(thrustAngle);
      const thrustSin = Math.sin(thrustAngle);

      // Create RCS particle burst
      for (let i = 0; i < thrusterCount; i++) {
        const spread = (Math.random() - 0.5) * rcsConfig.spread * Math.PI / 180;
        const particleAngle = thrustAngle + spread;
        const speed = rcsConfig.speed + (Math.random() - 0.5) * rcsConfig.speedVariation;

        particles.push({
          x: thrusterX + thrustCos * (Math.random() * 3),
          y: thrusterY + thrustSin * (Math.random() * 3),
          vx: Math.cos(particleAngle) * speed + vx * 0.3,
          vy: Math.sin(particleAngle) * speed + vy * 0.3,
          life: rcsConfig.life + (Math.random() - 0.5) * 0.1,
          maxLife: rcsConfig.life,
          size: (Math.random() * (rcsConfig.sizeMax - rcsConfig.sizeMin) + rcsConfig.sizeMin) * thruster.size,
          color: rcsConfig.colors[Math.floor(Math.random() * rcsConfig.colors.length)],
          type: 'rcs',
          glow: true,
          fadeOut: true
        });
      }

      // Add a small bright flash at thruster point
      if (power > 0.5) {
        particles.push({
          x: thrusterX,
          y: thrusterY,
          vx: thrustCos * 30 + vx * 0.2,
          vy: thrustSin * 30 + vy * 0.2,
          life: 0.15,
          maxLife: 0.15,
          size: 4 * thruster.size,
          color: '#ffffff',
          type: 'rcs',
          glow: true,
          flash: true
        });
      }
    }

    this.addParticles(particles);
  }

  /**
   * Create warp particles (optimized batch)
   */
  createWarpParticles(x, y, rotation, time, palette) {
    const particles = [];

    // Warp rings (reduced from 6 to 3)
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 * i / 3) + time * 5;
      const radius = 35;
      particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        vx: Math.cos(angle) * 200,
        vy: Math.sin(angle) * 200,
        life: 0.25,
        maxLife: 0.25,
        size: 6,
        color: palette.warpPurple,
        type: 'warp_ring'
      });
    }

    // Warp streaks (reduced from 8 to 4)
    for (let i = 0; i < 4; i++) {
      const spreadAngle = rotation + (Math.random() - 0.5) * 0.8;
      const distance = Math.random() * 60 + 50;
      particles.push({
        x: x + Math.cos(spreadAngle) * distance,
        y: y + Math.sin(spreadAngle) * distance,
        vx: Math.cos(spreadAngle) * 300,
        vy: Math.sin(spreadAngle) * 300,
        life: 0.4,
        maxLife: 0.4,
        size: 4,
        color: palette.warpBlue,
        type: 'warp_streak'
      });
    }

    // Tunnel convergence (reduced from 10 to 5)
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 80 + 60;
      const convergenceAngle = angle * 0.3 + rotation * 0.7;
      particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: Math.cos(convergenceAngle) * 250,
        vy: Math.sin(convergenceAngle) * 250,
        life: 0.35,
        maxLife: 0.35,
        size: 2,
        color: palette.warpPurple,
        type: 'warp_bend'
      });
    }

    this.addParticles(particles);
  }
}
