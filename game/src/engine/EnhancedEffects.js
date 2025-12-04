/**
 * Enhanced Visual Effects System
 *
 * Adds:
 * - Better particle effects
 * - Engine trails with pixelated glow
 * - Weapon impact effects
 * - Warp effects
 * - Shield hit effects
 * - Explosion variations
 * - Environmental effects (nebula particles, space dust)
 */

export class EnhancedEffects {
  constructor(game) {
    this.game = game;
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  /**
   * Create enhanced engine trail particles
   */
  createEngineTrail(x, y, vx, vy, color = '#4488ff') {
    const game = this.game;

    // Create multiple particles for fuller trail
    const count = game.qualityLevel >= 1 ? 3 : 1;

    for (let i = 0; i < count; i++) {
      const spreadX = (Math.random() - 0.5) * 5;
      const spreadY = (Math.random() - 0.5) * 5;

      const particle = {
        x: x + spreadX,
        y: y + spreadY,
        vx: -vx * 0.3 + (Math.random() - 0.5) * 20,
        vy: -vy * 0.3 + (Math.random() - 0.5) * 20,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.4 + Math.random() * 0.3,
        color: color,
        size: 2 + Math.random() * 2,
        alpha: 0.8,
        glow: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Create warp jump effect
   */
  createWarpEffect(x, y, direction = 0) {
    const game = this.game;
    const count = game.qualityLevel >= 1 ? 50 : 20;

    for (let i = 0; i < count; i++) {
      const angle = direction + (Math.random() - 0.5) * Math.PI / 4;
      const speed = 200 + Math.random() * 300;

      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.3 + Math.random() * 0.2,
        color: '#00ffff',
        size: 1 + Math.random() * 3,
        alpha: 1,
        glow: true,
        trail: true
      };

      game.particles.push(particle);
    }

    // Add warp flash
    game.screenFlash = { intensity: 0.5, color: '#00ffff', duration: 0.3 };
  }

  /**
   * Create enhanced weapon impact effect with debris, smoke, and explosions
   */
  createImpactEffect(x, y, type = 'plasma', velocity = { vx: 0, vy: 0 }) {
    const game = this.game;
    const highQuality = game.qualityLevel >= 1;

    const colors = {
      plasma: ['#ff4400', '#ffaa00', '#ffff88'],
      laser: ['#ff0000', '#ff4444', '#ff8888'],
      kinetic: ['#888888', '#aaaaaa', '#cccccc'],
      explosion: ['#ff6600', '#ff9900', '#ffcc00', '#ffffff']
    };

    const colorSet = colors[type] || colors.plasma;

    // ENHANCED: Multi-layer impact particles for more depth

    // Layer 1: White hot impact flash (very fast, bright)
    const flashCount = highQuality ? 10 : 5;
    for (let i = 0; i < flashCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 150;

      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed + velocity.vx * 0.5,
        vy: Math.sin(angle) * speed + velocity.vy * 0.5,
        life: 0.2 + Math.random() * 0.2,
        maxLife: 0.2 + Math.random() * 0.2,
        color: '#ffffff', // ENHANCED: White hot impact core
        size: 2 + Math.random() * 4,
        alpha: 1,
        glow: true,
        fadeOut: true
      };

      game.particles.push(particle);
    }

    // Layer 2: Main colored explosion sparks
    const mainCount = highQuality ? 40 : 20; // ENHANCED: More particles
    for (let i = 0; i < mainCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 200;

      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed + velocity.vx * 0.5,
        vy: Math.sin(angle) * speed + velocity.vy * 0.5,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.3 + Math.random() * 0.4,
        color: colorSet[Math.floor(Math.random() * colorSet.length)],
        size: 1 + Math.random() * 3,
        alpha: 1,
        glow: true,
        fadeOut: true
      };

      game.particles.push(particle);
    }

    // ENHANCED: Layer 3: Bouncing sparks with trails
    const sparkCount = highQuality ? 8 : 4;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 100;

      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed + velocity.vx * 0.6,
        vy: Math.sin(angle) * speed + velocity.vy * 0.6,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
        color: '#ffaa00',
        size: 2 + Math.random() * 2,
        alpha: 1,
        glow: true,
        fadeOut: true,
        bounce: true // ENHANCED: Sparks that bounce off surfaces
      };

      game.particles.push(particle);
    }

