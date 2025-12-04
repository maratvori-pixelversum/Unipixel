/**
 * ObjectSpriteGenerator - Sprites for asteroids, comets, stations
 *
 * Generates high-detail pixelated sprites with:
 * - Asteroids (rocky, metallic, icy)
 * - Comets (with glowing nuclei)
 * - Space stations (various types)
 * - Smooth alpha-blended edges (NO visible borders!)
 * - Realistic textures with hundreds of pixels
 */

import { PixelArtGenerator } from './PixelArtGenerator.js';
import { SpriteSheetGenerator } from './SpriteSheetGenerator.js';

export class ObjectSpriteGenerator {
  constructor() {
    this.pixelArtGen = new PixelArtGenerator();
    this.sheetGen = new SpriteSheetGenerator();
  }

  /**
   * Generate asteroid sprite
   * Asteroids are irregular, rocky, with craters
   */
  async generateAsteroidSprite(config) {
    const {
      type = 'rocky', // rocky, metallic, icy
      radius = 20,
      pixelSize = 2,
      seed = Math.random() * 10000,
      irregularity = 0.3 // How irregular the shape is
    } = config;


    this.pixelArtGen.noiseSeed = seed;

    // Get colors based on asteroid type
    const colors = this.getAsteroidColors(type);

    // Generate 30-frame rotation (asteroids are smaller, need fewer frames)
    const frames = await this.sheetGen.generateRotationFrames(
      async (frameOptions) => {
        return this.generateAsteroidFrame(radius, pixelSize, colors, irregularity, frameOptions, seed);
      },
      { frameCount: 30 }
    );

    const sheetName = `asteroid_${type}_${seed}`;
    const spriteSheet = await this.sheetGen.packSpriteSheet(frames, sheetName);


    return spriteSheet;
  }

  /**
   * Get asteroid colors by type
   */
  getAsteroidColors(type) {
    switch (type) {
      case 'rocky':
        return {
          base: ['#5a5a5a', '#6a6a6a', '#7a7a7a', '#8a8a8a'],
          dark: ['#3a3a3a', '#4a4a4a'],
          highlights: ['#9a9a9a', '#aaaaaa']
        };
      case 'metallic':
        return {
          base: ['#7a7a8a', '#8a8a9a', '#9a9aaa', '#aaaabb'],
          dark: ['#4a4a5a', '#5a5a6a'],
          highlights: ['#babbcc', '#ccddee']
        };
      case 'icy':
        return {
          base: ['#aaccee', '#bbddff', '#cceeff', '#ddeeff'],
          dark: ['#88aacc', '#99bbdd'],
          highlights: ['#eeffff', '#ffffff']
        };
      // Scientific asteroid classification types
      case 'C-type': // Carbonaceous (dark, carbon-rich)
        return {
          base: ['#3a3a3a', '#444444', '#4e4e4e', '#585858'],
          dark: ['#2a2a2a', '#333333'],
          highlights: ['#626262', '#6c6c6c']
        };
      case 'S-type': // Silicate (stony, gray-brown)
        return {
          base: ['#7a7766', '#888877', '#969688', '#a4a499'],
          dark: ['#5a5544', '#666655'],
          highlights: ['#b2b2aa', '#c0c0bb']
        };
      case 'M-type': // Metallic (bright, metal-rich)
        return {
          base: ['#9a9a9a', '#aaaaaa', '#bababa', '#cacaca'],
          dark: ['#7a7a7a', '#8a8a8a'],
          highlights: ['#dadada', '#eeeeee']
        };
      default:
        return this.getAsteroidColors('rocky');
    }
  }

