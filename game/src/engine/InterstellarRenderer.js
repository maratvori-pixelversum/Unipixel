/**
 * Interstellar Space Renderer
 * Renders star systems as large pixelated bubbles with glowing stars
 * for the interstellar travel scene
 */
export class InterstellarRenderer {
  constructor(galaxy) {
    this.galaxy = galaxy;
    this.bubbleParticles = new Map(); // Particle effects for each system
    this.initializeBubbles();
  }

  /**
   * Initialize bubble particles for each star system
   */
  initializeBubbles() {
    this.galaxy.forEach((system, index) => {
      const particles = [];
      const particleCount = 20 + Math.floor(Math.random() * 30);

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 150;
        particles.push({
          angle,
          distance,
          speed: 0.001 + Math.random() * 0.002,
          size: 1 + Math.random() * 3,
          brightness: Math.random(),
          orbitalPhase: Math.random() * Math.PI * 2
        });
      }

      this.bubbleParticles.set(index, particles);
    });
  }

  /**
   * Render all star systems as bubbles in interstellar space
   */
  renderInterstellarSpace(ctx, camera, currentSystemIndex, playerX, playerY) {
    const screenCenterX = ctx.canvas.width / 2;
    const screenCenterY = ctx.canvas.height / 2;

    // Render star systems
    this.galaxy.forEach((system, index) => {
      // Calculate screen position
      const screenX = screenCenterX + (system.position.x - playerX);
      const screenY = screenCenterY + (system.position.y - playerY);

      // Skip if way off-screen (optimization)
      const screenDist = Math.sqrt(
        Math.pow(screenX - screenCenterX, 2) +
        Math.pow(screenY - screenCenterY, 2)
      );
      if (screenDist > 2000) return;

      // Render the star system bubble
      this.renderSystemBubble(ctx, screenX, screenY, system, index, index === currentSystemIndex);
    });
  }

  /**
   * Render a single star system as a pixelated bubble with realistic details
   */
  renderSystemBubble(ctx, x, y, system, systemIndex, isCurrentSystem) {
    const bubbleRadius = system.discovered ? 200 : 130;
    const starRadius = system.discovered ? 45 : 28;
    const time = Date.now() * 0.001;

    // DISABLED: Nebula-like background glow removed per user request
    // if (system.discovered) {
    //   const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, bubbleRadius + 80);
    //   nebulaGradient.addColorStop(0, `${system.starColor}00`);
    //   nebulaGradient.addColorStop(0.3, `${system.starColor}11`);
    //   nebulaGradient.addColorStop(0.6, `${system.starColor}22`);
    //   nebulaGradient.addColorStop(1, 'transparent');
    //   ctx.fillStyle = nebulaGradient;
    //   ctx.beginPath();
    //   ctx.arc(x, y, bubbleRadius + 80, 0, Math.PI * 2);
    //   ctx.fill();
    // }

    // === BUBBLE BOUNDARY (More detailed) ===

    if (system.discovered) {
      // Outer glow with pulsing
      const pulse = Math.sin(time * 1.5) * 0.15 + 0.85;
      const outerGlow = ctx.createRadialGradient(x, y, bubbleRadius - 40, x, y, bubbleRadius + 40);
      outerGlow.addColorStop(0, 'transparent');
      outerGlow.addColorStop(0.5, `${system.starColor}${Math.floor(pulse * 51).toString(16).padStart(2, '0')}`);
      outerGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(x, y, bubbleRadius + 40, 0, Math.PI * 2);
      ctx.fill();

      // Main boundary (hexagonal pixelated pattern with flow)
      const hexagonSides = 32;
      ctx.strokeStyle = `${system.starColor}${Math.floor(pulse * 170).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 3;

      ctx.beginPath();
      for (let i = 0; i <= hexagonSides; i++) {
        const angle = (i / hexagonSides) * Math.PI * 2;
        // Add flowing pixelated noise
        const noise = Math.sin(angle * 8 + time * 0.5) * 8 + Math.cos(angle * 5 - time * 0.3) * 4;
        const r = bubbleRadius + noise;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Inner boundary layer (subtle)
      ctx.strokeStyle = `${system.starColor}66`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= hexagonSides; i++) {
        const angle = (i / hexagonSides) * Math.PI * 2 + 0.1;
        const noise = Math.sin(angle * 8 + time * 0.5 + 0.5) * 6;
        const r = bubbleRadius - 20 + noise;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      // Boundary energy particles (flowing along edge)
      const edgeParticles = 16;
      for (let i = 0; i < edgeParticles; i++) {
        const angle = (i / edgeParticles) * Math.PI * 2 + time * 0.4;
        const particlePhase = Math.sin(time * 3 + i * 0.5) * 0.5 + 0.5;
        const r = bubbleRadius + Math.sin(angle * 6 + time) * 8;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        ctx.fillStyle = `${system.starColor}${Math.floor(particlePhase * 200).toString(16).padStart(2, '0')}`;
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    }

    // === VISIBLE ORBITAL BODIES (Planets) ===

    if (system.discovered && system.planetCount > 0) {
      const orbitalRings = Math.min(system.planetCount, 5); // Show up to 5 orbital rings

      for (let ring = 0; ring < orbitalRings; ring++) {
        const orbitRadius = starRadius * 2.2 + ring * 18;
        const orbitSpeed = 0.15 / (ring + 1);
        const planetAngle = time * orbitSpeed + ring * Math.PI / 3;

        // Orbital path (faint)
        ctx.strokeStyle = `${system.starColor}22`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(x, y, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Planet
        const planetX = x + Math.cos(planetAngle) * orbitRadius;
        const planetY = y + Math.sin(planetAngle) * orbitRadius;
        const planetSize = 3 + (ring === 3 || ring === 4 ? 2 : 0); // Gas giants larger

        // Planet colors based on position
        const planetColors = ['#3366aa', '#2a8844', '#cc6644', '#ff8844', '#8844aa'];
        const planetColor = planetColors[ring % planetColors.length];

        ctx.fillStyle = planetColor;
        ctx.fillRect(planetX - planetSize/2, planetY - planetSize/2, planetSize, planetSize);

        // Planet glow
        ctx.fillStyle = `${planetColor}44`;
        ctx.fillRect(planetX - planetSize, planetY - planetSize, planetSize * 2, planetSize * 2);
      }
    }

    // === BUBBLE INTERIOR PARTICLES (Enhanced) ===

    if (system.discovered) {
      const particles = this.bubbleParticles.get(systemIndex) || [];

      particles.forEach(particle => {
        // Update orbital position
        particle.orbitalPhase += particle.speed;

        const px = x + Math.cos(particle.orbitalPhase) * particle.distance;
        const py = y + Math.sin(particle.orbitalPhase) * particle.distance;

        // Twinkling effect
        const twinkle = Math.sin(time * 4 + particle.orbitalPhase * 10) * 0.3 + 0.7;
        const alpha = Math.floor((particle.brightness * twinkle * 0.6 + 0.3) * 255).toString(16).padStart(2, '0');

        ctx.fillStyle = `${system.starColor}${alpha}`;
        ctx.fillRect(px - particle.size / 2, py - particle.size / 2, particle.size, particle.size);
      });
    }

    // === CENTRAL STAR (Multi-layered glow with stellar effects) ===

    // Outer corona (large, pulsing slowly)
    const coronaPulse = Math.sin(time * 1.2) * 0.25 + 0.75;
    const coronaGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, starRadius * 3 * coronaPulse
    );
    coronaGradient.addColorStop(0, `${system.starColor}88`);
    coronaGradient.addColorStop(0.3, `${system.starColor}55`);
    coronaGradient.addColorStop(0.7, `${system.starColor}22`);
    coronaGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = coronaGradient;
    ctx.beginPath();
    ctx.arc(x, y, starRadius * 3 * coronaPulse, 0, Math.PI * 2);
    ctx.fill();

    // Middle glow layer
    const middleGlow = ctx.createRadialGradient(
      x, y, 0,
      x, y, starRadius * 1.8
    );
    middleGlow.addColorStop(0, `${system.starColor}ee`);
    middleGlow.addColorStop(0.6, `${system.starColor}88`);
    middleGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = middleGlow;
    ctx.beginPath();
    ctx.arc(x, y, starRadius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Star core (bright white center transitioning to star color)
    const coreGradient = ctx.createRadialGradient(
      x - starRadius * 0.1, y - starRadius * 0.1, 0,
      x, y, starRadius
    );
    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.2, '#ffffee');
    coreGradient.addColorStop(0.5, system.starColor);
    coreGradient.addColorStop(1, system.starColor + 'dd');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, starRadius, 0, Math.PI * 2);
    ctx.fill();

    // Stellar surface details (solar flares)
    if (system.discovered) {
      const flaresCount = 16;
      for (let i = 0; i < flaresCount; i++) {
        const flareAngle = (i / flaresCount) * Math.PI * 2 + time * 0.3;
        const flarePhase = Math.sin(time * 2 + i * 0.7) * 0.5 + 0.5;
        const flareSize = 2 + flarePhase * 2;
        const flareDist = starRadius * (0.5 + flarePhase * 0.3);

        const fx = x + Math.cos(flareAngle) * flareDist;
        const fy = y + Math.sin(flareAngle) * flareDist;

        ctx.fillStyle = `#ffffff${Math.floor(flarePhase * 220).toString(16).padStart(2, '0')}`;
        ctx.fillRect(fx - flareSize / 2, fy - flareSize / 2, flareSize, flareSize);
      }

      // Prominences (solar flares extending outward)
      const prominences = 6;
      for (let i = 0; i < prominences; i++) {
        const promAngle = (i / prominences) * Math.PI * 2 + time * 0.2;
        const promPhase = Math.sin(time * 1.5 + i) * 0.5 + 0.5;

        if (promPhase > 0.6) { // Only show prominent ones
          const promLength = starRadius * (0.3 + promPhase * 0.4);
          const startR = starRadius;
          const endR = starRadius + promLength;

          ctx.strokeStyle = `${system.starColor}${Math.floor(promPhase * 180).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(promAngle) * startR, y + Math.sin(promAngle) * startR);
          ctx.lineTo(x + Math.cos(promAngle) * endR, y + Math.sin(promAngle) * endR);
          ctx.stroke();
        }
      }
    }

    // === SYSTEM INFO LABEL (Enhanced) ===

    if (system.discovered) {
      // System name with shadow
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(system.name, x, y + bubbleRadius + 30);
      ctx.fillText(system.name, x, y + bubbleRadius + 30);
      ctx.shadowBlur = 0;

      // System stats with icons
      ctx.font = '11px monospace';
      ctx.fillStyle = '#dddddd';
      const statsText = `${system.starType.class} ⭐ ${system.planetCount}P 🌍 LV${system.dangerLevel} ⚠️`;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(statsText, x, y + bubbleRadius + 48);
      ctx.fillText(statsText, x, y + bubbleRadius + 48);

      // Special markers (above system)
      const markers = [];
      if (system.hasMegastructure) markers.push({ text: '✦', color: '#00ff88', label: 'MEGA' });
      if (system.hasBlackhole) markers.push({ text: '⚫', color: '#ff00ff', label: 'BLACKHOLE' });
      if (system.hasHiveAliens) markers.push({ text: '☠', color: '#ff3333', label: 'HIVE' });

      markers.forEach((marker, i) => {
        const markerX = x - (markers.length - 1) * 25 / 2 + i * 25;
        const markerY = y - bubbleRadius - 30;

        // Marker glow
        ctx.fillStyle = `${marker.color}44`;
        ctx.beginPath();
        ctx.arc(markerX, markerY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Marker icon
        ctx.fillStyle = marker.color;
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = marker.color;
        ctx.shadowBlur = 8;
        ctx.fillText(marker.text, markerX, markerY + 6);
        ctx.shadowBlur = 0;
      });

      // Distance indicator (if not current system)
      if (!isCurrentSystem) {
        ctx.font = '9px monospace';
        ctx.fillStyle = '#888888';
        ctx.fillText('[ CLICK TO NAVIGATE ]', x, y + bubbleRadius + 65);
      }

    } else {
      // Undiscovered - mysterious appearance
      ctx.fillStyle = '#666666';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('UNKNOWN SYSTEM', x, y + bubbleRadius + 30);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#555555';
      ctx.fillText('? ? ?', x, y + bubbleRadius + 45);
    }

    // === CURRENT SYSTEM INDICATOR ===

    if (isCurrentSystem) {
      const indicatorPulse = Math.sin(time * 3) * 0.3 + 0.7;

      // Animated outer ring
      ctx.strokeStyle = `#00ffff${Math.floor(indicatorPulse * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(x, y, bubbleRadius + 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner ring
      ctx.strokeStyle = `#00ffff${Math.floor(indicatorPulse * 160).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, bubbleRadius + 60, 0, Math.PI * 2);
      ctx.stroke();

      // Direction markers (rotating)
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time * 1.5;
        const mx = x + Math.cos(angle) * (bubbleRadius + 55);
        const my = y + Math.sin(angle) * (bubbleRadius + 55);

        ctx.fillStyle = `#00ffff${Math.floor(indicatorPulse * 255).toString(16).padStart(2, '0')}`;
        ctx.fillRect(mx - 4, my - 4, 8, 8);
      }

      // "YOU ARE HERE" label
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 8;
      ctx.fillText('◄ YOU ARE HERE ►', x, y - bubbleRadius - 50);
      ctx.shadowBlur = 0;
    }
  }

  /**
   * Check if player is inside a star system bubble (for transition)
   */
  checkSystemEntry(playerX, playerY) {
    for (let i = 0; i < this.galaxy.length; i++) {
      const system = this.galaxy[i];
      const dx = playerX - system.position.x;
      const dy = playerY - system.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if player entered the bubble (radius 200 for discovered, 130 for undiscovered)
      const bubbleRadius = system.discovered ? 200 : 130;
      // Allow entering ANY system (discovered or not)
      if (distance < bubbleRadius) {
        return i; // Return system index
      }
    }
    return null; // Not inside any system
  }

  /**
   * Check if player left the current star system (for transition to interstellar)
   */
  checkSystemExit(playerX, playerY, currentSystemIndex) {
    // Get current system position in interstellar coordinates
    const system = this.galaxy[currentSystemIndex];
    if (!system) return false;

    const dx = playerX - system.position.x;
    const dy = playerY - system.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Exit threshold - must be beyond bubble + safety margin
    const exitDistance = 250; // Increased to match new bubble size

    return distance > exitDistance;
  }
}
