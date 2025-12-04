/**
 * ThrusterEffects - Particle effects for ship thrusters
 *
 * Creates realistic particle effects for:
 * - Main engine exhaust (scaled to number of engines)
 * - RCS thrusters (side gas puffs when rotating/strafing)
 * - Maneuvering jets (directional thrust visualization)
 *
 * All effects are heavily pixelated for retro aesthetic
 */

export class ThrusterEffects {
  constructor() {
    this.particles = [];
    // ULTRA-ENHANCED: Massively increased to 6000 for EXTREMELY complex, detailed effects with trails
    this.maxParticles = 6000; // Increased from 3600
    // NEW: Trail history for persistent engine trails
    this.trails = [];
    this.maxTrails = 1200; // Increased from 800
    this.trailSegmentInterval = 0.05; // Add trail segment every 50ms
    this.timeSinceTrail = 0;
    // REALISTIC: Vacuum behavior - particles maintain velocity (no air resistance)
    this.vacuumMode = true;
  }

  /**
   * ENHANCED: Generate main engine exhaust particles
   * Scaled based on ship class and number of engines
   * NEW: Support for multiple engine types (fire, blue plasma, etc.)
   */
  generateEngineExhaust(ship, shipClass, particles, particleManager = null) {
    // Safety check
    if (!particles && !particleManager) return;
    if (!ship) return;

    // Determine number of engines based on ship class
    const engineConfig = this.getEngineConfig(shipClass);

    // Only generate if ship is thrusting
    if (!ship.thrust || ship.thrust <= 0) return;

    const thrustIntensity = Math.min(ship.thrust, 1);
    const angle = ship.rotation || 0;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // ENHANCED: Determine engine type based on ship class
    const engineType = this.getEngineType(shipClass, ship);

    // Generate particles for each engine
    for (const engine of engineConfig.engines) {
      // VISIBILITY FIX: Always emit from all engines for visible effect
      // No skip - every engine emits every frame

      // Rotate engine offset by ship rotation
      const rotatedX = engine.x * cos - engine.y * sin;
      const rotatedY = engine.x * sin + engine.y * cos;

      const engineWorldX = ship.x + rotatedX;
      const engineWorldY = ship.y + rotatedY;

      // COMPLEX & REALISTIC: Multi-layer exhaust with small, sharp particles
      const particleCount = Math.max(10, Math.floor(thrustIntensity * engine.size * 8.0)); // Increased from 5.0 to 8.0

      // LAYER 1: Bright core stream (2-3px, white-hot)
      const coreCount = Math.max(3, Math.floor(particleCount * 0.4)); // Increased from 0.3 to 0.4
      for (let i = 0; i < coreCount; i++) {
        const exhaustAngle = angle + Math.PI + (Math.random() - 0.5) * 0.15;
        const exhaustSpeed = 180 + Math.random() * 90;
        const maxLife = 0.3 + Math.random() * 0.2;

        const particleData = {
          x: engineWorldX + (Math.random() - 0.5) * 2,
          y: engineWorldY + (Math.random() - 0.5) * 2,
          vx: Math.cos(exhaustAngle) * exhaustSpeed + ship.vx * 0.3,
          vy: Math.sin(exhaustAngle) * exhaustSpeed + ship.vy * 0.3,
          life: maxLife,
          maxLife: maxLife,
          size: 2 + Math.random() * 1, // Small 2-3px bright core
          color: '#ffffff', // White-hot core
          type: 'engine_exhaust',
          glow: true,
          alpha: 255,
          layer: 'core'
        };

        if (particleManager) {
          particleManager.addParticle(particleData);
        } else if (particles) {
          particles.push(particleData);
        }
      }

      // LAYER 2: Hot main plume (2-4px) - COLOR BASED ON ENGINE TYPE
      const mainCount = Math.max(4, Math.floor(particleCount * 0.5)); // Increased from 0.4 to 0.5
      for (let i = 0; i < mainCount; i++) {
        const exhaustAngle = angle + Math.PI + (Math.random() - 0.5) * 0.3;
        const exhaustSpeed = 140 + Math.random() * 100;
        const maxLife = 0.4 + Math.random() * 0.3;

        const particleData = {
          x: engineWorldX + (Math.random() - 0.5) * 3,
          y: engineWorldY + (Math.random() - 0.5) * 3,
          vx: Math.cos(exhaustAngle) * exhaustSpeed + ship.vx * 0.3,
          vy: Math.sin(exhaustAngle) * exhaustSpeed + ship.vy * 0.3,
          life: maxLife,
          maxLife: maxLife,
          size: 2 + Math.random() * 2, // Small 2-4px hot particles
          color: this.getExhaustColor(thrustIntensity, engineType),  // ENHANCED: Use engine type
          type: 'engine_exhaust',
          glow: true,
          alpha: 255,
          layer: 'main'
        };

        if (particleManager) {
          particleManager.addParticle(particleData);
        } else if (particles) {
          particles.push(particleData);
        }
      }

      // LAYER 3: Cooler outer turbulence (1-2px, dimmer) - MORE particles for dense effect
      const outerCount = Math.max(3, Math.floor(particleCount * 0.4)); // Increased from 0.3 to 0.4
      for (let i = 0; i < outerCount; i++) {
        const exhaustAngle = angle + Math.PI + (Math.random() - 0.5) * 0.5;
        const exhaustSpeed = 100 + Math.random() * 80;
        const maxLife = 0.5 + Math.random() * 0.3;

        const particleData = {
          x: engineWorldX + (Math.random() - 0.5) * 4,
          y: engineWorldY + (Math.random() - 0.5) * 4,
          vx: Math.cos(exhaustAngle) * exhaustSpeed + ship.vx * 0.3,
          vy: Math.sin(exhaustAngle) * exhaustSpeed + ship.vy * 0.3,
          life: maxLife,
          maxLife: maxLife,
          size: 1 + Math.random() * 1, // Tiny 1-2px cooler particles
          color: '#ff6633', // Cooler orange
          type: 'engine_exhaust',
          glow: false,
          alpha: 200,
          layer: 'outer'
        };

        if (particleManager) {
          particleManager.addParticle(particleData);
        } else if (particles) {
          particles.push(particleData);
        }
      }

      // LAYER 4: ENHANCED - Heat shimmer/distortion effect (MORE for visibility in space)
      if (Math.random() > 0.3) { // 70% chance - more frequent
        const shimmerCount = Math.max(2, Math.floor(particleCount * 0.3)); // Increased from 0.2 to 0.3
        for (let i = 0; i < shimmerCount; i++) {
          const shimmerAngle = angle + Math.PI + (Math.random() - 0.5) * 0.7;
          const shimmerSpeed = 80 + Math.random() * 60;
          const maxLife = 0.3 + Math.random() * 0.2;

          const particleData = {
            x: engineWorldX + (Math.random() - 0.5) * 6,
            y: engineWorldY + (Math.random() - 0.5) * 6,
            vx: Math.cos(shimmerAngle) * shimmerSpeed + ship.vx * 0.4,
            vy: Math.sin(shimmerAngle) * shimmerSpeed + ship.vy * 0.4,
            life: maxLife,
            maxLife: maxLife,
            size: 3 + Math.random() * 2, // Larger but transparent
            color: '#ffaa44',
            type: 'engine_exhaust',
            glow: false,
            alpha: 80, // Very transparent
            layer: 'shimmer',
            shimmer: true
          };

          if (particleManager) {
            particleManager.addParticle(particleData);
          } else if (particles) {
            particles.push(particleData);
          }
        }
      }

      // LAYER 5: ENHANCED - More frequent sparks for visual richness
      if (Math.random() > 0.7 && thrustIntensity > 0.5) { // 30% chance when thrusting - more frequent
        const sparkCount = Math.floor(2 + Math.random() * 5); // More sparks (2-7 instead of 1-4)
        for (let i = 0; i < sparkCount; i++) {
          const sparkAngle = angle + Math.PI + (Math.random() - 0.5) * 0.8;
          const sparkSpeed = 200 + Math.random() * 150;
          const maxLife = 0.15 + Math.random() * 0.1;

          const particleData = {
            x: engineWorldX,
            y: engineWorldY,
            vx: Math.cos(sparkAngle) * sparkSpeed + ship.vx * 0.2,
            vy: Math.sin(sparkAngle) * sparkSpeed + ship.vy * 0.2,
            life: maxLife,
            maxLife: maxLife,
            size: 1, // Tiny but super bright
            color: '#ffffff',
            type: 'engine_exhaust',
            glow: true,
            alpha: 255,
            layer: 'spark',
            spark: true
          };

          if (particleManager) {
            particleManager.addParticle(particleData);
          } else if (particles) {
            particles.push(particleData);
          }
        }
      }
    }
  }

