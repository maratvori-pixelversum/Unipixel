/**
 * Space Environment Renderer
 * Creates realistic space atmosphere with:
 * - Nebula backgrounds (multi-layered colored gas clouds)
 * - Dust clouds and cosmic particles
 * - Stellar backgrounds with depth
 * - Ambient space lighting and atmosphere
 */

import { SeededRandom } from '../utils/SeededRandom.js';

export class SpaceEnvironmentRenderer {
  constructor() {
    this.nebulaLayers = [];
    this.dustClouds = [];
    this.cosmicParticles = [];
    this.distantStars = [];
    // NEW: Animated background elements
    this.meteors = [];
    this.floatingDebris = [];
    this.electricalStorms = [];
    this.plasmaClouds = [];
    this.quantumFluctuations = [];
    // ULTRA-NEW: Star clusters and distant galaxies for enhanced background
    this.starClusters = [];
    this.distantGalaxies = [];
    this.initialized = false;
  }

  /**
   * Initialize space environment for a system
   */
  initialize(systemSeed, systemRadius) {
    if (this.initialized) return;

    const rng = new SeededRandom(systemSeed);

    // DISABLED: Nebulae removed per user request
    // this.generateNebulaLayers(rng, systemRadius);

    // Generate dust clouds (10-30 clouds)
    this.generateDustClouds(rng, systemRadius);

    // Generate cosmic particles (50-150 particles)
    this.generateCosmicParticles(rng, systemRadius);

    // Generate distant stars (100-300 stars)
    this.generateDistantStars(rng);

    // ULTRA-NEW: Generate star clusters and distant galaxies
    this.generateStarClusters(rng);
    this.generateDistantGalaxies(rng);

    // NEW: Generate animated background elements
    this.generateMeteors(rng, systemRadius);
    this.generateFloatingDebris(rng, systemRadius);
    this.generateElectricalStorms(rng, systemRadius);
    this.generatePlasmaClouds(rng, systemRadius);
    this.generateQuantumFluctuations(rng, systemRadius);

    this.initialized = true;
  }

  /**
   * Generate multi-layered nebula backgrounds
   * ENHANCED: Creates stunning colored gas clouds with heavy pixelation
   */
  generateNebulaLayers(rng, systemRadius) {
    // INCREASED: More nebula layers for richer background
    const layerCount = rng.int(5, 8);

    // Nebula color palettes (MORE VIVID colors for better visibility)
    const colorPalettes = [
      // Emission nebulae (BRIGHTER red/pink from hydrogen-alpha)
      ['#5a2030', '#652538', '#703040', '#7a3548'],
      // Reflection nebulae (BRIGHTER blue from star reflection)
      ['#253050', '#2a3558', '#304060', '#354568'],
      // Green oxygen emission (BRIGHTER green)
      ['#305a38', '#356540', '#3a7048', '#407a50'],
      // Purple/magenta (BRIGHTER sulfur and hydrogen mix)
      ['#5a3050', '#653558', '#704060', '#7a4568'],
      // Orange (BRIGHTER nitrogen and sulfur)
      ['#5a3525', '#654030', '#704a38', '#7a5540'],
      // Deep violet/indigo (BRIGHTER ionized gases)
      ['#353050', '#3a3558', '#404060', '#454568']
    ];

    for (let i = 0; i < layerCount; i++) {
      const palette = colorPalettes[Math.floor(rng.next() * colorPalettes.length)];

      // More cloud patches for richer nebulae
      const patchCount = rng.int(12, 20);
      const patches = [];

      for (let j = 0; j < patchCount; j++) {
        const angle = rng.next() * Math.PI * 2;
        const distance = rng.next() * systemRadius * 0.8;

        const patchRadius = rng.range(8000, 25000); // Larger patches

        // Pre-generate particle positions with VISUAL heavy pixelation
        const pixelDensity = 40; // More particles for better visuals
        const cachedPixels = [];
        for (let p = 0; p < pixelDensity; p++) {
          const pAngle = rng.next() * Math.PI * 2;
          const pDist = rng.next() * patchRadius;
          const pIntensity = rng.next() * 0.5 + 0.5;
          cachedPixels.push({
            angle: pAngle,
            dist: pDist,
            intensity: pIntensity
          });
        }

        patches.push({
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          radius: patchRadius,
          color: palette[Math.floor(rng.next() * palette.length)],
          opacity: rng.range(0.08, 0.15), // HEAVILY PIXELATED: Lower opacity for subtle effect
          turbulence: rng.range(0.3, 0.8),
          driftSpeed: rng.range(0.001, 0.005),
          driftAngle: rng.next() * Math.PI * 2,
          cachedPixels: cachedPixels // Cache particles for performance
        });
      }

      this.nebulaLayers.push({
        patches,
        depth: i / layerCount, // 0 = far, 1 = near
        parallaxFactor: 0.1 + (i / layerCount) * 0.3 // Parallax effect
      });
    }
  }

