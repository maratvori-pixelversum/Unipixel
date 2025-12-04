/**
 * ShipSpriteGenerator - High-detail pixelated ship sprites
 *
 * Generates detailed ship sprites with:
 * - Multiple ship classes (fighter, frigate, cruiser, etc.)
 * - Hundreds of pixels for detail
 * - 3D depth with shadows and lighting
 * - Engine glow effects
 * - Smooth alpha-blended edges (NO visible borders!)
 * - 60-frame rotation animations
 */

import { PixelArtGenerator } from './PixelArtGenerator.js';
import { SpriteSheetGenerator } from './SpriteSheetGenerator.js';

export class ShipSpriteGenerator {
  constructor() {
    this.pixelArtGen = new PixelArtGenerator();
    this.sheetGen = new SpriteSheetGenerator();

    // Ship color palettes with LOTS of shades for detail
    this.shipPalettes = this.defineShipPalettes();
  }

  /**
   * Define detailed color palettes for ships
   * Using many colors for realistic metallic appearance
   */
  defineShipPalettes() {
    return {
      // Standard military hull (grays with blue tint)
      military: {
        hull: ['#3a3a45', '#4a4a55', '#5a5a66', '#6a6a77', '#7a7a88'],
        accent: ['#2244aa', '#3355bb', '#4466cc', '#5577dd'],
        dark: ['#1a1a22', '#2a2a33', '#3a3a44'],
        lights: ['#4488ff', '#66aaff', '#88ccff'],
        engine: ['#ff6622', '#ff8844', '#ffaa66', '#ffcc88']
      },

      // Civilian transport (neutral colors)
      civilian: {
        hull: ['#556655', '#667766', '#778877', '#889988'],
        accent: ['#cc8844', '#ddaa66', '#eecc88'],
        dark: ['#334433', '#445544', '#556655'],
        lights: ['#ffffff', '#ffffee', '#ffffdd'],
        engine: ['#6699ff', '#88bbff', '#aaddff']
      },

      // Pirate/Scavenger (rusty, worn)
      pirate: {
        hull: ['#664433', '#775544', '#886655', '#997766'],
        accent: ['#aa4422', '#bb5533', '#cc6644'],
        dark: ['#442211', '#553322', '#664433'],
        lights: ['#ff8844', '#ffaa66'],
        engine: ['#ffaa44', '#ffcc66', '#ffee88']
      },

      // Alien technology (organic/sleek)
      alien: {
        hull: ['#443355', '#554466', '#665577', '#776688'],
        accent: ['#8844aa', '#9955bb', '#aa66cc', '#bb77dd'],
        dark: ['#221133', '#332244', '#443355'],
        lights: ['#cc66ff', '#dd88ff', '#eeaaff'],
        engine: ['#aa44ff', '#cc66ff', '#ee88ff']
      },

      // Elite/Advanced (sleek, high-tech)
      elite: {
        hull: ['#223344', '#334455', '#445566', '#556677'],
        accent: ['#44aaff', '#55bbff', '#66ccff', '#77ddff'],
        dark: ['#111122', '#222233', '#333344'],
        lights: ['#00ffff', '#44ffff', '#88ffff'],
        engine: ['#00aaff', '#44ccff', '#88eeff']
      }
    };
  }

  /**
   * Generate ship sprite with smooth edges (NO borders!)
   */
  async generateShipSprite(config) {
    const {
      shipClass = 'fighter',
      palette = 'military',
      size = 480,       // ULTRA-MASSIVE++: 12x larger (was 40, now 480) for EXTREME detail - THOUSANDS of pixels
      pixelSize = 4,    // ULTRA-HEAVY++: Even MORE pixelation (was 1, now 4) for ultra-retro CHUNKY aesthetic
      seed = Math.random() * 10000
    } = config;


    this.pixelArtGen.noiseSeed = seed;
    const colors = this.shipPalettes[palette] || this.shipPalettes.military;

    // Generate 60-frame rotation animation
    const frames = await this.sheetGen.generateRotationFrames(
      async (frameOptions) => {
        return this.generateShipFrame(shipClass, colors, size, pixelSize, frameOptions);
      },
      { frameCount: 60 }
    );

    const sheetName = `ship_${shipClass}_${palette}_${seed}`;
    const spriteSheet = await this.sheetGen.packSpriteSheet(frames, sheetName);


    return spriteSheet;
  }