  /**
   * ULTRA-ENHANCED: Generate RCS thruster gas puffs
   * Straight high-speed gas ejection, small, scaled by ship size
   */
  generateRCSThrusterPuffs(ship, shipClass, particles, rotationInput, strafeInput, particleManager = null) {
    // Safety check
    if (!particles && !particleManager) return;
    if (!ship) return;

    const rcsConfig = this.getRCSConfig(shipClass);

    // Only generate if ship is rotating or strafing
    const isRotating = Math.abs(rotationInput) > 0.1 || Math.abs(ship.rotationVel || 0) > 0.01;
    const isStrafing = Math.abs(strafeInput) > 0.1;

    if (!isRotating && !isStrafing) return;

    const angle = ship.rotation || 0;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // ENHANCED: Scale effects by ship size
    const shipSizeScale = this.getShipSizeScale(shipClass);

    // Determine which RCS thrusters fire based on rotation/strafe direction
    const activeThrusters = this.determineActiveRCS(rotationInput, strafeInput, rcsConfig);

    for (const thruster of activeThrusters) {
      // ENHANCED: More frequent emission based on ship size (smaller ships fire more frequently)
      const emitChance = 0.85 + (1 - shipSizeScale) * 0.1; // 85-95% emission rate
      if (Math.random() > emitChance) continue;

      // Rotate thruster offset by ship rotation
      const rotatedX = thruster.x * cos - thruster.y * sin;
      const rotatedY = thruster.x * sin + thruster.y * cos;

      const thrusterWorldX = ship.x + rotatedX;
      const thrusterWorldY = ship.y + rotatedY;

      // ENHANCED: STRAIGHT gas ejection - NO angle variation for perfectly straight stream
      const thrustAngle = angle + thruster.direction;

      // ULTRA-HIGH SPEED: 400-650 for high-speed gas ejection
      const puffSpeed = 400 + Math.random() * 250;

      // ENHANCED: Fewer particles for smaller ships, more for larger (but still small bursts)
      const burstCount = Math.floor(2 * shipSizeScale + Math.random() * 2);

      for (let b = 0; b < burstCount; b++) {
        // VERY SHORT life for sharp, fast ejection
        const maxLife = 0.15 + Math.random() * 0.1;

        // Bright white/cyan - very distinctive
        const colorChoice = Math.random();
        const puffColor = colorChoice > 0.6 ? '#ffffff' :   // Bright white
                          colorChoice > 0.3 ? '#aaffff' :   // Bright cyan
                                              '#66ddff';    // Light cyan

        // PERFECTLY STRAIGHT: No angle variation, straight line
        const streakDist = b * 1.0; // Increased spacing for visible stream

        const particleData = {
          x: thrusterWorldX + Math.cos(thrustAngle) * streakDist,
          y: thrusterWorldY + Math.sin(thrustAngle) * streakDist,
          // PERFECTLY STRAIGHT velocity - no variation
          vx: Math.cos(thrustAngle) * puffSpeed + ship.vx * 0.1,
          vy: Math.sin(thrustAngle) * puffSpeed + ship.vy * 0.1,
          life: maxLife,
          maxLife: maxLife,
          // ULTRA-SMALL: 1-2px scaled by ship size
          size: (0.8 + Math.random() * 0.5) * shipSizeScale,
          color: puffColor,
          type: 'rcs_puff',
          glow: true,
          alpha: 255,
          sharp: true, // Marker for sharp rendering
          straight: true // Marker for straight stream rendering
        };

        // FIXED: Use ParticleManager if available, otherwise push to array
        if (particleManager) {
          particleManager.addParticle(particleData);
        } else if (particles) {
          particles.push(particleData);
        }
      }
    }
  }

