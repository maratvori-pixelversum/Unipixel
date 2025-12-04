/**
 * Advanced Weapon System
 * Multiple weapon types with unique behaviors:
 * 1. Kinetic Weapons - Physical projectiles, armor-piercing
 * 2. Energy Weapons - Plasma/lasers, shield-effective
 * 3. Missiles - Homing projectiles, high damage
 * 4. Nuclear Missiles - Area-of-effect devastation
 * 5. Railgun - Ultra-high velocity, piercing rounds
 * 6. Laser Beam - Continuous damage beam
 * 7. Mines - Proximity-triggered explosives
 * 8. Point Defense - Auto-targeting defensive weapons
 */

export class WeaponSystem {
  constructor() {
    this.weapons = [];
    this.activeWeaponIndex = 0;
  }

  /**
   * Add weapon to the system
   */
  addWeapon(weaponType, tier = 1) {
    const weapon = this.createWeapon(weaponType, tier);
    this.weapons.push(weapon);
    return weapon;
  }

  /**
   * Create weapon based on type and tier
   */
  createWeapon(type, tier) {
    const baseDamage = 20 + (tier - 1) * 10;
    const baseEnergyCost = 3 + (tier - 1) * 2;

    switch (type) {
      case 'kinetic_cannon':
        return {
          type: 'kinetic_cannon',
          name: `Kinetic Cannon Mk${tier}`,
          tier,
          damage: baseDamage * 1.5,
          armorPenetration: 0.8, // Ignores 80% of armor
          shieldPenetration: 0.3, // Only 30% effective vs shields
          cooldown: 0,
          maxCooldown: 0.4,
          energyCost: baseEnergyCost * 0.8,
          projectileSpeed: 700,
          projectileSize: 5,
          projectileColor: '#cccccc',
          projectileType: 'kinetic',
          spread: 0.02,
          burstCount: 1,
          range: 2100, // Effective range in pixels
          description: 'High-velocity physical projectiles. Excellent vs armor, weak vs shields.'
        };

      case 'plasma_cannon':
        return {
          type: 'plasma_cannon',
          name: `Plasma Cannon Mk${tier}`,
          tier,
          damage: baseDamage,
          armorPenetration: 0.5,
          shieldPenetration: 1.2, // 120% effective vs shields
          cooldown: 0,
          maxCooldown: 0.25,
          energyCost: baseEnergyCost,
          projectileSpeed: 600,
          projectileSize: 7,
          projectileColor: '#00ff88',
          projectileType: 'plasma',
          spread: 0.03,
          burstCount: 2,
          range: 1800, // Medium range
          description: 'Superheated plasma bolts. Very effective vs shields.'
        };

      case 'laser_beam':
        return {
          type: 'laser_beam',
          name: `Laser Beam Mk${tier}`,
          tier,
          damage: baseDamage * 0.4, // Lower per-tick damage but continuous
          armorPenetration: 0.6,
          shieldPenetration: 0.9,
          cooldown: 0,
          maxCooldown: 0.05, // Very fast fire rate
          energyCost: baseEnergyCost * 0.6,
          projectileSpeed: 1200,
          projectileSize: 3,
          projectileColor: '#ff0000',
          projectileType: 'laser',
          spread: 0.01,
          burstCount: 1,
          beamWeapon: true,
          range: 1200, // Short range but fast
          description: 'Continuous laser beam. High fire rate, moderate damage.'
        };

      case 'missile_launcher':
        return {
          type: 'missile_launcher',
          name: `Missile Launcher Mk${tier}`,
          tier,
          damage: baseDamage * 3,
          armorPenetration: 1.0,
          shieldPenetration: 0.7,
          cooldown: 0,
          maxCooldown: 2.0,
          energyCost: baseEnergyCost * 3,
          projectileSpeed: 400,
          projectileSize: 6,
          projectileColor: '#ffaa00',
          projectileType: 'missile',
          spread: 0,
          burstCount: 1,
          homing: true,
          homingStrength: 150,
          homingRange: 1500, // Lock-on range
          missileAcceleration: 200,
          range: 4000, // Long range missiles
          description: 'Homing missiles. High damage, slow reload.'
        };

      case 'railgun':
        return {
          type: 'railgun',
          name: `Railgun Mk${tier}`,
          tier,
          damage: baseDamage * 2.5,
          armorPenetration: 1.2, // Penetrates armor
          shieldPenetration: 0.4,
          cooldown: 0,
          maxCooldown: 1.5,
          energyCost: baseEnergyCost * 2.5,
          projectileSpeed: 1500,
          projectileSize: 4,
          projectileColor: '#4488ff',
          projectileType: 'railgun',
          spread: 0,
          burstCount: 1,
          piercing: true, // Can hit multiple enemies
          range: 3000, // Very long range
          description: 'Electromagnetic accelerator. Extremely high velocity, armor-piercing.'
        };

      case 'point_defense':
        return {
          type: 'point_defense',
          name: `Point Defense Mk${tier}`,
          tier,
          damage: baseDamage * 0.5,
          armorPenetration: 0.3,
          shieldPenetration: 0.3,
          cooldown: 0,
          maxCooldown: 0.15,
          energyCost: baseEnergyCost * 0.4,
          projectileSpeed: 800,
          projectileSize: 2,
          projectileColor: '#ffff00',
          projectileType: 'point_defense',
          spread: 0,
          burstCount: 1,
          autoTarget: true,
          targetRange: 500,
          range: 600, // Short defensive range
          description: 'Automated defense system. Auto-targets incoming projectiles and nearby threats.'
        };

      case 'nuclear_missile':
        return {
          type: 'nuclear_missile',
          name: `Nuclear Missile Mk${tier}`,
          tier,
          damage: baseDamage * 5, // Very high damage
          armorPenetration: 1.5,
          shieldPenetration: 1.0,
          cooldown: 0,
          maxCooldown: 5.0, // Very slow reload
          energyCost: baseEnergyCost * 5,
          projectileSpeed: 350,
          projectileSize: 8,
          projectileColor: '#ff0000',
          projectileType: 'nuclear_missile',
          spread: 0,
          burstCount: 1,
          homing: true,
          homingStrength: 120,
          homingRange: 2000,
          missileAcceleration: 180,
          explosive: true,
          explosionRadius: 150, // Area of effect
          explosionDamage: baseDamage * 3, // Splash damage
          range: 5000, // Very long range
          description: 'Nuclear warhead with area-of-effect damage. Devastating but slow reload.'
        };

      case 'mine_launcher':
        return {
          type: 'mine_launcher',
          name: `Mine Launcher Mk${tier}`,
          tier,
          damage: baseDamage * 4,
          armorPenetration: 1.2,
          shieldPenetration: 0.8,
          cooldown: 0,
          maxCooldown: 3.0,
          energyCost: baseEnergyCost * 2,
          projectileSpeed: 50, // Very slow initial speed
          projectileSize: 7,
          projectileColor: '#ff8800',
          projectileType: 'mine',
          spread: 0,
          burstCount: 1,
          mine: true,
          armingTime: 1.0, // Takes time to arm
          proximityRadius: 100, // Detonation range
          explosionRadius: 120,
          range: 200, // Deploy range (mines stay in place)
          description: 'Deployable proximity mines. Detonate when enemies approach.'
        };

      case 'ion_cannon':
        return {
          type: 'ion_cannon',
          name: `Ion Cannon Mk${tier}`,
          tier,
          damage: baseDamage * 0.5, // Low direct damage
          armorPenetration: 0.2,
          shieldPenetration: 2.0, // Very effective vs shields
          cooldown: 0,
          maxCooldown: 1.2,
          energyCost: baseEnergyCost * 2,
          projectileSpeed: 800,
          projectileSize: 8,
          projectileColor: '#00ffff',
          projectileType: 'ion',
          spread: 0.01,
          burstCount: 1,
          ionEffect: true,
          disableDuration: 2.0 + tier * 0.5, // Disables systems for 2-3.5 seconds
          range: 2000,
          description: 'Electromagnetic pulse weapon. Disables enemy systems temporarily.'
        };

      case 'graviton_beam':
        return {
          type: 'graviton_beam',
          name: `Graviton Beam Mk${tier}`,
          tier,
          damage: baseDamage * 0.3, // Very low damage
          armorPenetration: 0.5,
          shieldPenetration: 0.5,
          cooldown: 0,
          maxCooldown: 0.08, // Continuous beam
          energyCost: baseEnergyCost * 1.5,
          projectileSpeed: 1000,
          projectileSize: 6,
          projectileColor: '#ff00ff',
          projectileType: 'graviton',
          spread: 0,
          burstCount: 1,
          beamWeapon: true,
          gravitonEffect: true,
          slowFactor: 0.3 + tier * 0.1, // Slows enemies by 30-50%
          slowDuration: 1.5,
          range: 1500,
          description: 'Gravity manipulation weapon. Significantly slows enemy movement.'
        };

      case 'disruptor':
        return {
          type: 'disruptor',
          name: `Disruptor Mk${tier}`,
          tier,
          damage: baseDamage * 2.0,
          armorPenetration: 0.6,
          shieldPenetration: 0.1, // Bypasses shields!
          cooldown: 0,
          maxCooldown: 0.8,
          energyCost: baseEnergyCost * 2.5,
          projectileSpeed: 900,
          projectileSize: 5,
          projectileColor: '#ff4400',
          projectileType: 'disruptor',
          spread: 0.02,
          burstCount: 1,
          phaseShift: true, // Bypasses shields
          disruptorEffect: true,
          range: 2200,
          description: 'Phase-shifted energy weapon. Bypasses shields to damage hull directly.'
        };

      default:
        return this.createWeapon('plasma_cannon', tier);
    }
  }

