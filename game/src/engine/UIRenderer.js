/**
 * UI Renderer - Retro CRT Terminal Edition
 * Renders all UI screens with authentic retro terminal styling:
 * - CRT scanlines and phosphor glow
 * - Screen noise and static
 * - Damaged/rusty mechanical textures
 * - Deep shadows and atmospheric lighting
 * - Pixelated retro sci-fi aesthetics
 * Uses DigitalDisco custom font throughout
 */

export class UIRenderer {
  constructor(game) {
    this.game = game;
    this.scanlineOffset = 0;
    this.noiseFrame = 0;
    this.glitchIntensity = 0;
    this.time = 0;
    this.scanBeamY = 0; // For vertical scan beam effect

    // UI Caching - Cache static UI elements to off-screen canvases
    this.uiCache = new Map();
    this.lastUIState = null;
    this.cacheNeedsRefresh = true;

    // PERFORMANCE: Cache gradients and expensive effects
    this.gradientCache = new Map();
    this.scanlinesCache = new Map();
    this.noiseCache = new Map();
  }

  /**
   * Get or create a cached canvas for a UI screen
   */
  getCachedCanvas(key, width, height) {
    if (!this.uiCache.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      this.uiCache.set(key, {
        canvas,
        ctx: canvas.getContext('2d'),
        isDirty: true
      });
    }
    return this.uiCache.get(key);
  }

  /**
   * Mark a cached UI element as dirty (needs re-render)
   */
  invalidateCache(key) {
    if (this.uiCache.has(key)) {
      this.uiCache.get(key).isDirty = true;
    }
  }

  /**
   * Clear all UI caches
   */
  clearCache() {
    this.uiCache.clear();
    this.cacheNeedsRefresh = true;
  }

  /**
   * Render all active UI screens with CRT effects
   */
  render(ctx) {
    this.time += 0.016; // ~60fps
    this.scanlineOffset = (this.scanlineOffset + 0.5) % 4;
    this.scanBeamY = (this.scanBeamY + 3) % this.game.height;
    this.noiseFrame += 1;

    // Random glitch effect
    if (Math.random() < 0.001) {
      this.glitchIntensity = Math.random() * 0.3;
    }
    this.glitchIntensity *= 0.9;

    // Render overlays based on active UI state
    if (this.game.uiState.showSaveScreen) {
      this.renderSaveScreen(ctx);
    } else if (this.game.uiState.showLoadScreen) {
      this.renderLoadScreen(ctx);
    } else if (this.game.uiState.showInventory) {
      this.renderInventoryScreen(ctx);
    } else if (this.game.uiState.showTrading) {
      this.renderTradingScreen(ctx);
    } else if (this.game.uiState.showDiplomacy) {
      this.renderDiplomacyScreen(ctx);
    } else if (this.game.uiState.showGalaxyMap) {
      this.renderGalaxyMapScreen(ctx);
    }

    // Render popup window if active
    if (this.game.uiState.showPopup) {
      this.renderPopupWindow(ctx);
    }

    // Render small interaction prompt (NEW - two-stage system)
    if (this.game.uiState.showInteractionPrompt && !this.game.uiState.showPopup) {
      this.renderInteractionPrompt(ctx);
    }

    // Render surface exploration UI when landed
    if (this.game.player && this.game.player.landed) {
      this.renderSurfaceExplorationUI(ctx);
    }
  }

  /**
   * Render small interaction prompt - appears before full popup
   */
  renderInteractionPrompt(ctx) {
    const target = this.game.uiState.interactionPromptTarget;
    if (!target) return;

    const palette = this.game.PALETTE || {
      statusBlue: '#4488ff',
      voidBlack: '#000000',
      starWhite: '#ffffff',
      statusGreen: '#00ff88'
    };

    const player = this.game.player;
    if (!player) return;

    // Position the prompt near the bottom center of screen
    const w = 300;
    const h = 70;
    const x = (this.game.width - w) / 2;
    const y = this.game.height - 150;

    // Semi-transparent background with glow
    ctx.save();
    ctx.globalAlpha = 0.9;

    // Outer glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = 'rgba(0, 0, 20, 0.95)';
    ctx.fillRect(x, y, w, h);

    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = palette.statusBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Icon based on object type
    ctx.font = 'bold 16px DigitalDisco, monospace';
    ctx.fillStyle = palette.statusGreen;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const icons = {
      planet: '[PLT]',
      moon: '[MUN]',
      asteroid: '[AST]',
      station: '[STN]',
      artifact: '[ART]',
      warpgate: '[WRP]',
      ship: '[SHP]'
    };
    const icon = icons[target.type] || '[OBJ]';
    ctx.fillText(icon, x + w / 2, y + 25);

    // Object name/type
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillStyle = palette.starWhite;
    const objName = target.object?.name || target.type.toUpperCase();
    ctx.fillText(objName, x + w / 2, y + 45);

    // "Press E" prompt
    ctx.font = 'bold 12px DigitalDisco, monospace';
    ctx.fillStyle = palette.statusBlue;

    // Pulsing effect
    const pulse = Math.sin(this.time * 3) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    ctx.fillText('[E] INTERACT', x + w / 2, y + 60);

    ctx.restore();
  }

  /**
   * Draw CRT scanlines effect with vertical scan beam
   * PERFORMANCE: Uses cached canvas for scanlines
   */
  drawScanlines(ctx, x, y, w, h) {
    ctx.save();

    // PERFORMANCE: Cache scanlines to off-screen canvas
    const key = `scanlines_${Math.floor(w)}_${Math.floor(h)}`;
    if (!this.scanlinesCache.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const sctx = canvas.getContext('2d');
      sctx.globalAlpha = 0.15;
      sctx.fillStyle = '#000000';
      for (let i = 0; i < h; i += 2) {
        sctx.fillRect(0, i, w, 1);
      }
      this.scanlinesCache.set(key, canvas);
    }
    ctx.drawImage(this.scanlinesCache.get(key), x, y);

    // Vertical scan beam (like CRT electron gun sweep) - CACHED GRADIENT
    if (this.scanBeamY > y && this.scanBeamY < y + h) {
      const gradKey = `beam_${Math.floor(w)}`;
      if (!this.gradientCache.has(gradKey)) {
        const beamGradient = ctx.createLinearGradient(0, -30, 0, 30);
        beamGradient.addColorStop(0, 'rgba(100, 150, 255, 0)');
        beamGradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.15)');
        beamGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        this.gradientCache.set(gradKey, beamGradient);
      }

      ctx.globalAlpha = 0.3;
      ctx.fillStyle = this.gradientCache.get(gradKey);
      ctx.save();
      ctx.translate(x, this.scanBeamY);
      ctx.fillRect(0, -30, w, 60);
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draw screen noise/static with optimized performance
   * PERFORMANCE: Caches noise pattern and gradients
   */
  drawCRTNoise(ctx, x, y, w, h) {
    ctx.save();

    // PERFORMANCE: Only regenerate noise every 4 frames
    const noiseKey = `noise_${Math.floor(w)}_${Math.floor(h)}_${Math.floor(this.noiseFrame / 4)}`;
    if (!this.noiseCache.has(noiseKey)) {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const nctx = canvas.getContext('2d');

      // Draw noise dots once to cached canvas
      for (let i = 0; i < 100; i++) {
        const nx = Math.random() * w;
        const ny = Math.random() * h;
        const brightness = Math.random() * 255;
        nctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        nctx.fillRect(Math.floor(nx), Math.floor(ny), 1, 1);
      }

      this.noiseCache.set(noiseKey, canvas);

      // PERFORMANCE: Limit cache size to prevent memory leak
      if (this.noiseCache.size > 20) {
        const firstKey = this.noiseCache.keys().next().value;
        this.noiseCache.delete(firstKey);
      }
    }

    ctx.globalAlpha = 0.03 + this.glitchIntensity;
    ctx.drawImage(this.noiseCache.get(noiseKey), x, y);

    // Occasional horizontal glitch lines
    if (Math.random() < 0.1 + this.glitchIntensity) {
      const glitchY = y + Math.random() * h;
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(x, glitchY, w, 2);
    }

    // Chromatic aberration at edges (color separation)
    ctx.globalAlpha = 0.08;
    const aberrationSize = 2;

    // Red channel shift
    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
    ctx.fillRect(x - aberrationSize, y, aberrationSize, h); // Left edge
    ctx.fillRect(x + w, y, aberrationSize, h); // Right edge

    // Blue channel shift (opposite direction)
    ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.fillRect(x, y, aberrationSize, h); // Left edge
    ctx.fillRect(x + w - aberrationSize, y, aberrationSize, h); // Right edge

    // PERFORMANCE: Cache vignette gradient
    const vignetteKey = `vignette_${Math.floor(w)}_${Math.floor(h)}`;
    if (!this.gradientCache.has(vignetteKey)) {
      const vignette = ctx.createRadialGradient(
        w / 2, h / 2, Math.min(w, h) / 3,
        w / 2, h / 2, Math.max(w, h) / 1.5
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      this.gradientCache.set(vignetteKey, vignette);
    }
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = this.gradientCache.get(vignetteKey);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    ctx.restore();
  }

  /**
   * Draw damaged/rusty panel with CRT terminal styling
   */
  drawTerminalPanel(ctx, x, y, w, h, title, palette, isDamaged = true) {
    ctx.save();

    // ULTRA-ENHANCED: MASSIVE depth with 8 shadow layers instead of 3
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(x + 16, y + 16, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x + 14, y + 14, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x + 12, y + 12, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x + 10, y + 10, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 8, y + 8, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x + 6, y + 6, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 4, y + 4, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 2, y + 2, w, h);

    // Very dark background (almost black - retro terminal)
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x, y, w, h);

    // Pixelated texture background
    this.drawPixelatedTexture(ctx, x + 10, y + 10, w - 20, h - 20, '#0a0a0f', '#0f0f18');

    // PERFORMANCE: Cache panel gradient
    const panelGradKey = `panelGrad_${Math.floor(w)}_${Math.floor(h)}`;
    if (!this.gradientCache.has(panelGradKey)) {
      const gradient = ctx.createRadialGradient(
        w / 2, h / 2, 0,
        w / 2, h / 2, Math.max(w, h) / 1.8
      );
      gradient.addColorStop(0, 'rgba(20, 30, 40, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      this.gradientCache.set(panelGradKey, gradient);
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = this.gradientCache.get(panelGradKey);
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Damaged/rusty outer border (thick, weathered)
    if (isDamaged) {
      ctx.strokeStyle = '#1a1a22';
      ctx.lineWidth = 6;
      ctx.strokeRect(x, y, w, h);

      // ULTRA-ENHANCED: Rust spots and damage marks (MANY more varied colors and sizes)
      const rustColors = [
        '#442211', '#332211', '#553322', '#221100', '#443311',  // Original
        '#664433', '#554422', '#443300', '#552200', '#663311',  // Rust variants
        '#775544', '#886655', '#996666', '#aa7766', '#884433',  // Lighter rust
        '#221111', '#331111', '#442222', '#553333', '#664444'   // Dark rust
      ];
      const damageTypes = ['rect', 'line', 'dot', 'cluster', 'scratch'];

      // ULTRA-ENHANCED: 60 damage marks instead of 30 for MUCH more detail
      for (let i = 0; i < 60; i++) {
        const rx = x + Math.random() * w;
        const ry = y + Math.random() * h;
        const rsize = Math.random() * 12 + 3;
        const damageType = damageTypes[Math.floor(Math.random() * damageTypes.length)];

        ctx.globalAlpha = 0.3 + Math.random() * 0.4;
        ctx.fillStyle = rustColors[Math.floor(Math.random() * rustColors.length)];

        if (damageType === 'rect') {
          ctx.fillRect(rx, ry, rsize, rsize);
        } else if (damageType === 'line') {
          ctx.strokeStyle = rustColors[Math.floor(Math.random() * rustColors.length)];
          ctx.lineWidth = 1 + Math.random() * 2;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + rsize * 3, ry + (Math.random() - 0.5) * rsize);
          ctx.stroke();
        } else if (damageType === 'cluster') {
          // NEW: Cluster of small damage marks
          for (let c = 0; c < 3 + Math.floor(Math.random() * 4); c++) {
            const cx = rx + (Math.random() - 0.5) * rsize * 2;
            const cy = ry + (Math.random() - 0.5) * rsize * 2;
            const csize = rsize * 0.3;
            ctx.fillRect(cx, cy, csize, csize);
          }
        } else if (damageType === 'scratch') {
          // NEW: Scratchy texture
          ctx.strokeStyle = rustColors[Math.floor(Math.random() * rustColors.length)];
          ctx.lineWidth = 1;
          for (let s = 0; s < 2 + Math.floor(Math.random() * 3); s++) {
            ctx.beginPath();
            ctx.moveTo(rx + s * 2, ry);
            ctx.lineTo(rx + s * 2 + rsize, ry + (Math.random() - 0.5) * rsize);
            ctx.stroke();
          }
        } else { // dot
          ctx.beginPath();
          ctx.arc(rx, ry, rsize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // Scratches on edges
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
        let sx, sy, ex, ey;

        if (edge === 0) { // top
          sx = x + Math.random() * w;
          sy = y;
          ex = sx + (Math.random() - 0.5) * 50;
          ey = y + Math.random() * 30;
        } else if (edge === 1) { // right
          sx = x + w;
          sy = y + Math.random() * h;
          ex = sx - Math.random() * 30;
          ey = sy + (Math.random() - 0.5) * 50;
        } else if (edge === 2) { // bottom
          sx = x + Math.random() * w;
          sy = y + h;
          ex = sx + (Math.random() - 0.5) * 50;
          ey = sy - Math.random() * 30;
        } else { // left
          sx = x;
          sy = y + Math.random() * h;
          ex = sx + Math.random() * 30;
          ey = sy + (Math.random() - 0.5) * 50;
        }

        ctx.globalAlpha = 0.2 + Math.random() * 0.3;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    }

    // Main border with phosphor glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = palette.statusBlue;
    ctx.strokeStyle = palette.statusBlue;
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    ctx.shadowBlur = 0;

    // Inner glowing border
    ctx.strokeStyle = palette.warpBlue;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);

    // 3D bevel for depth
    this.draw3DBevel(ctx, x + 3, y + 3, w - 6, h - 6, false);

    // Pixelated corner brackets (larger, more mechanical)
    const cornerSize = 25;
    ctx.strokeStyle = palette.cautionOrange;
    ctx.lineWidth = 4;

    // Draw mechanical corner brackets
    [
      {x: x + 6, y: y + 6, dx: 1, dy: 1},           // Top-left
      {x: x + w - 6, y: y + 6, dx: -1, dy: 1},     // Top-right
      {x: x + 6, y: y + h - 6, dx: 1, dy: -1},     // Bottom-left
      {x: x + w - 6, y: y + h - 6, dx: -1, dy: -1} // Bottom-right
    ].forEach(corner => {
      // Outer bracket
      ctx.beginPath();
      ctx.moveTo(corner.x, corner.y + cornerSize * corner.dy);
      ctx.lineTo(corner.x, corner.y);
      ctx.lineTo(corner.x + cornerSize * corner.dx, corner.y);
      ctx.stroke();

      // Inner detail
      ctx.lineWidth = 2;
      ctx.strokeStyle = palette.warpBlue;
      ctx.beginPath();
      ctx.moveTo(corner.x + 4 * corner.dx, corner.y + 4 * corner.dy);
      ctx.lineTo(corner.x + 4 * corner.dx, corner.y + 4 * corner.dy);
      ctx.lineTo(corner.x + 8 * corner.dx, corner.y + 4 * corner.dy);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.strokeStyle = palette.cautionOrange;
    });

    // Corner rivets for mechanical detail
    const rivetSize = 8;
    const rivetOffset = 20;
    this.drawRivet(ctx, x + rivetOffset, y + rivetOffset, rivetSize, palette);
    this.drawRivet(ctx, x + w - rivetOffset, y + rivetOffset, rivetSize, palette);
    this.drawRivet(ctx, x + rivetOffset, y + h - rivetOffset, rivetSize, palette);
    this.drawRivet(ctx, x + w - rivetOffset, y + h - rivetOffset, rivetSize, palette);

    // Title bar with mechanical styling
    if (title) {
      // Title background - darker with texture
      ctx.fillStyle = '#0f0f18';
      ctx.fillRect(x + 10, y + 10, w - 20, 50);

      // Title border
      ctx.strokeStyle = palette.statusBlue;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 10, y + 10, w - 20, 50);

      // Decorative lines (mechanical detail)
      ctx.strokeStyle = '#334455';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 30);
      ctx.lineTo(x + w - 10, y + 30);
      ctx.stroke();

      // Title text with phosphor glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = palette.warpBlue;
      ctx.fillStyle = palette.warpBlue;
      ctx.font = 'bold 22px DigitalDisco, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(title, x + 25, y + 42);
      ctx.shadowBlur = 0;

      // Decorative line under title with glow
      ctx.shadowBlur = 5;
      ctx.shadowColor = palette.statusBlue;
      ctx.strokeStyle = palette.statusBlue;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 60);
      ctx.lineTo(x + w - 15, y + 60);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Terminal indicator LEDs
      for (let i = 0; i < 3; i++) {
        const ledX = x + w - 60 + i * 18;
        const ledY = y + 35;
        const ledOn = (this.time * (i + 1)) % 2 < 1;

        ctx.fillStyle = ledOn ? ['#00ff00', '#ffaa00', '#ff0000'][i] : '#222222';
        ctx.beginPath();
        ctx.arc(ledX, ledY, 4, 0, Math.PI * 2);
        ctx.fill();

        if (ledOn) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = ['#00ff00', '#ffaa00', '#ff0000'][i];
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    ctx.restore();
  }

  /**
   * Draw retro terminal button
   */
  drawTerminalButton(ctx, x, y, w, h, text, isSelected, palette) {
    ctx.save();

    // Button shadow (deeper, multi-layer)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x + 4, y + 4, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 3, y + 3, w, h);

    // Button background with depth
    if (isSelected) {
      // Glowing selected state
      ctx.shadowBlur = 15;
      ctx.shadowColor = palette.cautionOrange;
      ctx.fillStyle = '#334466';
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = palette.statusBlue;
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

      // Pixelated texture on button
      this.drawPixelatedTexture(ctx, x + 4, y + 4, w - 8, h - 8, palette.statusBlue, '#558899');

      ctx.fillStyle = '#558899';
      ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
    } else {
      ctx.fillStyle = '#1a1a22';
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = '#0f0f18';
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

      // Subtle texture on unselected
      this.drawPixelatedTexture(ctx, x + 4, y + 4, w - 8, h - 8, '#0f0f18', '#1a1a22');
    }

    // Button border with mechanical detail
    ctx.strokeStyle = isSelected ? palette.cautionOrange : '#334455';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Inner border
    ctx.strokeStyle = isSelected ? palette.warpBlue : '#223344';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

    // 3D bevel
    this.draw3DBevel(ctx, x + 1, y + 1, w - 2, h - 2, !isSelected);

    // Button text with embossed 3D effect
    const textX = x + w / 2;
    const textY = y + h / 2 + 1;
    const font = 'bold 14px DigitalDisco, monospace';
    const color = isSelected ? palette.starWhite : '#88aacc';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isSelected) {
      this.drawEmbossedText(ctx, text, textX, textY, font, color, palette);
    } else {
      // Simple glow for unselected
      ctx.shadowBlur = 4;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.font = font;
      ctx.fillText(text, textX, textY);
    }

    ctx.restore();
  }

  /**
   * Draw retro progress bar with segmented display
   */
  drawTerminalProgressBar(ctx, x, y, w, h, value, max, color, palette) {
    const percent = Math.max(0, Math.min(1, value / max));

    ctx.save();

    // Bar shadow (deeper)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x + 3, y + 3, w, h);

    // Background - dark with indent effect
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x, y, w, h);

    // Pixelated background texture
    this.drawPixelatedTexture(ctx, x + 2, y + 2, w - 4, h - 4, '#0a0a0f', '#0f0f18');

    // Border
    ctx.strokeStyle = '#334455';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Inset 3D bevel
    this.draw3DBevel(ctx, x + 1, y + 1, w - 2, h - 2, true);

    // Segmented fill
    const segments = 20;
    const segmentWidth = (w - 8) / segments;
    const fillSegments = Math.floor(percent * segments);

    for (let i = 0; i < fillSegments; i++) {
      const segX = x + 4 + i * segmentWidth;

      // Segment glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;

      // Gradient per segment for depth
      const segGradient = ctx.createLinearGradient(segX, y + 4, segX, y + h - 4);
      segGradient.addColorStop(0, color);
      segGradient.addColorStop(0.5, this.lightenColor(color, 40));
      segGradient.addColorStop(1, this.darkenColor(color, 20));

      ctx.fillStyle = segGradient;
      ctx.fillRect(segX, y + 4, segmentWidth - 2, h - 8);
    }

    ctx.shadowBlur = 0;

    // Percentage text with terminal styling
    ctx.fillStyle = percent > 0.3 ? '#000000' : palette.starWhite;
    ctx.font = 'bold 11px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 3;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.fillText(`${Math.floor(percent * 100)}%`, x + w / 2, y + h / 2);

    ctx.restore();
  }

  /**
   * Lighten color helper
   */
  lightenColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Darken color helper
   */
  darkenColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Draw pixelated texture background
   */
  drawPixelatedTexture(ctx, x, y, w, h, color1 = '#0a0a0f', color2 = '#0f0f18') {
    ctx.save();

    // ULTRA-ENHANCED: THOUSANDS of tiny pixels (1-2px) for incredibly detailed texture
    const pixelSize = 2; // Changed from 4 to 2 - 4x more pixels!

    // ULTRA-ENHANCED: Multi-color palette for realistic varied texture
    const textureColors = [
      color1,           // Base dark
      color2,           // Slightly lighter
      '#12121a',        // Medium dark
      '#0d0d15',        // Variant 1
      '#0e0e16',        // Variant 2
      '#11111b',        // Variant 3
      '#13131d',        // Variant 4
      '#0c0c14',        // Darker variant
      '#0f0f19',        // Mid variant
      '#14141e'         // Lighter variant
    ];

    // Draw thousands of tiny varied pixels for ultra-detailed texture
    for (let px = 0; px < w; px += pixelSize) {
      for (let py = 0; py < h; py += pixelSize) {
        const noise = Math.random();

        // ENHANCED: More varied distribution (not just 50/50)
        if (noise > 0.3) { // 70% of pixels get texture
          // Select color based on noise for varied texture
          const colorIndex = Math.floor(noise * textureColors.length);
          ctx.fillStyle = textureColors[Math.min(colorIndex, textureColors.length - 1)];
          ctx.fillRect(x + px, y + py, pixelSize, pixelSize);
        }

        // ULTRA-ENHANCED: Add rare bright pixels for detail/depth
        if (noise > 0.97) { // 3% chance for bright detail pixels
          ctx.fillStyle = 'rgba(40, 50, 60, 0.3)';
          ctx.fillRect(x + px, y + py, pixelSize, pixelSize);
        }

        // ULTRA-ENHANCED: Add even rarer super-dark pixels for contrast
        if (noise < 0.05) { // 5% chance for extra-dark pixels
          ctx.fillStyle = '#060609';
          ctx.fillRect(x + px, y + py, pixelSize, pixelSize);
        }
      }
    }
    ctx.restore();
  }

  /**
   * Draw 3D bevel effect
   */
  draw3DBevel(ctx, x, y, w, h, isInset = false) {
    ctx.save();

    const highlightColor = isInset ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.2)';
    const shadowColor = isInset ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.5)';