    // ENHANCED: Chunky debris fragments (slower, larger, more pixelated pieces)
    const debrisCount = highQuality ? 18 : 9; // ENHANCED: More debris
    for (let i = 0; i < debrisCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;

      // ENHANCED: Variable debris colors for visual variety
      const debrisColors = ['#222222', '#333333', '#444444', '#555555', '#3a3a3a'];

      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed + velocity.vx * 0.3,
        vy: Math.sin(angle) * speed + velocity.vy * 0.3,
        life: 0.6 + Math.random() * 0.5,
        maxLife: 0.6 + Math.random() * 0.5,
        color: debrisColors[Math.floor(Math.random() * debrisColors.length)],
        size: 3 + Math.random() * 5, // ENHANCED: Larger, chunkier debris
        alpha: 0.9,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 5,
        debris: true,
        gravity: 20, // Affected by gravity
        pixelated: true // ENHANCED: Render as chunky pixelated squares
      };

      game.particles.push(particle);
    }

    // ENHANCED: Multi-layer smoke (varying colors and sizes for depth)
    const smokeCount = highQuality ? 25 : 12; // ENHANCED: More smoke
    for (let i = 0; i < smokeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 15 + Math.random() * 40;

      // ENHANCED: Smoke color variation for depth
      const smokeColors = ['#1a1a1a', '#2a2a2a', '#3a3a3a', '#444444', '#2a2520'];
      const smokeColor = smokeColors[Math.floor(Math.random() * smokeColors.length)];

      const particle = {
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed + velocity.vx * 0.2,
        vy: Math.sin(angle) * speed + velocity.vy * 0.2,
        life: 0.8 + Math.random() * 0.7,
        maxLife: 0.8 + Math.random() * 0.7,
        color: smokeColor,
        size: 4 + Math.random() * 6, // ENHANCED: Larger, chunkier smoke
        alpha: 0.5 + Math.random() * 0.2,
        smoke: true,
        expansion: 1.8, // ENHANCED: Expands more over time
        pixelated: true // ENHANCED: Pixelated smoke for retro aesthetic
      };

      game.particles.push(particle);
    }

    // Explosion ring effect
    if (highQuality) {
      for (let ring = 0; ring < 3; ring++) {
        const ringDelay = ring * 0.05;

        const ringParticle = {
          x: x,
          y: y,
          life: 0.4,
          maxLife: 0.4,
          startDelay: ringDelay,
          color: colorSet[0],
          alpha: 0.8 - ring * 0.2,
          explosionRing: true,
          maxRadius: 25 + ring * 15,
          lineWidth: 3 - ring
        };

        game.particles.push(ringParticle);
      }
    }

    // Flash effect at impact point
    const flashParticle = {
      x: x,
      y: y,
      life: 0.15,
      maxLife: 0.15,
      color: '#ffffff',
      size: 15,
      alpha: 1,
      flash: true,
      glow: true
    };

    game.particles.push(flashParticle);

    // Screen shake for explosions
    if (type === 'explosion' && game.screenShake !== undefined) {
      game.screenShake = Math.max(game.screenShake || 0, 8);
    }
  }

  /**
   * Create shield hit effect
   */
  createShieldHit(x, y, impactAngle, shieldColor = '#00ffff') {
    const game = this.game;
    const count = game.qualityLevel >= 1 ? 15 : 8;

    for (let i = 0; i < count; i++) {
      const spread = Math.PI / 3;
      const angle = impactAngle + (Math.random() - 0.5) * spread;
      const speed = 30 + Math.random() * 70;

      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.3 + Math.random() * 0.2,
        color: shieldColor,
        size: 1 + Math.random() * 2,
        alpha: 1,
        glow: true,
        sparkle: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Create explosion with variations
   */
  createEnhancedExplosion(x, y, size = 1, type = 'normal') {
    const game = this.game;
    const baseCount = game.qualityLevel >= 1 ? 60 : 30; // ENHANCED: More particles
    const count = Math.floor(baseCount * size);

    const explosionTypes = {
      normal: { colors: ['#ff6600', '#ff9900', '#ffcc00', '#ffffff'], speed: 100 },
      large: { colors: ['#ff3300', '#ff6600', '#ff9900', '#ffff00', '#ffffff'], speed: 150 },
      plasma: { colors: ['#ff00ff', '#8800ff', '#4400ff', '#ffffff'], speed: 120 },
      antimatter: { colors: ['#ffffff', '#00ffff', '#0088ff', '#ffffff'], speed: 200 }
    };

    const config = explosionTypes[type] || explosionTypes.normal;

    // ENHANCED: Multi-layer explosion with different particle types

    // Layer 1: Fast bright core particles (inner explosion)
    for (let i = 0; i < count * 0.4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.8 + Math.random() * 0.4) * config.speed * size;

      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.3 + Math.random() * 0.3,
        color: '#ffffff', // ENHANCED: White hot core
        size: (2 + Math.random() * 4) * size,
        alpha: 1,
        glow: true,
        fade: true
      };

      game.particles.push(particle);
    }

    // Layer 2: Medium speed colored explosion particles
    for (let i = 0; i < count * 0.4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * 0.5) * config.speed * size;

      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.4 + Math.random() * 0.4,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size: (1 + Math.random() * 3) * size,
        alpha: 1,
        glow: true,
        fade: true
      };

      game.particles.push(particle);
    }

    // Layer 3: ENHANCED: Slow expanding embers and sparks
    for (let i = 0; i < count * 0.2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.2 + Math.random() * 0.3) * config.speed * size;

      const particle = {
        x: x + (Math.random() - 0.5) * 10 * size,
        y: y + (Math.random() - 0.5) * 10 * size,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 0.8 + Math.random() * 0.5,
        color: '#ff6600',
        size: (1 + Math.random() * 2) * size,
        alpha: 0.8,
        glow: true,
        fade: true
      };

      game.particles.push(particle);
    }

    // ENHANCED: Add chunky debris particles
    const debrisCount = Math.floor(15 * size);
    for (let i = 0; i < debrisCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (30 + Math.random() * 80) * size;

      const particle = {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.6,
        maxLife: 0.6 + Math.random() * 0.6,
        color: '#333333',
        size: (3 + Math.random() * 5) * size, // ENHANCED: Chunky debris
        alpha: 0.9,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 8,
        debris: true
      };

      game.particles.push(particle);
    }

    // ENHANCED: Add smoke plume
    const smokeCount = Math.floor(20 * size);
    for (let i = 0; i < smokeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (10 + Math.random() * 30) * size;

      const particle = {
        x: x + (Math.random() - 0.5) * 15 * size,
        y: y + (Math.random() - 0.5) * 15 * size,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0 + Math.random() * 0.8,
        maxLife: 1.0 + Math.random() * 0.8,
        color: '#222222',
        size: (4 + Math.random() * 6) * size,
        alpha: 0.5,
        smoke: true,
        expansion: 2.0 // Expands significantly
      };

      game.particles.push(particle);
    }

    // Add explosion shockwave rings (multiple)
    if (game.qualityLevel >= 1 && size >= 1) {
      this.createShockwave(x, y, size);
      // ENHANCED: Secondary shockwave
      setTimeout(() => {
        if (this.game) this.createShockwave(x, y, size * 0.7);
      }, 100);
    }

    // Screen shake for large explosions
    if (size >= 2 && game.camera) {
      game.camera.shake = Math.min(size * 3, 15);
    }
  }

  /**
   * Create expanding shockwave ring
   */
  createShockwave(x, y, size = 1) {
    const game = this.game;

    const shockwave = {
      x: x,
      y: y,
      radius: 10 * size,
      maxRadius: 100 * size,
      life: 0.5,
      maxLife: 0.5,
      color: '#ffaa44',
      alpha: 0.8,
      width: 3 * size
    };

    if (!game.shockwaves) game.shockwaves = [];
    game.shockwaves.push(shockwave);
  }

  /**
   * Create space dust ambient particles
   */
  createSpaceDust(x, y, width, height, count = 50) {
    const game = this.game;

    for (let i = 0; i < count; i++) {
      const particle = {
        x: x + Math.random() * width,
        y: y + Math.random() * height,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 999, // Long-lived
        maxLife: 999,
        color: '#666666',
        size: 0.5 + Math.random(),
        alpha: 0.3 + Math.random() * 0.3,
        ambient: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Create nebula gas particles
   */
  createNebula(x, y, radius, color = '#ff00ff', density = 30) {
    const game = this.game;

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;

      const particle = {
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 999,
        maxLife: 999,
        color: color,
        size: 3 + Math.random() * 5,
        alpha: 0.1 + Math.random() * 0.2,
        ambient: true,
        glow: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Create stellar wind particles emanating from stars
   * REALISTIC UPGRADE: Adds solar wind visualization
   */
  createStellarWind(starX, starY, starRadius, starColor) {
    const game = this.game;
    const count = game.qualityLevel >= 1 ? 20 : 10;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const startDist = starRadius * (1.2 + Math.random() * 0.3);
      const speed = 100 + Math.random() * 150;

      const particle = {
        x: starX + Math.cos(angle) * startDist,
        y: starY + Math.sin(angle) * startDist,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 2.0 + Math.random() * 2.0,
        maxLife: 2.0 + Math.random() * 2.0,
        color: starColor,
        size: 1 + Math.random() * 2,
        alpha: 0.6,
        glow: true,
        fade: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Create coronal mass ejection from star
   * REALISTIC UPGRADE: Dramatic solar prominence eruptions
   */
  createCoronalEjection(starX, starY, starRadius, direction) {
    const game = this.game;
    const count = game.qualityLevel >= 1 ? 60 : 30;

    for (let i = 0; i < count; i++) {
      const spread = Math.PI / 6;
      const angle = direction + (Math.random() - 0.5) * spread;
      const speed = 200 + Math.random() * 400;
      const startDist = starRadius * (1.0 + Math.random() * 0.2);

      const particle = {
        x: starX + Math.cos(angle) * startDist,
        y: starY + Math.sin(angle) * startDist,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.5 + Math.random() * 1.5,
        maxLife: 1.5 + Math.random() * 1.5,
        color: ['#ff6600', '#ff9900', '#ffcc00', '#ffff00'][Math.floor(Math.random() * 4)],
        size: 2 + Math.random() * 4,
        alpha: 0.8,
        glow: true,
        fade: true,
        trail: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Create gravitational lensing particles near massive objects
   * REALISTIC UPGRADE: Visualizes spacetime distortion
   */
  createGravitationalLensing(objectX, objectY, objectRadius, objectMass) {
    const game = this.game;
    const count = game.qualityLevel >= 1 ? 40 : 20;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = objectRadius * (2.0 + Math.random() * 1.0);

      const particle = {
        x: objectX + Math.cos(angle) * dist,
        y: objectY + Math.sin(angle) * dist,
        orbitX: objectX,
        orbitY: objectY,
        orbitRadius: dist,
        orbitAngle: angle,
        orbitSpeed: 0.02 / (dist / 100), // Faster closer in
        life: 999,
        maxLife: 999,
        color: '#00ddff',
        size: 1,
        alpha: 0.3 + Math.random() * 0.3,
        glow: true,
        orbital: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Create accretion disk particles around blackhole
   * REALISTIC UPGRADE: Swirling matter spiraling into event horizon
   */
  createAccretionDisk(bhX, bhY, bhRadius) {
    const game = this.game;
    const count = game.qualityLevel >= 1 ? 80 : 40;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = bhRadius * (1.5 + Math.random() * 1.5);

      // Color based on distance (hotter closer in)
      const temp = 1 - ((dist - bhRadius * 1.5) / (bhRadius * 1.5));
      const colors = ['#ffffff', '#aaddff', '#4488ff', '#0044aa'];
      const colorIndex = Math.floor((1 - temp) * (colors.length - 1));

      const particle = {
        x: bhX + Math.cos(angle) * dist,
        y: bhY + Math.sin(angle) * dist,
        orbitX: bhX,
        orbitY: bhY,
        orbitRadius: dist,
        orbitAngle: angle,
        orbitSpeed: 0.05 / (dist / bhRadius), // Much faster closer in
        spiralSpeed: -0.5, // Spiral inward
        life: 999,
        maxLife: 999,
        color: colors[colorIndex],
        size: 1 + Math.random() * 2,
        alpha: 0.5 + temp * 0.5,
        glow: true,
        orbital: true,
        spiral: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Create radiation burst from pulsar/neutron star
   * REALISTIC UPGRADE: Lighthouse-effect beamed radiation
   */
  createRadiationBurst(starX, starY, beamAngle, beamWidth = Math.PI / 12) {
    const game = this.game;
    const count = game.qualityLevel >= 1 ? 50 : 25;

    for (let i = 0; i < count; i++) {
      const angle = beamAngle + (Math.random() - 0.5) * beamWidth;
      const speed = 400 + Math.random() * 400;

      const particle = {
        x: starX,
        y: starY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.6,
        maxLife: 0.8 + Math.random() * 0.6,
        color: '#00ff88',
        size: 1 + Math.random() * 2,
        alpha: 0.9,
        glow: true,
        fade: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Create atmospheric entry plasma trail
   * REALISTIC UPGRADE: Heating and ionization during atmospheric entry
   */
  createAtmosphericEntry(x, y, vx, vy, intensity = 1) {
    const game = this.game;
    const count = Math.floor((game.qualityLevel >= 1 ? 30 : 15) * intensity);

    for (let i = 0; i < count; i++) {
      const spread = 20 * intensity;
      const particle = {
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        vx: -vx * (0.5 + Math.random() * 0.3),
        vy: -vy * (0.5 + Math.random() * 0.3),
        life: 0.6 + Math.random() * 0.6,
        maxLife: 0.6 + Math.random() * 0.6,
        color: ['#ff3300', '#ff6600', '#ff9900', '#ffff00'][Math.floor(Math.random() * 4)],
        size: 2 + Math.random() * 3,
        alpha: 0.9,
        glow: true,
        fade: true,
        trail: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Create ion engine trail (more efficient than chemical)
   * REALISTIC UPGRADE: Blue-glowing xenon ion propulsion
   */
  createIonEngineTrail(x, y, vx, vy) {
    const game = this.game;
    const count = game.qualityLevel >= 1 ? 4 : 2;

    for (let i = 0; i < count; i++) {
      const spreadX = (Math.random() - 0.5) * 3;
      const spreadY = (Math.random() - 0.5) * 3;

      const particle = {
        x: x + spreadX,
        y: y + spreadY,
        vx: -vx * 0.2 + (Math.random() - 0.5) * 10,
        vy: -vy * 0.2 + (Math.random() - 0.5) * 10,
        life: 1.2 + Math.random() * 0.8,
        maxLife: 1.2 + Math.random() * 0.8,
        color: ['#0088ff', '#00aaff', '#00ccff'][Math.floor(Math.random() * 3)],
        size: 1 + Math.random(),
        alpha: 0.7,
        glow: true,
        fade: true
      };

      game.particles.push(particle);
    }
  }

  /**
   * Render enhanced particles
   */
  renderParticles(ctx, particles, camera) {
    const enableGlow = this.game.enableGlow !== false;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const lifeRatio = p.life / p.maxLife;

      // Apply fade
      let alpha = p.alpha;
      if (p.fade) {
        alpha *= lifeRatio;
      }

      ctx.save();

      // Translate to screen space
      const screenX = p.x - camera.x;
      const screenY = p.y - camera.y;

      // Draw glow effect
      if (p.glow && enableGlow) {
        const glowSize = p.size * 3;
        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowSize);
        gradient.addColorStop(0, p.color + Math.floor(alpha * 128).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(screenX - glowSize, screenY - glowSize, glowSize * 2, glowSize * 2);
      }

      // Draw particle core
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.sparkle) {
        // Draw as sparkle/star shape
        this.drawSparkle(ctx, screenX, screenY, p.size);
      } else {
        // Draw as circle/square
        ctx.fillRect(
          Math.floor(screenX - p.size / 2),
          Math.floor(screenY - p.size / 2),
          Math.ceil(p.size),
          Math.ceil(p.size)
        );
      }

      ctx.restore();
    }
  }

  /**
   * Draw sparkle/star shape
   */
  drawSparkle(ctx, x, y, size) {
    const points = 4;
    const innerRadius = size * 0.3;
    const outerRadius = size;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Render shockwaves
   */
  renderShockwaves(ctx, camera) {
    if (!this.game.shockwaves) return;

    for (let i = this.game.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.game.shockwaves[i];

      // Update shockwave
      const progress = 1 - (sw.life / sw.maxLife);
      sw.radius = sw.maxRadius * progress;
      sw.alpha = (sw.life / sw.maxLife) * 0.8;

      // Render
      ctx.save();
      const screenX = sw.x - camera.x;
      const screenY = sw.y - camera.y;

      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.width;
      ctx.beginPath();
      ctx.arc(screenX, screenY, sw.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Remove expired shockwaves
      if (sw.life <= 0) {
        this.game.shockwaves.splice(i, 1);
      }
    }
  }
}