  /**
   * Fire active weapon
   */
  fire(ship, targetAngle, projectiles, enemies = null) {
    const weapon = this.weapons[this.activeWeaponIndex];
    if (!weapon || weapon.cooldown > 0) return false;

    // Check energy
    if (ship.power < weapon.energyCost) return false;

    // Consume energy
    ship.power -= weapon.energyCost;
    weapon.cooldown = weapon.maxCooldown;

    // Special handling for different weapon types
    if (weapon.type === 'point_defense' && weapon.autoTarget) {
      this.firePointDefense(ship, weapon, projectiles, enemies);
    } else if (weapon.mine) {
      this.fireMine(ship, weapon, targetAngle, projectiles);
    } else if (weapon.explosive && weapon.homing) {
      this.fireNuclearMissile(ship, weapon, targetAngle, projectiles, enemies);
    } else if (weapon.homing) {
      this.fireMissile(ship, weapon, targetAngle, projectiles, enemies);
    } else if (weapon.beamWeapon) {
      this.fireBeam(ship, weapon, targetAngle, projectiles);
    } else {
      this.fireStandard(ship, weapon, targetAngle, projectiles);
    }

    return true;
  }

  /**
   * Fire standard projectile weapon
   */
  fireStandard(ship, weapon, targetAngle, projectiles) {
    for (let i = 0; i < weapon.burstCount; i++) {
      const spread = (Math.random() - 0.5) * weapon.spread;
      const angle = targetAngle + spread;

      // Dual weapon mounts
      const offset = 10;
      for (let side = -1; side <= 1; side += 2) {
        const perpAngle = angle + Math.PI / 2;
        const offsetX = Math.cos(perpAngle) * offset * side;
        const offsetY = Math.sin(perpAngle) * offset * side;

        projectiles.push({
          x: ship.x + Math.cos(angle) * 25 + offsetX,
          y: ship.y + Math.sin(angle) * 25 + offsetY,
          vx: Math.cos(angle) * weapon.projectileSpeed + ship.vx * 0.5,
          vy: Math.sin(angle) * weapon.projectileSpeed + ship.vy * 0.5,
          damage: weapon.damage,
          armorPenetration: weapon.armorPenetration,
          shieldPenetration: weapon.shieldPenetration,
          life: 3,
          maxLife: 3,
          size: weapon.projectileSize,
          color: weapon.projectileColor,
          type: weapon.projectileType,
          piercing: weapon.piercing || false,
          range: weapon.range || 2000,
          maxRange: weapon.range || 2000,
          startX: ship.x,
          startY: ship.y,
          owner: 'player',
          friendly: true
        });
      }
    }
  }

