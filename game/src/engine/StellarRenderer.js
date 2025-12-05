/**
 * StellarRenderer - Advanced star rendering system with realistic animations
 *
 * Features:
 * - Stellar classification (O, B, A, F, G, K, M, plus special types)
 * - Animated plasma surface with chaotic texture changes
 * - Realistic corona mass ejections (CMEs)
 * - Pixelated rendering for retro aesthetic
 * - Dangerous radiation zones
 */

export class StellarRenderer {
  constructor() {
    // EXPANDED: Complete stellar classification system with all spectral types and subtypes
    this.stellarClasses = {
      // Main Sequence Stars (O-M classification)
      'O5': { temp: 35000, color: '#8bb0ff', size: 18, probability: 0.00001, luminosity: 2000000, name: 'O5 Blue Hypergiant' },
      'O8': { temp: 32000, color: '#92b5ff', size: 16, probability: 0.00002, luminosity: 1500000, name: 'O8 Blue Giant' },

      'B0': { temp: 20000, color: '#a0bfff', size: 9, probability: 0.03, luminosity: 20000, name: 'B0 Blue-White Giant' },
      'B5': { temp: 15000, color: '#aabfff', size: 7, probability: 0.05, luminosity: 10000, name: 'B5 Blue-White Star' },
      'B8': { temp: 12000, color: '#b5c9ff', size: 5, probability: 0.05, luminosity: 5000, name: 'B8 Blue Star' },

      'A0': { temp: 9500, color: '#c0d4ff', size: 2.5, probability: 0.2, luminosity: 150, name: 'A0 White Star' },
      'A5': { temp: 8500, color: '#cad7ff', size: 2, probability: 0.2, luminosity: 100, name: 'A5 White Star' },
      'A8': { temp: 7800, color: '#d5e0ff', size: 1.8, probability: 0.2, luminosity: 80, name: 'A8 White Star' },

      'F0': { temp: 7200, color: '#e5ebff', size: 1.5, probability: 1, luminosity: 20, name: 'F0 Yellow-White Star' },
      'F5': { temp: 6500, color: '#f8f7ff', size: 1.3, probability: 1, luminosity: 10, name: 'F5 Yellow-White Star' },
      'F8': { temp: 6000, color: '#fff9f0', size: 1.2, probability: 1, luminosity: 5, name: 'F8 Yellow Star' },

      'G0': { temp: 6000, color: '#fff9ea', size: 1.1, probability: 2.5, luminosity: 2, name: 'G0 Yellow Star' },
      'G2': { temp: 5800, color: '#fff4ea', size: 1, probability: 2.5, luminosity: 1, name: 'G2 Yellow Star (Sun-like)' },
      'G5': { temp: 5500, color: '#fff0d5', size: 0.95, probability: 2.6, luminosity: 0.8, name: 'G5 Yellow Star' },

      'K0': { temp: 5000, color: '#ffe8c0', size: 0.9, probability: 4, luminosity: 0.6, name: 'K0 Orange Star' },
      'K5': { temp: 4000, color: '#ffd2a1', size: 0.8, probability: 4, luminosity: 0.5, name: 'K5 Orange Star' },
      'K8': { temp: 3800, color: '#ffc88a', size: 0.75, probability: 4.1, luminosity: 0.4, name: 'K8 Orange-Red Star' },

      'M0': { temp: 3500, color: '#ffbd6f', size: 0.7, probability: 20, luminosity: 0.1, name: 'M0 Red Dwarf' },
      'M3': { temp: 3200, color: '#ffb060', size: 0.6, probability: 25, luminosity: 0.05, name: 'M3 Red Dwarf' },
      'M5': { temp: 3000, color: '#ffa050', size: 0.5, probability: 20, luminosity: 0.01, name: 'M5 Red Dwarf' },
      'M8': { temp: 2700, color: '#ff9040', size: 0.4, probability: 11.45, luminosity: 0.005, name: 'M8 Red Dwarf' },

      // Special Evolutionary States
      'BlueGiant': { temp: 12000, color: '#6699ff', size: 12, probability: 0.01, luminosity: 50000, name: 'Blue Giant' },
      'RedGiant': { temp: 3500, color: '#ff4500', size: 25, probability: 0.08, luminosity: 100000, name: 'Red Giant' },
      'YellowGiant': { temp: 5000, color: '#ffdd00', size: 15, probability: 0.02, luminosity: 50000, name: 'Yellow Giant' },

      'BlueSuperGiant': { temp: 15000, color: '#5588ff', size: 50, probability: 0.00005, luminosity: 500000, name: 'Blue Supergiant' },
      'RedSuperGiant': { temp: 3000, color: '#ff2200', size: 60, probability: 0.00005, luminosity: 1000000, name: 'Red Supergiant' },

      // Compact Objects
      'WhiteDwarf': { temp: 8000, color: '#ffffff', size: 0.3, probability: 0.1, luminosity: 0.01, name: 'White Dwarf' },
      'BrownDwarf': { temp: 1500, color: '#8b4513', size: 0.4, probability: 0.05, luminosity: 0.0001, name: 'Brown Dwarf (Failed Star)' },

      // Exotic Objects
      'NeutronStar': { temp: 600000, color: '#ff00ff', size: 0.08, probability: 0.000005, luminosity: 100, name: 'Neutron Star' },
      'Pulsar': { temp: 600000, color: '#ff00cc', size: 0.08, probability: 0.000005, luminosity: 100, name: 'Pulsar (Rotating Neutron Star)' },
      'Magnetar': { temp: 700000, color: '#ff0088', size: 0.08, probability: 0.000001, luminosity: 150, name: 'Magnetar (Magnetic Neutron Star)' },

      'BlackHole': { temp: 0, color: '#000000', size: 0.5, probability: 0.000008, luminosity: 0, name: 'Black Hole' },
      'QuasarCore': { temp: 100000, color: '#00ffff', size: 1, probability: 0.000002, luminosity: 10000000, name: 'Quasar Core (Active Black Hole)' }
    };

    // Corona ejection pool for performance
    this.coronaEjections = [];
    this.maxEjections = 20;

    // Animation state
    this.time = 0;
    this.noiseSeeds = [];

    // Pre-generate noise seeds for performance
    for (let i = 0; i < 1000; i++) {
      this.noiseSeeds.push(Math.random());
    }
  }