  /**
   * Get engine configuration for ship class
   * Returns engine positions and sizes
   * FIXED: Better positioned engines that match ship sprite rear
   */
  getEngineConfig(shipClass) {
    switch (shipClass) {
      case 'fighter':
      case 'scout':
        // 2 engines - small fighter (positioned at rear)
        return {
          engines: [
            { x: -20, y: -6, size: 5 },  // Left engine (moved back)
            { x: -20, y: 6, size: 5 }    // Right engine
          ]
        };

      case 'explorer':
      case 'trader':
      case 'research':
        // 3-4 engines - medium ship
        return {
          engines: [
            { x: -22, y: -8, size: 6 },  // Left top
            { x: -22, y: 8, size: 6 },   // Right top
            { x: -22, y: -2, size: 5 },  // Left bottom
            { x: -22, y: 2, size: 5 }    // Right bottom
          ]
        };

      case 'frigate':
      case 'military':
        // 6 engines - medium warship
        return {
          engines: [
            { x: -25, y: -10, size: 7 },  // Top row
            { x: -25, y: -3, size: 7 },
            { x: -25, y: 3, size: 7 },
            { x: -25, y: 10, size: 7 },   // Bottom row
            { x: -25, y: -16, size: 6 },  // Outer engines
            { x: -25, y: 16, size: 6 }
          ]
        };

      case 'cruiser':
      case 'transport':
        // 8 engines - large capital ship
        return {
          engines: [
            { x: -30, y: -18, size: 9 },  // Top row
            { x: -30, y: -10, size: 9 },
            { x: -30, y: -3, size: 9 },
            { x: -30, y: 3, size: 9 },
            { x: -30, y: 10, size: 9 },   // Bottom row
            { x: -30, y: 18, size: 9 },
            { x: -30, y: -24, size: 8 },  // Outer engines
            { x: -30, y: 24, size: 8 }
          ]
        };

      default:
        // Default 2 engines
        return {
          engines: [
            { x: -20, y: -6, size: 5 },
            { x: -20, y: 6, size: 5 }
          ]
        };
    }
  }