  /**
   * Generate single ship frame with detailed pixel art
   * IMPORTANT: Smooth alpha-blended edges to avoid visible borders!
   * ENHANCED: Heavy pixelation, complex textures, 3D depth
   */
  generateShipFrame(shipClass, colors, size, pixelSize, frameOptions) {
    const { rotation = 0 } = frameOptions;

    // Create ship using pixel art generator
    const canvas = this.pixelArtGen.createPixelatedTexture(
      size,
      size,
      pixelSize,
      (u, v, px, py, options) => {
        // Center coordinates
        const centerX = 0.5;
        const centerY = 0.5;
        const dx = (u - centerX) * 2; // -1 to 1
        const dy = (v - centerY) * 2; // -1 to 1

        // Distance from center
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Angle from center
        const angle = Math.atan2(dy, dx) + rotation;

        // Generate ship shape based on class
        const shipData = this.getShipShape(shipClass, dx, dy, dist, angle);

        if (!shipData) return null; // Transparent (outside ship)

        // Get base color for this part
        let color;
        if (shipData.part === 'hull') {
          const hullIndex = Math.floor(shipData.depth * colors.hull.length);
          color = this.pixelArtGen.hexToRgb(colors.hull[Math.min(hullIndex, colors.hull.length - 1)]);
        } else if (shipData.part === 'accent') {
          const accentIndex = Math.floor(shipData.depth * colors.accent.length);
          color = this.pixelArtGen.hexToRgb(colors.accent[Math.min(accentIndex, colors.accent.length - 1)]);
        } else if (shipData.part === 'engine') {
          const engineIndex = Math.floor(shipData.depth * colors.engine.length);
          color = this.pixelArtGen.hexToRgb(colors.engine[Math.min(engineIndex, colors.engine.length - 1)]);
        } else if (shipData.part === 'lights') {
          color = this.pixelArtGen.hexToRgb(colors.lights[0]);
        } else if (shipData.part === 'weapon') {
          color = this.pixelArtGen.hexToRgb('#666666');
        } else {
          color = this.pixelArtGen.hexToRgb(colors.dark[0]);
        }

        // ENHANCED: Multi-layer 3D lighting for depth
        const lightAngle = Math.PI * 0.75;
        color = this.pixelArtGen.applyLighting(color, lightAngle, angle, 0.9);

        // Additional rim lighting from opposite side
        const rimAngle = Math.PI * 0.25;
        const rimStrength = Math.max(0, Math.cos(angle - rimAngle)) * 0.15;
        color.r = Math.min(255, color.r + rimStrength * 60);
        color.g = Math.min(255, color.g + rimStrength * 60);
        color.b = Math.min(255, color.b + rimStrength * 60);

        // ENHANCED: Panel lines and surface details
        const panelX = Math.floor(px / 8) % 2;
        const panelY = Math.floor(py / 8) % 2;
        if (shipData.part === 'hull' && ((px % 8 === 0) || (py % 8 === 0))) {
          // Panel seams - darker lines
          color.r = Math.max(0, color.r - 30);
          color.g = Math.max(0, color.g - 30);
          color.b = Math.max(0, color.b - 30);
        }

        // ENHANCED: Rivets and bolts at panel corners
        if (shipData.part === 'hull' && (px % 8 === 1) && (py % 8 === 1)) {
          color.r = Math.min(255, color.r + 20);
          color.g = Math.min(255, color.g + 20);
          color.b = Math.min(255, color.b + 20);
        }

        // ENHANCED: Metallic surface texture
        const metallicNoise = (px * 7 + py * 13) % 11 / 11;
        color.r = Math.max(0, Math.min(255, color.r + (metallicNoise - 0.5) * 20));
        color.g = Math.max(0, Math.min(255, color.g + (metallicNoise - 0.5) * 20));
        color.b = Math.max(0, Math.min(255, color.b + (metallicNoise - 0.5) * 20));

        // Add surface detail
        color = this.pixelArtGen.addSurfaceNoise(color, px, py, 0.5, 0.12);

        // ENHANCED: Wear and tear effects
        if (shipData.part === 'hull' && (px * py) % 97 < 3) {
          // Scratches and damage
          color.r = Math.max(0, color.r - 40);
          color.g = Math.max(0, color.g - 40);
          color.b = Math.max(0, color.b - 40);
        }

        // CRITICAL: Smooth alpha blend at edges to avoid visible borders!
        if (shipData.edgeDist < 0.1) {
          // Fade out alpha at edges
          const edgeAlpha = shipData.edgeDist / 0.1;
          color.a = Math.floor(color.a * edgeAlpha);
        }

        return color;
      },
      { rotation }
    );

    return canvas;
  }

  /**
   * Define ship shapes (returns null if outside ship, data if inside)
   */
  getShipShape(shipClass, dx, dy, dist, angle) {
    switch (shipClass) {
      case 'fighter':
        return this.getFighterShape(dx, dy, dist, angle);
      case 'scout':
        return this.getScoutShape(dx, dy, dist, angle);
      case 'explorer':
        return this.getExplorerShape(dx, dy, dist, angle);
      case 'trader':
        return this.getTraderShape(dx, dy, dist, angle);
      case 'research':
        return this.getResearchShape(dx, dy, dist, angle);
      case 'military':
        return this.getMilitaryShape(dx, dy, dist, angle);
      case 'frigate':
        return this.getFrigateShape(dx, dy, dist, angle);
      case 'cruiser':
        return this.getCruiserShape(dx, dy, dist, angle);
      case 'transport':
        return this.getTransportShape(dx, dy, dist, angle);
      default:
        return this.getFighterShape(dx, dy, dist, angle);
    }
  }

