/**
 * Black Hole Warp Effect System v4
 *
 * Features:
 * - Enhanced space curvature texture effect
 * - Smaller, asymmetric accretion disk
 * - Intense particle flow into sphere
 * - 5-second warp deactivation effect with particle dispersion
 * - Tidally locked with ZERO lag (relative coordinates)
 */

export class BlackHoleWarpEffect {
  constructor() {
    // Animation state
    this.active = false;
    this.phase = 'inactive'; // inactive, charging, growing, warp_speed, deactivating

    // Timing
    this.elapsedTime = 0;
    this.chargeTime = 0;
    this.growthTime = 0;
    this.deactivationTime = 0;

    // Black sphere properties
    this.sphereRadius = 0;
    this.maxSphereRadius = 50;
    this.sphereGrowthRate = 20;
    this.sphereOpacity = 1.0; // For dissolve effect

    // Accretion disk properties - SMALLER and ASYMMETRIC
    this.diskInnerRadius = 0;
    this.diskOuterRadius = 0;
    this.maxDiskOuterRadius = 110; // Reduced from 160 to 110
    this.diskRotation = 0;
    this.diskSpinSpeed = 1.8;
    this.diskTurbulenceTime = 0;
    this.diskAsymmetryX = 1.0; // Asymmetry factors
    this.diskAsymmetryY = 1.0;
    this.diskEccentricity = 0.0; // Oval shape

    // Space curvature
    this.curvatureIntensity = 0;
    this.maxCurvatureIntensity = 1.0;

    // Particles - RELATIVE COORDINATES
    this.suckingParticles = [];
    this.accretionDiskParticles = [];
    this.warpCirclingParticles = [];
    this.maxSuckingParticles = 250; // Increased from 150 for more intense
    this.maxAccretionParticles = 500;
    this.maxWarpCirclingParticles = 100;

    // Particle spawn timers
    this.suckingParticleSpawnTimer = 0;
    this.accretionParticleSpawnTimer = 0;
    this.warpCirclingSpawnTimer = 0;
  }

  /**
   * Start the warp effect
   */
  start(x, y) {
    this.active = true;
    this.phase = 'charging';
    this.elapsedTime = 0;
    this.chargeTime = 0;
    this.growthTime = 0;
    this.deactivationTime = 0;
    this.sphereRadius = 0;
    this.diskInnerRadius = 0;
    this.diskOuterRadius = 0;
    this.curvatureIntensity = 0;
    this.diskRotation = 0;
    this.diskTurbulenceTime = 0;
    this.sphereOpacity = 1.0;

    // Generate asymmetry
    this.diskAsymmetryX = 0.85 + Math.random() * 0.3; // 0.85-1.15
    this.diskAsymmetryY = 0.85 + Math.random() * 0.3;
    this.diskEccentricity = Math.random() * 0.15; // 0-0.15 oval shape

    // Clear particles
    this.suckingParticles = [];
    this.accretionDiskParticles = [];
    this.warpCirclingParticles = [];

    // Reset timers
    this.suckingParticleSpawnTimer = 0;
    this.accretionParticleSpawnTimer = 0;
    this.warpCirclingSpawnTimer = 0;
  }

  /**
   * Stop the warp effect - initiates 5-second deactivation sequence
   */
  stop() {
    if (this.phase === 'deactivating') return; // Already deactivating

    this.phase = 'deactivating';
    this.deactivationTime = 0;
  }

  /**
   * Force immediate stop (for cleanup)
   */
  forceStop() {
    this.active = false;
    this.phase = 'inactive';
    this.suckingParticles = [];
    this.accretionDiskParticles = [];
    this.warpCirclingParticles = [];
  }

  /**
   * Update the warp effect
   */
  update(dt, centerX, centerY) {
    if (!this.active) return;

    // Store center position for reference (not used in update logic since particles are relative)
    this.centerX = centerX;
    this.centerY = centerY;

    this.elapsedTime += dt;
    this.diskTurbulenceTime += dt;
    this.diskRotation += this.diskSpinSpeed * dt;

    // Update spawn timers
    this.suckingParticleSpawnTimer += dt;
    this.accretionParticleSpawnTimer += dt;
    this.warpCirclingSpawnTimer += dt;

    // Phase-based updates
    switch (this.phase) {
      case 'charging':
        this.updateCharging(dt);
        break;
      case 'growing':
        this.updateGrowing(dt);
        break;
      case 'warp_speed':
        this.updateWarpSpeed(dt);
        break;
      case 'deactivating':
        this.updateDeactivating(dt);
        break;
    }

    // Update particles
    this.updateParticles(dt);
  }

