/**
 * OptimizedRenderer - High-performance rendering system
 *
 * Optimizations:
 * - Batched rendering to minimize state changes
 * - Gradient caching to avoid recreation
 * - Efficient culling with spatial partitioning
 * - Pre-compiled render lists
 */

export class OptimizedRenderer {
  constructor(game) {
    this.game = game;

    // Gradient cache
    this.gradientCache = new Map();
    this.maxCacheSize = 100;

    // Batch rendering groups
    this.renderBatches = {
      particles: [],
      projectiles: [],
      debris: []
    };

    // Pre-allocated arrays to avoid GC
    this.visibleEntities = [];

    // Cached viewport for culling
    this.viewport = { x: 0, y: 0, width: 0, height: 0 };
  }

  /**
   * Get or create a cached gradient
   */
  getCachedGradient(ctx, key, createFn) {
    if (this.gradientCache.has(key)) {
      return this.gradientCache.get(key);
    }

    const gradient = createFn();

    // Limit cache size
    if (this.gradientCache.size >= this.maxCacheSize) {
      const firstKey = this.gradientCache.keys().next().value;
      this.gradientCache.delete(firstKey);
    }

    this.gradientCache.set(key, gradient);
    return gradient;
  }

  /**
   * Fast viewport culling check
   */
  isInViewport(x, y, radius = 50) {
    const v = this.viewport;
    return (
      x + radius >= v.x &&
      x - radius <= v.x + v.width &&
      y + radius >= v.y &&
      y - radius <= v.y + v.height
    );
  }

  /**
   * Update viewport for culling
   */
  updateViewport(camX, camY, width, height, padding = 200) {
    this.viewport.x = camX - padding;
    this.viewport.y = camY - padding;
    this.viewport.width = width + padding * 2;
    this.viewport.height = height + padding * 2;
  }

  /**
   * Batch render particles efficiently
   */
  batchRenderParticles(ctx, particles, camX, camY) {
    // Group particles by type and color to minimize state changes
    const batches = new Map();

    for (const p of particles) {
      const px = Math.floor(p.x - camX);
      const py = Math.floor(p.y - camY);

      // Quick viewport cull
      if (px < -100 || px > this.game.width + 100 || py < -100 || py > this.game.height + 100) {
        continue;
      }

      const key = `${p.type}_${p.color}_${p.size}`;
      if (!batches.has(key)) {
        batches.set(key, []);
      }

      batches.get(key).push({ px, py, p });
    }

    // Render each batch
    for (const [key, batch] of batches) {
      if (batch.length === 0) continue;

      const first = batch[0].p;
      ctx.fillStyle = first.color;

      // Render all particles of same type/color together
      for (const { px, py, p } of batch) {
        const alpha = p.life / p.maxLife;

        // Simple particle rendering (most common case)
        if (!p.type || p.type === 'engine' || p.type === 'warp_ring') {
          ctx.globalAlpha = alpha * 0.85;
          ctx.fillRect(px, py, p.size, p.size);
        }
      }

      ctx.globalAlpha = 1;
    }
  }