  /**
   * Fire homing missile
   */
  fireMissile(ship, weapon, targetAngle, projectiles, enemies) {
    // Find nearest enemy for homing
    let target = null;
    let closestDist = Infinity;

    if (enemies) {
      for (const enemy of enemies) {
        const dx = enemy.x - ship.x;
        const dy = enemy.y - ship.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < closestDist && dist < 1500) {
          closestDist = dist;
          target = enemy;
        }
      }
    }

    projectiles.push({
      x: ship.x + Math.cos(targetAngle) * 25,
      y: ship.y + Math.sin(targetAngle) * 25,
      vx: Math.cos(targetAngle) * weapon.projectileSpeed,
      vy: Math.sin(targetAngle) * weapon.projectileSpeed,
      damage: weapon.damage,
      armorPenetration: weapon.armorPenetration,
      shieldPenetration: weapon.shieldPenetration,
      life: 10,
      maxLife: 10,
      size: weapon.projectileSize,
      color: weapon.projectileColor,
      type: weapon.projectileType,
      homing: true,
      homingTarget: target,
      homingStrength: weapon.homingStrength,
      homingRange: weapon.homingRange || 1500,
      acceleration: weapon.missileAcceleration,
      range: weapon.range || 4000,
      maxRange: weapon.range || 4000,
      startX: ship.x,
      startY: ship.y,
      owner: 'player',
      friendly: true
    });
  }

  /**
   * Fire nuclear missile with area-of-effect damage
   */
  fireNuclearMissile(ship, weapon, targetAngle, projectiles, enemies) {
    // Find nearest enemy for homing
    let target = null;
    let closestDist = Infinity;

    if (enemies) {
      for (const enemy of enemies) {
        const dx = enemy.x - ship.x;
        const dy = enemy.y - ship.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < closestDist && dist < 2000) {
          closestDist = dist;
          target = enemy;
        }
      }
    }

    projectiles.push({
      x: ship.x + Math.cos(targetAngle) * 25,
      y: ship.y + Math.sin(targetAngle) * 25,
      vx: Math.cos(targetAngle) * weapon.projectileSpeed,
      vy: Math.sin(targetAngle) * weapon.projectileSpeed,
      damage: weapon.damage,
      armorPenetration: weapon.armorPenetration,
      shieldPenetration: weapon.shieldPenetration,
      life: 15,
      maxLife: 15,
      size: weapon.projectileSize,
      color: weapon.projectileColor,
      type: weapon.projectileType,
      homing: true,
      homingTarget: target,
      homingStrength: weapon.homingStrength,
      homingRange: weapon.homingRange || 2000,
      acceleration: weapon.missileAcceleration,
      explosive: true,
      explosionRadius: weapon.explosionRadius,
      explosionDamage: weapon.explosionDamage,
      range: weapon.range || 5000,
      maxRange: weapon.range || 5000,
      startX: ship.x,
      startY: ship.y,
      owner: 'player',
      friendly: true
    });
  }

  /**
   * Deploy proximity mine
   */
  fireMine(ship, weapon, targetAngle, projectiles) {
    // Deploy mine with ship's velocity
    projectiles.push({
      x: ship.x + Math.cos(targetAngle) * 30,
      y: ship.y + Math.sin(targetAngle) * 30,
      vx: Math.cos(targetAngle) * weapon.projectileSpeed + ship.vx,
      vy: Math.sin(targetAngle) * weapon.projectileSpeed + ship.vy,
      damage: weapon.damage,
      armorPenetration: weapon.armorPenetration,
      shieldPenetration: weapon.shieldPenetration,
      life: 30, // Mines last longer
      maxLife: 30,
      size: weapon.projectileSize,
      color: weapon.projectileColor,
      type: weapon.projectileType,
      mine: true,
      armed: false,
      armingTime: weapon.armingTime,
      armingTimer: weapon.armingTime, // Start with full arming time
      proximityRadius: weapon.proximityRadius,
      explosionRadius: weapon.explosionRadius,
      range: 99999, // Mines don't have range limit
      maxRange: 99999,
      startX: ship.x,
      startY: ship.y,
      owner: 'player',
      friendly: true
    });
  }

  /**
   * Fire continuous beam
   */
  fireBeam(ship, weapon, targetAngle, projectiles) {
    // Beam is just very fast projectiles
    projectiles.push({
      x: ship.x + Math.cos(targetAngle) * 25,
      y: ship.y + Math.sin(targetAngle) * 25,
      vx: Math.cos(targetAngle) * weapon.projectileSpeed,
      vy: Math.sin(targetAngle) * weapon.projectileSpeed,
      damage: weapon.damage,
      armorPenetration: weapon.armorPenetration,
      shieldPenetration: weapon.shieldPenetration,
      life: 1.0,
      maxLife: 1.0,
      size: weapon.projectileSize,
      color: weapon.projectileColor,
      type: weapon.projectileType,
      beam: true,
      range: weapon.range || 1200,
      maxRange: weapon.range || 1200,
      startX: ship.x,
      startY: ship.y,
      owner: 'player',
      friendly: true
    });
  }

  /**
   * Fire point defense (auto-targets)
   */
  firePointDefense(ship, weapon, projectiles, enemies) {
    // Find nearest threat within range
    let target = null;
    let closestDist = Infinity;

    // Check enemy projectiles first
    for (const proj of projectiles) {
      if (proj.owner === 'enemy') {
        const dx = proj.x - ship.x;
        const dy = proj.y - ship.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < weapon.targetRange && dist < closestDist) {
          closestDist = dist;
          target = proj;
        }
      }
    }

    // If no projectiles, target nearest enemy
    if (!target && enemies) {
      for (const enemy of enemies) {
        const dx = enemy.x - ship.x;
        const dy = enemy.y - ship.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < weapon.targetRange && dist < closestDist) {
          closestDist = dist;
          target = enemy;
        }
      }
    }

    if (target) {
      const dx = target.x - ship.x;
      const dy = target.y - ship.y;
      const angle = Math.atan2(dy, dx);

      projectiles.push({
        x: ship.x + Math.cos(angle) * 20,
        y: ship.y + Math.sin(angle) * 20,
        vx: Math.cos(angle) * weapon.projectileSpeed,
        vy: Math.sin(angle) * weapon.projectileSpeed,
        damage: weapon.damage,
        armorPenetration: weapon.armorPenetration,
        shieldPenetration: weapon.shieldPenetration,
        life: 1.5,
        maxLife: 1.5,
        size: weapon.projectileSize,
        color: weapon.projectileColor,
        type: weapon.projectileType,
        pointDefense: true,
        range: weapon.range || 600,
        maxRange: weapon.range || 600,
        startX: ship.x,
        startY: ship.y,
        owner: 'player',
        friendly: true
      });
    }
  }

  /**
   * Update all weapon cooldowns
   */
  update(dt) {
    for (const weapon of this.weapons) {
      if (weapon.cooldown > 0) {
        weapon.cooldown = Math.max(0, weapon.cooldown - dt);
      }
    }
  }

  /**
   * Switch to next weapon
   */
  nextWeapon() {
    this.activeWeaponIndex = (this.activeWeaponIndex + 1) % this.weapons.length;
    return this.weapons[this.activeWeaponIndex];
  }

  /**
   * Switch to previous weapon
   */
  previousWeapon() {
    this.activeWeaponIndex = (this.activeWeaponIndex - 1 + this.weapons.length) % this.weapons.length;
    return this.weapons[this.activeWeaponIndex];
  }

  /**
   * Get active weapon
   */
  getActiveWeapon() {
    return this.weapons[this.activeWeaponIndex];
  }

  /**
   * Get all weapons
   */
  getAllWeapons() {
    return this.weapons;
  }
}

