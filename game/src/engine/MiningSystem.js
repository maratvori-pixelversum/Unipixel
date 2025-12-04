/**
 * Mining System - Extract resources from asteroids
 * Based on PROMPT 16: Resource System - Mining Mechanics
 */

import { RESOURCE_TYPES } from './ResourceSystem.js';

export class MiningSystem {
  constructor(game) {
    this.game = game;
    this.miningTarget = null;
    this.miningProgress = 0;
    this.miningTime = 3.0; // 3 seconds to mine an asteroid
    this.miningRange = 200; // Maximum mining range
    this.miningActive = false;
    this.miningBeam = null;
  }

  /**
   * Find nearest mineable asteroid
   */
  findNearestAsteroid() {
    if (!this.game.asteroids || this.game.asteroids.length === 0) {
      return null;
    }

    const player = this.game.player;
    let nearest = null;
    let minDist = Infinity;

    for (const asteroid of this.game.asteroids) {
      if (asteroid.mined) continue; // Skip already mined asteroids

      const dx = asteroid.x - player.x;
      const dy = asteroid.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.miningRange && dist < minDist) {
        minDist = dist;
        nearest = asteroid;
      }
    }

    return nearest;
  }

  /**
   * Start mining process
   */
  startMining() {
    const target = this.findNearestAsteroid();

    if (!target) {
      return { success: false, reason: 'no_target' };
    }

    this.miningTarget = target;
    this.miningProgress = 0;
    this.miningActive = true;

    // Create mining beam visual
    this.miningBeam = {
      startX: this.game.player.x,
      startY: this.game.player.y,
      endX: target.x,
      endY: target.y,
      color: '#00ff88',
      width: 3,
      particles: []
    };

    return { success: true, target };
  }

  /**
   * Stop mining process
   */
  stopMining() {
    this.miningActive = false;
    this.miningTarget = null;
    this.miningProgress = 0;
    this.miningBeam = null;
  }

  /**
   * Update mining progress
   */
  update(dt) {
    if (!this.miningActive || !this.miningTarget) {
      return { success: false, reason: 'not_mining' };
    }

    // Check if target is still in range
    const dx = this.miningTarget.x - this.game.player.x;
    const dy = this.miningTarget.y - this.game.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.miningRange) {
      this.stopMining();
      return { success: false, reason: 'out_of_range' };
    }

    // Update mining progress
    this.miningProgress += dt;

    // Update beam position
    if (this.miningBeam) {
      this.miningBeam.startX = this.game.player.x;
      this.miningBeam.startY = this.game.player.y;
      this.miningBeam.endX = this.miningTarget.x;
      this.miningBeam.endY = this.miningTarget.y;

      // Add mining particles
      if (Math.random() > 0.7) {
        this.miningBeam.particles.push({
          x: this.miningTarget.x + (Math.random() - 0.5) * 20,
          y: this.miningTarget.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 50,
          vy: (Math.random() - 0.5) * 50,
          life: 1.0,
          color: '#ffaa00'
        });
      }

      // Update particles
      for (let i = this.miningBeam.particles.length - 1; i >= 0; i--) {
        const p = this.miningBeam.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 2;

        if (p.life <= 0) {
          this.miningBeam.particles.splice(i, 1);
        }
      }
    }

    // Check if mining complete
    if (this.miningProgress >= this.miningTime) {
      return this.completeMining();
    }

    return { success: true, progress: this.miningProgress / this.miningTime };
  }

  /**
   * Complete mining and extract resources
   */
  completeMining() {
    if (!this.miningTarget) {
      return { success: false, reason: 'no_target' };
    }

    // Determine resources from asteroid
    const resources = this.extractResources(this.miningTarget);

    // Mark asteroid as mined
    this.miningTarget.mined = true;
    this.miningTarget.opacity = 0.3; // Fade out mined asteroids

    // Add resources to cargo
    const results = [];
    for (const resource of resources) {
      const result = this.game.cargoSystem.addCargo(resource.id, resource.quantity);

      if (result.success) {
        this.game.resourceSystem.addResource(resource.id, resource.quantity);
        results.push({
          resource: RESOURCE_TYPES[resource.id.toUpperCase()],
          quantity: resource.quantity
        });
      } else if (result.success === 'partial') {
        this.game.resourceSystem.addResource(resource.id, result.added);
        results.push({
          resource: RESOURCE_TYPES[resource.id.toUpperCase()],
          quantity: result.added,
          partial: true
        });
      }
    }

    this.stopMining();

    return {
      success: true,
      resources: results,
      cargoFull: results.some(r => r.partial)
    };
  }

  /**
   * Extract resources based on asteroid properties
   */
  extractResources(asteroid) {
    const resources = [];
    const baseYield = 5 + Math.floor(Math.random() * 10); // 5-15 units

    // Determine resource type based on asteroid size and random chance
    const roll = Math.random();

    if (roll < 0.5) {
      // Common resources (50% chance)
      const commonResources = ['iron', 'silicon', 'carbon', 'water'];
      const resourceId = commonResources[Math.floor(Math.random() * commonResources.length)];
      resources.push({
        id: resourceId,
        quantity: baseYield
      });
    } else if (roll < 0.85) {
      // Uncommon resources (35% chance)
      const uncommonResources = ['titanium', 'copper', 'platinum'];
      const resourceId = uncommonResources[Math.floor(Math.random() * uncommonResources.length)];
      resources.push({
        id: resourceId,
        quantity: Math.floor(baseYield * 0.6) // Less quantity
      });
    } else {
      // Rare resources (15% chance)
      const rareResources = ['exotic_matter', 'rare_isotopes', 'crystalline_matrix'];
      const resourceId = rareResources[Math.floor(Math.random() * rareResources.length)];
      resources.push({
        id: resourceId,
        quantity: Math.floor(baseYield * 0.3) // Even less quantity
      });
    }

    // Small chance of bonus resource
    if (Math.random() > 0.8) {
      resources.push({
        id: 'iron',
        quantity: Math.floor(baseYield * 0.5)
      });
    }

    return resources;
  }

  /**
   * Render mining beam and effects
   */
  render(ctx, camera) {
    if (!this.miningActive || !this.miningBeam) {
      return;
    }

    const camX = camera.x;
    const camY = camera.y;

    // Mining beam
    const startX = this.miningBeam.startX - camX;
    const startY = this.miningBeam.startY - camY;
    const endX = this.miningBeam.endX - camX;
    const endY = this.miningBeam.endY - camY;

    // Outer glow
    ctx.strokeStyle = this.miningBeam.color + '33';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Core beam
    ctx.strokeStyle = this.miningBeam.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Bright center
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Mining particles
    for (const particle of this.miningBeam.particles) {
      const px = particle.x - camX;
      const py = particle.y - camY;
      const alpha = Math.floor(particle.life * 255).toString(16).padStart(2, '0');

      ctx.fillStyle = particle.color + alpha;
      ctx.fillRect(px - 2, py - 2, 4, 4);
    }

    // Progress indicator at target
    if (this.miningTarget) {
      const progress = this.miningProgress / this.miningTime;
      const barWidth = 60;
      const barHeight = 6;
      const barX = endX - barWidth / 2;
      const barY = endY - this.miningTarget.size - 20;

      // Background
      ctx.fillStyle = '#000000';
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

      // Progress bar
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);

      // Border
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Percentage text
      ctx.fillStyle = '#00ff88';
      ctx.font = '10px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(progress * 100)}%`, endX, barY - 5);
    }
  }

  /**
   * Get mining progress (0-1)
   */
  getProgress() {
    if (!this.miningActive) return 0;
    return this.miningProgress / this.miningTime;
  }

  /**
   * Check if currently mining
   */
  isMining() {
    return this.miningActive;
  }
}
