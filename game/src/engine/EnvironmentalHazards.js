/**
 * Environmental Hazards System
 * Adds dynamic environmental effects to star systems:
 * - Nebulae (visual effects, reduced visibility, sensor interference)
 * - Radiation zones (damage over time, shield drain)
 * - Ion storms (energy drain, weapon interference)
 * - Asteroid field density zones (collision hazard)
 * - Gravity wells (pull effect, fuel consumption)
 */

export class EnvironmentalHazards {
  constructor() {
    this.hazards = [];
    this.activeEffects = [];
  }

  /**
   * Generate environmental hazards for a star system
   */
  generateSystemHazards(systemData, starX, starY, systemRadius) {
    this.hazards = [];
    const baseSeed = systemData.seed || 0;
    // Use a stateful RNG that advances each call
    let rngState = baseSeed;
    const rng = {
      next: () => {
        rngState = (rngState * 9301 + 49297) % 233280;
        return rngState / 233280;
      },
      range: (min, max) => {
        rngState = (rngState * 9301 + 49297) % 233280;
        return min + (rngState / 233280) * (max - min);
      }
    };

    // 30% chance for nebula
    if (rng.next() < 0.3) {
      const nebulaCount = Math.floor(rng.range(1, 3));
      for (let i = 0; i < nebulaCount; i++) {
        this.hazards.push(this.generateNebula(starX, starY, systemRadius, baseSeed + i));
      }
    }

    // 20% chance for radiation zones (more common in high-danger systems)
    if (systemData.dangerLevel > 5 && rng.next() < 0.4) {
      const zoneCount = Math.floor(rng.range(1, 2));
      for (let i = 0; i < zoneCount; i++) {
        this.hazards.push(this.generateRadiationZone(starX, starY, systemRadius, baseSeed + i + 100));
      }
    }

    // 15% chance for ion storms
    if (rng.next() < 0.15) {
      this.hazards.push(this.generateIonStorm(starX, starY, systemRadius, baseSeed + 200));
    }

    // Always add gravity wells near massive bodies
    if (systemData.hasBlackhole) {
      this.hazards.push(this.generateGravityWell(starX, starY, systemRadius, baseSeed + 300));
    }
  }

  /**
   * Generate a nebula hazard
   */
  generateNebula(starX, starY, systemRadius, seed) {
    const angle = (seed % 360) * (Math.PI / 180);
    const distance = 1500 + (seed % 1000);

    return {
      type: 'nebula',
      x: starX + Math.cos(angle) * distance,
      y: starY + Math.sin(angle) * distance,
      radius: 800 + (seed % 400),
      density: 0.3 + (seed % 100) / 200,
      color: this.getNebulaColor(seed),
      particleCount: 40 + (seed % 20),
      driftSpeed: 0.1 + (seed % 10) / 50,
      driftAngle: (seed % 360) * (Math.PI / 180),
      effects: {
        visibilityReduction: 0.4,
        sensorInterference: 0.6,
        visualOnly: true // Nebula doesn't damage, just visual
      }
    };
  }

  /**
   * Generate a radiation zone hazard
   */
  generateRadiationZone(starX, starY, systemRadius, seed) {
    const angle = (seed % 360) * (Math.PI / 180);
    const distance = 1000 + (seed % 1500);

    return {
      type: 'radiation',
      x: starX + Math.cos(angle) * distance,
      y: starY + Math.sin(angle) * distance,
      radius: 600 + (seed % 300),
      intensity: 0.5 + (seed % 50) / 100,
      color: '#88ff44',
      glowColor: '#44ff22',
      pulsePhase: 0,
      pulseSpeed: 0.002 + (seed % 10) / 5000,
      effects: {
        hullDamage: 2, // Damage per second
        shieldDrain: 5, // Shield drain per second
        warningDistance: 1000 // Distance at which warning appears
      }
    };
  }

  /**
   * Generate an ion storm hazard
   */
  generateIonStorm(starX, starY, systemRadius, seed) {
    const angle = (seed % 360) * (Math.PI / 180);
    const distance = 1200 + (seed % 1000);

    return {
      type: 'ion_storm',
      x: starX + Math.cos(angle) * distance,
      y: starY + Math.sin(angle) * distance,
      radius: 700 + (seed % 300),
      intensity: 0.6 + (seed % 40) / 100,
      color: '#4488ff',
      lightningFrequency: 0.05 + (seed % 20) / 400,
      rotation: 0,
      rotationSpeed: 0.001 + (seed % 10) / 10000,
      effects: {
        energyDrain: 8, // Energy drain per second
        weaponInterference: 0.7, // 70% chance weapon shot fails
        systemDisruption: true
      }
    };
  }