  /**
   * Optimized explosion rendering with cached gradients
   */
  renderExplosion(ctx, exp, camX, camY) {
    const ex = Math.floor(exp.x - camX);
    const ey = Math.floor(exp.y - camY);
    const alpha = exp.life / exp.maxLife;
    const invAlpha = 1 - alpha;

    // Viewport cull
    if (ex < -exp.radius - 100 || ex > this.game.width + exp.radius + 100 ||
        ey < -exp.radius - 100 || ey > this.game.height + exp.radius + 100) {
      return;
    }

    ctx.save();

    // Simplified shockwave (1 ring instead of 3)
    ctx.strokeStyle = `${this.game.PALETTE.engineOrange}${Math.floor(alpha * 80).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ex, ey, exp.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Cached gradient for core
    const gradKey = `exp_core_${Math.floor(exp.radius / 10) * 10}`;
    const coreGrad = this.getCachedGradient(ctx, gradKey, () => {
      const g = ctx.createRadialGradient(
        ex - exp.radius * 0.2, ey - exp.radius * 0.2, 0,
        ex, ey, exp.radius * 0.8
      );
      g.addColorStop(0, this.game.PALETTE.starWhite);
      g.addColorStop(0.3, this.game.PALETTE.engineBright);
      g.addColorStop(0.6, this.game.PALETTE.engineOrange);
      g.addColorStop(1, `${this.game.PALETTE.engineOrange}00`);
      return g;
    });

    ctx.globalAlpha = alpha;
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, exp.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Reduced debris count (10 instead of 100+)
    const debrisCount = 10;
    const pixelSize = 3;
    for (let d = 0; d < debrisCount; d++) {
      const angle = (d / debrisCount) * Math.PI * 2 + exp.life * 0.5;
      const dist = exp.radius * (0.7 + (d % 2) * 0.3) * (1 + invAlpha * 0.5);
      const dx = ex + Math.cos(angle) * dist;
      const dy = ey + Math.sin(angle) * dist;

      ctx.fillStyle = d % 3 === 0 ?
        `rgba(255, 200, 0, ${alpha * 0.9})` :
        `rgba(255, 120, 0, ${alpha * 0.7})`;
      ctx.fillRect(Math.floor(dx), Math.floor(dy), pixelSize, pixelSize);
    }

    // Flash (early explosion only)
    if (alpha > 0.7) {
      const flashIntensity = (alpha - 0.7) / 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.8})`;
      ctx.beginPath();
      ctx.arc(ex, ey, exp.radius * 0.3 * flashIntensity, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Optimized comet rendering with cached gradients
   */
  renderComet(ctx, comet, starX, starY, camX, camY, time) {
    const cx = Math.floor(starX + Math.cos(comet.angle) * comet.distance - camX);
    const cy = Math.floor(starY + Math.sin(comet.angle) * comet.distance - camY);

    // Viewport cull
    if (cx < -500 || cx > this.game.width + 500 || cy < -500 || cy > this.game.height + 500) {
      return;
    }

    ctx.save();

    // Tail angle
    const tailAngle = Math.atan2(cy - (starY - camY), cx - (starX - camX));
    const tailLength = comet.tailLength || 200;

    // Cached gas tail gradient
    const gasTailKey = `comet_gas_${Math.floor(tailLength / 50)}`;
    const gasTailGrad = this.getCachedGradient(ctx, gasTailKey, () => {
      const g = ctx.createLinearGradient(
        0, 0,
        Math.cos(tailAngle) * tailLength,
        Math.sin(tailAngle) * tailLength
      );
      g.addColorStop(0, `${this.game.PALETTE.statusBlue}88`);
      g.addColorStop(0.4, `${this.game.PALETTE.statusBlue}44`);
      g.addColorStop(1, `${this.game.PALETTE.statusBlue}00`);
      return g;
    });

    ctx.strokeStyle = gasTailGrad;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(tailAngle) * tailLength,
      cy + Math.sin(tailAngle) * tailLength
    );
    ctx.stroke();

    // Dust tail (simplified)
    ctx.strokeStyle = `${this.game.PALETTE.starWhite}cc`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(tailAngle) * tailLength * 0.7,
      cy + Math.sin(tailAngle) * tailLength * 0.7
    );
    ctx.stroke();

    // Reduced debris (5 instead of 30)
    for (let d = 0; d < 5; d++) {
      const t = d / 5;
      const debrisX = cx + Math.cos(tailAngle) * tailLength * t;
      const debrisY = cy + Math.sin(tailAngle) * tailLength * t;
      const debrisAlpha = (1 - t) * 0.6;
      ctx.fillStyle = `${this.game.PALETTE.starWhite}${Math.floor(debrisAlpha * 255).toString(16).padStart(2, '0')}`;
      ctx.fillRect(Math.floor(debrisX) - 1, Math.floor(debrisY) - 1, 2, 2);
    }

    // Nucleus
    const cometRadius = comet.radius || 22;
    const coreGrad = ctx.createRadialGradient(
      cx - cometRadius * 0.3, cy - cometRadius * 0.3, 0,
      cx, cy, cometRadius
    );
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.6, '#aaccff');
    coreGrad.addColorStop(1, `${this.game.PALETTE.statusBlue}aa`);

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, cometRadius, 0, Math.PI * 2);
    ctx.fill();

    // Simplified surface texture (10 pixels instead of 40)
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const dist = (i % 3) / 3 * cometRadius;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;

      ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(150, 160, 180, 0.6)';
      ctx.fillRect(Math.floor(px) - 1, Math.floor(py) - 1, 2, 2);
    }

    // Core highlight
    ctx.fillStyle = this.game.PALETTE.starWhite;
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Clear gradient cache periodically
   */
  clearOldCaches() {
    if (this.gradientCache.size > this.maxCacheSize * 1.5) {
      // Keep only half the cache
      const keys = Array.from(this.gradientCache.keys());
      for (let i = 0; i < keys.length / 2; i++) {
        this.gradientCache.delete(keys[i]);
      }
    }
  }
}