  /**
   * Get RCS thruster configuration for ship class
   * Returns thruster positions and firing directions
   */
  getRCSConfig(shipClass) {
    switch (shipClass) {
      case 'fighter':
      case 'scout':
        // 8 RCS thrusters - small ship
        return {
          thrusters: [
            // Top thrusters (fire down)
            { x: 8, y: -12, direction: Math.PI / 2, id: 'top_front' },
            { x: -5, y: -12, direction: Math.PI / 2, id: 'top_rear' },
            // Bottom thrusters (fire up)
            { x: 8, y: 12, direction: -Math.PI / 2, id: 'bottom_front' },
            { x: -5, y: 12, direction: -Math.PI / 2, id: 'bottom_rear' },
            // Left thrusters (fire right)
            { x: 5, y: -18, direction: 0, id: 'left_front' },
            { x: -8, y: -18, direction: 0, id: 'left_rear' },
            // Right thrusters (fire left)
            { x: 5, y: 18, direction: Math.PI, id: 'right_front' },
            { x: -8, y: 18, direction: Math.PI, id: 'right_rear' }
          ]
        };

      case 'explorer':
      case 'trader':
      case 'military':
        // 10-12 RCS thrusters - medium ship
        return {
          thrusters: [
            // Top array (6 thrusters)
            { x: 12, y: -15, direction: Math.PI / 2, id: 'top_front' },
            { x: 5, y: -15, direction: Math.PI / 2, id: 'top_mid_front' },
            { x: -2, y: -15, direction: Math.PI / 2, id: 'top_mid' },
            { x: -9, y: -15, direction: Math.PI / 2, id: 'top_mid_rear' },
            { x: -16, y: -15, direction: Math.PI / 2, id: 'top_rear' },
            { x: 0, y: -20, direction: Math.PI / 2, id: 'top_center' },
            // Bottom array (6 thrusters)
            { x: 12, y: 15, direction: -Math.PI / 2, id: 'bottom_front' },
            { x: 5, y: 15, direction: -Math.PI / 2, id: 'bottom_mid_front' },
            { x: -2, y: 15, direction: -Math.PI / 2, id: 'bottom_mid' },
            { x: -9, y: 15, direction: -Math.PI / 2, id: 'bottom_mid_rear' },
            { x: -16, y: 15, direction: -Math.PI / 2, id: 'bottom_rear' },
            { x: 0, y: 20, direction: -Math.PI / 2, id: 'bottom_center' }
          ]
        };

      case 'frigate':
        // 12 RCS thrusters - frigate
        return {
          thrusters: [
            // Top array (6 thrusters)
            { x: 15, y: -18, direction: Math.PI / 2, id: 'top_1' },
            { x: 8, y: -18, direction: Math.PI / 2, id: 'top_2' },
            { x: 1, y: -18, direction: Math.PI / 2, id: 'top_3' },
            { x: -6, y: -18, direction: Math.PI / 2, id: 'top_4' },
            { x: -13, y: -18, direction: Math.PI / 2, id: 'top_5' },
            { x: -20, y: -18, direction: Math.PI / 2, id: 'top_6' },
            // Bottom array (6 thrusters)
            { x: 15, y: 18, direction: -Math.PI / 2, id: 'bottom_1' },
            { x: 8, y: 18, direction: -Math.PI / 2, id: 'bottom_2' },
            { x: 1, y: 18, direction: -Math.PI / 2, id: 'bottom_3' },
            { x: -6, y: 18, direction: -Math.PI / 2, id: 'bottom_4' },
            { x: -13, y: 18, direction: -Math.PI / 2, id: 'bottom_5' },
            { x: -20, y: 18, direction: -Math.PI / 2, id: 'bottom_6' }
          ]
        };

      case 'cruiser':
      case 'transport':
        // 16 RCS thrusters - large capital ship
        return {
          thrusters: [
            // Top array (8 thrusters)
            { x: 20, y: -22, direction: Math.PI / 2, id: 'top_1' },
            { x: 13, y: -22, direction: Math.PI / 2, id: 'top_2' },
            { x: 6, y: -22, direction: Math.PI / 2, id: 'top_3' },
            { x: -1, y: -22, direction: Math.PI / 2, id: 'top_4' },
            { x: -8, y: -22, direction: Math.PI / 2, id: 'top_5' },
            { x: -15, y: -22, direction: Math.PI / 2, id: 'top_6' },
            { x: -22, y: -22, direction: Math.PI / 2, id: 'top_7' },
            { x: -29, y: -22, direction: Math.PI / 2, id: 'top_8' },
            // Bottom array (8 thrusters)
            { x: 20, y: 22, direction: -Math.PI / 2, id: 'bottom_1' },
            { x: 13, y: 22, direction: -Math.PI / 2, id: 'bottom_2' },
            { x: 6, y: 22, direction: -Math.PI / 2, id: 'bottom_3' },
            { x: -1, y: 22, direction: -Math.PI / 2, id: 'bottom_4' },
            { x: -8, y: 22, direction: -Math.PI / 2, id: 'bottom_5' },
            { x: -15, y: 22, direction: -Math.PI / 2, id: 'bottom_6' },
            { x: -22, y: 22, direction: -Math.PI / 2, id: 'bottom_7' },
            { x: -29, y: 22, direction: -Math.PI / 2, id: 'bottom_8' }
          ]
        };

      default:
        // Default 8 thrusters
        return {
          thrusters: [
            { x: 8, y: -12, direction: Math.PI / 2, id: 'top_front' },
            { x: -5, y: -12, direction: Math.PI / 2, id: 'top_rear' },
            { x: 8, y: 12, direction: -Math.PI / 2, id: 'bottom_front' },
            { x: -5, y: 12, direction: -Math.PI / 2, id: 'bottom_rear' },
            { x: 5, y: -18, direction: 0, id: 'left_front' },
            { x: -8, y: -18, direction: 0, id: 'left_rear' },
            { x: 5, y: 18, direction: Math.PI, id: 'right_front' },
            { x: -8, y: 18, direction: Math.PI, id: 'right_rear' }
          ]
        };
    }
  }