  /**
   * Select stellar class based on probability distribution
   */
  selectStellarClass(seed) {
    // Use seed for deterministic selection
    const rng = this.seededRandom(seed);
    const roll = rng() * 100;

    let cumulative = 0;
    for (const [className, data] of Object.entries(this.stellarClasses)) {
      cumulative += data.probability;
      if (roll <= cumulative) {
        return { class: className, ...data };
      }
    }

    // Fallback to M5-class red dwarf (most common)
    return { class: 'M5', ...this.stellarClasses['M5'] };
  }

  /**
   * Seeded random number generator
   */
  seededRandom(seed) {
    let s = seed;
    return function() {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  /**
   * Update animation state
   */
  update(dt) {
    this.time += dt;

    // Update corona ejections with complex motion
    for (let i = this.coronaEjections.length - 1; i >= 0; i--) {
      const ejection = this.coronaEjections[i];
      ejection.life -= dt;
      ejection.distance += ejection.speed * dt;
      ejection.alpha = Math.max(0, ejection.life / ejection.maxLife);

      // Complex motion: curved trajectory
      if (ejection.curvature) {
        ejection.angle += ejection.curvature * dt;
      }

      // Turbulent wobble
      if (ejection.turbulence) {
        ejection.angle += Math.sin(this.time * 3 + i) * ejection.turbulence * dt;
      }

      // Change color as it cools
      const coolFactor = 1 - (ejection.life / ejection.maxLife);
      ejection.currentColor = this.interpolateColor(
        ejection.startColor,
        ejection.endColor,
        coolFactor
      );

      if (ejection.life <= 0) {
        this.coronaEjections.splice(i, 1);
      }
    }
  }

  /**
   * Spawn corona mass ejection
   */
  spawnCoronaEjection(x, y, radius, stellarClass, seed) {
    if (this.coronaEjections.length >= this.maxEjections) return;

    // Don't spawn ejections for black holes or white dwarfs
    if (stellarClass.class === 'BlackHole' || stellarClass.class === 'WhiteDwarf') return;

    const rng = this.seededRandom(seed + this.time * 1000);

    // COMPLEX EJECTIONS: Prefer eruptions from the sides (equator regions)
    // Angle ranges: 45-135° and 225-315° (left/right sides)
    const sideRange = rng() < 0.7; // 70% chance to erupt from sides
    let angle;
    if (sideRange) {
      // Side eruptions
      if (rng() < 0.5) {
        angle = (Math.PI / 4) + rng() * (Math.PI / 2); // 45-135° (left side)
      } else {
        angle = (5 * Math.PI / 4) + rng() * (Math.PI / 2); // 225-315° (right side)
      }
    } else {
      // Occasional polar eruptions
      angle = rng() * Math.PI * 2;
    }

    const spread = (rng() - 0.5) * 0.8; // More spread for complexity

    // FIXED: Ejection properties - always use red/orange/yellow/white colors only
    const intensityFactor = stellarClass.temp / 10000;
    // Start with white for hot stars, yellow for medium, orange for cool
    const startColor = stellarClass.temp > 10000 ? '#ffffff' :
                      stellarClass.temp > 6000 ? '#ffff88' : '#ff8800';
    const endColor = '#ff3300'; // Always end with red

    // SIMPLIFIED: Fewer streams for performance (procedural fallback)
    const numStreams = 1 + Math.floor(rng() * 2); // 1-2 streams per ejection (was 2-4)

    for (let i = 0; i < numStreams; i++) {
      const streamAngle = angle + spread + (rng() - 0.5) * 0.4;
      const streamSpeed = 50 + rng() * 150 * intensityFactor;

      this.coronaEjections.push({
        x,
        y,
        angle: streamAngle,
        startRadius: radius, // FIXED: Start from star's edge
        distance: 0, // Start at edge, will grow outward
        speed: streamSpeed,
        width: 8 + rng() * 15,
        length: 40 + rng() * 80,
        life: 3 + rng() * 5,
        maxLife: 3 + rng() * 5,
        alpha: 1,
        startColor,
        endColor,
        currentColor: startColor,
        damage: 10 * intensityFactor,
        radiation: stellarClass.luminosity * 0.1,
        // Complex motion
        curvature: (rng() - 0.5) * 0.02, // Slight curve in trajectory
        turbulence: rng() * 0.3 // Random wobble
      });
    }
  }

  /**
   * Render animated star with pixelated plasma surface
   */
  renderStar(ctx, x, y, stellarData, seed) {
    const radius = stellarData.size * 400; // FIXED: Red dwarf (0.4) = 160px, Sun (1.0) = 400px, Giants = 800-2400px

    ctx.save();

    // Black hole special rendering
    if (stellarData.class === 'BlackHole') {
      this.renderBlackHole(ctx, x, y, radius, seed);
      ctx.restore();
      return;
    }

    // Neutron star/Pulsar special rendering
    if (stellarData.class === 'Neutron') {
      this.renderNeutronStar(ctx, x, y, radius, seed);
      ctx.restore();
      return;
    }

    // Try to render with sprite first
    const spriteId = `star_${stellarData.class}_${seed}`;
    if (this.game && this.game.spriteManager) {
      const cached = this.game.spriteManager.getSprite(spriteId);
      if (cached && cached.sprite && cached.sprite.frameWidth) {
        // The sprite frames are already sized for the star
        // Scale to match the desired radius (diameter / frameWidth)
        // Since frameWidth represents the full star diameter in the sprite
        const spriteScale = (radius * 2) / cached.sprite.frameWidth;

        // Cap the scale to prevent stars from being too large and getting cut off
        const maxScale = 2.0; // Maximum 2x the original sprite size
        const finalScale = Math.min(spriteScale, maxScale);

        const rendered = this.game.spriteManager.renderAnimatedSprite(ctx, spriteId, x, y, this.time, {
          scale: finalScale,
          alpha: 1.0,
          camX: this.game.camera?.x || 0,
          camY: this.game.camera?.y || 0
        });
        if (rendered) {
          ctx.restore();
          return;
        }
      }
    }

    // HEAVILY PIXELATED surface - hundreds of tiny pixels for maximum detail
    // PERFORMANCE: Larger pixelSize = fewer pixels to calculate, better FPS
    // CRITICAL: Must be VERY large for procedural fallback to avoid 1 FPS lag
    const pixelSize = Math.max(30, radius / 20); // MASSIVELY INCREASED: radius/20 ensures max ~400 pixels even for giant stars
    const pixels = Math.ceil(radius * 2 / pixelSize);

    // REMOVED: No corona circles - clean star surface only

    // OPTIMIZED: Pixelated plasma surface with chaotic patterns (no straight lines)
    // Cache frequently used values
    const timeOffset1 = this.time * 8;
    const timeOffset2 = this.time * 6;
    const timeOffset3 = this.time * 10;
    const radiusSq = radius * radius;

    for (let px = -pixels/2; px < pixels/2; px++) {
      for (let py = -pixels/2; py < pixels/2; py++) {
        const dx = px * pixelSize;
        const dy = py * pixelSize;

        // OPTIMIZED: Skip sqrt when possible
        const distSq = dx * dx + dy * dy;
        if (distSq > radiusSq) continue;

        const dist = Math.sqrt(distSq);

        // OPTIMIZED: Pre-calculate indices (avoiding multiplication in modulo)
        const pxOff = px + pixels/2;
        const pyOff = py + pixels/2;

        // Multiple CHAOTIC noise layers with seed-based randomization (no patterns!)
        const noiseIndex1 = Math.floor(
          (pxOff + pyOff * pixels + timeOffset1 + seed * 123.456) % this.noiseSeeds.length
        );
        const noiseIndex2 = Math.floor(
          (pxOff * 1.7 + pyOff * 2.3 + timeOffset2 + seed * 789.012) % this.noiseSeeds.length
        );
        const noiseIndex3 = Math.floor(
          (Math.sin(px * 0.1 + seed * 0.001) * 50 + Math.cos(py * 0.1 + seed * 0.002) * 50 + timeOffset3 + seed * 345.678) % this.noiseSeeds.length
        );

        const noise1 = this.noiseSeeds[noiseIndex1];
        const noise2 = this.noiseSeeds[noiseIndex2];
        const noise3 = this.noiseSeeds[noiseIndex3];

        // FIXED: Fully randomized chaotic patterns - no repetition, no circular/spiral artifacts
        // Large convection cells - purely noise-based with seed offset
        const convection = Math.sin(
          dx * 0.025 + dy * 0.018 + this.time * 1.5 + noise1 * 15 + noise2 * 8 + seed * 0.1
        ) * 0.5 + 0.5;

        // Medium granulation (bubble-like cells) - highly chaotic with seed variation
        const granulation = Math.sin(
          Math.cos(dx * 0.02 + noise1 * 10 + seed * 0.05) * 7 +
          Math.sin(dy * 0.022 + noise2 * 9 + seed * 0.07) * 7 +
          this.time * 2 + noise3 * 12
        ) * 0.5 + 0.5;

        // Small turbulent details - pure chaos with unique seed offset
        const turbulence = Math.sin(
          Math.sin(px * 0.5 + noise3 * 8 + seed * 0.003) * 4 +
          Math.cos(py * 0.47 + noise1 * 7 + seed * 0.004) * 3.5 +
          this.time * 3 + noise2 * 15
        ) * 0.5 + 0.5;

        // Cool dark spots (sunspots) - scattered randomly with seed, creates BLACK spots
        const darkSpot = Math.sin(
          dx * 0.03 + dy * 0.035 + this.time * 1.8 + noise1 * 20 + noise3 * 18 + seed * 0.08
        ) * 0.5 + 0.5;

        // Cool regions - pure noise patterns with seed offset
        const coolRegion = Math.sin(
          dx * 0.028 - dy * 0.032 + this.time * 2.2 + noise2 * 16 + noise3 * 14 + seed * 0.06
        ) * 0.5 + 0.5;

        // 3D SPHERICAL: Create depth through center brightening instead of edge darkening
        // Calculate normalized distance from center (0 at center, 1 at edge)
        const normalizedDist = Math.sqrt(distSq / radiusSq);

        // Center highlight - brightest in middle, subtle falloff (NO DARK EDGES!)
        const centerGlow = 1 - Math.pow(normalizedDist, 2) * 0.15; // Only 15% dimming at edges

        // OPTIMIZED: Combine all layers (darkSpot reduces brightness = BLACK spots)
        const surfacePattern = (
          convection * 0.25 +
          granulation * 0.2 +
          turbulence * 0.15 +
          (1 - darkSpot) * 0.2 + // Inverted = dark spots reduce brightness
          coolRegion * 0.2
        );

        // FIXED: Brightness from surface pattern only - NO white center highlights
        // This ensures spots stay dark (black) and no white patterns appear
        const brightness = surfacePattern * centerGlow;

        // Convert stellar color to red/orange/yellow/white palette
        let baseColor;
        if (stellarData.temp > 15000) {
          baseColor = '#ffffff'; // Hot white
        } else if (stellarData.temp > 10000) {
          baseColor = '#ffffdd'; // Pale yellow-white
        } else if (stellarData.temp > 7000) {
          baseColor = '#ffff88'; // Yellow
        } else if (stellarData.temp > 5500) {
          baseColor = '#ffdd66'; // Yellow-orange
        } else if (stellarData.temp > 4500) {
          baseColor = '#ffaa44'; // Orange
        } else if (stellarData.temp > 3500) {
          baseColor = '#ff7722'; // Deep orange
        } else {
          baseColor = '#ff4400'; // Red-orange
        }

        // FIXED: Bright yellow/white star with dark black/red spots (not bright spots)
        let finalColor;
        if (brightness < 0.1) {
          // Black sunspots (cool dark regions)
          finalColor = '#000000';
        } else if (brightness < 0.2) {
          // Dark red spots
          finalColor = '#440000';
        } else if (brightness < 0.3) {
          // Red spots
          finalColor = '#aa0000';
        } else if (brightness < 0.45) {
          // Orange
          finalColor = '#ff8800';
        } else if (brightness < 0.6) {
          // Bright orange-yellow
          finalColor = '#ffaa33';
        } else if (brightness < 0.75) {
          // Yellow (dominant color)
          finalColor = '#ffdd66';
        } else if (brightness < 0.88) {
          // Bright yellow
          finalColor = '#ffff99';
        } else {
          // Very bright white-yellow (base surface)
          finalColor = '#ffffee';
        }

        ctx.fillStyle = finalColor;
        ctx.fillRect(x + dx, y + dy, pixelSize, pixelSize);
      }
    }

    // SIMPLIFIED: Basic glow effect for procedural fallback (performance critical)
    // Full glow is only for sprites, procedural rendering needs to be fast
    const glowPixelSize = Math.max(40, radius / 15); // Large pixels for fast rendering
    const glowRings = 4; // REDUCED from 12 to 4 for performance
    const glowColor = stellarData.temp > 10000 ? '#ffffff' :
                     stellarData.temp > 6000 ? '#ffff88' :
                     stellarData.temp > 4000 ? '#ff8800' : '#ff5500';

    // Simple glow rings (much faster)
    for (let ring = 0; ring < glowRings; ring++) {
      const glowRadius = radius * (1.05 + ring * 0.15);
      const alpha = 0.25 * (1 - ring / glowRings);
      const segments = Math.min(24, Math.floor(glowRadius / glowPixelSize)); // Cap segments

      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const gx = x + Math.cos(angle) * glowRadius;
        const gy = y + Math.sin(angle) * glowRadius;

        ctx.fillStyle = this.addAlpha(glowColor, alpha);
        ctx.fillRect(
          Math.floor(gx / glowPixelSize) * glowPixelSize,
          Math.floor(gy / glowPixelSize) * glowPixelSize,
          glowPixelSize,
          glowPixelSize
        );
      }
    }

    ctx.restore();
  }

  /**
   * Render black hole with accretion disk
   */
  renderBlackHole(ctx, x, y, radius, seed) {
    const actualRadius = radius * 2; // Black holes are "bigger" due to accretion disk

    // Event horizon (pure black)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x, y, actualRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // FIXED: Pixelated gravitational lensing effect
    const lensingPixelSize = 8;
    const lensingRadius = actualRadius * 0.35;
    const lensingSegments = 48;

    for (let i = 0; i < lensingSegments; i++) {
      const angle = (i / lensingSegments) * Math.PI * 2;
      const px = x + Math.cos(angle) * lensingRadius;
      const py = y + Math.sin(angle) * lensingRadius;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(
        Math.floor(px / lensingPixelSize) * lensingPixelSize,
        Math.floor(py / lensingPixelSize) * lensingPixelSize,
        lensingPixelSize,
        lensingPixelSize
      );
    }

    // FIXED: Pixelated accretion disk (spinning plasma) - red/orange/yellow/white only
    const pixelSize = 10;
    for (let ring = 0; ring < 8; ring++) {
      const ringRadius = actualRadius * (0.5 + ring * 0.2);
      const segments = 36;

      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2 + this.time * (1 + ring * 0.2);

        // Noise for turbulence
        const noise = this.noiseSeeds[Math.floor((ring * segments + i + this.time * 100) % this.noiseSeeds.length)];
        const alpha = 0.3 + noise * 0.4;

        // FIXED: Colors only red/orange/yellow/white based on heat
        const temp = noise;
        const color = temp > 0.7 ? `rgba(255, 255, 255, ${alpha})` :  // White hot
                     temp > 0.5 ? `rgba(255, 255, 150, ${alpha})` :  // Yellow
                     temp > 0.3 ? `rgba(255, 150, 50, ${alpha})` :   // Orange
                                  `rgba(255, 50, 0, ${alpha})`;       // Red

        // Draw pixelated particles instead of arcs
        const px = x + Math.cos(angle) * ringRadius;
        const py = y + Math.sin(angle) * ringRadius;

        ctx.fillStyle = color;
        ctx.fillRect(
          Math.floor(px / pixelSize) * pixelSize,
          Math.floor(py / pixelSize) * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }

    // Relativistic jets (if active)
    if (seed % 3 === 0) {
      const jetLength = actualRadius * 4;
      const jetGradient = ctx.createLinearGradient(x, y - actualRadius, x, y - jetLength);
      jetGradient.addColorStop(0, 'rgba(150, 200, 255, 0.8)');
      jetGradient.addColorStop(1, 'rgba(150, 200, 255, 0)');

      ctx.fillStyle = jetGradient;
      ctx.fillRect(x - 10, y - jetLength, 20, jetLength - actualRadius);

      // Opposite jet
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI);
      ctx.translate(-x, -y);
      ctx.fillRect(x - 10, y - jetLength, 20, jetLength - actualRadius);
      ctx.restore();
    }
  }

  /**
   * Render neutron star with pulsar beams
   */
  renderNeutronStar(ctx, x, y, radius, seed) {
    const actualRadius = radius * 8; // Neutron stars are tiny but very bright

    // Core (extremely bright)
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, actualRadius);
    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.3, '#ff00ff');
    coreGradient.addColorStop(0.6, '#8800ff');
    coreGradient.addColorStop(1, 'rgba(136, 0, 255, 0)');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, actualRadius, 0, Math.PI * 2);
    ctx.fill();

    // FIXED: Pixelated pulsar beams (rotating)
    const beamAngle = this.time * 10; // Fast rotation
    const beamLength = actualRadius * 15;
    const beamPixelSize = 8;

    for (let beam = 0; beam < 2; beam++) {
      const angle = beamAngle + beam * Math.PI;

      // Draw pixelated beam particles
      const segments = Math.floor(beamLength / beamPixelSize);
      for (let seg = 0; seg < segments; seg++) {
        const dist = seg * beamPixelSize;
        const alpha = 0.8 * (1 - dist / beamLength);

        const beamX = x + Math.cos(angle) * dist;
        const beamY = y + Math.sin(angle) * dist;

        // Add some width variation
        for (let w = -1; w <= 1; w++) {
          const perpAngle = angle + Math.PI / 2;
          const wx = beamX + Math.cos(perpAngle) * w * beamPixelSize;
          const wy = beamY + Math.sin(perpAngle) * w * beamPixelSize;

          ctx.fillStyle = `rgba(255, 0, 255, ${alpha})`;
          ctx.fillRect(
            Math.floor(wx / beamPixelSize) * beamPixelSize,
            Math.floor(wy / beamPixelSize) * beamPixelSize,
            beamPixelSize,
            beamPixelSize
          );
        }
      }
    }

    // FIXED: Pixelated magnetic field lines
    const fieldPixelSize = 6;
    for (let i = 0; i < 12; i++) {
      const fieldAngle = (i / 12) * Math.PI * 2;
      const fieldRadius = actualRadius * (1.5 + Math.sin(this.time * 2 + i) * 0.3);

      // Draw pixelated arc segments
      const arcSegments = 12;
      for (let s = 0; s < arcSegments; s++) {
        const segmentAngle = fieldAngle - 0.3 + (s / arcSegments) * 0.6;
        const fx = x + Math.cos(segmentAngle) * fieldRadius;
        const fy = y + Math.sin(segmentAngle) * fieldRadius;

        ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
        ctx.fillRect(
          Math.floor(fx / fieldPixelSize) * fieldPixelSize,
          Math.floor(fy / fieldPixelSize) * fieldPixelSize,
          fieldPixelSize,
          fieldPixelSize
        );
      }
    }
  }

  /**
   * Render all corona ejections
   */
  renderCoronaEjections(ctx, camX, camY) {
    ctx.save();

    for (const ejection of this.coronaEjections) {
      // Start from star's edge
      const startX = ejection.x + Math.cos(ejection.angle) * ejection.startRadius;
      const startY = ejection.y + Math.sin(ejection.angle) * ejection.startRadius;

      const screenStartX = startX - camX;
      const screenStartY = startY - camY;

      // FIXED: Only red/orange/yellow/white color progression
      const lifeProgress = 1 - (ejection.life / ejection.maxLife);
      let currentMainColor;

      if (lifeProgress < 0.15) {
        // Extremely hot white phase
        currentMainColor = '#ffffff';
      } else if (lifeProgress < 0.35) {
        // White to bright yellow
        currentMainColor = this.interpolateColor('#ffffff', '#ffff88', (lifeProgress - 0.15) / 0.2);
      } else if (lifeProgress < 0.55) {
        // Yellow to orange
        currentMainColor = this.interpolateColor('#ffff88', '#ff8800', (lifeProgress - 0.35) / 0.2);
      } else if (lifeProgress < 0.8) {
        // Orange to red
        currentMainColor = this.interpolateColor('#ff8800', '#ff3300', (lifeProgress - 0.55) / 0.25);
      } else {
        // Red to deep dark red
        currentMainColor = this.interpolateColor('#ff3300', '#330000', (lifeProgress - 0.8) / 0.2);
      }

      // SIMPLIFIED: Basic corona for procedural fallback (performance critical)
      const pixelSize = 15; // INCREASED: Larger pixels for performance
      const segments = 20; // REDUCED: Fewer segments for performance (was 50)

      for (let i = 0; i <= segments; i++) {
        const progress = i / segments;
        const baseDistance = ejection.distance * progress;

        // ENHANCED: Complex realistic plasma motion - magnetic field lines, turbulence
        const wobbleX = Math.sin(this.time * 4 + i * 2.5 + ejection.angle) * ejection.width * 2.5 +
                       Math.sin(this.time * 7 + i * 1.3) * ejection.width * 1.2 +
                       Math.sin(this.time * 11 + progress * 20) * ejection.width * 0.8; // Extra detail layer
        const wobbleY = Math.cos(this.time * 3.5 + i * 2.1 + ejection.angle) * ejection.width * 2.5 +
                       Math.cos(this.time * 6 + i * 1.7) * ejection.width * 1.2 +
                       Math.cos(this.time * 9 + progress * 18) * ejection.width * 0.8; // Extra detail layer
        const spiralWobble = Math.sin(this.time * 5 + progress * 10) * ejection.width * 1.2;
        const turbulence = Math.sin(this.time * 8 + progress * 15 + i * 3) * ejection.width * 0.6;
        const magneticField = Math.sin(this.time * 3 + i * 4 + progress * 12) * ejection.width * 1.5; // Magnetic loops

        // Natural curve with heavy turbulence and magnetic fields
        const curveAngle = ejection.angle +
                          (ejection.curvature || 0) * baseDistance +
                          spiralWobble * 0.15 +
                          turbulence * 0.1 +
                          magneticField * 0.08; // Magnetic field influence

        const x = startX + Math.cos(curveAngle) * baseDistance + wobbleX;
        const y = startY + Math.sin(curveAngle) * baseDistance + wobbleY;

        const screenX = x - camX;
        const screenY = y - camY;

        // Color darkens along length
        const distanceProgress = progress;
        const segmentColor = this.interpolateColor(
          currentMainColor,
          '#220000',
          distanceProgress * 0.7
        );

        // Size decreases along length
        const size = ejection.width * (1 - progress * 0.5);
        const alpha = ejection.alpha * (1 - progress * 0.4);

        // Draw particles (reduced for performance)
        const particleCount = Math.max(2, Math.floor(size / 4)); // REDUCED: Fewer particles for performance
        for (let p = 0; p < particleCount; p++) {
          const spreadAngle = (p / particleCount) * Math.PI * 2;
          const spreadDist = (Math.random() * size * 0.5);

          const px = screenX + Math.cos(spreadAngle) * spreadDist;
          const py = screenY + Math.sin(spreadAngle) * spreadDist;

          // Pixelated chunks with brightness variation
          const brightness = 0.8 + Math.random() * 0.4;
          const particleColor = this.adjustBrightness(segmentColor, (brightness - 1) * 0.3);

          ctx.fillStyle = this.addAlpha(particleColor, alpha * (0.6 + Math.random() * 0.4));
          ctx.fillRect(
            Math.floor(px / pixelSize) * pixelSize,
            Math.floor(py / pixelSize) * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      }

      // SIMPLIFIED: Basic glow for procedural fallback (performance critical)
      // Complex glow effects are only for sprites
      ctx.globalCompositeOperation = 'lighter'; // Additive blending for shine
      const glowPixelSize = pixelSize * 3; // Larger pixels for performance
      const glowSegments = 8; // REDUCED: Much fewer segments (was 30)

      for (let i = 0; i <= glowSegments; i++) {
        const progress = i / glowSegments;
        const baseDistance = ejection.distance * progress;
        const curveAngle = ejection.angle + (ejection.curvature || 0) * baseDistance;

        const x = startX + Math.cos(curveAngle) * baseDistance;
        const y = startY + Math.sin(curveAngle) * baseDistance;

        const screenX = x - camX;
        const screenY = y - camY;

        const baseGlowAlpha = ejection.alpha * 0.3 * (1 - progress * 0.5);

        // Simple single-layer glow
        ctx.fillStyle = this.addAlpha(currentMainColor, baseGlowAlpha);
        ctx.fillRect(
          Math.floor(screenX / glowPixelSize) * glowPixelSize,
          Math.floor(screenY / glowPixelSize) * glowPixelSize,
          glowPixelSize,
          glowPixelSize
        );
      }

      ctx.globalCompositeOperation = 'source-over'; // Reset blend mode
    }

    ctx.restore();
  }

  /**
   * Check if point is in dangerous radiation zone
   */
  getRadiationLevel(px, py, starX, starY, stellarData) {
    const distance = Math.sqrt(Math.pow(px - starX, 2) + Math.pow(py - starY, 2));
    const safeDistance = stellarData.size * 40 * 5; // 5x star radius is baseline

    if (distance > safeDistance * 3) return 0; // No radiation

    // Calculate radiation based on star type and distance
    const radiationFactor = stellarData.luminosity / (distance / 100);
    const baseRadiation = Math.max(0, 1 - distance / (safeDistance * 3));

    return baseRadiation * radiationFactor;
  }

  /**
   * Check collision with corona ejections
   */
  checkEjectionCollision(px, py, radius = 20) {
    for (const ejection of this.coronaEjections) {
      const endX = ejection.x + Math.cos(ejection.angle) * ejection.distance;
      const endY = ejection.y + Math.sin(ejection.angle) * ejection.distance;

      // Simple line-circle collision
      const distToEjection = this.pointToLineDistance(px, py, ejection.x, ejection.y, endX, endY);

      if (distToEjection < radius + ejection.width / 2) {
        return {
          hit: true,
          damage: ejection.damage,
          radiation: ejection.radiation
        };
      }
    }

    return { hit: false };
  }

  // ==================== Helper Functions ====================

  pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  addAlpha(color, alpha) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  lightenColor(color, amount) {
    const r = Math.min(255, parseInt(color.slice(1, 3), 16) + amount * 255);
    const g = Math.min(255, parseInt(color.slice(3, 5), 16) + amount * 255);
    const b = Math.min(255, parseInt(color.slice(5, 7), 16) + amount * 255);
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  darkenColor(color, amount) {
    const r = Math.max(0, parseInt(color.slice(1, 3), 16) - amount * 255);
    const g = Math.max(0, parseInt(color.slice(3, 5), 16) - amount * 255);
    const b = Math.max(0, parseInt(color.slice(5, 7), 16) - amount * 255);
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  adjustBrightness(color, variation) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const nr = Math.max(0, Math.min(255, r + variation * 100));
    const ng = Math.max(0, Math.min(255, g + variation * 100));
    const nb = Math.max(0, Math.min(255, b + variation * 100));

    return `#${Math.floor(nr).toString(16).padStart(2, '0')}${Math.floor(ng).toString(16).padStart(2, '0')}${Math.floor(nb).toString(16).padStart(2, '0')}`;
  }

  interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.floor(r1 + (r2 - r1) * factor);
    const g = Math.floor(g1 + (g2 - g1) * factor);
    const b = Math.floor(b1 + (b2 - b1) * factor);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
