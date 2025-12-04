/**
 * SpriteSheetGenerator - Animation frame generation and sprite sheet packing
 *
 * Creates sprite sheets with multiple animation frames:
 * - 60 frame rotation animations for smooth spinning
 * - Efficient sprite sheet packing
 * - Frame lookup and management
 * - Supports multiple animation types
 */

import { PixelArtGenerator } from './PixelArtGenerator.js';

export class SpriteSheetGenerator {
  constructor() {
    this.pixelArtGen = new PixelArtGenerator();
    this.spriteSheets = new Map(); // Cache of generated sprite sheets
  }

  /**
   * Generate rotation animation frames
   * Creates 60 frames of rotation for smooth animation
   */
  async generateRotationFrames(generatorFn, options = {}) {
    const {
      frameCount = 30, // 30 frames = smooth rotation (reduced from 60 for better performance)
      rotationOffset = 0
    } = options;

    const frames = [];

    for (let i = 0; i < frameCount; i++) {
      const rotation = (i / frameCount) * Math.PI * 2 + rotationOffset;

      // Generate frame with specific rotation
      const frameOptions = {
        ...options,
        rotation,
        frameIndex: i,
        frameCount
      };

      const canvas = await generatorFn(frameOptions);
      const sprite = await this.pixelArtGen.createSprite(canvas);

      frames.push({
        index: i,
        rotation,
        sprite,
        width: sprite.width,
        height: sprite.height
      });
    }

    return frames;
  }

  /**
   * Pack multiple frames into a single sprite sheet
   * Uses simple horizontal packing for now (can be optimized later)
   */
  async packSpriteSheet(frames, name) {
    if (!frames || frames.length === 0) {
      console.warn('[SpriteSheetGenerator] No frames to pack for:', name);
      return null;
    }

    // Validate frames
    if (!frames[0] || !frames[0].sprite || !frames[0].sprite.image) {
      console.error('[SpriteSheetGenerator] Invalid frame data for:', name);
      return null;
    }

    // Calculate sprite sheet dimensions with DYNAMIC LAYOUT
    const frameWidth = frames[0].width;
    const frameHeight = frames[0].height;
    const MAX_CANVAS_SIZE = 16384; // Most browsers support up to 16384x16384
    const MAX_CANVAS_AREA = 268435456; // 16384 * 16384

    // DYNAMIC LAYOUT: Calculate optimal columns based on frame size to prevent exceeding limits
    const maxPossibleCols = Math.floor(MAX_CANVAS_SIZE / frameWidth);
    const maxPossibleRows = Math.floor(MAX_CANVAS_SIZE / frameHeight);

    // Use fewer columns for large frames, more for small frames
    const idealCols = Math.min(10, maxPossibleCols, frames.length);
    const cols = Math.max(1, idealCols); // At least 1 column
    const rows = Math.ceil(frames.length / cols);

    // Verify the layout fits within limits
    if (rows > maxPossibleRows) {
      console.error(`[SpriteSheetGenerator] Cannot fit ${frames.length} frames of size ${frameWidth}x${frameHeight}`);
      console.error(`[SpriteSheetGenerator] Max layout: ${maxPossibleCols}x${maxPossibleRows} = ${maxPossibleCols * maxPossibleRows} frames`);
      console.error(`[SpriteSheetGenerator] Attempted layout: ${cols}x${rows} (${rows} rows exceeds ${maxPossibleRows})`);
      return null;
    }

    const sheetWidth = frameWidth * cols;
    const sheetHeight = frameHeight * rows;

    // Final sanity check
    if (sheetWidth > MAX_CANVAS_SIZE || sheetHeight > MAX_CANVAS_SIZE) {
      console.error(`[SpriteSheetGenerator] Sprite sheet too large for ${name}: ${sheetWidth}x${sheetHeight} exceeds ${MAX_CANVAS_SIZE}px limit`);
      console.error(`[SpriteSheetGenerator] Frame size: ${frameWidth}x${frameHeight}, Frames: ${frames.length}, Layout: ${cols}x${rows}`);
      return null;
    }

    if (sheetWidth * sheetHeight > MAX_CANVAS_AREA) {
      console.error(`[SpriteSheetGenerator] Sprite sheet area too large for ${name}: ${sheetWidth * sheetHeight} pixels exceeds ${MAX_CANVAS_AREA} limit`);
      return null;
    }

    console.log(`[SpriteSheetGenerator] Packing ${frames.length} frames (${frameWidth}x${frameHeight}) into ${cols}x${rows} layout = ${sheetWidth}x${sheetHeight}px`);

    // Create sprite sheet canvas
    const canvas = document.createElement('canvas');
    canvas.width = sheetWidth;
    canvas.height = sheetHeight;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Clear canvas
    ctx.clearRect(0, 0, sheetWidth, sheetHeight);

    // Draw each frame onto the sprite sheet
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      if (!frame || !frame.sprite || !frame.sprite.image) {
        console.warn(`[SpriteSheetGenerator] Skipping invalid frame ${i} for:`, name);
        continue;
      }

      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * frameWidth;
      const y = row * frameHeight;

      try {
        ctx.drawImage(frame.sprite.image, x, y);
      } catch (error) {
        console.error(`[SpriteSheetGenerator] Failed to draw frame ${i} for ${name}:`, error.message);
      }
    }

