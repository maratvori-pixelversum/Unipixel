/**
 * Advanced Shield System
 * Multiple shield types with unique characteristics:
 * 1. Energy Shields - Good vs energy weapons, fast recharge
 * 2. Kinetic Barriers - Good vs kinetic weapons, slow recharge
 * 3. Ablative Armor - Damage reduction, doesn't recharge
 * 4. Adaptive Shields - Learns from damage types
 * 5. Phase Shields - Chance to completely negate damage
 */

export class ShieldSystem {
  constructor() {
    this.shields = [];
    this.activeShieldIndex = 0;
    this.totalShieldStrength = 0;
    this.maxTotalShieldStrength = 0;

    // Advanced shield mechanics
    this.overloadActive = false;
    this.overloadTimer = 0;
    this.overloadCooldown = 0;
    this.overloadMultiplier = 2.0;
    this.overloadDuration = 3.0;
    this.overloadCooldownTime = 15.0;

    // Sectional shields
    this.sectionalShields = {
      front: { strength: 0, maxStrength: 0, multiplier: 1.5 },
      rear: { strength: 0, maxStrength: 0, multiplier: 0.8 },
      left: { strength: 0, maxStrength: 0, multiplier: 1.0 },
      right: { strength: 0, maxStrength: 0, multiplier: 1.0 }
    };
    this.useSectionalShields = false;

    // Shield harmonics (bonus from multiple shield types)
    this.harmonicBonus = 0;

    // Shield modulation
    this.modulationMode = 'balanced'; // balanced, kinetic, energy, explosive
    this.modulationBonuses = {
      balanced: { kinetic: 1.0, energy: 1.0, explosive: 1.0 },
      kinetic: { kinetic: 0.7, energy: 1.3, explosive: 1.1 },
      energy: { kinetic: 1.3, energy: 0.7, explosive: 1.1 },
      explosive: { kinetic: 1.1, energy: 1.1, explosive: 0.7 }
    };

    // Emergency boost
    this.emergencyBoostAvailable = true;
    this.emergencyBoostCooldown = 0;
    this.emergencyBoostCooldownTime = 30.0;

    // ULTRA-ENHANCED: Energy flow particles for realistic shield visualization
    this.energyParticles = [];
    this.maxEnergyParticles = 1200; // MASSIVE INCREASE from 600 - thousands of particles
    this.energyStreams = [];
    this.crackleArcs = [];
    this.maxCrackleArcs = 40; // Maximum concurrent arcs
    this.time = 0;
  }

  /**
   * Add shield to the system
   */
  addShield(shieldType, tier = 1) {
    const shield = this.createShield(shieldType, tier);
    this.shields.push(shield);
    this.updateTotalStrength();
    return shield;
  }

