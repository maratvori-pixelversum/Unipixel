/**
 * Enhanced Asteroid Renderer
 * 16-bit style pixelated asteroids with varied types and effects
 * Types: Rocky, Metallic, Ice, Carbonaceous
 */

export class AsteroidRenderer {
  constructor() {
    this.typeColors = {
      rocky: {
        base: '#3a3a44',
        bright: '#6a7a88',
        dark: '#1a1a22',
        glow: null
      },
      metallic: {
        base: '#4a4a52',
        bright: '#8a9aaa',
        dark: '#2a2a30',
        glow: 'rgba(180, 190, 200, 0.3)'
      },
      ice: {
        base: '#a0b0c8',
        bright: '#d0e0ff',
        dark: '#6080a0',
        glow: 'rgba(150, 200, 255, 0.4)'
      },
      carbonaceous: {
        base: '#2a2530',
        bright: '#4a4050',
        dark: '#0a0508',
        glow: null
      }
    };
  }

  /**
   * Determine asteroid type based on seed/index
   */
  getAsteroidType(asteroid, index) {
    // Return type if already set
    if (asteroid.type && this.typeColors[asteroid.type]) {
      return asteroid.type;
    }

    // Generate type based on index/position (deterministic)
    // Ensure index and size are valid numbers
    const safeIndex = (typeof index === 'number' && !isNaN(index)) ? index : 0;
    const safeSize = (asteroid && typeof asteroid.size === 'number' && !isNaN(asteroid.size)) ? asteroid.size : 10;

    const seed = safeIndex + safeSize * 1000;
    const rand = Math.abs(Math.sin(seed)) * 100;

    if (rand < 60) return 'rocky';
    if (rand < 80) return 'metallic';
    if (rand < 95) return 'ice';
    return 'carbonaceous';
  }

  /**
   * Render asteroid with enhanced details
   */
  renderAsteroid(ctx, asteroid, index, rotation, mined) {
    // Validate asteroid object
    if (!ctx || !asteroid || !asteroid.vertices || !Array.isArray(asteroid.vertices) || asteroid.vertices.length === 0) {
      return;
    }

    try {
      const type = this.getAsteroidType(asteroid, index);
      const colors = this.typeColors[type] || this.typeColors.rocky; // Fallback to rocky if type not found
      const opacity = mined ? 0.3 : 1.0;

      ctx.save();
      ctx.globalAlpha = opacity;

    // Multi-layer shadow for 3D depth
    this.renderShadow(ctx, asteroid, 3, 0.6);
    this.renderShadow(ctx, asteroid, 2, 0.4);

    // Base asteroid shape
    this.renderBase(ctx, asteroid, colors, mined);

    // Enhanced pixelated surface texture
    this.renderSurfaceTexture(ctx, asteroid, colors, type, mined);

    // Enhanced edge lighting
    this.renderEdgeLighting(ctx, asteroid, colors);

    // Impact craters
    if (!mined) {
      this.renderCraters(ctx, asteroid);
    }

    // Type-specific glow effects
    if (colors.glow && !mined) {
      this.renderGlow(ctx, asteroid, colors.glow);
    }

    // Rotation indicators (subtle spin lines for metal/ice)
    if ((type === 'metallic' || type === 'ice') && !mined) {
      this.renderRotationLines(ctx, asteroid, rotation);
    }

      ctx.globalAlpha = 1.0;
      ctx.restore();
    } catch (error) {
      // Restore context on error
      try {
        ctx.restore();
      } catch (e) {
        // Context restore failed, ignore
      }
    }
  }