  updateCharging(dt) {
    this.chargeTime += dt;

    // Create intense sucking particles
    if (this.suckingParticleSpawnTimer >= 0.04) { // Very fast
      this.createSuckingParticles(5); // More particles
      this.suckingParticleSpawnTimer = 0;
    }

    this.curvatureIntensity = Math.min(this.curvatureIntensity + dt * 0.4, this.maxCurvatureIntensity * 0.5);

    if (this.chargeTime >= 1.0) {
      this.phase = 'growing';
      this.growthTime = 0;
    }
  }

  updateGrowing(dt) {
    this.growthTime += dt;

    // Grow black sphere
    this.sphereRadius = Math.min(this.sphereRadius + this.sphereGrowthRate * dt, this.maxSphereRadius);

    // Grow accretion disk
    if (this.growthTime >= 0.5) {
      this.diskInnerRadius = this.sphereRadius * 1.2;
      const diskGrowthRate = 50;
      this.diskOuterRadius = Math.min(this.diskOuterRadius + diskGrowthRate * dt, this.maxDiskOuterRadius);
    }

    this.curvatureIntensity = Math.min(this.curvatureIntensity + dt * 0.5, this.maxCurvatureIntensity);

    // Intense sucking particles
    if (this.suckingParticleSpawnTimer >= 0.04) {
      this.createSuckingParticles(6); // Very intense
      this.suckingParticleSpawnTimer = 0;
    }

    // Accretion disk particles
    if (this.diskOuterRadius > 10 && this.accretionParticleSpawnTimer >= 0.015) {
      this.createAccretionDiskParticles(8);
      this.accretionParticleSpawnTimer = 0;
    }

    if (this.sphereRadius >= this.maxSphereRadius) {
      this.phase = 'warp_speed';
    }
  }

  updateWarpSpeed(dt) {
    // Intense sucking particles
    if (this.suckingParticleSpawnTimer >= 0.05) {
      this.createSuckingParticles(5);
      this.suckingParticleSpawnTimer = 0;
    }

    // Maintain accretion
    if (this.accretionParticleSpawnTimer >= 0.02) {
      this.createAccretionDiskParticles(6);
      this.accretionParticleSpawnTimer = 0;
    }

    // Warp circling
    if (this.warpCirclingSpawnTimer >= 0.04) {
      this.createWarpCirclingParticles(4);
      this.warpCirclingSpawnTimer = 0;
    }
  }