  /**
   * Create shield based on type and tier
   */
  createShield(type, tier) {
    const baseStrength = 50 + (tier - 1) * 30;
    const baseRecharge = 5 + (tier - 1) * 3;

    switch (type) {
      case 'energy_shield':
        return {
          type: 'energy_shield',
          name: `Energy Shield Mk${tier}`,
          tier,
          strength: baseStrength,
          maxStrength: baseStrength,
          rechargeRate: baseRecharge * 1.5,
          rechargeDelay: 2.0,
          timeSinceHit: 0,
          active: true,
          // Resistances (1.0 = normal, >1.0 = weak, <1.0 = strong)
          kineticResistance: 1.3, // Weak vs kinetic
          energyResistance: 0.7, // Strong vs energy
          explosiveResistance: 1.0,
          color: '#00ffff',
          glowColor: '#00ccff',
          description: 'High-frequency energy barrier. Strong vs energy, weak vs kinetic. Fast recharge.'
        };

      case 'kinetic_barrier':
        return {
          type: 'kinetic_barrier',
          name: `Kinetic Barrier Mk${tier}`,
          tier,
          strength: baseStrength * 1.3,
          maxStrength: baseStrength * 1.3,
          rechargeRate: baseRecharge * 0.6,
          rechargeDelay: 3.5,
          timeSinceHit: 0,
          active: true,
          kineticResistance: 0.6, // Strong vs kinetic
          energyResistance: 1.2, // Weak vs energy
          explosiveResistance: 0.9,
          color: '#8844ff',
          glowColor: '#6622cc',
          description: 'Mass effect field. Excellent vs kinetic, poor vs energy. Slow recharge.'
        };

      case 'ablative_armor':
        return {
          type: 'ablative_armor',
          name: `Ablative Armor Mk${tier}`,
          tier,
          strength: baseStrength * 2,
          maxStrength: baseStrength * 2,
          rechargeRate: 0, // Doesn't recharge
          rechargeDelay: 99999,
          timeSinceHit: 0,
          active: true,
          kineticResistance: 0.5,
          energyResistance: 0.8,
          explosiveResistance: 0.6,
          ablative: true, // Loses effectiveness as it's damaged
          color: '#ffaa00',
          glowColor: '#ff8800',
          description: 'Sacrificial armor plating. High capacity, no recharge. Repairs at stations.'
        };

      case 'adaptive_shield':
        return {
          type: 'adaptive_shield',
          name: `Adaptive Shield Mk${tier}`,
          tier,
          strength: baseStrength * 0.8,
          maxStrength: baseStrength * 0.8,
          rechargeRate: baseRecharge,
          rechargeDelay: 2.5,
          timeSinceHit: 0,
          active: true,
          kineticResistance: 1.0,
          energyResistance: 1.0,
          explosiveResistance: 1.0,
          adaptive: true,
          lastDamageType: null,
          adaptiveBonus: 0, // Builds up resistance to repeated damage
          maxAdaptiveBonus: 0.5,
          adaptiveDecay: 0.1,
          color: '#ff00ff',
          glowColor: '#cc00cc',
          description: 'AI-controlled adaptive barrier. Learns and resists damage patterns.'
        };

      case 'phase_shield':
        return {
          type: 'phase_shield',
          name: `Phase Shield Mk${tier}`,
          tier,
          strength: baseStrength * 0.6,
          maxStrength: baseStrength * 0.6,
          rechargeRate: baseRecharge * 1.2,
          rechargeDelay: 1.5,
          timeSinceHit: 0,
          active: true,
          kineticResistance: 1.0,
          energyResistance: 1.0,
          explosiveResistance: 1.0,
          phaseChance: 0.25 + (tier - 1) * 0.05, // 25-35% chance to negate
          phasing: false,
          color: '#00ff00',
          glowColor: '#00cc00',
          description: 'Quantum phase technology. Chance to completely negate incoming damage.'
        };

      case 'regenerative_shield':
        return {
          type: 'regenerative_shield',
          name: `Regenerative Shield Mk${tier}`,
          tier,
          strength: baseStrength * 0.9,
          maxStrength: baseStrength * 0.9,
          rechargeRate: baseRecharge * 2,
          rechargeDelay: 1.0,
          timeSinceHit: 0,
          active: true,
          kineticResistance: 1.1,
          energyResistance: 1.1,
          explosiveResistance: 1.1,
          regenerative: true,
          passiveRegenRate: 1, // Always regenerating
          color: '#00ffaa',
          glowColor: '#00cc88',
          description: 'Bio-synthetic barrier. Continuous passive regeneration, short delay.'
        };

      default:
        return this.createShield('energy_shield', tier);
    }
  }

  /**
   * Update total shield strength
   */
  updateTotalStrength() {
    this.totalShieldStrength = 0;
    this.maxTotalShieldStrength = 0;

    for (const shield of this.shields) {
      if (shield.active) {
        this.totalShieldStrength += shield.strength;
        this.maxTotalShieldStrength += shield.maxStrength;
      }
    }
  }

  /**
   * Take damage to shields
   */
  takeDamage(damage, damageType = 'energy', projectile = null) {
    if (this.shields.length === 0) return damage;

    let remainingDamage = damage;

    for (const shield of this.shields) {
      if (!shield.active || shield.strength <= 0) continue;

      // Phase shield special mechanic
      if (shield.phaseChance && Math.random() < shield.phaseChance) {
        shield.phasing = true;
        setTimeout(() => shield.phasing = false, 200);
        continue; // Damage completely negated
      }

      // Calculate resistance
      let resistance = 1.0;
      if (damageType === 'kinetic') {
        resistance = shield.kineticResistance;
      } else if (damageType === 'energy' || damageType === 'plasma' || damageType === 'laser') {
        resistance = shield.energyResistance;
      } else if (damageType === 'explosive' || damageType === 'missile') {
        resistance = shield.explosiveResistance;
      }

      // Adaptive shield mechanic
      if (shield.adaptive) {
        if (shield.lastDamageType === damageType) {
          shield.adaptiveBonus = Math.min(
            shield.adaptiveBonus + 0.05,
            shield.maxAdaptiveBonus
          );
        } else {
          shield.adaptiveBonus = Math.max(0, shield.adaptiveBonus - 0.1);
          shield.lastDamageType = damageType;
        }
        resistance *= (1 - shield.adaptiveBonus);
      }

      // Apply penetration from projectile
      if (projectile && projectile.shieldPenetration) {
        resistance *= projectile.shieldPenetration;
      }

      const effectiveDamage = remainingDamage * resistance;
      const shieldAbsorbed = Math.min(shield.strength, effectiveDamage);

      shield.strength -= shieldAbsorbed;
      shield.timeSinceHit = 0;

      remainingDamage -= shieldAbsorbed / resistance; // Remaining damage in original scale

      if (remainingDamage <= 0) break;
    }

    this.updateTotalStrength();
    return Math.max(0, remainingDamage);
  }