  /**
   * Generate drifting dust clouds
   * ENHANCED: Thousands of small pixelated patches that drift through space
   */
  generateDustClouds(rng, systemRadius) {
    const cloudCount = rng.int(25, 50); // PERFORMANCE: Reduced from 100-180 to 25-50

    for (let i = 0; i < cloudCount; i++) {
      const angle = rng.next() * Math.PI * 2;
      const distance = rng.next() * systemRadius;

      const cloudRadius = rng.range(800, 3000);
      const cloudDensity = rng.range(0.1, 0.25); // More visible (increased from 0.05-0.15)

      // OPTIMIZED: Pre-generate particle positions with VISUAL heavy pixelation
      const dustPixels = 15; // Reduced from 40 - use dithering pattern instead
      const cachedDustPixels = [];
      for (let p = 0; p < dustPixels; p++) {
        const pAngle = rng.next() * Math.PI * 2;
        const pDist = rng.next() * cloudRadius * 0.9;
        const pSize = rng.next() > 0.7 ? 2 : 1;
        const pIntensity = rng.next() * 0.6 + 0.4;
        cachedDustPixels.push({
          angle: pAngle,
          dist: pDist,
          size: pSize,
          intensity: pIntensity
        });
      }

      // MORE VISIBLE dust cloud colors
      const dustColors = [
        '#1a1a28', // Visible blue-gray
        '#281a1a', // Visible brown-gray
        '#1a281a', // Visible green-gray
        '#281a28', // Visible purple-gray
        '#202020', // Dark gray
        '#252525'  // Dark gray
      ];

      this.dustClouds.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        radius: cloudRadius,
        density: cloudDensity,
        color: dustColors[Math.floor(rng.next() * dustColors.length)],
        driftVx: rng.range(-0.5, 0.5),
        driftVy: rng.range(-0.5, 0.5),
        rotation: rng.next() * Math.PI * 2,
        rotationSpeed: rng.range(-0.001, 0.001),
        cachedDustPixels: cachedDustPixels // Cache particles for performance
      });
    }
  }

  /**
   * Generate cosmic particles (micrometeors, ice crystals, debris)
   * ENHANCED: THOUSANDS of tiny pixelated specks that add life to space
   */
  generateCosmicParticles(rng, systemRadius) {
    const particleCount = rng.int(120, 250); // PERFORMANCE: Reduced from 400-800 to 120-250

    for (let i = 0; i < particleCount; i++) {
      const angle = rng.next() * Math.PI * 2;
      const distance = rng.next() * systemRadius;

      this.cosmicParticles.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: rng.range(1, 3),
        brightness: rng.range(0.35, 0.75), // More visible (increased from 0.15-0.5)
        color: rng.next() > 0.8 ? '#ffffaa' : '#ffffff', // Mostly white, some yellow
        twinkleSpeed: rng.range(0.5, 2.0),
        twinklePhase: rng.next() * Math.PI * 2,
        driftVx: rng.range(-0.3, 0.3),
        driftVy: rng.range(-0.3, 0.3)
      });
    }
  }

  /**
   * Generate distant background stars
   * ENHANCED: Creates depth with tiny pixelated stars with parallax layers
   */
  generateDistantStars(rng) {
    // REDUCED: Generate 500-1000 stars across multiple parallax layers for cleaner look
    const starCount = rng.int(500, 1000);

    for (let i = 0; i < starCount; i++) {
      // Assign stars to different parallax layers (0 = far/slow, 2 = near/fast)
      const layer = i < starCount * 0.5 ? 0 : (i < starCount * 0.8 ? 1 : 2);
      const parallaxFactor = layer === 0 ? 0.02 : (layer === 1 ? 0.05 : 0.08);

      this.distantStars.push({
        worldX: rng.next() * 15000 - 7500, // World space position for parallax
        worldY: rng.next() * 8500 - 4250,
        size: rng.next() > 0.6 ? 2 : 1, // Even more 2px stars (40% instead of 30%)
        brightness: rng.range(0.7, 1.0), // EVEN BRIGHTER for visibility
        color: this.getStarColor(rng),
        twinkleSpeed: rng.range(0.3, 1.5),
        twinklePhase: rng.next() * Math.PI * 2,
        parallaxFactor: parallaxFactor, // How much camera affects position
        layer: layer
      });
    }
  }

  /**
   * Get realistic star color based on temperature
   */
  getStarColor(rng) {
    const colors = [
      '#ffaaaa', // Red (cool stars)
      '#ffddaa', // Orange
      '#ffffdd', // Yellow
      '#ffffff', // White (most common)
      '#ffffff', // White (weighted)
      '#ffffff', // White (weighted)
      '#ddddff', // Blue-white
      '#aaccff'  // Blue (hot stars)
    ];
    return colors[Math.floor(rng.next() * colors.length)];
  }

  /**
   * ULTRA-NEW: Generate star clusters (concentrated groups of stars)
   * Creates 8-15 clusters with 50-200 stars each for rich background
   */
  generateStarClusters(rng) {
    // INCREASED: More clusters with more stars
    const clusterCount = rng.int(8, 15);

    for (let c = 0; c < clusterCount; c++) {
      // World space coordinates for parallax
      const clusterX = rng.next() * 10000 - 5000;
      const clusterY = rng.next() * 6000 - 3000;
      const clusterRadius = rng.range(80, 250); // Larger clusters
      const starCount = rng.int(50, 200); // Many more stars per cluster
      const clusterColor = this.getStarColor(rng); // All stars similar color
      const parallaxFactor = rng.range(0.03, 0.07); // Each cluster has own parallax depth

      const stars = [];
      for (let i = 0; i < starCount; i++) {
        // Stars concentrated near cluster center (Gaussian distribution)
        const angle = rng.next() * Math.PI * 2;
        const dist = Math.abs(rng.range(-1, 1)) * clusterRadius;

        stars.push({
          offsetX: Math.cos(angle) * dist,
          offsetY: Math.sin(angle) * dist,
          size: rng.next() > 0.6 ? 2 : 1, // Even more 2px stars
          brightness: rng.range(0.6, 1.0), // MUCH brighter for visibility
          colorVariation: rng.range(-20, 20) // Slight color variation
        });
      }

      this.starClusters.push({
        x: clusterX,
        y: clusterY,
        stars: stars,
        baseColor: clusterColor,
        twinkleSpeed: rng.range(0.2, 0.8),
        twinklePhase: rng.next() * Math.PI * 2,
        parallaxFactor: parallaxFactor // Add parallax movement
      });
    }
  }

  /**
   * ULTRA-NEW: Generate distant galaxies (tiny heavily pixelated spiral/elliptical shapes)
   * Creates 15-25 ultra-distant galaxies visible in the background
   */
  generateDistantGalaxies(rng) {
    // INCREASED: More galaxies for much richer background
    const galaxyCount = rng.int(15, 25);

    for (let g = 0; g < galaxyCount; g++) {
      // World space coordinates for parallax
      const galaxyX = rng.next() * 8000 - 4000;
      const galaxyY = rng.next() * 5000 - 2500;
      const galaxyType = rng.next() > 0.5 ? 'spiral' : 'elliptical';
      const size = rng.range(20, 60); // Larger, more visible galaxies
      const parallaxFactor = rng.range(0.01, 0.04); // Very slow parallax (far away)

      // Generate heavily pixelated galaxy shape
      const pixels = [];
      const pixelSize = 2; // Heavily pixelated

      if (galaxyType === 'spiral') {
        // Spiral galaxy - arms radiating from center
        const armCount = rng.int(2, 4);
        for (let arm = 0; arm < armCount; arm++) {
          const armAngle = (Math.PI * 2 * arm / armCount) + rng.range(-0.3, 0.3);
          const armLength = size * 0.8;

          for (let r = 0; r < armLength; r += pixelSize) {
            const spiralAngle = armAngle + (r / armLength) * Math.PI * 2;
            const x = Math.cos(spiralAngle) * r;
            const y = Math.sin(spiralAngle) * r;

            // Add pixels along arm with some width
            for (let w = -2; w <= 2; w++) {
              if (rng.next() > 0.3) {
                pixels.push({
                  x: x + Math.cos(spiralAngle + Math.PI/2) * w * pixelSize,
                  y: y + Math.sin(spiralAngle + Math.PI/2) * w * pixelSize,
                  brightness: rng.range(0.3, 0.6) * (1 - r/armLength) // MUCH brighter for visibility
                });
              }
            }
          }
        }
      } else {
        // Elliptical galaxy - oval shape
        const width = size;
        const height = size * rng.range(0.5, 0.8);

        for (let px = -width/2; px <= width/2; px += pixelSize) {
          for (let py = -height/2; py <= height/2; py += pixelSize) {
            const dist = Math.sqrt((px/width)**2 + (py/height)**2);
            if (dist < 0.5 && rng.next() > 0.4) {
              pixels.push({
                x: px,
                y: py,
                brightness: rng.range(0.3, 0.6) * (1 - dist * 2) // MUCH brighter for visibility
              });
            }
          }
        }
      }

      // Add bright core
      pixels.push({
        x: 0,
        y: 0,
        brightness: 0.8, // Brighter core for visibility
        core: true
      });

      this.distantGalaxies.push({
        x: galaxyX,
        y: galaxyY,
        type: galaxyType,
        pixels: pixels,
        color: rng.next() > 0.7 ? '#ffeecc' : '#eeeeff', // Slightly warm or cool
        rotation: rng.next() * Math.PI * 2,
        parallaxFactor: parallaxFactor // Add parallax movement
      });
    }
  }

  /**
   * Generate animated meteors streaking across space
   */
  generateMeteors(rng, systemRadius) {
    const meteorCount = rng.int(3, 8); // Reduced from 10-25
    for (let i = 0; i < meteorCount; i++) {
      const angle = rng.next() * Math.PI * 2;
      const speed = rng.range(200, 600);
      const meteorSize = rng.int(3, 8); // Smaller

      // Reduced trail pixels
      const trailPixels = [];
      for (let p = 0; p < meteorSize * 3; p++) { // Reduced from *5
        trailPixels.push({
          offset: p * 2,
          size: Math.max(1, meteorSize - Math.floor(p / 5)),
          alpha: 1 - (p / (meteorSize * 5))
        });
      }

      this.meteors.push({
        x: rng.next() * systemRadius * 2 - systemRadius,
        y: rng.next() * systemRadius * 2 - systemRadius,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: meteorSize,
        color: rng.next() > 0.5 ? '#8a6a4a' : '#6a4a3a',
        glowColor: '#ffaa66',
        trailPixels: trailPixels,
        lifespan: rng.range(5, 15),
        age: rng.next() * 10
      });
    }
  }

  /**
   * Generate floating debris (rocks, ice chunks)
   */
  generateFloatingDebris(rng, systemRadius) {
    const debrisCount = rng.int(15, 30); // Reduced from 30-60
    for (let i = 0; i < debrisCount; i++) {
      const angle = rng.next() * Math.PI * 2;
      const distance = rng.next() * systemRadius;
      const debrisSize = rng.int(2, 8);

      // Pre-generate pixelated debris shape
      const debrisPixels = [];
      for (let px = 0; px < debrisSize; px++) {
        for (let py = 0; py < debrisSize; py++) {
          if (rng.next() > 0.3) {
            debrisPixels.push({
              x: px - debrisSize / 2,
              y: py - debrisSize / 2,
              color: rng.next() > 0.7 ? '#3a3a3a' : '#2a2a2a'
            });
          }
        }
      }

      this.floatingDebris.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        vx: rng.range(-20, 20),
        vy: rng.range(-20, 20),
        rotation: rng.next() * Math.PI * 2,
        rotationSpeed: rng.range(-0.02, 0.02),
        size: debrisSize,
        pixels: debrisPixels
      });
    }
  }

  /**
   * Generate electrical storm effects (lightning between particles)
   */
  generateElectricalStorms(rng, systemRadius) {
    const stormCount = rng.int(2, 5); // Reduced from 5-12
    for (let i = 0; i < stormCount; i++) {
      const angle = rng.next() * Math.PI * 2;
      const distance = rng.next() * systemRadius * 0.6;

      this.electricalStorms.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        radius: rng.range(2000, 5000),
        intensity: rng.range(0.15, 0.4), // Much darker and more subtle
        frequency: rng.range(0.5, 2.0),
        phase: rng.next() * Math.PI * 2,
        color: rng.next() > 0.5 ? '#1a2255' : '#2a1a44', // Much darker blue/purple
        boltCount: rng.int(3, 8)
      });
    }
  }

  /**
   * Generate animated plasma clouds (pulsing energy fields)
   */
  generatePlasmaClouds(rng, systemRadius) {
    const cloudCount = rng.int(4, 8); // Reduced from 8-16
    for (let i = 0; i < cloudCount; i++) {
      const angle = rng.next() * Math.PI * 2;
      const distance = rng.next() * systemRadius * 0.7;
      const cloudSize = rng.range(1500, 4000);

      // Reduced plasma particles
      const plasmaPixels = [];
      for (let p = 0; p < 60; p++) { // Reduced from 200
        const pAngle = rng.next() * Math.PI * 2;
        const pDist = rng.next() * cloudSize;
        plasmaPixels.push({
          angle: pAngle,
          dist: pDist,
          phase: rng.next() * Math.PI * 2,
          speed: rng.range(0.5, 2.0)
        });
      }

      // VERY DARK plasma cloud colors
      const colors = ['#150a1a', '#1a0f20', '#0f1520', '#0a101a'];
      this.plasmaClouds.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: cloudSize,
        color: colors[Math.floor(rng.next() * colors.length)],
        glowColor: '#2a1a44', // Much darker glow
        pulseSpeed: rng.range(0.3, 1.0),
        pulsePhase: rng.next() * Math.PI * 2,
        pixels: plasmaPixels,
        driftSpeed: rng.range(5, 15),
        driftAngle: rng.next() * Math.PI * 2
      });
    }
  }

  /**
   * Generate quantum fluctuation effects (reality warping visuals)
   */
  generateQuantumFluctuations(rng, systemRadius) {
    const fluctuationCount = rng.int(6, 12); // Reduced from 15-30
    for (let i = 0; i < fluctuationCount; i++) {
      const angle = rng.next() * Math.PI * 2;
      const distance = rng.next() * systemRadius;

      // Reduced quantum particles
      const quantumPixels = [];
      for (let p = 0; p < 20; p++) { // Reduced from 50
        quantumPixels.push({
          angle: rng.next() * Math.PI * 2,
          dist: rng.range(50, 300),
          phase: rng.next() * Math.PI * 2,
          speed: rng.range(2.0, 5.0),
          size: rng.int(1, 3)
        });
      }

      this.quantumFluctuations.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        radius: rng.range(200, 600),
        waveSpeed: rng.range(1.0, 3.0),
        wavePhase: rng.next() * Math.PI * 2,
        color: rng.next() > 0.5 ? '#0f1a20' : '#150a20', // Much darker quantum colors
        pixels: quantumPixels
      });
    }
  }

  /**
   * Update environment (drift, twinkle, etc.)
   */
  update(dt, time) {
    // Update dust cloud positions and rotations
    for (const cloud of this.dustClouds) {
      cloud.x += cloud.driftVx * dt * 60;
      cloud.y += cloud.driftVy * dt * 60;
      cloud.rotation += cloud.rotationSpeed * dt * 60;
    }

    // Update cosmic particle positions
    for (const particle of this.cosmicParticles) {
      particle.x += particle.driftVx * dt * 60;
      particle.y += particle.driftVy * dt * 60;
    }

    // Update meteors
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const meteor = this.meteors[i];
      meteor.x += meteor.vx * dt;
      meteor.y += meteor.vy * dt;
      meteor.age += dt;

      // Respawn meteor when it expires
      if (meteor.age > meteor.lifespan) {
        meteor.age = 0;
        const angle = Math.random() * Math.PI * 2;
        meteor.x = Math.cos(angle) * 50000;
        meteor.y = Math.sin(angle) * 50000;
      }
    }

    // Update floating debris
    for (const debris of this.floatingDebris) {
      debris.x += debris.vx * dt;
      debris.y += debris.vy * dt;
      debris.rotation += debris.rotationSpeed;
    }

    // Update plasma clouds
    for (const cloud of this.plasmaClouds) {
      cloud.x += Math.cos(cloud.driftAngle) * cloud.driftSpeed * dt;
      cloud.y += Math.sin(cloud.driftAngle) * cloud.driftSpeed * dt;
    }
  }

  /**
   * Render all space environment layers
   */
  render(ctx, camera, time, starPosition) {
    if (!this.initialized) return;

    ctx.save();

    // Calculate star glow data for distance-based coloring
    const starGlow = this.calculateStarGlow(camera, starPosition);

    // 1. Render distant stars (with parallax for movement)
    this.renderDistantStars(ctx, time, starGlow, camera);

    // 1b. FIX: Render star clusters (concentrated groups of stars) with parallax
    this.renderStarClusters(ctx, time, starGlow, camera);

    // 1c. FIX: Render distant galaxies (tiny spiral/elliptical galaxies) with parallax
    this.renderDistantGalaxies(ctx, starGlow, camera);

    // DISABLED: Nebula layers removed per user request
    // this.renderNebulaLayers(ctx, camera, time, starGlow);

    // DISABLED: Plasma clouds (colored backgrounds removed - too bright)
    // this.renderPlasmaClouds(ctx, camera, time, starGlow);

    // DISABLED: Electrical storms (colored backgrounds removed)
    // this.renderElectricalStorms(ctx, camera, time, starGlow);

    // 5. Render dust clouds
    this.renderDustClouds(ctx, camera, time, starGlow);

    // 6. Render quantum fluctuations (reality warping)
    this.renderQuantumFluctuations(ctx, camera, time, starGlow);

    // 7. Render floating debris (rocks and ice)
    this.renderFloatingDebris(ctx, camera, time, starGlow);

    // 8. Render cosmic particles
    this.renderCosmicParticles(ctx, camera, time, starGlow);

    // 9. Render meteors (streaking trails)
    this.renderMeteors(ctx, camera, time, starGlow);

    // DISABLED: Star glow gradient overlay (pure black background only)
    // this.renderStarGlowOverlay(ctx, camera, starGlow);

    ctx.restore();
  }

  /**
   * Calculate star glow based on distance from star
   * Returns color tint and intensity based on proximity to star
   */
  calculateStarGlow(camera, starPosition) {
    if (!starPosition) {
      return { distance: Infinity, glowIntensity: 0, glowColor: '#000000' };
    }

    // Calculate distance from camera center to star
    const dx = camera.x - starPosition.x;
    const dy = camera.y - starPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Glow intensity based on distance (max glow within 20000 units, fades by 100000)
    const maxGlowDist = 20000;
    const fadeEndDist = 100000;

    let glowIntensity = 0;
    if (distance < maxGlowDist) {
      glowIntensity = 1.0;
    } else if (distance < fadeEndDist) {
      glowIntensity = 1.0 - ((distance - maxGlowDist) / (fadeEndDist - maxGlowDist));
    }

    // Yellowish-orange glow color near star
    const glowColor = '#ffaa44';

    return { distance, glowIntensity, glowColor };
  }

  /**
   * Apply ordered dithering pattern to create heavily pixelated appearance
   * This makes gradients look like thousands of tiny pixels without actually rendering them all
   */
  applyDitheringPattern(ctx, x, y, width, height, baseColor, intensity) {
    // 4x4 Bayer matrix for ordered dithering
    const bayerMatrix = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];

    // Apply dithering pattern to create pixelated appearance
    for (let py = 0; py < height; py += 4) {
      for (let px = 0; px < width; px += 4) {
        const threshold = bayerMatrix[py % 4][px % 4] / 16;
        if (intensity > threshold) {
          const alpha = Math.floor((intensity - threshold) * 255).toString(16).padStart(2, '0');
          ctx.fillStyle = baseColor + alpha;
          ctx.fillRect(Math.floor(x + px), Math.floor(y + py), 1, 1);
        }
      }
    }
  }

  /**
   * DISABLED: Render star glow gradient overlay - now pure black background only
   */
  renderStarGlowOverlay(ctx, camera, starGlow) {
    // NO OVERLAY - keep background pure black
    // All background effects are disabled to maintain dark black space
    return;
  }

  /**
   * Render distant background stars
   * ENHANCED: THOUSANDS of heavily pixelated stars with parallax movement
   */
  renderDistantStars(ctx, time, starGlow, camera) {
    for (const star of this.distantStars) {
      // Apply parallax based on camera position and star layer
      // Stars move slower than the camera to create depth
      const parallaxX = camera.x * star.parallaxFactor;
      const parallaxY = camera.y * star.parallaxFactor;

      // Calculate screen position: world position - parallax offset, centered on screen
      let screenX = star.worldX - parallaxX + camera.width / 2;
      let screenY = star.worldY - parallaxY + camera.height / 2;

      // Wrap around screen edges for infinite scrolling effect
      // ZOOM FIX: Scale wrap dimensions by zoom to prevent border rectangles when zooming out
      const zoom = camera.zoom || 1.0;
      const wrapWidth = (camera.width / zoom) * 2;
      const wrapHeight = (camera.height / zoom) * 2;
      screenX = ((screenX % wrapWidth) + wrapWidth) % wrapWidth;
      screenY = ((screenY % wrapHeight) + wrapHeight) % wrapHeight;

      // Only render if on screen
      if (screenX < 0 || screenX > camera.width || screenY < 0 || screenY > camera.height) {
        continue;
      }

      const finalX = Math.floor(screenX);
      const finalY = Math.floor(screenY);

      // Twinkle effect
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
      const alpha = star.brightness * twinkle;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = star.color;

      if (star.size === 2) {
        // 2x2 pixel star with subtle cross glow for bright ones
        ctx.fillRect(finalX, finalY, 2, 2);
        if (alpha > 0.7) {
          ctx.globalAlpha = alpha * 0.4;
          ctx.fillRect(finalX - 1, finalY, 1, 2);
          ctx.fillRect(finalX + 2, finalY, 1, 2);
          ctx.fillRect(finalX, finalY - 1, 2, 1);
          ctx.fillRect(finalX, finalY + 2, 2, 1);
        }
      } else {
        // 1x1 pixel star
        ctx.fillRect(finalX, finalY, 1, 1);
        // Very bright 1px stars get a tiny cross
        if (alpha > 0.85) {
          ctx.globalAlpha = alpha * 0.3;
          ctx.fillRect(finalX - 1, finalY, 1, 1);
          ctx.fillRect(finalX + 1, finalY, 1, 1);
          ctx.fillRect(finalX, finalY - 1, 1, 1);
          ctx.fillRect(finalX, finalY + 1, 1, 1);
        }
      }
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * FIX: Render star clusters (concentrated groups of stars) with parallax
   */
  renderStarClusters(ctx, time, starGlow, camera) {
    for (const cluster of this.starClusters) {
      // Apply parallax to cluster position - clusters move slower for depth
      const parallaxX = camera.x * cluster.parallaxFactor;
      const parallaxY = camera.y * cluster.parallaxFactor;

      const clusterScreenX = cluster.x - parallaxX + camera.width / 2;
      const clusterScreenY = cluster.y - parallaxY + camera.height / 2;

      // Skip cluster if it's completely off-screen
      const clusterRadius = 250; // Max cluster radius
      if (clusterScreenX < -clusterRadius || clusterScreenX > camera.width + clusterRadius ||
          clusterScreenY < -clusterRadius || clusterScreenY > camera.height + clusterRadius) {
        continue;
      }

      const clusterTwinkle = Math.sin(time * cluster.twinkleSpeed + cluster.twinklePhase) * 0.3 + 0.7;

      for (const star of cluster.stars) {
        const starX = Math.floor(clusterScreenX + star.offsetX);
        const starY = Math.floor(clusterScreenY + star.offsetY);

        // Skip if star is off screen
        if (starX < -5 || starX > camera.width + 5 || starY < -5 || starY > camera.height + 5) {
          continue;
        }

        const alpha = star.brightness * clusterTwinkle;
        ctx.globalAlpha = alpha;

        // Slight color variation
        const colorShift = star.colorVariation;
        const r = Math.max(0, Math.min(255, parseInt(cluster.baseColor.slice(1, 3), 16) + colorShift));
        const g = Math.max(0, Math.min(255, parseInt(cluster.baseColor.slice(3, 5), 16) + colorShift));
        const b = Math.max(0, Math.min(255, parseInt(cluster.baseColor.slice(5, 7), 16) + colorShift));
        ctx.fillStyle = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

        ctx.fillRect(starX, starY, star.size, star.size);

        // Bright stars get a tiny cross glow
        if (alpha > 0.7 && star.size >= 2) {
          ctx.globalAlpha = alpha * 0.4;
          ctx.fillRect(starX - 1, starY, 1, star.size);
          ctx.fillRect(starX + star.size, starY, 1, star.size);
          ctx.fillRect(starX, starY - 1, star.size, 1);
          ctx.fillRect(starX, starY + star.size, star.size, 1);
        }
      }
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * FIX: Render distant galaxies (tiny heavily pixelated shapes) with parallax
   */
  renderDistantGalaxies(ctx, starGlow, camera) {
    for (const galaxy of this.distantGalaxies) {
      // Apply parallax to galaxy position - galaxies are very far so move very slowly
      const parallaxX = camera.x * galaxy.parallaxFactor;
      const parallaxY = camera.y * galaxy.parallaxFactor;

      const galaxyScreenX = galaxy.x - parallaxX + camera.width / 2;
      const galaxyScreenY = galaxy.y - parallaxY + camera.height / 2;

      // Skip galaxy if it's completely off-screen
      const galaxySize = 60; // Max galaxy size
      if (galaxyScreenX < -galaxySize || galaxyScreenX > camera.width + galaxySize ||
          galaxyScreenY < -galaxySize || galaxyScreenY > camera.height + galaxySize) {
        continue;
      }

      ctx.save();
      ctx.translate(galaxyScreenX, galaxyScreenY);
      ctx.rotate(galaxy.rotation);

      // Render each pixel of the galaxy
      for (const pixel of galaxy.pixels) {
        const alpha = pixel.brightness;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = galaxy.color;

        const px = Math.floor(pixel.x);
        const py = Math.floor(pixel.y);

        // 2x2 pixel for heavily pixelated look
        ctx.fillRect(px, py, 2, 2);

        // Bright core gets extra glow
        if (pixel.core) {
          ctx.globalAlpha = alpha * 0.6;
          ctx.fillRect(px - 2, py - 2, 6, 6);
        }
      }

      ctx.restore();
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Render nebula layers with parallax
   * ENHANCED: Heavily pixelated with thousands of tiny particles
   */
  renderNebulaLayers(ctx, camera, time, starGlow) {
    for (const layer of this.nebulaLayers) {
      for (const patch of layer.patches) {
        // Apply parallax based on layer depth
        const parallax = layer.parallaxFactor;
        const screenX = (patch.x - camera.x * parallax) + camera.width / 2;
        const screenY = (patch.y - camera.y * parallax) + camera.height / 2;

        // Apply drift over time
        const driftX = Math.cos(patch.driftAngle) * time * patch.driftSpeed;
        const driftY = Math.sin(patch.driftAngle) * time * patch.driftSpeed;

        // Create nebula cloud with radial gradient
        const gradient = ctx.createRadialGradient(
          screenX + driftX, screenY + driftY, 0,
          screenX + driftX, screenY + driftY, patch.radius
        );

        gradient.addColorStop(0, patch.color + Math.floor(patch.opacity * 255 * 2).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5, patch.color + Math.floor(patch.opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, patch.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX + driftX, screenY + driftY, patch.radius, 0, Math.PI * 2);
        ctx.fill();

        // ENHANCED: Add heavily pixelated particle detail to nebula (OPTIMIZED - using cached particles)
        if (patch.cachedPixels) {
          for (const pixel of patch.cachedPixels) {
            const px = screenX + driftX + Math.cos(pixel.angle) * pixel.dist;
            const py = screenY + driftY + Math.sin(pixel.angle) * pixel.dist;

            // Pixelated noise pattern using pre-calculated intensity
            const noiseIntensity = (1 - (pixel.dist / patch.radius)) * patch.opacity * pixel.intensity;
            const pixelAlpha = Math.floor(noiseIntensity * 255 * 1.5).toString(16).padStart(2, '0');

            ctx.fillStyle = patch.color + pixelAlpha;
            ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
          }
        }

        // Add dithering pattern overlay to make it look MORE pixelated
        // Sample a grid of points and apply ordered dithering
        const ditherSize = Math.floor(patch.radius / 40); // Sample ~40x40 grid
        for (let dy = -patch.radius; dy < patch.radius; dy += ditherSize) {
          for (let dx = -patch.radius; dx < patch.radius; dx += ditherSize) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < patch.radius) {
              const intensity = (1 - dist / patch.radius) * patch.opacity * 0.3;
              const px = Math.floor(screenX + driftX + dx);
              const py = Math.floor(screenY + driftY + dy);

              // Apply Bayer dithering
              const bayerThreshold = [
                [0, 8, 2, 10],
                [12, 4, 14, 6],
                [3, 11, 1, 9],
                [15, 7, 13, 5]
              ][Math.abs(py) % 4][Math.abs(px) % 4] / 16;

              if (intensity > bayerThreshold) {
                const alpha = Math.floor((intensity - bayerThreshold) * 255).toString(16).padStart(2, '0');
                ctx.fillStyle = patch.color + alpha;
                ctx.fillRect(px, py, 1, 1);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Render dust clouds
   * ENHANCED: Heavily pixelated with detailed particle structure
   */
  renderDustClouds(ctx, camera, time, starGlow) {
    for (const cloud of this.dustClouds) {
      const screenX = (cloud.x - camera.x) + camera.width / 2;
      const screenY = (cloud.y - camera.y) + camera.height / 2;

      // Only render if on screen
      if (screenX < -cloud.radius || screenX > camera.width + cloud.radius ||
          screenY < -cloud.radius || screenY > camera.height + cloud.radius) {
        continue;
      }

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(cloud.rotation);

      // Create irregular dust cloud shape
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, cloud.radius);
      gradient.addColorStop(0, cloud.color + Math.floor(cloud.density * 255).toString(16).padStart(2, '0'));
      gradient.addColorStop(0.6, cloud.color + Math.floor(cloud.density * 255 * 0.5).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, cloud.color + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, cloud.radius, 0, Math.PI * 2);
      ctx.fill();

      // ENHANCED: Add pixelated particle detail (OPTIMIZED - using cached particles)
      if (cloud.cachedDustPixels) {
        for (const pixel of cloud.cachedDustPixels) {
          const px = Math.cos(pixel.angle) * pixel.dist;
          const py = Math.sin(pixel.angle) * pixel.dist;

          const pixelDensity = (1 - (pixel.dist / cloud.radius)) * cloud.density;
          const pixelAlpha = Math.floor(pixelDensity * 255 * pixel.intensity).toString(16).padStart(2, '0');

          ctx.fillStyle = cloud.color + pixelAlpha;
          ctx.fillRect(Math.floor(px), Math.floor(py), pixel.size, pixel.size);
        }
      }

      ctx.restore();
    }
  }

  /**
   * Render cosmic particles
   * ENHANCED: THOUSANDS of heavily pixelated tiny particles
   */
  renderCosmicParticles(ctx, camera, time, starGlow) {
    for (const particle of this.cosmicParticles) {
      const screenX = (particle.x - camera.x) + camera.width / 2;
      const screenY = (particle.y - camera.y) + camera.height / 2;

      // Only render if on screen
      if (screenX < 0 || screenX > camera.width || screenY < 0 || screenY > camera.height) {
        continue;
      }

      // Twinkle effect
      const twinkle = Math.sin(time * particle.twinkleSpeed + particle.twinklePhase) * 0.4 + 0.6;
      const alpha = particle.brightness * twinkle;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;

      // Heavily pixelated rendering with slight glow
      const pixelX = Math.floor(screenX);
      const pixelY = Math.floor(screenY);
      const pixelSize = Math.floor(particle.size);

      ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);

      // Add subtle cross-shaped glow for brighter particles
      if (alpha > 0.7 && pixelSize >= 2) {
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillRect(pixelX - 1, pixelY, 1, pixelSize);
        ctx.fillRect(pixelX + pixelSize, pixelY, 1, pixelSize);
        ctx.fillRect(pixelX, pixelY - 1, pixelSize, 1);
        ctx.fillRect(pixelX, pixelY + pixelSize, pixelSize, 1);
      }
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Render animated meteors with pixelated trails
   */
  renderMeteors(ctx, camera, time, starGlow) {
    for (const meteor of this.meteors) {
      const screenX = (meteor.x - camera.x) + camera.width / 2;
      const screenY = (meteor.y - camera.y) + camera.height / 2;

      // Skip if off screen
      if (screenX < -100 || screenX > camera.width + 100 ||
          screenY < -100 || screenY > camera.height + 100) continue;

      // Render heavily pixelated trail
      for (const trail of meteor.trailPixels) {
        const trailX = screenX - (meteor.vx / Math.abs(meteor.vx)) * trail.offset;
        const trailY = screenY - (meteor.vy / Math.abs(meteor.vy)) * trail.offset;

        ctx.globalAlpha = trail.alpha * 0.8;
        ctx.fillStyle = meteor.color;
        ctx.fillRect(Math.floor(trailX), Math.floor(trailY), trail.size, trail.size);

        // Trail glow
        if (trail.alpha > 0.5) {
          ctx.fillStyle = meteor.glowColor;
          ctx.globalAlpha = trail.alpha * 0.4;
          ctx.fillRect(Math.floor(trailX - 1), Math.floor(trailY - 1), trail.size + 2, trail.size + 2);
        }
      }

      // Render meteor core
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = meteor.glowColor;
      ctx.fillRect(Math.floor(screenX - meteor.size/2), Math.floor(screenY - meteor.size/2), meteor.size, meteor.size);
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Render floating debris with rotation
   */
  renderFloatingDebris(ctx, camera, time, starGlow) {
    for (const debris of this.floatingDebris) {
      const screenX = (debris.x - camera.x) + camera.width / 2;
      const screenY = (debris.y - camera.y) + camera.height / 2;

      // Skip if off screen
      if (screenX < -50 || screenX > camera.width + 50 ||
          screenY < -50 || screenY > camera.height + 50) continue;

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(debris.rotation);

      // Render heavily pixelated debris shape
      for (const pixel of debris.pixels) {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(Math.floor(pixel.x), Math.floor(pixel.y), 1, 1);
      }

      ctx.restore();
    }
  }

  /**
   * Render electrical storms with animated lightning
   */
  renderElectricalStorms(ctx, camera, time, starGlow) {
    for (const storm of this.electricalStorms) {
      const screenX = (storm.x - camera.x) + camera.width / 2;
      const screenY = (storm.y - camera.y) + camera.height / 2;

      // Storm field glow
      const stormPulse = Math.sin(time * storm.frequency + storm.phase) * 0.5 + 0.5;
      const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, storm.radius);
      gradient.addColorStop(0, storm.color + Math.floor(storm.intensity * stormPulse * 60).toString(16).padStart(2, '0'));
      gradient.addColorStop(0.5, storm.color + Math.floor(storm.intensity * stormPulse * 30).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, storm.color + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, storm.radius, 0, Math.PI * 2);
      ctx.fill();

      // Lightning bolts (pixelated)
      if (stormPulse > 0.7) {
        for (let b = 0; b < storm.boltCount; b++) {
          const boltAngle = (b / storm.boltCount) * Math.PI * 2 + time * 0.5;
          const boltLength = storm.radius * 0.8;

          ctx.strokeStyle = storm.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = (stormPulse - 0.7) * 3;

          ctx.beginPath();
          let lastX = screenX;
          let lastY = screenY;

          for (let seg = 0; seg < 8; seg++) {
            const progress = seg / 8;
            const jitter = (Math.sin(time * 10 + seg + b) - 0.5) * 20;
            const x = screenX + Math.cos(boltAngle) * boltLength * progress + jitter;
            const y = screenY + Math.sin(boltAngle) * boltLength * progress + jitter;

            ctx.moveTo(Math.floor(lastX), Math.floor(lastY));
            ctx.lineTo(Math.floor(x), Math.floor(y));
            lastX = x;
            lastY = y;
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
      }
    }
  }

  /**
   * Render pulsing plasma clouds with heavy pixelation
   */
  renderPlasmaClouds(ctx, camera, time, starGlow) {
    for (const cloud of this.plasmaClouds) {
      const screenX = (cloud.x - camera.x) + camera.width / 2;
      const screenY = (cloud.y - camera.y) + camera.height / 2;

      const pulse = Math.sin(time * cloud.pulseSpeed + cloud.pulsePhase) * 0.4 + 0.6;

      // Render heavily pixelated plasma particles
      for (const pixel of cloud.pixels) {
        const pixelPulse = Math.sin(time * pixel.speed + pixel.phase) * 0.5 + 0.5;
        const px = screenX + Math.cos(pixel.angle) * pixel.dist * pulse;
        const py = screenY + Math.sin(pixel.angle) * pixel.dist * pulse;

        const alpha = Math.floor(pixelPulse * pulse * 200).toString(16).padStart(2, '0');
        ctx.fillStyle = cloud.color + alpha;
        ctx.fillRect(Math.floor(px), Math.floor(py), 2, 2);

        // Glow for bright pixels
        if (pixelPulse > 0.7) {
          ctx.fillStyle = cloud.glowColor + Math.floor(pixelPulse * pulse * 100).toString(16).padStart(2, '0');
          ctx.fillRect(Math.floor(px - 1), Math.floor(py - 1), 3, 3);
        }
      }
    }
  }

  /**
   * Render quantum fluctuations (reality warping effects)
   */
  renderQuantumFluctuations(ctx, camera, time, starGlow) {
    for (const flux of this.quantumFluctuations) {
      const screenX = (flux.x - camera.x) + camera.width / 2;
      const screenY = (flux.y - camera.y) + camera.height / 2;

      const wave = Math.sin(time * flux.waveSpeed + flux.wavePhase) * 0.5 + 0.5;

      // Render heavily pixelated quantum particles
      for (const pixel of flux.pixels) {
        const pixelWave = Math.sin(time * pixel.speed + pixel.phase);
        const warpFactor = wave * 1.5;

        const px = screenX + Math.cos(pixel.angle + pixelWave) * pixel.dist * warpFactor;
        const py = screenY + Math.sin(pixel.angle + pixelWave) * pixel.dist * warpFactor;

        const alpha = Math.floor((Math.abs(pixelWave) * 0.5 + 0.5) * wave * 180).toString(16).padStart(2, '0');
        ctx.fillStyle = flux.color + alpha;
        ctx.fillRect(Math.floor(px), Math.floor(py), pixel.size, pixel.size);
      }

      // Quantum ring
      ctx.strokeStyle = flux.color + Math.floor(wave * 100).toString(16).padStart(2, '0');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, screenY, flux.radius * wave, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * Reset environment (for new system)
   */
  reset() {
    this.nebulaLayers = [];
    this.dustClouds = [];
    this.cosmicParticles = [];
    this.distantStars = [];
    this.meteors = [];
    this.floatingDebris = [];
    this.electricalStorms = [];
    this.plasmaClouds = [];
    this.quantumFluctuations = [];
    this.initialized = false;
  }
}