  /**
   * Determine which RCS thrusters should fire based on rotation/strafe input
   */
  determineActiveRCS(rotationInput, strafeInput, rcsConfig) {
    const active = [];

    // Clockwise rotation - fire top-front and bottom-rear
    if (rotationInput > 0.1) {
      active.push(...rcsConfig.thrusters.filter(t =>
        t.id.includes('top_front') ||
        t.id.includes('top_1') ||
        t.id.includes('top_2') ||
        t.id.includes('bottom_rear') ||
        t.id.includes('bottom_5') ||
        t.id.includes('bottom_6')
      ));
    }

    // Counter-clockwise rotation - fire top-rear and bottom-front
    if (rotationInput < -0.1) {
      active.push(...rcsConfig.thrusters.filter(t =>
        t.id.includes('top_rear') ||
        t.id.includes('top_5') ||
        t.id.includes('top_6') ||
        t.id.includes('bottom_front') ||
        t.id.includes('bottom_1') ||
        t.id.includes('bottom_2')
      ));
    }

    // Strafe left - fire right thrusters
    if (strafeInput < -0.1) {
      active.push(...rcsConfig.thrusters.filter(t => t.id.includes('right')));
    }

    // Strafe right - fire left thrusters
    if (strafeInput > 0.1) {
      active.push(...rcsConfig.thrusters.filter(t => t.id.includes('left')));
    }

    return active;
  }