  /**
   * Update shield recharge and effects
   */
  update(dt) {
    this.time += dt;

    for (const shield of this.shields) {
      if (!shield.active) continue;

      shield.timeSinceHit += dt;

      // Regenerative shields always regen
      if (shield.regenerative && shield.strength < shield.maxStrength) {
        shield.strength = Math.min(
          shield.maxStrength,
          shield.strength + shield.passiveRegenRate * dt
        );
      }

      // Regular recharge after delay
      if (shield.timeSinceHit >= shield.rechargeDelay &&
          shield.strength < shield.maxStrength &&
          shield.rechargeRate > 0) {
        shield.strength = Math.min(
          shield.maxStrength,
          shield.strength + shield.rechargeRate * dt
        );
      }

      // Adaptive shield resistance decay
      if (shield.adaptive && shield.adaptiveBonus > 0) {
        shield.adaptiveBonus = Math.max(
          0,
          shield.adaptiveBonus - shield.adaptiveDecay * dt
        );
      }
    }

    // ULTRA-NEW: Update energy flow particles
    this.updateEnergyParticles(dt);
    this.updateEnergyStreams(dt);
    this.updateCrackleArcs(dt);

    this.updateTotalStrength();
  }

  /**
   * ULTRA-NEW: Update flowing energy particles
   */
  updateEnergyParticles(dt) {
    // Update existing particles
    for (let i = this.energyParticles.length - 1; i >= 0; i--) {
      const particle = this.energyParticles[i];

      particle.life -= dt;
      particle.angle += particle.angularSpeed * dt;
      particle.distance += particle.radialSpeed * dt;

      // Remove dead particles
      if (particle.life <= 0 || particle.distance > particle.maxDistance) {
        this.energyParticles.splice(i, 1);
      }
    }
  }

  /**
   * ULTRA-NEW: Update energy streams
   */
  updateEnergyStreams(dt) {
    // Energy streams slowly rotate and pulse
    for (const stream of this.energyStreams) {
      stream.rotation += stream.rotationSpeed * dt;
      stream.pulsePhase += dt * 2;
    }
  }

  /**
   * ULTRA-NEW: Update crackling energy arcs
   */
  updateCrackleArcs(dt) {
    // Update existing arcs
    for (let i = this.crackleArcs.length - 1; i >= 0; i--) {
      const arc = this.crackleArcs[i];
      arc.life -= dt;

      if (arc.life <= 0) {
        this.crackleArcs.splice(i, 1);
      }
    }
  }

