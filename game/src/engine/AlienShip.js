/**
 * Alien Ship System
 * Five types of alien ships with unique behaviors:
 * 1. Scout - Fast, weak, evasive
 * 2. Fighter - Balanced, aggressive
 * 3. Bomber - Slow, heavy weapons, high HP
 * 4. Frigate - Capital ship, very slow, very tanky
 * 5. Hive Drone - Swarm behavior, weak individually
 */

export class AlienShip {
  constructor(type, x, y, isHostile = true, raceData = null) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.rotation = Math.random() * Math.PI * 2;
    this.isHostile = isHostile;
    this.isDead = false;

    // Race information
    this.race = raceData ? raceData.id : 'unknown';
    this.raceName = raceData ? raceData.name : 'Unknown';
    this.raceColor = raceData ? raceData.shipColor : '#aa5588';
    this.raceData = raceData;

    // AI state
    this.target = null;
    this.aiState = 'patrol'; // patrol, engage, evade, retreat, swarm
    this.aiTimer = 0;
    this.formation = null; // For hive drones

    // Ship stats based on type
    this.initializeStats();

    // Weapon cooldowns
    this.weaponCooldown = 0;
    this.specialCooldown = 0;

    // Visual
    this.damageFlash = 0;
    this.trailParticles = [];
  }

  /**
   * Initialize ship stats based on type
   */
  initializeStats() {
    switch (this.type) {
      case 'scout':
        this.hp = 30;
        this.maxHp = 30;
        this.shields = 20;
        this.maxShields = 20;
        this.speed = 350;
        this.turnRate = 0.08;
        this.size = 12;
        this.mass = 50;
        this.weaponDamage = 15;
        this.weaponCooldownTime = 0.3;
        this.detectionRange = 800;
        this.engageRange = 600;
        this.evadeThreshold = 0.5; // Evades when HP < 50%
        this.color = this.raceColor;
        this.scoreValue = 50;
        break;

      case 'fighter':
        this.hp = 80;
        this.maxHp = 80;
        this.shields = 50;
        this.maxShields = 50;
        this.speed = 250;
        this.turnRate = 0.05;
        this.size = 16;
        this.mass = 100;
        this.weaponDamage = 25;
        this.weaponCooldownTime = 0.25;
        this.detectionRange = 1000;
        this.engageRange = 500;
        this.evadeThreshold = 0.3;
        this.color = this.raceColor;
        this.scoreValue = 100;
        break;

      case 'bomber':
        this.hp = 150;
        this.maxHp = 150;
        this.shields = 100;
        this.maxShields = 100;
        this.speed = 120;
        this.turnRate = 0.03;
        this.size = 24;
        this.mass = 300;
        this.weaponDamage = 60;
        this.weaponCooldownTime = 0.8;
        this.detectionRange = 1200;
        this.engageRange = 700;
        this.evadeThreshold = 0.2;
        this.color = this.raceColor;
        this.scoreValue = 200;
        // Bombers have missiles
        this.hasMissiles = true;
        this.missileCount = 6;
        break;

      case 'frigate':
        this.hp = 500;
        this.maxHp = 500;
        this.shields = 300;
        this.maxShields = 300;
        this.speed = 60;
        this.turnRate = 0.015;
        this.size = 40;
        this.mass = 1000;
        this.weaponDamage = 40;
        this.weaponCooldownTime = 0.15;
        this.detectionRange = 1500;
        this.engageRange = 800;
        this.evadeThreshold = 0.1;
        this.color = this.raceColor;
        this.scoreValue = 500;
        // Frigates have point defense
        this.hasPointDefense = true;
        break;

      case 'hive_drone':
        this.hp = 20;
        this.maxHp = 20;
        this.shields = 0;
        this.maxShields = 0;
        this.speed = 280;
        this.turnRate = 0.12;
        this.size = 10;
        this.mass = 30;
        this.weaponDamage = 10;
        this.weaponCooldownTime = 0.4;
        this.detectionRange = 600;
        this.engageRange = 400;
        this.evadeThreshold = 0;
        this.color = this.raceColor;
        this.scoreValue = 30;
        // Hive drones use swarm AI
        this.swarmBehavior = true;
        break;

      default:
        // Default to fighter - set type and reinitialize
        this.type = 'fighter';
        this.initializeStats();
    }
  }

  /**
   * Update AI and movement
   */
  update(dt, player, allEnemies, projectiles) {
    this.aiTimer += dt;
    this.weaponCooldown = Math.max(0, this.weaponCooldown - dt);
    this.specialCooldown = Math.max(0, this.specialCooldown - dt);
    this.damageFlash = Math.max(0, this.damageFlash - dt);

    // Shield recharge
    if (this.shields < this.maxShields) {
      this.shields = Math.min(this.maxShields, this.shields + 2 * dt);
    }

    // Update AI
    this.updateAI(dt, player, allEnemies, projectiles);

    // Apply movement
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Drag
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  /**
   * AI behavior logic
   */
  updateAI(dt, player, allEnemies, projectiles) {
    if (!player) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Determine AI state
    const hpPercent = this.hp / this.maxHp;

    if (this.swarmBehavior) {
      this.updateSwarmAI(dt, player, allEnemies);
    } else {
      // Standard AI
      if (hpPercent < this.evadeThreshold && this.aiState !== 'evade') {
        this.aiState = 'evade';
        this.aiTimer = 0;
      } else if (dist < this.engageRange) {
        this.aiState = 'engage';
      } else if (dist < this.detectionRange) {
        this.aiState = 'approach';
      } else {
        this.aiState = 'patrol';
      }

      switch (this.aiState) {
        case 'patrol':
          this.patrol(dt);
          break;
        case 'approach':
          this.approach(dt, player);
          break;
        case 'engage':
          this.engage(dt, player, projectiles);
          break;
        case 'evade':
          this.evade(dt, player, projectiles);
          break;
      }
    }
  }

  /**
   * Patrol behavior - circular movement
   */
  patrol(dt) {
    const patrolRadius = 300;
    const patrolSpeed = this.speed * 0.3;
    const angle = this.aiTimer * 0.5;

    const targetX = this.x + Math.cos(angle) * patrolRadius;
    const targetY = this.y + Math.sin(angle) * patrolRadius;

    this.moveToward(targetX, targetY, patrolSpeed * dt);
  }

  /**
   * Approach behavior - move toward player
   */
  approach(dt, player) {
    this.moveToward(player.x, player.y, this.speed * 0.6 * dt);
  }

  /**
   * Engage behavior - attack player
   */
  engage(dt, player, projectiles) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleToPlayer = Math.atan2(dy, dx);

    // Strafe movement for scouts and fighters
    if (this.type === 'scout' || this.type === 'fighter') {
      const strafeAngle = angleToPlayer + Math.PI / 2;
      const strafeSpeed = this.speed * 0.4;

      // Alternate strafe direction
      const strafeDir = Math.sin(this.aiTimer * 2) > 0 ? 1 : -1;

      this.vx += Math.cos(strafeAngle) * strafeSpeed * strafeDir * dt;
      this.vy += Math.sin(strafeAngle) * strafeSpeed * strafeDir * dt;
    }

    // Maintain optimal distance
    const optimalDist = this.engageRange * 0.7;
    if (dist < optimalDist) {
      // Back away
      this.vx -= Math.cos(angleToPlayer) * this.speed * 0.3 * dt;
      this.vy -= Math.sin(angleToPlayer) * this.speed * 0.3 * dt;
    } else if (dist > optimalDist * 1.3) {
      // Move closer
      this.vx += Math.cos(angleToPlayer) * this.speed * 0.5 * dt;
      this.vy += Math.sin(angleToPlayer) * this.speed * 0.5 * dt;
    }

    // Aim at player
    this.rotation = this.turnToward(angleToPlayer, dt);

    // Fire weapon
    if (this.weaponCooldown <= 0) {
      this.fireWeapon(projectiles, player);
    }
  }

  /**
   * Evade behavior - run away
   */
  evade(dt, player, projectiles) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angleAwayFromPlayer = Math.atan2(-dy, -dx);

    // Run away at full speed
    this.vx += Math.cos(angleAwayFromPlayer) * this.speed * dt;
    this.vy += Math.sin(angleAwayFromPlayer) * this.speed * dt;

    // Evasive maneuvers
    const evadeAngle = angleAwayFromPlayer + Math.sin(this.aiTimer * 5) * 0.8;
    this.vx += Math.cos(evadeAngle) * this.speed * 0.5 * dt;
    this.vy += Math.sin(evadeAngle) * this.speed * 0.5 * dt;

    this.rotation = this.turnToward(angleAwayFromPlayer, dt);

    // Return to fight if HP recovers
    if (this.aiTimer > 4 && this.hp > this.maxHp * 0.6) {
      this.aiState = 'engage';
      this.aiTimer = 0;
    }
  }

  /**
   * Swarm AI for hive drones
   */
  updateSwarmAI(dt, player, allEnemies) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Swarm behaviors: cohesion, separation, alignment
    let cohesionX = 0, cohesionY = 0;
    let separationX = 0, separationY = 0;
    let alignmentVx = 0, alignmentVy = 0;
    let nearbyCount = 0;

    // Find nearby hive drones
    for (const other of allEnemies) {
      if (other === this || other.type !== 'hive_drone') continue;

      const odx = other.x - this.x;
      const ody = other.y - this.y;
      const oDist = Math.sqrt(odx * odx + ody * ody);

      if (oDist < 200) {
        nearbyCount++;

        // Cohesion - move toward group center
        cohesionX += other.x;
        cohesionY += other.y;

        // Separation - avoid crowding
        if (oDist < 50 && oDist > 0) {
          separationX -= odx / oDist;
          separationY -= ody / oDist;
        }

        // Alignment - match velocity
        alignmentVx += other.vx;
        alignmentVy += other.vy;
      }
    }

    if (nearbyCount > 0) {
      cohesionX /= nearbyCount;
      cohesionY /= nearbyCount;
      alignmentVx /= nearbyCount;
      alignmentVy /= nearbyCount;

      // Apply swarm forces
      const cohesionDx = cohesionX - this.x;
      const cohesionDy = cohesionY - this.y;

      this.vx += cohesionDx * 0.5 * dt;
      this.vy += cohesionDy * 0.5 * dt;
      this.vx += separationX * 100 * dt;
      this.vy += separationY * 100 * dt;
      this.vx += alignmentVx * 0.3 * dt;
      this.vy += alignmentVy * 0.3 * dt;
    }

    // Move toward player
    if (dist > 100) {
      this.vx += (dx / dist) * this.speed * 0.5 * dt;
      this.vy += (dy / dist) * this.speed * 0.5 * dt;
    }

    // Aim at player
    const angleToPlayer = Math.atan2(dy, dx);
    this.rotation = this.turnToward(angleToPlayer, dt);
  }

  /**
   * Helper: Move toward a point
   */
  moveToward(targetX, targetY, force) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      this.vx += (dx / dist) * force;
      this.vy += (dy / dist) * force;

      const targetAngle = Math.atan2(dy, dx);
      this.rotation = this.turnToward(targetAngle, force * 0.01);
    }
  }

  /**
   * Helper: Turn toward angle smoothly
   */
  turnToward(targetAngle, dt) {
    let angleDiff = targetAngle - this.rotation;

    // Normalize angle difference to -PI to PI
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const turnAmount = Math.min(Math.abs(angleDiff), this.turnRate * dt) * Math.sign(angleDiff);
    return this.rotation + turnAmount;
  }

  /**
   * Fire weapon at target
   */
  fireWeapon(projectiles, target) {
    this.weaponCooldown = this.weaponCooldownTime;

    // Predict target position
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const projectileSpeed = 500;
    const timeToHit = dist / projectileSpeed;

    const predictedX = target.x + target.vx * timeToHit;
    const predictedY = target.y + target.vy * timeToHit;

    const pdx = predictedX - this.x;
    const pdy = predictedY - this.y;
    const angle = Math.atan2(pdy, pdx);

    // Create projectile
    const spread = this.type === 'frigate' ? 0.1 : 0.05;
    const finalAngle = angle + (Math.random() - 0.5) * spread;

    projectiles.push({
      x: this.x + Math.cos(this.rotation) * this.size,
      y: this.y + Math.sin(this.rotation) * this.size,
      vx: Math.cos(finalAngle) * projectileSpeed,
      vy: Math.sin(finalAngle) * projectileSpeed,
      damage: this.weaponDamage,
      life: 2,
      maxLife: 2,
      color: this.color,
      size: this.type === 'bomber' ? 6 : this.type === 'frigate' ? 4 : 3,
      owner: 'enemy',
      friendly: false  // FIX: Enemy projectiles must have friendly:false for collision detection
    });
  }

  /**
   * Take damage
   */
  takeDamage(amount) {
    // Shields absorb first
    if (this.shields > 0) {
      const shieldDamage = Math.min(this.shields, amount);
      this.shields -= shieldDamage;
      amount -= shieldDamage;
    }

    // Remaining damage to hull
    this.hp -= amount;
    this.damageFlash = 0.2;

    if (this.hp <= 0) {
      this.isDead = true;
    }
  }

  /**
   * Render the alien ship
   */
  render(ctx, camera) {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    // Render engine trail particles
    this.renderEngineTrail(ctx, camera);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.rotation);

    // Damage flash
    if (this.damageFlash > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = this.damageFlash * 2;
      ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
      ctx.globalAlpha = 1;
    }

    // Render based on type
    switch (this.type) {
      case 'scout':
        this.renderScout(ctx);
        break;
      case 'fighter':
        this.renderFighter(ctx);
        break;
      case 'bomber':
        this.renderBomber(ctx);
        break;
      case 'frigate':
        this.renderFrigate(ctx);
        break;
      case 'hive_drone':
        this.renderHiveDrone(ctx);
        break;
    }

    ctx.restore();

    // Enhanced organic pixelated shield
    if (this.shields > 0) {
      this.renderOrganicShield(ctx, screenX, screenY);
    }
  }

  /**
   * Render complex multi-layered energy barrier with blue/white/yellow
   */
  renderOrganicShield(ctx, centerX, centerY) {
    const shieldRadius = this.size + 12;
    const shieldStrength = this.shields / this.maxShields;
    const time = Date.now() * 0.001;

    ctx.save();

    // Blue/white/yellow color scheme
    const blueCore = '#4488ff';
    const whitePure = '#ffffff';
    const yellowBright = '#ffdd44';
    const cyanLight = '#88ddff';

    const alpha = 0.7 * shieldStrength;

    // Layer 1: Solid energy field base
    const fieldGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, shieldRadius);
    fieldGradient.addColorStop(0, `${blueCore}00`);
    fieldGradient.addColorStop(0.4, `${blueCore}${Math.floor(alpha * 65).toString(16).padStart(2, '0')}`);
    fieldGradient.addColorStop(0.75, `${cyanLight}${Math.floor(alpha * 145).toString(16).padStart(2, '0')}`);
    fieldGradient.addColorStop(1, `${whitePure}${Math.floor(alpha * 205).toString(16).padStart(2, '0')}`);

    ctx.fillStyle = fieldGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, shieldRadius, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2: Bright outer edge
    ctx.strokeStyle = `${whitePure}${Math.floor(alpha * 245).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, shieldRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Layer 3: Rotating energy rings
    for (let ring = 0; ring < 2; ring++) {
      const ringRadius = shieldRadius - 6 - ring * 7;
      const ringRotation = time * (1.2 + ring * 0.4) + ring * Math.PI / 4;
      const ringAlpha = Math.floor((0.65 - ring * 0.15) * alpha * 180).toString(16).padStart(2, '0');

      ctx.strokeStyle = ring % 2 === 0 ? `${cyanLight}${ringAlpha}` : `${yellowBright}${ringAlpha}`;
      ctx.lineWidth = 1.5;

      for (let seg = 0; seg < 10; seg++) {
        const startAngle = (seg / 10) * Math.PI * 2 + ringRotation;
        const endAngle = startAngle + Math.PI / 7;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
        ctx.stroke();
      }
    }

    // Layer 4: Spiraling particles
    const particleCount = 32;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time * 2.2;
      const spiralRadius = shieldRadius - 9 + Math.sin(time * 3.2 + i * 0.6) * 4;
      const px = centerX + Math.cos(angle) * spiralRadius;
      const py = centerY + Math.sin(angle) * spiralRadius;

      const particlePhase = Math.sin(time * 5.5 + i * 0.4);
      const particleSize = 2 + particlePhase * 0.8;
      const particleColor = particlePhase > 0 ? yellowBright : whitePure;
      const particleAlpha = Math.floor((0.65 + particlePhase * 0.35) * alpha * 225).toString(16).padStart(2, '0');

      ctx.fillStyle = `${particleColor}${particleAlpha}`;
      ctx.fillRect(Math.floor(px - particleSize/2), Math.floor(py - particleSize/2), Math.ceil(particleSize), Math.ceil(particleSize));
    }

    // Layer 5: Lightning arcs
    ctx.lineWidth = 1;
    for (let arc = 0; arc < 5; arc++) {
      const arcAngle = (arc / 5) * Math.PI * 2 + time * 0.9;
      const arcPhase = (time * 6.5 + arc * 1.2) % (Math.PI * 2);
      if (Math.sin(arcPhase) < 0.25) continue;

      const arcAlpha = Math.floor(Math.abs(Math.sin(arcPhase)) * alpha * 210).toString(16).padStart(2, '0');
      ctx.strokeStyle = `${yellowBright}${arcAlpha}`;

      ctx.beginPath();
      const segments = 7;
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const r = shieldRadius * (0.55 + t * 0.45);
        const a = arcAngle + (Math.random() - 0.5) * 0.18;
        const jitter = (Math.random() - 0.5) * 2.5;
        const x = centerX + Math.cos(a) * r + jitter;
        const y = centerY + Math.sin(a) * r + jitter;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Layer 6: Hexagonal cells
    const hexSize = 6;
    const hexRows = Math.floor(shieldRadius / 10);
    const flowOffset = time * 2.6;

    for (let row = -hexRows; row <= hexRows; row++) {
      for (let col = -hexRows; col <= hexRows; col++) {
        const hexX = centerX + col * hexSize * 1.5;
        const hexY = centerY + row * hexSize * Math.sqrt(3) + (col % 2) * hexSize * Math.sqrt(3) / 2;

        const dx = hexX - centerX;
        const dy = hexY - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        if (distFromCenter > shieldRadius - 9) continue;

        const wave1 = Math.sin(flowOffset + dx * 0.13 + dy * 0.13);
        const wave2 = Math.cos(flowOffset * 0.75 - dx * 0.09 + dy * 0.09);
        const wavePhase = (wave1 + wave2) * 0.5;
        const hexIntensity = wavePhase * 0.5 + 0.5;

        const hexAlpha = Math.floor(hexIntensity * alpha * 165).toString(16).padStart(2, '0');
        const hexColor = hexIntensity > 0.55 ? cyanLight : blueCore;
        ctx.strokeStyle = `${hexColor}${hexAlpha}`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const px = hexX + Math.cos(angle) * hexSize * 0.5;
          const py = hexY + Math.sin(angle) * hexSize * 0.5;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        if (hexIntensity > 0.78) {
          const dotAlpha = Math.floor((hexIntensity - 0.78) * 4.5 * alpha * 230).toString(16).padStart(2, '0');
          ctx.fillStyle = `${yellowBright}${dotAlpha}`;
          ctx.fillRect(Math.floor(hexX - 1), Math.floor(hexY - 1), 2, 2);
        }
      }
    }

    // Layer 7: Energy streams
    for (let stream = 0; stream < 8; stream++) {
      const streamAngle = (stream / 8) * Math.PI * 2 + time * 0.7;
      const streamPhase = (time * 5.2 + stream * 0.8) % (Math.PI * 2);
      const streamAlpha = (Math.sin(streamPhase) * 0.5 + 0.5) * alpha;

      const gradient = ctx.createLinearGradient(
        centerX + Math.cos(streamAngle) * 12,
        centerY + Math.sin(streamAngle) * 12,
        centerX + Math.cos(streamAngle) * shieldRadius,
        centerY + Math.sin(streamAngle) * shieldRadius
      );
      gradient.addColorStop(0, `${yellowBright}${Math.floor(streamAlpha * 245).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(0.5, `${whitePure}${Math.floor(streamAlpha * 205).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${cyanLight}00`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, shieldRadius - 3, streamAngle - 0.23, streamAngle + 0.23);
      ctx.stroke();
    }

    // Layer 8: Damage crackles
    const damageLevel = 1 - shieldStrength;
    const crackleCount = Math.floor(damageLevel * 14);
    if (crackleCount > 0) {
      for (let i = 0; i < crackleCount; i++) {
        const angle = (i / crackleCount) * Math.PI * 2 + time * 2.3;
        const dist = (Math.random() * 0.6 + 0.4) * shieldRadius;
        const crackleX = centerX + Math.cos(angle) * dist;
        const crackleY = centerY + Math.sin(angle) * dist;

        const crackleSize = 2 + Math.random() * 1.8;
        const crackleIntensity = Math.sin(time * 11 + i * 2.1) * 0.5 + 0.5;

        ctx.fillStyle = crackleIntensity > 0.5 ? '#ffff99' : '#ffcc55';
        ctx.fillRect(
          Math.floor(crackleX - crackleSize / 2),
          Math.floor(crackleY - crackleSize / 2),
          Math.ceil(crackleSize),
          Math.ceil(crackleSize)
        );
      }
    }

    ctx.restore();
  }

  /**
   * Render engine trail particles
   */
  renderEngineTrail(ctx, camera) {
    // Update and render engine particles
    const time = Date.now();

    // Add new particles based on ship movement speed
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 10 && time % 30 < 15) {
      // Calculate engine position (back of ship)
      const engineOffsetX = Math.cos(this.rotation + Math.PI) * this.size * 0.7;
      const engineOffsetY = Math.sin(this.rotation + Math.PI) * this.size * 0.7;

      this.trailParticles.push({
        x: this.x + engineOffsetX,
        y: this.y + engineOffsetY,
        vx: -Math.cos(this.rotation) * speed * 0.3 + (Math.random() - 0.5) * 20,
        vy: -Math.sin(this.rotation) * speed * 0.3 + (Math.random() - 0.5) * 20,
        life: 1.0,
        size: 2 + Math.random() * 3,
        color: this.color
      });
    }

    // Limit particle count
    if (this.trailParticles.length > 20) {
      this.trailParticles.shift();
    }

    // Render particles
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];

      // Update particle
      p.x += p.vx * 0.016;
      p.y += p.vy * 0.016;
      p.life -= 0.02;
      p.vx *= 0.95;
      p.vy *= 0.95;

      // Remove dead particles
      if (p.life <= 0) {
        this.trailParticles.splice(i, 1);
        continue;
      }

      // Render particle
      const screenX = p.x - camera.x;
      const screenY = p.y - camera.y;

      ctx.fillStyle = `${p.color}${Math.floor(p.life * 128).toString(16).padStart(2, '0')}`;
      ctx.fillRect(screenX - p.size / 2, screenY - p.size / 2, p.size, p.size);

      // Inner glow
      ctx.fillStyle = `#ffffff${Math.floor(p.life * 64).toString(16).padStart(2, '0')}`;
      ctx.fillRect(screenX - 1, screenY - 1, 2, 2);
    }
  }

  renderScout(ctx) {
    // Enhanced scout: sleek, multi-colored, highly detailed

    // Main hull (teal/cyan/green gradient)
    ctx.fillStyle = '#2a5544';
    ctx.beginPath();
    ctx.moveTo(this.size, 0);
    ctx.lineTo(-this.size * 0.7, -this.size * 0.5);
    ctx.lineTo(-this.size * 0.5, 0);
    ctx.lineTo(-this.size * 0.7, this.size * 0.5);
    ctx.closePath();
    ctx.fill();

    // Layered armor plates (multiple colors)
    ctx.fillStyle = '#3a7766';
    ctx.beginPath();
    ctx.moveTo(this.size * 0.8, 0);
    ctx.lineTo(-this.size * 0.3, -this.size * 0.35);
    ctx.lineTo(-this.size * 0.2, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#44aa88';
    ctx.beginPath();
    ctx.moveTo(this.size * 0.8, 0);
    ctx.lineTo(-this.size * 0.3, this.size * 0.35);
    ctx.lineTo(-this.size * 0.2, 0);
    ctx.closePath();
    ctx.fill();

    // Pixelated panel details
    ctx.fillStyle = '#55ddaa';
    ctx.fillRect(this.size * 0.3, -this.size * 0.2, 4, 2);
    ctx.fillRect(this.size * 0.1, -this.size * 0.25, 4, 2);
    ctx.fillRect(this.size * 0.3, this.size * 0.18, 4, 2);
    ctx.fillRect(this.size * 0.1, this.size * 0.23, 4, 2);

    // Dark panel lines (depth)
    ctx.fillStyle = '#1a3322';
    ctx.fillRect(this.size * 0.2, -this.size * 0.15, 1, this.size * 0.3);
    ctx.fillRect(-this.size * 0.1, -this.size * 0.2, 1, this.size * 0.4);

    // Wing struts (orange accents)
    ctx.fillStyle = '#ff8833';
    ctx.fillRect(-this.size * 0.5, -this.size * 0.48, 8, 2);
    ctx.fillRect(-this.size * 0.5, this.size * 0.46, 8, 2);

    // Sensor array (purple/blue)
    ctx.fillStyle = '#8844ff';
    ctx.fillRect(this.size * 0.5, -3, 3, 2);
    ctx.fillRect(this.size * 0.5, 1, 3, 2);

    // Cockpit (multi-layered)
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(this.size * 0.25, -4, 6, 8);
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(this.size * 0.3, -3, 4, 6);
    ctx.fillStyle = '#ffff88';
    ctx.fillRect(this.size * 0.35, -2, 2, 4);

    // Engine nacelles (cyan/blue)
    ctx.fillStyle = '#2266aa';
    ctx.fillRect(-this.size * 0.65, -this.size * 0.25, 6, 4);
    ctx.fillRect(-this.size * 0.65, this.size * 0.21, 6, 4);

    // Engine glow (pulsing cyan/white)
    const enginePulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(0, 255, 255, ${enginePulse})`;
    ctx.fillRect(-this.size * 0.7, -this.size * 0.23, 4, 2);
    ctx.fillRect(-this.size * 0.7, this.size * 0.21, 4, 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${enginePulse * 0.8})`;
    ctx.fillRect(-this.size * 0.72, -this.size * 0.22, 2, 1);
    ctx.fillRect(-this.size * 0.72, this.size * 0.22, 2, 1);

    // Pixelated rivets/details
    ctx.fillStyle = '#447755';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(this.size * 0.1 - i * 3, -this.size * 0.05 - i * 2, 1, 1);
      ctx.fillRect(this.size * 0.1 - i * 3, this.size * 0.05 + i * 2, 1, 1);
    }

    // Weapon mounts (red)
    ctx.fillStyle = '#ff3344';
    ctx.fillRect(this.size * 0.85, -this.size * 0.08, 2, 2);
    ctx.fillRect(this.size * 0.85, this.size * 0.06, 2, 2);
  }

  renderFighter(ctx) {
    // Enhanced fighter: aggressive, multi-colored, battle-worn

    // Main hull (dark orange/red with metal)
    ctx.fillStyle = '#884422';
    ctx.beginPath();
    ctx.moveTo(this.size * 1.1, 0);
    ctx.lineTo(-this.size * 0.6, -this.size * 0.7);
    ctx.lineTo(-this.size * 0.4, 0);
    ctx.lineTo(-this.size * 0.6, this.size * 0.7);
    ctx.closePath();
    ctx.fill();

    // Armored plates (layered, multi-colored)
    ctx.fillStyle = '#cc6633';
    ctx.fillRect(this.size * 0.1, -this.size * 0.35, this.size * 0.6, this.size * 0.25);
    ctx.fillRect(this.size * 0.1, this.size * 0.1, this.size * 0.6, this.size * 0.25);

    ctx.fillStyle = '#ff8844';
    ctx.fillRect(this.size * 0.15, -this.size * 0.32, this.size * 0.45, this.size * 0.18);
    ctx.fillRect(this.size * 0.15, this.size * 0.14, this.size * 0.45, this.size * 0.18);

    // Panel lines/rivets (depth)
    ctx.fillStyle = '#552211';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(this.size * 0.2 + i * 6, -this.size * 0.3, 1, this.size * 0.2);
      ctx.fillRect(this.size * 0.2 + i * 6, this.size * 0.12, 1, this.size * 0.2);
    }

    // Wings (gray/blue metal with accents)
    ctx.fillStyle = '#556677';
    ctx.fillRect(-this.size * 0.5, -this.size * 0.9, this.size * 0.35, this.size * 0.25);
    ctx.fillRect(-this.size * 0.5, this.size * 0.65, this.size * 0.35, this.size * 0.25);

    ctx.fillStyle = '#7788aa';
    ctx.fillRect(-this.size * 0.48, -this.size * 0.85, this.size * 0.25, this.size * 0.15);
    ctx.fillRect(-this.size * 0.48, this.size * 0.7, this.size * 0.25, this.size * 0.15);

    // Wing struts (cyan tech)
    ctx.fillStyle = '#00ccff';
    ctx.fillRect(-this.size * 0.45, -this.size * 0.82, 2, this.size * 0.12);
    ctx.fillRect(-this.size * 0.35, -this.size * 0.82, 2, this.size * 0.12);
    ctx.fillRect(-this.size * 0.45, this.size * 0.7, 2, this.size * 0.12);
    ctx.fillRect(-this.size * 0.35, this.size * 0.7, 2, this.size * 0.12);

    // Central fuselage detail (darker)
    ctx.fillStyle = '#331100';
    ctx.fillRect(-this.size * 0.3, -this.size * 0.2, this.size * 0.4, this.size * 0.4);

    // Pixelated vents
    ctx.fillStyle = '#221100';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-this.size * 0.25 + i * 4, -this.size * 0.15, 2, 2);
      ctx.fillRect(-this.size * 0.25 + i * 4, this.size * 0.13, 2, 2);
    }

    // Nose cone (reinforced, multi-layer)
    ctx.fillStyle = '#aa5533';
    ctx.beginPath();
    ctx.moveTo(this.size * 1.1, 0);
    ctx.lineTo(this.size * 0.7, -this.size * 0.25);
    ctx.lineTo(this.size * 0.7, this.size * 0.25);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#dd7755';
    ctx.beginPath();
    ctx.moveTo(this.size * 1.05, 0);
    ctx.lineTo(this.size * 0.75, -this.size * 0.18);
    ctx.lineTo(this.size * 0.75, this.size * 0.18);
    ctx.closePath();
    ctx.fill();

    // Weapon hardpoints (red/yellow)
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(this.size * 0.9, -this.size * 0.12, 4, 3);
    ctx.fillRect(this.size * 0.9, this.size * 0.09, 4, 3);

    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(this.size * 0.92, -this.size * 0.11, 2, 2);
    ctx.fillRect(this.size * 0.92, this.size * 0.09, 2, 2);

    // Cockpit (cyan/blue/white multi-layer)
    ctx.fillStyle = '#004466';
    ctx.fillRect(this.size * 0.35, -5, 8, 10);
    ctx.fillStyle = '#0088aa';
    ctx.fillRect(this.size * 0.4, -4, 6, 8);
    ctx.fillStyle = '#00ccff';
    ctx.fillRect(this.size * 0.45, -3, 4, 6);
    ctx.fillStyle = '#aaffff';
    ctx.fillRect(this.size * 0.47, -2, 2, 4);

    // Engine nacelles
    ctx.fillStyle = '#334455';
    ctx.fillRect(-this.size * 0.65, -this.size * 0.3, 8, this.size * 0.2);
    ctx.fillRect(-this.size * 0.65, this.size * 0.1, 8, this.size * 0.2);

    // Engine glow (pulsing orange/yellow)
    const enginePulse = Math.sin(Date.now() * 0.008) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(255, 120, 0, ${enginePulse})`;
    ctx.fillRect(-this.size * 0.7, -this.size * 0.28, 5, this.size * 0.16);
    ctx.fillRect(-this.size * 0.7, this.size * 0.12, 5, this.size * 0.16);

    ctx.fillStyle = `rgba(255, 220, 100, ${enginePulse * 0.9})`;
    ctx.fillRect(-this.size * 0.72, -this.size * 0.26, 3, this.size * 0.12);
    ctx.fillRect(-this.size * 0.72, this.size * 0.14, 3, this.size * 0.12);

    // Status lights
    const lightPulse = Math.sin(Date.now() * 0.015) > 0;
    ctx.fillStyle = lightPulse ? '#00ff00' : '#004400';
    ctx.fillRect(-this.size * 0.35, -this.size * 0.65, 2, 2);
    ctx.fillRect(-this.size * 0.35, this.size * 0.63, 2, 2);
  }

  renderBomber(ctx) {
    // Enhanced bomber: heavy, bulky, multi-colored, highly armed

    // Main hull (dark red/brown/gray)
    ctx.fillStyle = '#5a3322';
    ctx.fillRect(-this.size * 1.1, -this.size * 0.8, this.size * 2.3, this.size * 1.6);

    // Layered armor plates (red/orange/brown)
    ctx.fillStyle = '#884433';
    ctx.fillRect(-this.size * 0.95, -this.size * 0.7, this.size * 1.8, this.size * 0.45);
    ctx.fillRect(-this.size * 0.95, this.size * 0.25, this.size * 1.8, this.size * 0.45);

    ctx.fillStyle = '#aa5544';
    ctx.fillRect(-this.size * 0.9, -this.size * 0.65, this.size * 1.6, this.size * 0.35);
    ctx.fillRect(-this.size * 0.9, this.size * 0.3, this.size * 1.6, this.size * 0.35);

    ctx.fillStyle = '#cc7755';
    ctx.fillRect(-this.size * 0.85, -this.size * 0.6, this.size * 1.4, this.size * 0.25);
    ctx.fillRect(-this.size * 0.85, this.size * 0.35, this.size * 1.4, this.size * 0.25);

    // Pixelated panel rivets
    ctx.fillStyle = '#331100';
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(-this.size * 0.8 + i * 8, -this.size * 0.55 + j * 8, 1, 1);
        ctx.fillRect(-this.size * 0.8 + i * 8, this.size * 0.35 + j * 8, 1, 1);
      }
    }

    // Central fuselage (darker)
    ctx.fillStyle = '#2a1100';
    ctx.fillRect(-this.size * 0.4, -this.size * 0.5, this.size * 0.9, this.size * 1.0);

    // Fuselage panels (gray metal)
    ctx.fillStyle = '#556655';
    ctx.fillRect(-this.size * 0.35, -this.size * 0.45, this.size * 0.3, this.size * 0.9);
    ctx.fillRect(this.size * 0.15, -this.size * 0.45, this.size * 0.3, this.size * 0.9);

    // Vents/cooling (pixelated)
    ctx.fillStyle = '#221100';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(-this.size * 0.3 + i * 5, -this.size * 0.4, 3, 3);
      ctx.fillRect(-this.size * 0.3 + i * 5, -this.size * 0.3, 3, 3);
      ctx.fillRect(-this.size * 0.3 + i * 5, this.size * 0.27, 3, 3);
      ctx.fillRect(-this.size * 0.3 + i * 5, this.size * 0.37, 3, 3);
    }

    // Reinforced nose (multi-layer, orange/red/yellow)
    ctx.fillStyle = '#995533';
    ctx.beginPath();
    ctx.moveTo(this.size * 1.1, 0);
    ctx.lineTo(this.size * 0.6, -this.size * 0.5);
    ctx.lineTo(this.size * 0.6, this.size * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#cc7744';
    ctx.beginPath();
    ctx.moveTo(this.size * 1.05, 0);
    ctx.lineTo(this.size * 0.7, -this.size * 0.35);
    ctx.lineTo(this.size * 0.7, this.size * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff9955';
    ctx.beginPath();
    ctx.moveTo(this.size * 1.0, 0);
    ctx.lineTo(this.size * 0.75, -this.size * 0.25);
    ctx.lineTo(this.size * 0.75, this.size * 0.25);
    ctx.closePath();
    ctx.fill();

    // Missile pods (dark gray/metallic with details)
    ctx.fillStyle = '#334455';
    ctx.fillRect(-this.size * 1.05, -this.size * 0.75, this.size * 0.35, this.size * 0.35);
    ctx.fillRect(-this.size * 1.05, this.size * 0.4, this.size * 0.35, this.size * 0.35);

    ctx.fillStyle = '#556677';
    ctx.fillRect(-this.size * 1.0, -this.size * 0.7, this.size * 0.25, this.size * 0.25);
    ctx.fillRect(-this.size * 1.0, this.size * 0.45, this.size * 0.25, this.size * 0.25);

    // Missile tips (red/orange hazard)
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(-this.size * 0.98, -this.size * 0.65, this.size * 0.15, this.size * 0.15);
    ctx.fillRect(-this.size * 0.98, this.size * 0.5, this.size * 0.15, this.size * 0.15);

    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(-this.size * 0.96, -this.size * 0.63, this.size * 0.1, this.size * 0.1);
    ctx.fillRect(-this.size * 0.96, this.size * 0.53, this.size * 0.1, this.size * 0.1);

    // Missile count indicators (green/yellow)
    const missileReady = Math.sin(Date.now() * 0.01) > 0;
    ctx.fillStyle = missileReady ? '#00ff00' : '#ffff00';
    ctx.fillRect(-this.size * 1.02, -this.size * 0.58, 2, 2);
    ctx.fillRect(-this.size * 1.02, this.size * 0.56, 2, 2);

    // Engine nacelles (large, powerful)
    ctx.fillStyle = '#445566';
    ctx.fillRect(-this.size * 1.15, -this.size * 0.55, this.size * 0.45, this.size * 0.35);
    ctx.fillRect(-this.size * 1.15, this.size * 0.2, this.size * 0.45, this.size * 0.35);

    // Engine intakes (cyan tech)
    ctx.fillStyle = '#0088aa';
    ctx.fillRect(-this.size * 1.12, -this.size * 0.5, this.size * 0.12, this.size * 0.25);
    ctx.fillRect(-this.size * 1.12, this.size * 0.25, this.size * 0.12, this.size * 0.25);

    // Engine glow (orange/yellow/white)
    const enginePulse = Math.sin(Date.now() * 0.006) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 80, 0, ${enginePulse})`;
    ctx.fillRect(-this.size * 1.2, -this.size * 0.5, this.size * 0.4, this.size * 0.3);
    ctx.fillRect(-this.size * 1.2, this.size * 0.2, this.size * 0.4, this.size * 0.3);

    ctx.fillStyle = `rgba(255, 180, 60, ${enginePulse * 0.9})`;
    ctx.fillRect(-this.size * 1.18, -this.size * 0.45, this.size * 0.3, this.size * 0.2);
    ctx.fillRect(-this.size * 1.18, this.size * 0.25, this.size * 0.3, this.size * 0.2);

    ctx.fillStyle = `rgba(255, 240, 200, ${enginePulse * 0.8})`;
    ctx.fillRect(-this.size * 1.16, -this.size * 0.42, this.size * 0.2, this.size * 0.14);
    ctx.fillRect(-this.size * 1.16, this.size * 0.28, this.size * 0.2, this.size * 0.14);

    // Cockpit (multi-layer, small for heavy ship)
    ctx.fillStyle = '#003344';
    ctx.fillRect(this.size * 0.5, -this.size * 0.2, 8, this.size * 0.4);
    ctx.fillStyle = '#006688';
    ctx.fillRect(this.size * 0.55, -this.size * 0.15, 5, this.size * 0.3);
    ctx.fillStyle = '#00aacc';
    ctx.fillRect(this.size * 0.58, -this.size * 0.12, 3, this.size * 0.24);

    // Weapon turrets (gray/red)
    ctx.fillStyle = '#666666';
    ctx.fillRect(this.size * 0.2, -this.size * 0.85, 6, 6);
    ctx.fillRect(this.size * 0.2, this.size * 0.79, 6, 6);

    ctx.fillStyle = '#ff3300';
    ctx.fillRect(this.size * 0.22, -this.size * 0.83, 3, 3);
    ctx.fillRect(this.size * 0.22, this.size * 0.8, 3, 3);
  }

  renderFrigate(ctx) {
    // Enhanced frigate: massive capital ship, multi-colored, heavily detailed

    // Main hull (dark purple/blue/gray)
    ctx.fillStyle = '#4a3366';
    ctx.fillRect(-this.size * 1.3, -this.size * 0.9, this.size * 2.6, this.size * 1.8);

    // Layered armor plating (purple/blue/gray)
    ctx.fillStyle = '#5a4477';
    ctx.fillRect(-this.size * 1.25, -this.size * 0.85, this.size * 2.5, this.size * 0.75);
    ctx.fillRect(-this.size * 1.25, this.size * 0.1, this.size * 2.5, this.size * 0.75);

    ctx.fillStyle = '#6a5588';
    ctx.fillRect(-this.size * 1.2, -this.size * 0.8, this.size * 2.4, this.size * 0.65);
    ctx.fillRect(-this.size * 1.2, this.size * 0.15, this.size * 2.4, this.size * 0.65);

    ctx.fillStyle = '#7a6699';
    ctx.fillRect(-this.size * 1.15, -this.size * 0.75, this.size * 2.3, this.size * 0.55);
    ctx.fillRect(-this.size * 1.15, this.size * 0.2, this.size * 2.3, this.size * 0.55);

    // Armor panel details/rivets
    ctx.fillStyle = '#2a1144';
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.fillRect(-this.size * 1.1 + i * 8, -this.size * 0.7 + j * 8, 1, 1);
        ctx.fillRect(-this.size * 1.1 + i * 8, this.size * 0.25 + j * 8, 1, 1);
      }
    }

    // Heavy armor sections (gray/metallic)
    ctx.fillStyle = '#556677';
    ctx.fillRect(-this.size * 1.0, -this.size * 0.9, this.size * 0.65, this.size * 1.8);
    ctx.fillRect(-this.size * 0.2, -this.size * 0.9, this.size * 0.65, this.size * 1.8);
    ctx.fillRect(this.size * 0.6, -this.size * 0.9, this.size * 0.65, this.size * 1.8);

    ctx.fillStyle = '#6677aa';
    ctx.fillRect(-this.size * 0.95, -this.size * 0.85, this.size * 0.55, this.size * 0.4);
    ctx.fillRect(-this.size * 0.15, -this.size * 0.85, this.size * 0.55, this.size * 0.4);
    ctx.fillRect(this.size * 0.65, -this.size * 0.85, this.size * 0.55, this.size * 0.4);

    // Tech panels (cyan/blue)
    ctx.fillStyle = '#0088aa';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-this.size * 0.9 + i * this.size * 0.65, -this.size * 0.75, this.size * 0.15, this.size * 0.25);
      ctx.fillRect(-this.size * 0.9 + i * this.size * 0.65, this.size * 0.5, this.size * 0.15, this.size * 0.25);
    }

    // Central corridor (darker)
    ctx.fillStyle = '#1a0a22';
    ctx.fillRect(-this.size * 0.5, -this.size * 0.3, this.size * 1.6, this.size * 0.6);

    // Corridor windows/vents
    ctx.fillStyle = '#2a1a44';
    for (let i = 0; i < 12; i++) {
      ctx.fillRect(-this.size * 0.45 + i * 10, -this.size * 0.25, 6, 6);
      ctx.fillRect(-this.size * 0.45 + i * 10, this.size * 0.19, 6, 6);
    }

    // Bridge tower (multi-layered)
    ctx.fillStyle = '#778899';
    ctx.fillRect(this.size * 0.4, -this.size * 0.65, this.size * 0.6, this.size * 1.3);

    ctx.fillStyle = '#8899aa';
    ctx.fillRect(this.size * 0.45, -this.size * 0.6, this.size * 0.5, this.size * 1.2);

    ctx.fillStyle = '#99aabb';
    ctx.fillRect(this.size * 0.5, -this.size * 0.55, this.size * 0.4, this.size * 1.1);

    // Bridge windows (multi-row, cyan)
    ctx.fillStyle = '#004466';
    for (let row = 0; row < 4; row++) {
      ctx.fillRect(this.size * 0.55, -this.size * 0.45 + row * this.size * 0.3, this.size * 0.3, this.size * 0.2);
    }

    ctx.fillStyle = '#0088aa';
    for (let row = 0; row < 4; row++) {
      ctx.fillRect(this.size * 0.58, -this.size * 0.42 + row * this.size * 0.3, this.size * 0.24, this.size * 0.14);
    }

    ctx.fillStyle = '#00ccff';
    for (let row = 0; row < 4; row++) {
      ctx.fillRect(this.size * 0.61, -this.size * 0.39 + row * this.size * 0.3, this.size * 0.18, this.size * 0.08);
    }

    // Communication arrays (orange/yellow)
    ctx.fillStyle = '#ff8833';
    ctx.fillRect(this.size * 0.48, -this.size * 0.7, 4, 10);
    ctx.fillRect(this.size * 0.88, -this.size * 0.7, 4, 10);

    ctx.fillStyle = '#ffaa55';
    ctx.fillRect(this.size * 0.49, -this.size * 0.68, 2, 6);
    ctx.fillRect(this.size * 0.89, -this.size * 0.68, 2, 6);

    // Engine nacelles (massive, quad-engine)
    ctx.fillStyle = '#445566';
    ctx.fillRect(-this.size * 1.35, -this.size * 0.7, this.size * 0.5, this.size * 0.45);
    ctx.fillRect(-this.size * 1.35, -this.size * 0.15, this.size * 0.5, this.size * 0.45);
    ctx.fillRect(-this.size * 1.35, this.size * 0.25, this.size * 0.5, this.size * 0.45);
    ctx.fillRect(-this.size * 1.35, this.size * 0.8, this.size * 0.5, 0); // Removed, was off-screen

    // Engine intakes
    ctx.fillStyle = '#0066aa';
    ctx.fillRect(-this.size * 1.32, -this.size * 0.65, this.size * 0.15, this.size * 0.35);
    ctx.fillRect(-this.size * 1.32, -this.size * 0.1, this.size * 0.15, this.size * 0.35);

    // Engine glow (blue/purple/white)
    const enginePulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(80, 80, 255, ${enginePulse})`;
    ctx.fillRect(-this.size * 1.4, -this.size * 0.65, this.size * 0.45, this.size * 0.35);
    ctx.fillRect(-this.size * 1.4, -this.size * 0.1, this.size * 0.45, this.size * 0.35);

    ctx.fillStyle = `rgba(150, 150, 255, ${enginePulse * 0.9})`;
    ctx.fillRect(-this.size * 1.38, -this.size * 0.6, this.size * 0.35, this.size * 0.25);
    ctx.fillRect(-this.size * 1.38, -this.size * 0.05, this.size * 0.35, this.size * 0.25);

    ctx.fillStyle = `rgba(220, 220, 255, ${enginePulse * 0.8})`;
    ctx.fillRect(-this.size * 1.36, -this.size * 0.57, this.size * 0.25, this.size * 0.19);
    ctx.fillRect(-this.size * 1.36, -this.size * 0.02, this.size * 0.25, this.size * 0.19);

    // Weapon turrets (multiple, heavy)
    ctx.fillStyle = '#444455';
    ctx.fillRect(this.size * 0.95, -this.size * 0.85, this.size * 0.35, this.size * 0.3);
    ctx.fillRect(this.size * 0.95, this.size * 0.55, this.size * 0.35, this.size * 0.3);
    ctx.fillRect(this.size * 0.2, -this.size * 0.95, this.size * 0.25, this.size * 0.25);
    ctx.fillRect(this.size * 0.2, this.size * 0.7, this.size * 0.25, this.size * 0.25);

    ctx.fillStyle = '#556677';
    ctx.fillRect(this.size * 0.98, -this.size * 0.82, this.size * 0.28, this.size * 0.24);
    ctx.fillRect(this.size * 0.98, this.size * 0.58, this.size * 0.28, this.size * 0.24);

    // Weapon barrels
    ctx.strokeStyle = '#778899';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.size * 1.3, -this.size * 0.7);
    ctx.lineTo(this.size * 1.6, -this.size * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.size * 1.3, this.size * 0.7);
    ctx.lineTo(this.size * 1.6, this.size * 0.7);
    ctx.stroke();

    // Weapon muzzles (red/orange)
    ctx.fillStyle = '#ff3300';
    ctx.fillRect(this.size * 1.58, -this.size * 0.72, 4, 4);
    ctx.fillRect(this.size * 1.58, this.size * 0.68, 4, 4);

    // Status lights (various colors)
    const statusBlink = Math.sin(Date.now() * 0.01) > 0;
    ctx.fillStyle = statusBlink ? '#00ff00' : '#003300';
    ctx.fillRect(-this.size * 0.75, -this.size * 0.88, 2, 2);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-this.size * 0.65, -this.size * 0.88, 2, 2);
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(-this.size * 0.55, -this.size * 0.88, 2, 2);
  }

  renderHiveDrone(ctx) {
    // 16-bit multi-colored bio-mechanical insectoid design
    // Colors: dark brown/green chitin, orange/yellow bio-luminescent organs,
    // cyan/teal bio-tech implants, purple/magenta energy veins

    const time = Date.now() * 0.001;
    const breathePulse = Math.sin(time * 2) * 0.05 + 1.0;

    // === MAIN BODY (Segmented organic carapace) ===

    // Base body shell (dark brown chitinous exoskeleton)
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 0.8 * breathePulse, this.size * 0.5 * breathePulse, 0, 0, Math.PI * 2);
    ctx.fill();

    // Armored carapace plates (layered green-brown chitin)
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(-this.size * 0.5, -this.size * 0.25, this.size * 0.25, this.size * 0.5);
    ctx.fillRect(-this.size * 0.2, -this.size * 0.3, this.size * 0.25, this.size * 0.6);
    ctx.fillRect(this.size * 0.1, -this.size * 0.25, this.size * 0.2, this.size * 0.5);

    // Carapace highlights (greenish-brown)
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(-this.size * 0.48, -this.size * 0.22, this.size * 0.2, this.size * 0.44);
    ctx.fillRect(-this.size * 0.18, -this.size * 0.27, this.size * 0.2, this.size * 0.54);

    // Pixelated chitinous texture (tiny plates)
    ctx.fillStyle = '#2a1a0a';
    for (let i = -3; i <= 3; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.random() > 0.6) {
          ctx.fillRect(
            -this.size * 0.4 + i * 4,
            -this.size * 0.2 + j * 5,
            2, 2
          );
        }
      }
    }

    // === BIO-LUMINESCENT ORGANS (Pulsing orange/yellow) ===

    const organPulse = Math.sin(time * 3) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(255, 150, 0, ${organPulse})`;

    // Multiple glowing sacs along body
    ctx.fillRect(-this.size * 0.35, -this.size * 0.15, 6, 4);
    ctx.fillRect(-this.size * 0.05, -this.size * 0.2, 5, 5);
    ctx.fillRect(this.size * 0.15, -this.size * 0.1, 4, 3);

    ctx.fillRect(-this.size * 0.35, this.size * 0.1, 6, 4);
    ctx.fillRect(-this.size * 0.05, this.size * 0.15, 5, 5);

    // Organ cores (bright yellow)
    ctx.fillStyle = `rgba(255, 255, 100, ${organPulse * 0.8})`;
    ctx.fillRect(-this.size * 0.33, -this.size * 0.13, 2, 2);
    ctx.fillRect(-this.size * 0.03, -this.size * 0.18, 2, 2);
    ctx.fillRect(-this.size * 0.33, this.size * 0.12, 2, 2);

    // === BIO-TECH IMPLANTS (Cyan/teal mechanical grafts) ===

    // Tech nodes embedded in carapace
    ctx.fillStyle = '#00aaaa';
    ctx.fillRect(-this.size * 0.25, -this.size * 0.35, 4, 4);
    ctx.fillRect(this.size * 0.05, -this.size * 0.38, 3, 3);
    ctx.fillRect(-this.size * 0.25, this.size * 0.3, 4, 4);
    ctx.fillRect(this.size * 0.05, this.size * 0.35, 3, 3);

    // Tech node lights (bright cyan)
    const techPulse = Math.sin(time * 4) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(0, 255, 255, ${techPulse})`;
    ctx.fillRect(-this.size * 0.24, -this.size * 0.34, 2, 2);
    ctx.fillRect(this.size * 0.06, -this.size * 0.37, 1, 1);
    ctx.fillRect(-this.size * 0.24, this.size * 0.31, 2, 2);

    // === ENERGY VEINS (Purple/magenta bio-energy) ===

    ctx.strokeStyle = `rgba(200, 0, 255, ${organPulse * 0.6})`;
    ctx.lineWidth = 2;

    // Vein network through body
    ctx.beginPath();
    ctx.moveTo(-this.size * 0.5, 0);
    ctx.lineTo(-this.size * 0.25, -this.size * 0.15);
    ctx.lineTo(0, -this.size * 0.2);
    ctx.lineTo(this.size * 0.2, -this.size * 0.1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-this.size * 0.5, 0);
    ctx.lineTo(-this.size * 0.25, this.size * 0.15);
    ctx.lineTo(0, this.size * 0.2);
    ctx.lineTo(this.size * 0.2, this.size * 0.1);
    ctx.stroke();

    // Vein nodes (bright magenta)
    ctx.fillStyle = `rgba(255, 0, 200, ${organPulse})`;
    ctx.fillRect(-this.size * 0.25, -this.size * 0.15, 2, 2);
    ctx.fillRect(0, -this.size * 0.2, 2, 2);
    ctx.fillRect(-this.size * 0.25, this.size * 0.15, 2, 2);
    ctx.fillRect(0, this.size * 0.2, 2, 2);

    // === HEAD (Bio-mechanical hybrid with multiple sensors) ===

    // Head carapace (dark brown)
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.arc(this.size * 0.5, 0, this.size * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Head armor layer (greenish-brown)
    ctx.fillStyle = '#4a3a2a';
    ctx.beginPath();
    ctx.arc(this.size * 0.5, 0, this.size * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // Head tech implant (cyan metal plate)
    ctx.fillStyle = '#006666';
    ctx.fillRect(this.size * 0.35, -this.size * 0.15, this.size * 0.2, this.size * 0.3);

    // Mandibles (dark orange organic weapon)
    ctx.fillStyle = '#aa4400';
    ctx.fillRect(this.size * 0.75, -this.size * 0.25, this.size * 0.15, this.size * 0.1);
    ctx.fillRect(this.size * 0.75, this.size * 0.15, this.size * 0.15, this.size * 0.1);

    // Mandible tips (red)
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(this.size * 0.88, -this.size * 0.24, 3, 3);
    ctx.fillRect(this.size * 0.88, this.size * 0.18, 3, 3);

    // === COMPOUND EYES (Multiple glowing sensors) ===

    const eyeGlow = Math.sin(time * 5) * 0.3 + 0.7;

    // Primary eyes (large green bio-sensors)
    ctx.fillStyle = `rgba(0, 255, 100, ${eyeGlow})`;
    ctx.fillRect(this.size * 0.55, -this.size * 0.2, 5, 5);
    ctx.fillRect(this.size * 0.55, this.size * 0.15, 5, 5);

    // Eye cores (bright green)
    ctx.fillStyle = `rgba(150, 255, 150, ${eyeGlow})`;
    ctx.fillRect(this.size * 0.56, -this.size * 0.19, 3, 3);
    ctx.fillRect(this.size * 0.56, this.size * 0.16, 3, 3);

    // Secondary sensor eyes (smaller, cyan tech-eyes)
    ctx.fillStyle = `rgba(0, 255, 255, ${techPulse})`;
    ctx.fillRect(this.size * 0.48, -this.size * 0.28, 3, 3);
    ctx.fillRect(this.size * 0.48, this.size * 0.25, 3, 3);
    ctx.fillRect(this.size * 0.62, -this.size * 0.08, 2, 2);
    ctx.fillRect(this.size * 0.62, this.size * 0.06, 2, 2);

    // === WINGS (Bio-mechanical translucent membranes) ===

    const wingAngle = Math.sin(time * 6) * 0.5;
    const wingBeat = Math.abs(Math.sin(time * 6)) * 0.4 + 0.6;

    ctx.globalAlpha = 0.6;

    // Top wing (gradient purple to teal)
    ctx.fillStyle = '#aa44cc';
    ctx.beginPath();
    ctx.ellipse(-this.size * 0.25, -this.size * 0.9 * wingBeat, this.size * 0.6, this.size * 0.35, wingAngle - 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Top wing tech edge (cyan)
    ctx.fillStyle = '#0088aa';
    ctx.beginPath();
    ctx.ellipse(-this.size * 0.25, -this.size * 0.9 * wingBeat, this.size * 0.5, this.size * 0.28, wingAngle - 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Bottom wing
    ctx.fillStyle = '#aa44cc';
    ctx.beginPath();
    ctx.ellipse(-this.size * 0.25, this.size * 0.9 * wingBeat, this.size * 0.6, this.size * 0.35, -wingAngle + 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Bottom wing tech edge (cyan)
    ctx.fillStyle = '#0088aa';
    ctx.beginPath();
    ctx.ellipse(-this.size * 0.25, this.size * 0.9 * wingBeat, this.size * 0.5, this.size * 0.28, -wingAngle + 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Wing veins (complex network)
    ctx.strokeStyle = `rgba(100, 255, 150, ${organPulse * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;

    // Top wing veins
    ctx.beginPath();
    ctx.moveTo(-this.size * 0.25, -this.size * 0.9 * wingBeat);
    ctx.lineTo(-this.size * 0.6, -this.size * 1.1 * wingBeat);
    ctx.moveTo(-this.size * 0.25, -this.size * 0.9 * wingBeat);
    ctx.lineTo(-this.size * 0.5, -this.size * 0.7 * wingBeat);
    ctx.moveTo(-this.size * 0.25, -this.size * 0.9 * wingBeat);
    ctx.lineTo(-this.size * 0.7, -this.size * 0.85 * wingBeat);
    ctx.moveTo(-this.size * 0.25, -this.size * 0.9 * wingBeat);
    ctx.lineTo(0, -this.size * 0.95 * wingBeat);
    ctx.stroke();

    // Bottom wing veins
    ctx.beginPath();
    ctx.moveTo(-this.size * 0.25, this.size * 0.9 * wingBeat);
    ctx.lineTo(-this.size * 0.6, this.size * 1.1 * wingBeat);
    ctx.moveTo(-this.size * 0.25, this.size * 0.9 * wingBeat);
    ctx.lineTo(-this.size * 0.5, this.size * 0.7 * wingBeat);
    ctx.moveTo(-this.size * 0.25, this.size * 0.9 * wingBeat);
    ctx.lineTo(-this.size * 0.7, this.size * 0.85 * wingBeat);
    ctx.moveTo(-this.size * 0.25, this.size * 0.9 * wingBeat);
    ctx.lineTo(0, this.size * 0.95 * wingBeat);
    ctx.stroke();

    // Wing vein nodes (glowing)
    ctx.fillStyle = `rgba(0, 255, 200, ${techPulse * 0.8})`;
    ctx.fillRect(-this.size * 0.6, -this.size * 1.1 * wingBeat, 2, 2);
    ctx.fillRect(-this.size * 0.5, -this.size * 0.7 * wingBeat, 2, 2);
    ctx.fillRect(-this.size * 0.6, this.size * 1.1 * wingBeat, 2, 2);
    ctx.fillRect(-this.size * 0.5, this.size * 0.7 * wingBeat, 2, 2);

    ctx.globalAlpha = 1;

    // === BIO-WEAPON PODS (Organic projectile launchers) ===

    // Upper weapon pod (dark green organic)
    ctx.fillStyle = '#2a4a2a';
    ctx.fillRect(this.size * 0.3, -this.size * 0.45, this.size * 0.25, this.size * 0.15);

    // Pod opening (red/orange)
    ctx.fillStyle = '#aa3300';
    ctx.fillRect(this.size * 0.48, -this.size * 0.42, this.size * 0.06, this.size * 0.09);

    // Pod ready indicator (pulsing yellow)
    const weaponReady = Math.sin(time * 3.5) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 255, 0, ${weaponReady})`;
    ctx.fillRect(this.size * 0.35, -this.size * 0.4, 2, 2);

    // Lower weapon pod
    ctx.fillStyle = '#2a4a2a';
    ctx.fillRect(this.size * 0.3, this.size * 0.3, this.size * 0.25, this.size * 0.15);

    // Pod opening
    ctx.fillStyle = '#aa3300';
    ctx.fillRect(this.size * 0.48, this.size * 0.33, this.size * 0.06, this.size * 0.09);

    // Pod ready indicator
    ctx.fillStyle = `rgba(255, 255, 0, ${weaponReady})`;
    ctx.fillRect(this.size * 0.35, this.size * 0.38, 2, 2);

    // === BIO-THRUSTERS (Organic propulsion vents) ===

    // Rear bio-vents (dark purple)
    ctx.fillStyle = '#3a2a4a';
    ctx.fillRect(-this.size * 0.75, -this.size * 0.2, this.size * 0.15, this.size * 0.15);
    ctx.fillRect(-this.size * 0.75, this.size * 0.05, this.size * 0.15, this.size * 0.15);

    // Thruster glow (purple/magenta with organic pulsing)
    const thrustPulse = Math.sin(time * 8) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(200, 0, 255, ${thrustPulse})`;
    ctx.fillRect(-this.size * 0.9, -this.size * 0.18, this.size * 0.15, this.size * 0.11);
    ctx.fillRect(-this.size * 0.9, this.size * 0.07, this.size * 0.15, this.size * 0.11);

    // Thruster cores (bright magenta)
    ctx.fillStyle = `rgba(255, 100, 255, ${thrustPulse * 0.8})`;
    ctx.fillRect(-this.size * 0.88, -this.size * 0.16, this.size * 0.1, this.size * 0.07);
    ctx.fillRect(-this.size * 0.88, this.size * 0.09, this.size * 0.1, this.size * 0.07);
  }
}
