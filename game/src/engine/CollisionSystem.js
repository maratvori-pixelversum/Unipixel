/**
 * Comprehensive Collision and Heat Damage System
 * Handles all collisions and environmental damage in the game
 */

export class CollisionSystem {
  constructor(game) {
    this.game = game;
    this.collisionPairs = [];
    this.heatDamageRate = 10; // Damage per second at max heat
  }

  /**
   * Check collision between two circular objects
   */
  checkCircleCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (obj1.radius || obj1.size || 10) + (obj2.radius || obj2.size || 10);

    return distance < minDistance;
  }

  /**
   * Calculate heat damage based on distance from star
   */
  calculateHeatDamage(player, star, dt) {
    const dx = player.x - star.x;
    const dy = player.y - star.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Heat zones based on star radius (MUCH CLOSER to star)
    const starRadius = star.radius || 400;
    const criticalZone = starRadius * 0.05;  // Instant death zone (5% of star radius)
    const dangerZone = starRadius * 0.1;     // Heavy damage zone (10% of star radius)
    const warnZone = starRadius * 0.3;       // Warning zone (30% of star radius)
    const safeZone = starRadius * 0.5;       // No damage (50% of star radius)

    let heatLevel = 0; // 0-1 scale
    let heatDamage = 0;
    let heatStatus = 'safe';

    if (distance < criticalZone) {
      // CRITICAL: Very close to star - instant vaporization
      heatLevel = 1.0;
      heatDamage = 100 * dt; // 100 damage per second - instant death
      heatStatus = 'critical';
    } else if (distance < dangerZone) {
      // DANGER: Heavy heat damage
      heatLevel = 0.7 + (1 - (distance - criticalZone) / (dangerZone - criticalZone)) * 0.3;
      heatDamage = 50 * dt; // 50 damage per second
      heatStatus = 'danger';
    } else if (distance < warnZone) {
      // WARNING: Moderate heat damage
      heatLevel = 0.4 + (1 - (distance - dangerZone) / (warnZone - dangerZone)) * 0.3;
      heatDamage = 20 * dt; // 20 damage per second
      heatStatus = 'warning';
    } else if (distance < safeZone) {
      // CAUTION: Rising heat, no damage yet
      heatLevel = (1 - (distance - warnZone) / (safeZone - warnZone)) * 0.4;
      heatDamage = 0;
      heatStatus = 'caution';
    }

    return {
      heatLevel,
      heatDamage,
      heatStatus,
      distance,
      starRadius,
      criticalZone,
      dangerZone,
      warnZone
    };
  }

  /**
   * Handle player collision with asteroid
   */
  handleAsteroidCollision(player, asteroidPos, asteroid, particles) {
    // Calculate collision damage based on relative velocity
    const impactSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);

    // Damage based on impact speed and asteroid size
    const damage = Math.min(impactSpeed * 0.05, 15);

    // Apply damage to player
    if (player.shieldActive && player.shields > 0) {
      player.shields -= damage;
      // Shield hit effect
      this.game.createShieldImpact(player.x, player.y);
    } else {
      player.hull -= damage;
      // Hull hit sparks
      this.createCollisionSparks(player.x, player.y, particles, '#ff6600', 10);
    }

    // Damage asteroid
    if (!asteroid.hp) asteroid.hp = asteroid.size * 10;
    asteroid.hp -= damage * 2;

    // Break asteroid apart if destroyed
    if (asteroid.hp <= 0) {
      this.breakAsteroid(asteroid, asteroidPos, particles);
    }

    // Bounce effect
    const angle = Math.atan2(player.y - asteroidPos.y, player.x - asteroidPos.x);
    const bounceForce = impactSpeed * 0.2;
    player.vx += Math.cos(angle) * bounceForce;
    player.vy += Math.sin(angle) * bounceForce;

    // Camera shake
    this.game.camera.shake = Math.min(damage / 5, 8);

    return damage;
  }

  /**
   * Handle player collision with comet
   */
  handleCometCollision(player, cometPos, comet, particles) {
    const impactSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    const damage = Math.min(impactSpeed * 0.04, 12);

    if (player.shieldActive && player.shields > 0) {
      player.shields -= damage;
      this.game.createShieldImpact(player.x, player.y);
    } else {
      player.hull -= damage;
      this.createCollisionSparks(player.x, player.y, particles, '#ff6600', 10);
    }

    // Damage comet
    if (!comet.hp) comet.hp = 50;
    comet.hp -= damage * 2;

    // Break comet apart if destroyed
    if (comet.hp <= 0) {
      this.breakComet(comet, cometPos, particles);
    }

    // Bounce
    const angle = Math.atan2(player.y - cometPos.y, player.x - cometPos.x);
    player.vx += Math.cos(angle) * impactSpeed * 0.15;
    player.vy += Math.sin(angle) * impactSpeed * 0.15;

    this.game.camera.shake = Math.min(damage / 5, 8);

    return damage;
  }

  /**
   * Handle player collision with station
   */
  handleStationCollision(player, stationPos, station, particles) {
    const impactSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);

    // Stations are massive - heavy damage to player
    const damage = Math.min(impactSpeed * 0.1, 25);

    if (player.shieldActive && player.shields > 0) {
      player.shields -= damage;
      this.game.createShieldImpact(player.x, player.y);
    } else {
      player.hull -= damage;
      this.createCollisionSparks(player.x, player.y, particles, '#ff6600', 15);
    }

    // Damage station
    if (!station.hp) station.hp = 500;
    station.hp -= damage * 0.5;

    // Station hit effect
    this.createCollisionSparks(stationPos.x, stationPos.y, particles, '#ff8800', 12);

    // Hard bounce
    const angle = Math.atan2(player.y - stationPos.y, player.x - stationPos.x);
    player.vx += Math.cos(angle) * impactSpeed * 0.3;
    player.vy += Math.sin(angle) * impactSpeed * 0.3;

    this.game.camera.shake = Math.min(damage / 5, 15);

    return damage;
  }

  /**
   * Handle player collision with enemy ship
   */
  handleEnemyCollision(player, enemy, particles) {
    const relativeVelX = player.vx - enemy.vx;
    const relativeVelY = player.vy - enemy.vy;
    const impactSpeed = Math.sqrt(relativeVelX * relativeVelX + relativeVelY * relativeVelY);

    const damage = Math.min(impactSpeed * 0.08, 20);

    // Damage both ships
    if (player.shieldActive && player.shields > 0) {
      player.shields -= damage;
      this.game.createShieldImpact(player.x, player.y);
    } else {
      player.hull -= damage;
      this.createCollisionSparks(player.x, player.y, particles, '#ff6600', 12);
    }

    // Damage enemy
    if (enemy.takeDamage) {
      enemy.takeDamage(damage);
    } else {
      enemy.hp = (enemy.hp || 100) - damage;
    }

    // Enemy hit effect
    if (enemy.shields && enemy.shields > 0) {
      this.game.createShieldImpact(enemy.x, enemy.y);
    } else {
      this.createCollisionSparks(enemy.x, enemy.y, particles, '#ff6600', 12);
    }

    // Mutual bounce (ships push each other)
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    const bounceForce = impactSpeed * 0.3;
    player.vx += Math.cos(angle) * bounceForce;
    player.vy += Math.sin(angle) * bounceForce;
    enemy.vx -= Math.cos(angle) * bounceForce * 0.3;
    enemy.vy -= Math.sin(angle) * bounceForce * 0.3;

    this.game.camera.shake = Math.min(damage / 4, 12);

    return damage;
  }

  /**
   * Handle collision with star (instant death)
   */
  handleStarCollision(player, star, particles) {
    // Instant vaporization
    player.hull = 0;

    // Massive explosion
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 200 + 100;
      particles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 0.8 + 0.4,
        size: Math.random() * 6 + 2,
        color: Math.random() > 0.5 ? '#ffff00' : '#ff4400',
        type: 'explosion'
      });
    }

    this.game.camera.shake = 30;

    return 1000; // Overkill damage
  }

  /**
   * Handle collision with blackhole (spaghettification)
   */
  handleBlackholeCollision(player, blackhole, particles) {
    // Instant death - spaghettification
    player.hull = 0;

    // Purple/blue vortex effect
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 150 + 50;
      particles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * speed * 0.3, // Particles spiral inward
        vy: Math.sin(angle) * speed * 0.3,
        life: 1,
        maxLife: Math.random() * 1.2 + 0.6,
        size: Math.random() * 4 + 1,
        color: Math.random() > 0.5 ? '#8844ff' : '#4400ff',
        type: 'blackhole_death'
      });
    }

    this.game.camera.shake = 25;

    return 1000;
  }

  /**
   * Create collision spark particles
   */
  createCollisionSparks(x, y, particles, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 150 + 50;
      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 0.4 + 0.2,
        size: Math.random() * 3 + 1,
        color: color,
        type: 'spark'
      });
    }
  }

  /**
   * Break asteroid into smaller pieces
   */
  breakAsteroid(asteroid, position, particles) {
    // Create explosion effect
    this.createCollisionSparks(position.x, position.y, particles, '#aa8866', 25);

    // Mark asteroid for removal
    asteroid.destroyed = true;

    // Create smaller debris pieces
    const debrisCount = Math.floor(asteroid.size / 3);
    for (let i = 0; i < debrisCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 100 + 50;
      particles.push({
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 2 + 1,
        size: Math.random() * 4 + 2,
        color: '#aa8866',
        type: 'debris'
      });
    }
  }

  /**
   * Break comet into smaller pieces
   */
  breakComet(comet, position, particles) {
    // Create ice explosion effect
    this.createCollisionSparks(position.x, position.y, particles, '#aaddff', 30);

    // Mark comet for removal
    comet.destroyed = true;

    // Create ice debris
    const debrisCount = 15;
    for (let i = 0; i < debrisCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 120 + 60;
      particles.push({
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 2.5 + 1,
        size: Math.random() * 5 + 2,
        color: Math.random() > 0.5 ? '#aaddff' : '#ffffff',
        type: 'ice_debris'
      });
    }
  }

  /**
   * Update all collisions
   */
  update(dt) {
    const player = this.game.player;
    const particles = this.game.particles;

    // Heat damage from star
    if (this.game.star) {
      const heatInfo = this.calculateHeatDamage(player, this.game.star, dt);
      player.temperature = heatInfo.heatLevel * 100; // 0-100 scale
      player.heatStatus = heatInfo.heatStatus;

      if (heatInfo.heatDamage > 0) {
        player.hull -= heatInfo.heatDamage;
        player.heatDamage = true;
      } else {
        player.heatDamage = false;
      }

      // Direct collision with star
      if (this.checkCircleCollision(player, this.game.star)) {
        this.handleStarCollision(player, this.game.star, particles);
      }
    }

    // Cool down when far from star
    if (player.temperature > 20) {
      player.temperature = Math.max(20, player.temperature - 10 * dt);
    }

    // Asteroid collisions
    if (this.game.asteroids) {
      for (let i = this.game.asteroids.length - 1; i >= 0; i--) {
        const asteroid = this.game.asteroids[i];

        // Skip null/undefined or destroyed asteroids
        if (!asteroid || asteroid.destroyed) {
          this.game.asteroids.splice(i, 1);
          continue;
        }

        const asteroidPos = {
          x: this.game.star.x + Math.cos(asteroid.angle) * asteroid.distance,
          y: this.game.star.y + Math.sin(asteroid.angle) * asteroid.distance,
          radius: asteroid.size
        };

        if (this.checkCircleCollision(player, asteroidPos)) {
          this.handleAsteroidCollision(player, asteroidPos, asteroid, particles);
        }
      }
    }

    // Comet collisions
    if (this.game.comets) {
      for (let i = this.game.comets.length - 1; i >= 0; i--) {
        const comet = this.game.comets[i];

        // Skip null/undefined or destroyed comets
        if (!comet || comet.destroyed) {
          this.game.comets.splice(i, 1);
          continue;
        }

        const cometPos = {
          x: this.game.star.x + Math.cos(comet.angle) * comet.distance,
          y: this.game.star.y + Math.sin(comet.angle) * comet.distance,
          radius: comet.radius || 20
        };

        if (this.checkCircleCollision(player, cometPos)) {
          this.handleCometCollision(player, cometPos, comet, particles);
        }
      }
    }

    // Station collisions
    if (this.game.stations) {
      for (let i = this.game.stations.length - 1; i >= 0; i--) {
        const station = this.game.stations[i];

        // Skip null/undefined or destroyed stations
        if (!station || station.destroyed) {
          this.game.stations.splice(i, 1);
          continue;
        }

        const stationPos = {
          x: this.game.star.x + Math.cos(station.angle) * station.distance,
          y: this.game.star.y + Math.sin(station.angle) * station.distance,
          radius: station.size || 40
        };

        if (this.checkCircleCollision(player, stationPos)) {
          this.handleStationCollision(player, stationPos, station, particles);
        }
      }
    }

    // Enemy ship collisions
    if (this.game.enemies) {
      for (const enemy of this.game.enemies) {
        if (!enemy) continue; // Skip null/undefined enemies
        const enemyPos = {
          x: enemy.x,
          y: enemy.y,
          radius: enemy.size || 15
        };

        if (this.checkCircleCollision(player, enemyPos)) {
          this.handleEnemyCollision(player, enemy, particles);
        }
      }
    }

    // Planet collisions
    if (this.game.planets) {
      for (const planet of this.game.planets) {
        if (!planet) continue; // Skip null/undefined planets
        const planetPos = {
          x: this.game.star.x + Math.cos(planet.angle) * planet.distance,
          y: this.game.star.y + Math.sin(planet.angle) * planet.distance,
          radius: planet.radius
        };

        if (this.checkCircleCollision(player, planetPos)) {
          // Planets are massive - heavy continuous damage
          const damage = 50 * dt;

          if (player.shieldActive && player.shields > 0) {
            player.shields -= damage;
            this.game.createShieldImpact(player.x, player.y);
          } else {
            player.hull -= damage;
            this.createCollisionSparks(player.x, player.y, particles, '#ff6600', 20);
          }

          // Strong bounce away from planet
          const angle = Math.atan2(player.y - planetPos.y, player.x - planetPos.x);
          player.vx += Math.cos(angle) * 300 * dt;
          player.vy += Math.sin(angle) * 300 * dt;

          this.game.camera.shake = 20;
        }
      }
    }
  }

  /**
   * Handle weapon damage to asteroids
   */
  handleWeaponDamageToAsteroid(asteroidPos, asteroid, damage, particles) {
    if (!asteroid.hp) asteroid.hp = asteroid.size * 10;
    asteroid.hp -= damage;

    // Hit sparks
    this.createCollisionSparks(asteroidPos.x, asteroidPos.y, particles, '#ffaa44', 8);

    // Break apart if destroyed
    if (asteroid.hp <= 0) {
      this.breakAsteroid(asteroid, asteroidPos, particles);
    }
  }

  /**
   * Handle weapon damage to comets
   */
  handleWeaponDamageToComet(cometPos, comet, damage, particles) {
    if (!comet.hp) comet.hp = 50;
    comet.hp -= damage;

    // Ice hit effect
    this.createCollisionSparks(cometPos.x, cometPos.y, particles, '#aaddff', 10);

    // Break apart if destroyed
    if (comet.hp <= 0) {
      this.breakComet(comet, cometPos, particles);
    }
  }

  /**
   * Handle weapon damage to stations
   */
  handleWeaponDamageToStation(stationPos, station, damage, particles) {
    if (!station.hp) station.hp = 500;
    station.hp -= damage;

    // Station hit effect
    this.createCollisionSparks(stationPos.x, stationPos.y, particles, '#ff8800', 12);

    // Destroy station if hp reaches 0
    if (station.hp <= 0) {
      station.destroyed = true;
      this.game.createExplosion(stationPos.x, stationPos.y, 80);
    }
  }
}