  /**
   * Fighter ship shape (small, agile)
   * MASSIVELY ENHANCED++: ULTRA-LONG & THIN, More windows, wires, thrusters, antennas, viewports, vents
   */
  getFighterShape(dx, dy, dist, angle) {
    // ULTRA-ELONGATED forward-facing shape (MUCH LONGER, THINNER)
    const forward = Math.cos(angle);
    const side = Math.abs(Math.sin(angle));

    // Main body (ULTRA-ELONGATED ellipse - 3x longer, 60% thinner)
    const bodyDist = Math.sqrt((dx * dx) / 0.3 + (dy * dy) / 2.1);  // ENHANCED: Much longer/thinner

    if (bodyDist > 0.75) {  // Slightly larger to accommodate length
      // Outside ship
      return null;
    }

    // Calculate edge distance for alpha blending
    const edgeDist = 0.75 - bodyDist;

    // ===== DECORATIVE ELEMENTS =====

    // Communication antenna (top center)
    if (dy < -0.28 && dy > -0.38 && forward > 0.1 && forward < 0.3 && Math.abs(dx) < 0.04) {
      return {
        part: 'accent',
        depth: 0.95,
        edgeDist: 0.05
      };
    }

    // Sensor array (front top)
    if (dy < -0.22 && dy > -0.28 && forward > 0.4 && forward < 0.55 && Math.abs(dx) < 0.08) {
      return {
        part: 'lights',
        depth: 0.9,
        edgeDist: 0.06
      };
    }

    // ===== COCKPIT WINDOWS (Multiple rows for realism) =====

    // Front cockpit window
    if (forward > 0.45 && forward < 0.6 && Math.abs(dy) > 0.08 && Math.abs(dy) < 0.14 && Math.abs(dx) < 0.15) {
      return {
        part: 'lights',
        depth: 1.0,
        edgeDist: 0.08
      };
    }

    // Side cockpit windows (left and right)
    if (forward > 0.35 && forward < 0.5 && Math.abs(dy) > 0.15 && Math.abs(dy) < 0.21 && Math.abs(dx) > 0.05 && Math.abs(dx) < 0.12) {
      return {
        part: 'lights',
        depth: 0.95,
        edgeDist: 0.07
      };
    }

    // ===== HULL WINDOWS (Small porthole-style along the sides) =====

    // Port/starboard windows (series along mid-section)
    const windowSpacing = 0.15;
    const windowPosY = forward;
    if (windowPosY > -0.3 && windowPosY < 0.3 && Math.abs(dx) > 0.18 && Math.abs(dx) < 0.25) {
      const windowIndex = Math.floor((windowPosY + 0.3) / windowSpacing);
      const windowOffset = (windowPosY + 0.3) % windowSpacing;
      if (windowOffset > 0.02 && windowOffset < 0.08 && Math.abs(dy) < 0.08) {
        return {
          part: 'lights',
          depth: 0.85,
          edgeDist: 0.05
        };
      }
    }

    // ===== WIRING AND CONDUITS =====

    // Main power conduits (running along top of hull)
    if (dy < -0.20 && dy > -0.24 && forward > -0.4 && forward < 0.4 && Math.abs(dx) < 0.12) {
      const wirePattern = Math.floor((forward + 0.4) / 0.05) % 3;
      if (wirePattern === 0) {
        return {
          part: 'accent',
          depth: 0.85,
          edgeDist: 0.03
        };
      }
    }

    // Secondary conduits (along sides)
    if (Math.abs(dx) > 0.25 && Math.abs(dx) < 0.29 && forward > -0.3 && forward < 0.3 && Math.abs(dy) < 0.15) {
      const conduitPattern = Math.floor((forward + 0.3) / 0.08) % 2;
      if (conduitPattern === 1) {
        return {
          part: 'dark',
          depth: 0.6,
          edgeDist: 0.03
        };
      }
    }

    // Access panels (mid-section sides)
    if (forward > -0.2 && forward < 0.1 && Math.abs(dy) > 0.18 && Math.abs(dy) < 0.24 && Math.abs(dx) < 0.25) {
      return {
        part: 'dark',
        depth: 0.5,
        edgeDist: 0.06
      };
    }

    // ===== SIDE GAS THRUSTERS (RCS) - ENHANCED WITH NOZZLES =====

    // Top RCS thrusters (4 small thrusters with visible nozzles)
    if (dy < -0.32 && dy > -0.38 &&
        ((forward > 0.25 && forward < 0.35) || (forward > -0.15 && forward < -0.05)) &&
        Math.abs(dx) > 0.12 && Math.abs(dx) < 0.18) {
      // Inner nozzle (dark)
      if (dy < -0.34 && Math.abs(dx) > 0.14 && Math.abs(dx) < 0.16) {
        return {
          part: 'engine',
          depth: 0.9,
          edgeDist: 0.03
        };
      }
      // Outer housing
      return {
        part: 'weapon',
        depth: 0.7,
        edgeDist: 0.04
      };
    }

    // Bottom RCS thrusters (4 small thrusters with visible nozzles)
    if (dy > 0.32 && dy < 0.38 &&
        ((forward > 0.25 && forward < 0.35) || (forward > -0.15 && forward < -0.05)) &&
        Math.abs(dx) > 0.12 && Math.abs(dx) < 0.18) {
      // Inner nozzle (dark)
      if (dy > 0.34 && Math.abs(dx) > 0.14 && Math.abs(dx) < 0.16) {
        return {
          part: 'engine',
          depth: 0.9,
          edgeDist: 0.03
        };
      }
      // Outer housing
      return {
        part: 'weapon',
        depth: 0.7,
        edgeDist: 0.04
      };
    }

    // Side RCS thrusters (left/right with nozzles)
    if (Math.abs(dx) > 0.58 && Math.abs(dx) < 0.64 &&
        ((forward > 0.15 && forward < 0.25) || (forward > -0.25 && forward < -0.15))) {
      // Inner nozzle (dark)
      if (Math.abs(dx) > 0.60 && Math.abs(dx) < 0.62) {
        return {
          part: 'engine',
          depth: 0.9,
          edgeDist: 0.03
        };
      }
      // Outer housing
      return {
        part: 'weapon',
        depth: 0.7,
        edgeDist: 0.04
      };
    }

    // ===== ADDITIONAL MICRO-THRUSTERS (for fine control) =====

    // Nose micro-thrusters (top and bottom of nose)
    if (forward > 0.55 && forward < 0.65 && ((dy < -0.25 && dy > -0.30) || (dy > 0.25 && dy < 0.30)) && Math.abs(dx) < 0.08) {
      return {
        part: 'dark',
        depth: 0.8,
        edgeDist: 0.03
      };
    }

    // ===== WEAPON HARDPOINTS =====

    // Wing-mounted weapon hardpoints
    if (Math.abs(dx) > 0.42 && Math.abs(dx) < 0.52 && Math.abs(dy) > 0.15 && Math.abs(dy) < 0.25) {
      return {
        part: 'weapon',
        depth: 0.8,
        edgeDist: 0.1
      };
    }

    // Missile pods (under-wing)
    if (Math.abs(dx) > 0.35 && Math.abs(dx) < 0.42 && Math.abs(dy) > 0.26 && Math.abs(dy) < 0.32) {
      return {
        part: 'dark',
        depth: 0.75,
        edgeDist: 0.06
      };
    }

    // ===== VENTS AND HEAT SINKS =====

    // Heat vents (side)
    if (forward > -0.3 && forward < 0 && Math.abs(dy) > 0.12 && Math.abs(dy) < 0.16 && Math.abs(dx) < 0.3) {
      const ventPattern = Math.floor((forward + 0.3) / 0.08) % 2;
      if (ventPattern === 1) {
        return {
          part: 'dark',
          depth: 0.4,
          edgeDist: 0.04
        };
      }
    }

    // ===== MAIN STRUCTURE =====

    // Wings (side extensions with detail)
    if (side > 0.3 && Math.abs(dx) > 0.3 && Math.abs(dx) < 0.6 && Math.abs(dy) < 0.3) {
      return {
        part: 'hull',
        depth: 0.5 + Math.abs(dy) * 0.5,
        edgeDist: Math.min(edgeDist, 0.6 - Math.abs(dx))
      };
    }

    // Dual main engines (rear) - enhanced
    if (forward < -0.7 && (Math.abs(dy) < 0.12 || (Math.abs(dy) > 0.18 && Math.abs(dy) < 0.28))) {
      return {
        part: 'engine',
        depth: 1.0 - Math.abs(dy) * 2,
        edgeDist
      };
    }

    // Engine glow rings (around engines)
    if (forward < -0.65 && forward > -0.72 &&
        ((Math.abs(dy) > 0.08 && Math.abs(dy) < 0.14) || (Math.abs(dy) > 0.22 && Math.abs(dy) < 0.3))) {
      return {
        part: 'accent',
        depth: 0.9,
        edgeDist: 0.07
      };
    }

    // Main cockpit (front)
    if (forward > 0.6 && dist < 0.3) {
      return {
        part: 'lights',
        depth: 1.0,
        edgeDist: 0.3 - dist
      };
    }

    // Cockpit frame
    if (forward > 0.55 && forward < 0.65 && dist > 0.25 && dist < 0.32) {
      return {
        part: 'accent',
        depth: 0.95,
        edgeDist: 0.07
      };
    }

    // Main hull
    return {
      part: 'hull',
      depth: 0.5 + forward * 0.3,
      edgeDist
    };
  }