  /**
   * Generate asteroid frame with irregular shape
   */
  generateAsteroidFrame(radius, pixelSize, colors, irregularity, frameOptions, seed) {
    const { rotation = 0 } = frameOptions;

    const canvas = this.pixelArtGen.createPixelatedTexture(
      radius * 2.5, // Extra space for irregular edges
      radius * 2.5,
      pixelSize,
      (u, v, px, py, options) => {
        const centerX = 0.5;
        const centerY = 0.5;
        const dx = u - centerX;
        const dy = v - centerY;

        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) + rotation;

        // Create irregular radius using noise
        const noiseValue = this.pixelArtGen.octaveNoise(
          Math.cos(angle) * 5 + seed,
          Math.sin(angle) * 5 + seed,
          3, 0.5
        );
        const irregularRadius = (0.5 / radius) * (1 + (noiseValue - 0.5) * irregularity);

        if (dist > irregularRadius) {
          return null; // Outside asteroid
        }

        // Calculate edge distance for smooth alpha blending
        const edgeDist = irregularRadius - dist;

        // Choose color based on noise (creates surface variation)
        const surfaceNoise = this.pixelArtGen.octaveNoise(px * 0.3, py * 0.3, 4, 0.5);

        let color;
        if (surfaceNoise < 0.3) {
          // Dark areas (shadows/craters)
          const colorIndex = Math.floor(surfaceNoise / 0.3 * colors.dark.length);
          color = this.pixelArtGen.hexToRgb(colors.dark[Math.min(colorIndex, colors.dark.length - 1)]);
        } else if (surfaceNoise > 0.7) {
          // Highlights
          const colorIndex = Math.floor((surfaceNoise - 0.7) / 0.3 * colors.highlights.length);
          color = this.pixelArtGen.hexToRgb(colors.highlights[Math.min(colorIndex, colors.highlights.length - 1)]);
        } else {
          // Base rock
          const colorIndex = Math.floor((surfaceNoise - 0.3) / 0.4 * colors.base.length);
          color = this.pixelArtGen.hexToRgb(colors.base[Math.min(colorIndex, colors.base.length - 1)]);
        }

        // Apply 3D lighting
        const lightAngle = Math.PI * 0.75;
        color = this.pixelArtGen.applyLighting(color, lightAngle, angle, 0.9);

        // Add more surface detail
        color = this.pixelArtGen.addSurfaceNoise(color, px, py, 0.8, 0.25);

        // CRITICAL: Smooth alpha blend at edges
        if (edgeDist < 0.05 / radius) {
          const edgeAlpha = (edgeDist / (0.05 / radius));
          color.a = Math.floor(color.a * edgeAlpha);
        }

        return color;
      },
      { rotation }
    );

