/**
 * Alien Ship Renderer
 * Renders alien ships with race-specific visual designs
 */

export class AlienShipRenderer {
  constructor(palette) {
    this.PALETTE = palette;
  }

  /**
   * Utility: Darken a hex color
   */
  darkenColor(hex, factor) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Darken
    const newR = Math.floor(r * factor);
    const newG = Math.floor(g * factor);
    const newB = Math.floor(b * factor);

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Utility: Lighten a hex color
   */
  lightenColor(hex, factor) {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Lighten
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Render an alien ship
   */
  renderAlienShip(ctx, ship, design, camX, camY) {
    const sx = Math.floor(ship.x - camX);
    const sy = Math.floor(ship.y - camY);

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ship.angle);

    // Damage flash
    if (ship.damageFlash > 0) {
      ctx.globalAlpha = 0.5 + ship.damageFlash * 0.5;
    }

    // Render based on race design
    switch (design.shape) {
      case 'diamond':
        this.renderZenariShip(ctx, ship, design);
        break;
      case 'angular':
        this.renderVorlanShip(ctx, ship, design);
        break;
      case 'organic':
        this.renderMycelianShip(ctx, ship, design);
        break;
      case 'asymmetric':
        this.renderKryllianShip(ctx, ship, design);
        break;
      case 'geometric':
        this.renderSyntheticShip(ctx, ship, design);
        break;
      case 'ethereal':
        this.renderVoidbornShip(ctx, ship, design);
        break;
      default:
        this.renderStandardShip(ctx, ship, design);
        break;
    }

    ctx.restore();
  }