  /**
   * Deactivation phase - 3 second sequence (COMPACT & FAST)
   * 0-1s: Black sphere dissolves, curvature fades
   * 1-3s: Particles disperse slightly, fade quickly, stay localized
   */
  updateDeactivating(dt) {
    this.deactivationTime += dt;

    // Phase 1 (0-1s): Dissolve sphere and curvature
    if (this.deactivationTime < 1.0) {
      this.sphereOpacity = 1.0 - this.deactivationTime;
      this.curvatureIntensity = this.maxCurvatureIntensity * (1.0 - this.deactivationTime);

      // Shrink disk slightly
      this.diskInnerRadius *= (1.0 - dt * 0.3);
      this.diskOuterRadius *= (1.0 - dt * 0.2);
    } else {
      // Sphere and curvature gone
      this.sphereOpacity = 0;
      this.curvatureIntensity = 0;
      this.sphereRadius = 0;
    }

    // Phase 2 (1-3s): Disperse particles - VERY COMPACT, FAST FADE
    if (this.deactivationTime >= 1.0) {
      const disperseProgress = (this.deactivationTime - 1.0) / 2.0; // 0-1 over 2 seconds (faster!)

      // Convert all particles to dispersing state
      for (const p of this.suckingParticles) {
        if (!p.dispersing) {
          p.dispersing = true;
          // Set outward velocity - EXTREMELY SLOW to stay very compact
          const angle = Math.atan2(p.relY, p.relX);
          const disperseSpeed = 8 + Math.random() * 10; // 8-18 (extremely slow)
          p.relVx = Math.cos(angle) * disperseSpeed;
          p.relVy = Math.sin(angle) * disperseSpeed;
          p.disperseIntensity = p.intensity;
        }
        // Fade out EXTREMELY FAST - cubic falloff
        p.intensity = p.disperseIntensity * Math.pow(1.0 - disperseProgress, 3.0);
        // SHRINK particles instead of stretch
        p.size = p.size * (1.0 - disperseProgress * 0.3);
      }

      for (const p of this.accretionDiskParticles) {
        if (!p.dispersing) {
          p.dispersing = true;
          const angle = p.angle;
          const disperseSpeed = 6 + Math.random() * 9; // 6-15 (extremely slow)
          p.disperseVx = Math.cos(angle) * disperseSpeed;
          p.disperseVy = Math.sin(angle) * disperseSpeed;
          p.disperseIntensity = p.intensity;
        }
        p.intensity = p.disperseIntensity * Math.pow(1.0 - disperseProgress, 3.0);
        p.size = p.size * (1.0 - disperseProgress * 0.3);
      }

      for (const p of this.warpCirclingParticles) {
        if (!p.dispersing) {
          p.dispersing = true;
          const angle = p.angle;
          const disperseSpeed = 7 + Math.random() * 11; // 7-18 (extremely slow)
          p.disperseVx = Math.cos(angle) * disperseSpeed;
          p.disperseVy = Math.sin(angle) * disperseSpeed;
          p.disperseIntensity = p.intensity;
        }
        p.intensity = p.disperseIntensity * Math.pow(1.0 - disperseProgress, 3.0);
        p.size = p.size * (1.0 - disperseProgress * 0.3);
      }
    }

    // After 3 seconds, completely stop (faster)
    if (this.deactivationTime >= 3.0) {
      this.forceStop();
    }
  }