  /**
   * Generate braking thruster particles (forward-facing RCS thrusters)
   * Creates white/cyan gas puffs from front of ship when braking
   */
  generateBrakingThrusterPuffs(ship, shipClass, particles, particleManager = null) {
    // Safety check
    if (!particles && !particleManager) return;
    if (!ship) return;

    const angle = ship.rotation || 0;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Get front thruster positions based on ship class
    const frontThrusters = this.getFrontThrusterConfig(shipClass);

    for (const thruster of frontThrusters) {
      // DISTINCTIVE: Emit very frequently for visible braking
      if (Math.random() > 0.75) continue; // Emit 75% of the time

      // Rotate thruster offset by ship rotation
      const rotatedX = thruster.x * cos - thruster.y * sin;
      const rotatedY = thruster.x * sin + thruster.y * cos;

      const thrusterWorldX = ship.x + rotatedX;
      const thrusterWorldY = ship.y + rotatedY;

      // Braking thrust direction (forward, opposite to ship direction)
      const thrustAngle = angle;
      const puffSpeed = 170 + Math.random() * 130;

      // DISTINCTIVE BRAKING BURST: 4-6 small, bright, sharp particles
      const burstCount = Math.floor(4 + Math.random() * 3);
      for (let b = 0; b < burstCount; b++) {
        const maxLife = 0.2 + Math.random() * 0.2; // Short, sharp bursts

        // Very bright white/cyan for visibility
        const colorChoice = Math.random();
        const puffColor = colorChoice > 0.5 ? '#ffffff' :   // Bright white
                          colorChoice > 0.25 ? '#ccffff' :  // Pale cyan
                                               '#88eeff';   // Cyan

        // Directional offset for streak effect
        const streakDist = b * 0.6;
        const streakAngle = thrustAngle + (Math.random() - 0.5) * 0.25;

        const particleData = {
          x: thrusterWorldX + Math.cos(streakAngle) * streakDist,
          y: thrusterWorldY + Math.sin(streakAngle) * streakDist,
          vx: Math.cos(streakAngle) * puffSpeed + ship.vx * 0.2,
          vy: Math.sin(streakAngle) * puffSpeed + ship.vy * 0.2,
          life: maxLife,
          maxLife: maxLife,
          size: 2 + Math.random() * 1, // Small but visible 2-3px
          color: puffColor,
          type: 'rcs_puff',
          glow: true,
          alpha: 255,
          sharp: true // Marker for sharp rendering
        };

        if (particleManager) {
          particleManager.addParticle(particleData);
        } else if (particles) {
          particles.push(particleData);
        }
      }
    }
  }

  /**
   * Get front thruster configuration for braking
   * Returns thruster positions at front of ship
   */
  getFrontThrusterConfig(shipClass) {
    switch (shipClass) {
      case 'fighter':
      case 'scout':
        return [
          { x: 15, y: -5 },  // Front left
          { x: 15, y: 5 }    // Front right
        ];

      case 'explorer':
      case 'trader':
      case 'research':
        return [
          { x: 18, y: -7 },
          { x: 18, y: 7 },
          { x: 20, y: 0 }    // Front center
        ];

      case 'frigate':
      case 'military':
        return [
          { x: 20, y: -10 },
          { x: 20, y: 10 },
          { x: 22, y: -4 },
          { x: 22, y: 4 }
        ];

      case 'cruiser':
      case 'transport':
        return [
          { x: 25, y: -12 },
          { x: 25, y: 12 },
          { x: 28, y: -6 },
          { x: 28, y: 6 },
          { x: 30, y: 0 }
        ];

      default:
        return [
          { x: 15, y: -5 },
          { x: 15, y: 5 }
        ];
    }
  }

  /**
   * ENHANCED: Determine engine type based on ship class
   * Returns: 'fire', 'plasma_blue', 'plasma_red', 'ion', 'antimatter'
   */
  getEngineType(shipClass, ship) {
    switch (shipClass) {
      case 'scout':
      case 'explorer':
        return 'plasma_blue';  // FUTURISTIC blue plasma for scouts/explorers
      case 'fighter':
      case 'military':
        return 'plasma_red';   // Red plasma for combat ships
      case 'frigate':
      case 'cruiser':
        return 'ion';          // Ion engines for large ships
      case 'research':
        return 'antimatter';   // Exotic antimatter for research vessels
      case 'trader':
      case 'transport':
      default:
        return 'fire';         // Traditional fire for civilian ships
    }
  }

  /**
   * NEW: Get ship size scale for scaling effects
   * Returns: 0.5 (small) to 2.0 (huge)
   */
  getShipSizeScale(shipClass) {
    switch (shipClass) {
      case 'scout':
        return 0.5;  // Tiny
      case 'fighter':
        return 0.7;  // Small
      case 'explorer':
      case 'trader':
        return 1.0;  // Medium
      case 'military':
      case 'research':
        return 1.2;  // Medium-large
      case 'frigate':
        return 1.5;  // Large
      case 'cruiser':
        return 1.8;  // Very large
      case 'transport':
        return 2.0;  // Huge
      default:
        return 1.0;  // Default medium
    }
  }