  /**
   * Generate a gravity well hazard
   */
  generateGravityWell(starX, starY, systemRadius, seed) {
    return {
      type: 'gravity_well',
      x: starX,
      y: starY,
      radius: 1500,
      strength: 0.8,
      color: '#8844ff',
      visualRadius: 200,
      effects: {
        pullForce: 120, // Pull strength
        fuelConsumption: 1.5, // 1.5x fuel consumption when escaping
        escapeThrust: 0.7 // Need 70% more thrust to escape
      }
    };
  }

  /**
   * Get nebula color based on seed
   */
  getNebulaColor(seed) {
    const colors = [
      '#ff6644', // Red nebula
      '#4466ff', // Blue nebula
      '#ff44ff', // Magenta nebula
      '#44ff88', // Green nebula
      '#ffaa44', // Orange nebula
      '#8844ff', // Purple nebula
    ];
    return colors[seed % colors.length];
  }

  /**
   * Update hazards (movement, effects, etc.)
   */
  update(dt) {
    for (const hazard of this.hazards) {
      // Update nebula drift
      if (hazard.type === 'nebula') {
        hazard.x += Math.cos(hazard.driftAngle) * hazard.driftSpeed * dt;
        hazard.y += Math.sin(hazard.driftAngle) * hazard.driftSpeed * dt;
      }

      // Update radiation pulse
      if (hazard.type === 'radiation') {
        hazard.pulsePhase += hazard.pulseSpeed * dt;
      }

      // Update ion storm rotation
      if (hazard.type === 'ion_storm') {
        hazard.rotation += hazard.rotationSpeed * dt;
      }
    }
  }

  /**
   * Check if player is affected by any hazards
   */
  checkPlayerEffects(playerX, playerY) {
    this.activeEffects = [];

    for (const hazard of this.hazards) {
      const dx = playerX - hazard.x;
      const dy = playerY - hazard.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < hazard.radius) {
        const effectStrength = 1 - (distance / hazard.radius);
        this.activeEffects.push({
          type: hazard.type,
          strength: effectStrength,
          effects: hazard.effects
        });
      }
    }