  /**
   * ULTRA-ENHANCED: Render ultra-detailed energy flow shield effects
   * Covers entire spaceship with flowing energy particles and fields
   */
  renderShieldEffects(ctx, x, y, radius, timeSinceHit, impactAngle = 0) {
    // Validate all input parameters
    if (!ctx || typeof x !== 'number' || typeof y !== 'number' || typeof radius !== 'number') {
      return; // Invalid parameters, skip rendering
    }

    if (!isFinite(x) || !isFinite(y) || !isFinite(radius) || radius <= 0) {
      return; // Invalid numeric values, skip rendering
    }

    for (const shield of this.shields) {
      if (!shield.active || shield.strength <= 0) continue;

      const strengthRatio = shield.strength / shield.maxStrength;
      const recentHit = shield.timeSinceHit < 0.3;
      const shieldRadius = radius + 12; // Full coverage around ship

      // Validate shield radius
      if (!isFinite(shieldRadius) || shieldRadius <= 0) continue;

      // Shield alpha based on strength and recent hits
      const baseAlpha = recentHit ? 0.85 : (strengthRatio * 0.6 + 0.2);

      ctx.save();
      ctx.translate(x, y);

      // Generate energy particles continuously
      this.generateEnergyFlowParticles(shield, shieldRadius, strengthRatio);

      // LAYER 1: Full-fill energy field (base layer - covers ENTIRE ship)
      this.renderFullFieldEnergy(ctx, shieldRadius, shield, strengthRatio, baseAlpha);

      // LAYER 2: Thousands of flowing energy particles
      this.renderFlowingEnergyParticles(ctx, shield, strengthRatio);

      // LAYER 3: Energy streams (veins of energy flowing across shield)
      this.renderEnergyStreams(ctx, shieldRadius, shield, strengthRatio);

      // LAYER 4: Crackling energy arcs
      this.renderCracklingArcs(ctx, shieldRadius, shield, strengthRatio, recentHit);

      // LAYER 5: Energy grid overlay (heavily pixelated)
      this.renderPixelatedEnergyGrid(ctx, shieldRadius, shield, strengthRatio, baseAlpha);

      // LAYER 6: Impact effects (if hit recently)
      if (recentHit) {
        this.renderEnergyImpactExplosion(ctx, shieldRadius, shield, impactAngle);
        // Generate extra crackle arcs on impact
        this.spawnImpactArcs(shield, shieldRadius, impactAngle);
      }

      // LAYER 7: Pulsing outer glow
      this.renderPulsingOuterGlow(ctx, shieldRadius, shield, strengthRatio, baseAlpha);

      ctx.restore();
    }
  }

  /**
   * ULTRA-ENHANCED: Generate flowing energy particles - MASSIVE INCREASE
   */
  generateEnergyFlowParticles(shield, radius, strengthRatio) {
    // Generate MANY MORE new particles if under limit
    const particleRate = Math.floor(strengthRatio * 30); // DOUBLED from 15 - more particles when stronger

    for (let i = 0; i < particleRate; i++) {
      if (this.energyParticles.length >= this.maxEnergyParticles) break;

      // Random starting position on shield surface
      const startAngle = Math.random() * Math.PI * 2;
      const startDistance = radius * (0.95 + Math.random() * 0.05);

      this.energyParticles.push({
        angle: startAngle,
        distance: startDistance,
        maxDistance: radius * 1.2,
        angularSpeed: (Math.random() - 0.5) * 0.3, // Flow around shield
        radialSpeed: Math.random() * 8 + 2, // Flow outward slowly
        size: Math.random() > 0.7 ? 3 : 2, // Heavy pixelation: 2-3px
        life: 1.5 + Math.random() * 1.0,
        maxLife: 2.5,
        color: shield.color,
        brightness: 0.3 + Math.random() * 0.7
      });
    }

    // Initialize energy streams if not present - MORE STREAMS
    if (this.energyStreams.length === 0) {
      for (let i = 0; i < 16; i++) { // Increased from 8 to 16
        this.energyStreams.push({
          startAngle: (Math.PI * 2 * i / 16) + Math.random() * 0.2, // Updated for 16 streams
          rotation: 0,
          rotationSpeed: 0.05 + Math.random() * 0.05,
          pulsePhase: Math.random() * Math.PI * 2,
          color: shield.color
        });
      }
    }
  }