  /**
   * Render shadow layer
   */
  renderShadow(ctx, asteroid, offset, alpha) {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(
      asteroid.vertices[0].x * asteroid.size + offset,
      asteroid.vertices[0].y * asteroid.size + offset
    );
    for (let i = 1; i < asteroid.vertices.length; i++) {
      ctx.lineTo(
        asteroid.vertices[i].x * asteroid.size + offset,
        asteroid.vertices[i].y * asteroid.size + offset
      );
    }
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Render base asteroid shape
   */
  renderBase(ctx, asteroid, colors, mined) {
    // Safety check for colors object
    if (!colors || !colors.base) {
      colors = this.typeColors.rocky;
    }

    const baseColor = mined ? '#1a1a22' : colors.base;
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(asteroid.vertices[0].x * asteroid.size, asteroid.vertices[0].y * asteroid.size);
    for (let i = 1; i < asteroid.vertices.length; i++) {
      ctx.lineTo(asteroid.vertices[i].x * asteroid.size, asteroid.vertices[i].y * asteroid.size);
    }
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Render enhanced pixelated surface texture
   */
  renderSurfaceTexture(ctx, asteroid, colors, type, mined) {
    // Safety check for colors object
    if (!colors || !colors.bright || !colors.dark) {
      colors = this.typeColors.rocky;
    }

    const pixelSize = type === 'metallic' ? 2 : 3;
    const pixelCount = Math.floor(asteroid.size * 5); // Increased density

    for (let i = 0; i < pixelCount; i++) {
      const px = (Math.random() - 0.5) * asteroid.size * 1.6;
      const py = (Math.random() - 0.5) * asteroid.size * 1.6;

      const shade = Math.random();

      if (shade > 0.75) {
        // Bright mineral spots (more frequent for metallic/ice)
        const threshold = type === 'metallic' || type === 'ice' ? 0.65 : 0.75;
        if (shade > threshold) {
          ctx.fillStyle = mined ? '#445566' : colors.bright;
          ctx.fillRect(Math.floor(px), Math.floor(py), pixelSize, pixelSize);
        }
      } else if (shade < 0.25) {
        // Dark craters/crevices
        ctx.fillStyle = mined ? '#0a0a0f' : colors.dark;
        ctx.fillRect(Math.floor(px), Math.floor(py), pixelSize, pixelSize);
      } else if (type === 'ice' && shade > 0.5 && shade < 0.6) {
        // Ice crystals (sparkles)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
      }
    }
  }

  /**
   * Render enhanced edge lighting for 3D effect
   */
  renderEdgeLighting(ctx, asteroid, colors) {
    // Main edge
    ctx.strokeStyle = '#555566';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(asteroid.vertices[0].x * asteroid.size, asteroid.vertices[0].y * asteroid.size);
    for (let i = 1; i < asteroid.vertices.length; i++) {
      ctx.lineTo(asteroid.vertices[i].x * asteroid.size, asteroid.vertices[i].y * asteroid.size);
    }
    ctx.closePath();
    ctx.stroke();

    // Dark shadow edge (bottom-right)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < asteroid.vertices.length; i++) {
      const v = asteroid.vertices[i];
      if (v.x > 0 || v.y > 0) {
        if (i === 0 || ctx.currentPath === undefined) {
          ctx.moveTo(v.x * asteroid.size + 1, v.y * asteroid.size + 1);
        } else {
          ctx.lineTo(v.x * asteroid.size + 1, v.y * asteroid.size + 1);
        }
      }
    }
    ctx.stroke();

    // Bright highlight edge (top-left)
    ctx.strokeStyle = 'rgba(200, 210, 230, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < asteroid.vertices.length; i++) {
      const v = asteroid.vertices[i];
      if (v.x < 0 || v.y < 0) {
        if (i === 0 || ctx.currentPath === undefined) {
          ctx.moveTo(v.x * asteroid.size - 1, v.y * asteroid.size - 1);
        } else {
          ctx.lineTo(v.x * asteroid.size - 1, v.y * asteroid.size - 1);
        }
      }
    }
    ctx.stroke();
  }

  /**
   * Render impact craters
   */
  renderCraters(ctx, asteroid) {
    const craterCount = 3 + Math.floor(Math.random() * 4);
    for (let c = 0; c < craterCount; c++) {
      const cx = (Math.random() - 0.5) * asteroid.size * 1.2;
      const cy = (Math.random() - 0.5) * asteroid.size * 1.2;
      const craterSize = 2 + Math.random() * 5;

      // Crater shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(cx, cy, craterSize, 0, Math.PI * 2);
      ctx.fill();

      // Crater rim highlight
      ctx.fillStyle = 'rgba(120, 130, 140, 0.4)';
      ctx.beginPath();
      ctx.arc(cx - craterSize/3, cy - craterSize/3, craterSize/2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render glow effect for metallic/ice asteroids
   */
  renderGlow(ctx, asteroid, glowColor) {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, asteroid.size * 1.8);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(0.6, glowColor.replace(/[\d.]+\)/, '0.1)'));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, asteroid.size * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render rotation indicator lines for metallic/ice asteroids
   */
  renderRotationLines(ctx, asteroid, rotation) {
    const time = Date.now() * 0.001;
    const lineCount = 3;

    ctx.strokeStyle = 'rgba(150, 160, 180, 0.3)';
    ctx.lineWidth = 1;

    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2 + rotation + time;
      const length = asteroid.size * 0.8;

      ctx.beginPath();
      ctx.moveTo(
        Math.cos(angle) * length * 0.3,
        Math.sin(angle) * length * 0.3
      );
      ctx.lineTo(
        Math.cos(angle) * length,
        Math.sin(angle) * length
      );
      ctx.stroke();
    }
  }
}