  /**
   * Frigate ship shape (medium, balanced)
   * MASSIVELY ENHANCED: 6 engines, RCS thrusters, sensor arrays, weapon batteries, viewports
   */
  getFrigateShape(dx, dy, dist, angle) {
    const forward = Math.cos(angle);

    // Larger, more rectangular body
    if (Math.abs(dx) > 0.8 || Math.abs(dy) > 0.6) {
      return null;
    }

    const edgeDist = Math.min(0.8 - Math.abs(dx), 0.6 - Math.abs(dy));

    // ===== DECORATIVE ELEMENTS =====

    // Main radar dish (top center)
    if (dy < -0.42 && dy > -0.52 && forward > 0 && forward < 0.2 && Math.abs(dx) < 0.12) {
      return {
        part: 'accent',
        depth: 0.95,
        edgeDist: 0.05
      };
    }

    // Communication antennas (multiple)
    if (dy < -0.35 && dy > -0.42 &&
        ((forward > 0.3 && forward < 0.4) || (forward > -0.1 && forward < 0)) &&
        Math.abs(dx) < 0.06) {
      return {
        part: 'accent',
        depth: 0.9,
        edgeDist: 0.04
      };
    }

    // Bridge viewports (front top - multiple windows)
    if (forward > 0.45 && forward < 0.65 && dy < -0.08 && dy > -0.2 && Math.abs(dx) < 0.2) {
      const windowPattern = Math.floor((forward - 0.45) / 0.08) % 2;
      if (windowPattern === 0) {
        return {
          part: 'lights',
          depth: 1.0,
          edgeDist: 0.08
        };
      }
    }

    // Side viewports (along hull - 8 windows per side)
    if (forward > -0.3 && forward < 0.3 && Math.abs(dy) > 0.22 && Math.abs(dy) < 0.28 && Math.abs(dx) < 0.6) {
      const portPattern = Math.floor((forward + 0.3) / 0.075) % 2;
      if (portPattern === 0) {
        return {
          part: 'lights',
          depth: 0.85,
          edgeDist: 0.06
        };
      }
    }

    // Docking ports (mid-section sides)
    if (forward > -0.1 && forward < 0.1 && Math.abs(dy) > 0.38 && Math.abs(dy) < 0.48 && Math.abs(dx) < 0.5) {
      return {
        part: 'dark',
        depth: 0.6,
        edgeDist: 0.1
      };
    }

    // Weapon batteries (side turrets)
    if (Math.abs(dx) > 0.62 && Math.abs(dx) < 0.74 &&
        ((forward > 0.15 && forward < 0.3) || (forward > -0.25 && forward < -0.1))) {
      return {
        part: 'weapon',
        depth: 0.85,
        edgeDist: 0.08
      };
    }

    // ===== SIDE GAS THRUSTERS (RCS) - 12 THRUSTERS =====

    // Top RCS array (6 thrusters)
    if (dy < -0.52 && dy > -0.58 &&
        ((forward > 0.35 && forward < 0.45) || (forward > 0.05 && forward < 0.15) ||
         (forward > -0.25 && forward < -0.15))) {
      return {
        part: 'weapon',
        depth: 0.75,
        edgeDist: 0.04
      };
    }

    // Bottom RCS array (6 thrusters)
    if (dy > 0.52 && dy < 0.58 &&
        ((forward > 0.35 && forward < 0.45) || (forward > 0.05 && forward < 0.15) ||
         (forward > -0.25 && forward < -0.15))) {
      return {
        part: 'weapon',
        depth: 0.75,
        edgeDist: 0.04
      };
    }

    // ===== MAIN ENGINES - 6 POWERFUL ENGINES =====

    // Main engine array (rear - 6 engines in 2 rows)
    if (forward < -0.55) {
      // Top row (3 engines)
      if ((Math.abs(dy) > 0.05 && Math.abs(dy) < 0.15) ||
          (Math.abs(dy) > 0.28 && Math.abs(dy) < 0.38) ||
          (Math.abs(dy) > 0.45 && Math.abs(dy) < 0.55)) {
        return {
          part: 'engine',
          depth: 1.0,
          edgeDist
        };
      }
    }

    // Engine glow casings
    if (forward < -0.5 && forward > -0.57) {
      if ((Math.abs(dy) > 0.02 && Math.abs(dy) < 0.18) ||
          (Math.abs(dy) > 0.25 && Math.abs(dy) < 0.41) ||
          (Math.abs(dy) > 0.42 && Math.abs(dy) < 0.58)) {
        return {
          part: 'accent',
          depth: 0.95,
          edgeDist: 0.07
        };
      }
    }

    // ===== HEAT VENTS =====

    // Heat vents (side panels)
    if (forward > -0.4 && forward < 0 && Math.abs(dy) > 0.32 && Math.abs(dy) < 0.36 && Math.abs(dx) < 0.7) {
      const ventPattern = Math.floor((forward + 0.4) / 0.06) % 3;
      if (ventPattern === 1) {
        return {
          part: 'dark',
          depth: 0.45,
          edgeDist: 0.04
        };
      }
    }

    // ===== MAIN STRUCTURE =====

    // Bridge/command tower
    if (forward > 0.4 && Math.abs(dy) < 0.25) {
      return {
        part: 'accent',
        depth: 0.8,
        edgeDist
      };
    }

    // Sensor arrays (front sides)
    if (forward > 0.3 && forward < 0.45 && Math.abs(dy) > 0.28 && Math.abs(dy) < 0.38) {
      return {
        part: 'accent',
        depth: 0.75,
        edgeDist: 0.1
      };
    }

    // Main hull
    return {
      part: 'hull',
      depth: 0.6 + forward * 0.2,
      edgeDist
    };
  }

