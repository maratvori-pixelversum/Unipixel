import { SCALE_SYSTEM } from './ScaleSystem.js';

/**
 * Blackhole Renderer - Renders blackholes with accretion disk and gravitational effects
 */
export class BlackholeRenderer {
  constructor() {
    this.rotationAngle = 0;
  }

  /**
   * Render a blackhole with event horizon and accretion disk
   */
  renderBlackhole(ctx, x, y, blackhole, time) {
    // Validate inputs
    if (!ctx || !blackhole) {
      return; // Silent fail - invalid data
    }

    try {
      const coreRadius = blackhole.coreRadius || SCALE_SYSTEM.BLACKHOLE_CORE;
      const eventHorizonRadius = blackhole.eventHorizonRadius || SCALE_SYSTEM.BLACKHOLE_EVENT_HORIZON;
      const diskRadius = blackhole.diskRadius || SCALE_SYSTEM.BLACKHOLE_ACCRETION_DISK;

      ctx.save();
      ctx.translate(x, y);

    // Accretion disk rotation
    this.rotationAngle = (time * 0.5) % (Math.PI * 2);

    // 1. Outer glow (gravitational lensing effect)
    const outerGlow = ctx.createRadialGradient(0, 0, eventHorizonRadius, 0, 0, diskRadius);
    outerGlow.addColorStop(0, 'rgba(255, 100, 50, 0)');
    outerGlow.addColorStop(0.5, 'rgba(255, 150, 100, 0.1)');
    outerGlow.addColorStop(1, 'rgba(255, 200, 150, 0.3)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, diskRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Accretion disk (rotating spirals)
    this.renderAccretionDisk(ctx, diskRadius, eventHorizonRadius);

    // 3. Event horizon (black sphere)
    const horizonGradient = ctx.createRadialGradient(
      -eventHorizonRadius * 0.2, -eventHorizonRadius * 0.2, 0,
      0, 0, eventHorizonRadius
    );
    horizonGradient.addColorStop(0, '#1a1a1a');
    horizonGradient.addColorStop(0.7, '#000000');
    horizonGradient.addColorStop(1, '#000000');

    ctx.fillStyle = horizonGradient;
    ctx.beginPath();
    ctx.arc(0, 0, eventHorizonRadius, 0, Math.PI * 2);
    ctx.fill();

    // 4. Singularity core (ultra-dense point)
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.3, '#8800ff');
    coreGradient.addColorStop(1, '#000000');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();

      // 5. Hawking radiation (quantum effects at edge)
      this.renderHawkingRadiation(ctx, eventHorizonRadius, time);

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
   * Render chaotic pixelated accretion disk with turbulence
   */
  renderAccretionDisk(ctx, diskRadius, eventHorizonRadius) {
    const spirals = 12; // More spiral arms for chaos
    const colors = [
      { r: 255, g: 150, b: 0 },   // Orange
      { r: 255, g: 100, b: 50 },  // Red-orange
      { r: 255, g: 200, b: 100 }, // Yellow-orange
      { r: 200, g: 100, b: 255 }, // Purple (blue-shifted)
      { r: 255, g: 50, b: 50 },   // Red
      { r: 255, g: 255, b: 150 }  // Bright yellow
    ];

    // Render pixelated chaotic disk material
    const pixelSize = 4;
    const diskThickness = diskRadius - eventHorizonRadius;
    const pixelCount = Math.ceil(diskThickness / pixelSize);

    for (let spiral = 0; spiral < spirals; spiral++) {
      const spiralAngle = (spiral / spirals) * Math.PI * 2;

      ctx.save();
      ctx.rotate(this.rotationAngle + spiralAngle);

      // Draw pixelated spiral arm
      for (let i = 0; i < pixelCount; i++) {
        const r = eventHorizonRadius + i * pixelSize;
        if (r >= diskRadius) break;

        const theta = (r - eventHorizonRadius) * 0.03;

        // Add turbulence/chaos
        const turbulence = Math.sin(this.rotationAngle * 3 + r * 0.02 + spiral) * 15;
        const chaoticR = r + turbulence;

        const x = chaoticR * Math.cos(theta);
        const y = chaoticR * Math.sin(theta);

        // Distance-based intensity (brighter near event horizon)
        const normalizedDist = (r - eventHorizonRadius) / diskThickness;
        const intensity = 1 - normalizedDist * 0.6;

        // Temperature variation (hotter material closer to center)
        const colorIndex = Math.floor((1 - normalizedDist) * (colors.length - 1));
        const color = colors[Math.min(colorIndex, colors.length - 1)];

        // Add flickering chaos
        const flicker = Math.sin(this.rotationAngle * 5 + i * 0.3 + spiral) * 0.2 + 0.8;
        const alpha = Math.max(0, Math.min(1, intensity * flicker * 0.7));

        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
        ctx.fillRect(
          Math.floor(x - pixelSize / 2),
          Math.floor(y - pixelSize / 2),
          Math.ceil(pixelSize),
          Math.ceil(pixelSize)
        );

        // Add occasional bright hotspots (clumps of matter)
        if (Math.random() < 0.03) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
          ctx.fillRect(
            Math.floor(x - pixelSize / 2),
            Math.floor(y - pixelSize / 2),
            Math.ceil(pixelSize * 1.5),
            Math.ceil(pixelSize * 1.5)
          );
        }
      }

      ctx.restore();
    }

    // Add disk turbulence effects (matter clumps and jets)
    this.renderDiskTurbulence(ctx, diskRadius, eventHorizonRadius);
  }

  /**
   * Render chaotic turbulence, matter clumps, and jets in the accretion disk
   */
  renderDiskTurbulence(ctx, diskRadius, eventHorizonRadius) {
    // Render matter clumps
    const clumpCount = 15;
    for (let i = 0; i < clumpCount; i++) {
      const angle = (i / clumpCount) * Math.PI * 2 + this.rotationAngle * 2;
      const distance = eventHorizonRadius + (diskRadius - eventHorizonRadius) * (0.3 + (i % 3) * 0.3);
      const clumpSize = 8 + Math.sin(this.rotationAngle * 4 + i) * 4;

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      // Bright clump with glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, clumpSize);
      gradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
      gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.6)');
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, clumpSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render polar jets (matter ejected perpendicular to disk)
    this.renderPolarJets(ctx, eventHorizonRadius);
  }

  /**
   * Render polar jets shooting out from black hole poles
   */
  renderPolarJets(ctx, eventHorizonRadius) {
    const jetLength = eventHorizonRadius * 3;
    const jetWidth = eventHorizonRadius * 0.3;

    // Top jet
    this.renderJet(ctx, 0, -eventHorizonRadius, 0, -jetLength, jetWidth, -Math.PI / 2);

    // Bottom jet
    this.renderJet(ctx, 0, eventHorizonRadius, 0, jetLength, jetWidth, Math.PI / 2);
  }

  /**
   * Render individual jet
   */
  renderJet(ctx, x1, y1, x2, y2, width, direction) {
    const pixelSize = 3;
    const jetLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const pixels = Math.ceil(jetLength / pixelSize);

    const dx = (x2 - x1) / jetLength;
    const dy = (y2 - y1) / jetLength;

    for (let i = 0; i < pixels; i++) {
      const t = i / pixels;
      const x = x1 + dx * i * pixelSize;
      const y = y1 + dy * i * pixelSize;

      // Taper width along jet length
      const currentWidth = width * (1 - t * 0.7);

      // Add turbulence to jet
      const wobble = Math.sin(this.rotationAngle * 2 + i * 0.3) * currentWidth * 0.3;
      const wobbleX = x - dy * wobble;
      const wobbleY = y + dx * wobble;

      // Fade out towards end
      const alpha = (1 - t * 0.8) * 0.6;

      // Color variation (blue-shifted at edges, orange at core)
      const isCore = Math.abs(wobble) < currentWidth * 0.3;
      const color = isCore ?
        `rgba(255, 200, 100, ${alpha})` :
        `rgba(150, 150, 255, ${alpha * 0.7})`;

      ctx.fillStyle = color;
      ctx.fillRect(
        Math.floor(wobbleX - pixelSize / 2),
        Math.floor(wobbleY - pixelSize / 2),
        Math.ceil(pixelSize),
        Math.ceil(pixelSize)
      );
    }
  }

  /**
   * Render Hawking radiation particles at event horizon
   */
  renderHawkingRadiation(ctx, radius, time) {
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Flickering particles
      const opacity = 0.3 + Math.sin(time * 10 + i) * 0.3;
      ctx.fillStyle = `rgba(100, 150, 255, ${opacity})`;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Calculate gravitational pull effect on nearby objects
   */
  calculateGravitationalPull(objectX, objectY, blackholeX, blackholeY, blackholeMass) {
    const dx = blackholeX - objectX;
    const dy = blackholeY - objectY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) return { fx: 0, fy: 0, isWithinEventHorizon: true };

    // Gravitational force: F = G * M / r^2
    const G = 0.01; // Gravitational constant (scaled for gameplay)
    const force = (G * blackholeMass) / (distance * distance);

    // Event horizon check
    const eventHorizonRadius = SCALE_SYSTEM.BLACKHOLE_EVENT_HORIZON;
    const isWithinEventHorizon = distance < eventHorizonRadius;

    return {
      fx: (dx / distance) * force,
      fy: (dy / distance) * force,
      isWithinEventHorizon,
      distance
    };
  }

  /**
   * Apply gravitational lensing visual effect
   */
  renderGravitationalLensing(ctx, x, y, radius, stars) {
    // This would distort the starfield around the blackhole
    // Implementing simple circular distortion
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const lensRadius = radius * 3;

    // Create distortion effect
    for (const star of stars) {
      const dx = star.x - x;
      const dy = star.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < lensRadius && distance > 0) {
        const bendFactor = 1 - (distance / lensRadius);
        const angle = Math.atan2(dy, dx);

        // Bend light around blackhole
        const bentAngle = angle + bendFactor * 0.5;
        const bentDistance = distance * (1 + bendFactor * 0.2);

        const bentX = x + Math.cos(bentAngle) * bentDistance;
        const bentY = y + Math.sin(bentAngle) * bentDistance;

        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * bendFactor})`;
        ctx.fillRect(bentX, bentY, 2, 2);
      }
    }

    ctx.restore();
  }
}
