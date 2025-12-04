/**
 * PixelArtGenerator - High-quality pixelated texture generation
 *
 * Creates detailed, realistic pixelated textures with:
 * - Hundreds/thousands of visible pixels
 * - Multiple colors and shades for depth
 * - 3D lighting and shadow effects
 * - Dithering for smooth gradients
 * - Noise patterns for detail
 *
 * Used for pre-rendering sprites instead of real-time pixel drawing
 */

export class PixelArtGenerator {
  constructor() {
    // Canvas for generating textures
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    this.ctx.imageSmoothingEnabled = false;

    // Noise generator seed
    this.noiseSeed = Math.random() * 10000;
  }

  /**
   * Perlin-like noise function for organic textures
   */
  noise2D(x, y, seed = 0) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  }

  /**
   * Octave noise for multiple frequencies
   */
  octaveNoise(x, y, octaves = 4, persistence = 0.5) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency, this.noiseSeed + i) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }

  /**
   * Create dithering pattern for smooth gradients with visible pixels
   */
  ditherPixel(value, x, y, threshold = 0.5) {
    const bayerMatrix = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];
    const matrixSize = 4;
    const ditherValue = bayerMatrix[y % matrixSize][x % matrixSize] / 16;
    return value + (ditherValue - 0.5) * threshold;
  }

  /**
   * Convert color to hex string
   */
  colorToHex(r, g, b, a = 255) {
    const toHex = (val) => Math.max(0, Math.min(255, Math.floor(val))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${a < 255 ? toHex(a) : ''}`;
  }

  /**
   * Apply lighting to a color (3D effect)
   * @param {number} lightAngle - Angle of light source (radians)
   * @param {number} surfaceAngle - Angle of surface normal (radians)
   * @param {number} intensity - Light intensity (0-1)
   */
  applyLighting(baseColor, lightAngle, surfaceAngle, intensity = 1.0) {
    // Calculate lighting based on angle between light and surface
    const angleDiff = Math.abs(lightAngle - surfaceAngle);
    const normalizedDiff = (Math.cos(angleDiff) + 1) / 2; // 0 to 1
    const lightFactor = normalizedDiff * intensity;

    // Apply lighting to color components
    const r = baseColor.r * (0.3 + lightFactor * 0.7); // Min 30% brightness
    const g = baseColor.g * (0.3 + lightFactor * 0.7);
    const b = baseColor.b * (0.3 + lightFactor * 0.7);

    return { r, g, b, a: baseColor.a };
  }

  /**
   * Add shadow to a color
   */
  applyShadow(color, shadowAmount = 0.5) {
    return {
      r: color.r * (1 - shadowAmount),
      g: color.g * (1 - shadowAmount),
      b: color.b * (1 - shadowAmount),
      a: color.a
    };
  }

  /**
   * Parse hex color to RGB object
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255
    } : { r: 0, g: 0, b: 0, a: 255 };
  }

  /**
   * Interpolate between two colors
   */
  lerpColor(color1, color2, t) {
    return {
      r: color1.r + (color2.r - color1.r) * t,
      g: color1.g + (color2.g - color1.g) * t,
      b: color1.b + (color2.b - color1.b) * t,
      a: color1.a + (color2.a - color1.a) * t
    };
  }

  /**
   * Generate a gradient with multiple color stops
   */
  generateGradient(stops, position) {
    // Find the two stops to interpolate between
    for (let i = 0; i < stops.length - 1; i++) {
      const stop1 = stops[i];
      const stop2 = stops[i + 1];

      if (position >= stop1.pos && position <= stop2.pos) {
        const t = (position - stop1.pos) / (stop2.pos - stop1.pos);
        return this.lerpColor(stop1.color, stop2.color, t);
      }
    }

    // If outside range, return first or last
    return position < stops[0].pos ? stops[0].color : stops[stops.length - 1].color;
  }

  /**
   * Add surface detail using noise
   */
  addSurfaceNoise(baseColor, x, y, scale = 0.1, intensity = 0.3) {
    const noiseValue = this.octaveNoise(x * scale, y * scale, 3, 0.5);
    const variation = (noiseValue - 0.5) * intensity;

    return {
      r: baseColor.r * (1 + variation),
      g: baseColor.g * (1 + variation),
      b: baseColor.b * (1 + variation),
      a: baseColor.a
    };
  }

  /**
   * Create pixelated circle with proper anti-aliasing via pixel density
   */
  createPixelatedSphere(radius, pixelSize, options = {}) {
    const {
      baseColors = ['#4488ff', '#3366cc', '#2244aa'], // Base color palette
      lightAngle = Math.PI * 0.75, // Light from top-left
      lightIntensity = 1.0,
      addNoise = true,
      noiseIntensity = 0.2,
      noiseTimeOffset = 0,       // Time offset for animating noise patterns
      shadowIntensity = 0.5,
      useGradient = true,
      addGlow = false,           // Enable glow effect for stars
      glowColors = ['#ffffff'],  // Glow color palette
      glowIntensity = 0.8,       // Glow brightness
      glowRadius = 1.5           // Glow extends this many times beyond star radius
    } = options;

    // Calculate canvas size (make it large enough for glow if needed)
    const effectiveRadius = addGlow ? radius * glowRadius : radius;
    const size = effectiveRadius * 2;
    const pixelatedSize = Math.ceil(size / pixelSize) * pixelSize;

    this.canvas.width = pixelatedSize;
    this.canvas.height = pixelatedSize;

    const centerX = pixelatedSize / 2;
    const centerY = pixelatedSize / 2;

    // Clear canvas
    this.ctx.clearRect(0, 0, pixelatedSize, pixelatedSize);

    // Convert base colors to RGB
    const colorPalette = baseColors.map(hex => this.hexToRgb(hex));

    // OPTIMIZATION: Pre-calculate gradient stops to avoid recreating on each iteration
    const gradientStops = useGradient ? colorPalette.map((c, i) => ({
      pos: i / (colorPalette.length - 1),
      color: c
    })) : null;

    // OPTIMIZATION: Pre-calculate constants
    const radiusSq = radius * radius;
    const halfPixel = pixelSize / 2;
    const pixelSizeInv = 1 / pixelSize;
    const lightMin = 0.3;
    const lightRange = 0.7;
    const shadowThreshold = 0.7;
    const shadowScale = shadowIntensity / 0.3;

    // OPTIMIZATION: Cache fillStyle to avoid setting it repeatedly
    let lastFillStyle = null;

    // Draw pixel by pixel
    for (let py = 0; py < pixelatedSize; py += pixelSize) {
      for (let px = 0; px < pixelatedSize; px += pixelSize) {
        // Calculate distance from center
        const dx = px + halfPixel - centerX;
        const dy = py + halfPixel - centerY;
        const distSq = dx * dx + dy * dy;

        // OPTIMIZATION: Check squared distance first to avoid sqrt
        if (distSq <= radiusSq) {
          const distance = Math.sqrt(distSq);

          // Calculate surface normal angle
          const surfaceAngle = Math.atan2(dy, dx);

          // Calculate depth (z-coordinate on sphere)
          const normalizedDist = distance / radius;
          const normalizedDistSq = normalizedDist * normalizedDist;
          const depth = Math.sqrt(1 - normalizedDistSq);

          // Choose base color based on gradient
          let color;
          if (useGradient) {
            // Use depth for gradient (gives 3D appearance)
            const gradientPos = (depth + 1) * 0.5; // 0 to 1 (optimized: replaced division)
            color = this.generateGradient(gradientStops, gradientPos);
          } else {
            color = { ...colorPalette[0] };
          }

          // Apply lighting based on surface angle (OPTIMIZED: inlined for speed)
          const angleDiff = Math.abs(lightAngle - surfaceAngle);
          const normalizedDiff = (Math.cos(angleDiff) + 1) * 0.5; // 0 to 1
          const lightFactor = normalizedDiff * lightIntensity;
          const lighting = lightMin + lightFactor * lightRange;

          color.r *= lighting;
          color.g *= lighting;
          color.b *= lighting;

          // Add surface detail with noise (OPTIMIZED: only if intensity > 0)
          if (addNoise && noiseIntensity > 0) {
            // Use time offset to create animated chaotic patterns across frames
            const noiseValue = this.octaveNoise(
              px * pixelSizeInv * 0.3 + noiseTimeOffset,
              py * pixelSizeInv * 0.3 + noiseTimeOffset * 0.7,
              3,
              0.5
            );
            const variation = (noiseValue - 0.5) * noiseIntensity;
            const noiseFactor = 1 + variation;
            color.r *= noiseFactor;
            color.g *= noiseFactor;
            color.b *= noiseFactor;
          }

          // Add shadow on dark side (OPTIMIZED: only if shadow intensity > 0)
          if (shadowIntensity > 0 && normalizedDist > shadowThreshold) {
            const shadowAmount = (normalizedDist - shadowThreshold) * shadowScale;
            const shadowFactor = 1 - shadowAmount;
            color.r *= shadowFactor;
            color.g *= shadowFactor;
            color.b *= shadowFactor;
          }

          // Apply dithering for smooth gradients
          const ditherThreshold = 0.15;
          const ditheredValue = this.ditherPixel(depth, px * pixelSizeInv, py * pixelSizeInv, ditherThreshold);
          const ditherFactor = Math.max(0, Math.min(1, ditheredValue));

          color.r *= ditherFactor;
          color.g *= ditherFactor;
          color.b *= ditherFactor;

          // Draw the pixel (OPTIMIZED: cache fillStyle to avoid redundant assignments)
          const fillStyle = this.colorToHex(color.r, color.g, color.b, color.a);
          if (fillStyle !== lastFillStyle) {
            this.ctx.fillStyle = fillStyle;
            lastFillStyle = fillStyle;
          }
          this.ctx.fillRect(px, py, pixelSize, pixelSize);
        }
      }
    }

    // Add glow effect for stars (rendered on top of the sphere)
    if (addGlow) {
      // Convert glow colors to RGB
      const glowPalette = glowColors.map(hex => this.hexToRgb(hex));

      // Draw glow from outer edge inward (so inner glow is brighter)
      const glowStartRadius = radius;
      const glowEndRadius = radius * glowRadius;
      const glowThickness = glowEndRadius - glowStartRadius;

      // Render glow layers
      for (let py = 0; py < pixelatedSize; py += pixelSize) {
        for (let px = 0; px < pixelatedSize; px += pixelSize) {
          const dx = px + pixelSize / 2 - centerX;
          const dy = py + pixelSize / 2 - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Only render glow in the glow zone (between radius and glowRadius)
          if (distance > glowStartRadius && distance <= glowEndRadius) {
            // Calculate glow intensity based on distance (brighter near star)
            const glowProgress = (distance - glowStartRadius) / glowThickness; // 0 to 1
            const fadeOut = 1 - glowProgress; // 1 near star, 0 at edge
            const alpha = fadeOut * fadeOut * glowIntensity; // Quadratic falloff for smooth glow

            // Choose glow color based on distance (inner glow is white, outer is colored)
            const colorIndex = Math.min(
              Math.floor(glowProgress * glowPalette.length),
              glowPalette.length - 1
            );
            const glowColor = glowPalette[colorIndex];

            // Add some noise variation to make glow more organic
            // Use time offset for animated glow patterns
            const noiseValue = this.octaveNoise(
              px * (1 / pixelSize) * 0.1 + noiseTimeOffset * 0.5,
              py * (1 / pixelSize) * 0.1 + noiseTimeOffset * 0.3,
              2,
              0.5
            );
            const noiseAlpha = alpha * (0.7 + noiseValue * 0.3); // Vary alpha with noise

            // Draw glow pixel
            const r = Math.floor(glowColor.r * 255);
            const g = Math.floor(glowColor.g * 255);
            const b = Math.floor(glowColor.b * 255);
            const a = Math.max(0, Math.min(1, noiseAlpha));

            if (a > 0.05) { // Only draw visible pixels
              this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
              this.ctx.fillRect(px, py, pixelSize, pixelSize);
            }
          }
        }
      }
    }

    // Return the canvas (can be converted to image)
    return this.canvas;
  }

  /**
   * Create pixelated texture with custom pattern
   */
  createPixelatedTexture(width, height, pixelSize, patternFn, options = {}) {
    const pixelatedWidth = Math.ceil(width / pixelSize) * pixelSize;
    const pixelatedHeight = Math.ceil(height / pixelSize) * pixelSize;

    this.canvas.width = pixelatedWidth;
    this.canvas.height = pixelatedHeight;

    this.ctx.clearRect(0, 0, pixelatedWidth, pixelatedHeight);

    // Draw pixel by pixel using pattern function
    for (let py = 0; py < pixelatedHeight; py += pixelSize) {
      for (let px = 0; px < pixelatedWidth; px += pixelSize) {
        const u = px / pixelatedWidth;
        const v = py / pixelatedHeight;

        // Get color from pattern function
        const color = patternFn(u, v, px / pixelSize, py / pixelSize, options);

        if (color) {
          this.ctx.fillStyle = typeof color === 'string' ? color :
            this.colorToHex(color.r, color.g, color.b, color.a);
          this.ctx.fillRect(px, py, pixelSize, pixelSize);
        }
      }
    }

    return this.canvas;
  }

  /**
   * Convert canvas to Image object for fast blitting
   */
  canvasToImage(canvas) {
    return new Promise((resolve, reject) => {
      // Validate canvas
      if (!canvas || !canvas.toDataURL) {
        reject(new Error('Invalid canvas object provided'));
        return;
      }

      // Check canvas size limits
      const MAX_CANVAS_SIZE = 16384;
      if (canvas.width > MAX_CANVAS_SIZE || canvas.height > MAX_CANVAS_SIZE) {
        reject(new Error(`Canvas too large (${canvas.width}x${canvas.height}), exceeds browser limit of ${MAX_CANVAS_SIZE}px`));
        return;
      }

      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (event) => {
        // Create a proper Error object instead of passing the Event
        reject(new Error(`Failed to load sprite image from canvas (${canvas.width}x${canvas.height}) - possible size limit exceeded`));
      };

      try {
        img.src = canvas.toDataURL('image/png');
      } catch (error) {
        reject(new Error(`Failed to convert canvas to data URL (${canvas.width}x${canvas.height}): ${error.message}`));
      }
    });
  }

  /**
   * Create sprite from canvas
   */
  async createSprite(canvas) {
    const img = await this.canvasToImage(canvas);
    return {
      image: img,
      width: canvas.width,
      height: canvas.height
    };
  }

  /**
   * ENHANCED: Create realistic planet surface with geographical features
   * - Rivers, lakes, mountains, rocky peaks
   * - Lava lakes and volcanoes
   * - Sand dunes, ice tundra
   * - Craters, seas
   * - Gas giant atmospheric flows
   */
  createRealisticPlanetSurface(radius, pixelSize, type, colors, options = {}) {
    // Safety checks
    if (!radius || radius <= 0 || !pixelSize || pixelSize <= 0) {
      console.warn('[PixelArtGenerator] Invalid parameters for createRealisticPlanetSurface');
      return this.canvas; // Return empty canvas
    }

    if (!colors || colors.length === 0) {
      console.warn('[PixelArtGenerator] No colors provided, using defaults');
      colors = ['#808080', '#606060', '#404040'];
    }

    const {
      rotation = 0,
      starPosition = null,
      lightAngle = Math.PI * 0.75,
      lightIntensity = 1.0
    } = options;

    // Calculate canvas size
    const size = radius * 2;
    const pixelatedSize = Math.ceil(size / pixelSize) * pixelSize;

    // Performance: Limit maximum canvas size to prevent lag
    const maxSize = 2000;
    if (pixelatedSize > maxSize) {
      console.warn(`[PixelArtGenerator] Canvas size ${pixelatedSize}px exceeds max ${maxSize}px, clamping`);
    }
    const clampedSize = Math.min(pixelatedSize, maxSize);

    this.canvas.width = clampedSize;
    this.canvas.height = clampedSize;

    const centerX = clampedSize / 2;
    const centerY = clampedSize / 2;

    // Clear canvas
    this.ctx.clearRect(0, 0, clampedSize, clampedSize);

    // Convert base colors to RGB
    const colorPalette = colors.map(hex => this.hexToRgb(hex));

    // Generate geographical features based on planet type
    const features = this.generateGeographicalFeatures(radius, type, rotation);

    // Draw pixel by pixel with complex surface features
    for (let py = 0; py < clampedSize; py += pixelSize) {
      for (let px = 0; px < clampedSize; px += pixelSize) {
        // Calculate distance from center
        const dx = px + pixelSize / 2 - centerX;
        const dy = py + pixelSize / 2 - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only draw if within radius
        if (distance <= radius) {
          // Calculate surface normal angle
          const surfaceAngle = Math.atan2(dy, dx);

          // Calculate depth (z-coordinate on sphere) for 3D effect
          const normalizedDist = distance / radius;
          const depth = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));

          // Calculate 3D position on sphere
          const longitude = surfaceAngle;
          const latitude = Math.asin(Math.max(-1, Math.min(1, dy / radius)));

          // Apply rotation offset
          const rotatedLongitude = (longitude + rotation) % (Math.PI * 2);

          // Get surface feature color based on planet type and position
          let color = this.getSurfaceFeatureColor(
            rotatedLongitude,
            latitude,
            depth,
            features,
            colorPalette,
            type,
            px / pixelSize,
            py / pixelSize
          );

          // Calculate dynamic lighting based on star position or default
          const lightDirection = starPosition ?
            Math.atan2(starPosition.y, starPosition.x) : lightAngle;

          // 3D Spherical lighting: bright on side facing star, dark on opposite
          const sphereLightFactor = this.calculateSphericalLighting(
            longitude,
            latitude,
            depth,
            lightDirection,
            lightIntensity
          );

          // Apply lighting
          color.r *= sphereLightFactor;
          color.g *= sphereLightFactor;
          color.b *= sphereLightFactor;

          // Add edge darkening for 3D sphere effect
          if (normalizedDist > 0.85) {
            const edgeDarkening = 1.0 - (normalizedDist - 0.85) / 0.15 * 0.6;
            color.r *= edgeDarkening;
            color.g *= edgeDarkening;
            color.b *= edgeDarkening;
          }

          // Draw the pixel
          this.ctx.fillStyle = this.colorToHex(color.r, color.g, color.b, color.a);
          this.ctx.fillRect(px, py, pixelSize, pixelSize);
        }
      }
    }

    return this.canvas;
  }

  /**
   * Calculate realistic spherical lighting
   * Makes one side bright (facing star) and other side dark
   */
  calculateSphericalLighting(longitude, latitude, depth, lightDirection, intensity) {
    // Calculate angle between light source and this point on sphere
    const lightAngleDiff = Math.cos(longitude - lightDirection) * Math.cos(latitude);

    // Hemisphere lighting: bright on lit side, dark on shadow side
    const hemisphereLight = (lightAngleDiff + 1) / 2; // 0 to 1

    // Combine with depth for 3D effect
    const depthFactor = depth * 0.3 + 0.7; // Don't make edges too dark

    // Final lighting: minimum 20% brightness (ambient), up to full brightness
    const finalLight = 0.2 + hemisphereLight * depthFactor * 0.8 * intensity;

    return finalLight;
  }

  /**
   * Generate geographical features for different planet types
   */
  generateGeographicalFeatures(radius, type, rotation) {
    const features = {
      craters: [],
      mountains: [],
      rivers: [],
      lakes: [],
      seas: [],
      volcanoes: [],
      lavaLakes: [],
      dunes: [],
      iceCaps: [],
      gasFlows: [],
      storms: []
    };

    // Generate features based on planet type
    switch (type) {
      case 'terran':
        this.generateTerranFeatures(features, radius);
        break;
      case 'desert':
        this.generateDesertFeatures(features, radius);
        break;
      case 'ice':
        this.generateIceFeatures(features, radius);
        break;
      case 'lava':
      case 'volcanic':
        this.generateVolcanicFeatures(features, radius);
        break;
      case 'ocean':
        this.generateOceanFeatures(features, radius);
        break;
      case 'gasGiant':
        this.generateGasGiantFeatures(features, radius);
        break;
      case 'barren':
        this.generateBarrenFeatures(features, radius);
        break;
      default:
        this.generateTerranFeatures(features, radius);
    }

    return features;
  }

  /**
   * Generate Terran (Earth-like) features
   */
  generateTerranFeatures(features, radius) {
    // Continents and seas (large scale) - INCREASED for more detail
    for (let i = 0; i < 6; i++) {
      features.seas.push({
        longitude: this.noise2D(i, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i, 1, this.noiseSeed) - 0.5) * Math.PI * 0.8,
        size: 0.3 + this.noise2D(i, 2, this.noiseSeed) * 0.4
      });
    }

    // Mountains - INCREASED for more detail
    for (let i = 0; i < 20; i++) {
      features.mountains.push({
        longitude: this.noise2D(i + 10, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 10, 1, this.noiseSeed) - 0.5) * Math.PI * 0.7,
        height: 0.5 + this.noise2D(i + 10, 2, this.noiseSeed) * 0.5,
        range: 0.1 + this.noise2D(i + 10, 3, this.noiseSeed) * 0.15
      });
    }

    // Rivers - INCREASED for more detail
    for (let i = 0; i < 12; i++) {
      features.rivers.push({
        startLong: this.noise2D(i + 20, 0, this.noiseSeed) * Math.PI * 2,
        startLat: (this.noise2D(i + 20, 1, this.noiseSeed) - 0.5) * Math.PI * 0.6,
        windingFactor: 0.3 + this.noise2D(i + 20, 2, this.noiseSeed) * 0.4,
        length: 0.2 + this.noise2D(i + 20, 3, this.noiseSeed) * 0.3
      });
    }

    // Lakes - INCREASED for more detail
    for (let i = 0; i < 25; i++) {
      features.lakes.push({
        longitude: this.noise2D(i + 30, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 30, 1, this.noiseSeed) - 0.5) * Math.PI * 0.8,
        size: 0.02 + this.noise2D(i + 30, 2, this.noiseSeed) * 0.06
      });
    }

    // Craters - INCREASED for more detail
    for (let i = 0; i < 15; i++) {
      features.craters.push({
        longitude: this.noise2D(i + 40, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 40, 1, this.noiseSeed) - 0.5) * Math.PI,
        size: 0.03 + this.noise2D(i + 40, 2, this.noiseSeed) * 0.08
      });
    }
  }

  /**
   * Generate Desert planet features
   */
  generateDesertFeatures(features, radius) {
    // Sand dunes (many!) - INCREASED for more detail
    for (let i = 0; i < 60; i++) {
      features.dunes.push({
        longitude: this.noise2D(i, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i, 1, this.noiseSeed) - 0.5) * Math.PI,
        wavelength: 0.02 + this.noise2D(i, 2, this.noiseSeed) * 0.04,
        amplitude: 0.3 + this.noise2D(i, 3, this.noiseSeed) * 0.4,
        direction: this.noise2D(i, 4, this.noiseSeed) * Math.PI * 2
      });
    }

    // Rocky outcrops - INCREASED for more detail
    for (let i = 0; i < 25; i++) {
      features.mountains.push({
        longitude: this.noise2D(i + 50, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 50, 1, this.noiseSeed) - 0.5) * Math.PI,
        height: 0.3 + this.noise2D(i + 50, 2, this.noiseSeed) * 0.4,
        range: 0.05 + this.noise2D(i + 50, 3, this.noiseSeed) * 0.08
      });
    }

    // Craters - INCREASED for more detail
    for (let i = 0; i < 30; i++) {
      features.craters.push({
        longitude: this.noise2D(i + 60, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 60, 1, this.noiseSeed) - 0.5) * Math.PI,
        size: 0.02 + this.noise2D(i + 60, 2, this.noiseSeed) * 0.1
      });
    }
  }

  /**
   * Generate Ice planet features
   */
  generateIceFeatures(features, radius) {
    // Ice caps (cover most of surface)
    features.iceCaps.push({
      coverage: 0.95,
      crackDensity: 0.5  // Increased crack density for more detail
    });

    // Crevasses (ice cracks) - INCREASED for more detail
    for (let i = 0; i < 40; i++) {
      features.rivers.push({  // Reuse rivers for crevasses
        startLong: this.noise2D(i + 70, 0, this.noiseSeed) * Math.PI * 2,
        startLat: (this.noise2D(i + 70, 1, this.noiseSeed) - 0.5) * Math.PI,
        windingFactor: 0.2 + this.noise2D(i + 70, 2, this.noiseSeed) * 0.3,
        length: 0.1 + this.noise2D(i + 70, 3, this.noiseSeed) * 0.2
      });
    }

    // Ice mountains/pressure ridges - INCREASED for more detail
    for (let i = 0; i < 25; i++) {
      features.mountains.push({
        longitude: this.noise2D(i + 80, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 80, 1, this.noiseSeed) - 0.5) * Math.PI,
        height: 0.4 + this.noise2D(i + 80, 2, this.noiseSeed) * 0.3,
        range: 0.06 + this.noise2D(i + 80, 3, this.noiseSeed) * 0.1
      });
    }

    // Impact craters - INCREASED for more detail
    for (let i = 0; i < 20; i++) {
      features.craters.push({
        longitude: this.noise2D(i + 90, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 90, 1, this.noiseSeed) - 0.5) * Math.PI,
        size: 0.03 + this.noise2D(i + 90, 2, this.noiseSeed) * 0.09
      });
    }
  }

  /**
   * Generate Volcanic/Lava planet features
   */
  generateVolcanicFeatures(features, radius) {
    // Volcanoes - INCREASED for more detail
    for (let i = 0; i < 30; i++) {
      features.volcanoes.push({
        longitude: this.noise2D(i + 100, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 100, 1, this.noiseSeed) - 0.5) * Math.PI,
        height: 0.6 + this.noise2D(i + 100, 2, this.noiseSeed) * 0.4,
        calderaSize: 0.04 + this.noise2D(i + 100, 3, this.noiseSeed) * 0.06,
        active: this.noise2D(i + 100, 4, this.noiseSeed) > 0.5
      });
    }

    // Lava lakes - INCREASED for more detail
    for (let i = 0; i < 40; i++) {
      features.lavaLakes.push({
        longitude: this.noise2D(i + 110, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 110, 1, this.noiseSeed) - 0.5) * Math.PI,
        size: 0.03 + this.noise2D(i + 110, 2, this.noiseSeed) * 0.08,
        glow: 0.7 + this.noise2D(i + 110, 3, this.noiseSeed) * 0.3
      });
    }

    // Lava rivers - INCREASED for more detail
    for (let i = 0; i < 20; i++) {
      features.rivers.push({
        startLong: this.noise2D(i + 120, 0, this.noiseSeed) * Math.PI * 2,
        startLat: (this.noise2D(i + 120, 1, this.noiseSeed) - 0.5) * Math.PI,
        windingFactor: 0.4 + this.noise2D(i + 120, 2, this.noiseSeed) * 0.3,
        length: 0.15 + this.noise2D(i + 120, 3, this.noiseSeed) * 0.25,
        lava: true
      });
    }

    // Craters - INCREASED for more detail
    for (let i = 0; i < 16; i++) {
      features.craters.push({
        longitude: this.noise2D(i + 130, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 130, 1, this.noiseSeed) - 0.5) * Math.PI,
        size: 0.04 + this.noise2D(i + 130, 2, this.noiseSeed) * 0.1
      });
    }
  }

  /**
   * Generate Ocean planet features
   */
  generateOceanFeatures(features, radius) {
    // Large ocean (covers most of planet)
    features.seas.push({
      longitude: 0,
      latitude: 0,
      size: 1.0  // Global ocean
    });

    // Small islands - INCREASED for more detail
    for (let i = 0; i < 20; i++) {
      features.mountains.push({  // Islands are mountains
        longitude: this.noise2D(i + 140, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 140, 1, this.noiseSeed) - 0.5) * Math.PI * 0.7,
        height: 0.4 + this.noise2D(i + 140, 2, this.noiseSeed) * 0.3,
        range: 0.03 + this.noise2D(i + 140, 3, this.noiseSeed) * 0.05
      });
    }

    // Underwater trenches (darker areas) - INCREASED for more detail
    for (let i = 0; i < 25; i++) {
      features.craters.push({  // Reuse craters for trenches
        longitude: this.noise2D(i + 150, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 150, 1, this.noiseSeed) - 0.5) * Math.PI,
        size: 0.05 + this.noise2D(i + 150, 2, this.noiseSeed) * 0.15
      });
    }
  }

  /**
   * Generate Gas Giant features
   */
  generateGasGiantFeatures(features, radius) {
    // Atmospheric bands - INCREASED for more detail
    for (let i = 0; i < 24; i++) {
      features.gasFlows.push({
        latitude: (i / 24 - 0.5) * Math.PI,
        width: 0.1 + this.noise2D(i + 160, 0, this.noiseSeed) * 0.15,
        speed: 0.5 + this.noise2D(i + 160, 1, this.noiseSeed) * 1.0,
        direction: this.noise2D(i + 160, 2, this.noiseSeed) > 0.5 ? 1 : -1,
        turbulence: 0.3 + this.noise2D(i + 160, 3, this.noiseSeed) * 0.4
      });
    }

    // Giant storms (like Jupiter's Great Red Spot) - INCREASED for more detail
    for (let i = 0; i < 12; i++) {
      features.storms.push({
        longitude: this.noise2D(i + 170, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 170, 1, this.noiseSeed) - 0.5) * Math.PI * 0.6,
        size: 0.1 + this.noise2D(i + 170, 2, this.noiseSeed) * 0.2,
        intensity: 0.6 + this.noise2D(i + 170, 3, this.noiseSeed) * 0.4,
        rotation: this.noise2D(i + 170, 4, this.noiseSeed) * Math.PI * 2
      });
    }
  }

  /**
   * Generate Barren/Rocky planet features
   */
  generateBarrenFeatures(features, radius) {
    // Many craters (heavy bombardment) - INCREASED for more detail
    for (let i = 0; i < 80; i++) {
      features.craters.push({
        longitude: this.noise2D(i + 180, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 180, 1, this.noiseSeed) - 0.5) * Math.PI,
        size: 0.02 + this.noise2D(i + 180, 2, this.noiseSeed) * 0.12
      });
    }

    // Rocky peaks - INCREASED for more detail
    for (let i = 0; i < 30; i++) {
      features.mountains.push({
        longitude: this.noise2D(i + 190, 0, this.noiseSeed) * Math.PI * 2,
        latitude: (this.noise2D(i + 190, 1, this.noiseSeed) - 0.5) * Math.PI,
        height: 0.5 + this.noise2D(i + 190, 2, this.noiseSeed) * 0.5,
        range: 0.04 + this.noise2D(i + 190, 3, this.noiseSeed) * 0.07
      });
    }
  }

  /**
   * Get surface feature color at specific longitude/latitude
   */
  getSurfaceFeatureColor(longitude, latitude, depth, features, colorPalette, type, px, py) {
    let baseColorIndex = 0;
    let featureIntensity = 0;
    let isSpecialFeature = false;
    let specialColor = null;

    // Check for geographical features
    // Check seas
    for (const sea of features.seas) {
      const angularDist = this.angularDistance(longitude, latitude, sea.longitude, sea.latitude);
      if (angularDist < sea.size) {
        baseColorIndex = 0; // Ocean colors (first in palette)
        featureIntensity = 0.8;
        isSpecialFeature = true;
        break;
      }
    }

    // Check lakes
    if (!isSpecialFeature) {
      for (const lake of features.lakes) {
        const angularDist = this.angularDistance(longitude, latitude, lake.longitude, lake.latitude);
        if (angularDist < lake.size) {
          baseColorIndex = 0; // Water color
          featureIntensity = 0.6;
          isSpecialFeature = true;
          break;
        }
      }
    }

    // Check lava lakes
    if (!isSpecialFeature) {
      for (const lavaLake of features.lavaLakes) {
        const angularDist = this.angularDistance(longitude, latitude, lavaLake.longitude, lavaLake.latitude);
        if (angularDist < lavaLake.size) {
          // Lava is bright orange/red
          specialColor = { r: 255, g: 100 + lavaLake.glow * 100, b: 20, a: 255 };
          isSpecialFeature = true;
          break;
        }
      }
    }

    // Check mountains
    if (!isSpecialFeature) {
      for (const mountain of features.mountains) {
        const angularDist = this.angularDistance(longitude, latitude, mountain.longitude, mountain.latitude);
        if (angularDist < mountain.range) {
          const mountainFactor = 1.0 - (angularDist / mountain.range);
          baseColorIndex = Math.min(colorPalette.length - 1, Math.floor((colorPalette.length - 1) * 0.6)); // Light colors for mountains
          featureIntensity = 0.5 + mountainFactor * mountain.height * 0.5;
          isSpecialFeature = true;
          break;
        }
      }
    }

    // Check craters
    if (!isSpecialFeature) {
      for (const crater of features.craters) {
        const angularDist = this.angularDistance(longitude, latitude, crater.longitude, crater.latitude);
        if (angularDist < crater.size) {
          const craterFactor = angularDist / crater.size;
          baseColorIndex = Math.max(0, Math.floor(colorPalette.length * 0.2)); // Darker colors
          featureIntensity = 0.3 - craterFactor * 0.2; // Darker in center
          isSpecialFeature = true;
          break;
        }
      }
    }

    // Check volcanoes
    if (!isSpecialFeature) {
      for (const volcano of features.volcanoes) {
        const angularDist = this.angularDistance(longitude, latitude, volcano.longitude, volcano.latitude);
        if (angularDist < volcano.calderaSize * 2) {
          if (angularDist < volcano.calderaSize && volcano.active) {
            // Active caldera - lava
            specialColor = { r: 255, g: 120, b: 30, a: 255 };
          } else {
            // Volcano slopes
            baseColorIndex = Math.max(0, Math.floor(colorPalette.length * 0.3));
            featureIntensity = 0.4;
          }
          isSpecialFeature = true;
          break;
        }
      }
    }

    // Check rivers (linear features)
    if (!isSpecialFeature) {
      for (const river of features.rivers) {
        const distToRiver = this.distanceToRiver(longitude, latitude, river);
        if (distToRiver < 0.015) {
          if (river.lava) {
            specialColor = { r: 255, g: 80, b: 10, a: 255 };
          } else {
            baseColorIndex = 0; // Water color
            featureIntensity = 0.5;
          }
          isSpecialFeature = true;
          break;
        }
      }
    }

    // Check gas giant storms
    if (!isSpecialFeature && type === 'gasGiant') {
      for (const storm of features.storms) {
        const angularDist = this.angularDistance(longitude, latitude, storm.longitude, storm.latitude);
        if (angularDist < storm.size) {
          const stormFactor = 1.0 - (angularDist / storm.size);
          baseColorIndex = Math.floor(colorPalette.length * 0.7); // Lighter colors for storms
          featureIntensity = 0.7 + stormFactor * storm.intensity * 0.3;
          isSpecialFeature = true;
          break;
        }
      }
    }

    // If special color was set, use it
    if (specialColor) {
      const noise = this.octaveNoise(px * 0.3, py * 0.3, 3, 0.5);
      return {
        r: specialColor.r * (0.8 + noise * 0.4),
        g: specialColor.g * (0.8 + noise * 0.4),
        b: specialColor.b * (0.8 + noise * 0.4),
        a: 255
      };
    }

    // Get base color from palette
    if (!isSpecialFeature) {
      // Use noise to determine base terrain
      const terrainNoise = this.octaveNoise(
        longitude * 5 + px * 0.1,
        latitude * 5 + py * 0.1,
        4,
        0.6
      );

      // For gas giants, create banded appearance
      if (type === 'gasGiant') {
        // Bands based on latitude
        const bandIndex = Math.floor((Math.abs(latitude) / (Math.PI / 2)) * features.gasFlows.length);
        const band = features.gasFlows[Math.min(bandIndex, features.gasFlows.length - 1)] || features.gasFlows[0];

        // Add turbulence
        const turbulence = this.octaveNoise(
          longitude * 8 + band.speed,
          latitude * 15,
          3,
          0.5
        ) * band.turbulence;

        baseColorIndex = Math.floor((terrainNoise + turbulence) * colorPalette.length) % colorPalette.length;
      } else {
        baseColorIndex = Math.floor(terrainNoise * colorPalette.length) % colorPalette.length;
      }

      featureIntensity = 0.7 + terrainNoise * 0.3;
    }

    // Get color from palette
    let color = { ...colorPalette[Math.max(0, Math.min(baseColorIndex, colorPalette.length - 1))] };

    // Apply feature intensity
    color.r *= (0.5 + featureIntensity * 0.5);
    color.g *= (0.5 + featureIntensity * 0.5);
    color.b *= (0.5 + featureIntensity * 0.5);

    // Add heavy pixelated noise for detailed surface
    const surfaceNoise = this.octaveNoise(px * 0.5, py * 0.5, 4, 0.6);
    const noiseVariation = (surfaceNoise - 0.5) * 0.4; // Heavy noise

    color.r *= (1 + noiseVariation);
    color.g *= (1 + noiseVariation);
    color.b *= (1 + noiseVariation);

    return color;
  }

  /**
   * Calculate angular distance between two points on sphere
   */
  angularDistance(long1, lat1, long2, lat2) {
    const dLong = long1 - long2;
    const dLat = lat1 - lat2;

    // Haversine formula
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLong / 2) ** 2;
    return 2 * Math.asin(Math.sqrt(a));
  }

  /**
   * Calculate distance to a river path
   */
  distanceToRiver(longitude, latitude, river) {
    // Simple river path - can be made more complex
    const longDist = Math.abs(longitude - river.startLong);
    const latDist = Math.abs(latitude - river.startLat);

    // River follows a winding path
    const windOffset = Math.sin(longitude * 10) * river.windingFactor * 0.1;

    return Math.sqrt(longDist * longDist + (latDist + windOffset) * (latDist + windOffset));
  }
}