  /**
   * ENHANCED: Get exhaust color based on thrust intensity AND engine type
   * Support for multiple engine types with distinct color palettes
   */
  getExhaustColor(intensity, engineType = 'fire') {
    let colors;

    switch (engineType) {
      case 'plasma_blue':  // FUTURISTIC BLUE PLASMA
        colors = [
          '#0044ff', // Deep blue
          '#2266ff', // Blue
          '#4488ff', // Light blue
          '#66aaff', // Bright blue
          '#88ccff'  // Cyan
        ];
        break;

      case 'plasma_red':  // RED/MAGENTA PLASMA
        colors = [
          '#ff0044', // Deep red-magenta
          '#ff2266', // Red-magenta
          '#ff4488', // Pink-magenta
          '#ff66aa', // Light magenta
          '#ff88cc'  // Pale magenta
        ];
        break;

      case 'ion':  // BLUE-WHITE ION
        colors = [
          '#4488ff', // Blue
          '#66aaff', // Light blue
          '#88ccff', // Cyan
          '#aaeeff', // Pale cyan
          '#ccffff'  // White-cyan
        ];
        break;

      case 'antimatter':  // PURPLE-WHITE EXOTIC
        colors = [
          '#8844ff', // Purple
          '#aa66ff', // Light purple
          '#cc88ff', // Pale purple
          '#eeaaff', // Pink-purple
          '#ffccff'  // White-purple
        ];
        break;

      case 'fire':  // TRADITIONAL ORANGE/YELLOW FIRE
      default:
        colors = [
          '#ff4400', // Orange-red
          '#ff6622', // Orange
          '#ff8844', // Light orange
          '#ffaa66', // Yellow-orange
          '#ffcc88'  // Yellow
        ];
        break;
    }

    // Higher intensity = hotter (brighter colors)
    const index = Math.floor(intensity * (colors.length - 1));
    return colors[Math.min(index, colors.length - 1)];
  }

  /**
   * NEW: Generate persistent engine trails
   * Creates long-lasting trail segments that follow ship movement
   */
  generateEngineTrails(ship, shipClass, dt) {
    if (!ship || !ship.thrust || ship.thrust <= 0) return;

    this.timeSinceTrail += dt;

    // Only add trail segments periodically
    if (this.timeSinceTrail < this.trailSegmentInterval) return;
    this.timeSinceTrail = 0;

    const engineConfig = this.getEngineConfig(shipClass);
    const angle = ship.rotation || 0;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const thrustIntensity = Math.min(ship.thrust, 1);

    // Create trail segment for each engine
    for (const engine of engineConfig.engines) {
      // Rotate engine offset by ship rotation
      const rotatedX = engine.x * cos - engine.y * sin;
      const rotatedY = engine.x * sin + engine.y * cos;

      const engineWorldX = ship.x + rotatedX;
      const engineWorldY = ship.y + rotatedY;

      // Create trail segment
      const trailSegment = {
        x: engineWorldX,
        y: engineWorldY,
        vx: ship.vx * 0.5, // Trail drifts with ship velocity
        vy: ship.vy * 0.5,
        life: 0.8 + Math.random() * 0.4, // Long-lasting (0.8-1.2 seconds)
        maxLife: 1.0,
        size: engine.size * thrustIntensity * 1.5,
        color: this.getTrailColor(thrustIntensity),
        alpha: 180 * thrustIntensity,
        glow: true
      };

      this.trails.push(trailSegment);
    }

    // Limit trail count
    while (this.trails.length > this.maxTrails) {
      this.trails.shift();
    }
  }

  /**
   * Get trail color based on thrust intensity
   */
  getTrailColor(intensity) {
    const colors = [
      '#ff2200', // Deep red
      '#ff4400', // Red-orange
      '#ff6622', // Orange
      '#ff8844'  // Light orange
    ];

    const index = Math.floor(intensity * (colors.length - 1));
    return colors[Math.min(index, colors.length - 1)];
  }

  /**
   * Update all thruster particles and trails
   */
  update(dt, particles) {
    if (!particles) return;

    // Update particle lifetimes
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (p.type === 'engine_exhaust' || p.type === 'rcs_puff') {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Fade out
        const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
        p.alpha = Math.floor(alpha * 255);

        // Slow growth instead of shrinking (more realistic exhaust plume)
        p.size *= 1.01;

        // Remove dead particles or too large
        if (p.life <= 0 || p.size > 20) {
          particles.splice(i, 1);
        }
      }
    }

    // Update trail segments
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const trail = this.trails[i];

      trail.life -= dt;
      trail.x += trail.vx * dt;
      trail.y += trail.vy * dt;

      // Fade out and grow
      const lifeRatio = trail.life / trail.maxLife;
      trail.alpha = Math.floor(lifeRatio * 180);
      trail.size *= 1.005; // Very slow expansion