    // Top and left highlights
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();

    // Bottom and right shadows
    ctx.strokeStyle = shadowColor;
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw rivet/bolt detail
   */
  drawRivet(ctx, x, y, size = 6, palette) {
    ctx.save();

    // Outer shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(x + 1, y + 1, size, 0, Math.PI * 2);
    ctx.fill();

    // Main rivet body
    const gradient = ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
    gradient.addColorStop(0, '#556677');
    gradient.addColorStop(0.5, '#334455');
    gradient.addColorStop(1, '#1a1a22');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - size/3, y - size/3, size/3, 0, Math.PI * 2);
    ctx.fill();

    // Center screw slot
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - size/2, y);
    ctx.lineTo(x + size/2, y);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw embossed text with 3D effect
   */
  drawEmbossedText(ctx, text, x, y, font, color, palette) {
    ctx.save();

    // Deep shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = font;
    ctx.fillText(text, x + 2, y + 2);

    // Dark outline
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText(text, x + 1, y + 1);

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillText(text, x - 1, y - 1);

    // Main text
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    ctx.restore();
  }

  /**
   * Draw data display panel (for info sections)
   */
  drawDataPanel(ctx, x, y, w, h, palette) {
    ctx.save();

    // Panel shadow (multi-layer)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x + 3, y + 3, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x + 2, y + 2, w, h);

    // Background
    ctx.fillStyle = '#0f0f18';
    ctx.fillRect(x, y, w, h);

    // Pixelated texture background
    this.drawPixelatedTexture(ctx, x + 2, y + 2, w - 4, h - 4, '#0f0f18', '#1a1a22');

    // Subtle grid pattern for depth (enhanced)
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#1a1a22';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 20) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i, y + h);
      ctx.stroke();
    }
    for (let i = 0; i < h; i += 20) {
      ctx.beginPath();
      ctx.moveTo(x, y + i);
      ctx.lineTo(x + w, y + i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Border
    ctx.strokeStyle = '#334455';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Inner accent
    ctx.strokeStyle = palette.statusBlue + '44';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

    // 3D inset bevel
    this.draw3DBevel(ctx, x + 1, y + 1, w - 2, h - 2, true);

    // Corner rivets on data panels
    const rivetSize = 5;
    this.drawRivet(ctx, x + 10, y + 10, rivetSize, palette);
    this.drawRivet(ctx, x + w - 10, y + 10, rivetSize, palette);
    this.drawRivet(ctx, x + 10, y + h - 10, rivetSize, palette);
    this.drawRivet(ctx, x + w - 10, y + h - 10, rivetSize, palette);

    ctx.restore();
  }

  /**
   * INVENTORY SCREEN - Enhanced Terminal Style
   */
  renderInventoryScreen(ctx) {
    const palette = this.game.PALETTE;
    const w = 1300;
    const h = 850;
    const x = (this.game.width - w) / 2;
    const y = (this.game.height - h) / 2;

    // Clear and initialize button bounds for touch interaction
    this.game.inventoryButtonBounds = [];

    // Main panel with damaged terminal styling
    this.drawTerminalPanel(ctx, x, y, w, h, '[INV] SHIP INVENTORY & CARGO MANIFEST', palette);

    // Close button (X) in top-right corner
    const closeButtonSize = 40;
    const closeX = x + w - closeButtonSize - 20;
    const closeY = y + 20;
    this.drawTerminalButton(ctx, closeX, closeY, closeButtonSize, closeButtonSize, 'X', false, palette);
    this.game.inventoryButtonBounds.push({
      x: closeX,
      y: closeY,
      w: closeButtonSize,
      h: closeButtonSize,
      action: () => {
        this.game.uiState.showInventory = false;
        if (this.game.mobileControls) {
          this.game.mobileControls.buttons.inventory.active = false;
        }
      }
    });

    // Tab buttons
    const tabs = ['CARGO', 'ARTIFACTS', 'SHIP STATUS'];
    const tabNames = ['cargo', 'artifacts', 'ship'];
    const tabW = 200;
    const tabH = 40;
    const tabY = y + 80;

    for (let i = 0; i < tabs.length; i++) {
      const tabX = x + 25 + i * (tabW + 15);
      const isSelected = this.game.uiState.selectedTab === tabNames[i];

      this.drawTerminalButton(ctx, tabX, tabY, tabW, tabH, tabs[i], isSelected, palette);

      // Store button bounds for touch interaction
      this.game.inventoryButtonBounds.push({
        x: tabX,
        y: tabY,
        w: tabW,
        h: tabH,
        action: () => {
          this.game.uiState.selectedTab = tabNames[i];
        }
      });
    }

    // Content area
    const contentY = tabY + tabH + 25;
    const contentH = h - 140 - tabH;

    if (this.game.uiState.selectedTab === 'cargo') {
      this.renderCargoTab(ctx, x + 25, contentY, w - 50, contentH, palette);
    } else if (this.game.uiState.selectedTab === 'artifacts') {
      this.renderArtifactsTab(ctx, x + 25, contentY, w - 50, contentH, palette);
    } else {
      this.renderShipStatusTab(ctx, x + 25, contentY, w - 50, contentH, palette);
    }

    // CRT effects
    this.drawScanlines(ctx, x, y, w, h);
    this.drawCRTNoise(ctx, x, y, w, h);

    // Help text with terminal styling
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = '#88aacc';
    ctx.font = '12px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[I] Close Inventory | [ESC] Close All UI | [1-3] Switch Tabs', x + w / 2, y + h - 25);
    ctx.restore();
  }

  renderCargoTab(ctx, x, y, w, h, palette) {
    const cargo = this.game.economySystem.cargo;
    const capacity = this.game.economySystem.cargoCapacity;
    const used = this.game.economySystem.getCargoSpaceUsed();

    // Header section with data panel
    this.drawDataPanel(ctx, x, y, w, 80, palette);

    // Capacity label
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 16px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`CARGO CAPACITY: ${used} / ${capacity} UNITS`, x + 15, y + 25);
    ctx.restore();

    this.drawTerminalProgressBar(ctx, x + 15, y + 35, w - 30, 30, used, capacity, palette.statusGreen, palette);

    // Cargo grid
    const gridY = y + 100;
    const itemsPerRow = 3;
    const itemW = (w - 60) / itemsPerRow;
    const itemH = 140;

    if (cargo.length === 0) {
      ctx.save();
      ctx.fillStyle = '#556677';
      ctx.font = '20px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 8;
      ctx.shadowColor = palette.statusBlue;
      ctx.fillText('CARGO HOLD EMPTY', x + w / 2, gridY + 100);
      ctx.font = '14px DigitalDisco, monospace';
      ctx.fillStyle = '#445566';
      ctx.shadowBlur = 4;
      ctx.fillText('Purchase goods at trading stations', x + w / 2, gridY + 130);
      ctx.restore();
    } else {
      for (let i = 0; i < cargo.length; i++) {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        const itemX = x + col * itemW + 10;
        const itemY = gridY + row * (itemH + 15);

        this.renderCargoItem(ctx, itemX, itemY, itemW - 20, itemH, cargo[i], palette);
      }
    }
  }

  renderCargoItem(ctx, x, y, w, h, cargoItem, palette) {
    ctx.save();

    // Item shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x + 4, y + 4, w, h);

    // Item background - very dark
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x, y, w, h);

    // Item border with glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = palette.statusBlue;
    ctx.strokeStyle = palette.statusBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;

    // Commodity name with glow
    ctx.shadowBlur = 6;
    ctx.shadowColor = palette.plasmaGreen;
    ctx.fillStyle = palette.plasmaGreen;
    ctx.font = 'bold 15px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(cargoItem.commodity.name.toUpperCase(), x + 12, y + 28);
    ctx.shadowBlur = 0;

    // Category badge with depth
    const categoryColor = this.getCategoryColor(cargoItem.commodity.category, palette);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x + 14, y + 40, 90, 24);

    ctx.shadowBlur = 8;
    ctx.shadowColor = categoryColor;
    ctx.fillStyle = categoryColor;
    ctx.fillRect(x + 12, y + 38, 90, 24);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(cargoItem.commodity.category.toUpperCase(), x + 57, y + 52);

    // Quantity and volume
    ctx.fillStyle = '#aabbcc';
    ctx.font = '12px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`QTY: ${cargoItem.quantity}`, x + 12, y + 80);
    ctx.fillText(`VOL: ${cargoItem.commodity.volume * cargoItem.quantity} units`, x + 12, y + 98);

    // Purchase price with shadow
    ctx.shadowBlur = 4;
    ctx.shadowColor = palette.cautionOrange;
    ctx.fillStyle = palette.cautionOrange;
    ctx.font = 'bold 12px DigitalDisco, monospace';
    ctx.fillText(`BOUGHT: ${cargoItem.purchasePrice} CR/unit`, x + 12, y + h - 15);

    ctx.restore();
  }

  getCategoryColor(category, palette) {
    const colors = {
      'basic': '#88aa44',
      'industrial': '#4488ff',
      'luxury': '#aa44ff',
      'special': '#ff8844',
      'contraband': '#ff4444',
      'rare': '#ffaa00'
    };
    return colors[category] || palette.statusBlue;
  }

  renderArtifactsTab(ctx, x, y, w, h, palette) {
    // Import items from EnhancedItems - in real implementation this would be player's inventory
    const ENHANCED_ARTIFACTS = this.game.ENHANCED_ARTIFACTS || {};
    const allItems = Object.values(ENHANCED_ARTIFACTS);

    // Initialize inventory scroll state if not exists
    if (!this.game.inventoryScrollState) {
      this.game.inventoryScrollState = {
        scrollOffset: 0,
        selectedCategory: 'all'
      };
    }

    const scrollState = this.game.inventoryScrollState;

    // Category filter buttons
    const categories = ['all', 'weapon', 'equipment', 'resource', 'material', 'ammo', 'ancient_tech', 'alien_relic'];
    const categoryLabels = {
      'all': 'ALL ITEMS',
      'weapon': 'WEAPONS',
      'equipment': 'EQUIPMENT',
      'resource': 'RESOURCES',
      'material': 'MATERIALS',
      'ammo': 'AMMUNITION',
      'ancient_tech': 'ANCIENT TECH',
      'alien_relic': 'ALIEN RELICS'
    };

    // Header with category tabs
    const headerH = 100;
    this.drawDataPanel(ctx, x, y, w, headerH, palette);

    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 16px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`◆ INVENTORY DATABASE ◆`, x + 15, y + 25);
    ctx.restore();

    // Category filter tabs (2 rows)
    const tabW = 150;
    const tabH = 28;
    const tabsPerRow = 4;
    const tabStartY = y + 40;

    if (!this.game.inventoryButtonBounds) this.game.inventoryButtonBounds = [];

    for (let i = 0; i < categories.length; i++) {
      const row = Math.floor(i / tabsPerRow);
      const col = i % tabsPerRow;
      const tabX = x + 15 + col * (tabW + 8);
      const tabY = tabStartY + row * (tabH + 5);
      const cat = categories[i];
      const isSelected = scrollState.selectedCategory === cat;

      // Tab background
      ctx.fillStyle = isSelected ? 'rgba(68, 136, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(tabX, tabY, tabW, tabH);

      // Tab border
      ctx.strokeStyle = isSelected ? palette.statusBlue : '#445566';
      ctx.lineWidth = isSelected ? 2 : 1;
      if (isSelected) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = palette.statusBlue;
      }
      ctx.strokeRect(tabX, tabY, tabW, tabH);
      ctx.shadowBlur = 0;

      // Tab label
      ctx.fillStyle = isSelected ? palette.statusBlue : '#88aacc';
      ctx.font = `${isSelected ? 'bold ' : ''}11px DigitalDisco, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(categoryLabels[cat], tabX + tabW / 2, tabY + tabH / 2 + 4);

      // Store bounds for click detection
      this.game.inventoryButtonBounds.push({
        x: tabX,
        y: tabY,
        w: tabW,
        h: tabH,
        action: () => {
          scrollState.selectedCategory = cat;
          scrollState.scrollOffset = 0;
        }
      });
    }

    // Filter items by selected category
    const filteredItems = scrollState.selectedCategory === 'all'
      ? allItems
      : allItems.filter(item => item.category === scrollState.selectedCategory);

    // Item count display
    ctx.fillStyle = '#88aacc';
    ctx.font = '12px DigitalDisco, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${filteredItems.length} items`, x + w - 15, y + 25);

    // Grid settings
    const gridY = y + headerH + 10;
    const gridH = h - headerH - 10;
    const itemsPerRow = 8;
    const iconSize = 64;
    const itemSpacing = 10;
    const itemCellW = iconSize + itemSpacing;
    const itemCellH = iconSize + 40 + itemSpacing;

    // Calculate scroll
    const totalRows = Math.ceil(filteredItems.length / itemsPerRow);
    const maxScroll = Math.max(0, totalRows * itemCellH - gridH);

    if (filteredItems.length === 0) {
      ctx.save();
      ctx.fillStyle = '#556677';
      ctx.font = '18px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 8;
      ctx.shadowColor = palette.statusBlue;
      ctx.fillText('NO ITEMS IN THIS CATEGORY', x + w / 2, gridY + gridH / 2 - 10);
      ctx.font = '13px DigitalDisco, monospace';
      ctx.fillStyle = '#445566';
      ctx.shadowBlur = 4;
      ctx.fillText('Select a different category or explore to find items', x + w / 2, gridY + gridH / 2 + 15);
      ctx.restore();
    } else {
      // Clip to grid area
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, gridY, w, gridH);
      ctx.clip();

      // Draw grid of items
      for (let i = 0; i < filteredItems.length; i++) {
        const item = filteredItems[i];
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;

        const itemX = x + 15 + col * itemCellW;
        const itemY = gridY + row * itemCellH - scrollState.scrollOffset;

        // Skip if out of view
        if (itemY + itemCellH < gridY || itemY > gridY + gridH) continue;

        // Draw item icon using pixelated icon system
        this.drawPixelatedItemIcon(ctx, itemX, itemY, iconSize, item.icon, item.rarity);

        // Item name below icon
        ctx.fillStyle = this.getRarityColor(item.rarity);
        ctx.font = '9px DigitalDisco, monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 3;
        ctx.shadowColor = this.getRarityColor(item.rarity);

        // Truncate long names
        let displayName = item.name;
        if (displayName.length > 12) {
          displayName = displayName.substring(0, 11) + '..';
        }
        ctx.fillText(displayName, itemX + iconSize / 2, itemY + iconSize + 12);

        // Item quantity (if stackable) or category
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#88aacc';
        ctx.font = '8px DigitalDisco, monospace';
        const subText = item.stackable ? 'x1' : item.category.substring(0, 8).toUpperCase();
        ctx.fillText(subText, itemX + iconSize / 2, itemY + iconSize + 23);

        // Store bounds for click/hover
        this.game.inventoryButtonBounds.push({
          x: itemX,
          y: itemY,
          w: iconSize,
          h: iconSize + 30,
          action: () => {
            console.log('Selected item:', item.name);
            // Future: Show item details panel
          }
        });
      }

      ctx.restore();

      // Scrollbar if needed
      if (maxScroll > 0) {
        const scrollbarW = 8;
        const scrollbarH = Math.max(30, (gridH / (totalRows * itemCellH)) * gridH);
        const scrollbarX = x + w - scrollbarW - 10;
        const scrollbarY = gridY + (scrollState.scrollOffset / maxScroll) * (gridH - scrollbarH);

        // Scrollbar track
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(scrollbarX, gridY, scrollbarW, gridH);

        // Scrollbar thumb
        ctx.fillStyle = palette.statusBlue;
        ctx.shadowBlur = 5;
        ctx.shadowColor = palette.statusBlue;
        ctx.fillRect(scrollbarX, scrollbarY, scrollbarW, scrollbarH);
        ctx.shadowBlur = 0;
      }
    }

    // Scroll hint
    ctx.fillStyle = '#667788';
    ctx.font = '10px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[Mouse Wheel] Scroll | [Click] View Details', x + w / 2, y + h - 5);
  }

  getRarityColor(rarity) {
    const colors = {
      common: '#888888',
      uncommon: '#4488ff',
      rare: '#8844ff',
      epic: '#ff00ff',
      legendary: '#ffaa00',
      quest: '#00ffaa'
    };
    return colors[rarity] || '#888888';
  }

  renderArtifactItem(ctx, x, y, w, h, artifact, palette) {
    // Rarity colors with phosphor glow
    const rarityColors = {
      'uncommon': '#88ff88',
      'rare': '#4488ff',
      'epic': '#aa44ff',
      'legendary': '#ffaa00'
    };
    const rarityColor = rarityColors[artifact.rarity] || palette.statusBlue;

    ctx.save();

    // Deep shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x + 5, y + 5, w, h);

    // Background with rarity glow
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = `${rarityColor}18`;
    ctx.fillRect(x, y, w, h);

    // Item border with intense glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = rarityColor;
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    ctx.shadowBlur = 0;

    // Artifact name with glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = rarityColor;
    ctx.fillStyle = rarityColor;
    ctx.font = 'bold 17px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(artifact.name.toUpperCase(), x + 12, y + 28);
    ctx.shadowBlur = 0;

    // Rarity badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x + 14, y + 42, 110, 26);

    ctx.shadowBlur = 10;
    ctx.shadowColor = rarityColor;
    ctx.fillStyle = rarityColor;
    ctx.fillRect(x + 12, y + 40, 110, 26);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 13px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(artifact.rarity.toUpperCase(), x + 67, y + 56);

    // Description
    ctx.fillStyle = '#aabbcc';
    ctx.font = '11px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    this.wrapText(ctx, artifact.description, x + 12, y + 85, w - 24, 16);

    // Effect
    ctx.shadowBlur = 4;
    ctx.shadowColor = palette.plasmaGreen;
    ctx.fillStyle = palette.plasmaGreen;
    ctx.font = 'bold 11px DigitalDisco, monospace';
    ctx.fillText('EFFECT:', x + 12, y + 130);
    ctx.shadowBlur = 0;

    ctx.fillStyle = palette.statusBlue;
    ctx.font = '10px DigitalDisco, monospace';
    this.wrapText(ctx, artifact.effect, x + 12, y + 145, w - 24, 15);

    // Value
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.cautionOrange;
    ctx.fillStyle = palette.cautionOrange;
    ctx.font = 'bold 13px DigitalDisco, monospace';
    ctx.fillText(`VALUE: ${artifact.value.toLocaleString()} CREDITS`, x + 12, y + h - 15);

    ctx.restore();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let yPos = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, yPos);
        line = words[i] + ' ';
        yPos += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, yPos);
  }

  renderShipStatusTab(ctx, x, y, w, h, palette) {
    const p = this.game.player;
    const weapons = this.game.weaponSystem.getAllWeapons();
    const shields = this.game.shieldSystem ? this.game.shieldSystem.shields : [];

    // Left column - Ship systems
    const leftPanel = {x, y, w: (w - 20) / 2, h: h - 150};
    this.drawDataPanel(ctx, leftPanel.x, leftPanel.y, leftPanel.w, leftPanel.h, palette);

    ctx.save();
    // Ship status header
    ctx.shadowBlur = 8;
    ctx.shadowColor = palette.warpBlue;
    ctx.fillStyle = palette.warpBlue;
    ctx.font = 'bold 18px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('▣ SHIP CONFIGURATION', leftPanel.x + 15, leftPanel.y + 30);
    ctx.shadowBlur = 0;

    let yPos = leftPanel.y + 70;

    // Hull status
    ctx.fillStyle = palette.statusGreen;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('HULL INTEGRITY', leftPanel.x + 15, yPos);
    this.drawTerminalProgressBar(ctx, leftPanel.x + 15, yPos + 10, leftPanel.w - 30, 28, p.hull, p.maxHull, palette.statusGreen, palette);
    yPos += 60;

    // Shield status
    ctx.shadowBlur = 4;
    ctx.shadowColor = palette.shieldCyan;
    ctx.fillStyle = palette.shieldCyan;
    ctx.fillText('SHIELD STRENGTH', leftPanel.x + 15, yPos);
    ctx.shadowBlur = 0;
    this.drawTerminalProgressBar(ctx, leftPanel.x + 15, yPos + 10, leftPanel.w - 30, 28, p.shields, p.maxShields, palette.shieldCyan, palette);
    yPos += 60;

    // Power status
    ctx.shadowBlur = 4;
    ctx.shadowColor = palette.warpBlue;
    ctx.fillStyle = palette.warpBlue;
    ctx.fillText('POWER CORE', leftPanel.x + 15, yPos);
    ctx.shadowBlur = 0;
    this.drawTerminalProgressBar(ctx, leftPanel.x + 15, yPos + 10, leftPanel.w - 30, 28, p.power, p.maxPower, palette.warpBlue, palette);
    yPos += 70;

    // Weapons list
    ctx.shadowBlur = 6;
    ctx.shadowColor = palette.plasmaGreen;
    ctx.fillStyle = palette.plasmaGreen;
    ctx.font = 'bold 16px DigitalDisco, monospace';
    ctx.fillText('⚔ WEAPON SYSTEMS', leftPanel.x + 15, yPos);
    ctx.shadowBlur = 0;
    yPos += 35;

    ctx.font = '12px DigitalDisco, monospace';
    for (let i = 0; i < weapons.length && i < 4; i++) {
      const weapon = weapons[i];
      ctx.fillStyle = palette.statusBlue;
      ctx.fillText(`[${i + 1}] ${weapon.name}`, leftPanel.x + 20, yPos);
      ctx.fillStyle = '#88aacc';
      ctx.fillText(`DMG: ${Math.floor(weapon.damage)} | CD: ${weapon.maxCooldown.toFixed(2)}s`, leftPanel.x + 260, yPos);
      yPos += 22;
    }

    // Right column - Ship stats
    const rightPanel = {x: x + (w + 20) / 2, y, w: (w - 20) / 2, h: h - 150};
    this.drawDataPanel(ctx, rightPanel.x, rightPanel.y, rightPanel.w, rightPanel.h, palette);

    yPos = rightPanel.y + 70;

    // System temperature
    ctx.shadowBlur = 4;
    ctx.shadowColor = palette.cautionOrange;
    ctx.fillStyle = palette.cautionOrange;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('THERMAL STATUS', rightPanel.x + 15, yPos);
    ctx.shadowBlur = 0;

    const temp = p.temperature || 20;
    this.drawTerminalProgressBar(ctx, rightPanel.x + 15, yPos + 10, rightPanel.w - 30, 28, temp, 100, palette.cautionOrange, palette);

    ctx.fillStyle = '#88aacc';
    ctx.font = '11px DigitalDisco, monospace';
    ctx.fillText(`${Math.floor(temp)}°C - ${p.heatStatus || 'SAFE'}`, rightPanel.x + 20, yPos + 50);
    yPos += 90;

    // Ship mass
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('SHIP MASS', rightPanel.x + 15, yPos);
    ctx.fillStyle = '#aabbcc';
    ctx.font = '20px DigitalDisco, monospace';
    ctx.fillText(`${p.mass || 100} TONS`, rightPanel.x + 20, yPos + 35);
    yPos += 75;

    // Kills and score
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.plasmaGreen;
    ctx.fillStyle = palette.plasmaGreen;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('COMBAT RECORD', rightPanel.x + 15, yPos);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#aabbcc';
    ctx.font = '14px DigitalDisco, monospace';
    ctx.fillText(`Kills: ${p.kills || 0}`, rightPanel.x + 20, yPos + 30);
    ctx.fillText(`Score: ${p.score || 0}`, rightPanel.x + 20, yPos + 52);

    ctx.restore();
  }

  /**
   * TRADING SCREEN - Enhanced Terminal Style
   */
  renderTradingScreen(ctx) {
    const palette = this.game.PALETTE;
    const w = 1450;
    const h = 880;
    const x = (this.game.width - w) / 2;
    const y = (this.game.height - h) / 2;

    // Clear and initialize button bounds for touch interaction
    this.game.tradingButtonBounds = [];

    // Main panel
    this.drawTerminalPanel(ctx, x, y, w, h, '[TRD] TRADING TERMINAL - STATION MARKETPLACE', palette);

    // Close button (X) in top-right corner
    const closeButtonSize = 40;
    const closeX = x + w - closeButtonSize - 20;
    const closeY = y + 20;
    this.drawTerminalButton(ctx, closeX, closeY, closeButtonSize, closeButtonSize, 'X', false, palette);
    this.game.tradingButtonBounds.push({
      x: closeX,
      y: closeY,
      w: closeButtonSize,
      h: closeButtonSize,
      action: () => {
        this.game.uiState.showTrading = false;
        if (this.game.mobileControls) {
          this.game.mobileControls.buttons.trade.active = false;
        }
      }
    });

    // Station info panel
    this.drawDataPanel(ctx, x + 20, y + 75, w - 40, 50, palette);

    ctx.save();
    ctx.fillStyle = palette.statusBlue;
    ctx.font = '14px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    const systemName = this.game.currentSystemData ? this.game.currentSystemData.name : 'Unknown';
    const factionName = this.game.currentSystemData && this.game.currentSystemData.faction
      ? this.game.currentSystemData.faction.replace(/_/g, ' ').toUpperCase()
      : 'INDEPENDENT';
    ctx.fillText(`SYSTEM: ${systemName} | FACTION: ${factionName}`, x + 35, y + 100);

    // Player credits with glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffaa00';
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 18px DigitalDisco, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`CREDITS: ${this.game.economySystem.credits.toLocaleString()} CR`, x + w - 35, y + 100);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Tab buttons
    const tabs = ['BUY', 'SELL', 'REFUEL'];
    const tabW = 170;
    const tabH = 42;
    const tabY = y + 145;

    for (let i = 0; i < tabs.length; i++) {
      const tabX = x + 25 + i * (tabW + 15);
      const isSelected = (i === 0 && this.game.uiState.selectedTradeTab === 'buy') ||
                         (i === 1 && this.game.uiState.selectedTradeTab === 'sell') ||
                         (i === 2 && this.game.uiState.selectedTradeTab === 'refuel');

      this.drawTerminalButton(ctx, tabX, tabY, tabW, tabH, tabs[i], isSelected, palette);
    }

    // Content area
    const contentY = tabY + tabH + 25;
    const contentH = h - 200 - tabH;

    if (this.game.uiState.selectedTradeTab === 'buy') {
      this.renderBuyTab(ctx, x + 25, contentY, w - 50, contentH, palette);
    } else if (this.game.uiState.selectedTradeTab === 'sell') {
      this.renderSellTab(ctx, x + 25, contentY, w - 50, contentH, palette);
    } else {
      this.renderRefuelTab(ctx, x + 25, contentY, w - 50, contentH, palette);
    }

    // CRT effects
    this.drawScanlines(ctx, x, y, w, h);
    this.drawCRTNoise(ctx, x, y, w, h);

    // Help text
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = '#88aacc';
    ctx.font = '12px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[T] Close Trading | [ESC] Close All UI | [1-3] Switch Tabs', x + w / 2, y + h - 25);
    ctx.restore();
  }

  renderBuyTab(ctx, x, y, w, h, palette) {
    const market = this.game.currentMarket;
    if (!market) {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = palette.alertRed;
      ctx.fillStyle = palette.alertRed;
      ctx.font = '20px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NO MARKET AVAILABLE', x + w / 2, y + 100);
      ctx.restore();
      return;
    }

    // Initialize trading scroll state
    if (!this.game.tradingScrollState) {
      this.game.tradingScrollState = {
        commodityScroll: 0,
        itemScroll: 0,
        selectedView: 'commodities' // or 'items'
      };
    }

    const scrollState = this.game.tradingScrollState;

    // View toggle buttons
    const toggleW = 180;
    const toggleH = 35;
    const toggleY = y + 10;

    // Commodities button
    const comBtn = {
      x: x + 15,
      y: toggleY,
      w: toggleW,
      h: toggleH,
      selected: scrollState.selectedView === 'commodities'
    };

    ctx.fillStyle = comBtn.selected ? 'rgba(68, 136, 255, 0.4)' : 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(comBtn.x, comBtn.y, comBtn.w, comBtn.h);
    ctx.strokeStyle = comBtn.selected ? palette.statusBlue : '#445566';
    ctx.lineWidth = comBtn.selected ? 3 : 1;
    if (comBtn.selected) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = palette.statusBlue;
    }
    ctx.strokeRect(comBtn.x, comBtn.y, comBtn.w, comBtn.h);
    ctx.shadowBlur = 0;

    ctx.fillStyle = comBtn.selected ? palette.statusBlue : '#88aacc';
    ctx.font = `${comBtn.selected ? 'bold ' : ''}13px DigitalDisco, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('COMMODITIES', comBtn.x + comBtn.w / 2, comBtn.y + comBtn.h / 2 + 5);

    this.game.tradingButtonBounds.push({
      x: comBtn.x,
      y: comBtn.y,
      w: comBtn.w,
      h: comBtn.h,
      action: () => {
        scrollState.selectedView = 'commodities';
      }
    });

    // Items button
    const itmBtn = {
      x: x + 205,
      y: toggleY,
      w: toggleW,
      h: toggleH,
      selected: scrollState.selectedView === 'items'
    };

    ctx.fillStyle = itmBtn.selected ? 'rgba(68, 136, 255, 0.4)' : 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(itmBtn.x, itmBtn.y, itmBtn.w, itmBtn.h);
    ctx.strokeStyle = itmBtn.selected ? palette.statusBlue : '#445566';
    ctx.lineWidth = itmBtn.selected ? 3 : 1;
    if (itmBtn.selected) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = palette.statusBlue;
    }
    ctx.strokeRect(itmBtn.x, itmBtn.y, itmBtn.w, itmBtn.h);
    ctx.shadowBlur = 0;

    ctx.fillStyle = itmBtn.selected ? palette.statusBlue : '#88aacc';
    ctx.font = `${itmBtn.selected ? 'bold ' : ''}13px DigitalDisco, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('EQUIPMENT & ITEMS', itmBtn.x + itmBtn.w / 2, itmBtn.y + itmBtn.h / 2 + 5);

    this.game.tradingButtonBounds.push({
      x: itmBtn.x,
      y: itmBtn.y,
      w: itmBtn.w,
      h: itmBtn.h,
      action: () => {
        scrollState.selectedView = 'items';
      }
    });

    const contentY = toggleY + toggleH + 15;
    const contentH = h - toggleH - 25;

    if (scrollState.selectedView === 'commodities') {
      this.renderCommoditiesView(ctx, x, contentY, w, contentH, palette, market);
    } else {
      this.renderItemsView(ctx, x, contentY, w, contentH, palette);
    }
  }

  renderCommoditiesView(ctx, x, y, w, h, palette, market) {
    // Data panel for table
    this.drawDataPanel(ctx, x, y, w, h, palette);

    // Market header
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('◆ AVAILABLE COMMODITIES ◆', x + 15, y + 25);
    ctx.shadowBlur = 0;

    // Table header
    const headerY = y + 45;
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x + 10, headerY, w - 20, 32);

    ctx.strokeStyle = palette.statusBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, headerY, w - 20, 32);

    ctx.fillStyle = palette.warpBlue;
    ctx.font = 'bold 11px DigitalDisco, monospace';
    ctx.fillText('COMMODITY', x + 25, headerY + 20);
    ctx.fillText('CATEGORY', x + 270, headerY + 20);
    ctx.fillText('PRICE', x + 430, headerY + 20);
    ctx.fillText('STOCK', x + 590, headerY + 20);
    ctx.fillText('SPACE', x + 750, headerY + 20);
    ctx.fillText('BUY', x + 890, headerY + 20);

    // Commodity list
    let rowY = headerY + 45;
    const commodities = this.game.economySystem.commodities;

    for (const [commodityId, commodity] of Object.entries(commodities)) {
      const price = market.prices[commodityId];
      const stock = market.supply[commodityId];

      if (stock <= 0) continue;

      // Row background (alternating with depth)
      const rowIndex = Math.floor((rowY - headerY - 45) / 35);
      if (rowIndex % 2 === 0) {
        ctx.fillStyle = '#0f0f18';
        ctx.fillRect(x + 10, rowY - 10, w - 20, 35);
      }

      // Commodity name
      ctx.fillStyle = '#aabbcc';
      ctx.font = '11px DigitalDisco, monospace';
      ctx.fillText(commodity.name, x + 25, rowY + 10);

      // Category
      const catColor = this.getCategoryColor(commodity.category, palette);
      ctx.shadowBlur = 4;
      ctx.shadowColor = catColor;
      ctx.fillStyle = catColor;
      ctx.fillText(commodity.category.toUpperCase(), x + 270, rowY + 10);
      ctx.shadowBlur = 0;

      // Price
      ctx.shadowBlur = 4;
      ctx.shadowColor = palette.cautionOrange;
      ctx.fillStyle = palette.cautionOrange;
      ctx.font = 'bold 11px DigitalDisco, monospace';
      ctx.fillText(`${price} CR`, x + 430, rowY + 10);
      ctx.shadowBlur = 0;

      // Stock
      ctx.fillStyle = stock < 20 ? palette.alertRed : palette.statusGreen;
      ctx.font = '11px DigitalDisco, monospace';
      ctx.fillText(`${stock}`, x + 590, rowY + 10);

      // Cargo space needed
      ctx.fillStyle = '#88aacc';
      ctx.fillText(`${commodity.volume}`, x + 750, rowY + 10);

      // Buy button
      const btnW = 80;
      const btnH = 24;
      const btnX = x + 880;
      const btnY = rowY - 6;

      ctx.fillStyle = 'rgba(68, 136, 255, 0.2)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = palette.statusBlue;
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.fillStyle = palette.statusBlue;
      ctx.font = 'bold 10px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BUY +1', btnX + btnW / 2, btnY + btnH / 2 + 4);

      this.game.tradingButtonBounds.push({
        x: btnX,
        y: btnY,
        w: btnW,
        h: btnH,
        action: () => {
          console.log('Buy commodity:', commodity.name);
          // Future: Implement buy logic
        }
      });

      rowY += 35;
      if (rowY > y + h - 25) break;
    }
    ctx.restore();
  }

  renderItemsView(ctx, x, y, w, h, palette) {
    // Get all tradeable items from enhanced items
    const ENHANCED_ARTIFACTS = this.game.ENHANCED_ARTIFACTS || {};
    const allItems = Object.values(ENHANCED_ARTIFACTS);
    const tradeableItems = allItems.filter(item =>
      item.tradeable || item.category === 'weapon' ||
      item.category === 'equipment' || item.category === 'ammo' ||
      item.category === 'consumable' || item.category === 'material'
    );

    // Data panel
    this.drawDataPanel(ctx, x, y, w, h, palette);

    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`◆ EQUIPMENT & ITEMS (${tradeableItems.length}) ◆`, x + 15, y + 25);
    ctx.shadowBlur = 0;

    // Grid settings
    const gridY = y + 45;
    const gridH = h - 55;
    const itemsPerRow = 7;
    const iconSize = 72;
    const itemSpacing = 12;
    const itemCellW = iconSize + itemSpacing + 80;
    const itemCellH = iconSize + 60;

    // Clip to grid area
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, gridY, w, gridH);
    ctx.clip();

    const scrollOffset = this.game.tradingScrollState?.itemScroll || 0;

    // Draw grid of items
    for (let i = 0; i < tradeableItems.length; i++) {
      const item = tradeableItems[i];
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;

      const itemX = x + 15 + col * itemCellW;
      const itemY = gridY + row * itemCellH - scrollOffset;

      // Skip if out of view
      if (itemY + itemCellH < gridY || itemY > gridY + gridH) continue;

      // Item card background
      ctx.fillStyle = 'rgba(10, 10, 15, 0.8)';
      ctx.fillRect(itemX, itemY, iconSize + 80, itemCellH - 5);

      // Item border
      ctx.strokeStyle = this.getRarityColor(item.rarity);
      ctx.lineWidth = 2;
      ctx.shadowBlur = 5;
      ctx.shadowColor = this.getRarityColor(item.rarity);
      ctx.strokeRect(itemX, itemY, iconSize + 80, itemCellH - 5);
      ctx.shadowBlur = 0;

      // Draw pixelated icon
      this.drawPixelatedItemIcon(ctx, itemX + 5, itemY + 5, iconSize, item.icon, item.rarity);

      // Item info on the right
      const infoX = itemX + iconSize + 10;
      const infoY = itemY + 15;

      // Item name
      ctx.fillStyle = this.getRarityColor(item.rarity);
      ctx.font = 'bold 10px DigitalDisco, monospace';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 3;
      ctx.shadowColor = this.getRarityColor(item.rarity);
      let displayName = item.name;
      if (displayName.length > 10) {
        displayName = displayName.substring(0, 9) + '..';
      }
      ctx.fillText(displayName, infoX, infoY);
      ctx.shadowBlur = 0;

      // Price
      ctx.fillStyle = palette.cautionOrange;
      ctx.font = 'bold 9px DigitalDisco, monospace';
      ctx.fillText(`${item.value} CR`, infoX, infoY + 15);

      // Category
      ctx.fillStyle = '#88aacc';
      ctx.font = '8px DigitalDisco, monospace';
      ctx.fillText(item.category.substring(0, 10).toUpperCase(), infoX, infoY + 28);

      // Buy button
      const btnW = 70;
      const btnH = 20;
      const btnX = infoX;
      const btnY = infoY + 35;

      ctx.fillStyle = 'rgba(68, 136, 255, 0.3)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = palette.statusBlue;
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.fillStyle = palette.statusBlue;
      ctx.font = 'bold 9px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BUY', btnX + btnW / 2, btnY + btnH / 2 + 3);

      this.game.tradingButtonBounds.push({
        x: btnX,
        y: btnY,
        w: btnW,
        h: btnH,
        action: () => {
          console.log('Buy item:', item.name);
          // Future: Implement item purchase
        }
      });
    }

    ctx.restore();
    ctx.restore();
  }

  renderSellTab(ctx, x, y, w, h, palette) {
    const market = this.game.currentMarket;
    const cargo = this.game.economySystem.cargo;

    if (cargo.length === 0) {
      ctx.save();
      ctx.fillStyle = '#556677';
      ctx.font = '20px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 8;
      ctx.shadowColor = palette.statusBlue;
      ctx.fillText('NO CARGO TO SELL', x + w / 2, y + 100);
      ctx.font = '14px DigitalDisco, monospace';
      ctx.fillStyle = '#445566';
      ctx.shadowBlur = 4;
      ctx.fillText('Your cargo hold is empty', x + w / 2, y + 130);
      ctx.restore();
      return;
    }

    // Data panel for table
    this.drawDataPanel(ctx, x, y, w, h, palette);

    ctx.save();
    // Header
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 15px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('YOUR CARGO - SELL TO STATION', x + 15, y + 30);
    ctx.shadowBlur = 0;

    // Table header
    const headerY = y + 55;
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x + 10, headerY, w - 20, 35);

    ctx.strokeStyle = palette.statusBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, headerY, w - 20, 35);

    ctx.fillStyle = palette.warpBlue;
    ctx.font = 'bold 12px DigitalDisco, monospace';
    ctx.fillText('COMMODITY', x + 25, headerY + 22);
    ctx.fillText('QUANTITY', x + 270, headerY + 22);
    ctx.fillText('BOUGHT AT', x + 430, headerY + 22);
    ctx.fillText('SELL PRICE', x + 590, headerY + 22);
    ctx.fillText('PROFIT/LOSS', x + 750, headerY + 22);

    // Cargo list
    let rowY = headerY + 50;

    for (const cargoItem of cargo) {
      const sellPrice = market.prices[cargoItem.commodityId];
      const profit = (sellPrice - cargoItem.purchasePrice) * cargoItem.quantity;

      // Row background
      const rowIndex = Math.floor((rowY - headerY - 50) / 38);
      if (rowIndex % 2 === 0) {
        ctx.fillStyle = '#0f0f18';
        ctx.fillRect(x + 10, rowY - 12, w - 20, 38);
      }

      // Commodity name
      ctx.fillStyle = '#aabbcc';
      ctx.font = '12px DigitalDisco, monospace';
      ctx.fillText(cargoItem.commodity.name, x + 25, rowY + 12);

      // Quantity
      ctx.fillStyle = palette.statusBlue;
      ctx.fillText(`${cargoItem.quantity} units`, x + 270, rowY + 12);

      // Bought at
      ctx.fillStyle = '#88aacc';
      ctx.fillText(`${cargoItem.purchasePrice} CR`, x + 430, rowY + 12);

      // Sell price
      ctx.shadowBlur = 4;
      ctx.shadowColor = palette.cautionOrange;
      ctx.fillStyle = palette.cautionOrange;
      ctx.font = 'bold 12px DigitalDisco, monospace';
      ctx.fillText(`${sellPrice} CR`, x + 590, rowY + 12);
      ctx.shadowBlur = 0;

      // Profit/Loss
      const profitColor = profit >= 0 ? palette.statusGreen : palette.alertRed;
      ctx.shadowBlur = 6;
      ctx.shadowColor = profitColor;
      ctx.fillStyle = profitColor;
      ctx.fillText(`${profit >= 0 ? '+' : ''}${profit} CR`, x + 750, rowY + 12);
      ctx.shadowBlur = 0;

      rowY += 38;
    }
    ctx.restore();
  }

  renderRefuelTab(ctx, x, y, w, h, palette) {
    const market = this.game.currentMarket;
    const currentFuel = this.game.economySystem.fuel;
    const maxFuel = this.game.economySystem.maxFuel;
    const fuelNeeded = maxFuel - currentFuel;
    const fuelPrice = market ? market.fuelPrice : 50;

    // Main panel
    this.drawDataPanel(ctx, x, y, w, h, palette);

    ctx.save();

    // Fuel status header
    ctx.shadowBlur = 8;
    ctx.shadowColor = palette.cautionOrange;
    ctx.fillStyle = palette.cautionOrange;
    ctx.font = 'bold 20px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⛽ FUEL MANAGEMENT', x + 15, y + 40);
    ctx.shadowBlur = 0;

    // Fuel gauge (large and prominent)
    const gaugeY = y + 80;
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 15px DigitalDisco, monospace';
    ctx.fillText('CURRENT FUEL LEVEL', x + 15, gaugeY);

    this.drawTerminalProgressBar(ctx, x + 15, gaugeY + 20, 650, 45, currentFuel, maxFuel, palette.cautionOrange, palette);

    // Fuel stats
    const statsY = gaugeY + 90;
    ctx.fillStyle = '#aabbcc';
    ctx.font = '14px DigitalDisco, monospace';
    ctx.fillText(`Current: ${currentFuel.toFixed(1)} / ${maxFuel} units`, x + 15, statsY);
    ctx.fillText(`Needed to fill: ${fuelNeeded.toFixed(1)} units`, x + 15, statsY + 28);

    ctx.shadowBlur = 4;
    ctx.shadowColor = palette.cautionOrange;
    ctx.fillStyle = palette.cautionOrange;
    ctx.font = 'bold 15px DigitalDisco, monospace';
    ctx.fillText(`Price per unit: ${fuelPrice} CR`, x + 15, statsY + 56);
    ctx.shadowBlur = 0;

    const totalCost = Math.round(fuelPrice * fuelNeeded);
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffaa00';
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 18px DigitalDisco, monospace';
    ctx.fillText(`Total cost to refuel: ${totalCost.toLocaleString()} CR`, x + 15, statsY + 88);
    ctx.shadowBlur = 0;

    // Can afford?
    const canAfford = this.game.economySystem.credits >= totalCost;
    const statusColor = canAfford ? palette.statusGreen : palette.alertRed;
    ctx.shadowBlur = 8;
    ctx.shadowColor = statusColor;
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 15px DigitalDisco, monospace';
    ctx.fillText(canAfford ? '✓ SUFFICIENT CREDITS' : '✗ INSUFFICIENT CREDITS', x + 15, statsY + 120);
    ctx.shadowBlur = 0;

    // Refuel options
    const optionsY = statsY + 165;
    ctx.fillStyle = palette.warpBlue;
    ctx.font = 'bold 15px DigitalDisco, monospace';
    ctx.fillText('REFUEL OPTIONS', x + 15, optionsY);

    // Buttons (visual only for now)
    this.drawTerminalButton(ctx, x + 15, optionsY + 20, 200, 45, 'FILL 25%', false, palette);
    this.drawTerminalButton(ctx, x + 230, optionsY + 20, 200, 45, 'FILL 50%', false, palette);
    this.drawTerminalButton(ctx, x + 445, optionsY + 20, 200, 45, 'FILL 100%', false, palette);

    // Info
    ctx.fillStyle = '#88aacc';
    ctx.font = '12px DigitalDisco, monospace';
    ctx.fillText('Fuel is consumed during thrust and warp travel', x + 15, optionsY + 95);
    ctx.fillText('Remote and dangerous systems have higher fuel prices', x + 15, optionsY + 115);

    ctx.restore();
  }

  /**
   * DIPLOMACY SCREEN - Enhanced Terminal Style
   */
  renderDiplomacyScreen(ctx) {
    const palette = this.game.PALETTE;
    const w = 1400;
    const h = 880;
    const x = (this.game.width - w) / 2;
    const y = (this.game.height - h) / 2;

    // Clear and initialize button bounds for touch interaction
    this.game.diplomacyButtonBounds = [];

    // Main panel
    this.drawTerminalPanel(ctx, x, y, w, h, '[DIP] GALACTIC DIPLOMACY & FACTION RELATIONS', palette);

    // Close button (X) in top-right corner
    const closeButtonSize = 40;
    const closeX = x + w - closeButtonSize - 20;
    const closeY = y + 20;
    this.drawTerminalButton(ctx, closeX, closeY, closeButtonSize, closeButtonSize, 'X', false, palette);
    this.game.diplomacyButtonBounds.push({
      x: closeX,
      y: closeY,
      w: closeButtonSize,
      h: closeButtonSize,
      action: () => {
        this.game.uiState.showDiplomacy = false;
        if (this.game.mobileControls) {
          this.game.mobileControls.buttons.diplomacy.active = false;
        }
      }
    });

    // Current system faction info panel
    this.drawDataPanel(ctx, x + 20, y + 75, w - 40, 50, palette);

    const currentFaction = this.game.currentSystemData ? this.game.currentSystemData.faction : null;
    if (currentFaction) {
      const factionData = this.game.factionSystem.getFaction(currentFaction);
      const factionColor = this.game.factionSystem.getFactionColor(currentFaction);

      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = factionColor;
      ctx.fillStyle = factionColor;
      ctx.font = '15px DigitalDisco, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`CURRENT TERRITORY: ${factionData.name}`, x + 35, y + 105);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Faction list (left side)
    const factions = this.game.factionSystem.factions;
    const factionList = Object.values(factions);

    const listX = x + 20;
    const listY = y + 145;
    const listW = 400;

    // List panel
    this.drawDataPanel(ctx, listX, listY, listW, h - 220, palette);

    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 15px DigitalDisco, monospace';
    ctx.fillText('KNOWN FACTIONS', listX + 15, listY + 30);
    ctx.shadowBlur = 0;

    let factionY = listY + 55;
    for (const faction of factionList) {
      const isSelected = this.game.uiState.selectedFaction === faction.id;

      // Faction button with depth
      if (isSelected) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(listX + 17, listY + 3, listW - 30, 55);
      }

      ctx.fillStyle = isSelected ? `${faction.color}33` : '#0a0a0f';
      ctx.fillRect(listX + 15, factionY, listW - 30, 55);

      ctx.shadowBlur = isSelected ? 10 : 0;
      ctx.shadowColor = faction.color;
      ctx.strokeStyle = isSelected ? faction.color : '#334455';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(listX + 15, factionY, listW - 30, 55);
      ctx.shadowBlur = 0;

      // Faction name and flag
      ctx.shadowBlur = isSelected ? 8 : 4;
      ctx.shadowColor = faction.color;
      ctx.fillStyle = faction.color;
      ctx.font = 'bold 15px DigitalDisco, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${faction.flag} ${faction.name}`, listX + 25, factionY + 28);
      ctx.shadowBlur = 0;

      // Faction type
      ctx.fillStyle = '#88aacc';
      ctx.font = '11px DigitalDisco, monospace';
      ctx.fillText(faction.government, listX + 25, factionY + 45);

      factionY += 65;
      if (factionY > y + h - 120) break;
    }
    ctx.restore();

    // Details panel (right side)
    const detailsX = x + 440;
    const detailsY = y + 145;
    const detailsW = w - 460;
    const detailsH = h - 220;

    this.drawDataPanel(ctx, detailsX, detailsY, detailsW, detailsH, palette);

    if (this.game.uiState.selectedFaction) {
      const selectedFaction = this.game.factionSystem.getFaction(this.game.uiState.selectedFaction);
      this.renderFactionDetails(ctx, detailsX + 15, detailsY + 15, detailsW - 30, detailsH - 30, selectedFaction, palette);
    } else {
      ctx.save();
      ctx.fillStyle = '#556677';
      ctx.font = '18px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 6;
      ctx.shadowColor = palette.statusBlue;
      ctx.fillText('← SELECT A FACTION TO VIEW DETAILS', detailsX + detailsW / 2, detailsY + 100);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // CRT effects
    this.drawScanlines(ctx, x, y, w, h);
    this.drawCRTNoise(ctx, x, y, w, h);

    // Help text
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = '#88aacc';
    ctx.font = '12px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[F] Close Diplomacy | [ESC] Close All UI | Click faction to view details', x + w / 2, y + h - 25);
    ctx.restore();
  }

  renderFactionDetails(ctx, x, y, w, h, faction, palette) {
    ctx.save();

    // Split into two columns: Info on left, Missions on right
    const col1W = (w * 0.55);
    const col2W = (w * 0.42);
    const col2X = x + col1W + 20;

    // === LEFT COLUMN: FACTION INFO ===

    // Header
    ctx.shadowBlur = 12;
    ctx.shadowColor = faction.color;
    ctx.fillStyle = faction.color;
    ctx.font = 'bold 18px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${faction.flag} ${faction.name.toUpperCase()}`, x, y + 25);
    ctx.shadowBlur = 0;

    // Government type
    ctx.fillStyle = palette.statusBlue;
    ctx.font = '13px DigitalDisco, monospace';
    ctx.fillText(`Government: ${faction.government}`, x, y + 48);

    // === REPUTATION SYSTEM ===
    let yPos = y + 75;

    // Reputation header
    ctx.shadowBlur = 6;
    ctx.shadowColor = palette.plasmaGreen;
    ctx.fillStyle = palette.plasmaGreen;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('◆ REPUTATION STATUS', x, yPos);
    ctx.shadowBlur = 0;
    yPos += 25;

    // Calculate reputation (mock for now - would be stored in save game)
    const reputation = faction.hostileToPlayer ? -500 : 250; // Range: -1000 to 1000
    const repPercent = ((reputation + 1000) / 2000); // Convert to 0-1

    // Reputation bar background
    const barW = col1W - 20;
    const barH = 24;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, yPos, barW, barH);

    // Reputation bar border
    ctx.strokeStyle = palette.statusBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, yPos, barW, barH);

    // Reputation bar fill (color based on reputation)
    let repColor = palette.alertRed;
    if (reputation > 500) repColor = palette.statusGreen;
    else if (reputation > 0) repColor = palette.cautionOrange;

    ctx.fillStyle = repColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = repColor;
    ctx.fillRect(x + 2, yPos + 2, (barW - 4) * repPercent, barH - 4);
    ctx.shadowBlur = 0;

    // Reputation text
    let repStatus = 'HOSTILE';
    if (reputation > 750) repStatus = 'ALLIED';
    else if (reputation > 500) repStatus = 'FRIENDLY';
    else if (reputation > 250) repStatus = 'NEUTRAL';
    else if (reputation > 0) repStatus = 'UNFRIENDLY';
    else if (reputation > -500) repStatus = 'HOSTILE';
    else repStatus = 'AT WAR';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${repStatus} (${reputation})`, x + barW / 2, yPos + barH / 2 + 4);
    ctx.textAlign = 'left';

    yPos += 40;

    // Description
    ctx.fillStyle = '#aabbcc';
    ctx.font = '11px DigitalDisco, monospace';
    const descLines = this.wrapTextToArray(faction.description, col1W - 10, ctx);
    for (let i = 0; i < Math.min(3, descLines.length); i++) {
      ctx.fillText(descLines[i], x, yPos);
      yPos += 16;
    }

    yPos += 15;

    // Traits section
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 12px DigitalDisco, monospace';
    ctx.fillText('◆ TRAITS & BONUSES', x, yPos);
    ctx.shadowBlur = 0;
    yPos += 20;

    ctx.fillStyle = '#aabbcc';
    ctx.font = '10px DigitalDisco, monospace';
    for (const trait of faction.traits.slice(0, 3)) {
      ctx.fillText(`• ${trait}`, x + 5, yPos);
      yPos += 16;
    }

    yPos += 15;

    // Statistics grid
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.cautionOrange;
    ctx.fillStyle = palette.cautionOrange;
    ctx.font = 'bold 12px DigitalDisco, monospace';
    ctx.fillText('◆ FACTION DATA', x, yPos);
    ctx.shadowBlur = 0;
    yPos += 20;

    const stats = [
      { label: 'Territory', value: faction.territorySize.toUpperCase(), color: palette.statusBlue },
      { label: 'Trade Bonus', value: `${(faction.tradeModifier * 100 - 100).toFixed(0)}%`, color: palette.plasmaGreen },
      { label: 'Military', value: `${faction.patrolStrength}/5 ★`, color: palette.cautionOrange },
      { label: 'Systems', value: `${faction.territorySize === 'large' ? '15-20' : faction.territorySize === 'medium' ? '8-14' : '3-7'}`, color: '#88aacc' }
    ];

    ctx.font = '10px DigitalDisco, monospace';
    for (const stat of stats) {
      ctx.fillStyle = '#88aacc';
      ctx.fillText(stat.label + ':', x + 5, yPos);
      ctx.fillStyle = stat.color;
      ctx.font = 'bold 10px DigitalDisco, monospace';
      ctx.fillText(stat.value, x + 120, yPos);
      ctx.font = '10px DigitalDisco, monospace';
      yPos += 16;
    }

    // === RIGHT COLUMN: MISSIONS ===

    // Mission board header
    ctx.shadowBlur = 8;
    ctx.shadowColor = palette.plasmaGreen;
    ctx.fillStyle = palette.plasmaGreen;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('◆ MISSION BOARD', col2X, y + 25);
    ctx.shadowBlur = 0;

    // Mission cards
    const missions = [
      {
        title: 'Escort Convoy',
        type: 'ESCORT',
        reward: 5000,
        difficulty: 'Easy',
        description: 'Protect trading convoy through hostile space.',
        repGain: 50
      },
      {
        title: 'Eliminate Pirates',
        type: 'COMBAT',
        reward: 8500,
        difficulty: 'Medium',
        description: 'Clear pirate presence from sector 7B.',
        repGain: 75
      },
      {
        title: 'Deliver Supplies',
        type: 'DELIVERY',
        reward: 3000,
        difficulty: 'Easy',
        description: 'Transport medical supplies to outpost.',
        repGain: 30
      },
      {
        title: 'Recon Mission',
        type: 'RECON',
        reward: 6000,
        difficulty: 'Medium',
        description: 'Scout enemy territory and report findings.',
        repGain: 60
      }
    ];

    let missionY = y + 50;
    const missionCardH = 110;

    for (let i = 0; i < Math.min(4, missions.length); i++) {
      const mission = missions[i];

      // Mission card background
      ctx.fillStyle = 'rgba(10, 10, 15, 0.7)';
      ctx.fillRect(col2X, missionY, col2W, missionCardH);

      // Mission card border
      ctx.strokeStyle = palette.statusBlue;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 5;
      ctx.shadowColor = palette.statusBlue;
      ctx.strokeRect(col2X, missionY, col2W, missionCardH);
      ctx.shadowBlur = 0;

      // Mission type badge
      const typeColors = {
        'ESCORT': '#4488ff',
        'COMBAT': '#ff4444',
        'DELIVERY': '#44ff88',
        'RECON': '#ffaa44'
      };
      ctx.fillStyle = typeColors[mission.type] || palette.statusBlue;
      ctx.fillRect(col2X + 5, missionY + 5, 70, 18);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(mission.type, col2X + 40, missionY + 16);
      ctx.textAlign = 'left';

      // Mission title
      ctx.fillStyle = palette.statusBlue;
      ctx.font = 'bold 11px DigitalDisco, monospace';
      ctx.fillText(mission.title, col2X + 5, missionY + 40);

      // Mission description
      ctx.fillStyle = '#aabbcc';
      ctx.font = '9px DigitalDisco, monospace';
      const missionDescLines = this.wrapTextToArray(mission.description, col2W - 15, ctx);
      for (let j = 0; j < Math.min(2, missionDescLines.length); j++) {
        ctx.fillText(missionDescLines[j], col2X + 5, missionY + 55 + j * 12);
      }

      // Reward and reputation
      ctx.fillStyle = palette.cautionOrange;
      ctx.font = 'bold 9px DigitalDisco, monospace';
      ctx.fillText(`${mission.reward} CR`, col2X + 5, missionY + 85);
      ctx.fillStyle = palette.plasmaGreen;
      ctx.fillText(`+${mission.repGain} REP`, col2X + 80, missionY + 85);
      ctx.fillStyle = '#88aacc';
      ctx.fillText(mission.difficulty, col2X + 160, missionY + 85);

      // Accept button
      const btnW = col2W - 10;
      const btnH = 18;
      const btnX = col2X + 5;
      const btnY = missionY + 90;

      ctx.fillStyle = 'rgba(68, 136, 255, 0.3)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = palette.statusBlue;
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.fillStyle = palette.statusBlue;
      ctx.font = 'bold 9px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ACCEPT MISSION', btnX + btnW / 2, btnY + btnH / 2 + 3);
      ctx.textAlign = 'left';

      this.game.diplomacyButtonBounds.push({
        x: btnX,
        y: btnY,
        w: btnW,
        h: btnH,
        action: () => {
          console.log('Accept mission:', mission.title);
          // Future: Implement mission system
        }
      });

      missionY += missionCardH + 10;
    }

    ctx.restore();
  }

  // Helper function to wrap text into array of lines
  wrapTextToArray(text, maxWidth, ctx) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  /**
   * GALAXY MAP SCREEN - Enhanced Terminal Style
   */
  renderGalaxyMapScreen(ctx) {
    const palette = this.game.PALETTE;
    const w = 1600;
    const h = 920;
    const x = (this.game.width - w) / 2;
    const y = (this.game.height - h) / 2;

    // Initialize galaxy map state if not exists
    if (!this.game.galaxyMapState) {
      this.game.galaxyMapState = {
        offsetX: 0,
        offsetY: 0,
        zoom: 0.04, // Start zoomed out to see whole galaxy
        selectedSystem: null,
        dragging: false,
        lastMouseX: 0,
        lastMouseY: 0
      };
    }

    const state = this.game.galaxyMapState;

    // Clear and initialize button bounds for touch interaction
    this.game.galaxyMapButtonBounds = [];

    this.drawTerminalPanel(ctx, x, y, w, h, '[NAV] GALACTIC NAVIGATION CHART', palette);

    // Map viewport
    const mapX = x + 20;
    const mapY = y + 80;
    const mapW = w - 300;
    const mapH = h - 180;

    // Draw map background
    ctx.save();
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(mapX, mapY, mapW, mapH);

    // Border
    ctx.strokeStyle = palette.statusBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    // Clip to map area
    ctx.beginPath();
    ctx.rect(mapX, mapY, mapW, mapH);
    ctx.clip();

    // Draw background stars (nebulae effect)
    for (let i = 0; i < 200; i++) {
      const sx = mapX + (i * 237) % mapW;
      const sy = mapY + (i * 193) % mapH;
      const size = 1 + (i % 3);
      ctx.fillStyle = `rgba(${120 + i % 80}, ${150 + i % 100}, 255, ${0.2 + (i % 3) * 0.1})`;
      ctx.fillRect(sx, sy, size, size);
    }

    // Draw spiral arms
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.08)';
    ctx.lineWidth = 30;
    for (let arm = 0; arm < 4; arm++) {
      ctx.beginPath();
      for (let r = 0; r < 15000; r += 100) {
        const angle = (r / 3000) + (arm * Math.PI / 2);
        const screenX = mapX + mapW / 2 + Math.cos(angle) * r * state.zoom + state.offsetX;
        const screenY = mapY + mapH / 2 + Math.sin(angle) * r * state.zoom + state.offsetY;
        if (r === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();
    }

    // Get current system
    const currentSystem = this.game.currentSystemData ?
      this.game.galaxy.find(s => s.name === this.game.currentSystemData.name) : null;

    // Draw star systems
    this.game.galaxy.forEach(system => {
      const screenX = mapX + mapW / 2 + system.position.x * state.zoom + state.offsetX;
      const screenY = mapY + mapH / 2 + system.position.y * state.zoom + state.offsetY;

      // Only draw if in viewport
      if (screenX < mapX - 50 || screenX > mapX + mapW + 50 ||
          screenY < mapY - 50 || screenY > mapY + mapH + 50) return;

      const isCurrentSystem = currentSystem && system.id === currentSystem.id;
      const isSelected = state.selectedSystem && system.id === state.selectedSystem.id;
      const isDiscovered = system.discovered;

      // Star glow
      if (isDiscovered) {
        const glowSize = (3 + system.starLuminosity * 2) * (state.zoom * 50);
        const glowGrad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowSize);
        glowGrad.addColorStop(0, system.starColor + 'aa');
        glowGrad.addColorStop(0.5, system.starColor + '44');
        glowGrad.addColorStop(1, system.starColor + '00');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(screenX - glowSize, screenY - glowSize, glowSize * 2, glowSize * 2);
      }

      // Star dot
      const starSize = isDiscovered ? 4 + system.starLuminosity * 1.5 : 2;
      ctx.fillStyle = isDiscovered ? system.starColor : '#444466';
      ctx.beginPath();
      ctx.arc(screenX, screenY, starSize, 0, Math.PI * 2);
      ctx.fill();

      // Current system indicator (pulsing ring)
      if (isCurrentSystem) {
        const pulse = Math.sin(this.time * 3) * 3 + 10;
        ctx.strokeStyle = palette.statusGreen;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = palette.statusGreen;
        ctx.beginPath();
        ctx.arc(screenX, screenY, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Selected system indicator
      if (isSelected) {
        ctx.strokeStyle = palette.cautionOrange;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = palette.cautionOrange;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // System name (only for discovered systems when zoomed in)
      if (isDiscovered && state.zoom > 0.06) {
        ctx.fillStyle = palette.starWhite;
        ctx.font = '9px DigitalDisco, monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.fillText(system.name, screenX, screenY - 12);
        ctx.shadowBlur = 0;
      }

      // Store clickable area
      this.game.galaxyMapButtonBounds.push({
        x: screenX - 10,
        y: screenY - 10,
        w: 20,
        h: 20,
        action: () => {
          state.selectedSystem = system;
        }
      });
    });

    ctx.restore();

    // Right sidebar - System info
    const sidebarX = x + w - 260;
    const sidebarY = mapY;
    const sidebarW = 240;
    const sidebarH = mapH;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(sidebarX, sidebarY, sidebarW, sidebarH);
    ctx.strokeStyle = palette.statusBlue;
    ctx.lineWidth = 2;
    ctx.strokeRect(sidebarX, sidebarY, sidebarW, sidebarH);

    const displaySystem = state.selectedSystem || currentSystem;

    if (displaySystem) {
      ctx.save();
      ctx.fillStyle = palette.warpBlue;
      ctx.font = 'bold 14px DigitalDisco, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SYSTEM DATA:', sidebarX + 10, sidebarY + 25);

      ctx.fillStyle = displaySystem.discovered ? palette.starWhite : '#666677';
      ctx.font = '12px DigitalDisco, monospace';
      let infoY = sidebarY + 50;

      const info = [
        `Name: ${displaySystem.discovered ? displaySystem.name : '???'}`,
        `Star: ${displaySystem.discovered ? displaySystem.starType.class : '???'}`,
        `Type: ${displaySystem.discovered ? displaySystem.systemType.toUpperCase() : '???'}`,
        ``,
        displaySystem.discovered ? `Planets: ${displaySystem.planetCount}` : '',
        displaySystem.discovered ? `Stations: ${displaySystem.stationCount}` : '',
        displaySystem.discovered ? `Asteroids: ${displaySystem.asteroidBelts}` : '',
        ``,
        displaySystem.visited ? `Status: VISITED` : displaySystem.discovered ? `Status: DISCOVERED` : `Status: UNKNOWN`,
      ];

      info.forEach(line => {
        if (line) {
          ctx.fillText(line, sidebarX + 10, infoY);
          infoY += 18;
        }
      });

      // Navigate button (if not current system)
      if (displaySystem.id !== currentSystem?.id && displaySystem.discovered) {
        const navBtnY = sidebarY + sidebarH - 60;
        this.drawTerminalButton(ctx, sidebarX + 10, navBtnY, sidebarW - 20, 40, 'NAVIGATE TO SYSTEM', false, palette);
        this.game.galaxyMapButtonBounds.push({
          x: sidebarX + 10,
          y: navBtnY,
          w: sidebarW - 20,
          h: 40,
          action: () => {
            // TODO: Implement navigation to selected system
            if (this.game.notificationSystem) {
              this.game.notificationSystem.show(`Navigation to ${displaySystem.name} not yet implemented`, 'info');
            }
          }
        });
      }

      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = '#666677';
      ctx.font = '12px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Select a star system', sidebarX + sidebarW / 2, sidebarY + sidebarH / 2);
      ctx.fillText('to view details', sidebarX + sidebarW / 2, sidebarY + sidebarH / 2 + 20);
      ctx.restore();
    }

    // Control instructions
    const controlY = y + h - 90;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(mapX, controlY, mapW, 70);
    ctx.strokeStyle = palette.statusBlue;
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX, controlY, mapW, 70);

    ctx.save();
    ctx.fillStyle = palette.statusBlue;
    ctx.font = '11px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Controls: [MOUSE WHEEL] Zoom | [DRAG] Pan | [CLICK] Select System', mapX + 10, controlY + 20);
    ctx.fillStyle = palette.mediumGray;
    ctx.font = '10px DigitalDisco, monospace';
    ctx.fillText(`Zoom: ${(state.zoom * 100).toFixed(1)}% | Systems: ${this.game.galaxy.filter(s => s.discovered).length}/${this.game.galaxy.length} discovered`, mapX + 10, controlY + 40);
    ctx.fillText('[M] Close Map | [ESC] Close All UI', mapX + 10, controlY + 60);
    ctx.restore();

    // Zoom controls
    const zoomBtnW = 40;
    const zoomBtnH = 30;
    const zoomX = mapX + mapW - 100;
    const zoomY = controlY + 10;

    this.drawTerminalButton(ctx, zoomX, zoomY, zoomBtnW, zoomBtnH, '-', false, palette);
    this.game.galaxyMapButtonBounds.push({
      x: zoomX,
      y: zoomY,
      w: zoomBtnW,
      h: zoomBtnH,
      action: () => {
        state.zoom = Math.max(0.01, state.zoom * 0.8);
      }
    });

    this.drawTerminalButton(ctx, zoomX + zoomBtnW + 10, zoomY, zoomBtnW, zoomBtnH, '+', false, palette);
    this.game.galaxyMapButtonBounds.push({
      x: zoomX + zoomBtnW + 10,
      y: zoomY,
      w: zoomBtnW,
      h: zoomBtnH,
      action: () => {
        state.zoom = Math.min(0.2, state.zoom * 1.25);
      }
    });

    // Close button
    const closeButtonSize = 40;
    const closeX = x + w - closeButtonSize - 20;
    const closeY = y + 20;
    this.drawTerminalButton(ctx, closeX, closeY, closeButtonSize, closeButtonSize, 'X', false, palette);
    this.game.galaxyMapButtonBounds.push({
      x: closeX,
      y: closeY,
      w: closeButtonSize,
      h: closeButtonSize,
      action: () => {
        this.game.uiState.showGalaxyMap = false;
        this.game.updatePauseState();
        if (this.game.mobileControls) {
          this.game.mobileControls.buttons.map.active = false;
        }
      }
    });

    // CRT effects
    this.drawScanlines(ctx, x, y, w, h);
    this.drawCRTNoise(ctx, x, y, w, h);
  }

  /**
   * SAVE SCREEN - Save game to slots with CRT terminal style
   */
  renderSaveScreen(ctx) {
    const palette = this.game.PALETTE;
    const w = 1400;
    const h = 900;
    const x = (this.game.width - w) / 2;
    const y = (this.game.height - h) / 2;

    // Clear and initialize button bounds for touch interaction
    this.game.saveScreenButtonBounds = [];

    // Main panel
    this.drawTerminalPanel(ctx, x, y, w, h, '[SAV] SAVE GAME - SELECT SLOT', palette);

    // Close button (X) in top-right corner
    const closeButtonSize = 40;
    const closeX = x + w - closeButtonSize - 20;
    const closeY = y + 20;
    this.drawTerminalButton(ctx, closeX, closeY, closeButtonSize, closeButtonSize, 'X', false, palette);
    this.game.saveScreenButtonBounds.push({
      x: closeX,
      y: closeY,
      w: closeButtonSize,
      h: closeButtonSize,
      action: () => {
        this.game.uiState.showSaveScreen = false;
      }
    });

    // Get save list
    const saves = this.game.saveSystem ? this.game.saveSystem.getSaveList() : [];

    // Info panel
    const infoY = y + 85;
    this.drawDataPanel(ctx, x + 20, infoY, w - 40, 60, palette);

    ctx.save();
    ctx.fillStyle = palette.statusBlue;
    ctx.font = '14px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Select a slot to save your current game progress.', x + 35, infoY + 25);
    ctx.fillStyle = '#88aacc';
    ctx.font = '12px DigitalDisco, monospace';
    ctx.fillText(`Current System: ${this.game.currentSystemData ? this.game.currentSystemData.name : 'Unknown'}`, x + 35, infoY + 45);
    ctx.restore();

    // Save slots grid (2 columns, 5 rows)
    const slotStartY = infoY + 80;
    const slotW = (w - 80) / 2;
    const slotH = 100;
    const slotGap = 20;

    for (let i = 0; i < 10; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const slotX = x + 30 + col * (slotW + slotGap);
      const slotY = slotStartY + row * (slotH + 15);

      const save = saves.find(s => s.slotNumber === i + 1);
      const isEmpty = !save || save.empty;

      // Slot panel
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(slotX + 4, slotY + 4, slotW, slotH);
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(slotX, slotY, slotW, slotH);

      const isHovered = this.game.uiState.selectedSaveSlot === i + 1;
      ctx.strokeStyle = isHovered ? palette.cautionOrange : palette.statusBlue;
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.shadowBlur = isHovered ? 12 : 6;
      ctx.shadowColor = isHovered ? palette.cautionOrange : palette.statusBlue;
      ctx.strokeRect(slotX, slotY, slotW, slotH);
      ctx.shadowBlur = 0;

      // Slot number
      ctx.fillStyle = palette.plasmaGreen;
      ctx.font = 'bold 16px DigitalDisco, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SLOT ${i + 1}`, slotX + 15, slotY + 25);

      if (isEmpty) {
        // Empty slot
        ctx.fillStyle = '#556677';
        ctx.font = '14px DigitalDisco, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[ EMPTY SLOT ]', slotX + slotW / 2, slotY + slotH / 2);
      } else {
        // Save info
        ctx.fillStyle = '#aabbcc';
        ctx.font = '12px DigitalDisco, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${save.saveName}`, slotX + 15, slotY + 48);
        ctx.fillStyle = '#88aacc';
        ctx.fillText(`Credits: ${save.credits}`, slotX + 15, slotY + 68);
        if (this.game.saveSystem) {
          const playtime = this.game.saveSystem.constructor.formatPlaytime(save.playtime);
          ctx.fillText(`Playtime: ${playtime}`, slotX + 15, slotY + 85);
        }
      }

      ctx.restore();

      // Store button bounds
      this.game.saveScreenButtonBounds.push({
        x: slotX,
        y: slotY,
        w: slotW,
        h: slotH,
        action: () => {
          if (this.game.saveSystem) {
            const slotName = `save_${i + 1}`;
            this.game.saveSystem.saveGame(slotName, `Save ${i + 1}`);
            this.game.uiState.showSaveScreen = false;
          }
        }
      });
    }

    // CRT effects
    this.drawScanlines(ctx, x, y, w, h);
    this.drawCRTNoise(ctx, x, y, w, h);

    // Help text
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = '#88aacc';
    ctx.font = '12px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[F6] Close Save Screen | [ESC] Close All UI | [F5] Quick Save', x + w / 2, y + h - 25);
    ctx.restore();
  }

  /**
   * LOAD SCREEN - Load game from slots with CRT terminal style
   */
  renderLoadScreen(ctx) {
    const palette = this.game.PALETTE;
    const w = 1400;
    const h = 900;
    const x = (this.game.width - w) / 2;
    const y = (this.game.height - h) / 2;

    // Clear and initialize button bounds for touch interaction
    this.game.loadScreenButtonBounds = [];

    // Main panel
    this.drawTerminalPanel(ctx, x, y, w, h, '[LOD] LOAD GAME - SELECT SAVE', palette);

    // Close button (X) in top-right corner
    const closeButtonSize = 40;
    const closeX = x + w - closeButtonSize - 20;
    const closeY = y + 20;
    this.drawTerminalButton(ctx, closeX, closeY, closeButtonSize, closeButtonSize, 'X', false, palette);
    this.game.loadScreenButtonBounds.push({
      x: closeX,
      y: closeY,
      w: closeButtonSize,
      h: closeButtonSize,
      action: () => {
        this.game.uiState.showLoadScreen = false;
      }
    });

    // Get save list
    const saves = this.game.saveSystem ? this.game.saveSystem.getSaveList() : [];

    // Info panel
    const infoY = y + 85;
    this.drawDataPanel(ctx, x + 20, infoY, w - 40, 60, palette);

    ctx.save();
    ctx.fillStyle = palette.statusBlue;
    ctx.font = '14px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Select a save to load. Warning: Unsaved progress will be lost!', x + 35, infoY + 25);
    ctx.fillStyle = palette.alertRed;
    ctx.font = 'bold 12px DigitalDisco, monospace';
    ctx.fillText('⚠ AUTOSAVE available in first slot', x + 35, infoY + 45);
    ctx.restore();

    // Show autosave first
    const autosave = saves.find(s => s.slot === 'autosave');
    if (autosave) {
      const slotX = x + 30;
      const slotY = infoY + 80;
      const slotW = w - 60;
      const slotH = 90;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(slotX + 4, slotY + 4, slotW, slotH);
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(slotX, slotY, slotW, slotH);

      ctx.strokeStyle = palette.cautionOrange;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = palette.cautionOrange;
      ctx.strokeRect(slotX, slotY, slotW, slotH);
      ctx.shadowBlur = 0;

      ctx.fillStyle = palette.cautionOrange;
      ctx.font = 'bold 16px DigitalDisco, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('AUTOSAVE', slotX + 15, slotY + 25);

      ctx.fillStyle = '#aabbcc';
      ctx.font = '12px DigitalDisco, monospace';
      ctx.fillText(`Credits: ${autosave.credits}`, slotX + 15, slotY + 48);
      if (this.game.saveSystem) {
        const playtime = this.game.saveSystem.constructor.formatPlaytime(autosave.playtime);
        const timestamp = this.game.saveSystem.constructor.formatTimestamp(autosave.timestamp);
        ctx.fillText(`Playtime: ${playtime} | Last saved: ${timestamp}`, slotX + 15, slotY + 68);
      }

      ctx.restore();

      this.game.loadScreenButtonBounds.push({
        x: slotX,
        y: slotY,
        w: slotW,
        h: slotH,
        action: () => {
          if (this.game.saveSystem) {
            this.game.saveSystem.loadGame('autosave');
            this.game.uiState.showLoadScreen = false;
          }
        }
      });
    }

    // Manual save slots grid
    const slotStartY = infoY + (autosave ? 190 : 80);
    const slotW = (w - 80) / 2;
    const slotH = 100;
    const slotGap = 20;

    for (let i = 0; i < 10; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const slotX = x + 30 + col * (slotW + slotGap);
      const slotY = slotStartY + row * (slotH + 15);

      const save = saves.find(s => s.slotNumber === i + 1);
      const isEmpty = !save || save.empty;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(slotX + 4, slotY + 4, slotW, slotH);
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(slotX, slotY, slotW, slotH);

      const isHovered = this.game.uiState.selectedSaveSlot === i + 1;
      ctx.strokeStyle = isHovered ? palette.cautionOrange : palette.statusBlue;
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.shadowBlur = isHovered ? 12 : 6;
      ctx.shadowColor = isHovered ? palette.cautionOrange : palette.statusBlue;
      ctx.strokeRect(slotX, slotY, slotW, slotH);
      ctx.shadowBlur = 0;

      ctx.fillStyle = palette.plasmaGreen;
      ctx.font = 'bold 16px DigitalDisco, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SLOT ${i + 1}`, slotX + 15, slotY + 25);

      if (isEmpty) {
        ctx.fillStyle = '#556677';
        ctx.font = '14px DigitalDisco, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[ EMPTY SLOT ]', slotX + slotW / 2, slotY + slotH / 2);
      } else {
        ctx.fillStyle = '#aabbcc';
        ctx.font = '12px DigitalDisco, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${save.saveName}`, slotX + 15, slotY + 48);
        ctx.fillStyle = '#88aacc';
        ctx.fillText(`Credits: ${save.credits}`, slotX + 15, slotY + 68);
        if (this.game.saveSystem) {
          const playtime = this.game.saveSystem.constructor.formatPlaytime(save.playtime);
          ctx.fillText(`Playtime: ${playtime}`, slotX + 15, slotY + 85);
        }
      }

      ctx.restore();

      if (!isEmpty) {
        this.game.loadScreenButtonBounds.push({
          x: slotX,
          y: slotY,
          w: slotW,
          h: slotH,
          action: () => {
            if (this.game.saveSystem) {
              const slotName = `save_${i + 1}`;
              this.game.saveSystem.loadGame(slotName);
              this.game.uiState.showLoadScreen = false;
            }
          }
        });
      }
    }

    // CRT effects
    this.drawScanlines(ctx, x, y, w, h);
    this.drawCRTNoise(ctx, x, y, w, h);

    // Help text
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = '#88aacc';
    ctx.font = '12px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[F7] Close Load Screen | [ESC] Close All UI | [F9] Quick Load', x + w / 2, y + h - 25);
    ctx.restore();
  }

  /**
   * POPUP WINDOW - For celestial bodies, stations, and other interactive objects
   */
  renderPopupWindow(ctx) {
    const palette = this.game.PALETTE;
    const target = this.game.uiState.popupTarget;
    const type = this.game.uiState.popupType;
    const buttons = this.game.uiState.popupButtons;

    if (!target || !type) return;

    // Semi-transparent overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, this.game.width, this.game.height);
    ctx.restore();

    // Popup dimensions
    const w = 700;
    const h = 600;

    // Position popup around the celestial body at appropriate distance
    let x, y;
    if (target && target.object) {
      // Get target screen position
      const camX = this.game.camera ? this.game.camera.x : 0;
      const camY = this.game.camera ? this.game.camera.y : 0;

      let targetX, targetY, targetRadius;

      // Calculate position based on object type
      if (type === 'planet' || type === 'moon') {
        const obj = target.object;
        if (type === 'planet') {
          targetX = Math.floor(this.game.star.x + Math.cos(obj.angle) * obj.distance - camX);
          targetY = Math.floor(this.game.star.y + Math.sin(obj.angle) * obj.distance - camY);
        } else { // moon
          const planet = this.game.planets.find(p => p.moons && p.moons.includes(obj));
          if (planet) {
            const px = this.game.star.x + Math.cos(planet.angle) * planet.distance;
            const py = this.game.star.y + Math.sin(planet.angle) * planet.distance;
            targetX = Math.floor(px + Math.cos(obj.angle) * obj.distance - camX);
            targetY = Math.floor(py + Math.sin(obj.angle) * obj.distance - camY);
          }
        }
        targetRadius = obj.radius || 50;
      } else if (type === 'asteroid') {
        const obj = target.object;
        targetX = Math.floor(this.game.star.x + Math.cos(obj.angle) * obj.distance - camX);
        targetY = Math.floor(this.game.star.y + Math.sin(obj.angle) * obj.distance - camY);
        targetRadius = 20;
      } else if (type === 'station') {
        const obj = target.object;
        targetX = Math.floor(this.game.star.x + Math.cos(obj.angle) * obj.distance - camX);
        targetY = Math.floor(this.game.star.y + Math.sin(obj.angle) * obj.distance - camY);
        targetRadius = 40;
      }

      if (targetX !== undefined && targetY !== undefined) {
        // ENHANCED: Dynamic offset based on celestial body size for better positioning
        // Larger bodies need more distance to avoid overlap with the celestial body itself
        const baseOffset = 120; // Increased base offset
        const radiusMultiplier = Math.min(1.5, targetRadius / 100); // Scale with body size
        const offsetDistance = targetRadius + baseOffset + (targetRadius * radiusMultiplier);

        // Try positioning to the right first
        x = targetX + offsetDistance;
        y = targetY - h / 2;

        // Keep popup within screen bounds with dynamic adjustment
        if (x + w > this.game.width - 20) {
          // If too far right, position on left side
          x = targetX - offsetDistance - w;
        }
        if (x < 20) {
          // If too far left, position above or below
          x = targetX - w / 2;
          y = targetY - offsetDistance - h;

          // If above doesn't work, try below
          if (y < 20) {
            y = targetY + offsetDistance;
          }
        }

        // Final bounds checking
        if (y < 20) y = 20;
        if (y + h > this.game.height - 20) y = this.game.height - h - 20;

        // Final safety - if still off screen, center it
        if (x < 0 || x + w > this.game.width || y < 0 || y + h > this.game.height) {
          x = (this.game.width - w) / 2;
          y = (this.game.height - h) / 2;
        }
      } else {
        // Fallback to center
        x = (this.game.width - w) / 2;
        y = (this.game.height - h) / 2;
      }
    } else {
      // Fallback to center
      x = (this.game.width - w) / 2;
      y = (this.game.height - h) / 2;
    }

    // Get title and info from InteractionSystem
    const info = this.game.uiState.popupInfo || {};
    let title = '';
    if (type === 'planet') title = '[PLT] PLANETARY SCAN DATA';
    else if (type === 'moon') title = '[MUN] LUNAR SCAN DATA';
    else if (type === 'station') title = '[STN] SPACE STATION';
    else if (type === 'asteroid') title = '[AST] ASTEROID FIELD';
    else if (type === 'artifact') title = '[ART] ARTIFACT DETECTED';
    else if (type === 'warpgate') title = '[WRP] WARP GATE';

    // Main panel with terminal styling
    this.drawTerminalPanel(ctx, x, y, w, h, title, palette, true);

    // Content area
    const contentX = x + 25;
    const contentY = y + 80;
    const contentW = w - 50;

    ctx.save();

    // Render object info from InteractionSystem
    if (info.title && info.details) {
      this.renderInteractionInfo(ctx, contentX, contentY, contentW, info, palette);
    } else {
      // Fallback to old rendering methods
      if (type === 'planet' || type === 'moon') {
        this.renderCelestialBodyInfo(ctx, contentX, contentY, contentW, target.object || target, palette);
      } else if (type === 'station') {
        this.renderStationInfo(ctx, contentX, contentY, contentW, target.object || target, palette);
      } else if (type === 'asteroid') {
        this.renderAsteroidInfo(ctx, contentX, contentY, contentW, target.object || target, palette);
      }
    }

    ctx.restore();

    // Action buttons at bottom (from InteractionSystem)
    const buttonY = y + h - 100;
    const buttonW = 130;
    const buttonH = 45;
    const buttonSpacing = 15;
    const totalButtonWidth = buttons.length * buttonW + (buttons.length - 1) * buttonSpacing;
    let buttonX = x + (w - totalButtonWidth) / 2;

    // Get selected index from InteractionSystem
    const selectedIndex = this.game.interactionSystem ?
      this.game.interactionSystem.getSelectedOptionIndex() : -1;

    // Clear and reinitialize button bounds for fresh click detection
    this.game.popupButtonBounds = [];

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const isExit = button.label === 'EXIT';
      const isSelected = i === selectedIndex;

      this.drawInteractionButton(
        ctx,
        buttonX,
        buttonY,
        buttonW,
        buttonH,
        button.label,
        button.key,
        isExit,
        isSelected,
        palette
      );

      // Store button bounds for click detection
      this.game.popupButtonBounds[i] = {
        x: buttonX,
        y: buttonY,
        w: buttonW,
        h: buttonH,
        action: button.action
      };

      buttonX += buttonW + buttonSpacing;
    }

    // CRT effects
    this.drawScanlines(ctx, x, y, w, h);
    this.drawCRTNoise(ctx, x, y, w, h);

    // Help text
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = '#88aacc';
    ctx.font = '11px DigitalDisco, monospace';
    ctx.textAlign = 'center';

    // Different text for mobile vs desktop
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobile) {
      ctx.fillText('[Tap button to perform action] [Tap outside to close]', x + w / 2, y + h - 25);
    } else {
      ctx.fillText('[Click button / Press Enter] [↑↓ to navigate] [ESC to close]', x + w / 2, y + h - 25);
    }
    ctx.restore();
  }

  /**
   * Render celestial body information (planet/moon)
   */
  renderCelestialBodyInfo(ctx, x, y, w, body, palette) {
    let yPos = y;

    // Name
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = palette.warpBlue;
    ctx.fillStyle = palette.warpBlue;
    ctx.font = 'bold 24px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(body.name.toUpperCase(), x, yPos);
    ctx.shadowBlur = 0;
    yPos += 40;
    ctx.restore();

    // Data panel for specs
    this.drawDataPanel(ctx, x, yPos, w, 280, palette);

    ctx.save();
    yPos += 25;

    // Type
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TYPE:', x + 15, yPos);
    ctx.fillStyle = '#aabbcc';
    ctx.font = '14px DigitalDisco, monospace';
    ctx.fillText((body.type || 'Unknown').toUpperCase(), x + 150, yPos);
    yPos += 30;

    // Size / Radius
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('RADIUS:', x + 15, yPos);
    ctx.fillStyle = '#aabbcc';
    ctx.font = '14px DigitalDisco, monospace';
    ctx.fillText(`${body.radius ? Math.floor(body.radius) : 'Unknown'} km`, x + 150, yPos);
    yPos += 30;

    // Temperature
    const temp = body.temperature || body.surfaceTemp || 'Unknown';
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('TEMPERATURE:', x + 15, yPos);
    ctx.fillStyle = palette.cautionOrange;
    ctx.font = '14px DigitalDisco, monospace';
    ctx.fillText(temp === 'Unknown' ? temp : `${temp}°C`, x + 150, yPos);
    yPos += 30;

    // Habitable
    const habitable = body.habitable || body.inhabited || false;
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('HABITABLE:', x + 15, yPos);
    const habitableColor = habitable ? palette.statusGreen : palette.alertRed;
    ctx.shadowBlur = 6;
    ctx.shadowColor = habitableColor;
    ctx.fillStyle = habitableColor;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText(habitable ? 'YES' : 'NO', x + 150, yPos);
    ctx.shadowBlur = 0;
    yPos += 30;

    // Civilization
    if (body.civilization) {
      ctx.fillStyle = palette.statusBlue;
      ctx.font = 'bold 14px DigitalDisco, monospace';
      ctx.fillText('CIVILIZATION:', x + 15, yPos);
      ctx.fillStyle = palette.plasmaGreen;
      ctx.font = '14px DigitalDisco, monospace';
      ctx.fillText(body.civilization.name, x + 150, yPos);
      yPos += 30;
    }

    // Atmosphere
    if (body.atmosphere) {
      ctx.fillStyle = palette.statusBlue;
      ctx.font = 'bold 14px DigitalDisco, monospace';
      ctx.fillText('ATMOSPHERE:', x + 15, yPos);
      ctx.fillStyle = '#aabbcc';
      ctx.font = '14px DigitalDisco, monospace';
      ctx.fillText(body.atmosphere.toUpperCase(), x + 150, yPos);
      yPos += 30;
    }

    // Resources
    if (body.resources && body.resources.length > 0) {
      ctx.fillStyle = palette.statusBlue;
      ctx.font = 'bold 14px DigitalDisco, monospace';
      ctx.fillText('RESOURCES:', x + 15, yPos);
      yPos += 25;

      for (const resource of body.resources) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = palette.plasmaGreen;
        ctx.fillStyle = palette.plasmaGreen;
        ctx.font = '12px DigitalDisco, monospace';
        ctx.fillText(`• ${resource.toUpperCase()}`, x + 25, yPos);
        ctx.shadowBlur = 0;
        yPos += 20;
      }
    } else {
      ctx.fillStyle = palette.statusBlue;
      ctx.font = 'bold 14px DigitalDisco, monospace';
      ctx.fillText('RESOURCES:', x + 15, yPos);
      ctx.fillStyle = '#666677';
      ctx.font = '14px DigitalDisco, monospace';
      ctx.fillText('NONE DETECTED', x + 150, yPos);
    }

    ctx.restore();
  }

  /**
   * Render station information
   */
  renderStationInfo(ctx, x, y, w, station, palette) {
    let yPos = y;

    // Name
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = palette.statusBlue;
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 24px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(station.name ? station.name.toUpperCase() : 'SPACE STATION', x, yPos);
    ctx.shadowBlur = 0;
    yPos += 40;
    ctx.restore();

    // Data panel
    this.drawDataPanel(ctx, x, yPos, w, 280, palette);

    ctx.save();
    yPos += 25;

    // Type
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TYPE:', x + 15, yPos);
    ctx.fillStyle = '#aabbcc';
    ctx.font = '14px DigitalDisco, monospace';
    ctx.fillText((station.type || 'Trade Station').toUpperCase(), x + 150, yPos);
    yPos += 35;

    // Faction
    if (station.faction) {
      ctx.fillStyle = palette.statusBlue;
      ctx.font = 'bold 14px DigitalDisco, monospace';
      ctx.fillText('FACTION:', x + 15, yPos);
      ctx.fillStyle = palette.warpBlue;
      ctx.font = '14px DigitalDisco, monospace';
      ctx.fillText(station.faction.toUpperCase(), x + 150, yPos);
      yPos += 35;
    }

    // Services available
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 16px DigitalDisco, monospace';
    ctx.fillText('AVAILABLE SERVICES:', x + 15, yPos);
    yPos += 30;

    const services = [
      '• Trading & Market Access',
      '• Ship Repair & Maintenance',
      '• Fuel Refueling Services',
      '• Docking Bay Access'
    ];

    for (const service of services) {
      ctx.shadowBlur = 4;
      ctx.shadowColor = palette.plasmaGreen;
      ctx.fillStyle = palette.plasmaGreen;
      ctx.font = '13px DigitalDisco, monospace';
      ctx.fillText(service, x + 25, yPos);
      ctx.shadowBlur = 0;
      yPos += 25;
    }

    // Status
    yPos += 15;
    ctx.shadowBlur = 8;
    ctx.shadowColor = palette.statusGreen;
    ctx.fillStyle = palette.statusGreen;
    ctx.font = 'bold 15px DigitalDisco, monospace';
    ctx.fillText('✓ STATION OPERATIONAL', x + 15, yPos);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  /**
   * Render asteroid information
   */
  renderAsteroidInfo(ctx, x, y, w, asteroid, palette) {
    let yPos = y;

    // Title
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = palette.cautionOrange;
    ctx.fillStyle = palette.cautionOrange;
    ctx.font = 'bold 24px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ASTEROID', x, yPos);
    ctx.shadowBlur = 0;
    yPos += 40;
    ctx.restore();

    // Data panel
    this.drawDataPanel(ctx, x, yPos, w, 280, palette);

    ctx.save();
    yPos += 25;

    // Size
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SIZE:', x + 15, yPos);
    ctx.fillStyle = '#aabbcc';
    ctx.font = '14px DigitalDisco, monospace';
    const sizeDesc = asteroid.size < 15 ? 'SMALL' : asteroid.size < 25 ? 'MEDIUM' : 'LARGE';
    ctx.fillText(`${sizeDesc} (${Math.floor(asteroid.size)} m)`, x + 150, yPos);
    yPos += 35;

    // Composition
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('COMPOSITION:', x + 15, yPos);
    ctx.fillStyle = '#aabbcc';
    ctx.font = '14px DigitalDisco, monospace';
    ctx.fillText((asteroid.type || 'ROCKY').toUpperCase(), x + 150, yPos);
    yPos += 35;

    // Resources
    ctx.fillStyle = palette.statusBlue;
    ctx.font = 'bold 16px DigitalDisco, monospace';
    ctx.fillText('MINEABLE RESOURCES:', x + 15, yPos);
    yPos += 30;

    const resources = asteroid.resources || ['Iron Ore', 'Nickel', 'Silicates'];
    for (const resource of resources) {
      ctx.shadowBlur = 4;
      ctx.shadowColor = palette.plasmaGreen;
      ctx.fillStyle = palette.plasmaGreen;
      ctx.font = '13px DigitalDisco, monospace';
      ctx.fillText(`• ${resource.toUpperCase()}`, x + 25, yPos);
      ctx.shadowBlur = 0;
      yPos += 25;
    }

    // Mining yield estimate
    yPos += 15;
    ctx.fillStyle = palette.cautionOrange;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    const yieldEstimate = asteroid.size < 15 ? 'LOW' : asteroid.size < 25 ? 'MODERATE' : 'HIGH';
    ctx.fillText(`ESTIMATED YIELD: ${yieldEstimate}`, x + 15, yPos);

    ctx.restore();
  }

  /**
   * Render interaction info from InteractionSystem
   */
  renderInteractionInfo(ctx, x, y, w, info, palette) {
    let yPos = y;

    // Title/Name
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = palette.warpBlue;
    ctx.fillStyle = palette.warpBlue;
    ctx.font = 'bold 24px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(info.title.toUpperCase(), x, yPos);
    ctx.shadowBlur = 0;
    yPos += 40;
    ctx.restore();

    // Data panel for details
    const panelHeight = Math.min(350, info.details.length * 30 + 50);
    this.drawDataPanel(ctx, x, yPos, w, panelHeight, palette);

    ctx.save();
    yPos += 25;

    // Render all details
    for (const detail of info.details) {
      // Split on colon to separate label from value
      const parts = detail.split(':');

      if (parts.length > 1) {
        // Label: Value format
        ctx.fillStyle = palette.statusBlue;
        ctx.font = 'bold 14px DigitalDisco, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(parts[0].toUpperCase() + ':', x + 15, yPos);

        ctx.fillStyle = '#aabbcc';
        ctx.font = '14px DigitalDisco, monospace';
        ctx.fillText(parts.slice(1).join(':').trim(), x + 180, yPos);
      } else {
        // Plain text detail
        ctx.fillStyle = '#aabbcc';
        ctx.font = '14px DigitalDisco, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(detail, x + 15, yPos);
      }

      yPos += 30;
    }

    ctx.restore();
  }

  /**
   * Draw interaction button with keyboard hint and selection highlight
   */
  drawInteractionButton(ctx, x, y, w, h, label, keyHint, isExit, isSelected, palette) {
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x + 4, y + 4, w, h);

    // Button background
    const bgColor = isExit ? palette.alertRed : palette.statusBlue;
    const lightBgColor = isExit ? '#cc4444' : '#3366aa';

    // Highlight selected button
    if (isSelected) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = bgColor;
    }

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);

    // Button border (lighter at top, darker at bottom for 3D effect)
    ctx.strokeStyle = lightBgColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();

    const darkBgColor = isExit ? '#881111' : '#1a3366';
    ctx.strokeStyle = darkBgColor;
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.stroke();

    // Button label
    ctx.shadowBlur = isSelected ? 10 : 5;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 - 5);

    // Key hint at bottom
    if (keyHint) {
      ctx.shadowBlur = 2;
      ctx.shadowColor = lightBgColor;
      ctx.fillStyle = '#ccddee';
      ctx.font = '10px DigitalDisco, monospace';
      ctx.fillText(`[${keyHint}]`, x + w / 2, y + h - 10);
    }

    ctx.restore();
  }

  /**
   * Render Surface Exploration UI - Shows when player is landed on a planet
   */
  renderSurfaceExplorationUI(ctx) {
    const p = this.game.player;
    const palette = this.game.PALETTE;

    if (!p.landed || !p.landedOn) return;

    const x = 30;
    const y = this.game.height - 240;
    const w = 450;
    const h = 200;

    ctx.save();

    // Terminal panel with depth
    this.drawTerminalPanel(ctx, x, y, w, h, palette);

    // Header
    ctx.fillStyle = palette.statusBlue;
    ctx.shadowBlur = 8;
    ctx.shadowColor = palette.statusBlue;
    ctx.font = 'bold 18px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`◆ SURFACE OPERATIONS ◆`, x + 20, y + 35);
    ctx.shadowBlur = 0;

    // Location info
    ctx.fillStyle = '#88aacc';
    ctx.font = '13px DigitalDisco, monospace';
    ctx.fillText(`Location: ${p.landedOn.name || p.landedOn.type || 'Unknown'}`, x + 20, y + 60);

    // Surface resources section
    let yPos = y + 90;
    ctx.fillStyle = palette.plasmaGreen;
    ctx.font = 'bold 14px DigitalDisco, monospace';
    ctx.fillText('AVAILABLE RESOURCES:', x + 20, yPos);
    yPos += 25;

    if (p.surfaceResources && p.surfaceResources.length > 0) {
      ctx.fillStyle = '#aabbcc';
      ctx.font = '12px DigitalDisco, monospace';
      for (const resource of p.surfaceResources.slice(0, 3)) {
        ctx.shadowBlur = 2;
        ctx.shadowColor = palette.plasmaGreen;
        ctx.fillStyle = palette.plasmaGreen;
        ctx.fillText(`• ${resource.quantity}x ${resource.name}`, x + 30, yPos);
        ctx.shadowBlur = 0;
        yPos += 18;
      }
    } else {
      ctx.fillStyle = '#666677';
      ctx.font = '13px DigitalDisco, monospace';
      ctx.fillText('No resources collected yet', x + 30, yPos);
    }

    // Controls
    const controlsY = y + h - 35;
    ctx.fillStyle = '#88aacc';
    ctx.font = '12px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    const controlText = p.surfaceResources && p.surfaceResources.length > 0
      ? '[C or E] Collect Resources | [SPACE or L] Launch'
      : '[SPACE or L] Launch';
    ctx.fillText(controlText, x + w / 2, controlsY);

    // CRT effects
    this.drawCRTScanlines(ctx, x, y, w, h);
    this.drawCRTNoise(ctx, x, y, w, h);
    this.drawMetalVignette(ctx, x, y, w, h, palette);

    ctx.restore();
  }

  /**
   * Draw pixelated item icon
   * Creates retro pixelated icons based on item type
   */
  drawPixelatedItemIcon(ctx, x, y, size, iconName, rarity) {
    const palette = this.game.PALETTE;
    const rarityColors = {
      common: '#888888',
      uncommon: '#4488ff',
      rare: '#8844ff',
      epic: '#ff00ff',
      legendary: '#ffaa00',
      quest: '#00ffaa'
    };

    const baseColor = rarityColors[rarity] || '#888888';
    const pixelSize = Math.max(2, Math.floor(size / 16)); // 16x16 pixel grid

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Background square
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, size, size);

    // Border with rarity color
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = baseColor;
    ctx.strokeRect(x, y, size, size);
    ctx.shadowBlur = 0;

    // Draw pixelated icon based on type
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    // Parse icon type
    if (iconName.startsWith('LASER') || iconName.startsWith('PLASMA') || iconName.startsWith('ION') ||
        iconName.startsWith('RAIL') || iconName.startsWith('MISSILE') || iconName.startsWith('TORPEDO') ||
        iconName.startsWith('BEAM') || iconName.startsWith('PARTICLE')) {
      // Weapon icon - gun/barrel shape
      this.drawPixelWeapon(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('ORE_')) {
      // Ore icon - crystalline shape
      this.drawPixelOre(ctx, centerX, centerY, pixelSize, baseColor, iconName);
    } else if (iconName.startsWith('CRYSTAL_')) {
      // Crystal icon - diamond shape
      this.drawPixelCrystal(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('FUEL_') || iconName === 'ANTIMATTER') {
      // Fuel icon - canister
      this.drawPixelFuel(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('ENGINE')) {
      // Engine icon - thruster
      this.drawPixelEngine(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('SENSOR')) {
      // Sensor icon - dish/array
      this.drawPixelSensor(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('COMP')) {
      // Computer icon - circuit/chip
      this.drawPixelComputer(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('REACTOR')) {
      // Reactor icon - core
      this.drawPixelReactor(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('MAT_')) {
      // Material icon - sheet/plate
      this.drawPixelMaterial(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('AMMO_')) {
      // Ammo icon - projectile
      this.drawPixelAmmo(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('BP_')) {
      // Blueprint icon - schematic
      this.drawPixelBlueprint(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('DATA_')) {
      // Data icon - disk/chip
      this.drawPixelData(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName === 'MEDKIT' || iconName === 'STIM') {
      // Medical icon - cross
      this.drawPixelMedical(ctx, centerX, centerY, pixelSize, baseColor);
    } else if (iconName.startsWith('BIO_')) {
      // Biological icon - organic shape
      this.drawPixelBio(ctx, centerX, centerY, pixelSize, baseColor);
    } else {
      // Generic icon - box/cube
      this.drawPixelGeneric(ctx, centerX, centerY, pixelSize, baseColor);
    }

    ctx.restore();
  }

  // Weapon icon - gun shape
  drawPixelWeapon(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Barrel
    ctx.fillRect(cx + ps * 2, cy - ps, ps * 4, ps * 2);
    // Body
    ctx.fillRect(cx - ps * 2, cy - ps * 2, ps * 4, ps * 4);
    // Grip
    ctx.fillRect(cx - ps * 2, cy + ps * 2, ps * 2, ps * 2);
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(cx, cy - ps, ps, ps);
  }

  // Ore icon - rough crystal
  drawPixelOre(ctx, cx, cy, ps, color, type) {
    const oreColors = {
      'ORE_IRON': '#cc7755',
      'ORE_COPPER': '#dd8844',
      'ORE_TITANIUM': '#889999',
      'ORE_PLATINUM': '#ccccdd',
      'ORE_GOLD': '#ffcc44',
      'ORE_IRIDIUM': '#9977ff'
    };
    ctx.fillStyle = oreColors[type] || color;
    // Irregular rock shape
    ctx.fillRect(cx - ps * 3, cy - ps, ps * 6, ps * 2);
    ctx.fillRect(cx - ps * 2, cy - ps * 2, ps * 4, ps);
    ctx.fillRect(cx - ps * 2, cy + ps, ps * 4, ps);
    ctx.fillRect(cx - ps, cy - ps * 3, ps * 2, ps);
    ctx.fillRect(cx - ps, cy + ps * 2, ps * 2, ps);
  }

  // Crystal icon - diamond shape
  drawPixelCrystal(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Diamond
    ctx.fillRect(cx - ps, cy - ps * 4, ps * 2, ps);
    ctx.fillRect(cx - ps * 2, cy - ps * 3, ps * 4, ps);
    ctx.fillRect(cx - ps * 3, cy - ps * 2, ps * 6, ps * 4);
    ctx.fillRect(cx - ps * 2, cy + ps * 2, ps * 4, ps);
    ctx.fillRect(cx - ps, cy + ps * 3, ps * 2, ps);
    // Shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(cx, cy - ps * 2, ps, ps);
  }

  // Fuel icon - canister
  drawPixelFuel(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Canister body
    ctx.fillRect(cx - ps * 2, cy - ps * 3, ps * 4, ps * 6);
    // Top
    ctx.fillRect(cx - ps, cy - ps * 4, ps * 2, ps);
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(cx - ps, cy - ps * 2, ps, ps * 4);
  }

  // Engine icon - thruster
  drawPixelEngine(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Engine bell
    ctx.fillRect(cx - ps * 3, cy - ps * 2, ps * 6, ps * 4);
    ctx.fillRect(cx - ps * 2, cy - ps * 3, ps * 4, ps);
    ctx.fillRect(cx - ps * 2, cy + ps * 2, ps * 4, ps);
    // Exhaust
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(cx - ps, cy + ps * 3, ps * 2, ps);
  }

  // Sensor icon - dish
  drawPixelSensor(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Dish
    ctx.fillRect(cx - ps * 4, cy - ps * 2, ps * 8, ps * 4);
    ctx.fillRect(cx - ps * 3, cy - ps * 3, ps * 6, ps);
    ctx.fillRect(cx - ps * 3, cy + ps * 2, ps * 6, ps);
    // Pole
    ctx.fillRect(cx - ps, cy + ps * 3, ps * 2, ps * 2);
  }

  // Computer icon - chip
  drawPixelComputer(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Chip body
    ctx.fillRect(cx - ps * 3, cy - ps * 2, ps * 6, ps * 4);
    // Pins
    ctx.fillRect(cx - ps * 4, cy - ps, ps, ps * 2);
    ctx.fillRect(cx + ps * 3, cy - ps, ps, ps * 2);
    // Circuit lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(cx - ps, cy - ps, ps * 2, ps);
    ctx.fillRect(cx - ps, cy, ps * 2, ps);
  }

  // Reactor icon - glowing core
  drawPixelReactor(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Outer shell
    ctx.fillRect(cx - ps * 4, cy - ps * 3, ps * 8, ps * 6);
    // Core
    ctx.fillStyle = '#ffaa44';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffaa44';
    ctx.fillRect(cx - ps * 2, cy - ps * 2, ps * 4, ps * 4);
    ctx.shadowBlur = 0;
  }

  // Material icon - sheet/plate
  drawPixelMaterial(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Stack of plates
    ctx.fillRect(cx - ps * 3, cy - ps * 2, ps * 6, ps);
    ctx.fillRect(cx - ps * 3, cy, ps * 6, ps);
    ctx.fillRect(cx - ps * 3, cy + ps * 2, ps * 6, ps);
    // Edge highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(cx + ps * 2, cy - ps * 2, ps, ps * 5);
  }

  // Ammo icon - missile/projectile
  drawPixelAmmo(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Body
    ctx.fillRect(cx - ps * 2, cy - ps, ps * 5, ps * 2);
    // Tip
    ctx.fillRect(cx + ps * 3, cy, ps, ps);
    // Fins
    ctx.fillRect(cx - ps * 2, cy - ps * 2, ps, ps);
    ctx.fillRect(cx - ps * 2, cy + ps, ps, ps);
  }

  // Blueprint icon - schematic
  drawPixelBlueprint(ctx, cx, cy, ps, color) {
    ctx.fillStyle = '#4488ff';
    // Paper
    ctx.fillRect(cx - ps * 3, cy - ps * 3, ps * 6, ps * 6);
    // Grid lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(cx + i * ps, cy - ps * 3, ps, ps * 6);
      ctx.fillRect(cx - ps * 3, cy + i * ps, ps * 6, ps);
    }
  }

  // Data icon - disk
  drawPixelData(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Disk
    ctx.fillRect(cx - ps * 2, cy - ps * 2, ps * 4, ps * 4);
    // Hole
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - ps, cy - ps, ps * 2, ps * 2);
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(cx - ps * 2, cy - ps * 2, ps, ps);
  }

  // Medical icon - cross
  drawPixelMedical(ctx, cx, cy, ps, color) {
    ctx.fillStyle = '#ff4444';
    // Red cross
    ctx.fillRect(cx - ps, cy - ps * 3, ps * 2, ps * 6);
    ctx.fillRect(cx - ps * 3, cy - ps, ps * 6, ps * 2);
    // White highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx, cy - ps * 2, ps, ps * 4);
  }

  // Biological icon - organic blob
  drawPixelBio(ctx, cx, cy, ps, color) {
    ctx.fillStyle = '#44ff88';
    // Organic irregular shape
    ctx.fillRect(cx - ps * 2, cy - ps * 2, ps * 4, ps * 4);
    ctx.fillRect(cx - ps * 3, cy - ps, ps * 6, ps * 2);
    ctx.fillRect(cx - ps, cy - ps * 3, ps * 2, ps * 6);
    // Nucleus
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(cx - ps, cy - ps, ps * 2, ps * 2);
  }

  // Generic icon - cube
  drawPixelGeneric(ctx, cx, cy, ps, color) {
    ctx.fillStyle = color;
    // Isometric cube
    ctx.fillRect(cx - ps * 2, cy - ps, ps * 4, ps * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(cx - ps * 2, cy + ps, ps * 4, ps * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(cx - ps * 2, cy - ps, ps * 2, ps * 2);
  }
}