  /**
   * Zenari - Diamond-shaped, smooth design - ENHANCED with ultra-detailed pixelated textures
   */
  renderZenariShip(ctx, ship, design) {
    const size = ship.size;
    const time = Date.now() * 0.001;

    // Shadow (layered for depth)
    ctx.fillStyle = '#00000066';
    ctx.beginPath();
    ctx.moveTo(size * 0.8, 0);
    ctx.lineTo(0, -size * 0.6);
    ctx.lineTo(-size * 0.8, 0);
    ctx.lineTo(0, size * 0.6);
    ctx.closePath();
    ctx.fill();

    // Main hull (diamond shape) - darker base
    ctx.fillStyle = this.darkenColor(ship.color, 0.6);
    ctx.beginPath();
    ctx.moveTo(size * 0.7, 0);
    ctx.lineTo(0, -size * 0.5);
    ctx.lineTo(-size * 0.7, 0);
    ctx.lineTo(0, size * 0.5);
    ctx.closePath();
    ctx.fill();

    // Layered armor plates
    ctx.fillStyle = this.darkenColor(ship.color, 0.8);
    ctx.beginPath();
    ctx.moveTo(size * 0.6, 0);
    ctx.lineTo(0, -size * 0.42);
    ctx.lineTo(-size * 0.6, 0);
    ctx.lineTo(0, size * 0.42);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = ship.color;
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.lineTo(0, -size * 0.35);
    ctx.lineTo(-size * 0.5, 0);
    ctx.lineTo(0, size * 0.35);
    ctx.closePath();
    ctx.fill();

    // Pixelated panel lines (rivet detail)
    ctx.fillStyle = this.darkenColor(ship.color, 0.4);
    for (let i = -3; i <= 3; i++) {
      for (let j = -2; j <= 2; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * 6, j * 6, 2, 2);
        }
      }
    }

    // Center stripe (multi-layered with tech details)
    ctx.fillStyle = '#4488aa';
    ctx.fillRect(-size * 0.5, -4, size, 8);
    ctx.fillStyle = '#6699cc';
    ctx.fillRect(-size * 0.5, -3, size, 6);
    ctx.fillStyle = '#88ccff';
    ctx.fillRect(-size * 0.5, -2, size, 4);

    // Tech nodes along stripe
    ctx.fillStyle = '#aaddff';
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(i * 10, -1, 3, 2);
    }

    // Wing hardpoints with pixelated detail
    ctx.fillStyle = '#556677';
    ctx.fillRect(-size * 0.35, -size * 0.35, 8, 6);
    ctx.fillRect(-size * 0.35, size * 0.29, 8, 6);

    ctx.fillStyle = '#778899';
    ctx.fillRect(-size * 0.33, -size * 0.33, 6, 4);
    ctx.fillRect(-size * 0.33, size * 0.29, 6, 4);

    // Wing highlights (animated)
    const wingPulse = Math.sin(time * 2) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(170, 221, 255, ${wingPulse})`;
    ctx.fillRect(-size * 0.32, -size * 0.32, 4, 3);
    ctx.fillRect(-size * 0.32, size * 0.3, 4, 3);

    // Cockpit (multi-layered with detail)
    ctx.fillStyle = '#003366';
    ctx.fillRect(size * 0.25, -6, 10, 12);
    ctx.fillStyle = '#004488';
    ctx.fillRect(size * 0.28, -5, 8, 10);
    ctx.fillStyle = '#0066aa';
    ctx.fillRect(size * 0.3, -4, 6, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(size * 0.32, -3, 4, 6);

    // Navigation lights (blinking)
    const navBlink = Math.floor(time * 2) % 2;
    if (navBlink) {
      ctx.fillStyle = '#ff3300';
      ctx.fillRect(size * 0.2, -size * 0.38, 2, 2);
      ctx.fillStyle = '#00ff33';
      ctx.fillRect(size * 0.2, size * 0.36, 2, 2);
    }

    // Engine nacelles (detailed)
    ctx.fillStyle = '#334455';
    ctx.fillRect(-size * 0.72, -6, 10, 5);
    ctx.fillRect(-size * 0.72, 1, 10, 5);

    ctx.fillStyle = '#445566';
    ctx.fillRect(-size * 0.7, -5, 8, 4);
    ctx.fillRect(-size * 0.7, 2, 8, 4);

    // Engine glow (pulsing, multi-layered)
    const enginePulse = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(100, 150, 255, ${enginePulse})`;
    ctx.fillRect(-size * 0.75, -5, 12, 4);
    ctx.fillRect(-size * 0.75, 1, 12, 4);

    ctx.fillStyle = `rgba(136, 187, 255, ${enginePulse * 0.9})`;
    ctx.fillRect(-size * 0.73, -4, 10, 3);
    ctx.fillRect(-size * 0.73, 2, 10, 3);

    ctx.fillStyle = `rgba(255, 255, 255, ${enginePulse * 0.7})`;
    ctx.fillRect(-size * 0.71, -3, 6, 2);
    ctx.fillRect(-size * 0.71, 2, 6, 2);

    // Exhaust particles
    for (let i = 0; i < 3; i++) {
      const particleX = -size * 0.8 - i * 8 - (time * 100) % 24;
      const particleAlpha = Math.max(0, 1 - i * 0.3 - ((time * 100) % 24) / 24);
      ctx.fillStyle = `rgba(136, 187, 255, ${particleAlpha * enginePulse * 0.6})`;
      ctx.fillRect(particleX, -3, 4, 2);
      ctx.fillRect(particleX, 1, 4, 2);
    }

    // Sensor array (animated)
    const sensorPulse = Math.sin(time * 4) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 200, 0, ${sensorPulse})`;
    ctx.fillRect(size * 0.55, -2, 3, 4);

    // Status indicator lights
    ctx.fillStyle = Math.sin(time * 3) > 0 ? '#00ff00' : '#003300';
    ctx.fillRect(-size * 0.25, -size * 0.25, 2, 2);
    ctx.fillRect(-size * 0.25, size * 0.23, 2, 2);
  }

  /**
   * Vorlan - Angular, militaristic design - ENHANCED with heavy armor details
   */
  renderVorlanShip(ctx, ship, design) {
    const size = ship.size;
    const time = Date.now() * 0.001;

    // Shadow (angular, military profile)
    ctx.fillStyle = '#00000066';
    ctx.fillRect(-size * 0.9, -size * 0.45, size * 1.6, size * 0.9);

    // Main hull base (dark military gray)
    ctx.fillStyle = this.darkenColor(ship.color, 0.5);
    ctx.beginPath();
    ctx.moveTo(size * 0.6, 0);
    ctx.lineTo(size * 0.3, -size * 0.4);
    ctx.lineTo(-size * 0.7, -size * 0.4);
    ctx.lineTo(-size * 0.9, 0);
    ctx.lineTo(-size * 0.7, size * 0.4);
    ctx.lineTo(size * 0.3, size * 0.4);
    ctx.closePath();
    ctx.fill();

    // Layered armor plating (multiple layers for depth)
    ctx.fillStyle = this.darkenColor(ship.color, 0.7);
    ctx.beginPath();
    ctx.moveTo(size * 0.55, 0);
    ctx.lineTo(size * 0.28, -size * 0.35);
    ctx.lineTo(-size * 0.65, -size * 0.35);
    ctx.lineTo(-size * 0.85, 0);
    ctx.lineTo(-size * 0.65, size * 0.35);
    ctx.lineTo(size * 0.28, size * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = ship.color;
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.lineTo(size * 0.25, -size * 0.3);
    ctx.lineTo(-size * 0.6, -size * 0.3);
    ctx.lineTo(-size * 0.8, 0);
    ctx.lineTo(-size * 0.6, size * 0.3);
    ctx.lineTo(size * 0.25, size * 0.3);
    ctx.closePath();
    ctx.fill();

    // Heavy armor plates with rivets
    ctx.fillStyle = '#992222';
    for (let i = 0; i < 4; i++) {
      const offset = -size * 0.7 + i * (size * 0.35);
      ctx.fillRect(offset, -size * 0.38, 6, size * 0.76);
    }

    ctx.fillStyle = '#aa4444';
    for (let i = 0; i < 4; i++) {
      const offset = -size * 0.68 + i * (size * 0.35);
      ctx.fillRect(offset, -size * 0.35, 4, size * 0.7);
    }

    // Pixelated rivets on armor
    ctx.fillStyle = '#661111';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 5; j++) {
        const x = -size * 0.67 + i * (size * 0.35);
        const y = -size * 0.3 + j * (size * 0.15);
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Weapon hardpoints (detailed mounts)
    ctx.fillStyle = '#334455';
    ctx.fillRect(size * 0.35, -size * 0.52, 10, 8);
    ctx.fillRect(size * 0.35, size * 0.44, 10, 8);

    ctx.fillStyle = '#556677';
    ctx.fillRect(size * 0.37, -size * 0.5, 8, 6);
    ctx.fillRect(size * 0.37, size * 0.44, 8, 6);

    // Weapon barrels (cannons)
    ctx.fillStyle = '#778899';
    ctx.fillRect(size * 0.45, -size * 0.49, 6, 5);
    ctx.fillRect(size * 0.45, size * 0.44, 6, 5);

    // Weapon muzzles (glowing)
    const weaponPulse = Math.sin(time * 2.5) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(255, 170, 0, ${weaponPulse})`;
    ctx.fillRect(size * 0.5, -size * 0.48, 4, 4);
    ctx.fillRect(size * 0.5, size * 0.44, 4, 4);

    // Targeting lasers
    ctx.fillStyle = `rgba(255, 0, 0, ${weaponPulse * 0.5})`;
    ctx.fillRect(size * 0.48, -size * 0.46, 2, 2);
    ctx.fillRect(size * 0.48, size * 0.46, 2, 2);

    // Cockpit (armored, multi-layer)
    ctx.fillStyle = '#440000';
    ctx.fillRect(size * 0.15, -6, 12, 12);
    ctx.fillStyle = '#660000';
    ctx.fillRect(size * 0.18, -5, 10, 10);
    ctx.fillStyle = '#880000';
    ctx.fillRect(size * 0.2, -4, 8, 8);
    ctx.fillStyle = '#ff8888';
    ctx.fillRect(size * 0.22, -3, 6, 6);

    // Cockpit glass reflection
    ctx.fillStyle = '#ffaaaa';
    ctx.fillRect(size * 0.23, -2, 3, 2);

    // Wing struts with detail
    ctx.fillStyle = '#445566';
    ctx.fillRect(-size * 0.4, -size * 0.42, size * 0.25, 4);
    ctx.fillRect(-size * 0.4, size * 0.38, size * 0.25, 4);

    // Hull vents (heat dissipation)
    ctx.fillStyle = '#220000';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-size * 0.5 + i * 8, -size * 0.2, 4, 2);
      ctx.fillRect(-size * 0.5 + i * 8, size * 0.18, 4, 2);
    }

    // Status lights (blinking sequence)
    const statusBlink = Math.floor(time * 3) % 3;
    ctx.fillStyle = statusBlink === 0 ? '#ff0000' : '#330000';
    ctx.fillRect(-size * 0.5, -size * 0.38, 2, 2);
    ctx.fillStyle = statusBlink === 1 ? '#ffaa00' : '#332200';
    ctx.fillRect(-size * 0.4, -size * 0.38, 2, 2);
    ctx.fillStyle = statusBlink === 2 ? '#00ff00' : '#003300';
    ctx.fillRect(-size * 0.3, -size * 0.38, 2, 2);

    // Triple engine nacelles (heavy power)
    ctx.fillStyle = '#222233';
    ctx.fillRect(-size * 0.95, -8, 12, 7);
    ctx.fillRect(-size * 0.95, 1, 12, 7);

    ctx.fillStyle = '#334455';
    ctx.fillRect(-size * 0.93, -7, 10, 6);
    ctx.fillRect(-size * 0.93, 2, 10, 6);

    // Main engine glow (red/orange military thruster)
    const enginePulse = Math.sin(time * 3.5) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 60, 0, ${enginePulse})`;
    ctx.fillRect(-size * 0.98, -7, 14, 5);
    ctx.fillRect(-size * 0.98, 2, 14, 5);

    ctx.fillStyle = `rgba(255, 102, 102, ${enginePulse * 0.9})`;
    ctx.fillRect(-size * 0.96, -6, 12, 4);
    ctx.fillRect(-size * 0.96, 3, 12, 4);

    ctx.fillStyle = `rgba(255, 170, 100, ${enginePulse * 0.8})`;
    ctx.fillRect(-size * 0.94, -5, 10, 3);
    ctx.fillRect(-size * 0.94, 3, 10, 3);

    // Secondary thrusters (top and bottom)
    ctx.fillStyle = `rgba(255, 136, 136, ${enginePulse * 0.7})`;
    ctx.fillRect(-size * 0.96, -12, 8, 4);
    ctx.fillRect(-size * 0.96, 8, 8, 4);

    // Exhaust trails
    for (let i = 0; i < 4; i++) {
      const trailX = -size * 1.05 - i * 6 - (time * 120) % 24;
      const trailAlpha = Math.max(0, 1 - i * 0.25 - ((time * 120) % 24) / 24);
      ctx.fillStyle = `rgba(255, 100, 50, ${trailAlpha * enginePulse * 0.5})`;
      ctx.fillRect(trailX, -5, 5, 3);
      ctx.fillRect(trailX, 2, 5, 3);
    }

    // Radar/sensor dish (rotating)
    const radarAngle = time * 2;
    ctx.save();
    ctx.translate(-size * 0.2, 0);
    ctx.rotate(radarAngle);
    ctx.fillStyle = '#556677';
    ctx.fillRect(-3, -6, 6, 12);
    ctx.fillStyle = '#778899';
    ctx.fillRect(-2, -5, 4, 10);
    ctx.restore();
  }

  /**
   * Mycelian - Organic, bio-ship design - ENHANCED with bio-luminescent details
   */
  renderMycelianShip(ctx, ship, design) {
    const size = ship.size;
    const time = Date.now() * 0.001;
    const breathe = Math.sin(time * 1.5) * 0.08 + 1;

    // Shadow (organic blob, breathing)
    ctx.fillStyle = '#00000055';
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = size * 0.65 * breathe * (0.75 + Math.sin(i * 0.7 + time * 0.5) * 0.25);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Main organic hull (layered chitin/flesh)
    ctx.fillStyle = this.darkenColor(ship.color, 0.6);
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = size * 0.55 * breathe * (0.75 + Math.sin(i * 0.7 + time * 0.5) * 0.25);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = ship.color;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = size * 0.48 * breathe * (0.75 + Math.sin(i * 0.7 + time * 0.5) * 0.25);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Organic membrane texture
    ctx.fillStyle = this.lightenColor(ship.color, 0.3);
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = size * 0.4 * breathe * (0.75 + Math.sin(i * 0.7 + time * 0.5) * 0.25);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Bio-veins (pulsing network)
    ctx.strokeStyle = `rgba(102, 255, 170, ${breathe * 0.5})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size * 0.4, Math.sin(angle) * size * 0.4);
      ctx.stroke();
    }

    // Spore sacs (bio-patterns, pulsing)
    const sporePulse = Math.sin(time * 2.5) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(102, 255, 170, ${sporePulse})`;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.3;
      const x = Math.cos(angle) * size * 0.32;
      const y = Math.sin(angle) * size * 0.32;
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }

    ctx.fillStyle = `rgba(170, 255, 200, ${sporePulse * 0.8})`;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.3;
      const x = Math.cos(angle) * size * 0.32;
      const y = Math.sin(angle) * size * 0.32;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    // Organic eyes/sensors (blinking)
    const eyeBlink = Math.sin(time * 1.2) > 0.8 ? 0.3 : 1.0;
    ctx.fillStyle = `rgba(255, 200, 100, ${eyeBlink})`;
    ctx.fillRect(-size * 0.15, -3, 5, 6);
    ctx.fillRect(size * 0.1, -3, 5, 6);

    // Glowing bio-luminescent core (multi-layer)
    const pulse = Math.sin(time * 2) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(50, 200, 150, ${pulse * 0.6})`;
    ctx.fillRect(-10, -10, 20, 20);

    ctx.fillStyle = `rgba(102, 255, 170, ${pulse * 0.8})`;
    ctx.fillRect(-8, -8, 16, 16);

    ctx.fillStyle = `rgba(136, 255, 204, ${pulse})`;
    ctx.fillRect(-6, -6, 12, 12);

    ctx.fillStyle = `rgba(200, 255, 230, ${pulse * 0.9})`;
    ctx.fillRect(-4, -4, 8, 8);

    ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.7})`;
    ctx.fillRect(-2, -2, 4, 4);

    // Bio-thruster tendrils (organic propulsion)
    for (let i = 0; i < 3; i++) {
      const angle = Math.PI + i * 0.4 - 0.4;
      const length = size * 0.4 + Math.sin(time * 3 + i) * 5;
      const x = Math.cos(angle) * length;
      const y = Math.sin(angle) * length;

      ctx.strokeStyle = `rgba(102, 255, 170, ${sporePulse * 0.6})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Tendril tip glow
      ctx.fillStyle = `rgba(170, 255, 200, ${sporePulse})`;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    // Pixelated chitin texture
    ctx.fillStyle = this.darkenColor(ship.color, 0.4);
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.random() > 0.7) {
          ctx.fillRect(i * 6, j * 6, 2, 2);
        }
      }
    }
  }

  /**
   * Kryllian - Asymmetric, scrap design - ENHANCED with junker details
   */
  renderKryllianShip(ctx, ship, design) {
    const size = ship.size;
    const time = Date.now() * 0.001;

    // Shadow (asymmetric, junky profile)
    ctx.fillStyle = '#00000066';
    ctx.fillRect(-size * 0.7, -size * 0.5, size * 1.3, size);

    // Main hull base (dark scrap metal)
    ctx.fillStyle = this.darkenColor(ship.color, 0.5);
    ctx.fillRect(-size * 0.6, -size * 0.4, size * 1.05, size * 0.8);

    // Hull layers (mismatched panels)
    ctx.fillStyle = this.darkenColor(ship.color, 0.7);
    ctx.fillRect(-size * 0.55, -size * 0.38, size * 0.45, size * 0.76);

    ctx.fillStyle = ship.color;
    ctx.fillRect(-size * 0.5, -size * 0.35, size * 0.8, size * 0.7);

    // Random scrap plating (mismatched colors)
    const scrapColors = ['#aa5533', '#886644', '#664433', '#995533', '#aa6633'];
    scrapColors.forEach((color, i) => {
      ctx.fillStyle = color;
      const xOffset = -size * 0.45 + i * (size * 0.18);
      const yOffset = -size * 0.35 + (i % 2) * (size * 0.15);
      const width = size * 0.15 + (i % 3) * 5;
      const height = size * 0.2 + (i % 2) * 8;
      ctx.fillRect(xOffset, yOffset, width, height);
    });

    // Pixelated welds and patches
    ctx.fillStyle = '#663322';
    for (let i = 0; i < 8; i++) {
      const x = -size * 0.4 + i * 8;
      const y = -size * 0.25 + (i % 3) * 10;
      ctx.fillRect(x, y, 3, 2);
      ctx.fillRect(x + 1, y + 3, 2, 3);
    }

    // Mismatched wings (asymmetric)
    ctx.fillStyle = '#774422';
    ctx.fillRect(-size * 0.52, -size * 0.52, size * 0.42, 8); // Top wing (longer)
    ctx.fillStyle = '#665533';
    ctx.fillRect(-size * 0.48, -size * 0.5, size * 0.38, 6);

    ctx.fillStyle = '#885533';
    ctx.fillRect(-size * 0.32, size * 0.44, size * 0.22, 6); // Bottom wing (shorter)
    ctx.fillStyle = '#776644';
    ctx.fillRect(-size * 0.3, size * 0.46, size * 0.18, 4);

    // Wing struts (crude construction)
    ctx.fillStyle = '#443322';
    ctx.fillRect(-size * 0.45, -size * 0.44, 2, 8);
    ctx.fillRect(-size * 0.35, -size * 0.44, 2, 8);
    ctx.fillRect(-size * 0.28, size * 0.42, 2, 6);

    // Exposed wiring/pipes (complex network)
    ctx.strokeStyle = '#ffaa44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.45, -size * 0.25);
    ctx.lineTo(-size * 0.15, -size * 0.1);
    ctx.lineTo(size * 0.1, 0);
    ctx.lineTo(-size * 0.2, size * 0.15);
    ctx.lineTo(-size * 0.35, size * 0.25);
    ctx.stroke();

    // Exposed conduits
    ctx.strokeStyle = '#cc8833';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-size * 0.25, -size * 0.3);
    ctx.lineTo(size * 0.05, -size * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, size * 0.2);
    ctx.lineTo(0, size * 0.05);
    ctx.stroke();

    // Wiring junction boxes
    ctx.fillStyle = '#554433';
    ctx.fillRect(-size * 0.15, -size * 0.1, 6, 6);
    ctx.fillRect(-size * 0.2, size * 0.15, 5, 5);

    // Sparking wires (animation)
    if (Math.sin(time * 8) > 0.85) {
      const sparkX = -size * 0.15 + Math.random() * 10;
      const sparkY = -size * 0.1 + Math.random() * 10;
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(sparkX, sparkY, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sparkX + 1, sparkY, 1, 1);
    }

    // Crude weapon pod (asymmetric mount)
    ctx.fillStyle = '#773322';
    ctx.fillRect(size * 0.28, -12, 10, 24);
    ctx.fillStyle = '#994433';
    ctx.fillRect(size * 0.3, -10, 8, 20);
    ctx.fillStyle = '#dd6644';
    ctx.fillRect(size * 0.32, -8, 6, 16);

    // Weapon barrel (crude)
    ctx.fillStyle = '#554433';
    ctx.fillRect(size * 0.38, -5, 8, 10);

    // Makeshift cockpit (small, armored)
    ctx.fillStyle = '#442200';
    ctx.fillRect(size * 0.1, -6, 10, 12);
    ctx.fillStyle = '#885533';
    ctx.fillRect(size * 0.12, -5, 8, 10);
    ctx.fillStyle = '#aa6633';
    ctx.fillRect(size * 0.14, -4, 6, 8);

    // Dirty cockpit window
    ctx.fillStyle = '#664422';
    ctx.fillRect(size * 0.15, -3, 4, 6);

    // Smoking/malfunctioning engine
    const engineFlicker = Math.sin(time * 6) * 0.3 + 0.7;
    ctx.fillStyle = '#332211';
    ctx.fillRect(-size * 0.62, -8, 12, 16);
    ctx.fillStyle = '#553322';
    ctx.fillRect(-size * 0.6, -7, 10, 14);

    // Uneven engine glow (sputtering)
    const enginePulse = Math.sin(time * 4 + Math.sin(time * 12) * 0.5) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(255, 100, 0, ${enginePulse * engineFlicker})`;
    ctx.fillRect(-size * 0.65, -7, 14, 14);

    ctx.fillStyle = `rgba(255, 150, 50, ${enginePulse * engineFlicker * 0.8})`;
    ctx.fillRect(-size * 0.63, -6, 12, 12);

    // Engine smoke particles (asymmetric, dirty)
    for (let i = 0; i < 4; i++) {
      const smokeX = -size * 0.7 - i * 6 - (time * 80) % 30;
      const smokeY = -5 + (i % 2) * 10 + Math.sin(time * 3 + i) * 4;
      const smokeAlpha = Math.max(0, 1 - i * 0.2 - ((time * 80) % 30) / 30);
      ctx.fillStyle = `rgba(100, 80, 60, ${smokeAlpha * 0.4})`;
      ctx.fillRect(smokeX, smokeY, 4, 4);
    }

    // Oil leaks (dripping)
    const leakPhase = (time * 2) % 1;
    if (leakPhase < 0.5) {
      ctx.fillStyle = `rgba(40, 30, 20, ${(0.5 - leakPhase) * 2})`;
      ctx.fillRect(-size * 0.3, size * 0.38 + leakPhase * 10, 2, 3);
      ctx.fillRect(size * 0.15, -size * 0.35 + leakPhase * 8, 2, 3);
    }

    // Rust spots (pixelated)
    ctx.fillStyle = '#5a2a0a';
    ctx.fillRect(-size * 0.35, -size * 0.22, 3, 3);
    ctx.fillRect(size * 0.05, size * 0.15, 3, 3);
    ctx.fillRect(-size * 0.48, size * 0.05, 2, 2);
    ctx.fillRect(size * 0.22, -size * 0.18, 2, 2);

    // Warning labels (faded, peeling)
    ctx.fillStyle = '#665500';
    ctx.fillRect(-size * 0.2, size * 0.25, 18, 10);
    ctx.strokeStyle = '#aa8800';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(-size * 0.2, size * 0.25, 18, 10);
    ctx.setLineDash([]);

    // Status lights (malfunctioning, random blinking)
    const statusRandom = Math.random();
    if (statusRandom > 0.5) {
      ctx.fillStyle = statusRandom > 0.75 ? '#ff0000' : '#ffaa00';
      ctx.fillRect(-size * 0.45, -size * 0.38, 2, 2);
    }
    if (statusRandom > 0.3) {
      ctx.fillStyle = statusRandom > 0.65 ? '#00ff00' : '#003300';
      ctx.fillRect(size * 0.25, -size * 0.05, 2, 2);
    }

    // Antenna (crooked)
    ctx.strokeStyle = '#665544';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.38);
    ctx.lineTo(-size * 0.08, -size * 0.52);
    ctx.lineTo(-size * 0.05, -size * 0.55);
    ctx.stroke();

    // Antenna light (sometimes works)
    if (Math.floor(time * 1.5) % 3 === 0) {
      ctx.fillStyle = '#ff3300';
      ctx.fillRect(-size * 0.06, -size * 0.56, 2, 2);
    }
  }

  /**
   * Synthetic - Geometric, circuit design - ENHANCED with AI tech details
   */
  renderSyntheticShip(ctx, ship, design) {
    const size = ship.size;
    const time = Date.now() * 0.001;

    // Shadow (perfect geometric)
    ctx.fillStyle = '#00000066';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * size * 0.65;
      const y = Math.sin(angle) * size * 0.65;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Main hull base (dark metallic)
    ctx.fillStyle = this.darkenColor(ship.color, 0.5);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * size * 0.55;
      const y = Math.sin(angle) * size * 0.55;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Hull layer 2
    ctx.fillStyle = this.darkenColor(ship.color, 0.7);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * size * 0.48;
      const y = Math.sin(angle) * size * 0.48;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Main hull (perfect hexagon)
    ctx.fillStyle = ship.color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * size * 0.42;
      const y = Math.sin(angle) * size * 0.42;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Circuit board traces (animated flow)
    const flowPhase = time * 2;
    ctx.strokeStyle = '#9933cc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-size * 0.35, 0);
    ctx.lineTo(0, -size * 0.35);
    ctx.lineTo(size * 0.35, 0);
    ctx.lineTo(0, size * 0.35);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#bb44ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, 0);
    ctx.lineTo(0, -size * 0.3);
    ctx.lineTo(size * 0.3, 0);
    ctx.lineTo(0, size * 0.3);
    ctx.closePath();
    ctx.stroke();

    // Circuit traces (radial lines)
    ctx.strokeStyle = '#aa33dd';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * size * 0.15, Math.sin(angle) * size * 0.15);
      ctx.lineTo(Math.cos(angle) * size * 0.42, Math.sin(angle) * size * 0.42);
      ctx.stroke();
    }

    // Data flow particles (animated along circuits)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const flowProgress = ((flowPhase + i * 0.3) % 2) / 2;
      const flowRadius = size * 0.15 + flowProgress * size * 0.27;
      const flowX = Math.cos(angle) * flowRadius;
      const flowY = Math.sin(angle) * flowRadius;
      const flowAlpha = Math.sin(flowProgress * Math.PI) * 0.8;

      ctx.fillStyle = `rgba(221, 136, 255, ${flowAlpha})`;
      ctx.fillRect(flowX - 2, flowY - 2, 4, 4);
      ctx.fillStyle = `rgba(255, 200, 255, ${flowAlpha * 0.8})`;
      ctx.fillRect(flowX - 1, flowY - 1, 2, 2);
    }

    // Processing nodes (hexagonal vertices)
    ctx.fillStyle = '#7733aa';
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * size * 0.42;
      const y = Math.sin(angle) * size * 0.42;
      ctx.fillRect(x - 4, y - 4, 8, 8);
    }

    ctx.fillStyle = '#9944cc';
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * size * 0.42;
      const y = Math.sin(angle) * size * 0.42;
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }

    // Node lights (pulsing)
    const nodePulse = Math.sin(time * 3) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(221, 136, 255, ${nodePulse})`;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * size * 0.42;
      const y = Math.sin(angle) * size * 0.42;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    // Inner circuit diamond
    ctx.strokeStyle = '#dd88ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, 0);
    ctx.lineTo(0, -size * 0.2);
    ctx.lineTo(size * 0.2, 0);
    ctx.lineTo(0, size * 0.2);
    ctx.closePath();
    ctx.stroke();

    // Circuit junction nodes
    ctx.fillStyle = '#bb66ee';
    ctx.fillRect(-size * 0.2 - 2, -2, 4, 4);
    ctx.fillRect(-2, -size * 0.2 - 2, 4, 4);
    ctx.fillRect(size * 0.2 - 2, -2, 4, 4);
    ctx.fillRect(-2, size * 0.2 - 2, 4, 4);

    // Pixelated circuit board texture
    ctx.fillStyle = '#663399';
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if ((i + j) % 2 === 0 && Math.abs(i) + Math.abs(j) < 4) {
          ctx.fillRect(i * 5, j * 5, 2, 2);
        }
      }
    }

    // Holographic display panels (rotating)
    const panelRotation = time * 1.5;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + panelRotation;
      const panelX = Math.cos(angle) * size * 0.25;
      const panelY = Math.sin(angle) * size * 0.25;

      ctx.save();
      ctx.translate(panelX, panelY);
      ctx.rotate(angle + Math.PI / 2);

      const panelAlpha = Math.sin(time * 2 + i) * 0.3 + 0.5;
      ctx.fillStyle = `rgba(170, 68, 255, ${panelAlpha})`;
      ctx.fillRect(-6, -2, 12, 4);
      ctx.fillStyle = `rgba(221, 136, 255, ${panelAlpha * 0.8})`;
      ctx.fillRect(-5, -1, 10, 2);

      ctx.restore();
    }

    // Glowing AI core (multi-layer, pulsing)
    const pulse = Math.sin(time * 2.5) * 0.4 + 0.6;

    ctx.fillStyle = `rgba(136, 0, 204, ${pulse * 0.6})`;
    ctx.fillRect(-10, -10, 20, 20);

    ctx.fillStyle = `rgba(187, 68, 255, ${pulse * 0.8})`;
    ctx.fillRect(-8, -8, 16, 16);

    ctx.fillStyle = `rgba(221, 136, 255, ${pulse})`;
    ctx.fillRect(-6, -6, 12, 12);

    ctx.fillStyle = `rgba(238, 170, 255, ${pulse * 0.9})`;
    ctx.fillRect(-4, -4, 8, 8);

    ctx.fillStyle = `rgba(255, 0, 255, ${pulse * 0.85})`;
    ctx.fillRect(-3, -3, 6, 6);

    ctx.fillStyle = `rgba(255, 200, 255, ${pulse * 0.7})`;
    ctx.fillRect(-2, -2, 4, 4);

    ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.6})`;
    ctx.fillRect(-1, -1, 2, 2);

    // Energy shields (hexagonal barrier)
    const shieldPulse = Math.sin(time * 1.8) * 0.2 + 0.3;
    ctx.strokeStyle = `rgba(187, 68, 255, ${shieldPulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * size * 0.52;
      const y = Math.sin(angle) * size * 0.52;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Quantum thrusters (geometric exhausts)
    for (let i = 0; i < 3; i++) {
      const thrustAngle = Math.PI + (i - 1) * 0.4;
      const thrustX = Math.cos(thrustAngle) * size * 0.4;
      const thrustY = Math.sin(thrustAngle) * size * 0.4;

      const thrustPulse = Math.sin(time * 4 + i * 0.5) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(187, 68, 255, ${thrustPulse})`;
      ctx.fillRect(thrustX - 3, thrustY - 3, 6, 6);
      ctx.fillStyle = `rgba(221, 136, 255, ${thrustPulse * 0.9})`;
      ctx.fillRect(thrustX - 2, thrustY - 2, 4, 4);
      ctx.fillStyle = `rgba(255, 200, 255, ${thrustPulse * 0.7})`;
      ctx.fillRect(thrustX - 1, thrustY - 1, 2, 2);

      // Thruster particles
      for (let p = 0; p < 3; p++) {
        const particleX = thrustX + Math.cos(thrustAngle) * (8 + p * 6 + (time * 100) % 18);
        const particleY = thrustY + Math.sin(thrustAngle) * (8 + p * 6 + (time * 100) % 18);
        const particleAlpha = Math.max(0, 1 - p * 0.3 - ((time * 100) % 18) / 18) * thrustPulse;
        ctx.fillStyle = `rgba(187, 68, 255, ${particleAlpha * 0.5})`;
        ctx.fillRect(particleX - 2, particleY - 2, 4, 4);
      }
    }

    // Scan lines (data processing)
    const scanPhase = (time * 3) % 1;
    const scanY = -size * 0.42 + scanPhase * size * 0.84;
    ctx.strokeStyle = `rgba(221, 136, 255, ${(1 - scanPhase) * 0.4})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.42, scanY);
    ctx.lineTo(size * 0.42, scanY);
    ctx.stroke();
  }

  /**
   * Voidborn - Ethereal, dark energy design - ENHANCED with void matter effects
   */
  renderVoidbornShip(ctx, ship, design) {
    const size = ship.size;
    const time = Date.now() * 0.001;

    // Void distortion aura (rippling dark energy)
    for (let layer = 0; layer < 3; layer++) {
      const auraSize = size * (0.9 + layer * 0.15) + Math.sin(time * (1.5 + layer * 0.5)) * (6 + layer * 2);
      const auraAlpha = (0.25 - layer * 0.07) * (0.7 + Math.sin(time * 2 + layer) * 0.3);
      ctx.fillStyle = `rgba(34, 0, 51, ${auraAlpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shadow tendrils (reaching outward)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.3;
      const length = size * 0.6 + Math.sin(time * 2 + i * 0.5) * 10;
      const x = Math.cos(angle) * length;
      const y = Math.sin(angle) * length;

      const gradient = ctx.createRadialGradient(0, 0, 0, x, y, size * 0.3);
      gradient.addColorStop(0, 'rgba(51, 0, 68, 0.5)');
      gradient.addColorStop(1, 'rgba(34, 0, 51, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x + Math.sin(time * 3 + i) * 5, y + Math.cos(time * 3 + i) * 5);
      ctx.lineTo(x * 0.9, y * 0.9);
      ctx.closePath();
      ctx.fill();
    }

    // Shadow form (deeper layer)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.moveTo(size * 0.65, 0);
    ctx.lineTo(size * 0.1, -size * 0.75);
    ctx.lineTo(-size * 0.85, 0);
    ctx.lineTo(size * 0.1, size * 0.75);
    ctx.closePath();
    ctx.fill();

    // Main hull (dark ethereal substance)
    ctx.fillStyle = this.darkenColor(ship.color, 0.3);
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(size * 0.6, 0);
    ctx.lineTo(size * 0.05, -size * 0.68);
    ctx.lineTo(-size * 0.78, 0);
    ctx.lineTo(size * 0.05, size * 0.68);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = ship.color;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.moveTo(size * 0.55, 0);
    ctx.lineTo(0, -size * 0.62);
    ctx.lineTo(-size * 0.72, 0);
    ctx.lineTo(0, size * 0.62);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.lightenColor(ship.color, 0.2);
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(size * 0.5, 0);
    ctx.lineTo(0, -size * 0.55);
    ctx.lineTo(-size * 0.65, 0);
    ctx.lineTo(0, size * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Void energy veins (complex network)
    const veinPulse = Math.sin(time * 1.5) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(102, 0, 153, ${veinPulse * 0.8})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-size * 0.6, 0);
    ctx.lineTo(-size * 0.3, -size * 0.2);
    ctx.lineTo(0, -size * 0.35);
    ctx.lineTo(size * 0.2, -size * 0.25);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size * 0.6, 0);
    ctx.lineTo(-size * 0.3, size * 0.2);
    ctx.lineTo(0, size * 0.35);
    ctx.lineTo(size * 0.2, size * 0.25);
    ctx.stroke();

    ctx.strokeStyle = `rgba(136, 0, 204, ${veinPulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.55, 0);
    ctx.lineTo(-size * 0.28, -size * 0.18);
    ctx.lineTo(0, -size * 0.32);
    ctx.lineTo(size * 0.18, -size * 0.23);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size * 0.55, 0);
    ctx.lineTo(-size * 0.28, size * 0.18);
    ctx.lineTo(0, size * 0.32);
    ctx.lineTo(size * 0.18, size * 0.23);
    ctx.stroke();

    // Vein junction nodes (pulsing)
    const nodePositions = [
      [-size * 0.3, -size * 0.2],
      [0, -size * 0.35],
      [size * 0.2, -size * 0.25],
      [-size * 0.3, size * 0.2],
      [0, size * 0.35],
      [size * 0.2, size * 0.25]
    ];

    nodePositions.forEach(([x, y], i) => {
      const nodePulse = Math.sin(time * 2 + i * 0.5) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(102, 0, 153, ${nodePulse * 0.7})`;
      ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.fillStyle = `rgba(170, 0, 255, ${nodePulse})`;
      ctx.fillRect(x - 3, y - 3, 6, 6);
      ctx.fillStyle = `rgba(204, 102, 255, ${nodePulse * 0.8})`;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    });

    // Void matter crystals (forming and dissolving)
    for (let i = 0; i < 6; i++) {
      const crystalPhase = (time + i * 0.4) % 2;
      if (crystalPhase < 1.2) {
        const angle = (i / 6) * Math.PI * 2;
        const distance = size * 0.35 + Math.sin(time * 1.5 + i) * 8;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const crystalAlpha = Math.sin(crystalPhase * Math.PI / 1.2) * 0.6;

        ctx.fillStyle = `rgba(68, 0, 102, ${crystalAlpha})`;
        ctx.fillRect(x - 4, y - 4, 8, 8);
        ctx.fillStyle = `rgba(136, 0, 204, ${crystalAlpha * 0.8})`;
        ctx.fillRect(x - 3, y - 3, 6, 6);
        ctx.fillStyle = `rgba(170, 0, 255, ${crystalAlpha * 0.6})`;
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }

    // Dark energy core (multi-layer abyss)
    const corePulse = Math.sin(time * 1.8) * 0.4 + 0.6;

    // Outer dark matter ring
    ctx.strokeStyle = `rgba(68, 0, 102, ${corePulse * 0.5})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(34, 0, 51, ${corePulse * 0.7})`;
    ctx.fillRect(-14, -14, 28, 28);

    ctx.fillStyle = `rgba(68, 0, 102, ${corePulse * 0.8})`;
    ctx.fillRect(-12, -12, 24, 24);

    ctx.fillStyle = `rgba(102, 0, 153, ${corePulse})`;
    ctx.fillRect(-10, -10, 20, 20);

    ctx.fillStyle = `rgba(136, 0, 204, ${corePulse * 0.95})`;
    ctx.fillRect(-8, -8, 16, 16);

    ctx.fillStyle = `rgba(170, 0, 255, ${corePulse * 0.9})`;
    ctx.fillRect(-6, -6, 12, 12);

    ctx.fillStyle = `rgba(204, 102, 255, ${corePulse * 0.8})`;
    ctx.fillRect(-4, -4, 8, 8);

    ctx.fillStyle = `rgba(238, 170, 255, ${corePulse * 0.7})`;
    ctx.fillRect(-3, -3, 6, 6);

    // Core singularity (black center)
    ctx.fillStyle = `rgba(0, 0, 0, ${corePulse * 0.9})`;
    ctx.fillRect(-2, -2, 4, 4);

    // Void particles (orbiting)
    for (let i = 0; i < 12; i++) {
      const orbitAngle = time * 1.2 + (i / 12) * Math.PI * 2;
      const orbitRadius = size * 0.42 + Math.sin(time * 2 + i * 0.3) * 8;
      const x = Math.cos(orbitAngle) * orbitRadius;
      const y = Math.sin(orbitAngle) * orbitRadius;
      const particlePulse = Math.sin(time * 3 + i * 0.5) * 0.4 + 0.6;

      ctx.fillStyle = `rgba(68, 0, 102, ${particlePulse * 0.6})`;
      ctx.fillRect(x - 3, y - 3, 6, 6);
      ctx.fillStyle = `rgba(136, 0, 204, ${particlePulse * 0.8})`;
      ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.fillStyle = `rgba(170, 0, 255, ${particlePulse})`;
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }

    // Void tears (spatial rifts)
    for (let i = 0; i < 3; i++) {
      const tearPhase = (time * 0.8 + i * 0.7) % 3;
      if (tearPhase < 1.5) {
        const angle = (i / 3) * Math.PI * 2 + time * 0.5;
        const x = Math.cos(angle) * size * 0.5;
        const y = Math.sin(angle) * size * 0.5;
        const tearAlpha = Math.sin((tearPhase / 1.5) * Math.PI) * 0.5;

        ctx.strokeStyle = `rgba(170, 0, 255, ${tearAlpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 3);
        ctx.lineTo(x + 8, y + 3);
        ctx.stroke();

        ctx.strokeStyle = `rgba(204, 102, 255, ${tearAlpha * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 2);
        ctx.lineTo(x + 6, y + 2);
        ctx.stroke();
      }
    }

    // Void engines (dark matter propulsion)
    for (let i = 0; i < 2; i++) {
      const engineY = (i - 0.5) * size * 0.6;
      const enginePulse = Math.sin(time * 3 + i * Math.PI) * 0.3 + 0.7;

      ctx.fillStyle = `rgba(34, 0, 51, ${enginePulse * 0.8})`;
      ctx.fillRect(-size * 0.75, engineY - 6, 12, 12);

      ctx.fillStyle = `rgba(68, 0, 102, ${enginePulse})`;
      ctx.fillRect(-size * 0.73, engineY - 5, 10, 10);

      ctx.fillStyle = `rgba(102, 0, 153, ${enginePulse * 0.9})`;
      ctx.fillRect(-size * 0.71, engineY - 4, 8, 8);

      ctx.fillStyle = `rgba(136, 0, 204, ${enginePulse * 0.8})`;
      ctx.fillRect(-size * 0.7, engineY - 3, 6, 6);

      // Void exhaust (dissipating into nothing)
      for (let p = 0; p < 4; p++) {
        const exhaustX = -size * 0.8 - p * 8 - (time * 60) % 32;
        const exhaustY = engineY + Math.sin(time * 4 + p + i) * 4;
        const exhaustAlpha = Math.max(0, (1 - p * 0.2) * enginePulse - ((time * 60) % 32) / 32);

        ctx.fillStyle = `rgba(68, 0, 102, ${exhaustAlpha * 0.5})`;
        ctx.fillRect(exhaustX - 3, exhaustY - 3, 6, 6);
        ctx.fillStyle = `rgba(102, 0, 153, ${exhaustAlpha * 0.4})`;
        ctx.fillRect(exhaustX - 2, exhaustY - 2, 4, 4);
      }
    }

    // Phase shift effect (ship occasionally becomes translucent)
    const phaseShift = Math.sin(time * 0.6);
    if (phaseShift > 0.85) {
      const phaseAlpha = (phaseShift - 0.85) / 0.15;
      ctx.fillStyle = `rgba(170, 0, 255, ${phaseAlpha * 0.15})`;
      ctx.fillRect(-size * 0.8, -size * 0.7, size * 1.6, size * 1.4);
    }
  }

  /**
   * Standard ship (fallback)
   */
  renderStandardShip(ctx, ship, design) {
    const size = ship.size;

    // Shadow
    ctx.fillStyle = '#00000066';
    ctx.fillRect(-size * 0.6, -size * 0.4, size, size * 0.8);

    // Main hull
    ctx.fillStyle = ship.color;
    ctx.fillRect(-size * 0.5, -size * 0.3, size * 0.9, size * 0.6);

    // Cockpit
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(size * 0.2, -4, 6, 8);

    // Engine
    const enginePulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
    ctx.fillStyle = `#ff8800${Math.floor(enginePulse * 200).toString(16).padStart(2, '0')}`;
    ctx.fillRect(-size * 0.5, -4, 6, 8);
  }

  /**
   * Render engine trail for alien ship
   */
  renderEngineTrail(ctx, ship, design, camX, camY) {
    const sx = ship.x - camX;
    const sy = ship.y - camY;

    const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
    if (speed < 20) return; // No trail if moving slowly

    const angle = Math.atan2(ship.vy, ship.vx);
    const numParticles = Math.min(5, Math.floor(speed / 30));

    for (let i = 0; i < numParticles; i++) {
      const dist = (i + 1) * 12;
      const x = sx - Math.cos(angle) * dist;
      const y = sy - Math.sin(angle) * dist;
      const alpha = Math.floor((1 - i / numParticles) * 120).toString(16).padStart(2, '0');

      // Color based on race engine type
      let color = ship.color || '#ff8800';

      ctx.fillStyle = `${color}${alpha}`;
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
  }
}