  /**
   * ULTRA-NEW: Render full-fill energy field covering entire ship
   */
  renderFullFieldEnergy(ctx, radius, shield, strengthRatio, baseAlpha) {
    // Validate inputs
    if (!isFinite(radius) || radius <= 0 || !isFinite(strengthRatio) || !isFinite(baseAlpha)) {
      return;
    }

    // Create thousands of tiny pixelated energy dots filling the entire shield
    const pixelSize = 2; // Heavily pixelated
    const color = this.parseColor(shield.color);

    // Validate color
    if (!color || !isFinite(color.r) || !isFinite(color.g) || !isFinite(color.b)) {
      return;
    }

    ctx.globalAlpha = baseAlpha * 0.4;

    // Fill entire shield area with pixelated energy texture
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      for (let r = 0; r < radius; r += pixelSize * 3) {
        // Random pixelated effect
        if (Math.random() > 0.6) {
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;

          // Pixelate position
          const pixelX = Math.floor(px / pixelSize) * pixelSize;
          const pixelY = Math.floor(py / pixelSize) * pixelSize;

          // Validate coordinates before drawing
          if (!isFinite(pixelX) || !isFinite(pixelY)) continue;

          const brightness = 0.5 + Math.random() * 0.5;
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${brightness * strengthRatio})`;
          ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        }
      }
    }

    // Add radial gradient overlay for depth
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`);
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${baseAlpha * 0.3})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${baseAlpha * 0.6})`);

    ctx.globalAlpha = baseAlpha * 0.7;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  /**
   * ULTRA-NEW: Render thousands of flowing energy particles
   */
  renderFlowingEnergyParticles(ctx, shield, strengthRatio) {
    const color = this.parseColor(shield.color);

    // Validate color
    if (!color || !isFinite(color.r) || !isFinite(color.g) || !isFinite(color.b)) {
      return;
    }

    const pixelSize = 2; // Heavy pixelation

    for (const particle of this.energyParticles) {
      const lifeRatio = particle.life / particle.maxLife;
      const alpha = lifeRatio * particle.brightness * strengthRatio;

      if (alpha < 0.05) continue;

      // Calculate particle position
      const px = Math.cos(particle.angle) * particle.distance;
      const py = Math.sin(particle.angle) * particle.distance;

      // Pixelate position
      const pixelX = Math.floor(px / pixelSize) * pixelSize;
      const pixelY = Math.floor(py / pixelSize) * pixelSize;

      // Validate coordinates and size
      if (!isFinite(pixelX) || !isFinite(pixelY) || !isFinite(particle.size)) continue;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;

      // Draw pixelated particle with slight glow
      ctx.shadowColor = shield.glowColor;
      ctx.shadowBlur = 4;
      ctx.fillRect(pixelX, pixelY, particle.size, particle.size);
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  }

  /**
   * ULTRA-NEW: Render energy streams (veins flowing across shield)
   */
  renderEnergyStreams(ctx, radius, shield, strengthRatio) {
    const color = this.parseColor(shield.color);
    const pixelSize = 2;

    for (const stream of this.energyStreams) {
      const pulseIntensity = Math.sin(stream.pulsePhase) * 0.5 + 0.5;
      const streamAlpha = (0.4 + pulseIntensity * 0.3) * strengthRatio;

      ctx.globalAlpha = streamAlpha;
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${streamAlpha})`;
      ctx.lineWidth = 2;

      // Draw energy stream from center spiraling outward
      ctx.beginPath();
      for (let r = 0; r <= radius; r += pixelSize * 2) {
        const angle = stream.startAngle + stream.rotation + (r / radius) * Math.PI * 0.5;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        // Pixelate the stream
        const px = Math.floor(x / pixelSize) * pixelSize;
        const py = Math.floor(y / pixelSize) * pixelSize;

        if (r === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Add glow to stream
      ctx.shadowColor = shield.glowColor;
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  }

  /**
   * ULTRA-NEW: Render crackling energy arcs
   */
  renderCracklingArcs(ctx, radius, shield, strengthRatio, recentHit) {
    if (this.crackleArcs.length === 0 && !recentHit) {
      // Spawn random arcs occasionally
      if (Math.random() > 0.97) {
        this.spawnRandomArc(shield, radius);
      }
    }

    const color = this.parseColor(shield.glowColor);

    for (const arc of this.crackleArcs) {
      const arcAlpha = (arc.life / arc.maxLife) * strengthRatio;

      ctx.globalAlpha = arcAlpha;
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${arcAlpha})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = shield.glowColor;
      ctx.shadowBlur = 8;

      // Draw jagged lightning arc
      ctx.beginPath();
      ctx.moveTo(arc.points[0].x, arc.points[0].y);
      for (let i = 1; i < arc.points.length; i++) {
        ctx.lineTo(arc.points[i].x, arc.points[i].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  }

  /**
   * ULTRA-NEW: Spawn random crackling arc
   */
  spawnRandomArc(shield, radius) {
    const startAngle = Math.random() * Math.PI * 2;
    const endAngle = startAngle + (Math.random() - 0.5) * Math.PI;

    const points = [];
    const segments = 8 + Math.floor(Math.random() * 6);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = startAngle + (endAngle - startAngle) * t;
      const r = radius * (0.7 + Math.random() * 0.3);

      // Add jagged offset
      const jag = (Math.random() - 0.5) * 15;
      const x = Math.cos(angle) * r + jag;
      const y = Math.sin(angle) * r + jag;

      points.push({ x, y });
    }

    this.crackleArcs.push({
      points: points,
      life: 0.15 + Math.random() * 0.1,
      maxLife: 0.2,
      color: shield.glowColor
    });
  }

  /**
   * ULTRA-NEW: Spawn impact arcs on hit
   */
  spawnImpactArcs(shield, radius, impactAngle) {
    const impactX = Math.cos(impactAngle) * radius;
    const impactY = Math.sin(impactAngle) * radius;

    // Spawn multiple arcs from impact point
    for (let i = 0; i < 6; i++) {
      const arcAngle = impactAngle + (Math.random() - 0.5) * Math.PI;
      const arcLength = 30 + Math.random() * 40;

      const points = [{ x: impactX, y: impactY }];
      const segments = 5 + Math.floor(Math.random() * 4);

      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const dist = arcLength * t;
        const jag = (Math.random() - 0.5) * 12;

        const x = impactX + Math.cos(arcAngle) * dist + jag;
        const y = impactY + Math.sin(arcAngle) * dist + jag;
        points.push({ x, y });
      }

      this.crackleArcs.push({
        points: points,
        life: 0.2,
        maxLife: 0.2,
        color: shield.glowColor
      });
    }
  }

  /**
   * ULTRA-NEW: Render heavily pixelated energy grid overlay
   */
  renderPixelatedEnergyGrid(ctx, radius, shield, strengthRatio, baseAlpha) {
    // Validate inputs
    if (!isFinite(radius) || radius <= 0 || !isFinite(strengthRatio) || !isFinite(baseAlpha)) {
      return;
    }

    const pixelSize = 3; // Heavy pixelation
    const gridSpacing = 15;
    const color = this.parseColor(shield.color);

    // Validate color
    if (!color || !isFinite(color.r) || !isFinite(color.g) || !isFinite(color.b)) {
      return;
    }

    ctx.globalAlpha = baseAlpha * 0.4 * strengthRatio;
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;
    ctx.lineWidth = 1;

    // Draw concentric pixelated circles
    for (let r = gridSpacing; r < radius; r += gridSpacing) {
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        // Pixelate position
        const px = Math.floor(x / pixelSize) * pixelSize;
        const py = Math.floor(y / pixelSize) * pixelSize;

        if (angle === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    // Draw radial pixelated lines
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
      ctx.beginPath();
      for (let r = 0; r < radius; r += pixelSize * 2) {
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        const px = Math.floor(x / pixelSize) * pixelSize;
        const py = Math.floor(y / pixelSize) * pixelSize;

        if (r === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  /**
   * ULTRA-NEW: Render impact explosion effect
   */
  renderEnergyImpactExplosion(ctx, radius, shield, impactAngle) {
    // Validate inputs
    if (!isFinite(radius) || radius <= 0 || !isFinite(impactAngle)) {
      return;
    }

    const timeSinceHit = shield.timeSinceHit;
    const explosionProgress = timeSinceHit / 0.3;

    const impactX = Math.cos(impactAngle) * radius;
    const impactY = Math.sin(impactAngle) * radius;

    // Validate impact coordinates
    if (!isFinite(impactX) || !isFinite(impactY)) {
      return;
    }

    const color = this.parseColor(shield.glowColor);

    // Validate color
    if (!color || !isFinite(color.r) || !isFinite(color.g) || !isFinite(color.b)) {
      return;
    }

    const pixelSize = 2;

    // Expanding energy burst with pixelated particles
    const burstParticles = 20;
    for (let i = 0; i < burstParticles; i++) {
      const particleAngle = (i / burstParticles) * Math.PI * 2;
      const dist = explosionProgress * 50;
      const x = impactX + Math.cos(particleAngle) * dist;
      const y = impactY + Math.sin(particleAngle) * dist;

      // Pixelate
      const px = Math.floor(x / pixelSize) * pixelSize;
      const py = Math.floor(y / pixelSize) * pixelSize;

      // Validate coordinates
      if (!isFinite(px) || !isFinite(py)) continue;

      const alpha = (1 - explosionProgress) * 0.9;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      ctx.shadowColor = shield.glowColor;
      ctx.shadowBlur = 8;
      ctx.fillRect(px, py, 3, 3);
      ctx.shadowBlur = 0;
    }

    // Central bright flash
    const flashSize = Math.floor((1 - explosionProgress) * 12);

    // Validate flash size and position
    if (isFinite(flashSize) && flashSize > 0) {
      const flashX = impactX - flashSize / 2;
      const flashY = impactY - flashSize / 2;

      if (isFinite(flashX) && isFinite(flashY)) {
        ctx.globalAlpha = (1 - explosionProgress) * 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = shield.glowColor;
        ctx.shadowBlur = 15;
        ctx.fillRect(flashX, flashY, flashSize, flashSize);
        ctx.shadowBlur = 0;
      }
    }

    ctx.globalAlpha = 1;
  }

  /**
   * ULTRA-NEW: Render pulsing outer glow
   */
  renderPulsingOuterGlow(ctx, radius, shield, strengthRatio, baseAlpha) {
    const pulseIntensity = Math.sin(this.time * 2) * 0.3 + 0.7;
    const glowAlpha = baseAlpha * 0.5 * pulseIntensity * strengthRatio;

    const color = this.parseColor(shield.glowColor);

    // Multiple glow layers for depth
    for (let i = 0; i < 3; i++) {
      const glowRadius = radius + 3 + i * 4;
      const layerAlpha = glowAlpha / (i + 1);

      ctx.globalAlpha = layerAlpha;
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${layerAlpha})`;
      ctx.lineWidth = 3 - i;
      ctx.shadowBlur = 12 + i * 4;
      ctx.shadowColor = shield.glowColor;

      ctx.beginPath();
      ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  /**
   * Parse hex color to RGB with validation
   */
  parseColor(hexColor) {
    // Validate input
    if (!hexColor || typeof hexColor !== 'string') {
      return { r: 0, g: 255, b: 255 }; // Default cyan
    }

    const hex = hexColor.replace('#', '');

    // Validate hex string length
    if (hex.length !== 6) {
      return { r: 0, g: 255, b: 255 }; // Default cyan
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Validate parsed values
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return { r: 0, g: 255, b: 255 }; // Default cyan
    }

    return { r, g, b };
  }

  /**
   * Get active shield
   */
  getActiveShield() {
    return this.shields[this.activeShieldIndex];
  }

  /**
   * Get all shields
   */
  getAllShields() {
    return this.shields;
  }

  /**
   * Get total shield percentage
   */
  getShieldPercentage() {
    if (this.maxTotalShieldStrength === 0) return 0;
    return this.totalShieldStrength / this.maxTotalShieldStrength;
  }

  /**
   * Activate shield overload (temporary boost)
   */
  activateOverload() {
    if (this.overloadCooldown > 0) return false;

    this.overloadActive = true;
    this.overloadTimer = this.overloadDuration;
    this.overloadCooldown = this.overloadCooldownTime;

    // Temporarily boost all shields
    for (const shield of this.shields) {
      shield.strength = Math.min(
        shield.maxStrength * this.overloadMultiplier,
        shield.strength * this.overloadMultiplier
      );
    }

    this.updateTotalStrength();
    return true;
  }

  /**
   * Emergency shield boost (instant recharge)
   */
  activateEmergencyBoost() {
    if (!this.emergencyBoostAvailable || this.emergencyBoostCooldown > 0) {
      return false;
    }

    // Instantly recharge all shields to 50%
    for (const shield of this.shields) {
      shield.strength = Math.min(
        shield.maxStrength,
        shield.strength + shield.maxStrength * 0.5
      );
      shield.timeSinceHit = 0;
    }

    this.emergencyBoostAvailable = false;
    this.emergencyBoostCooldown = this.emergencyBoostCooldownTime;
    this.updateTotalStrength();

    return true;
  }

  /**
   * Set shield modulation mode
   */
  setModulation(mode) {
    if (this.modulationBonuses[mode]) {
      this.modulationMode = mode;
      return true;
    }
    return false;
  }

  /**
   * Calculate shield harmonics (synergy bonus)
   */
  calculateHarmonics() {
    // Unique shield types provide synergy bonus
    const uniqueTypes = new Set(this.shields.map(s => s.type));
    this.harmonicBonus = Math.min(0.2, (uniqueTypes.size - 1) * 0.05);
  }

  /**
   * Initialize sectional shields
   */
  enableSectionalShields() {
    this.useSectionalShields = true;

    // Distribute shield strength across sections
    const totalStrength = this.totalShieldStrength;
    const totalMax = this.maxTotalShieldStrength;

    this.sectionalShields.front.strength = totalStrength * 0.35;
    this.sectionalShields.front.maxStrength = totalMax * 0.35;

    this.sectionalShields.rear.strength = totalStrength * 0.15;
    this.sectionalShields.rear.maxStrength = totalMax * 0.15;

    this.sectionalShields.left.strength = totalStrength * 0.25;
    this.sectionalShields.left.maxStrength = totalMax * 0.25;

    this.sectionalShields.right.strength = totalStrength * 0.25;
    this.sectionalShields.right.maxStrength = totalMax * 0.25;
  }

  /**
   * Take damage to specific shield section
   */
  takeSectionalDamage(damage, damageType, hitAngle, shipAngle) {
    if (!this.useSectionalShields) {
      return this.takeDamage(damage, damageType);
    }

    // Determine which section was hit based on angle
    const relativeAngle = ((hitAngle - shipAngle + Math.PI * 2) % (Math.PI * 2));
    let section;

    if (relativeAngle < Math.PI / 4 || relativeAngle >= Math.PI * 7 / 4) {
      section = this.sectionalShields.front;
    } else if (relativeAngle >= Math.PI * 3 / 4 && relativeAngle < Math.PI * 5 / 4) {
      section = this.sectionalShields.rear;
    } else if (relativeAngle >= Math.PI / 4 && relativeAngle < Math.PI * 3 / 4) {
      section = this.sectionalShields.left;
    } else {
      section = this.sectionalShields.right;
    }

    // Apply section multiplier and modulation
    const modBonus = this.modulationBonuses[this.modulationMode];
    let resistance = 1.0;

    if (damageType.includes('kinetic')) resistance = modBonus.kinetic;
    else if (damageType.includes('energy') || damageType.includes('laser')) resistance = modBonus.energy;
    else if (damageType.includes('missile') || damageType.includes('explosive')) resistance = modBonus.explosive;

    // Apply overload bonus
    const overloadBonus = this.overloadActive ? 0.5 : 0;
    const effectiveDamage = damage * resistance * (1 - overloadBonus - this.harmonicBonus);

    // Damage section
    const absorbed = Math.min(section.strength, effectiveDamage * section.multiplier);
    section.strength -= absorbed;

    return Math.max(0, effectiveDamage - absorbed / section.multiplier);
  }

  /**
   * Enhanced update with new mechanics
   */
  updateEnhanced(dt) {
    // Standard shield update
    this.update(dt);

    // Update overload timer
    if (this.overloadActive) {
      this.overloadTimer -= dt;
      if (this.overloadTimer <= 0) {
        this.overloadActive = false;
      }
    }

    // Update overload cooldown
    if (this.overloadCooldown > 0) {
      this.overloadCooldown = Math.max(0, this.overloadCooldown - dt);
    }

    // Update emergency boost cooldown
    if (this.emergencyBoostCooldown > 0) {
      this.emergencyBoostCooldown = Math.max(0, this.emergencyBoostCooldown - dt);
      if (this.emergencyBoostCooldown === 0) {
        this.emergencyBoostAvailable = true;
      }
    }

    // Recharge sectional shields
    if (this.useSectionalShields) {
      for (const section of Object.values(this.sectionalShields)) {
        if (section.strength < section.maxStrength) {
          section.strength = Math.min(
            section.maxStrength,
            section.strength + 5 * dt
          );
        }
      }
    }

    // Recalculate harmonics
    this.calculateHarmonics();
  }

  /**
   * Get enhanced shield status for UI
   */
  getEnhancedStatus() {
    return {
      overloadReady: this.overloadCooldown === 0,
      overloadActive: this.overloadActive,
      overloadCooldown: this.overloadCooldown,
      emergencyBoostReady: this.emergencyBoostAvailable,
      emergencyBoostCooldown: this.emergencyBoostCooldown,
      modulationMode: this.modulationMode,
      harmonicBonus: Math.floor(this.harmonicBonus * 100),
      sectionalEnabled: this.useSectionalShields,
      sections: this.useSectionalShields ? {
        front: Math.floor(this.sectionalShields.front.strength),
        rear: Math.floor(this.sectionalShields.rear.strength),
        left: Math.floor(this.sectionalShields.left.strength),
        right: Math.floor(this.sectionalShields.right.strength)
      } : null
    };
  }

  /**
   * Repair shields (at station)
   */
  repair(amount = Infinity) {
    for (const shield of this.shields) {
      const repairNeeded = shield.maxStrength - shield.strength;
      const repairAmount = Math.min(repairNeeded, amount);
      shield.strength += repairAmount;
      amount -= repairAmount;

      if (amount <= 0) break;
    }
    this.updateTotalStrength();
  }
}