  /**
   * Create intense sucking particles
   */
  createSuckingParticles(count) {
    for (let i = 0; i < count; i++) {
      if (this.suckingParticles.length >= this.maxSuckingParticles) {
        this.suckingParticles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const distance = this.sphereRadius + 30 + Math.random() * 100; // Further out

      const particle = {
        relX: Math.cos(angle) * distance,
        relY: Math.sin(angle) * distance,
        relVx: 0,
        relVy: 0,
        life: 2.0 + Math.random() * 1.5,
        maxLife: 2.0 + Math.random() * 1.5,
        size: 1 + Math.random() * 2.5, // Slightly larger
        intensity: 0.2 + Math.random() * 0.5, // More intense (was 0.1-0.5)
        baseIntensity: 0.2 + Math.random() * 0.5,
        color: Math.random() > 0.5 ? '#dddddd' : '#aaaaaa', // Brighter colors
        type: 'sucking',
        dispersing: false
      };

      this.suckingParticles.push(particle);
    }
  }

  /**
   * Create accretion disk particles (asymmetric)
   */
  createAccretionDiskParticles(count) {
    for (let i = 0; i < count; i++) {
      if (this.accretionDiskParticles.length >= this.maxAccretionParticles) {
        this.accretionDiskParticles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const distance = this.diskInnerRadius + Math.random() * (this.diskOuterRadius - this.diskInnerRadius);

      const normalizedDist = (distance - this.diskInnerRadius) / (this.diskOuterRadius - this.diskInnerRadius);
      const color = this.getAccretionColor(normalizedDist);

      const particle = {
        angle: angle,
        distance: distance,
        orbitalSpeed: (0.9 + Math.random() * 1.4) / Math.sqrt(distance / this.diskInnerRadius),
        spiralSpeed: -3.5 - Math.random() * 5.0,
        turbulencePhase: Math.random() * Math.PI * 2,
        turbulenceAmplitude: 2 + Math.random() * 5,
        life: 2.0 + Math.random() * 2.5,
        maxLife: 2.0 + Math.random() * 2.5,
        size: 1 + Math.random() * 2.5,
        color: color,
        intensity: 0.4 + Math.random() * 0.6,
        type: 'accretion',
        dispersing: false
      };

      this.accretionDiskParticles.push(particle);
    }
  }

  createWarpCirclingParticles(count) {
    for (let i = 0; i < count; i++) {
      if (this.warpCirclingParticles.length >= this.maxWarpCirclingParticles) {
        this.warpCirclingParticles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const distance = this.diskOuterRadius * 0.7 + Math.random() * this.diskOuterRadius * 0.5;

      const colors = ['#331111', '#442222', '#3a3a3a', '#4a4444', '#553333', '#221111', '#332222'];

      const particle = {
        angle: angle,
        distance: distance,
        orbitalSpeed: 1.2 + Math.random() * 1.0,
        life: 1.5 + Math.random() * 1.2,
        maxLife: 1.5 + Math.random() * 1.2,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        intensity: 0.3 + Math.random() * 0.5,
        type: 'warp_circling',
        dispersing: false
      };

      this.warpCirclingParticles.push(particle);
    }
  }

  /**
   * Update particles
   */
  updateParticles(dt) {
    const maxDisperseDistance = 55; // Keep dispersed particles VERY COMPACT (disk is 110px)

    // Update sucking particles
    for (let i = this.suckingParticles.length - 1; i >= 0; i--) {
      const p = this.suckingParticles[i];

      if (p.dispersing) {
        // Dispersing - move outward
        p.relX += p.relVx * dt;
        p.relY += p.relVy * dt;

        // Remove if too far OR too faint (prevents white pixel cloud)
        const distance = Math.sqrt(p.relX * p.relX + p.relY * p.relY);
        if (distance > maxDisperseDistance || p.intensity < 0.05) {
          this.suckingParticles.splice(i, 1);
          continue;
        }
      } else {
        // Normal sucking behavior
        const dx = -p.relX;
        const dy = -p.relY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5 || p.life <= 0) {
          this.suckingParticles.splice(i, 1);
          continue;
        }

        const distanceFactor = 1 - Math.min(distance / 150, 1);
        const pullStrength = 30 + distanceFactor * 250; // More intense (was 20-220)
        p.relVx = (dx / distance) * pullStrength;
        p.relVy = (dy / distance) * pullStrength;

        const orbitalSpeed = 20; // Faster orbital
        p.relVx += -dy / distance * orbitalSpeed;
        p.relVy += dx / distance * orbitalSpeed;

        p.relX += p.relVx * dt;
        p.relY += p.relVy * dt;

        p.life -= dt;
        const lifeFactor = p.life / p.maxLife;
        p.intensity = p.baseIntensity * lifeFactor * (0.6 + distanceFactor * 0.4);
      }

      // Remove if too faint or dead
      if (p.intensity <= 0.01 || p.life <= 0) {
        this.suckingParticles.splice(i, 1);
      }
    }

    // Update accretion disk particles
    for (let i = this.accretionDiskParticles.length - 1; i >= 0; i--) {
      const p = this.accretionDiskParticles[i];

      if (p.dispersing) {
        // Calculate position from angle/distance then disperse
        const baseX = Math.cos(p.angle) * p.distance;
        const baseY = Math.sin(p.angle) * p.distance;
        // Move outward
        if (!p.disperseX) {
          p.disperseX = baseX;
          p.disperseY = baseY;
        }
        p.disperseX += p.disperseVx * dt;
        p.disperseY += p.disperseVy * dt;

        // Remove if too far OR too faint (prevents white pixel cloud)
        const distance = Math.sqrt(p.disperseX * p.disperseX + p.disperseY * p.disperseY);
        if (distance > maxDisperseDistance || p.intensity < 0.05) {
          this.accretionDiskParticles.splice(i, 1);
          continue;
        }
      } else {
        // Normal orbital motion
        p.angle += p.orbitalSpeed * dt;
        p.turbulencePhase += dt * 3.5;
        p.distance += p.spiralSpeed * dt;
        p.life -= dt;

        if (p.distance < this.diskInnerRadius * 0.8 || p.life <= 0) {
          this.accretionDiskParticles.splice(i, 1);
          continue;
        }

        const normalizedDist = (p.distance - this.diskInnerRadius) / (this.diskOuterRadius - this.diskInnerRadius);
        p.color = this.getAccretionColor(normalizedDist);
        p.intensity = Math.min((p.life / p.maxLife) * 0.95, 0.95);
      }

      if (p.intensity <= 0.01) {
        this.accretionDiskParticles.splice(i, 1);
      }
    }

    // Update warp circling particles
    for (let i = this.warpCirclingParticles.length - 1; i >= 0; i--) {
      const p = this.warpCirclingParticles[i];

      if (p.dispersing) {
        const baseX = Math.cos(p.angle) * p.distance;
        const baseY = Math.sin(p.angle) * p.distance;
        if (!p.disperseX) {
          p.disperseX = baseX;
          p.disperseY = baseY;
        }
        p.disperseX += p.disperseVx * dt;
        p.disperseY += p.disperseVy * dt;

        // Remove if too far OR too faint (prevents white pixel cloud)
        const distance = Math.sqrt(p.disperseX * p.disperseX + p.disperseY * p.disperseY);
        if (distance > maxDisperseDistance || p.intensity < 0.05) {
          this.warpCirclingParticles.splice(i, 1);
          continue;
        }
      } else {
        p.angle += p.orbitalSpeed * dt;
        p.life -= dt;

        if (p.life <= 0) {
          this.warpCirclingParticles.splice(i, 1);
          continue;
        }

        p.intensity = (p.life / p.maxLife) * 0.75;
      }

      if (p.intensity <= 0.01) {
        this.warpCirclingParticles.splice(i, 1);
      }
    }
  }

  getAccretionColor(normalizedDist) {
    if (normalizedDist < 0.15) {
      return '#ffffff';
    } else if (normalizedDist < 0.35) {
      return '#ffffdd';
    } else if (normalizedDist < 0.55) {
      return '#ffdd88';
    } else if (normalizedDist < 0.75) {
      return '#ff9944';
    } else {
      return '#ff5522';
    }
  }

  /**
   * Render
   */
  render(ctx, centerX, centerY) {
    if (!this.active) return;

    ctx.save();

    // 1. Enhanced space curvature texture
    this.renderEnhancedSpaceCurvature(ctx, centerX, centerY);

    // 2. Accretion disk particles
    this.renderAccretionDiskParticles(ctx, centerX, centerY);

    // 3. Warp circling
    if (this.phase === 'warp_speed' || this.phase === 'deactivating') {
      this.renderWarpCirclingParticles(ctx, centerX, centerY);
    }

    // 4. Accretion disk structure (asymmetric)
    if (this.diskOuterRadius > 10) {
      this.renderAsymmetricAccretionDisk(ctx, centerX, centerY);
    }

    // 5. Sucking particles
    this.renderSuckingParticles(ctx, centerX, centerY);

    // 6. Black sphere (with dissolve)
    if (this.sphereRadius > 0 && this.sphereOpacity > 0.01) {
      this.renderBlackSphere(ctx, centerX, centerY);
    }

    ctx.restore();
  }

  /**
   * Enhanced space curvature - more visible texture effect
   */
  renderEnhancedSpaceCurvature(ctx, centerX, centerY) {
    if (this.curvatureIntensity <= 0) return;

    const maxRadius = this.diskOuterRadius * 1.6 || 200;
    const rings = 20; // More rings for texture

    for (let i = 0; i < rings; i++) {
      const radius = (maxRadius / rings) * (i + 1);
      const alpha = this.curvatureIntensity * 0.12 * (1 - i / rings); // More visible

      // Multiple passes for texture effect
      for (let pass = 0; pass < 2; pass++) {
        ctx.strokeStyle = `rgba(70, 70, 90, ${alpha * (pass === 0 ? 1.0 : 0.5)})`;
        ctx.lineWidth = pass === 0 ? 1.5 : 1;
        ctx.beginPath();

        const segments = 80;
        for (let j = 0; j <= segments; j++) {
          const angle = (j / segments) * Math.PI * 2;

          // Complex wave pattern
          const wave1 = Math.sin(angle * 3 + this.diskTurbulenceTime * 2) * 4;
          const wave2 = Math.sin(angle * 7 - this.diskTurbulenceTime * 3) * 3;
          const wave3 = Math.sin(angle * 11 + this.diskTurbulenceTime * 1.5) * 2;
          const wave4 = Math.sin(angle * 13 + this.diskTurbulenceTime * 2.5) * 1.5;
          const wave5 = Math.sin(angle * 17 - this.diskTurbulenceTime * 1.8) * 1; // Extra
          const wave = wave1 + wave2 + wave3 + wave4 + wave5;

          const r = radius + wave * this.curvatureIntensity + pass * 2;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }
    }
  }

  /**
   * Asymmetric accretion disk structure
   */
  renderAsymmetricAccretionDisk(ctx, centerX, centerY) {
    const pixelSize = 2;
    const spirals = 24;

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let spiral = 0; spiral < spirals; spiral++) {
      const spiralAngle = (spiral / spirals) * Math.PI * 2;

      ctx.save();
      ctx.rotate(this.diskRotation + spiralAngle);

      const stepSize = pixelSize * 1.5;
      const steps = Math.ceil((this.diskOuterRadius - this.diskInnerRadius) / stepSize);

      for (let i = 0; i < steps; i++) {
        const r = this.diskInnerRadius + i * stepSize;
        if (r >= this.diskOuterRadius) break;

        const theta = (r - this.diskInnerRadius) * 0.05;

        // Heavy turbulence
        const turbulence1 = Math.sin(this.diskRotation * 4 + r * 0.03 + spiral) * 14;
        const turbulence2 = Math.cos(this.diskTurbulenceTime * 2 + i * 0.2) * 7;
        const chaoticR = r + turbulence1 + turbulence2;

        // Apply asymmetry
        const x = chaoticR * Math.cos(theta) * this.diskAsymmetryX;
        const y = chaoticR * Math.sin(theta) * this.diskAsymmetryY * (1 + this.diskEccentricity * Math.cos(theta));

        const normalizedDist = (r - this.diskInnerRadius) / (this.diskOuterRadius - this.diskInnerRadius);
        const intensity = 0.3 + (1 - normalizedDist) * 0.6;

        const color = this.getAccretionColorRGB(normalizedDist);

        const flicker1 = Math.sin(this.diskRotation * 7 + i * 0.5 + spiral) * 0.4;
        const flicker2 = Math.sin(this.diskTurbulenceTime * 10 + i * 0.8) * 0.3;
        const flicker = 0.3 + flicker1 + flicker2;
        const alpha = Math.max(0, Math.min(1, intensity * flicker * 0.6));

        if (Math.random() > 0.65) continue;

        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.fillRect(
          Math.floor(x - pixelSize / 2),
          Math.floor(y - pixelSize / 2),
          Math.ceil(pixelSize),
          Math.ceil(pixelSize)
        );

        if (Math.random() < 0.015) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.3})`;
          ctx.fillRect(
            Math.floor(x - pixelSize),
            Math.floor(y - pixelSize),
            Math.ceil(pixelSize * 2),
            Math.ceil(pixelSize * 2)
          );
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }

  getAccretionColorRGB(normalizedDist) {
    if (normalizedDist < 0.15) {
      return { r: 255, g: 255, b: 255 };
    } else if (normalizedDist < 0.35) {
      return { r: 255, g: 255, b: 221 };
    } else if (normalizedDist < 0.55) {
      return { r: 255, g: 221, b: 136 };
    } else if (normalizedDist < 0.75) {
      return { r: 255, g: 153, b: 68 };
    } else {
      return { r: 255, g: 85, b: 34 };
    }
  }

  renderBlackSphere(ctx, centerX, centerY) {
    const pixelSize = 3;
    const radius = this.sphereRadius;

    ctx.save();
    ctx.globalAlpha = this.sphereOpacity;

    const steps = Math.ceil(radius * 2 / pixelSize);

    for (let px = -steps; px <= steps; px++) {
      for (let py = -steps; py <= steps; py++) {
        const x = px * pixelSize;
        const y = py * pixelSize;
        const distance = Math.sqrt(x * x + y * y);

        if (distance <= radius) {
          const darkness = Math.floor(Math.random() * 15);
          ctx.fillStyle = `rgb(${darkness}, ${darkness}, ${darkness})`;
          ctx.fillRect(
            Math.floor(centerX + x - pixelSize / 2),
            Math.floor(centerY + y - pixelSize / 2),
            Math.ceil(pixelSize),
            Math.ceil(pixelSize)
          );
        }
      }
    }

    // Hawking radiation
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + this.elapsedTime * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const opacity = (0.15 + Math.sin(this.elapsedTime * 14 + i) * 0.15) * this.sphereOpacity;
      ctx.fillStyle = `rgba(100, 120, 150, ${opacity})`;
      ctx.fillRect(Math.floor(x - 1), Math.floor(y - 1), 2, 2);
    }

    ctx.restore();
  }

  renderSuckingParticles(ctx, centerX, centerY) {
    for (const p of this.suckingParticles) {
      if (p.intensity <= 0.01) continue;

      const absX = centerX + p.relX;
      const absY = centerY + p.relY;

      ctx.save();
      ctx.globalAlpha = p.intensity;

      const glowSize = p.size * 1.5;
      const gradient = ctx.createRadialGradient(absX, absY, 0, absX, absY, glowSize);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.fillRect(
        Math.floor(absX - glowSize),
        Math.floor(absY - glowSize),
        Math.ceil(glowSize * 2),
        Math.ceil(glowSize * 2)
      );

      ctx.fillStyle = p.color;
      ctx.fillRect(
        Math.floor(absX - p.size / 2),
        Math.floor(absY - p.size / 2),
        Math.ceil(p.size),
        Math.ceil(p.size)
      );

      ctx.restore();
    }
  }

  renderAccretionDiskParticles(ctx, centerX, centerY) {
    for (const p of this.accretionDiskParticles) {
      let absX, absY;

      if (p.dispersing && p.disperseX !== undefined) {
        absX = centerX + p.disperseX;
        absY = centerY + p.disperseY;
      } else {
        const turbulenceX = Math.cos(p.turbulencePhase) * p.turbulenceAmplitude;
        const turbulenceY = Math.sin(p.turbulencePhase * 1.3) * p.turbulenceAmplitude;

        // Apply asymmetry to disk particles
        absX = centerX + Math.cos(p.angle) * p.distance * this.diskAsymmetryX + turbulenceX;
        absY = centerY + Math.sin(p.angle) * p.distance * this.diskAsymmetryY + turbulenceY;
      }

      ctx.save();
      ctx.globalAlpha = p.intensity;

      const glowSize = p.size * 2;
      const gradient = ctx.createRadialGradient(absX, absY, 0, absX, absY, glowSize);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.fillRect(
        Math.floor(absX - glowSize),
        Math.floor(absY - glowSize),
        Math.ceil(glowSize * 2),
        Math.ceil(glowSize * 2)
      );

      ctx.fillStyle = p.color;
      ctx.fillRect(
        Math.floor(absX - p.size / 2),
        Math.floor(absY - p.size / 2),
        Math.ceil(p.size),
        Math.ceil(p.size)
      );

      ctx.restore();
    }
  }

  renderWarpCirclingParticles(ctx, centerX, centerY) {
    for (const p of this.warpCirclingParticles) {
      let absX, absY;

      if (p.dispersing && p.disperseX !== undefined) {
        absX = centerX + p.disperseX;
        absY = centerY + p.disperseY;
      } else {
        absX = centerX + Math.cos(p.angle) * p.distance;
        absY = centerY + Math.sin(p.angle) * p.distance;
      }

      ctx.save();
      ctx.globalAlpha = p.intensity;

      const glowSize = p.size * 2;
      const gradient = ctx.createRadialGradient(absX, absY, 0, absX, absY, glowSize);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.fillRect(
        Math.floor(absX - glowSize),
        Math.floor(absY - glowSize),
        Math.ceil(glowSize * 2),
        Math.ceil(glowSize * 2)
      );

      ctx.fillStyle = p.color;
      ctx.fillRect(
        Math.floor(absX - p.size / 2),
        Math.floor(absY - p.size / 2),
        Math.ceil(p.size),
        Math.ceil(p.size)
      );

      ctx.restore();
    }
  }
}
