/**
 * PhysicsEngine - Handles all game physics including movement, collisions, and interactions
 * Extracted from Game.js to improve code organization
 */
import { MiningSystem } from './MiningSystem.js';
import { getSystemSize } from './ScaleSystem.js';
import { ThrusterEffects } from './ThrusterEffects.js';
import { updateProjectile } from './WeaponSystem.js';

export class PhysicsEngine {
  constructor(game) {
    this.game = game;
  }

  /**
   * Main physics update - handles player movement, collisions, resource regeneration, etc.
   */
  update(dt) {
    const p = this.game.player;

    // Initialize mining system on first frame (after 'this' is fully constructed)
    if (!this.game.miningSystemReady) {
      this.game.miningSystem = new MiningSystem(this.game);
      this.game.miningSystemReady = true;
    }

    // PERFORMANCE: Progressive planet sprite generation - generate 1 planet per frame
    if (this.game.needsPlanetSpriteGeneration && this.game.planetSpriteGenerationQueue && this.game.planetSpriteGenerationQueue.length > 0) {
      const planetIdx = this.game.planetSpriteGenerationQueue.shift();
      const planet = this.game.planets[planetIdx];

      if (planet && this.game.spriteManager) {
        try {
          // Generate sprite for this one planet (non-blocking)
          const spriteGenData = {
            name: this.game.currentSystemData.name,
            seed: this.game.currentSystemData.seed,
            star: null, // Already generated
            planets: [{ ...planet, index: planetIdx }] // Just this one planet
          };
          this.game.spriteManager.generateSystemSprites(spriteGenData, () => {});
        } catch (e) {
          // Ignore errors - will use procedural rendering
        }
      }

      if (this.game.planetSpriteGenerationQueue.length === 0) {
        this.game.needsPlanetSpriteGeneration = false;
      }
    }

    // Handle landed state (surface operations)
    if (p.landed) {
      // Launch with Space key
      if (this.game.input.keys.has('Space') || this.game.input.keys.has('KeyL')) {
        this.game.launchFromSurface();
      }

      // Collect resources with C or E key
      if (this.game.input.keys.has('KeyC') || this.game.input.keys.has('KeyE')) {
        this.game.collectSurfaceResources();
        // Remove key to prevent repeated collection
        this.game.input.keys.delete('KeyC');
        this.game.input.keys.delete('KeyE');
      }

      // Skip normal movement physics when landed
      return;
    }

    // Rotation with momentum (RCS thruster effects now handled by ThrusterEffects system)
    if (this.game.input.rotation !== 0) {
      p.rotationVel += this.game.input.rotation * 10 * dt;

      // PERFORMANCE: Legacy RCS particles disabled - using ThrusterEffects system instead
      // (Old code removed to eliminate duplicate particle generation)
    }
    p.rotationVel *= 0.90;
    p.rotation += p.rotationVel * dt;

    // CRASH FIX: Validate rotation to prevent NaN corruption
    if (isNaN(p.rotation) || !isFinite(p.rotation)) {
      console.error('[PhysicsEngine] Invalid rotation detected, resetting to 0');
      p.rotation = 0;
      p.rotationVel = 0;
    }
    if (isNaN(p.rotationVel) || !isFinite(p.rotationVel)) {
      console.error('[PhysicsEngine] Invalid rotationVel detected, resetting to 0');
      p.rotationVel = 0;
    }

    // PERFORMANCE FIX: Instantiate thruster effects immediately instead of lazy loading
    // This eliminates lag spike during first rotation
    if (!this.game.thrusterEffects && (Math.abs(this.game.input.rotation) > 0.1 || Math.abs(p.rotationVel) > 0.01)) {
      this.game.thrusterEffects = new ThrusterEffects();
    }

    // ENHANCED: Generate RCS thruster puffs when rotating
    if (this.game.thrusterEffects && (Math.abs(this.game.input.rotation) > 0.1 || Math.abs(p.rotationVel) > 0.01)) {
      this.game.thrusterEffects.generateRCSThrusterPuffs(
        p,
        this.game.gameConfig.shipClass || 'explorer',
        this.game.particles,
        this.game.input.rotation,
        0, // No strafe for now
        this.game.particleManager // FIXED: Pass ParticleManager for proper integration
      );
    }

    // Forward thrust (main engine)
    if (this.game.input.thrust > 0 && p.fuel > 0 && p.power > 5) {
      const force = this.game.input.thrust * 300;
      p.vx += Math.cos(p.rotation) * force * dt;
      p.vy += Math.sin(p.rotation) * force * dt;
      // REALISTIC MECHANICS: Fuel consumption scales with ship mass
      const massFactor = (p.mass || 100) / 100; // Normalized to base mass
      p.fuel -= Math.abs(this.game.input.thrust) * 12 * dt * massFactor;
      p.power -= Math.abs(this.game.input.thrust) * 2.5 * dt;

      // FIXED: Set thrust on player object so ThrusterEffects can see it
      p.thrust = this.game.input.thrust;

      // ENHANCED: Multi-engine exhaust based on ship class
      if (this.game.thrusterEffects) {
        this.game.thrusterEffects.generateEngineExhaust(
          p,
          this.game.gameConfig.shipClass || 'explorer',
          this.game.particles,
          this.game.particleManager // FIXED: Pass ParticleManager for proper integration
        );
      }
    } else {
      // Clear thrust when not thrusting
      p.thrust = 0;

      // PERFORMANCE: Legacy ParticleManager engine particles disabled to avoid duplication
      // (ThrusterEffects now handles all engine exhaust)
    }

    // Brake (ENHANCED: forward-facing RCS thrusters for braking)
    if (this.game.input.brake && p.power > 10) {
      p.vx *= 0.93;
      p.vy *= 0.93;
      p.power -= 6 * dt;

      // ENHANCED: Generate braking thruster puffs (white/cyan gas from front)
      if (this.game.thrusterEffects) {
        this.game.thrusterEffects.generateBrakingThrusterPuffs(
          p,
          this.game.gameConfig.shipClass || 'explorer',
          this.game.particles,
          this.game.particleManager
        );
      }
    }

    // Reverse thrust (S key or down arrow) - SUBTLE
    if (this.game.input.thrust < 0 && p.fuel > 0 && p.power > 5) {
      const force = Math.abs(this.game.input.thrust) * 150;
      p.vx += Math.cos(p.rotation + Math.PI) * force * dt;
      p.vy += Math.sin(p.rotation + Math.PI) * force * dt;
      p.fuel -= Math.abs(this.game.input.thrust) * 8 * dt;
      p.power -= Math.abs(this.game.input.thrust) * 2 * dt;

      // OPTIMIZED: Significantly reduced retro particles
      if (Math.random() > 0.92 && this.game.particleManager) { // Only 8% of the time
        this.game.particleManager.addParticle({
          x: p.x + Math.cos(p.rotation) * 16,
          y: p.y + Math.sin(p.rotation) * 16,
          vx: Math.cos(p.rotation) * 60 + p.vx * 0.4,
          vy: Math.sin(p.rotation) * 60 + p.vy * 0.4,
          life: 0.2,
          maxLife: 0.2,
          size: 1,
          color: '#bbddff',
          type: 'retro'
        });
      }
    }

    // Shield
    if (this.game.input.shield && p.shields > 20 && p.shieldCooldown <= 0) {
      p.shieldActive = true;
      p.shields -= 15 * dt;
    } else {
      p.shieldActive = false;
    }

    // Warp drive (ENHANCED: increased speed from 25 to 100)
    // Now consumes only energy/power, not fuel
    if (this.game.input.warp && p.power > 50 && p.warpCooldown <= 0) {
      p.warpCharge = Math.min(p.warpCharge + dt / 2.5, 1);

      // Start black hole warp effect when charging begins
      if (p.warpCharge > 0.15 && !this.game.blackHoleWarpEffect.active) {
        this.game.blackHoleWarpEffect.start(p.x, p.y);
      }

      if (p.warpCharge >= 1) {
        p.warpActive = true;
        const warpSpeed = 500; // ENHANCED: Increased from 250 to 500 for ultra-fast warp flight
        p.vx += Math.cos(p.rotation) * warpSpeed;
        p.vy += Math.sin(p.rotation) * warpSpeed;
        // Warp drive consumes 27 units/s (powerRegen is 25, so net -2 units/s drain)
        p.power -= 27 * dt;

        // Keep old particle effect as backup/additional effect (optional)
        // if (this.game.particleManager) {
        //   this.game.particleManager.createWarpParticles(
        //     p.x, p.y, p.rotation, this.game.time, this.game.PALETTE
        //   );
        // }
      }
    } else {
      if (p.warpCharge >= 1) {
        p.warpCooldown = 3;
      }
      p.warpCharge *= 0.93;
      p.warpActive = false;

      // Stop black hole warp effect when warp deactivates
      if (this.game.blackHoleWarpEffect.active) {
        this.game.blackHoleWarpEffect.stop();
      }
    }

    // BUGFIX: Ensure effect is stopped if warp charge is too low (prevents stuck effect)
    if (this.game.blackHoleWarpEffect.active && p.warpCharge < 0.1) {
      this.game.blackHoleWarpEffect.stop();
    }

    // Update black hole warp effect (uses relative coords internally - zero lag!)
    if (this.game.blackHoleWarpEffect.active) {
      this.game.blackHoleWarpEffect.update(dt, p.x, p.y);
    }

    p.warpCooldown = Math.max(0, p.warpCooldown - dt);
    p.shieldCooldown = Math.max(0, p.shieldCooldown - dt);

    // REALISTIC UPGRADE: Update celestial rotations, atmospheres, and orbits
    try {
      // PERFORMANCE FIX: Add null checks to prevent crashes during lazy loading
      // Update space environment (drift, twinkle, etc.)
      if (this.game.spaceEnvironmentRenderer) {
        this.game.spaceEnvironmentRenderer.update(dt, this.game.time);
      }

      // Update star rotation
      if (this.game.celestialRotation) {
        this.game.celestialRotation.update(this.game.star, dt);
      }

      // Update planets - CRASH FIX: Validate planets array exists and has items
      if (this.game.planets && Array.isArray(this.game.planets)) {
        for (const planet of this.game.planets) {
          // CRASH FIX: Skip if planet is invalid
          if (!planet) continue;

          // Update rotation
          if (this.game.celestialRotation) {
            this.game.celestialRotation.update(planet, dt);
          }

          // Update orbital position if using realistic orbital mechanics
          const orbitUpdate = this.game.orbitalMechanics ? this.game.orbitalMechanics.updateOrbit(planet, dt) : null;
          if (orbitUpdate) {
            // Use orbit X/Y if available, otherwise use traditional angle
            planet.x = orbitUpdate.position.x;
            planet.y = orbitUpdate.position.y;
          } else {
            // Fallback to traditional circular orbit
            planet.angle = planet.angle || 0;
            planet.orbitSpeed = planet.orbitSpeed || 0;
            planet.angle += planet.orbitSpeed * dt;
            if (this.game.star) {
              planet.x = this.game.star.x + Math.cos(planet.angle) * planet.distance;
              planet.y = this.game.star.y + Math.sin(planet.angle) * planet.distance;
            }
          }

          // Traditional rotation fallback
          if (!this.game.celestialRotation || !this.game.celestialRotation.getRotation(planet)) {
            planet.rotation = planet.rotation || 0;
            planet.rotationSpeed = planet.rotationSpeed || 0;
            planet.rotation += planet.rotationSpeed * dt;
          }

          // Update atmospheric effects
          if (this.game.atmosphericEffects) {
            this.game.atmosphericEffects.update(planet, dt, this.game.time);
          }

          // Update moons - CRASH FIX: Validate moons array exists
          if (planet.moons && Array.isArray(planet.moons)) {
            for (const moon of planet.moons) {
              // CRASH FIX: Skip if moon is invalid
              if (!moon) continue;

              // CRASH FIX: Add null check for celestialRotation
              if (this.game.celestialRotation) {
                this.game.celestialRotation.update(moon, dt);
              }

              // CRASH FIX: Add null check for orbitalMechanics
              const moonOrbit = this.game.orbitalMechanics ? this.game.orbitalMechanics.updateOrbit(moon, dt) : null;
              if (moonOrbit) {
                moon.x = moonOrbit.position.x;
                moon.y = moonOrbit.position.y;
              } else {
                moon.angle = moon.angle || 0;
                moon.orbitSpeed = moon.orbitSpeed || 0;
                moon.angle += moon.orbitSpeed * dt;
                moon.x = planet.x + Math.cos(moon.angle) * moon.distance;
                moon.y = planet.y + Math.sin(moon.angle) * moon.distance;
              }
            }
          }
        }
      }
    } catch (error) {
      // Fallback to traditional updates if realistic systems fail
      console.warn('[PhysicsEngine] Celestial update error, using fallback:', error.message);
      // CRASH FIX: Validate arrays in fallback too
      if (this.game.planets && Array.isArray(this.game.planets)) {
        for (const planet of this.game.planets) {
          if (!planet) continue;
          planet.angle = planet.angle || 0;
          planet.orbitSpeed = planet.orbitSpeed || 0;
          planet.rotation = planet.rotation || 0;
          planet.rotationSpeed = planet.rotationSpeed || 0;
          planet.angle += planet.orbitSpeed * dt;
          planet.rotation += planet.rotationSpeed * dt;
          if (this.game.star) {
            planet.x = this.game.star.x + Math.cos(planet.angle) * planet.distance;
            planet.y = this.game.star.y + Math.sin(planet.angle) * planet.distance;
          }

          if (planet.moons && Array.isArray(planet.moons)) {
            for (const moon of planet.moons) {
              if (!moon) continue;
              moon.angle = moon.angle || 0;
              moon.orbitSpeed = moon.orbitSpeed || 0;
              moon.angle += moon.orbitSpeed * dt;
              moon.x = planet.x + Math.cos(moon.angle) * moon.distance;
              moon.y = planet.y + Math.sin(moon.angle) * moon.distance;
            }
          }
        }
      }
    }

    // CRASH FIX: Validate asteroids array
    if (this.game.asteroids && Array.isArray(this.game.asteroids)) {
      for (const asteroid of this.game.asteroids) {
        if (!asteroid) continue;
        asteroid.angle = asteroid.angle || 0;
        asteroid.orbitSpeed = asteroid.orbitSpeed || 0;
        asteroid.rotation = asteroid.rotation || 0;
        asteroid.rotationSpeed = asteroid.rotationSpeed || 0;
        asteroid.angle += asteroid.orbitSpeed * dt;
        asteroid.rotation += asteroid.rotationSpeed * dt;
        // Calculate absolute position for collision/mining system
        if (this.game.star) {
          asteroid.x = this.game.star.x + Math.cos(asteroid.angle) * asteroid.distance;
          asteroid.y = this.game.star.y + Math.sin(asteroid.angle) * asteroid.distance;
        }
      }
    }

    // CRASH FIX: Validate stations array
    if (this.game.stations && Array.isArray(this.game.stations)) {
      for (const station of this.game.stations) {
        if (!station) continue;
        station.angle = station.angle || 0;
        station.orbitSpeed = station.orbitSpeed || 0;
        station.rotation = station.rotation || 0;
        station.rotationSpeed = station.rotationSpeed || 0;
        station.angle += station.orbitSpeed * dt;
        station.rotation += station.rotationSpeed * dt;
      }
    }

    // CRASH FIX: Validate comets array
    if (this.game.comets && Array.isArray(this.game.comets)) {
      for (const comet of this.game.comets) {
        if (!comet) continue;
        comet.angle = comet.angle || 0;
        comet.orbitSpeed = comet.orbitSpeed || 0;
        comet.angle += comet.orbitSpeed * dt;
      }
    }

    // CRASH FIX: Validate megastructures array
    if (this.game.megastructures && Array.isArray(this.game.megastructures)) {
      for (const megastructure of this.game.megastructures) {
        if (!megastructure || !megastructure.update) continue;
        megastructure.update(dt);
      }
    }

    // Handle mining
    if (this.game.miningSystem && this.game.scene === 'system') {
      if (this.game.input.mining && !this.game.miningSystem.isMining()) {
        const result = this.game.miningSystem.startMining();
        if (result.success) {
          // Mining started
        } else if (result.reason === 'no_target') {
          // No asteroid in range - could show message
        }
      } else if (!this.game.input.mining && this.game.miningSystem.isMining()) {
        this.game.miningSystem.stopMining();
      }

      if (this.game.miningSystem.isMining()) {
        const result = this.game.miningSystem.update(dt);
        if (result && result.success && result.resources) {
          // Mining completed!

          // Show notification
          this.game.notifications = this.game.notifications || [];
          for (const item of result.resources) {
            this.game.notifications.push({
              message: `+${item.quantity} ${item.resource.name}`,
              life: 3.0,
              color: item.resource.color
            });
          }
        }
      }
    }

    // FIX: Null check for star object (may be undefined during initialization)
    if (this.game.star) {
      this.game.star.coronaPhase += dt;
    }

    // Advanced gravity system
    // FIX: Only apply gravity if star exists
    if (this.game.star && this.game.advancedPhysics) {
      const gravitationalBodies = [this.game.star, ...this.game.planets.map(pl => ({
        x: this.game.star.x + Math.cos(pl.angle) * pl.distance,
        y: this.game.star.y + Math.sin(pl.angle) * pl.distance,
        mass: pl.mass,
        radius: pl.radius,
        vx: 0,
        vy: 0
      }))];

      const gravityInfo = this.game.advancedPhysics.applyGravity(p, gravitationalBodies, dt);

      // Show gravity well warning
      if (gravityInfo.inGravityWell) {
        this.game.gravityWarning = gravityInfo.closestBody;
      } else {
        this.game.gravityWarning = null;
      }

      // Check tidal forces near massive objects
      if (gravityInfo.closestBody) {
        const tidalInfo = this.game.advancedPhysics.calculateTidalForces(p, gravityInfo.closestBody);
        if (tidalInfo.isDestroying) {
          p.hull -= 50 * dt; // Ship being torn apart!
        }
        this.game.tidalWarning = tidalInfo.warningLevel;
      }
    }

    // ORBIT MAINTENANCE: Keep player in stable circular orbit around selected body
    if (p.inOrbit && p.orbitingBody && p.orbitingBody.object) {
      const targetObj = p.orbitingBody.object;
      let targetX, targetY;

      // Calculate target body's current position
      if (p.orbitingBody.type === 'planet') {
        targetX = this.game.star.x + Math.cos(targetObj.angle) * targetObj.distance;
        targetY = this.game.star.y + Math.sin(targetObj.angle) * targetObj.distance;
      } else if (p.orbitingBody.type === 'moon') {
        // Find parent planet
        let parentPlanet = null;
        for (const planet of this.game.planets) {
          if (planet.moons && planet.moons.includes(targetObj)) {
            parentPlanet = planet;
            break;
          }
        }
        if (parentPlanet) {
          const planetX = this.game.star.x + Math.cos(parentPlanet.angle) * parentPlanet.distance;
          const planetY = this.game.star.y + Math.sin(parentPlanet.angle) * parentPlanet.distance;
          targetX = planetX + Math.cos(targetObj.angle) * targetObj.distance;
          targetY = planetY + Math.sin(targetObj.angle) * targetObj.distance;
        }
      } else if (p.orbitingBody.type === 'station') {
        targetX = this.game.star.x + Math.cos(targetObj.angle) * targetObj.distance;
        targetY = this.game.star.y + Math.sin(targetObj.angle) * targetObj.distance;
      } else if (p.orbitingBody.type === 'asteroid') {
        targetX = this.game.star.x + Math.cos(targetObj.angle) * targetObj.distance;
        targetY = this.game.star.y + Math.sin(targetObj.angle) * targetObj.distance;
      }

      if (targetX !== undefined && targetY !== undefined) {
        // Calculate distance and angle from target
        const dx = p.x - targetX;
        const dy = p.y - targetY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);

        // Safety check: prevent division by zero or invalid calculations
        const orbitRadius = targetObj.radius || 50;
        const minDistance = orbitRadius * 1.5;

        if (currentDistance < minDistance || currentDistance < 1) {
          // Too close - cancel orbit to prevent math errors
          p.inOrbit = false;
          p.orbitingBody = null;
        } else {
          const currentAngle = Math.atan2(dy, dx);

          // Calculate required orbital velocity for circular orbit
          // v = sqrt(GM/r), where G = 0.5 (from AdvancedPhysics)
          const orbitalSpeed = Math.sqrt((targetObj.mass || 1000) * 0.5 / currentDistance);

          // Validate orbital speed is a real number
          if (!isNaN(orbitalSpeed) && isFinite(orbitalSpeed)) {
            // Velocity should be perpendicular to radius vector (tangent to circle)
            const perpAngle = currentAngle + Math.PI / 2;
            const targetVx = Math.cos(perpAngle) * orbitalSpeed;
            const targetVy = Math.sin(perpAngle) * orbitalSpeed;

            // Smoothly adjust velocity towards orbital velocity (prevents jitter)
            const adjustmentRate = 0.15; // 15% per frame - smooth but responsive
            p.vx += (targetVx - p.vx) * adjustmentRate;
            p.vy += (targetVy - p.vy) * adjustmentRate;
          } else {
            // Invalid orbital speed - cancel orbit
            p.inOrbit = false;
            p.orbitingBody = null;
          }
        }

        // Cancel orbit if player thrusts (wants manual control) or too far from target
        if (this.game.input.thrust !== 0 || this.game.input.brake || currentDistance > orbitRadius * 10) {
          p.inOrbit = false;
          p.orbitingBody = null;
        }
      }
    }

