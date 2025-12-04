/**
 * ShipRenderer - Handles rendering of all player ship types
 * Extracted from Game.js to improve code organization
 *
 * Ship types:
 * - Scout: Small, fast, sleek design with antennas
 * - Explorer: Balanced ship with sensors and cargo
 * - Fighter: Combat-focused with weapon hardpoints
 * - Trader: Large cargo vessel with heavy hull
 * - Research: Science vessel with sensor arrays
 * - Military: Massive destroyer with heavy armor
 */
export class ShipRenderer {
  constructor(game) {
    this.game = game;
  }

  /**
   * Main ship rendering dispatch - calls appropriate renderer based on ship class
   */
  renderPlayerShip(ctx, p) {
    const shipClass = p.shipClass || 'explorer';

    // Common hull colors (darker, more realistic)
    const hullDark = '#1a1a28';
    const hullMid = '#2a2a38';
    const hullLight = '#3a3a48';
    const accentDark = '#445566';
    const metalDark = '#2a2a2f';
    const metalLight = '#4a4a55';

    // Size scaling for visual distinction
    // ADJUSTED: Smaller ships for more realistic proportions
    const scaleMap = {
      scout: 0.8,      // Smallest - nimble scout
      fighter: 1.0,    // Small - fast fighter
      explorer: 1.2,   // Medium baseline - balanced explorer
      research: 1.3,   // Medium-large - research vessel
      trader: 1.5,     // Large - cargo hauler
      military: 1.9    // Largest - military destroyer
    };

    const scale = scaleMap[shipClass] || 1.2;

    // Apply scaling
    ctx.save();
    ctx.scale(scale, scale);

    // Render based on ship class
    switch (shipClass) {
      case 'scout':
        this.renderScoutShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight);
        break;
      case 'fighter':
        this.renderFighterShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight);
        break;
      case 'trader':
        this.renderTraderShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight);
        break;
      case 'research':
        this.renderResearchShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight);
        break;
      case 'military':
        this.renderMilitaryShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight);
        break;
      case 'explorer':
      default:
        this.renderExplorerShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight);
        break;
    }

    ctx.restore();
  }

  /**
   * Scout: Small, fast, sleek design with antennas and sensors
   * ENHANCED: Pixelated textures, antennas, sleek armor panels, NO SHADOW
   */
  renderScoutShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (pixelated, sleek) ===
    this.game.fillPixelatedRect(ctx, -12, -6, 24, 12, p.damageFlash > 0.5 ? this.game.PALETTE.alertRed : hullDark, 2);

    // Armor panels (pixelated sections)
    this.game.fillPixelatedRect(ctx, -10, -5, 8, 10, hullMid, 2);
    this.game.fillPixelatedRect(ctx, 0, -5, 8, 10, hullMid, 2);

    // Cockpit window (small bright)
    ctx.fillStyle = this.game.PALETTE.shieldCyan;
    ctx.fillRect(-2, -2, 6, 4);

    // Side wings (small angled, pixelated)
    this.game.fillPixelatedRect(ctx, -8, -10, 12, 4, hullMid, 2);  // Top wing
    this.game.fillPixelatedRect(ctx, -8, 6, 12, 4, hullMid, 2);    // Bottom wing

    // Wing tips (accent color)
    ctx.fillStyle = accentDark;
    ctx.fillRect(-8, -10, 3, 4);
    ctx.fillRect(-8, 6, 3, 4);

    // Antenna array (front)
    ctx.strokeStyle = metalLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, -4);
    ctx.lineTo(16, -6);
    ctx.moveTo(12, 4);
    ctx.lineTo(16, 6);
    ctx.stroke();

    // Sensor dish (pixelated small square)
    this.game.fillPixelatedRect(ctx, 8, -4, 7, 8, this.game.PALETTE.warpBlue, 2);

    // Engine housing (rear pixelated)
    this.game.fillPixelatedRect(ctx, -12, -4, 5, 3, '#0a0a0f', 2);
    this.game.fillPixelatedRect(ctx, -12, 1, 5, 3, '#0a0a0f', 2);

    // Detail lines
    ctx.strokeStyle = hullLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();

    this.renderCommonShipFeatures(ctx, p, -12);
  }

  /**
   * Explorer: Balanced design with cargo holds and sensor arrays
   * ENHANCED: Pixelated cargo sections, sensor pods, balanced proportions
   */
  renderExplorerShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (pixelated, balanced) ===
    this.game.fillPixelatedRect(ctx, -14, -9, 28, 18, p.damageFlash > 0.5 ? this.game.PALETTE.alertRed : hullDark, 2);

    // Armor sections (pixelated panels)
    this.game.fillPixelatedRect(ctx, -12, -7, 10, 14, hullMid, 2);
    this.game.fillPixelatedRect(ctx, 0, -7, 10, 14, hullMid, 2);

    // Cockpit (centered bright window)
    ctx.fillStyle = this.game.PALETTE.shieldCyan;
    ctx.fillRect(-3, -3, 8, 6);

    // Inner cockpit glow
    ctx.fillStyle = this.game.PALETTE.warpBlue;
    ctx.fillRect(-2, -2, 6, 4);

    // Cargo holds (side bulges, pixelated)
    this.game.fillPixelatedRect(ctx, -10, -14, 16, 6, hullMid, 2);

    // Cargo hold details
    ctx.fillStyle = accentDark;
    ctx.fillRect(-9, -13, 4, 4);
    ctx.fillRect(-3, -13, 4, 4);
    ctx.fillRect(3, -13, 4, 4);

    // Bottom cargo hold
    this.game.fillPixelatedRect(ctx, -10, 8, 16, 6, hullMid, 2);

    // Bottom cargo details
    ctx.fillStyle = accentDark;
    ctx.fillRect(-9, 9, 4, 4);
    ctx.fillRect(-3, 9, 4, 4);
    ctx.fillRect(3, 9, 4, 4);

    // Sensor array (nose)
    this.game.fillPixelatedRect(ctx, 8, -6, 9, 12, this.game.PALETTE.warpBlue, 2);

    // Sensor grid detail
    ctx.strokeStyle = this.game.PALETTE.starWhite;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(9 + i * 3, -5, 2, 10);
    }

    // Solar panels (retractable wings)
    ctx.fillStyle = '#1a2a3a'; // Dark blue solar panel base
    ctx.fillRect(-8, -18, 14, 3); // Top panel
    ctx.fillRect(-8, 15, 14, 3);  // Bottom panel

    // Solar cell grid (pixelated detail)
    ctx.fillStyle = '#2a4a6a';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-7 + i * 4, -17, 2, 1);
      ctx.fillRect(-7 + i * 4, 16, 2, 1);
    }

    // Panel connection struts
    ctx.strokeStyle = metalLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -15);
    ctx.lineTo(-2, -10);
    ctx.moveTo(-2, 15);
    ctx.lineTo(-2, 10);
    ctx.stroke();

    // Engine housing (dual engines, pixelated)
    this.game.fillPixelatedRect(ctx, -14, -6, 6, 12, '#0a0a0f', 2);

    // Engine detail vents
    ctx.fillStyle = metalDark;
    ctx.fillRect(-13, -5, 3, 2);
    ctx.fillRect(-13, 0, 3, 2);
    ctx.fillRect(-13, 3, 3, 2);

    // Engine glow indicators (when active)
    if (this.game.input.thrust > 0) {
      ctx.fillStyle = this.game.PALETTE.engineOrange;
      ctx.fillRect(-13, -4, 2, 1);
      ctx.fillRect(-13, 1, 2, 1);
      ctx.fillRect(-13, 4, 2, 1);
    }

    this.renderCommonShipFeatures(ctx, p, -14);
  }

  /**
   * Fighter: Aggressive combat design with weapon hardpoints
   * ENHANCED: Heavy armor, weapon mounts, angular design
   */
  renderFighterShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (angular, armored, pixelated) ===
    this.game.fillPixelatedRect(ctx, -12, -8, 24, 16, p.damageFlash > 0.5 ? this.game.PALETTE.alertRed : hullDark, 2);

    // Armor plates (heavy, pixelated)
    this.game.fillPixelatedRect(ctx, -10, -6, 8, 12, hullMid, 2);
    this.game.fillPixelatedRect(ctx, 0, -6, 8, 12, hullMid, 2);

    // Cockpit (narrow, combat-focused)
    ctx.fillStyle = this.game.PALETTE.alertRed;
    ctx.fillRect(-1, -2, 6, 4);

    // Wing hardpoints (angular, pixelated)
    this.game.fillPixelatedRect(ctx, -9, -12, 14, 5, hullMid, 2);
    this.game.fillPixelatedRect(ctx, -9, 7, 14, 5, hullMid, 2);

    // Weapon mounts (top and bottom)
    this.game.fillPixelatedRect(ctx, -5, -14, 4, 3, metalDark, 1);

    // Weapon barrel detail
    ctx.fillStyle = metalLight;
    ctx.fillRect(-4, -15, 2, 1);

    // Bottom weapon mount
    this.game.fillPixelatedRect(ctx, -5, 11, 4, 3, metalDark, 1);

    // Bottom weapon barrel
    ctx.fillStyle = metalLight;
    ctx.fillRect(-4, 14, 2, 1);

    // Side armor panels (angular)
    this.game.fillPixelatedRect(ctx, 12, -6, 8, 5, hullDark, 2);

    // Side panel rivets
    ctx.fillStyle = metalDark;
    ctx.fillRect(13, -5, 2, 1);
    ctx.fillRect(15, -5, 2, 1);
    ctx.fillRect(17, -5, 2, 1);

    // Bottom side armor
    this.game.fillPixelatedRect(ctx, 12, 1, 8, 5, hullDark, 2);

    // Bottom panel rivets
    ctx.fillStyle = metalDark;
    ctx.fillRect(13, 2, 2, 1);
    ctx.fillRect(15, 2, 2, 1);
    ctx.fillRect(17, 2, 2, 1);

    // Targeting sensors (nose)
    this.game.fillPixelatedRect(ctx, 7, -5, 8, 10, this.game.PALETTE.warpBlue, 2);

    // Targeting grid
    ctx.strokeStyle = this.game.PALETTE.alertRed;
    ctx.lineWidth = 1;
    ctx.strokeRect(8, -4, 6, 8);

    // Engine cluster (triple engines, pixelated)
    this.game.fillPixelatedRect(ctx, -12, -5, 5, 10, '#0a0a0f', 2);

    // Engine separator lines
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(-7, -2);
    ctx.moveTo(-12, 2);
    ctx.lineTo(-7, 2);
    ctx.stroke();

    this.renderCommonShipFeatures(ctx, p, -12);
  }

  /**
   * Trader: Large cargo hauler with heavy plating
   * ENHANCED: Massive cargo holds, industrial design, heavy armor
   */
  renderTraderShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (large, blocky, industrial, pixelated) ===
    this.game.fillPixelatedRect(ctx, -16, -11, 32, 22, p.damageFlash > 0.5 ? this.game.PALETTE.alertRed : hullDark, 3);

    // Heavy armor sections (thick plating)
    // Left section
    this.game.fillPixelatedRect(ctx, -14, -9, 10, 18, hullMid, 3);

    // Left cargo markings
    ctx.fillStyle = this.game.PALETTE.cautionOrange;
    ctx.fillRect(-13, -7, 2, 2);
    ctx.fillRect(-13, -3, 2, 2);
    ctx.fillRect(-13, 1, 2, 2);
    ctx.fillRect(-13, 5, 2, 2);

    // Left cargo stripes
    ctx.strokeStyle = accentDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -4);
    ctx.lineTo(-4, -4);
    ctx.moveTo(-14, 4);
    ctx.lineTo(-4, 4);
    ctx.stroke();

    // Right section
    this.game.fillPixelatedRect(ctx, -2, -9, 10, 18, hullMid, 3);

    // Right cargo markings
    ctx.fillStyle = this.game.PALETTE.cautionOrange;
    ctx.fillRect(-1, -7, 2, 2);
    ctx.fillRect(-1, -3, 2, 2);
    ctx.fillRect(-1, 1, 2, 2);
    ctx.fillRect(-1, 5, 2, 2);

    // Right cargo stripes
    ctx.strokeStyle = accentDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.lineTo(8, -4);
    ctx.moveTo(-2, 4);
    ctx.lineTo(8, 4);
    ctx.stroke();

    // Cockpit (small, offset to side)
    ctx.fillStyle = this.game.PALETTE.statusBlue;
    ctx.fillRect(-4, -5, 6, 4);

    // Top cargo containers (pixelated)
    this.game.fillPixelatedRect(ctx, -10, -15, 8, 3, metalDark, 2);
    this.game.fillPixelatedRect(ctx, 0, -15, 8, 3, metalDark, 2);

    // Bottom cargo containers
    this.game.fillPixelatedRect(ctx, -10, 12, 8, 3, metalDark, 2);
    this.game.fillPixelatedRect(ctx, 0, 12, 8, 3, metalDark, 2);

    // Cargo container bolts (top left)
    ctx.fillStyle = '#0a0a0f';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-9 + i * 3, -14, 1, 1);
    }

    // Top right bolts
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(1 + i * 3, -14, 1, 1);
    }

    // Bottom left bolts
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-9 + i * 3, 13, 1, 1);
    }

    // Bottom right bolts
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(1 + i * 3, 13, 1, 1);
    }

    // Side stabilizer fins (pixelated)
    this.game.fillPixelatedRect(ctx, -12, -14, 10, 4, hullMid, 2);
    this.game.fillPixelatedRect(ctx, -12, 10, 10, 4, hullMid, 2);

    // Fin detail lines
    ctx.strokeStyle = hullLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, -12);
    ctx.lineTo(-2, -12);
    ctx.moveTo(-12, 12);
    ctx.lineTo(-2, 12);
    ctx.stroke();

    // Large engine cluster (quad engines, pixelated)
    this.game.fillPixelatedRect(ctx, -16, -7, 7, 14, '#0a0a0f', 3);

    // Engine grid separator
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-9, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-12, -7);
    ctx.lineTo(-12, 7);
    ctx.stroke();

    this.renderCommonShipFeatures(ctx, p, -16);
  }

  /**
   * Research: Science vessel with advanced sensor arrays
   * ENHANCED: Large sensor dishes, lab modules, scientific equipment
   */
  renderResearchShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (sleek, technical, pixelated) ===
    this.game.fillPixelatedRect(ctx, -14, -10, 28, 20, p.damageFlash > 0.5 ? this.game.PALETTE.alertRed : hullDark, 2);

    // Lab modules (pixelated sections)
    this.game.fillPixelatedRect(ctx, -12, -8, 10, 16, hullMid, 2);
    this.game.fillPixelatedRect(ctx, 0, -8, 10, 16, hullMid, 2);

    // Lab windows (bright blue science glow)
    ctx.fillStyle = this.game.PALETTE.warpBlue;
    ctx.fillRect(-11, -6, 3, 3);
    ctx.fillRect(-11, 0, 3, 3);
    ctx.fillRect(-11, 3, 3, 3);
    ctx.fillRect(1, -6, 3, 3);
    ctx.fillRect(1, 0, 3, 3);
    ctx.fillRect(1, 3, 3, 3);

    // Cockpit (centered)
    ctx.fillStyle = this.game.PALETTE.shieldCyan;
    ctx.fillRect(-4, -4, 8, 8);

    // Main sensor array (top, large dish, pixelated)
    this.game.fillPixelatedRect(ctx, -11, -15, 18, 6, hullMid, 2);

    // Sensor dish grid
    ctx.strokeStyle = this.game.PALETTE.warpBlue;
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(-11 + i * 3, -15);
      ctx.lineTo(-11 + i * 3, -9);
      ctx.stroke();
    }

    // Bottom sensor array (pixelated)
    this.game.fillPixelatedRect(ctx, -11, 9, 18, 6, hullMid, 2);

    // Bottom sensor grid
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(-11 + i * 3, 9);
      ctx.lineTo(-11 + i * 3, 15);
      ctx.stroke();
    }

    // Side sensor pods (small pixelated)
    this.game.fillPixelatedRect(ctx, -10, -14, 3, 4, accentDark, 1);
    this.game.fillPixelatedRect(ctx, 5, -14, 3, 4, accentDark, 1);
    this.game.fillPixelatedRect(ctx, -10, 10, 3, 4, accentDark, 1);
    this.game.fillPixelatedRect(ctx, 5, 10, 3, 4, accentDark, 1);

    // Sensor pod lights
    ctx.fillStyle = this.game.PALETTE.plasmaGreen;
    ctx.fillRect(-9, -13, 1, 2);
    ctx.fillRect(6, -13, 1, 2);
    ctx.fillRect(-9, 11, 1, 2);
    ctx.fillRect(6, 11, 1, 2);

    // Forward scanner array (nose, pixelated)
    this.game.fillPixelatedRect(ctx, 7, -7, 10, 14, this.game.PALETTE.warpBlue, 2);

    // Scanner detail lines
    ctx.strokeStyle = this.game.PALETTE.starWhite;
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(8 + i * 2, -6, 1, 12);
    }

    // Large solar panel arrays (scientific vessel needs power)
    ctx.fillStyle = '#1a2a3a'; // Dark blue solar panel base
    ctx.fillRect(-5, -22, 12, 4); // Top panel array
    ctx.fillRect(-5, 18, 12, 4);  // Bottom panel array

    // Solar cell grid (detailed)
    ctx.fillStyle = '#2a4a6a';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-4 + i * 4, -21, 2, 2);
      ctx.fillRect(-4 + i * 4, 19, 2, 2);
    }

    // Panel mounting brackets
    ctx.strokeStyle = metalLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(1, -18);
    ctx.lineTo(1, -10);
    ctx.moveTo(1, 18);
    ctx.lineTo(1, 10);
    ctx.stroke();

    // Power cables from panels to lab modules
    ctx.strokeStyle = this.game.PALETTE.warpBlue;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -18);
    ctx.lineTo(-6, -12);
    ctx.moveTo(6, -18);
    ctx.lineTo(8, -12);
    ctx.stroke();

    // Engine housing (twin engines, pixelated)
    this.game.fillPixelatedRect(ctx, -14, -6, 6, 12, '#0a0a0f', 2);

    // Engine separator
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-8, 0);
    ctx.stroke();

    // Engine glow indicators (active research vessel)
    if (this.game.input.thrust > 0 || p.power > 50) {
      ctx.fillStyle = this.game.PALETTE.warpBlue;
      ctx.fillRect(-13, -5, 2, 2);
      ctx.fillRect(-13, 3, 2, 2);
    }

    this.renderCommonShipFeatures(ctx, p, -14);
  }

  /**
   * Military: Massive destroyer with heavy armor and weapons
   * ENHANCED: Bulky armor plating, weapon turrets, intimidating design
   */
  renderMilitaryShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (massive, armored, intimidating, pixelated) ===
    this.game.fillPixelatedRect(ctx, -17, -12, 34, 24, p.damageFlash > 0.5 ? this.game.PALETTE.alertRed : hullDark, 3);

    // Heavy armor sections (thick plating, pixelated)
    // Left armor block
    this.game.fillPixelatedRect(ctx, -15, -10, 12, 20, hullMid, 3);

    // Left armor rivets
    ctx.fillStyle = metalDark;
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-14, -9 + i * 5, 2, 2);
      ctx.fillRect(-8, -9 + i * 5, 2, 2);
    }

    // Right armor block
    this.game.fillPixelatedRect(ctx, -1, -10, 12, 20, hullMid, 3);

    // Right armor rivets
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(0, -9 + i * 5, 2, 2);
      ctx.fillRect(6, -9 + i * 5, 2, 2);
    }

    // Armored cockpit (small, protected)
    ctx.fillStyle = this.game.PALETTE.alertRed;
    ctx.fillRect(-5, -5, 10, 6);

    // Cockpit armor frame
    ctx.strokeStyle = hullLight;
    ctx.lineWidth = 2;
    ctx.strokeRect(-6, -6, 12, 8);

    // Top weapon turret (large, pixelated)
    this.game.fillPixelatedRect(ctx, -13, -16, 16, 5, hullMid, 3);
    this.game.fillPixelatedRect(ctx, -13, 11, 16, 5, hullMid, 3);

    // Turret weapon barrels (top)
    this.game.fillPixelatedRect(ctx, -10, -18, 5, 4, metalDark, 2);

    // Barrel tips
    ctx.fillStyle = metalLight;
    ctx.fillRect(-9, -20, 3, 2);

    // Top turret detail
    ctx.strokeStyle = accentDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -15, 14, 3);

    // Bottom weapon barrels
    this.game.fillPixelatedRect(ctx, 0, -18, 5, 4, metalDark, 2);

    // Bottom barrel tips
    ctx.fillStyle = metalLight;
    ctx.fillRect(1, -20, 3, 2);

    // Bottom turret (pixelated)
    this.game.fillPixelatedRect(ctx, -10, 14, 5, 4, metalDark, 2);

    // Bottom turret barrel tips
    ctx.fillStyle = metalLight;
    ctx.fillRect(-9, 18, 3, 2);

    // Bottom right turret
    this.game.fillPixelatedRect(ctx, 0, 14, 5, 4, metalDark, 2);

    // Bottom right barrel tips
    ctx.fillStyle = metalLight;
    ctx.fillRect(1, 18, 3, 2);

    // Side armor plating (heavy, pixelated)
    this.game.fillPixelatedRect(ctx, 15, -8, 9, 6, hullDark, 3);

    // Side plate bolts
    ctx.fillStyle = '#0a0a0f';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(16 + i * 3, -7, 2, 2);
    }

    // Bottom side armor
    this.game.fillPixelatedRect(ctx, 15, 2, 9, 6, hullDark, 3);

    // Bottom side bolts
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(16 + i * 3, 3, 2, 2);
    }

    // Targeting computer (nose, glowing, pixelated)
    this.game.fillPixelatedRect(ctx, -4, -4, 8, 8, '#2a3a5a', 2);

    // Targeting grid
    ctx.strokeStyle = this.game.PALETTE.alertRed;
    ctx.lineWidth = 1;
    ctx.strokeRect(-3, -3, 6, 6);
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(3, 0);
    ctx.moveTo(0, -3);
    ctx.lineTo(0, 3);
    ctx.stroke();

    // Forward sensors (nose mount, pixelated)
    this.game.fillPixelatedRect(ctx, 10, -7, 9, 14, this.game.PALETTE.warpBlue, 2);

    // Sensor array grid
    ctx.strokeStyle = this.game.PALETTE.starWhite;
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(11 + i * 3, -6, 2, 12);
    }

    // Engine cluster (quad heavy engines, pixelated)
    this.game.fillPixelatedRect(ctx, -17, -9, 7, 6, '#0a0a0f', 3);
    this.game.fillPixelatedRect(ctx, -17, 3, 7, 6, '#0a0a0f', 3);

    // Engine separator grids
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-17, -6);
    ctx.lineTo(-10, -6);
    ctx.moveTo(-17, 6);
    ctx.lineTo(-10, 6);
    ctx.stroke();

    // Engine cooling vents
    ctx.fillStyle = '#2a2a3a';
    for (let i = 0; i < 2; i++) {
      ctx.fillRect(-15, -6 + i * 2, 3, 1);
      ctx.fillRect(-15, 5 + i * 2, 3, 1);
    }

    this.renderCommonShipFeatures(ctx, p, -17);
  }

  /**
   * Common ship features - engine flames, thrusters, navigation lights
   * Rendered for all ship types
   */
  renderCommonShipFeatures(ctx, p, engineX) {
    // Engine exhaust (small pixelated flame, no glow)
    if (this.game.input.thrust > 0) {
      const enginePulse = Math.sin(this.game.time * 20) * 0.3 + 0.7;

      // Small bright exhaust flame (no gradient glow)
      ctx.fillStyle = this.game.PALETTE.engineBright;
      ctx.fillRect(engineX - 4, -2, 4, 4);

      // Inner bright core
      ctx.fillStyle = this.game.PALETTE.starWhite;
      ctx.fillRect(engineX - 2, -1, 2, 2);
    }

    // Side thrusters for turning
    if (p.angularVelocity < -0.01) {
      const thrustIntensity = Math.min(Math.abs(p.angularVelocity) * 20, 1);
      const thrustPulse = Math.sin(this.game.time * 25) * 0.4 + 0.6;
      ctx.fillStyle = `${this.game.PALETTE.engineOrange}${this.game.constructor.alphaToHex(thrustIntensity * thrustPulse * 180)}`;
      ctx.fillRect(8, 8, 3, 6);
    }
    if (p.angularVelocity > 0.01) {
      const thrustIntensity = Math.min(Math.abs(p.angularVelocity) * 20, 1);
      const thrustPulse = Math.sin(this.game.time * 25) * 0.4 + 0.6;
      ctx.fillStyle = `${this.game.PALETTE.engineOrange}${this.game.constructor.alphaToHex(thrustIntensity * thrustPulse * 180)}`;
      ctx.fillRect(8, -14, 3, 6);
    }

    // Navigation lights
    const blinkPhase = Math.floor(this.game.time * 3) % 2;
    if (blinkPhase) {
      ctx.fillStyle = this.game.PALETTE.alertRed;
      ctx.fillRect(-10, -14, 2, 2);
      ctx.fillStyle = this.game.PALETTE.statusGreen;
      ctx.fillRect(-10, 12, 2, 2);
    }
  }
}