  /**
   * Cruiser ship shape (large, imposing)
   * MASSIVELY ENHANCED: 8 massive engines, RCS arrays, weapon turrets, command tower, hangar bays
   */
  getCruiserShape(dx, dy, dist, angle) {
    const forward = Math.cos(angle);

    // Very large rectangular body
    if (Math.abs(dx) > 0.9 || Math.abs(dy) > 0.7) {
      return null;
    }

    const edgeDist = Math.min(0.9 - Math.abs(dx), 0.7 - Math.abs(dy));

    // ===== COMMAND TOWER AND BRIDGE =====

    // Main command tower (elevated center structure)
    if (forward > 0 && forward < 0.4 && dy < -0.25 && dy > -0.45 && Math.abs(dx) < 0.25) {
      return {
        part: 'accent',
        depth: 0.95,
        edgeDist
      };
    }

    // Bridge windows (command tower front)
    if (forward > 0.32 && forward < 0.42 && dy < -0.28 && dy > -0.38 && Math.abs(dx) < 0.2) {
      const bridgeWindowPattern = Math.floor((forward - 0.32) / 0.035) % 2;
      if (bridgeWindowPattern === 0) {
        return {
          part: 'lights',
          depth: 1.0,
          edgeDist: 0.1
        };
      }
    }

    // Observation deck (top of tower)
    if (forward > 0.15 && forward < 0.35 && dy < -0.38 && dy > -0.48 && Math.abs(dx) < 0.18) {
      return {
        part: 'lights',
        depth: 0.95,
        edgeDist: 0.08
      };
    }

    // ===== MASSIVE SENSOR ARRAYS =====

    // Large radar dish array (top center)
    if (dy < -0.52 && dy > -0.64 && forward > -0.15 && forward < 0.05 && Math.abs(dx) < 0.18) {
      return {
        part: 'accent',
        depth: 0.98,
        edgeDist: 0.06
      };
    }

    // Communication spires (multiple tall antennas)
    if (dy < -0.48 && dy > -0.56 &&
        ((forward > 0.25 && forward < 0.32) || (forward > -0.25 && forward < -0.18)) &&
        Math.abs(dx) < 0.08) {
      return {
        part: 'accent',
        depth: 0.92,
        edgeDist: 0.04
      };
    }

    // ===== WEAPON SYSTEMS =====

    // Main weapon turrets (top mounted - 4 turrets)
    if (dy < -0.35 && dy > -0.48 &&
        ((forward > 0.45 && forward < 0.58) || (forward > 0.05 && forward < 0.18) ||
         (forward > -0.35 && forward < -0.22) || (forward > -0.75 && forward < -0.62)) &&
        Math.abs(dx) < 0.22) {
      return {
        part: 'weapon',
        depth: 0.88,
        edgeDist: 0.1
      };
    }

    // Side weapon batteries (broadside cannons)
    if (Math.abs(dx) > 0.75 && Math.abs(dx) < 0.88 &&
        ((forward > 0.3 && forward < 0.45) || (forward > 0 && forward < 0.15) ||
         (forward > -0.3 && forward < -0.15) || (forward > -0.6 && forward < -0.45))) {
      return {
        part: 'weapon',
        depth: 0.82,
        edgeDist: 0.08
      };
    }

    // Point defense turrets (smaller, more numerous)
    if (Math.abs(dx) > 0.58 && Math.abs(dx) < 0.68 && Math.abs(dy) > 0.32 && Math.abs(dy) < 0.42 &&
        ((forward > 0.2 && forward < 0.3) || (forward > -0.2 && forward < -0.1))) {
      return {
        part: 'weapon',
        depth: 0.75,
        edgeDist: 0.06
      };
    }

    // ===== HANGAR BAYS AND DOCKING =====

    // Hangar bay doors (side - 4 large bays)
    if (Math.abs(dy) > 0.42 && Math.abs(dy) < 0.58 &&
        ((forward > 0.25 && forward < 0.4) || (forward > -0.05 && forward < 0.1) ||
         (forward > -0.35 && forward < -0.2) || (forward > -0.65 && forward < -0.5))) {
      return {
        part: 'dark',
        depth: 0.5,
        edgeDist: 0.12
      };
    }

    // Hangar bay lights (blue landing lights)
    if (Math.abs(dy) > 0.45 && Math.abs(dy) < 0.52 &&
        ((forward > 0.28 && forward < 0.37) || (forward > -0.02 && forward < 0.07) ||
         (forward > -0.32 && forward < -0.23) || (forward > -0.62 && forward < -0.53))) {
      return {
        part: 'lights',
        depth: 0.85,
        edgeDist: 0.08
      };
    }

    // ===== VIEWPORTS - HUNDREDS OF WINDOWS =====

    // Deck viewports (rows of windows along entire hull)
    if (forward > -0.5 && forward < 0.5 && Math.abs(dy) > 0.18 && Math.abs(dy) < 0.24 && Math.abs(dx) < 0.8) {
      const viewportPattern = Math.floor((forward + 0.5) / 0.05) % 2;
      if (viewportPattern === 0) {
        return {
          part: 'lights',
          depth: 0.78,
          edgeDist: 0.06
        };
      }
    }

    // Additional viewport rows (lower decks)
    if (forward > -0.4 && forward < 0.4 && Math.abs(dy) > 0.28 && Math.abs(dy) < 0.32 && Math.abs(dx) < 0.7) {
      const lowerViewportPattern = Math.floor((forward + 0.4) / 0.06) % 2;
      if (lowerViewportPattern === 0) {
        return {
          part: 'lights',
          depth: 0.72,
          edgeDist: 0.05
        };
      }
    }

    // ===== SIDE GAS THRUSTERS (RCS) - 16 MASSIVE THRUSTERS =====

    // Top RCS array (8 large maneuvering thrusters)
    if (dy < -0.62 && dy > -0.68 &&
        ((forward > 0.5 && forward < 0.6) || (forward > 0.25 && forward < 0.35) ||
         (forward > 0 && forward < 0.1) || (forward > -0.25 && forward < -0.15) ||
         (forward > -0.5 && forward < -0.4) || (forward > -0.75 && forward < -0.65))) {
      return {
        part: 'weapon',
        depth: 0.8,
        edgeDist: 0.04
      };
    }

    // Bottom RCS array (8 large maneuvering thrusters)
    if (dy > 0.62 && dy < 0.68 &&
        ((forward > 0.5 && forward < 0.6) || (forward > 0.25 && forward < 0.35) ||
         (forward > 0 && forward < 0.1) || (forward > -0.25 && forward < -0.15) ||
         (forward > -0.5 && forward < -0.4) || (forward > -0.75 && forward < -0.65))) {
      return {
        part: 'weapon',
        depth: 0.8,
        edgeDist: 0.04
      };
    }

    // ===== MAIN ENGINES - 8 MASSIVE CAPITAL SHIP ENGINES =====

    // Massive engine array (rear - 8 engines in dual rows)
    if (forward < -0.62) {
      // Top row (4 large engines)
      if ((Math.abs(dy) > 0.05 && Math.abs(dy) < 0.18) ||
          (Math.abs(dy) > 0.25 && Math.abs(dy) < 0.38) ||
          (Math.abs(dy) > 0.45 && Math.abs(dy) < 0.58) ||
          (Math.abs(dy) > 0.62 && Math.abs(dy) < 0.72)) {
        return {
          part: 'engine',
          depth: 1.0,
          edgeDist
        };
      }
    }

    // Engine glow housings (massive glowing rings)
    if (forward < -0.56 && forward > -0.64) {
      if ((Math.abs(dy) > 0.02 && Math.abs(dy) < 0.21) ||
          (Math.abs(dy) > 0.22 && Math.abs(dy) < 0.41) ||
          (Math.abs(dy) > 0.42 && Math.abs(dy) < 0.61) ||
          (Math.abs(dy) > 0.59 && Math.abs(dy) < 0.74)) {
        return {
          part: 'accent',
          depth: 0.98,
          edgeDist: 0.08
        };
      }
    }

    // Auxiliary engines (mid-section boost thrusters)
    if (forward > -0.45 && forward < -0.3 &&
        (Math.abs(dy) > 0.58 && Math.abs(dy) < 0.66)) {
      return {
        part: 'engine',
        depth: 0.75,
        edgeDist: 0.08
      };
    }

    // ===== HEAT MANAGEMENT =====

    // Heat radiator panels (large vented sections)
    if (forward > -0.5 && forward < -0.1 && Math.abs(dy) > 0.35 && Math.abs(dy) < 0.42 && Math.abs(dx) < 0.8) {
      const radiatorPattern = Math.floor((forward + 0.5) / 0.05) % 3;
      if (radiatorPattern === 1) {
        return {
          part: 'dark',
          depth: 0.42,
          edgeDist: 0.04
        };
      }
    }

    // Heat vents (along spine)
    if (forward > -0.3 && forward < 0.2 && Math.abs(dy) < 0.08 && Math.abs(dx) < 0.6) {
      const ventPattern = Math.floor((forward + 0.3) / 0.06) % 4;
      if (ventPattern === 2) {
        return {
          part: 'dark',
          depth: 0.38,
          edgeDist: 0.04
        };
      }
    }

    // ===== MAIN STRUCTURE =====

    // Armor plating detail (segmented hull sections)
    if (forward > -0.6 && forward < 0.5 && Math.abs(dy) > 0.12 && Math.abs(dy) < 0.18) {
      const armorPattern = Math.floor((forward + 0.6) / 0.15) % 2;
      if (armorPattern === 0) {
        return {
          part: 'dark',
          depth: 0.55,
          edgeDist
        };
      }
    }

    // Main hull (heavily armored)
    return {
      part: 'hull',
      depth: 0.5 + forward * 0.3,
      edgeDist
    };
  }

