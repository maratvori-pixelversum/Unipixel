/**
 * Retro Screen Effects System
 *
 * Adds optional CRT/retro visual effects to enhance the pixelated aesthetic:
 * - Scanlines (horizontal lines)
 * - Vignette (screen edge darkening)
 * - Chromatic aberration (color separation)
 * - Screen curvature illusion
 * - Phosphor glow
 */

export class RetroScreenEffects {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.enabled = true;
    this.time = 0;

    // Effect settings
    this.effects = {
      scanlines: true,
      vignette: true,
      chromaticAberration: false, // Disabled by default (performance)
      phosphorGlow: true,
      screenFlicker: false // Disabled by default (can be annoying)
    };

    // Scanline settings
    this.scanlineOpacity = 0.15;
    this.scanlineSpacing = 4; // Every 4 pixels

    // Vignette settings
    this.vignetteStrength = 0.4;

    // Phosphor glow settings
    this.glowIntensity = 0.05;
  }

  /**
   * Update time-based effects
   */
  update(dt) {
    this.time += dt;
  }

  /**
   * Apply all enabled screen effects
   * Call this AFTER rendering the game content
   */
  applyEffects(width, height) {
    if (!this.enabled) return;

    const ctx = this.ctx;

    // Apply effects in order
    if (this.effects.scanlines) {
      this.renderScanlines(width, height);
    }

    if (this.effects.phosphorGlow) {
      this.renderPhosphorGlow(width, height);
    }

    if (this.effects.vignette) {
      this.renderVignette(width, height);
    }

    if (this.effects.screenFlicker) {
      this.renderFlicker(width, height);
    }
  }

  /**
   * Render horizontal scanlines for CRT effect
   */
  renderScanlines(width, height) {
    const ctx = this.ctx;

    ctx.save();
    ctx.globalAlpha = this.scanlineOpacity;
    ctx.fillStyle = '#000000';

    // Draw horizontal lines
    for (let y = 0; y < height; y += this.scanlineSpacing) {
      ctx.fillRect(0, y, width, 1);
    }

    ctx.restore();
  }

  /**
   * Render phosphor glow effect (subtle bloom)
   */
  renderPhosphorGlow(width, height) {
    const ctx = this.ctx;

    // Create subtle glow overlay
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) * 0.7
    );

    gradient.addColorStop(0, `rgba(200, 220, 255, ${this.glowIntensity})`);
    gradient.addColorStop(0.6, 'rgba(200, 220, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  /**
   * Render vignette effect (darkened edges)
   */
  renderVignette(width, height) {
    const ctx = this.ctx;

    // Create radial gradient from center to edges
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.3,
      width / 2, height / 2, Math.max(width, height) * 0.85
    );

    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${this.vignetteStrength})`);

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  /**
   * Render subtle screen flicker
   */
  renderFlicker(width, height) {
    const ctx = this.ctx;

    // Random flicker intensity (very subtle)
    const flickerIntensity = Math.sin(this.time * 60) * 0.005 +
                            Math.random() * 0.01;

    if (flickerIntensity > 0) {
      ctx.save();
      ctx.globalAlpha = flickerIntensity;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  /**
   * Enable/disable specific effects
   */
  setEffect(effectName, enabled) {
    if (this.effects.hasOwnProperty(effectName)) {
      this.effects[effectName] = enabled;
    }
  }

  /**
   * Enable/disable all effects
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}