    // Velocity limiting (INCREASED: warp max speed from 800 to 3000)
    // PERFORMANCE: Use squared distance to avoid sqrt
    const maxSpeed = p.warpActive ? 3000 : 400;
    const speedSq = p.vx * p.vx + p.vy * p.vy;
    const maxSpeedSq = maxSpeed * maxSpeed;
    if (speedSq > maxSpeedSq) {
      const speed = Math.sqrt(speedSq); // Only calculate sqrt when needed
      p.vx = (p.vx / speed) * maxSpeed;
      p.vy = (p.vy / speed) * maxSpeed;
    }

    // Drag (reduced during warp for higher top speed)
    const dragFactor = p.warpActive ? 0.9995 : 0.997; // Minimal drag during warp
    p.vx *= dragFactor;
    p.vy *= dragFactor;

    // Update position
    // CRASH FIX: Validate velocity before updating position to prevent NaN/Infinity corruption
    if (isNaN(p.vx) || !isFinite(p.vx)) {
      console.error('[PhysicsEngine] Invalid vx detected, resetting to 0');
      p.vx = 0;
    }
    if (isNaN(p.vy) || !isFinite(p.vy)) {
      console.error('[PhysicsEngine] Invalid vy detected, resetting to 0');
      p.vy = 0;
    }