  /**
   * Transport ship shape (bulky, cargo-focused)
   */
  getTransportShape(dx, dy, dist, angle) {
    // Round, bulky shape
    const bodyDist = Math.sqrt((dx * dx) + (dy * dy) * 0.8);

    if (bodyDist > 0.9) {
      return null;
    }

    const edgeDist = 0.9 - bodyDist;

    return {
      part: 'hull',
      depth: 0.5 + (0.9 - bodyDist) * 0.5,
      edgeDist
    };
  }

  /**
   * Scout ship shape (very small, fast, sleek)
   * Features: Minimal profile, streamlined, single engine, small cockpit
   */
  getScoutShape(dx, dy, dist, angle) {
    const forward = Math.cos(angle);
    const side = Math.abs(Math.sin(angle));

    // Very compact, needle-like body
    const bodyDist = Math.sqrt((dx * dx) / 0.3 + (dy * dy) / 1.5);

    if (bodyDist > 0.6) {
      return null;
    }

    const edgeDist = 0.6 - bodyDist;

    // Small wings (swept back)
    if (side > 0.4 && forward < 0 && Math.abs(dx) > 0.2 && Math.abs(dx) < 0.45 && Math.abs(dy) < 0.25) {
      return {
        part: 'hull',
        depth: 0.4 + forward * 0.3,
        edgeDist: Math.min(edgeDist, 0.45 - Math.abs(dx))
      };
    }

    // Single small engine (rear)
    if (forward < -0.75 && Math.abs(dy) < 0.15) {
      return {
        part: 'engine',
        depth: 1.0,
        edgeDist
      };
    }

    // Cockpit (front - very prominent)
    if (forward > 0.65 && dist < 0.25) {
      return {
        part: 'lights',
        depth: 1.0,
        edgeDist: 0.25 - dist
      };
    }

    // Main hull - very sleek
    return {
      part: 'hull',
      depth: 0.6 + forward * 0.4,
      edgeDist
    };
  }