    // Convert to image
    try {
      const sheetImage = await this.pixelArtGen.canvasToImage(canvas);

      // Create sprite sheet metadata
      const spriteSheet = {
        name,
        image: sheetImage,
        width: sheetWidth,
        height: sheetHeight,
        frameWidth,
        frameHeight,
        cols,
        rows,
        frameCount: frames.length,
        frames: frames.map((frame, i) => ({
          index: i,
          x: (i % cols) * frameWidth,
          y: Math.floor(i / cols) * frameHeight,
          width: frameWidth,
          height: frameHeight,
          rotation: frame.rotation || 0
        }))
      };

      // Cache sprite sheet
      this.spriteSheets.set(name, spriteSheet);

      return spriteSheet;
    } catch (error) {
      console.error(`[SpriteSheetGenerator] Failed to create sprite sheet for ${name}:`, error.message);
      return null;
    }
  }

  /**
   * Get frame from sprite sheet by index
   */
  getFrame(sheetName, frameIndex) {
    const sheet = this.spriteSheets.get(sheetName);
    if (!sheet) return null;

    const frame = sheet.frames[frameIndex % sheet.frameCount];
    return frame;
  }

  /**
   * Get frame from sprite sheet by rotation angle
   * Finds the closest frame to the desired rotation
   */
  getFrameByRotation(sheetName, rotation) {
    const sheet = this.spriteSheets.get(sheetName);
    if (!sheet) return null;

    // Normalize rotation to 0-2π
    const normalizedRotation = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // Find closest frame
    let closestFrame = sheet.frames[0];
    let minDiff = Math.abs(normalizedRotation - closestFrame.rotation);

    for (const frame of sheet.frames) {
      const diff = Math.abs(normalizedRotation - frame.rotation);
      if (diff < minDiff) {
        minDiff = diff;
        closestFrame = frame;
      }
    }

    return closestFrame;
  }

  /**
   * Get sprite sheet
   */
  getSpriteSheet(name) {
    return this.spriteSheets.get(name);
  }

  /**
   * Check if sprite sheet exists
   */
  hasSpriteSheet(name) {
    return this.spriteSheets.has(name);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.spriteSheets.clear();
  }

  /**
   * Generate planet sprite with rotation frames
   * ENHANCED: Now includes star position for dynamic lighting
   */
  async generatePlanetSprite(config) {
    const {
      radius = 50,
      pixelSize = 2,
      type = 'terran',
      colors = ['#4488ff', '#3366cc', '#2244aa'],
      seed = Math.random() * 10000,
      starPosition = null
    } = config;

    // Set seed for consistent generation
    this.pixelArtGen.noiseSeed = seed;

    // DYNAMIC FRAME COUNT: Calculate based on expected frame size to prevent exceeding sprite sheet limits
    // Max canvas size is 2000px, so estimate final frame size
    const estimatedFrameSize = Math.min(radius * 2, 2000);
    const MAX_SPRITE_SHEET_SIZE = 16384;

    // Calculate max frames that fit within browser limits
    // Using conservative estimate: 8 columns max for large planets
    const maxColumnsForSize = Math.floor(MAX_SPRITE_SHEET_SIZE / estimatedFrameSize);
    const maxRowsForSize = Math.floor(MAX_SPRITE_SHEET_SIZE / estimatedFrameSize);
    const maxFramesForSize = maxColumnsForSize * maxRowsForSize;

    // For large planets (>1000px), use fewer frames for performance and sprite sheet limits
    const desiredFrameCount = estimatedFrameSize > 1000 ? 6 : 12;
    const frameCount = Math.min(desiredFrameCount, maxFramesForSize);

    console.log(`[SpriteSheetGenerator] Planet ${type} radius ${radius}px → estimated ${estimatedFrameSize}px → ${frameCount} frames`);

    const frames = await this.generateRotationFrames(
      async (frameOptions) => {
        // Generate planet surface for this rotation frame with type and star position
        return this.generatePlanetSurface(radius, pixelSize, type, colors, {
          ...frameOptions,
          starPosition
        });
      },
      { frameCount }
    );

    const sheetName = `planet_${type}_${seed}`;
    const spriteSheet = await this.packSpriteSheet(frames, sheetName);

    return spriteSheet;
  }

  /**
   * Generate planet surface for a specific rotation frame
   * ENHANCED: Now uses realistic surface generation with geographical features
   */
  generatePlanetSurface(radius, pixelSize, type, colors, frameOptions) {
    const { rotation = 0, starPosition = null } = frameOptions;

    // Create canvas for planet with realistic geographical features
    const options = {
      rotation,
      starPosition,
      lightAngle: Math.PI * 0.75, // Default top-left lighting if no star
      lightIntensity: 1.0
    };

    // Use new realistic planet surface generation
    return this.pixelArtGen.createRealisticPlanetSurface(radius, pixelSize, type, colors, options);
  }

  /**
   * Generate star sprite with animation (pulsing, flares)
   */
  async generateStarSprite(config) {
    const {
      radius = 100,
      pixelSize = 3,
      stellarClass = 'G',
      colors = ['#ffff88', '#ffdd66', '#ffaa44'],
      seed = Math.random() * 10000
    } = config;

    console.log(`[SpriteSheetGenerator] Generating star sprite: class=${stellarClass}, radius=${radius}px, pixelSize=${pixelSize}, seed=${seed}`);

    this.pixelArtGen.noiseSeed = seed;

    // Generate animation frames
    // BALANCED: 16 frames for smooth chaotic surface animation
    const frames = await this.generateRotationFrames(
      async (frameOptions) => {
        // Chaotic surface patterns vary across frames to simulate solar convection
        return this.generateStarSurface(radius, pixelSize, stellarClass, colors, frameOptions);
      },
      { frameCount: 16 }  // 16 frames for visible chaotic surface variation
    );

    console.log(`[SpriteSheetGenerator] Generated ${frames.length} star frames, packing sprite sheet...`);

    const sheetName = `star_${stellarClass}_${seed}`;
    const spriteSheet = await this.packSpriteSheet(frames, sheetName);

    if (spriteSheet) {
      console.log(`[SpriteSheetGenerator] ✓ Star sprite sheet created: ${sheetName}, size=${spriteSheet.width}x${spriteSheet.height}, frames=${spriteSheet.frameCount}`);
    } else {
      console.error(`[SpriteSheetGenerator] ✗ Failed to create star sprite sheet: ${sheetName}`);
    }

    return spriteSheet;
  }

  /**
   * Generate star surface
   */
  generateStarSurface(radius, pixelSize, stellarClass, colors, frameOptions) {
    // Determine glow color based on stellar class
    let glowColors = ['#ffffff', '#ffffee', '#ffffcc', '#ffffaa']; // Default: white/yellow glow

    // Map stellar classes to appropriate glow colors
    if (stellarClass === 'O' || stellarClass === 'B' || stellarClass === 'BlueGiant') {
      glowColors = ['#ffffff', '#eeeeff', '#ccddff', '#aaccff']; // Blue-white glow
    } else if (stellarClass === 'A' || stellarClass === 'WhiteDwarf') {
      glowColors = ['#ffffff', '#ffffff', '#f5f5ff', '#eeeeff']; // Pure white glow
    } else if (stellarClass === 'F' || stellarClass === 'G' || stellarClass === 'YellowGiant') {
      glowColors = ['#ffffff', '#ffffee', '#ffffcc', '#ffff88']; // White/yellow glow
    } else if (stellarClass === 'K' || stellarClass === 'OrangeGiant') {
      glowColors = ['#ffffee', '#ffffcc', '#ffeeaa', '#ffdd88']; // Yellow/orange glow
    } else if (stellarClass === 'M' || stellarClass === 'RedGiant' || stellarClass === 'RedDwarf') {
      glowColors = ['#ffffcc', '#ffeeaa', '#ffcc88', '#ffaa66']; // Orange/red glow
    } else if (stellarClass === 'L' || stellarClass === 'BrownDwarf') {
      glowColors = ['#ffddaa', '#ffcc88', '#ffaa66', '#ff8844']; // Orange/red glow (dimmer)
    }

    // CHAOTIC SURFACE: Use frame index to create varying surface patterns
    // This creates the animated chaotic surface effect like solar convection
    const frameIndex = frameOptions?.frameIndex || 0;
    const frameCount = frameOptions?.frameCount || 8;
    const timeOffset = (frameIndex / frameCount) * 100; // Spread frames across time for variation

    const options = {
      baseColors: colors,
      lightAngle: 0, // Stars emit light, no external lighting
      lightIntensity: 1.2,   // INCREASED: Stars are self-luminous and should be very bright
      addNoise: true,
      noiseIntensity: 0.15,  // INCREASED: More noise for chaotic surface detail
      noiseTimeOffset: timeOffset,  // Animate surface patterns across frames
      shadowIntensity: 0.0,  // REMOVED: Stars should not have shadows
      useGradient: true,
      addGlow: true,         // Enable glow effect
      glowColors: glowColors, // Glow color palette
      glowIntensity: 1.5,    // INCREASED: Very bright glow like the concept art
      glowRadius: 2.2        // INCREASED: Extended glow radius for radiant appearance
    };

    return this.pixelArtGen.createPixelatedSphere(radius, pixelSize, options);
  }

  /**
   * Generate ship sprite with rotation frames
   */
  async generateShipSprite(config) {
    const {
      width = 40,
      height = 40,
      pixelSize = 1,
      shipClass = 'fighter',
      colors = ['#4a4a55', '#38383f', '#5a5a66'],
      seed = Math.random() * 10000
    } = config;

    this.pixelArtGen.noiseSeed = seed;

    const frames = await this.generateRotationFrames(
      async (frameOptions) => {
        return this.generateShipFrame(width, height, pixelSize, shipClass, colors, frameOptions);
      },
      { frameCount: 60 }
    );

    const sheetName = `ship_${shipClass}_${seed}`;
    const spriteSheet = await this.packSpriteSheet(frames, sheetName);

    return spriteSheet;
  }

  /**
   * Generate ship frame (simplified - can be expanded)
   */
  generateShipFrame(width, height, pixelSize, shipClass, colors, frameOptions) {
    const { rotation = 0 } = frameOptions;

    // Create ship pattern
    const canvas = this.pixelArtGen.createPixelatedTexture(
      width,
      height,
      pixelSize,
      (u, v, px, py, options) => {
        // Simple ship shape for now
        const centerX = 0.5;
        const centerY = 0.5;
        const dx = u - centerX;
        const dy = v - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Ship hull
        if (dist < 0.4) {
          const colorIndex = Math.floor(dist / 0.4 * colors.length);
          return this.pixelArtGen.hexToRgb(colors[Math.min(colorIndex, colors.length - 1)]);
        }

        return null; // Transparent
      },
      { rotation }
    );

    return canvas;
  }

  /**
   * Generate asteroid sprite (static, no rotation needed for small objects)
   */
  async generateAsteroidSprite(config) {
    const {
      radius = 20,
      pixelSize = 2,
      colors = ['#666666', '#555555', '#444444'],
      seed = Math.random() * 10000
    } = config;

    this.pixelArtGen.noiseSeed = seed;

    // Asteroids can use fewer frames (they're smaller)
    const frames = await this.generateRotationFrames(
      async (frameOptions) => {
        return this.generateAsteroidSurface(radius, pixelSize, colors, frameOptions);
      },
      { frameCount: 8 } // REDUCED: 8 frames for much faster generation
    );

    const sheetName = `asteroid_${seed}`;
    const spriteSheet = await this.packSpriteSheet(frames, sheetName);

    return spriteSheet;
  }

  /**
   * Generate asteroid surface
   */
  generateAsteroidSurface(radius, pixelSize, colors, frameOptions) {
    const options = {
      baseColors: colors,
      lightAngle: Math.PI * 0.75,
      lightIntensity: 0.8,
      addNoise: true,
      noiseIntensity: 0.5, // More noise for rocky texture
      shadowIntensity: 0.7,
      useGradient: false // Asteroids are more uniform
    };

    return this.pixelArtGen.createPixelatedSphere(radius, pixelSize, options);
  }
}