    return canvas;
  }

  /**
   * Generate comet sprite (static nucleus, tail will be drawn separately)
   */
  async generateCometSprite(config) {
    const {
      radius = 15,
      pixelSize = 2,
      seed = Math.random() * 10000
    } = config;


    this.pixelArtGen.noiseSeed = seed;

    // Comet colors (icy with bright core)
    const colors = {
      ice: ['#cceeff', '#ddeeff', '#eeffff', '#ffffff'],
      bright: ['#ffffff', '#ffffee', '#ffffdd'],
      dark: ['#99ccee', '#aaddee']
    };

    // Generate 20-frame animation (pulsing glow)
    const frames = await this.sheetGen.generateRotationFrames(
      async (frameOptions) => {
        const { frameIndex, frameCount } = frameOptions;
        // Pulsing effect
        const pulse = Math.sin((frameIndex / frameCount) * Math.PI * 2) * 0.15 + 1.0;
        return this.generateCometFrame(radius * pulse, pixelSize, colors, frameOptions);
      },
      { frameCount: 20 }
    );

    const sheetName = `comet_${seed}`;
    const spriteSheet = await this.sheetGen.packSpriteSheet(frames, sheetName);


    return spriteSheet;
  }

  /**
   * Generate comet nucleus frame
   */
  generateCometFrame(radius, pixelSize, colors, frameOptions) {
    const { rotation = 0 } = frameOptions;

    const canvas = this.pixelArtGen.createPixelatedTexture(
      radius * 3, // Extra space for glow
      radius * 3,
      pixelSize,
      (u, v, px, py, options) => {
        const centerX = 0.5;
        const centerY = 0.5;
        const dx = u - centerX;
        const dy = v - centerY;

        const dist = Math.sqrt(dx * dx + dy * dy) / (radius / (radius * 3));

        if (dist > 1.5) {
          return null; // Outside glow
        }

        let color;

        if (dist < 0.3) {
          // Bright core
          color = this.pixelArtGen.hexToRgb(colors.bright[0]);
        } else if (dist < 0.6) {
          // Icy surface
          const colorIndex = Math.floor((dist - 0.3) / 0.3 * colors.ice.length);
          color = this.pixelArtGen.hexToRgb(colors.ice[Math.min(colorIndex, colors.ice.length - 1)]);
        } else {
          // Glow
          const glowStrength = 1 - ((dist - 0.6) / 0.9);
          color = this.pixelArtGen.hexToRgb(colors.ice[0]);
          color.a = Math.floor(color.a * glowStrength * 0.5);
        }

        // Add sparkle texture to icy parts
        if (dist >= 0.3 && dist < 0.6) {
          color = this.pixelArtGen.addSurfaceNoise(color, px, py, 0.8, 0.3);
        }

        // Smooth edge falloff
        if (dist > 1.3) {
          const edgeFalloff = (1.5 - dist) / 0.2;
          color.a = Math.floor(color.a * edgeFalloff);
        }

        return color;
      },
      { rotation }
    );

    return canvas;
  }

  /**
   * Generate space station sprite
   * MASSIVELY ENHANCED: Huge, complex stations with thousands of pixels
   */
  async generateStationSprite(config) {
    const {
      type = 'mining', // mining, trading, military, research
      size = 200,      // ULTRA-ENHANCED: 3x larger (was 60, now 200) for MASSIVE detail
      pixelSize = 2,   // ENHANCED: Heavier pixelation (was 1, now 2) for retro aesthetic
      seed = Math.random() * 10000
    } = config;


    this.pixelArtGen.noiseSeed = seed;

    // Station colors by type
    const colors = this.getStationColors(type);

    // Generate 60-frame rotation
    const frames = await this.sheetGen.generateRotationFrames(
      async (frameOptions) => {
        return this.generateStationFrame(type, size, pixelSize, colors, frameOptions);
      },
      { frameCount: 60 }
    );

    const sheetName = `station_${type}_${seed}`;
    const spriteSheet = await this.sheetGen.packSpriteSheet(frames, sheetName);


    return spriteSheet;
  }

  /**
   * Get station colors by type
   */
  getStationColors(type) {
    switch (type) {
      case 'mining':
        return {
          structure: ['#665544', '#776655', '#887766'],
          panels: ['#444444', '#555555', '#666666'],
          lights: ['#ffaa44', '#ffcc66'],
          dark: ['#332211', '#443322']
        };
      case 'trading':
        return {
          structure: ['#556677', '#667788', '#778899'],
          panels: ['#444455', '#555566', '#666677'],
          lights: ['#44ff44', '#66ff66'],
          dark: ['#222233', '#333344']
        };
      case 'military':
        return {
          structure: ['#3a3a45', '#4a4a55', '#5a5a66'],
          panels: ['#2a2a35', '#3a3a45', '#4a4a55'],
          lights: ['#ff4444', '#ff6666'],
          dark: ['#1a1a22', '#2a2a33']
        };
      case 'research':
        return {
          structure: ['#445566', '#556677', '#667788'],
          panels: ['#334455', '#445566', '#556677'],
          lights: ['#4466ff', '#6688ff'],
          dark: ['#223344', '#334455']
        };
      default:
        return this.getStationColors('trading');
    }
  }

  /**
   * Generate station frame - MASSIVELY complex with hundreds of details
   * ULTRA-ENHANCED: Massive industrial space station with thousands of tiny pixels
   */
  generateStationFrame(type, size, pixelSize, colors, frameOptions) {
    const { rotation = 0 } = frameOptions;

    const canvas = this.pixelArtGen.createPixelatedTexture(
      size,
      size,
      pixelSize,
      (u, v, px, py, options) => {
        const centerX = 0.5;
        const centerY = 0.5;
        const dx = u - centerX;
        const dy = v - centerY;

        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) + rotation;

        // ===== MAIN HABITAT RING =====
        const ringOuter = 0.42;
        const ringInner = 0.28;

        // ===== CENTRAL HUB (COMMAND CENTER) =====
        if (dist < 0.18) {
          // Command sphere with windows
          let color = this.pixelArtGen.hexToRgb(colors.structure[1]);

          // 3D sphere shading
          const sphereDepth = 1 - (dist / 0.18);
          color.r = Math.floor(color.r * (0.6 + sphereDepth * 0.4));
          color.g = Math.floor(color.g * (0.6 + sphereDepth * 0.4));
          color.b = Math.floor(color.b * (0.6 + sphereDepth * 0.4));

          // Observation windows (8 around sphere)
          const windowAngle = Math.floor(angle / (Math.PI / 4)) * (Math.PI / 4);
          const windowCheck = Math.abs(angle - windowAngle);
          if (windowCheck < 0.15 && dist > 0.12 && dist < 0.16) {
            color = this.pixelArtGen.hexToRgb(colors.lights[0]);
            color.a = Math.floor(color.a * 0.8);
          }

          // Panel lines on hub
          if ((px % 8 === 0) || (py % 8 === 0)) {
            color.r = Math.max(0, color.r - 20);
            color.g = Math.max(0, color.g - 20);
            color.b = Math.max(0, color.b - 20);
          }

          color = this.pixelArtGen.addSurfaceNoise(color, px, py, 0.6, 0.15);

          // Smooth edge
          if (dist > 0.16) {
            const edgeAlpha = (0.18 - dist) / 0.02;
            color.a = Math.floor(color.a * edgeAlpha);
          }

          return color;
        }

        // ===== CONNECTING STRUTS (SPOKE STRUCTURES) =====
        const strutAngle = Math.floor(angle / (Math.PI / 4)) * (Math.PI / 4);
        const strutCheck = Math.abs(angle - strutAngle);

        if (strutCheck < 0.06 && dist > 0.18 && dist < ringInner - 0.02) {
          let color = this.pixelArtGen.hexToRgb(colors.panels[0]);

          // 3D strut depth
          const strutPos = (dist - 0.18) / (ringInner - 0.18);
          const strutDepth = Math.sin(strutPos * Math.PI);
          color.r = Math.floor(color.r * (0.7 + strutDepth * 0.3));
          color.g = Math.floor(color.g * (0.7 + strutDepth * 0.3));
          color.b = Math.floor(color.b * (0.7 + strutDepth * 0.3));

          // Truss pattern
          if ((px % 6 < 2) || (py % 6 < 2)) {
            color.r = Math.max(0, color.r - 25);
            color.g = Math.max(0, color.g - 25);
            color.b = Math.max(0, color.b - 25);
          }

          return color;
        }

        // ===== MAIN HABITAT RING =====
        if (dist >= ringInner && dist <= ringOuter) {
          const ringPos = (dist - ringInner) / (ringOuter - ringInner);

          // Segmented sections (12 sections)
          const sectionIndex = Math.floor(angle / (Math.PI / 6));
          const sectionAngle = (angle % (Math.PI / 6)) / (Math.PI / 6);

          let color;

          // Alternating section types
          if (sectionIndex % 2 === 0) {
            // Habitation modules
            color = this.pixelArtGen.hexToRgb(colors.structure[Math.floor(ringPos * 2)]);

            // Window rows (3 rows per section)
            const windowRow = Math.floor(ringPos * 3);
            if (sectionAngle > 0.2 && sectionAngle < 0.8 &&
                Math.abs(ringPos - (windowRow + 0.5) / 3) < 0.08) {
              // Viewport lights
              if (((px + py) % 4) < 2) {
                color = this.pixelArtGen.hexToRgb(colors.lights[0]);
                color.a = Math.floor(color.a * 0.7);
              }
            }
          } else {
            // Industrial/cargo sections
            color = this.pixelArtGen.hexToRgb(colors.panels[Math.floor(ringPos * 2)]);

            // Vent grilles
            if (ringPos > 0.3 && ringPos < 0.7 && sectionAngle > 0.3 && sectionAngle < 0.7) {
              if ((px % 3 === 0)) {
                color.r = Math.max(0, color.r - 30);
                color.g = Math.max(0, color.g - 30);
                color.b = Math.max(0, color.b - 30);
              }
            }
          }

          // 3D ring depth shading
          const ringDepth = Math.abs(ringPos - 0.5) * 2;
          color.r = Math.floor(color.r * (0.8 + (1 - ringDepth) * 0.2));
          color.g = Math.floor(color.g * (0.8 + (1 - ringDepth) * 0.2));
          color.b = Math.floor(color.b * (0.8 + (1 - ringDepth) * 0.2));

          // Panel lines (vertical and horizontal)
          if ((px % 12 === 0) || (py % 12 === 0)) {
            color.r = Math.max(0, color.r - 25);
            color.g = Math.max(0, color.g - 25);
            color.b = Math.max(0, color.b - 25);
          }

          // Rivets at panel intersections
          if ((px % 12 === 1) && (py % 12 === 1)) {
            color.r = Math.min(255, color.r + 15);
            color.g = Math.min(255, color.g + 15);
            color.b = Math.min(255, color.b + 15);
          }

          // Surface texture
          color = this.pixelArtGen.addSurfaceNoise(color, px, py, 0.7, 0.12);

          // Smooth edges
          const innerEdge = dist - ringInner;
          const outerEdge = ringOuter - dist;
          const edgeDist = Math.min(innerEdge, outerEdge);
          if (edgeDist < 0.02) {
            color.a = Math.floor(color.a * (edgeDist / 0.02));
          }

          return color;
        }

        // ===== DOCKING BAYS (8 LARGE BAYS) =====
        const dockingAngle = Math.floor(angle / (Math.PI / 4)) * (Math.PI / 4);
        const dockingCheck = Math.abs(angle - dockingAngle);

        if (dockingCheck < 0.12 && dist > ringOuter && dist < ringOuter + 0.15) {
          let color = this.pixelArtGen.hexToRgb(colors.dark[0]);

          // Bay depth - darker inside
          const bayDepth = (dist - ringOuter) / 0.15;
          color.r = Math.floor(color.r * (1 - bayDepth * 0.5));
          color.g = Math.floor(color.g * (1 - bayDepth * 0.5));
          color.b = Math.floor(color.b * (1 - bayDepth * 0.5));

          // Docking lights (blue/green)
          if (bayDepth > 0.3 && bayDepth < 0.5 && dockingCheck < 0.08) {
            if ((px % 8) < 3) {
              color = this.pixelArtGen.hexToRgb(colors.lights[0]);
              color.a = Math.floor(color.a * 0.9);
            }
          }

          // Bay structure lines
          if ((px % 6 === 0)) {
            color.r = Math.max(0, color.r - 20);
            color.g = Math.max(0, color.g - 20);
            color.b = Math.max(0, color.b - 20);
          }

          // Smooth edge
          const edgeDist = ringOuter + 0.15 - dist;
          if (edgeDist < 0.03) {
            color.a = Math.floor(color.a * (edgeDist / 0.03));
          }

          return color;
        }

        // ===== SOLAR PANEL ARRAYS (4 LARGE ARRAYS) =====
        const solarAngle = Math.floor(angle / (Math.PI / 2)) * (Math.PI / 2) + Math.PI / 4;
        const solarCheck = Math.abs(angle - solarAngle);

        if (solarCheck < 0.08 && dist > ringOuter + 0.05 && dist < ringOuter + 0.25) {
          let color = this.pixelArtGen.hexToRgb('#2244aa'); // Blue solar panels

          // Panel grid pattern
          const panelX = Math.floor(px / 4) % 2;
          const panelY = Math.floor(py / 4) % 2;

          if (panelX === 0 || panelY === 0) {
            // Frame/grid - dark
            color = this.pixelArtGen.hexToRgb(colors.dark[1]);
          } else {
            // Solar cell - reflective
            const cellDepth = ((px % 4) + (py % 4)) / 8;
            color.r = Math.floor(color.r * (0.8 + cellDepth * 0.4));
            color.g = Math.floor(color.g * (0.8 + cellDepth * 0.4));
            color.b = Math.floor(color.b * (0.8 + cellDepth * 0.4));
          }

          // 3D panel orientation depth
          const panelDist = (dist - (ringOuter + 0.05)) / 0.2;
          const angle3D = Math.sin(panelDist * Math.PI);
          color.r = Math.floor(color.r * (0.6 + angle3D * 0.4));
          color.g = Math.floor(color.g * (0.6 + angle3D * 0.4));
          color.b = Math.floor(color.b * (0.6 + angle3D * 0.4));

          // Smooth edge
          const edgeDist = Math.min(solarCheck / 0.08, (ringOuter + 0.25 - dist) / 0.03);
          color.a = Math.floor(color.a * Math.min(1, edgeDist * 3));

          return color;
        }

        // ===== COMMUNICATION ANTENNAS (12 SMALL ANTENNAS) =====
        const antennaAngle = Math.floor(angle / (Math.PI / 6)) * (Math.PI / 6);
        const antennaCheck = Math.abs(angle - antennaAngle);

        if (antennaCheck < 0.04 && dist > ringOuter + 0.15 && dist < ringOuter + 0.28) {
          let color = this.pixelArtGen.hexToRgb(colors.panels[1]);

          // Thin antenna structure
          if (antennaCheck < 0.02) {
            // Antenna mast
            const antDepth = (dist - (ringOuter + 0.15)) / 0.13;
            color.r = Math.floor(color.r * (0.9 - antDepth * 0.3));
            color.g = Math.floor(color.g * (0.9 - antDepth * 0.3));
            color.b = Math.floor(color.b * (0.9 - antDepth * 0.3));

            // Antenna dish at top
            if (dist > ringOuter + 0.25) {
              color = this.pixelArtGen.hexToRgb(colors.structure[0]);
            }

            return color;
          }
        }

        // ===== DEFENSIVE TURRETS (Military stations - 6 turrets) =====
        if (type === 'military') {
          const turretAngle = Math.floor(angle / (Math.PI / 3)) * (Math.PI / 3);
          const turretCheck = Math.abs(angle - turretAngle);

          if (turretCheck < 0.08 && dist > ringOuter - 0.08 && dist < ringOuter + 0.08) {
            let color = this.pixelArtGen.hexToRgb(colors.panels[2]);

            // Turret barrel
            if (turretCheck < 0.03 && dist > ringOuter) {
              color = this.pixelArtGen.hexToRgb(colors.dark[0]);
            } else {
              // Turret housing - 3D rounded
              const turretDist = Math.sqrt(turretCheck * turretCheck + (dist - ringOuter) * (dist - ringOuter)) / 0.08;
              color.r = Math.floor(color.r * (1.2 - turretDist * 0.4));
              color.g = Math.floor(color.g * (1.2 - turretDist * 0.4));
              color.b = Math.floor(color.b * (1.2 - turretDist * 0.4));
            }

            return color;
          }
        }

        // ===== MINING EQUIPMENT (Mining stations - 4 mining arms) =====
        if (type === 'mining') {
          const miningAngle = Math.floor(angle / (Math.PI / 2)) * (Math.PI / 2);
          const miningCheck = Math.abs(angle - miningAngle);

          if (miningCheck < 0.06 && dist > ringOuter - 0.05 && dist < ringOuter + 0.18) {
            let color = this.pixelArtGen.hexToRgb('#aa7744'); // Industrial brown

            // Mining arm segments
            const armSegment = Math.floor((dist - ringOuter) / 0.06);
            const segmentPos = ((dist - ringOuter) % 0.06) / 0.06;

            // Darker at joints
            if (segmentPos < 0.2 || segmentPos > 0.8) {
              color.r = Math.max(0, color.r - 30);
              color.g = Math.max(0, color.g - 30);
              color.b = Math.max(0, color.b - 30);
            }

            // Mining drill at end
            if (dist > ringOuter + 0.14) {
              color = this.pixelArtGen.hexToRgb(colors.dark[1]);
            }

            return color;
          }
        }

        // ===== RESEARCH LABS (Research stations - glowing observation domes) =====
        if (type === 'research') {
          const labAngle = Math.floor(angle / (Math.PI / 3)) * (Math.PI / 3);
          const labCheck = Math.abs(angle - labAngle);

          if (labCheck < 0.1 && dist > ringOuter + 0.02 && dist < ringOuter + 0.14) {
            // Observation dome
            const domeDist = Math.sqrt((labCheck / 0.1) ** 2 + ((dist - (ringOuter + 0.08)) / 0.06) ** 2);

            if (domeDist < 1) {
              let color = this.pixelArtGen.hexToRgb(colors.lights[0]);
              // Semi-transparent dome
              color.a = Math.floor(color.a * (0.3 + (1 - domeDist) * 0.5));

              // Dome frame structure
              if ((px % 5 === 0) || (py % 5 === 0)) {
                color = this.pixelArtGen.hexToRgb(colors.structure[1]);
                color.a = 200;
              }

              return color;
            }
          }
        }

        return null; // Transparent (space)
      },
      { rotation }
    );

    return canvas;
  }

  /**
   * Get sprite sheet generator
   */
  getSpriteSheetGenerator() {
    return this.sheetGen;
  }
}