  /**
   * Explorer ship shape (medium, sensor arrays, balanced)
   * Features: Sensor dishes, wide profile, science equipment, moderate engines
   */
  getExplorerShape(dx, dy, dist, angle) {
    const forward = Math.cos(angle);
    const side = Math.abs(Math.sin(angle));

    // Wider, flatter body for sensor arrays
    const bodyDist = Math.sqrt((dx * dx) / 0.7 + (dy * dy) / 1.0);

    if (bodyDist > 0.75) {
      return null;
    }

    const edgeDist = 0.75 - bodyDist;

    // Wide sensor wings/arrays
    if (Math.abs(dy) > 0.25 && Math.abs(dy) < 0.65 && Math.abs(dx) < 0.5) {
      // Sensor array panels
      return {
        part: 'accent',
        depth: 0.7 - Math.abs(dy) * 0.3,
        edgeDist: Math.min(edgeDist, 0.65 - Math.abs(dy))
      };
    }

    // Dual engines (rear, symmetrical)
    if (forward < -0.6 && ((Math.abs(dy) > 0.1 && Math.abs(dy) < 0.3) || Math.abs(dy) < 0.08)) {
      return {
        part: 'engine',
        depth: 0.9,
        edgeDist
      };
    }

    // Bridge/sensor dome (front-center)
    if (forward > 0.5 && Math.abs(dy) < 0.3 && dist < 0.4) {
      return {
        part: 'accent',
        depth: 0.95,
        edgeDist: 0.4 - dist
      };
    }

    // Cockpit lights
    if (forward > 0.7 && Math.abs(dy) < 0.15) {
      return {
        part: 'lights',
        depth: 1.0,
        edgeDist
      };
    }

    // Main hull
    return {
      part: 'hull',
      depth: 0.5 + forward * 0.25,
      edgeDist
    };
  }

  /**
   * Trader ship shape (large cargo, bulky, reinforced)
   * Features: Cargo pods, thick hull, multiple small engines, utilitarian
   */
  getTraderShape(dx, dy, dist, angle) {
    const forward = Math.cos(angle);

    // Bulky rectangular body with cargo pods
    if (Math.abs(dx) > 0.85 || Math.abs(dy) > 0.65) {
      return null;
    }

    const edgeDist = Math.min(0.85 - Math.abs(dx), 0.65 - Math.abs(dy));

    // Cargo pods (side bulges)
    if (Math.abs(dy) > 0.45 && Math.abs(dy) < 0.62 && forward > -0.4 && forward < 0.3) {
      return {
        part: 'accent',
        depth: 0.6,
        edgeDist: 0.62 - Math.abs(dy)
      };
    }

    // Multiple small engines (rear array)
    if (forward < -0.55) {
      const enginePattern = Math.floor((dy + 0.65) / 0.25) % 2;
      if (enginePattern === 0 || Math.abs(dy) < 0.1) {
        return {
          part: 'engine',
          depth: 0.85,
          edgeDist
        };
      }
    }

    // Reinforced cockpit section
    if (forward > 0.5 && Math.abs(dy) < 0.35) {
      return {
        part: 'accent',
        depth: 0.8,
        edgeDist
      };
    }

    // Cockpit window
    if (forward > 0.65 && Math.abs(dy) < 0.2) {
      return {
        part: 'lights',
        depth: 1.0,
        edgeDist
      };
    }

    // Thick hull
    return {
      part: 'hull',
      depth: 0.6 + forward * 0.15,
      edgeDist
    };
  }