    return this.activeEffects;
  }

  /**
   * Render environmental hazards
   */
  render(ctx, camera, time) {
    for (const hazard of this.hazards) {
      const screenX = hazard.x - camera.x;
      const screenY = hazard.y - camera.y;

      switch (hazard.type) {
        case 'nebula':
          this.renderNebula(ctx, screenX, screenY, hazard, time);
          break;
        case 'radiation':
          this.renderRadiationZone(ctx, screenX, screenY, hazard, time);
          break;
        case 'ion_storm':
          this.renderIonStorm(ctx, screenX, screenY, hazard, time);
          break;
        case 'gravity_well':
          this.renderGravityWell(ctx, screenX, screenY, hazard, time);
          break;
      }
    }
  }

  /**
   * Render nebula with heavily pixelated cloud effect
   */
  renderNebula(ctx, x, y, nebula, time) {
    ctx.save();
    ctx.globalAlpha = nebula.density * 0.6;

    // Multiple layers of pixelated clouds
    for (let layer = 0; layer < 3; layer++) {
      const layerRadius = nebula.radius * (0.6 + layer * 0.2);
      const layerAlpha = (3 - layer) / 3;

      ctx.globalAlpha = nebula.density * 0.3 * layerAlpha;

      // Create pixelated cloud pattern
      const pixelSize = 12 + layer * 4;
      for (let i = 0; i < nebula.particleCount; i++) {
        const angle = (i / nebula.particleCount) * Math.PI * 2 + time * 0.0001 * (layer + 1);
        const dist = Math.sin(i * 0.5 + time * 0.0002) * layerRadius * 0.5 + layerRadius * 0.5;
        const px = x + Math.cos(angle) * dist;
        const py = y + Math.sin(angle) * dist;

        ctx.fillStyle = nebula.color;
        ctx.fillRect(
          Math.floor(px / pixelSize) * pixelSize,
          Math.floor(py / pixelSize) * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }

    // Nebula core glow
    ctx.globalAlpha = nebula.density * 0.2;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, nebula.radius);
    gradient.addColorStop(0, nebula.color + '88');
    gradient.addColorStop(0.5, nebula.color + '44');
    gradient.addColorStop(1, nebula.color + '00');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - nebula.radius, y - nebula.radius, nebula.radius * 2, nebula.radius * 2);

    ctx.restore();
  }

  /**
   * Render radiation zone with pulsing green glow
   */
  renderRadiationZone(ctx, x, y, radiation, time) {
    const pulse = Math.sin(radiation.pulsePhase) * 0.3 + 0.7;

    ctx.save();

    // Outer danger ring (heavily pixelated)
    ctx.strokeStyle = radiation.glowColor + '88';
    ctx.lineWidth = 8;
    ctx.shadowColor = radiation.glowColor;
    ctx.shadowBlur = 20 * pulse;

    ctx.beginPath();
    ctx.arc(x, y, radiation.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner radiation field (pixelated grid)
    const gridSize = 30;
    const gridCount = Math.floor((radiation.radius * 2) / gridSize);

    ctx.globalAlpha = 0.2 * pulse;
    ctx.fillStyle = radiation.color;

    for (let gx = -gridCount / 2; gx < gridCount / 2; gx++) {
      for (let gy = -gridCount / 2; gy < gridCount / 2; gy++) {
        const px = x + gx * gridSize;
        const py = y + gy * gridSize;
        const distFromCenter = Math.sqrt((px - x) ** 2 + (py - y) ** 2);

        if (distFromCenter < radiation.radius) {
          const intensity = 1 - (distFromCenter / radiation.radius);
          if (Math.random() < intensity * 0.3) {
            ctx.fillRect(px - gridSize / 4, py - gridSize / 4, gridSize / 2, gridSize / 2);
          }
        }
      }
    }

    // Radiation symbol at center
    ctx.globalAlpha = pulse * 0.8;
    ctx.fillStyle = radiation.glowColor;
    ctx.font = '40px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☢', x, y);

    ctx.restore();
  }

  /**
   * Render ion storm with electric arcs
   */
  renderIonStorm(ctx, x, y, storm, time) {
    ctx.save();

    // Swirling storm cloud (heavily pixelated)
    ctx.globalAlpha = 0.4;
    const spiralCount = 6;

    for (let i = 0; i < spiralCount; i++) {
      const angle = (i / spiralCount) * Math.PI * 2 + storm.rotation;
      const spiralLength = storm.radius;

      ctx.strokeStyle = storm.color;
      ctx.lineWidth = 6;
      ctx.beginPath();

      for (let r = 0; r < spiralLength; r += 20) {
        const a = angle + (r / spiralLength) * Math.PI * 4;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;

        if (r === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    // Electric lightning bolts (heavily pixelated)
    if (Math.random() < storm.lightningFrequency) {
      const boltCount = Math.floor(Math.random() * 5) + 3;

      for (let i = 0; i < boltCount; i++) {
        const startAngle = Math.random() * Math.PI * 2;
        const startDist = Math.random() * storm.radius * 0.3;
        const endAngle = Math.random() * Math.PI * 2;
        const endDist = storm.radius * (0.7 + Math.random() * 0.3);

        const x1 = x + Math.cos(startAngle) * startDist;
        const y1 = y + Math.sin(startAngle) * startDist;
        const x2 = x + Math.cos(endAngle) * endDist;
        const y2 = y + Math.sin(endAngle) * endDist;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = storm.color;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.9;

        ctx.beginPath();
        ctx.moveTo(x1, y1);

        // Jagged lightning path
        const segments = 8;
        for (let s = 1; s <= segments; s++) {
          const t = s / segments;
          const mx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 40;
          const my = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 40;
          ctx.lineTo(mx, my);
        }
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // Storm core
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = storm.color;
    ctx.shadowColor = storm.color;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Render gravity well with distortion effect
   */
  renderGravityWell(ctx, x, y, well, time) {
    ctx.save();

    // Concentric rings showing gravity field (heavily pixelated)
    const ringCount = 5;
    for (let i = 0; i < ringCount; i++) {
      const ringRadius = well.visualRadius + (i * 80);
      const alpha = (ringCount - i) / ringCount * 0.3;
      const pulse = Math.sin(time * 0.002 + i * 0.5) * 0.2 + 0.8;

      ctx.globalAlpha = alpha * pulse;
      ctx.strokeStyle = well.color;
      ctx.lineWidth = 4;
      ctx.shadowColor = well.color;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Central gravitational distortion (pixelated spiral)
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = well.color;
    ctx.lineWidth = 6;

    const spiralSegments = 60;
    ctx.beginPath();
    for (let i = 0; i < spiralSegments; i++) {
      const t = i / spiralSegments;
      const angle = t * Math.PI * 8 + time * 0.001;
      const radius = t * well.visualRadius;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    ctx.restore();
  }
}