    // Cap maximum velocity to prevent extreme values (1500 units/s = ~3x warp speed)
    const MAX_VELOCITY = 1500;
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > MAX_VELOCITY) {
      const scale = MAX_VELOCITY / speed;
      p.vx *= scale;
      p.vy *= scale;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // CRASH FIX: Validate position after update to prevent NaN/Infinity corruption
    if (isNaN(p.x) || !isFinite(p.x)) {
      console.error('[PhysicsEngine] Invalid x position detected, resetting to star position');
      p.x = this.game.star?.x || 0;
      p.vx = 0;
    }
    if (isNaN(p.y) || !isFinite(p.y)) {
      console.error('[PhysicsEngine] Invalid y position detected, resetting to star position');
      p.y = this.game.star?.y || 0;
      p.vy = 0;
    }

    // Systems
    p.power = Math.min(p.power + p.powerRegen * dt, p.maxPower);

    // REALISTIC MECHANICS: Shield regeneration slower when heavily damaged
    if (p.shields < p.maxShields && !p.shieldActive) {
      const shieldPercent = p.shields / p.maxShields;
      // Slower regen when shields below 30% (damaged systems)
      const regenMultiplier = shieldPercent < 0.3 ? 0.5 : 1.0;
      p.shields = Math.min(p.shields + p.shieldRecharge * dt * regenMultiplier, p.maxShields);
    }

    p.damageFlash *= 0.85;

    // Enemy AI and physics
    for (let i = this.game.enemies.length - 1; i >= 0; i--) {
      const enemy = this.game.enemies[i];

      // Update using AlienShip class (all enemies should be AlienShip instances)
      if (enemy.update) {
        enemy.update(dt, p, this.game.enemies, this.game.projectiles);
      } else {
        // SAFETY: Minimal fallback for any non-AlienShip enemies
        console.warn('[PhysicsEngine] Enemy without update method detected - skipping AI');
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;
        enemy.vx *= 0.98;
        enemy.vy *= 0.98;
      }

      // Remove dead enemies
      if (enemy.isDead || enemy.hp <= 0) {
        this.game.createExplosion(enemy.x, enemy.y, enemy.size || 30);
        this.game.enemies.splice(i, 1);
        p.kills++;
        p.score += enemy.scoreValue || 100;

        // Track statistics
        if (this.game.statistics) {
          this.game.statistics.enemiesDestroyed++;
        }
      }
    }

    // PERFORMANCE: Update thruster effects system
    if (this.game.thrusterEffects) {
      this.game.thrusterEffects.update(dt, this.game.particles);
    }

    // Particles - OPTIMIZED with max limit and spatial culling
    // OPTIMIZED: Use ParticleManager for efficient particle updates
    if (this.game.particleManager) {
      this.game.particleManager.update(dt, this.game.camera.x, this.game.camera.y, this.game.width, this.game.height);
      // Sync particles array with ParticleManager (for compatibility with old code)
      this.game.particles = this.game.particleManager.getParticles();
    } else {
      // Fallback to old particle update system
      const MAX_PARTICLES = 500;
      let validParticles = 0;
      for (let i = 0; i < this.game.particles.length; i++) {
        const particle = this.game.particles[i];
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.life -= dt;

        if (particle.type === 'engine') {
          particle.vx *= 0.95;
          particle.vy *= 0.95;
        }

        if (particle.life > 0) {
          this.game.particles[validParticles++] = particle;
        }
      }
      this.game.particles.length = Math.min(validParticles, MAX_PARTICLES);
    }

    // Projectiles
    for (let i = this.game.projectiles.length - 1; i >= 0; i--) {
      const proj = this.game.projectiles[i];

      // Update projectile with special behaviors (homing, range, etc.)
      updateProjectile(proj, dt, this.game.enemies, this.game.particles);

      // Mine arming logic and deceleration
      if (proj.mine) {
        // Mines slow down to become stationary (friction effect)
        const friction = 0.92; // Deceleration factor
        proj.vx *= friction;
        proj.vy *= friction;

        // Arming countdown
        if (!proj.armed) {
          proj.armingTimer -= dt;
          if (proj.armingTimer <= 0) {
            proj.armed = true;
          }
        }
      }

      // Mine proximity detection and detonation
      if (proj.mine && proj.armed && proj.friendly) {
        for (let j = 0; j < this.game.enemies.length; j++) {
          const enemy = this.game.enemies[j];
          const dx = enemy.x - proj.x;
          const dy = enemy.y - proj.y;
          // PERFORMANCE: Use squared distance to avoid sqrt
          const distSq = dx * dx + dy * dy;
          const proximityRadius = proj.proximityRadius || 100;
          const proximityRadiusSq = proximityRadius * proximityRadius;

          if (distSq < proximityRadiusSq) {
            // Mine detonates - create explosion
            this.game.createExplosion(proj.x, proj.y, proj.explosionRadius || 120);

            // Apply explosion damage to all enemies in radius
            this.game.applyExplosionDamage(
              proj.x,
              proj.y,
              proj.explosionRadius || 120,
              proj.damage,
              true // friendly explosion
            );

            this.game.projectiles.splice(i, 1);
            this.game.camera.shake = 0.8;
            break;
          }
        }
        // Continue to next projectile if mine detonated
        if (i >= this.game.projectiles.length || this.game.projectiles[i] !== proj) {
          continue;
        }
      }

      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      // Check collision with enemies
      if (proj.friendly) {
        let projectileHit = false;

        // Check enemy hits
        for (let j = 0; j < this.game.enemies.length; j++) {
          const enemy = this.game.enemies[j];
          const dx = enemy.x - proj.x;
          const dy = enemy.y - proj.y;
          // PERFORMANCE: Use squared distance to avoid sqrt
          const distSq = dx * dx + dy * dy;
          const hitRadius = enemy.size || 20;
          const hitRadiusSq = hitRadius * hitRadius;

          if (distSq < hitRadiusSq) {
            // Track hit statistics
            if (this.game.statistics && proj.owner === 'player') {
              this.game.statistics.shotsHit++;
              this.game.statistics.damageDealt += proj.damage || 0;
            }

            // Check if projectile is explosive (e.g., nuclear missile)
            if (proj.explosive) {
              // For explosive projectiles, only apply explosion damage (no direct hit)
              this.game.createExplosion(proj.x, proj.y, proj.explosionRadius || 150);

              // Apply area-of-effect damage to all enemies in radius
              this.game.applyExplosionDamage(
                proj.x,
                proj.y,
                proj.explosionRadius || 150,
                proj.explosionDamage || proj.damage,
                true // friendly explosion
              );

              this.game.camera.shake = 1.2;

              // Remove explosive projectile after detonation
              this.game.projectiles.splice(i, 1);
              projectileHit = true;
              break; // Break from enemy loop
            } else {
              // Non-explosive projectiles: apply direct damage
              if (enemy.takeDamage) {
                enemy.takeDamage(proj.damage);
                if (enemy.shields > 0) {
                  this.game.createShieldImpact(enemy.x, enemy.y);
                } else {
                  this.game.createHitSparks(proj.x, proj.y);
                }
              } else {
                // Fallback for old enemy format
                if (enemy.shields > 0) {
                  enemy.shields -= proj.damage * 0.5;
                  this.game.createShieldImpact(enemy.x, enemy.y);
                } else {
                  enemy.hp -= proj.damage;
                  enemy.damageFlash = 1;
                  this.game.createHitSparks(proj.x, proj.y);
                }
              }

              // REALISTIC PHYSICS: Momentum transfer from projectile to target
              const momentumMultiplier = 0.15; // Reduced for gameplay balance
              const projMass = proj.mass || 1;
              enemy.vx = (enemy.vx || 0) + proj.vx * projMass * momentumMultiplier;
              enemy.vy = (enemy.vy || 0) + proj.vy * projMass * momentumMultiplier;

              this.game.camera.shake = 0.2;

              // Only remove projectile if it's not piercing
              if (!proj.piercing) {
                this.game.projectiles.splice(i, 1);
                projectileHit = true;
                break; // Break from enemy loop
              } else {
                // Piercing projectile continues through enemies
                projectileHit = false;
              }
            }
          }
        }

        // If projectile was removed, skip rest of processing
        if (projectileHit) {
          continue;
        }

        // Check asteroid hits
        if (!projectileHit && this.game.asteroids) {
          for (let j = 0; j < this.game.asteroids.length; j++) {
            const asteroid = this.game.asteroids[j];
            if (asteroid.destroyed) continue;

            const asteroidPos = {
              x: this.game.star.x + Math.cos(asteroid.angle) * asteroid.distance,
              y: this.game.star.y + Math.sin(asteroid.angle) * asteroid.distance
            };

            const dx = asteroidPos.x - proj.x;
            const dy = asteroidPos.y - proj.y;
            // PERFORMANCE: Use squared distance to avoid sqrt
            const distSq = dx * dx + dy * dy;
            const sizeSq = asteroid.size * asteroid.size;

            if (distSq < sizeSq) {
              this.game.collisionSystem.handleWeaponDamageToAsteroid(asteroidPos, asteroid, proj.damage, this.game.particles);

              // Check if projectile is explosive
              if (proj.explosive) {
                this.game.createExplosion(proj.x, proj.y, proj.explosionRadius || 150);
                this.game.applyExplosionDamage(
                  proj.x,
                  proj.y,
                  proj.explosionRadius || 150,
                  proj.explosionDamage || proj.damage,
                  true
                );
                this.game.camera.shake = 1.0;
              } else {
                this.game.camera.shake = 0.3;
              }

              this.game.projectiles.splice(i, 1);
              projectileHit = true;
              break;
            }
          }
        }

        // Check comet hits
        if (!projectileHit && this.game.comets) {
          for (let j = 0; j < this.game.comets.length; j++) {
            const comet = this.game.comets[j];
            if (comet.destroyed) continue;

            const cometPos = {
              x: this.game.star.x + Math.cos(comet.angle) * comet.distance,
              y: this.game.star.y + Math.sin(comet.angle) * comet.distance
            };

            const dx = cometPos.x - proj.x;
            const dy = cometPos.y - proj.y;
            // PERFORMANCE: Use squared distance to avoid sqrt
            const distSq = dx * dx + dy * dy;
            const radius = comet.radius || 20;
            const radiusSq = radius * radius;

            if (distSq < radiusSq) {
              this.game.collisionSystem.handleWeaponDamageToComet(cometPos, comet, proj.damage, this.game.particles);

              // Check if projectile is explosive
              if (proj.explosive) {
                this.game.createExplosion(proj.x, proj.y, proj.explosionRadius || 150);
                this.game.applyExplosionDamage(
                  proj.x,
                  proj.y,
                  proj.explosionRadius || 150,
                  proj.explosionDamage || proj.damage,
                  true
                );
                this.game.camera.shake = 1.0;
              } else {
                this.game.camera.shake = 0.3;
              }

              this.game.projectiles.splice(i, 1);
              projectileHit = true;
              break;
            }
          }
        }

        // Check station hits
        if (!projectileHit && this.game.stations) {
          for (let j = 0; j < this.game.stations.length; j++) {
            const station = this.game.stations[j];
            if (station.destroyed) continue;

            const stationPos = {
              x: this.game.star.x + Math.cos(station.angle) * station.distance,
              y: this.game.star.y + Math.sin(station.angle) * station.distance
            };

            const dx = stationPos.x - proj.x;
            const dy = stationPos.y - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < (station.size || 40)) {
              this.game.collisionSystem.handleWeaponDamageToStation(stationPos, station, proj.damage, this.game.particles);

              // Check if projectile is explosive
              if (proj.explosive) {
                this.game.createExplosion(proj.x, proj.y, proj.explosionRadius || 150);
                this.game.applyExplosionDamage(
                  proj.x,
                  proj.y,
                  proj.explosionRadius || 150,
                  proj.explosionDamage || proj.damage,
                  true
                );
                this.game.camera.shake = 1.0;
              } else {
                this.game.camera.shake = 0.4;
              }

              this.game.projectiles.splice(i, 1);
              projectileHit = true;
              break;
            }
          }
        }
      } else {
        // Enemy projectile hit player
        const dx = p.x - proj.x;
        const dy = p.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 25) {
          if (p.shieldActive) {
            p.shields -= proj.damage * 0.3;
            this.game.createShieldImpact(p.x, p.y);
          } else if (p.shields > 10) {
            // Apply difficulty modifier to damage
            const difficultyDamageMultipliers = {
              'story': 0.5,
              'explorer': 0.7,
              'adventurer': 1.0,
              'veteran': 1.3,
              'hardcore': 1.6,
              'nightmare': 2.0,
            };
            const damageMult = difficultyDamageMultipliers[this.game.gameConfig.difficulty] || 1.0;
            const modifiedDamage = proj.damage * damageMult;

            p.shields -= modifiedDamage * 0.7;
            this.game.createShieldImpact(p.x, p.y);
          } else {
            // Apply difficulty modifier to damage
            const difficultyDamageMultipliers = {
              'story': 0.5,
              'explorer': 0.7,
              'adventurer': 1.0,
              'veteran': 1.3,
              'hardcore': 1.6,
              'nightmare': 2.0,
            };
            const damageMult = difficultyDamageMultipliers[this.game.gameConfig.difficulty] || 1.0;
            const modifiedDamage = proj.damage * damageMult;

            // HUD UI OVERHAUL: Apply damage to ship sections
            if (this.game.shipDamageSystem) {
              this.game.shipDamageSystem.applyDamage(modifiedDamage);
            }
            p.hull -= modifiedDamage;
            p.damageFlash = 1;
            this.game.createHitSparks(proj.x, proj.y);
          }
          this.game.projectiles.splice(i, 1);
          this.game.camera.shake = 0.4;
        }
      }

      if (proj.life <= 0) {
        this.game.projectiles.splice(i, 1);
      }
    }

    // Explosions
    for (let i = this.game.explosions.length - 1; i >= 0; i--) {
      const exp = this.game.explosions[i];
      exp.life -= dt;
      exp.radius += exp.expandSpeed * dt;

      if (exp.life <= 0) {
        this.game.explosions.splice(i, 1);
      }
    }

    // Weapons - Update WeaponSystem cooldowns
    if (this.game.weaponSystem) {
      this.game.weaponSystem.update(dt);
    }

    // HUD UI OVERHAUL: Update ship damage system (repairs, performance modifiers)
    if (this.game.shipDamageSystem) {
      this.game.shipDamageSystem.update(dt);
    }

    // Legacy weapon cooldowns (for old system if still needed)
    for (const weapon of p.weapons) {
      if (weapon.cooldown > 0) {
        weapon.cooldown -= dt;
      }
    }

    // Fire weapon using WeaponSystem
    if (this.game.input.fire && this.game.weaponSystem) {
      const fired = this.game.weaponSystem.fire(p, p.rotation, this.game.projectiles, this.game.enemies);

      if (fired) {
        // Track shot statistics
        if (this.game.statistics) {
          this.game.statistics.shotsFired++;
        }

        this.game.camera.shake = 0.25;

        // Muzzle flash
        const currentWeapon = this.game.weaponSystem.getActiveWeapon();
        const flashColor = currentWeapon ? currentWeapon.projectileColor : this.game.PALETTE.plasmaGreen;

        for (let i = 0; i < 12; i++) {
          this.game.particles.push({
            x: p.x + Math.cos(p.rotation) * 25,
            y: p.y + Math.sin(p.rotation) * 25,
            vx: Math.cos(p.rotation + (Math.random() - 0.5) * 0.6) * 250 + p.vx * 0.3,
            vy: Math.sin(p.rotation + (Math.random() - 0.5) * 0.6) * 250 + p.vy * 0.3,
            life: 1,
            maxLife: 0.15,
            size: 5,
            color: flashColor,
            type: 'flash'
          });
        }
      }
    }

    // FIXED: Camera ALWAYS centers on player (no smooth follow, no teleporting)
    // Player spaceship always in middle of screen
    const targetX = p.x - this.game.width / 2;
    const targetY = p.y - this.game.height / 2;

    // INSTANT centering - player always in middle of screen
    this.game.camera.x = targetX;
    this.game.camera.y = targetY;

    // CAMERA FIX: Disable dynamic zoom to prevent camera offset/teleporting
    // Keep zoom constant at 1.0 for perfect centering
    this.game.camera.zoom = 1.0;

    if (this.game.camera.shake > 0) {
      this.game.camera.shake -= dt * 2;
    }

    // Update collision system (heat damage and collision detection)
    this.game.collisionSystem.update(dt);

    // FIXED: Calculate radiation level from star and corona ejections
    if (this.game.stellarRenderer && this.game.star && this.game.star.stellarData) {
      // Base radiation from star based on distance
      const distToStar = Math.sqrt(
        Math.pow(p.x - this.game.star.x, 2) + Math.pow(p.y - this.game.star.y, 2)
      );
      const starRadiation = this.game.stellarRenderer.getRadiationLevel(
        p.x, p.y, this.game.star.x, this.game.star.y, this.game.star.stellarData
      );

      // Check for corona ejection collisions
      const ejectionDamage = this.game.stellarRenderer.checkEjectionCollision(p.x, p.y, 15);

      // Combine radiation sources
      p.radiationLevel = Math.min(100, starRadiation + (ejectionDamage ? 50 : 0));

      // Apply radiation damage if shields are down
      if (p.radiationLevel > 20 && p.shields <= 0) {
        p.hull -= (p.radiationLevel - 20) * 0.01 * dt;
      }

      // Radiation increases heat even with shields
      if (p.radiationLevel > 30) {
        p.temperature = Math.min(100, (p.temperature || 20) + p.radiationLevel * 0.02 * dt);
      }
    } else {
      p.radiationLevel = 0;
    }

    // === SCENE TRANSITION LOGIC ===

    // Scene transition cooldown to prevent rapid switching
    if (!this.game.sceneTransitionCooldown) this.game.sceneTransitionCooldown = 0;
    if (this.game.sceneTransitionCooldown > 0) {
      this.game.sceneTransitionCooldown -= dt;
    }

    if (this.game.scene === 'system') {
      // Check if player left the current system (distance from star)
      const distFromStar = Math.sqrt(p.x * p.x + p.y * p.y);
      // Use dynamic system boundary based on star type (new larger values)
      const currentSystem = this.game.galaxy[this.game.currentSystemIndex];
      const systemBoundary = getSystemSize(currentSystem.starType);

      if (distFromStar > systemBoundary && this.game.sceneTransitionCooldown <= 0) {
        // Transition to interstellar space
        const currentSystem = this.game.galaxy[this.game.currentSystemIndex];

        // Calculate exit direction and position in interstellar space
        const exitAngle = Math.atan2(p.y, p.x);
        const offsetDistance = 500; // Offset from system center in interstellar space

        this.game.interstellarPlayerX = currentSystem.position.x + Math.cos(exitAngle) * offsetDistance;
        this.game.interstellarPlayerY = currentSystem.position.y + Math.sin(exitAngle) * offsetDistance;

        // Keep velocity but reduce it
        this.game.player.vx *= 0.3;
        this.game.player.vy *= 0.3;

        // Reset player position for rendering
        this.game.player.x = this.game.width / 2;
        this.game.player.y = this.game.height / 2;

        this.game.scene = 'interstellar';
        this.game.sceneTransitionCooldown = 2.0; // 2 second cooldown
        this.game.showNotification('Entered interstellar space', 'info');
      }
    } else if (this.game.scene === 'interstellar') {
      // Update interstellar player position
      this.game.interstellarPlayerX += p.vx * dt;
      this.game.interstellarPlayerY += p.vy * dt;

      // Check if player entered a star system bubble (only if cooldown expired)
      if (this.game.sceneTransitionCooldown <= 0) {
        const enteredSystemIndex = this.game.interstellarRenderer.checkSystemEntry(
          this.game.interstellarPlayerX,
          this.game.interstellarPlayerY
        );

        if (enteredSystemIndex !== null) {
          // Transition to star system (allow re-entering current system)
          this.game.currentSystemIndex = enteredSystemIndex;
          const newSystem = this.game.galaxy[enteredSystemIndex];

          // Mark system as discovered
          if (!newSystem.discovered) {
            newSystem.discovered = true;
            this.game.showNotification(`Discovered: ${newSystem.name}`, 'success');
          }

          // Calculate entry angle from interstellar position
          const dx = this.game.interstellarPlayerX - newSystem.position.x;
          const dy = this.game.interstellarPlayerY - newSystem.position.y;
          const entryAngle = Math.atan2(dy, dx);

          // Load the new system (async)
          // Note: loadStarSystem manages systemLoading internally, don't set it here
          this.game.loadStarSystem(enteredSystemIndex)
            .then(() => {
              console.log('[Game] System transition complete');
              // systemLoading is managed by loadStarSystem
            })
            .catch(error => {
              console.error('Failed to load system during transition:', error);
              this.game.systemLoading = false; // Set false on error
              this.game.useSpriteRendering = false;
            });

          // Position player at outer edge in direction of entry
          const edgeDistance = 9000;
          this.game.player.x = Math.cos(entryAngle) * edgeDistance;
          this.game.player.y = Math.sin(entryAngle) * edgeDistance;

          // Preserve velocity direction but reduce magnitude
          this.game.player.vx *= 0.3;
          this.game.player.vy *= 0.3;

          this.game.scene = 'system';
          this.game.sceneTransitionCooldown = 2.0; // 2 second cooldown
          this.game.showNotification(`Entered ${newSystem.name}`, 'info');

          // Spawn enemies
          this.game.enemies = [];
          this.game.spawnEnemies();
        }
      }
    }

    // Check player death (only trigger once)
    if (p.hull <= 0 && !p.isDying) {
      p.isDying = true;
      this.game.createExplosion(p.x, p.y, 50);

      // PERMADEATH MODE: Game over on death (no respawn)
      if (this.game.gameConfig.permadeath) {
        setTimeout(() => {
          this.game.gameOver = true;
          this.game.statistics.deaths++;
          console.log('[Game] PERMADEATH: Game Over');
        }, 2000);
      } else {
        // Normal mode: respawn after delay
        setTimeout(() => {
          this.game.resetGame();
          this.game.statistics.deaths++;
        }, 2000);
      }
    }
  }
}