  /**
   * Research ship shape (specialized, lots of equipment, distinctive)
   * Features: Research modules, antenna arrays, lab sections, asymmetric
   */
  getResearchShape(dx, dy, dist, angle) {
    const forward = Math.cos(angle);
    const side = Math.sin(angle);

    // Modular, somewhat asymmetric body
    const bodyDist = Math.sqrt((dx * dx) / 0.65 + (dy * dy) / 0.9);

    if (bodyDist > 0.8) {
      return null;
    }

    const edgeDist = 0.8 - bodyDist;

    // Research antenna (top asymmetric)
    if (dy < -0.35 && dy > -0.6 && forward > -0.2 && forward < 0.4 && Math.abs(dx) < 0.15) {
      return {
        part: 'accent',
        depth: 0.9,
        edgeDist: Math.min(-0.35 - dy, dy - (-0.6))
      };
    }

    // Lab module (side extension - asymmetric)
    if (dy > 0.3 && dy < 0.55 && forward > -0.3 && forward < 0.2 && Math.abs(dx) < 0.3) {
      return {
        part: 'accent',
        depth: 0.75,
        edgeDist: Math.min(dy - 0.3, 0.55 - dy)
      };
    }

    // Sensor array lights
    if ((Math.abs(dy) > 0.35 && Math.abs(dy) < 0.45) && forward > 0.3 && forward < 0.5) {
      return {
        part: 'lights',
        depth: 1.0,
        edgeDist
      };
    }

    // Triple engines (rear)
    if (forward < -0.6) {
      if (Math.abs(dy) < 0.12 || (Math.abs(dy) > 0.25 && Math.abs(dy) < 0.4)) {
        return {
          part: 'engine',
          depth: 0.9,
          edgeDist
        };
      }
    }

    // Bridge/observation dome
    if (forward > 0.55 && Math.abs(dy) < 0.25) {
      return {
        part: 'lights',
        depth: 1.0,
        edgeDist
      };
    }

    // Main hull
    return {
      part: 'hull',
      depth: 0.55 + forward * 0.2,
      edgeDist
    };
  }

  /**
   * Military ship shape (heavily armed, armored, aggressive)
   * Features: Weapon hardpoints, thick armor, powerful engines, angular design
   */
  getMilitaryShape(dx, dy, dist, angle) {
    const forward = Math.cos(angle);
    const side = Math.abs(Math.sin(angle));

    // Angular, aggressive body
    const bodyDist = Math.sqrt((dx * dx) / 0.75 + (dy * dy) / 1.1);

    if (bodyDist > 0.8) {
      return null;
    }

    const edgeDist = 0.8 - bodyDist;

    // Weapon hardpoints (angular side extensions)
    if (side > 0.35 && Math.abs(dx) > 0.35 && Math.abs(dx) < 0.65 && forward > -0.2 && forward < 0.4) {
      // Angular weapon pods
      return {
        part: 'accent',
        depth: 0.8 - Math.abs(dx) * 0.2,
        edgeDist: Math.min(edgeDist, 0.65 - Math.abs(dx))
      };
    }

    // Armor plating detail (side armor)
    if (Math.abs(dy) > 0.2 && Math.abs(dy) < 0.45 && forward > -0.5 && forward < 0.3) {
      const armorPattern = Math.floor((forward + 0.5) / 0.15) % 2;
      if (armorPattern === 0) {
        return {
          part: 'dark',
          depth: 0.6,
          edgeDist
        };
      }
    }

    // Quad engines (rear - powerful)
    if (forward < -0.65) {
      if ((Math.abs(dy) > 0.15 && Math.abs(dy) < 0.35) || (Math.abs(dy) < 0.1)) {
        return {
          part: 'engine',
          depth: 1.0,
          edgeDist
        };
      }
    }

    // Auxiliary thrusters (mid-section)
    if (forward > -0.4 && forward < -0.1 && (Math.abs(dy) > 0.48 && Math.abs(dy) < 0.58)) {
      return {
        part: 'engine',
        depth: 0.7,
        edgeDist
      };
    }

    // Cockpit (armored, recessed)
    if (forward > 0.6 && Math.abs(dy) < 0.2) {
      return {
        part: 'lights',
        depth: 0.9,
        edgeDist
      };
    }

    // Targeting sensors (front sides)
    if (forward > 0.4 && forward < 0.6 && Math.abs(dy) > 0.22 && Math.abs(dy) < 0.35) {
      return {
        part: 'lights',
        depth: 0.85,
        edgeDist
      };
    }

    // Heavy armor hull
    return {
      part: 'hull',
      depth: 0.65 + forward * 0.2,
      edgeDist
    };
  }

  /**
   * Generate player ship sprite (special, more detailed)
   */
  async generatePlayerShipSprite(config = {}) {
    return await this.generateShipSprite({
      ...config,
      shipClass: 'fighter',
      palette: 'elite',
      size: 560, // ULTRA-MASSIVE++: Massive player ship (was 48, now 560) for INCREDIBLE detail
      pixelSize: 4 // ULTRA-HEAVY++: Heavy pixelation for ultra-retro CHUNKY aesthetic
    });
  }
}