      // Remove dead trails
      if (trail.life <= 0) {
        this.trails.splice(i, 1);
      }
    }
  }

  /**
   * Render thruster particles and trails
   * ULTRA-ENHANCED: Dramatic glow effects and persistent trails
   */
  render(ctx, particles, camera) {
    // FIXED: Add comprehensive null checks
    if (!particles || !ctx || !camera) return;
    if (!ctx.canvas) return; // CRITICAL: Check canvas exists
    if (typeof camera.x !== 'number' || typeof camera.y !== 'number') return;

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // PASS 1: Render persistent engine trails FIRST (background layer)
    for (const trail of this.trails) {
      if (!trail || typeof trail.x !== 'number' || typeof trail.y !== 'number') continue;

      const screenX = trail.x - camera.x;
      const screenY = trail.y - camera.y;

      // Skip if off-screen (with margin)
      if (screenX < -100 || screenX > canvasWidth + 100 ||
          screenY < -100 || screenY > canvasHeight + 100) {
        continue;
      }

      ctx.save();

      // ULTRA-DRAMATIC glow for trails
      if (trail.glow && trail.alpha > 30) {
        ctx.shadowColor = trail.color;
        ctx.shadowBlur = 16; // Larger glow
      }

      // Set alpha
      const baseAlpha = (trail.alpha !== undefined ? trail.alpha : 180) / 255;
      ctx.globalAlpha = Math.max(0, Math.min(1, baseAlpha));

      // Draw pixelated trail segment
      ctx.fillStyle = trail.color;
      const pixelSize = Math.max(3, Math.floor(trail.size / 1.5));
      const pixelX = Math.floor(screenX / pixelSize) * pixelSize;
      const pixelY = Math.floor(screenY / pixelSize) * pixelSize;

      // Draw trail cluster
      const clusterSize = Math.max(1, Math.floor(trail.size / 3));
      for (let py = -clusterSize; py <= clusterSize; py++) {
        for (let px = -clusterSize; px <= clusterSize; px++) {
          const dist = Math.sqrt(px * px + py * py);
          if (dist <= clusterSize) {
            ctx.fillRect(
              pixelX + px * pixelSize,
              pixelY + py * pixelSize,
              pixelSize,
              pixelSize
            );
          }
        }
      }

      ctx.restore();
    }

    // PASS 2: Render thruster particles (foreground layer)
    for (const p of particles) {
      if (p.type !== 'engine_exhaust' && p.type !== 'rcs_puff') continue;
      if (!p || typeof p.x !== 'number' || typeof p.y !== 'number') continue;

      // FIXED: Use same coordinate system as other particles (camera already includes centering)
      const screenX = p.x - camera.x;
      const screenY = p.y - camera.y;

      // Skip if off-screen (with margin)
      if (screenX < -100 || screenX > canvasWidth + 100 ||
          screenY < -100 || screenY > canvasHeight + 100) {
        continue;
      }

      ctx.save();

      // ULTRA-ENHANCED: Dramatic multi-layer glow effect
      if (p.glow) {
        // Layer 1: Outer soft glow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14; // Larger, softer glow

        // Layer 2: Bright inner glow for core particles
        if (p.layer === 'core' || p.spark) {
          ctx.shadowBlur = 18; // Extra dramatic for core/sparks
        }
      }

      // Set alpha
      const baseAlpha = (p.alpha !== undefined ? p.alpha : 255) / 255;
      ctx.globalAlpha = Math.max(0, Math.min(1, baseAlpha));

      // VISIBILITY FIX: Larger, more visible pixelated particles
      ctx.fillStyle = p.color;
      const pixelSize = Math.max(4, Math.floor(p.size / 2)); // Scale with particle size

      const pixelX = Math.floor(screenX / pixelSize) * pixelSize;
      const pixelY = Math.floor(screenY / pixelSize) * pixelSize;

      // Draw pixelated particle cluster for more visibility
      const clusterSize = Math.max(1, Math.floor(p.size / 4));
      for (let py = -clusterSize; py <= clusterSize; py++) {
        for (let px = -clusterSize; px <= clusterSize; px++) {
          const dist = Math.sqrt(px * px + py * py);
          if (dist <= clusterSize) {
            ctx.fillRect(
              pixelX + px * pixelSize,
              pixelY + py * pixelSize,
              pixelSize,
              pixelSize
            );
          }
        }
      }

      // Add bright center for engine exhaust
      if (p.type === 'engine_exhaust' && baseAlpha > 0.4) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pixelX - 2, pixelY - 2, 4, 4);
      }

      ctx.restore();
    }
  }
}