/**
 * Update projectile physics (called from game loop)
 */
export function updateProjectile(proj, dt, enemies, particles) {
  // Check range limit (distance traveled from start position)
  if (proj.startX !== undefined && proj.startY !== undefined && proj.maxRange) {
    const dx = proj.x - proj.startX;
    const dy = proj.y - proj.startY;
    const distTraveled = Math.sqrt(dx * dx + dy * dy);

    if (distTraveled > proj.maxRange) {
      proj.life = 0; // Mark for deletion
      return false;
    }
  }

  // Homing missile behavior
  if (proj.homing && enemies) {
    // If target is dead or null, find new target
    if (!proj.homingTarget || proj.homingTarget.isDead || proj.homingTarget.hp <= 0) {
      let closestDist = proj.homingRange || 1500;
      let newTarget = null;

      for (const enemy of enemies) {
        if (enemy.isDead || enemy.hp <= 0) continue;
        const dx = enemy.x - proj.x;
        const dy = enemy.y - proj.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < closestDist) {
          closestDist = dist;
          newTarget = enemy;
        }
      }

      proj.homingTarget = newTarget;
    }

    // Track current target
    if (proj.homingTarget && !proj.homingTarget.isDead) {
      const target = proj.homingTarget;
      const dx = target.x - proj.x;
      const dy = target.y - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        const targetAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(proj.vy, proj.vx);

        let angleDiff = targetAngle - currentAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Improved turning - faster for large angle differences
        const turnRate = Math.min(0.08, Math.abs(angleDiff) * 0.5);
        const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnRate);

        const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
        const maxSpeed = proj.type === 'nuclear_missile' ? 650 : 800;
        const acceleration = proj.acceleration || 0;  // FIX: Default to 0 if undefined
        const newSpeed = Math.min(speed + acceleration * dt, maxSpeed);

        proj.vx = Math.cos(newAngle) * newSpeed;
        proj.vy = Math.sin(newAngle) * newSpeed;

        // Enhanced missile trail
        if (Math.random() < 0.6) {
          particles.push({
            x: proj.x + (Math.random() - 0.5) * 4,
            y: proj.y + (Math.random() - 0.5) * 4,
            vx: -proj.vx * 0.2 + (Math.random() - 0.5) * 40,
            vy: -proj.vy * 0.2 + (Math.random() - 0.5) * 40,
            life: 1,
            maxLife: 0.6,
            size: proj.type === 'nuclear_missile' ? 4 : 3,
            color: proj.type === 'nuclear_missile' ? '#ff4400' : '#ff6600',
            type: 'missile_trail'
          });
        }
      }
    }
  }

  // Beam weapon glow
  if (proj.beam && Math.random() < 0.4) {
    particles.push({
      x: proj.x + (Math.random() - 0.5) * 3,
      y: proj.y + (Math.random() - 0.5) * 3,
      vx: (Math.random() - 0.5) * 25,
      vy: (Math.random() - 0.5) * 25,
      life: 1,
      maxLife: 0.25,
      size: 2,
      color: proj.color,
      type: 'beam_glow'
    });
  }

  // Railgun contrail
  if (proj.type === 'railgun' && Math.random() < 0.9) {
    particles.push({
      x: proj.x + (Math.random() - 0.5) * 2,
      y: proj.y + (Math.random() - 0.5) * 2,
      vx: -proj.vx * 0.1 + (Math.random() - 0.5) * 10,
      vy: -proj.vy * 0.1 + (Math.random() - 0.5) * 10,
      life: 1,
      maxLife: 0.35,
      size: 2,
      color: '#88ccff',
      type: 'railgun_trail'
    });
  }

  // Ion cannon electric discharge (heavily pixelated)
  if (proj.type === 'ion' && Math.random() < 0.7) {
    particles.push({
      x: proj.x + (Math.random() - 0.5) * 6,
      y: proj.y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 50,
      vy: (Math.random() - 0.5) * 50,
      life: 1,
      maxLife: 0.3,
      size: 3,
      color: Math.random() > 0.5 ? '#00ffff' : '#00ccff',
      type: 'ion_spark'
    });
  }

  // Graviton beam distortion effect (warped space - heavily pixelated)
  if (proj.type === 'graviton' && Math.random() < 0.8) {
    particles.push({
      x: proj.x + (Math.random() - 0.5) * 8,
      y: proj.y + (Math.random() - 0.5) * 8,
      vx: -proj.vx * 0.15 + (Math.random() - 0.5) * 30,
      vy: -proj.vy * 0.15 + (Math.random() - 0.5) * 30,
      life: 1,
      maxLife: 0.4,
      size: 4,
      color: Math.random() > 0.5 ? '#ff00ff' : '#aa00aa',
      type: 'graviton_wave'
    });
  }

  // Disruptor phase shift effect (heavily pixelated)
  if (proj.type === 'disruptor' && Math.random() < 0.6) {
    particles.push({
      x: proj.x + (Math.random() - 0.5) * 5,
      y: proj.y + (Math.random() - 0.5) * 5,
      vx: -proj.vx * 0.2 + (Math.random() - 0.5) * 40,
      vy: -proj.vy * 0.2 + (Math.random() - 0.5) * 40,
      life: 1,
      maxLife: 0.35,
      size: 3,
      color: Math.random() > 0.5 ? '#ff4400' : '#ff6622',
      type: 'disruptor_pulse'
    });
  }

  return true;
}
