/**
 * HUDRenderer - Handles all HUD/UI rendering for the game
 * Extracted from Game.js (lines 6465-10650) to improve code organization
 *
 * Renders:
 * - Top information monitor (system info, position, combat stats)
 * - Radar system (system and interstellar views)
 * - Bottom console (ship systems, damage control, decorative controls)
 * - Center warnings and status messages
 * - Touch controls for mobile
 */
import { getSystemSize } from './ScaleSystem.js';

export class HUDRenderer {
  constructor(game) {
    this.game = game;
  }

  /**
   * Main HUD render method - called every frame
   */
  render() {
    // === NEW COCKPIT-STYLE HUD LAYOUT ===

    // 1. TOP-CENTER INFORMATION MONITOR
    this.renderInfoMonitor();

    // 2. RIGHT-MIDDLE RADAR (CRT TERMINAL STYLE)
    this.renderRadar();

    // COCKPIT UI REDESIGN: Unified bottom console (replaces 3 separate panels)
    this.renderBottomConsole();

    // 6. CENTER WARNINGS & STATUS MESSAGES
    this.renderCenterWarnings();
  }

  // Helper: Draw CRT scanline effect
  draw3DPanel(x, y, width, height, mainColor, shadowDepth = 4) {
    const ctx = this.game.ctx;

    // PIXELATED: Shadow layers - hundreds of tiny 4px pixels
    ctx.globalAlpha = 0.8;
    this.fillPixelatedRect(ctx, x + shadowDepth, y + shadowDepth, width, height, this.game.PALETTE.deepBlack, 4);
    ctx.globalAlpha = 0.4;
    this.fillPixelatedRect(ctx, x + shadowDepth - 1, y + shadowDepth - 1, width, height, this.game.PALETTE.shadowGray, 4);
    ctx.globalAlpha = 1.0;

    // PIXELATED: Main panel - hundreds of tiny 4px pixels
    this.fillPixelatedRect(ctx, x, y, width, height, mainColor, 4);

    // Highlight (top-left edge for 3D effect)
    ctx.strokeStyle = `${this.game.PALETTE.starWhite}22`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();

    // Dark edge (bottom-right for depth)
    ctx.strokeStyle = `${this.game.PALETTE.deepBlack}88`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.stroke();
  }

  // Helper: Draw rusty corner brackets
  drawRustyCorners(x, y, width, height, color, size = 15) {
    const ctx = this.game.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Add slight irregularity for rusty effect
    const jitter = () => Math.random() * 0.5 - 0.25;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x, y + size + jitter());
    ctx.lineTo(x, y + jitter());
    ctx.lineTo(x + size + jitter(), y);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + width - size + jitter(), y);
    ctx.lineTo(x + width + jitter(), y);
    ctx.lineTo(x + width, y + size + jitter());
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x, y + height - size + jitter());
    ctx.lineTo(x, y + height + jitter());
    ctx.lineTo(x + size + jitter(), y + height);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + width - size + jitter(), y + height);
    ctx.lineTo(x + width + jitter(), y + height);
    ctx.lineTo(x + width, y + height - size + jitter());
    ctx.stroke();
  }

  // Helper: Fill pixelated rectangle
  fillPixelatedRect(ctx, x, y, width, height, color, pixelSize = 4) {
    for (let py = 0; py < height; py += pixelSize) {
      for (let px = 0; px < width; px += pixelSize) {
        ctx.fillStyle = color;
        ctx.fillRect(x + px, y + py, pixelSize, pixelSize);
      }
    }
  }

  // Helper: Draw bar with gradient
  drawBar(x, y, width, height, value, max, colorHigh, colorLow) {
    const ctx = this.game.ctx;
    const percent = Math.max(0, Math.min(1, value / max));

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, width, height);

    // Border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Fill with color gradient
    const fillWidth = (width - 2) * percent;
    const color = percent > 0.6 ? colorHigh : percent > 0.3 ? this.game.PALETTE.cautionOrange : colorLow;
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, fillWidth, height - 2);

    // Glow effect
    if (percent > 0.7) {
      ctx.shadowBlur = 4;
      ctx.shadowColor = color;
      ctx.fillRect(x + 1, y + 1, fillWidth, height - 2);
      ctx.shadowBlur = 0;
    }
  }

  // Helper: hex to RGB conversion
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  // 1. TOP-CENTER INFORMATION MONITOR (COCKPIT UI: Angled perspective)
  renderInfoMonitor() {
    const ctx = this.game.ctx;
    const p = this.game.player;

    const panelW = 1100;
    const panelH = 95;
    const panelX = this.game.width / 2 - panelW / 2;
    const panelY = 12;
    const skew = 15; // Angle distortion for 3D effect

    // === ULTRA-ENHANCED 3D ANGLED PERSPECTIVE with multi-layer depth ===
    // Layer 4: Deepest shadow (furthest back)
    ctx.fillStyle = `${this.game.PALETTE.deepBlack}99`;
    ctx.beginPath();
    ctx.moveTo(panelX - 12, panelY + 14);
    ctx.lineTo(panelX + panelW + 12, panelY + 14);
    ctx.lineTo(panelX + panelW + skew + 10, panelY + panelH + 14);
    ctx.lineTo(panelX - skew - 10, panelY + panelH + 14);
    ctx.closePath();
    ctx.fill();

    // Layer 3: Medium shadow
    ctx.fillStyle = `${this.game.PALETTE.deepBlack}bb`;
    ctx.beginPath();
    ctx.moveTo(panelX - 9, panelY + 11);
    ctx.lineTo(panelX + panelW + 9, panelY + 11);
    ctx.lineTo(panelX + panelW + skew + 7, panelY + panelH + 11);
    ctx.lineTo(panelX - skew - 7, panelY + panelH + 11);
    ctx.closePath();
    ctx.fill();

    // Layer 2: Light shadow
    ctx.fillStyle = `${this.game.PALETTE.deepBlack}dd`;
    ctx.beginPath();
    ctx.moveTo(panelX - 6, panelY + 8);
    ctx.lineTo(panelX + panelW + 6, panelY + 8);
    ctx.lineTo(panelX + panelW + skew, panelY + panelH + 8);
    ctx.lineTo(panelX - skew, panelY + panelH + 8);
    ctx.closePath();
    ctx.fill();

    // Layer 1: Main panel body with heavily pixelated metal texture
    const pixelSize = 3; // Heavy pixelation for retro metal texture
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(panelX, panelY);
    ctx.lineTo(panelX + panelW, panelY);
    ctx.lineTo(panelX + panelW + skew, panelY + panelH);
    ctx.lineTo(panelX - skew, panelY + panelH);
    ctx.closePath();
    ctx.clip();

    // Pixelated metal texture fill
    for (let py = panelY; py < panelY + panelH; py += pixelSize) {
      for (let px = panelX - skew; px < panelX + panelW + skew; px += pixelSize) {
        const noise = Math.sin(px * 0.1 + py * 0.1) * 0.5 + 0.5;
        const variation = Math.floor(noise * 10 - 5);
        const baseR = 0x1a + variation;
        const baseG = 0x1a + variation;
        const baseB = 0x22 + variation;
        ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, baseR))}, ${Math.max(0, Math.min(255, baseG))}, ${Math.max(0, Math.min(255, baseB))})`;
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }
    }
    ctx.restore();

    // Top edge highlight (3D lighting) - brighter for more depth
    ctx.strokeStyle = '#454555';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(panelX + 2, panelY + 2);
    ctx.lineTo(panelX + panelW - 2, panelY + 2);
    ctx.stroke();

    // Bottom edge shadow (3D depth)
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(panelX - skew + 2, panelY + panelH - 2);
    ctx.lineTo(panelX + panelW + skew - 2, panelY + panelH - 2);
    ctx.stroke();

    // Panel border with angle - thicker for more presence
    ctx.strokeStyle = '#0f0f12';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(panelX, panelY);
    ctx.lineTo(panelX + panelW, panelY);
    ctx.lineTo(panelX + panelW + skew, panelY + panelH);
    ctx.lineTo(panelX - skew, panelY + panelH);
    ctx.closePath();
    ctx.stroke();

    // ULTRA-ENHANCED: More rust, scratches, and damage marks - heavily pixelated
    const rustColors = ['#442211', '#332211', '#553322', '#221100'];
    const pixelSizeRust = 2; // Heavy pixelation for rust

    // Rust patches (60+ marks for realistic wear)
    for (let i = 0; i < 60; i++) {
      const rx = panelX + Math.random() * panelW;
      const ry = panelY + Math.random() * panelH;
      const rsize = Math.floor((Math.random() * 8 + 3) / pixelSizeRust) * pixelSizeRust;
      ctx.globalAlpha = 0.15 + Math.random() * 0.25;
      ctx.fillStyle = rustColors[Math.floor(Math.random() * rustColors.length)];
      ctx.fillRect(Math.floor(rx / pixelSizeRust) * pixelSizeRust,
                   Math.floor(ry / pixelSizeRust) * pixelSizeRust,
                   rsize, rsize);
    }

    // Scratches (20+ linear marks)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      const sx = panelX + Math.random() * panelW;
      const sy = panelY + Math.random() * panelH;
      const length = Math.random() * 30 + 10;
      const angle = Math.random() * Math.PI;
      ctx.globalAlpha = 0.2 + Math.random() * 0.2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(angle) * length, sy + Math.sin(angle) * length);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;

    // REMOVED: Orange outline/glow - cleaner cockpit look
    // Main border without glow - subtle dark edge
    ctx.strokeStyle = '#2a2a30';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6);

    // Rusty corners
    this.drawRustyCorners(panelX, panelY, panelW, panelH, this.game.PALETTE.warpBlue, 16);

    // CRT screen background
    const screenX = panelX + 12;
    const screenY = panelY + 12;
    const screenW = panelW - 24;
    const screenH = panelH - 24;

    ctx.fillStyle = '#050508';
    ctx.fillRect(screenX, screenY, screenW, screenH);

    // CRT scanlines
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    for (let i = 0; i < screenH; i += 2) {
      ctx.beginPath();
      ctx.moveTo(screenX, screenY + i);
      ctx.lineTo(screenX + screenW, screenY + i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Screen border
    ctx.strokeStyle = '#6a4a2a';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY, screenW, screenH);

    // ULTRA-ENHANCED: More rivets and bolts (40+ for industrial look)
    const rivetPositions = [];

    // Corner bolts (large)
    rivetPositions.push(
      {x: panelX + 15, y: panelY + 15, size: 4, type: 'bolt'},
      {x: panelX + panelW - 15, y: panelY + 15, size: 4, type: 'bolt'},
      {x: panelX + 15, y: panelY + panelH - 15, size: 4, type: 'bolt'},
      {x: panelX + panelW - 15, y: panelY + panelH - 15, size: 4, type: 'bolt'}
    );

    // Top edge rivets (12 small rivets)
    for (let i = 1; i < 12; i++) {
      rivetPositions.push({
        x: panelX + (panelW / 12) * i,
        y: panelY + 10,
        size: 2,
        type: 'rivet'
      });
    }

    // Bottom edge rivets (12 small rivets)
    for (let i = 1; i < 12; i++) {
      rivetPositions.push({
        x: panelX + (panelW / 12) * i,
        y: panelY + panelH - 10,
        size: 2,
        type: 'rivet'
      });
    }

    // Side rivets (8 per side)
    for (let i = 1; i < 8; i++) {
      rivetPositions.push(
        {x: panelX + 10, y: panelY + (panelH / 8) * i, size: 2, type: 'rivet'},
        {x: panelX + panelW - 10, y: panelY + (panelH / 8) * i, size: 2, type: 'rivet'}
      );
    }

    // Render all rivets and bolts
    for (const pos of rivetPositions) {
      // Rivet shadow
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pos.x + 1, pos.y + 1, pos.size, 0, Math.PI * 2);
      ctx.fill();

      // Rivet body
      ctx.fillStyle = pos.type === 'bolt' ? '#2a2a2a' : '#1a1a1a';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.size, 0, Math.PI * 2);
      ctx.fill();

      // Rivet highlight
      ctx.fillStyle = pos.type === 'bolt' ? '#4a4a4a' : '#3a3a3a';
      ctx.beginPath();
      ctx.arc(pos.x - 0.5, pos.y - 0.5, pos.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Bolt cross (only for large bolts)
      if (pos.type === 'bolt') {
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pos.x - pos.size + 1, pos.y);
        ctx.lineTo(pos.x + pos.size - 1, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y - pos.size + 1);
        ctx.lineTo(pos.x, pos.y + pos.size - 1);
        ctx.stroke();
      }
    }

    // === CONTENT SECTIONS ===
    ctx.textAlign = 'left';

    // LEFT SECTION: System Information
    let xPos = screenX + 10;
    const yBase = screenY + 15;

    // System name with glow (BIGGER, more analog)
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.game.PALETTE.warpBlue;
    ctx.fillStyle = this.game.PALETTE.warpBlue;
    ctx.font = 'bold 15px DigitalDisco, monospace';
    const systemName = this.game.currentSystemData?.name || 'UNKNOWN SYSTEM';
    ctx.fillText(`◈ ${systemName.toUpperCase()}`, xPos, yBase);
    ctx.shadowBlur = 0;

    // Star type and classification with full name (EXPANDED)
    ctx.fillStyle = this.game.PALETTE.statusBlue;
    ctx.font = '11px DigitalDisco, monospace';
    const starDisplayName = this.game.star.stellarData?.name || `${this.game.star.type || 'G'}-CLASS`;
    ctx.fillText(`STAR: ${starDisplayName}`, xPos, yBase + 14);

    // Celestial body count (BIGGER)
    const moonCount = this.game.planets.reduce((sum, p) => sum + (p.moons?.length || 0), 0);
    ctx.fillText(`BODIES: ${this.game.planets.length}P ${moonCount}M`, xPos, yBase + 26);

    // Hazard indicators (BIGGER)
    const hasBlackhole = this.game.currentSystemData?.hasBlackhole;
    if (hasBlackhole) {
      ctx.fillStyle = this.game.PALETTE.alertRed;
      ctx.fillText('⚠ BLACK HOLE', xPos, yBase + 38);
    } else {
      ctx.fillStyle = '#666666';
      ctx.fillText(`HAZARD: NONE`, xPos, yBase + 38);
    }

    // Station count (BIGGER)
    ctx.fillStyle = this.game.PALETTE.statusGreen;
    ctx.fillText(`STATIONS: ${this.game.stations.length}`, xPos, yBase + 50);

    // Vertical separator
    xPos += 185;
    ctx.strokeStyle = `${this.game.PALETTE.statusBlue}44`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xPos, screenY + 5);
    ctx.lineTo(xPos, screenY + screenH - 5);
    ctx.stroke();

    // CENTER SECTION: Navigation & Position
    xPos += 10;

    // Coordinates (BIGGER, more analog)
    ctx.fillStyle = this.game.PALETTE.statusGreen;
    ctx.font = 'bold 12px DigitalDisco, monospace';
    ctx.fillText('POSITION', xPos, yBase);

    ctx.font = '11px DigitalDisco, monospace';
    ctx.fillText(`X: ${Math.floor(p.x).toString().padStart(6, '0')}`, xPos, yBase + 14);
    ctx.fillText(`Y: ${Math.floor(p.y).toString().padStart(6, '0')}`, xPos, yBase + 26);

    // Velocity vector (BIGGER)
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const heading = Math.atan2(p.vy, p.vx) * 180 / Math.PI;

    ctx.fillStyle = speed > 100 ? this.game.PALETTE.cautionOrange : this.game.PALETTE.statusGreen;
    ctx.fillText(`VEL: ${Math.floor(speed)} m/s`, xPos, yBase + 38);
    ctx.fillStyle = this.game.PALETTE.mediumGray;
    ctx.fillText(`HDG: ${Math.floor(heading)}°`, xPos, yBase + 50);

    // Distance to star
    const distToStar = Math.sqrt((p.x - this.game.star.x)**2 + (p.y - this.game.star.y)**2);
    xPos += 105;
    ctx.fillStyle = this.game.PALETTE.cautionOrange;
    ctx.font = 'bold 12px DigitalDisco, monospace';
    ctx.fillText('DISTANCE', xPos, yBase);

    ctx.font = '11px DigitalDisco, monospace';
    ctx.fillText(`STAR: ${(distToStar/100).toFixed(1)}km`, xPos, yBase + 14);

    // Distance to nearest station (BIGGER)
    let nearestStation = Infinity;
    for (const station of this.game.stations) {
      const sx = this.game.star.x + Math.cos(station.angle) * station.distance;
      const sy = this.game.star.y + Math.sin(station.angle) * station.distance;
      const dist = Math.sqrt((p.x - sx)**2 + (p.y - sy)**2);
      if (dist < nearestStation) nearestStation = dist;
    }
    if (nearestStation < Infinity) {
      ctx.fillText(`STN: ${(nearestStation/100).toFixed(1)}km`, xPos, yBase + 26);
    } else {
      ctx.fillStyle = '#444444';
      ctx.fillText('STN: N/A', xPos, yBase + 26);
    }

    // Mission time (BIGGER)
    const playtime = this.game.playtime || 0;
    const hours = Math.floor(playtime / 3600000);
    const minutes = Math.floor((playtime % 3600000) / 60000);
    ctx.fillStyle = this.game.PALETTE.mediumGray;
    ctx.fillText(`TIME: ${hours}h ${minutes}m`, xPos, yBase + 38);

    // Game year (fictional) (BIGGER)
    const year = 2387 + Math.floor(playtime / 86400000);
    ctx.fillText(`YEAR: ${year}`, xPos, yBase + 50);

    // Vertical separator
    xPos += 110;
    ctx.strokeStyle = `${this.game.PALETTE.statusBlue}44`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xPos, screenY + 5);
    ctx.lineTo(xPos, screenY + screenH - 5);
    ctx.stroke();

    // CENTER-RIGHT SECTION: Combat & Statistics
    xPos += 10;

    ctx.fillStyle = this.game.PALETTE.plasmaGreen;
    ctx.font = 'bold 12px DigitalDisco, monospace';
    ctx.fillText('COMBAT LOG', xPos, yBase);

    ctx.font = '11px DigitalDisco, monospace';
    ctx.fillText(`KILLS: ${p.kills || 0}`, xPos, yBase + 14);
    ctx.fillText(`SCORE: ${p.score || 0}`, xPos, yBase + 26);

    // Accuracy (BIGGER)
    const shotsHit = this.game.statistics?.shotsHit || 0;
    const shotsFired = this.game.statistics?.shotsFired || 1;
    const accuracy = Math.floor((shotsHit / shotsFired) * 100);
    ctx.fillText(`ACC: ${accuracy}%`, xPos, yBase + 38);

    // Threat level (BIGGER)
    const threatLevel = this.game.enemies.length;
    ctx.fillStyle = threatLevel > 5 ? this.game.PALETTE.alertRed :
                    threatLevel > 2 ? this.game.PALETTE.cautionOrange :
                    this.game.PALETTE.statusGreen;
    ctx.fillText(`THREAT: ${threatLevel === 0 ? 'NONE' : threatLevel}`, xPos, yBase + 50);

    // Vertical separator
    xPos += 105;
    ctx.strokeStyle = `${this.game.PALETTE.statusBlue}44`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xPos, screenY + 5);
    ctx.lineTo(xPos, screenY + screenH - 5);
    ctx.stroke();

    // RIGHT SECTION: Economy & Resources
    xPos += 10;

    // Credits with glow (BIGGER, more analog)
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffaa00';
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 13px DigitalDisco, monospace';
    const credits = this.game.economySystem?.credits || 0;
    ctx.fillText(`₢ ${credits.toLocaleString()}`, xPos, yBase + 5);
    ctx.shadowBlur = 0;

    // Cargo (BIGGER)
    ctx.fillStyle = this.game.PALETTE.statusBlue;
    ctx.font = '11px DigitalDisco, monospace';
    const cargoUsed = this.game.economySystem?.getCargoSpaceUsed() || 0;
    const cargoMax = this.game.economySystem?.cargoCapacity || 100;
    const cargoPercent = Math.floor((cargoUsed / cargoMax) * 100);
    ctx.fillText(`CARGO: ${cargoUsed}/${cargoMax}`, xPos, yBase + 20);

    // Cargo bar
    const cargoBarW = 120;
    const cargoBarH = 6;
    const cargoBarX = xPos;
    const cargoBarY = yBase + 24;

    ctx.fillStyle = '#000000';
    ctx.fillRect(cargoBarX, cargoBarY, cargoBarW, cargoBarH);
    ctx.strokeStyle = this.game.PALETTE.statusBlue;
    ctx.lineWidth = 1;
    ctx.strokeRect(cargoBarX, cargoBarY, cargoBarW, cargoBarH);

    const cargoFillW = (cargoBarW - 2) * (cargoPercent / 100);
    ctx.fillStyle = cargoPercent > 90 ? this.game.PALETTE.alertRed :
                    cargoPercent > 70 ? this.game.PALETTE.cautionOrange :
                    this.game.PALETTE.statusGreen;
    ctx.fillRect(cargoBarX + 1, cargoBarY + 1, cargoFillW, cargoBarH - 2);

    // Artifacts collected (BIGGER)
    const artifacts = this.game.artifactSystem?.collectedArtifacts?.length || 0;
    ctx.fillStyle = this.game.PALETTE.warpPurple;
    ctx.fillText(`ARTIFACTS: ${artifacts}`, xPos, yBase + 40);

    // FPS and performance (BIGGER)
    ctx.fillStyle = this.game.fps < 30 ? this.game.PALETTE.alertRed : this.game.PALETTE.mediumGray;
    ctx.fillText(`FPS: ${Math.floor(this.game.fps)}`, xPos, yBase + 52);

    // Status indicators (blinking LEDs)
    xPos += 130;
    const ledY = screenY + 8;
    const ledSize = 4;
    const ledSpacing = 10;

    // Auto-save indicator
    if (this.game.autosaving) {
      ctx.fillStyle = this.game.PALETTE.statusGreen;
      ctx.beginPath();
      ctx.arc(xPos, ledY, ledSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.game.PALETTE.statusGreen;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Warning indicator
    const hasWarnings = this.game.shipDamageSystem?.getCriticalSections().length > 0 || p.hull < 30 || p.fuel < 200;
    if (hasWarnings && Math.floor(this.game.time * 3) % 2 === 0) {
      ctx.fillStyle = this.game.PALETTE.alertRed;
      ctx.beginPath();
      ctx.arc(xPos, ledY + ledSpacing, ledSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.game.PALETTE.alertRed;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // === ENHANCED COCKPIT DETAILS ===

    // More rivets for texture
    const panelRivets = [
      {x: panelX + panelW / 4, y: panelY + 10},
      {x: panelX + (panelW / 4) * 2, y: panelY + 10},
      {x: panelX + (panelW / 4) * 3, y: panelY + 10},
      {x: panelX + panelW / 4, y: panelY + panelH - 10},
      {x: panelX + (panelW / 4) * 2, y: panelY + panelH - 10},
      {x: panelX + (panelW / 4) * 3, y: panelY + panelH - 10}
    ];

    for (const pos of panelRivets) {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pos.x + 0.5, pos.y + 0.5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Panel identification
    ctx.fillStyle = `${this.game.PALETTE.mediumGray}44`;
    ctx.font = '6px monospace';
    ctx.fillText('PANEL-01', panelX + panelW - 50, panelY + 10);

    // Warning stripes at corners
    const stripeW = 25;
    const stripeH = 3;
    const stripePattern = ['#3a3a1a', '#1a1a1a'];

    // Top left stripe
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = stripePattern[i % 2];
      ctx.fillRect(panelX + 5 + i * 8, panelY + 5, 8, stripeH);
    }

    // Top right stripe
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = stripePattern[i % 2];
      ctx.fillRect(panelX + panelW - 29 + i * 8, panelY + 5, 8, stripeH);
    }

    // Bottom warning text
    ctx.fillStyle = '#555566';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NAVIGATION COMPUTER ONLINE', panelX + panelW / 2, panelY + panelH - 3);

    // Serial number label
    ctx.fillStyle = '#444444';
    ctx.font = '7px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NAV-HUD-9942-A', panelX + 10, panelY + panelH - 5);

    ctx.textAlign = 'left';
  }

  renderCenterWarnings() {
    const ctx = this.game.ctx;
    const p = this.game.player;

    let warningY = 120;

    // Heat warnings
    if (p.heatStatus === 'critical') {
      const flash = Math.floor(this.game.time * 8) % 2;
      if (flash) {
        ctx.fillStyle = this.game.PALETTE.alertRed;
        ctx.font = 'bold 22px DigitalDisco, monospace';
        ctx.shadowColor = this.game.PALETTE.alertRed;
        ctx.shadowBlur = 20;
        ctx.textAlign = 'center';
        ctx.fillText('⚠ CRITICAL HEAT ⚠', this.game.width / 2, warningY);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
        warningY += 40;
      }
    } else if (p.heatStatus === 'danger') {
      ctx.fillStyle = this.game.PALETTE.alertRed;
      ctx.font = 'bold 18px DigitalDisco, monospace';
      ctx.shadowColor = this.game.PALETTE.cautionOrange;
      ctx.shadowBlur = 10;
      ctx.textAlign = 'center';
      ctx.fillText('⚠ HIGH TEMPERATURE', this.game.width / 2, warningY);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
      warningY += 35;
    } else if (p.heatStatus === 'warning') {
      ctx.fillStyle = this.game.PALETTE.cautionOrange;
      ctx.font = 'bold 16px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ HEAT WARNING', this.game.width / 2, warningY);
      ctx.textAlign = 'left';
      warningY += 30;
    }

    // Hull critical
    if (p.hull < 30) {
      const flash = Math.floor(this.game.time * 5) % 2;
      if (flash) {
        ctx.fillStyle = this.game.PALETTE.alertRed;
        ctx.font = 'bold 20px DigitalDisco, monospace';
        ctx.shadowColor = this.game.PALETTE.alertRed;
        ctx.shadowBlur = 15;
        ctx.textAlign = 'center';
        ctx.fillText('⚠ HULL CRITICAL ⚠', this.game.width / 2, warningY);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
        warningY += 35;
      }
    }

    // Low fuel
    if (p.fuel < 200) {
      ctx.fillStyle = this.game.PALETTE.cautionOrange;
      ctx.font = 'bold 16px DigitalDisco, monospace';
      ctx.shadowColor = this.game.PALETTE.cautionOrange;
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.fillText('⚠ LOW FUEL', this.game.width / 2, warningY);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
      warningY += 30;
    }

    // Shield active indicator
    if (p.shieldActive) {
      ctx.fillStyle = this.game.PALETTE.shieldCyan;
      ctx.font = 'bold 15px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('◈ SHIELDS ACTIVE ◈', this.game.width / 2, this.game.height - 250);
      ctx.textAlign = 'left';
    }

    // Warp active indicator
    if (p.warpActive) {
      ctx.fillStyle = this.game.PALETTE.warpPurple;
      ctx.font = 'bold 18px DigitalDisco, monospace';
      ctx.shadowColor = this.game.PALETTE.warpPurple;
      ctx.shadowBlur = 12;
      ctx.textAlign = 'center';
      ctx.fillText('▶ WARP DRIVE ENGAGED ◀', this.game.width / 2, this.game.height - 280);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    }
  }

  renderRadar() {
    const ctx = this.game.ctx;
    // RIGHT-MIDDLE POSITION (cockpit-integrated)
    const radarSize = 250;
    const panelW = radarSize + 16;
    const panelH = radarSize + 70;
    const radarX = this.game.width - radarSize - 22;
    const radarY = this.game.height / 2 - radarSize / 2;
    const radarRadius = radarSize / 2;
    const panelX = radarX - 8;
    const panelY = radarY - 35;
    const skew = 12; // Angle distortion for 3D cockpit integration

    // === 3D ANGLED PERSPECTIVE (right side panel) ===
    // Deep shadow with angle
    ctx.fillStyle = `${this.game.PALETTE.deepBlack}dd`;
    ctx.beginPath();
    ctx.moveTo(panelX + 10, panelY + 8);
    ctx.lineTo(panelX + panelW + skew, panelY + 8);
    ctx.lineTo(panelX + panelW + 10, panelY + panelH + 8);
    ctx.lineTo(panelX + 10, panelY + panelH + 8);
    ctx.closePath();
    ctx.fill();

    // Main panel body with trapezoid (angles to right)
    ctx.fillStyle = '#1a1a22';
    ctx.beginPath();
    ctx.moveTo(panelX, panelY);
    ctx.lineTo(panelX + panelW + skew, panelY);
    ctx.lineTo(panelX + panelW, panelY + panelH);
    ctx.lineTo(panelX, panelY + panelH);
    ctx.closePath();
    ctx.fill();

    // Left edge highlight (3D lighting)
    ctx.strokeStyle = '#252530';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(panelX + 2, panelY + 10);
    ctx.lineTo(panelX + 2, panelY + panelH - 10);
    ctx.stroke();

    // === ANGLED BORDER ===
    ctx.strokeStyle = '#0f0f12';
    ctx.lineWidth = 10;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    ctx.strokeStyle = '#1a1a22';
    ctx.lineWidth = 8;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    ctx.strokeStyle = '#252530';
    ctx.lineWidth = 6;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // === RUST TEXTURES ===
    const rustColors = ['#442211', '#332211', '#553322'];
    for (let i = 0; i < 15; i++) {
      const rx = panelX + Math.random() * panelW;
      const ry = panelY + Math.random() * panelH;
      const rsize = Math.random() * 5 + 2;
      ctx.globalAlpha = 0.25 + Math.random() * 0.25;
      ctx.fillStyle = rustColors[Math.floor(Math.random() * rustColors.length)];
      ctx.fillRect(rx, ry, rsize, rsize);
    }
    ctx.globalAlpha = 1.0;

    // === RIVETS ===
    const rivetPos = [
      {x: panelX + 15, y: panelY + 12},
      {x: panelX + panelW - 15, y: panelY + 12},
      {x: panelX + 15, y: panelY + panelH - 12},
      {x: panelX + panelW - 15, y: panelY + panelH - 12},
      {x: panelX + 12, y: panelY + panelH / 2},
      {x: panelX + panelW - 12, y: panelY + panelH / 2}
    ];

    for (const pos of rivetPos) {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pos.x + 0.5, pos.y + 0.5, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.arc(pos.x - 0.5, pos.y - 0.5, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // === MAIN BORDER (NO GREEN, matches other panels) ===
    ctx.strokeStyle = '#0f0f15';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8);

    // Panel extends to right edge (connected look)
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(panelX + panelW, panelY + panelH / 4, this.game.width - (panelX + panelW), panelH / 2);

    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + panelW, panelY + panelH / 4, this.game.width - (panelX + panelW), panelH / 2);

    // Radar title (BIGGER, more analog-like)
    ctx.fillStyle = '#aaaacc';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RADAR SCOPE', radarX + radarRadius, radarY - 12);
    ctx.textAlign = 'left';

    // Radar screen background (circular CRT display)
    ctx.save();
    ctx.beginPath();
    ctx.arc(radarX + radarRadius, radarY + radarRadius, radarRadius - 8, 0, Math.PI * 2);
    ctx.clip();

    // Dark background with green tint (CRT phosphor)
    ctx.fillStyle = `${this.game.PALETTE.voidBlack}ee`;
    ctx.fillRect(radarX, radarY, radarSize, radarSize);

    // CRT phosphor glow overlay
    const glowGrad = ctx.createRadialGradient(
      radarX + radarRadius, radarY + radarRadius, 0,
      radarX + radarRadius, radarY + radarRadius, radarRadius
    );
    glowGrad.addColorStop(0, `${this.game.PALETTE.statusGreen}11`);
    glowGrad.addColorStop(0.7, `${this.game.PALETTE.statusGreen}05`);
    glowGrad.addColorStop(1, `${this.game.PALETTE.voidBlack}aa`);
    ctx.fillStyle = glowGrad;
    ctx.fillRect(radarX, radarY, radarSize, radarSize);

    ctx.restore();

    // Circular border for radar screen
    ctx.strokeStyle = this.game.PALETTE.statusGreen;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(radarX + radarRadius, radarY + radarRadius, radarRadius - 8, 0, Math.PI * 2);
    ctx.stroke();

    // CRT scanlines on radar

    // Check scene and render appropriate radar view
    if (this.game.scene === 'interstellar') {
      this.renderInterstellarRadar(ctx, radarX, radarY, radarSize, radarRadius);
      return;
    }

    // === STAR SYSTEM RADAR ===

    // Dynamic radar range - covers approximately half the star system
    // Small system: 8000px radius → 4000px range
    // Medium system: 12000px radius → 6000px range
    // Large system: 20000px radius → 10000px range
    const systemRadius = this.game.currentSystemData ? getSystemSize(this.game.currentSystemData.starType) : 12000;
    const radarRange = Math.floor(systemRadius * 0.5);

    // Distance circles with labels
    ctx.strokeStyle = `${this.game.PALETTE.statusBlue}33`;
    ctx.lineWidth = 1;
    ctx.font = '8px DigitalDisco, monospace';
    ctx.fillStyle = `${this.game.PALETTE.mediumGray}99`;
    for (let i = 1; i <= 4; i++) {
      const ringRadius = radarRadius * i / 4;
      ctx.beginPath();
      ctx.arc(radarX + radarRadius, radarY + radarRadius, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Distance labels
      const distance = Math.floor(radarRange * i / 4);
      ctx.fillText(`${distance}`, radarX + radarRadius + 2, radarY + radarRadius - ringRadius + 4);
    }

    // Crosshair
    ctx.strokeStyle = `${this.game.PALETTE.statusBlue}55`;
    ctx.beginPath();
    ctx.moveTo(radarX + radarRadius, radarY);
    ctx.lineTo(radarX + radarRadius, radarY + radarSize);
    ctx.moveTo(radarX, radarY + radarRadius);
    ctx.lineTo(radarX + radarSize, radarY + radarRadius);
    ctx.stroke();

    // Sweep effect
    const sweepAngle = (this.game.time * 2) % (Math.PI * 2);
    ctx.save();
    ctx.translate(radarX + radarRadius, radarY + radarRadius);
    const sweepGrad = ctx.createLinearGradient(0, 0, Math.cos(sweepAngle) * radarRadius, Math.sin(sweepAngle) * radarRadius);
    sweepGrad.addColorStop(0, `${this.game.PALETTE.statusBlue}00`);
    sweepGrad.addColorStop(0.8, `${this.game.PALETTE.statusBlue}44`);
    sweepGrad.addColorStop(1, `${this.game.PALETTE.statusBlue}88`);
    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radarRadius - 2, sweepAngle, sweepAngle + Math.PI / 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Player
    ctx.fillStyle = this.game.PALETTE.statusGreen;
    ctx.beginPath();
    ctx.arc(radarX + radarRadius, radarY + radarRadius, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.game.PALETTE.statusGreen;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(radarX + radarRadius, radarY + radarRadius, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Heading indicator
    ctx.strokeStyle = this.game.PALETTE.statusGreen;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(radarX + radarRadius, radarY + radarRadius);
    ctx.lineTo(
      radarX + radarRadius + Math.cos(this.game.player.rotation) * 18,
      radarY + radarRadius + Math.sin(this.game.player.rotation) * 18
    );
    ctx.stroke();

    // Star
    const starDx = this.game.star.x - this.game.player.x;
    const starDy = this.game.star.y - this.game.player.y;
    const starDist = Math.sqrt(starDx * starDx + starDy * starDy);

    if (starDist < radarRange) {
      const scale = (radarRadius - 15) / radarRange;
      const rx = radarX + radarRadius + starDx * scale;
      const ry = radarY + radarRadius + starDy * scale;

      ctx.fillStyle = this.game.PALETTE.starYellow;
      ctx.beginPath();
      ctx.arc(rx, ry, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Planets (enhanced with moon indicators)
    for (const planet of this.game.planets) {
      const px = this.game.star.x + Math.cos(planet.angle) * planet.distance;
      const py = this.game.star.y + Math.sin(planet.angle) * planet.distance;
      const dx = px - this.game.player.x;
      const dy = py - this.game.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radarRange) {
        const scale = (radarRadius - 15) / radarRange;
        const rx = radarX + radarRadius + dx * scale;
        const ry = radarY + radarRadius + dy * scale;

        // Planet dot
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI * 2);
        ctx.fill();

        // Ring indicator for gas giants
        if (planet.hasRings) {
          ctx.strokeStyle = `${planet.ringColor}aa`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(rx, ry, 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Moon count indicator
        if (planet.moons && planet.moons.length > 0) {
          ctx.fillStyle = `${this.game.PALETTE.mediumGray}cc`;
          ctx.font = '7px DigitalDisco, monospace';
          ctx.fillText(`${planet.moons.length}`, rx + 5, ry - 4);
        }
      }
    }

    // Stations
    for (const station of this.game.stations) {
      const sx = this.game.star.x + Math.cos(station.angle) * station.distance;
      const sy = this.game.star.y + Math.sin(station.angle) * station.distance;
      const dx = sx - this.game.player.x;
      const dy = sy - this.game.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radarRange) {
        const scale = (radarRadius - 15) / radarRange;
        const rx = radarX + radarRadius + dx * scale;
        const ry = radarY + radarRadius + dy * scale;

        ctx.fillStyle = this.game.PALETTE.warpBlue;
        ctx.fillRect(rx - 3, ry - 3, 6, 6);
      }
    }

    // Megastructures
    if (this.game.megastructures) {
      for (const mega of this.game.megastructures) {
        const dx = mega.x - this.game.player.x;
        const dy = mega.y - this.game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radarRange) {
          const scale = (radarRadius - 15) / radarRange;
          const rx = radarX + radarRadius + dx * scale;
          const ry = radarY + radarRadius + dy * scale;

          // Large diamond icon for megastructures
          ctx.strokeStyle = this.game.PALETTE.warpBlue;
          ctx.fillStyle = `${this.game.PALETTE.warpBlue}66`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx, ry - 6);
          ctx.lineTo(rx + 5, ry);
          ctx.lineTo(rx, ry + 6);
          ctx.lineTo(rx - 5, ry);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    // Asteroids (only show nearby ones to avoid clutter)
    let asteroidCount = 0;
    for (const asteroid of this.game.asteroids) {
      if (asteroidCount >= 20) break; // Limit to 20 nearest asteroids

      const ax = this.game.star.x + Math.cos(asteroid.angle) * asteroid.distance;
      const ay = this.game.star.y + Math.sin(asteroid.angle) * asteroid.distance;
      const dx = ax - this.game.player.x;
      const dy = ay - this.game.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radarRange * 0.3) { // Only show if within 30% of radar range
        const scale = (radarRadius - 15) / radarRange;
        const rx = radarX + radarRadius + dx * scale;
        const ry = radarY + radarRadius + dy * scale;

        ctx.fillStyle = `${this.game.PALETTE.mediumGray}88`;
        ctx.beginPath();
        ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
        ctx.fill();
        asteroidCount++;
      }
    }

    // Comets
    if (this.game.comets) {
      for (const comet of this.game.comets) {
        const cx = this.game.star.x + Math.cos(comet.angle) * comet.distance;
        const cy = this.game.star.y + Math.sin(comet.angle) * comet.distance;
        const dx = cx - this.game.player.x;
        const dy = cy - this.game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radarRange) {
          const scale = (radarRadius - 15) / radarRange;
          const rx = radarX + radarRadius + dx * scale;
          const ry = radarY + radarRadius + dy * scale;

          // Comet with tail indicator
          ctx.fillStyle = this.game.PALETTE.starWhite;
          ctx.beginPath();
          ctx.arc(rx, ry, 2, 0, Math.PI * 2);
          ctx.fill();

          // Tail
          const tailAngle = comet.angle + Math.PI;
          ctx.strokeStyle = `${this.game.PALETTE.starWhite}55`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + Math.cos(tailAngle) * 4, ry + Math.sin(tailAngle) * 4);
          ctx.stroke();
        }
      }
    }

    // Enemies
    for (const enemy of this.game.enemies) {
      const dx = enemy.x - this.game.player.x;
      const dy = enemy.y - this.game.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radarRange) {
        const scale = (radarRadius - 15) / radarRange;
        const rx = radarX + radarRadius + dx * scale;
        const ry = radarY + radarRadius + dy * scale;

        // Blinking effect
        if (Math.floor(this.game.time * 4) % 2 === 0) {
          ctx.fillStyle = this.game.PALETTE.alertRed;
          ctx.beginPath();
          ctx.moveTo(rx, ry - 4);
          ctx.lineTo(rx - 3, ry + 3);
          ctx.lineTo(rx + 3, ry + 3);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Label with enhanced info (BIGGER)
    ctx.fillStyle = this.game.PALETTE.statusBlue;
    ctx.font = 'bold 13px monospace';
    ctx.fillText('RADAR', radarX + 8, radarY + 18);
    ctx.font = '11px DigitalDisco, monospace';
    ctx.fillStyle = this.game.PALETTE.mediumGray;

    // Show range in km (BIGGER)
    const rangeKm = (radarRange / 100).toFixed(1);
    ctx.fillText(`${rangeKm}km`, radarX + radarSize - 50, radarY + 18);

    // System coverage indicator (BIGGER)
    ctx.fillText('50%', radarX + 8, radarY + radarSize - 6);

    // === ENHANCED COCKPIT DETAILS ===

    // Three small analog gauges below radar
    const gaugeY = radarY + radarSize + 15;
    const gaugeSize = 35;
    const gaugeSpacing = 40;
    const gaugeStartX = radarX + radarRadius - gaugeSize - gaugeSpacing;

    // Calculate target distance for first gauge
    let targetDist = 0;
    if (this.game.enemies && this.game.enemies.length > 0) {
      const enemy = this.game.enemies[0];
      const dx = enemy.x - this.game.player.x;
      const dy = enemy.y - this.game.player.y;
      targetDist = Math.sqrt(dx * dx + dy * dy) / 100;
    }

    // Gauge 1: Target Distance
    this.renderRadarMiniGauge(ctx, gaugeStartX, gaugeY, gaugeSize, 'DST', Math.min(targetDist, 100), 0, 100, this.game.PALETTE.statusBlue);

    // Gauge 2: Player Speed
    const speed = Math.sqrt(this.game.player.dx * this.game.player.dx + this.game.player.dy * this.game.player.dy) * 2;
    this.renderRadarMiniGauge(ctx, gaugeStartX + gaugeSpacing, gaugeY, gaugeSize, 'SPD', Math.min(speed, 100), 0, 100, this.game.PALETTE.warpBlue);

    // Gauge 3: Bearing
    const bearing = ((this.game.player.rotation * 180 / Math.PI) + 360) % 360;
    this.renderRadarMiniGauge(ctx, gaugeStartX + gaugeSpacing * 2, gaugeY, gaugeSize, 'HDG', bearing, 0, 360, this.game.PALETTE.statusGreen);

    // === SIGNAL STRENGTH LEDs (right side of panel) ===
    const ledX = panelX + panelW - 15;
    const ledStartY = panelY + 40;
    const ledSpacing = 12;
    const signalLEDs = 5;

    // Calculate signal strength based on nearby objects
    const nearbyObjects = this.game.enemies.length + (this.game.scene === 'interstellar' ? 0 : this.game.planets.length);
    const signalStrength = Math.min(signalLEDs, Math.floor(nearbyObjects / 2) + 1);

    ctx.font = '8px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#555566';
    ctx.fillText('SIG', ledX + 2, ledStartY - 8);
    ctx.textAlign = 'left';

    for (let i = 0; i < signalLEDs; i++) {
      const ledY = ledStartY + i * ledSpacing;
      const isActive = i < signalStrength;

      // LED bezel
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(ledX - 3, ledY - 3, 6, 6);

      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 1;
      ctx.strokeRect(ledX - 3, ledY - 3, 6, 6);

      // LED light
      if (isActive) {
        const ledColor = i < 2 ? '#44aa44' : i < 4 ? '#aaaa44' : '#aa4444';
        ctx.fillStyle = ledColor;
        ctx.fillRect(ledX - 2, ledY - 2, 4, 4);

        ctx.shadowColor = ledColor;
        ctx.shadowBlur = 3;
        ctx.fillRect(ledX - 2, ledY - 2, 4, 4);
        ctx.shadowBlur = 0;
      }
    }

    // === ADDITIONAL PANEL TEXTURE ===
    // More rivets around the edges
    const additionalRivets = [
      {x: panelX + panelW / 3, y: panelY + 8},
      {x: panelX + (panelW / 3) * 2, y: panelY + 8},
      {x: panelX + panelW / 3, y: panelY + panelH - 8},
      {x: panelX + (panelW / 3) * 2, y: panelY + panelH - 8},
      {x: panelX + 8, y: panelY + panelH / 3},
      {x: panelX + 8, y: panelY + (panelH / 3) * 2}
    ];

    for (const pos of additionalRivets) {
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pos.x + 0.5, pos.y + 0.5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Panel identification text
    ctx.fillStyle = `${this.game.PALETTE.mediumGray}44`;
    ctx.font = '6px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('PANEL-02', panelX + panelW - 5, panelY + 12);
    ctx.textAlign = 'left';

    // === WARNING STRIPE (top of panel) ===
    const stripeY = panelY + 3;
    const stripeSegments = 8;
    const stripeSegW = 8;
    for (let i = 0; i < stripeSegments; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#3a3a1a' : '#1a1a1a';
      ctx.fillRect(panelX + 5 + i * stripeSegW, stripeY, stripeSegW, 3);
    }

    // === SERIAL NUMBER LABEL (Retro Industrial Detail) ===
    ctx.fillStyle = `${this.game.PALETTE.mediumGray}66`;
    ctx.font = '7px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SN: RDR-7734-MK2', panelX + panelW / 2, panelY + panelH - 6);
    ctx.textAlign = 'left';
  }

  renderInterstellarRadar(ctx, radarX, radarY, radarSize, radarRadius) {
    // === INTERSTELLAR RADAR ===
    // Shows nearby star systems instead of planets/asteroids

    const radarRange = 5000; // Interstellar radar range in units

    // Distance circles with labels
    ctx.strokeStyle = `${this.game.PALETTE.statusBlue}33`;
    ctx.lineWidth = 1;
    ctx.font = '8px DigitalDisco, monospace';
    ctx.fillStyle = `${this.game.PALETTE.mediumGray}99`;
    for (let i = 1; i <= 4; i++) {
      const ringRadius = radarRadius * i / 4;
      ctx.beginPath();
      ctx.arc(radarX + radarRadius, radarY + radarRadius, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Distance labels
      const distance = Math.floor(radarRange * i / 4);
      ctx.fillText(`${distance}`, radarX + radarRadius + 2, radarY + radarRadius - ringRadius + 4);
    }

    // Crosshair
    ctx.strokeStyle = `${this.game.PALETTE.statusBlue}55`;
    ctx.beginPath();
    ctx.moveTo(radarX + radarRadius, radarY);
    ctx.lineTo(radarX + radarRadius, radarY + radarSize);
    ctx.moveTo(radarX, radarY + radarRadius);
    ctx.lineTo(radarX + radarSize, radarY + radarRadius);
    ctx.stroke();

    // Sweep effect
    const sweepAngle = (this.game.time * 2) % (Math.PI * 2);
    ctx.save();
    ctx.translate(radarX + radarRadius, radarY + radarRadius);
    const sweepGrad = ctx.createLinearGradient(0, 0, Math.cos(sweepAngle) * radarRadius, Math.sin(sweepAngle) * radarRadius);
    sweepGrad.addColorStop(0, `${this.game.PALETTE.statusBlue}00`);
    sweepGrad.addColorStop(0.8, `${this.game.PALETTE.statusBlue}44`);
    sweepGrad.addColorStop(1, `${this.game.PALETTE.statusBlue}88`);
    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radarRadius - 2, sweepAngle, sweepAngle + Math.PI / 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Player (center)
    ctx.fillStyle = this.game.PALETTE.statusGreen;
    ctx.beginPath();
    ctx.arc(radarX + radarRadius, radarY + radarRadius, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.game.PALETTE.statusGreen;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(radarX + radarRadius, radarY + radarRadius, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Heading indicator
    ctx.strokeStyle = this.game.PALETTE.statusGreen;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(radarX + radarRadius, radarY + radarRadius);
    ctx.lineTo(
      radarX + radarRadius + Math.cos(this.game.player.rotation) * 18,
      radarY + radarRadius + Math.sin(this.game.player.rotation) * 18
    );
    ctx.stroke();

    // Render nearby star systems
    if (this.game.galaxy && this.game.galaxy.length > 0) {
      for (let i = 0; i < this.game.galaxy.length; i++) {
        const system = this.game.galaxy[i];
        const dx = system.x - this.game.interstellarPlayerX;
        const dy = system.y - this.game.interstellarPlayerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radarRange) {
          const scale = (radarRadius - 15) / radarRange;
          const rx = radarX + radarRadius + dx * scale;
          const ry = radarY + radarRadius + dy * scale;

          // Current system (where player came from) - green
          if (i === this.game.currentSystemIndex) {
            ctx.fillStyle = this.game.PALETTE.statusGreen;
            ctx.strokeStyle = this.game.PALETTE.statusGreen;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(rx, ry, 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = `${this.game.PALETTE.statusGreen}66`;
            ctx.fill();
          } else {
            // Other systems - color by star type
            let systemColor = this.game.PALETTE.starYellow; // Default
            if (system.starType) {
              if (system.starType.includes('Red')) systemColor = '#ff6644';
              else if (system.starType.includes('Blue')) systemColor = '#6699ff';
              else if (system.starType.includes('White')) systemColor = '#ffffff';
            }

            // Discovered systems are brighter
            const discovered = this.game.discoveredSystems.has(system.seed || i);
            const alpha = discovered ? 'ff' : '88';

            ctx.fillStyle = systemColor + alpha;
            ctx.beginPath();
            ctx.arc(rx, ry, 3, 0, Math.PI * 2);
            ctx.fill();

            // Highlight undiscovered systems with pulsing effect
            if (!discovered && Math.floor(this.game.time * 3) % 2 === 0) {
              ctx.strokeStyle = `${this.game.PALETTE.warpBlue}aa`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(rx, ry, 5, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }
      }
    }

    // Label
    ctx.fillStyle = this.game.PALETTE.statusBlue;
    ctx.font = 'bold 11px monospace';
    ctx.fillText('NAV', radarX + 8, radarY + 18);
    ctx.font = '9px DigitalDisco, monospace';
    ctx.fillStyle = this.game.PALETTE.mediumGray;

    // Show range
    const rangeKm = (radarRange / 100).toFixed(1);
    ctx.fillText(`${rangeKm}km`, radarX + radarSize - 50, radarY + 18);

    // Show system count
    const nearbyCount = this.game.galaxy ? this.game.galaxy.filter(s => {
      const dx = s.x - this.game.interstellarPlayerX;
      const dy = s.y - this.game.interstellarPlayerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < radarRange;
    }).length : 0;
    ctx.fillText(`${nearbyCount}`, radarX + 8, radarY + radarSize - 6);
  }

  // COCKPIT UI REDESIGN: Comprehensive control desk with analog devices and complex monitors
  renderBottomConsole() {
    const ctx = this.game.ctx;
    const p = this.game.player;

    // Reset button tracking
    this.game.damageControlButtons = [];

    // 20px desk layer extending beyond panels
    const underlayH = 20;
    const underlayY = this.game.height - underlayH;
    const underlayExtend = 40; // How far it extends beyond panel edges

    // Underlay desk layer (visible on sides)
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, underlayY, underlayExtend, underlayH);
    ctx.fillRect(this.game.width - underlayExtend, underlayY, underlayExtend, underlayH);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, underlayY, underlayExtend, underlayH);
    ctx.strokeRect(this.game.width - underlayExtend, underlayY, underlayExtend, underlayH);

    // Rivets on underlay
    for (let i = 0; i < 3; i++) {
      const y = underlayY + 5 + i * 5;
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(10, y, 3, 2);
      ctx.fillRect(this.game.width - 13, y, 3, 2);
    }

    // Wide control desk measurements
    const deskW = this.game.width * 0.95;
    const deskH = 220;
    const deskX = this.game.width * 0.025;
    const deskY = this.game.height - deskH - underlayH - 5;

    // Render the main control desk base
    this.renderControlDesk(ctx, deskX, deskY, deskW, deskH);

    // Calculate section positions - different widths and heights
    const leftW = 350;
    const leftH = 180; // Different height
    const centerW = 450;
    const centerH = 170; // Different height
    const rightW = 380;
    const rightH = 190; // Different height
    const spacing = (deskW - leftW - centerW - rightW) / 4;

    const leftX = deskX + spacing;
    const centerX = leftX + leftW + spacing;
    const rightX = centerX + centerW + spacing;

    // Render three main sections with different heights
    this.renderLeftSection(ctx, leftX, deskY + (deskH - leftH) / 2, leftW, leftH);
    this.renderCenterSection(ctx, centerX, deskY + (deskH - centerH) / 2, centerW, centerH);
    this.renderRightSection(ctx, rightX, deskY + (deskH - rightH) / 2, rightW, rightH);
  }

  // Control Desk Base - wide angled platform connecting to ship interior
  renderControlDesk(ctx, x, y, w, h) {
    const skew = 30; // Angle connecting to ship sides

    // === MULTI-LAYER DEPTH ===
    // Deepest shadow layer
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x - skew + 10, y + 10);
    ctx.lineTo(x + w + skew + 10, y + 10);
    ctx.lineTo(x + w + 10, y + h + 10);
    ctx.lineTo(x + 10, y + h + 10);
    ctx.closePath();
    ctx.fill();

    // Middle shadow layer
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.moveTo(x - skew + 5, y + 5);
    ctx.lineTo(x + w + skew + 5, y + 5);
    ctx.lineTo(x + w + 5, y + h + 5);
    ctx.lineTo(x + 5, y + h + 5);
    ctx.closePath();
    ctx.fill();

    // === MAIN DESK BODY ===
    ctx.fillStyle = '#1a1a24';
    ctx.beginPath();
    ctx.moveTo(x - skew, y);
    ctx.lineTo(x + w + skew, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    // === TEXTURE DETAILS ===
    // Panel lines
    ctx.strokeStyle = '#0f0f15';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const lineY = y + 20 + i * 40;
      ctx.beginPath();
      ctx.moveTo(x - skew + 10, lineY);
      ctx.lineTo(x + w + skew - 10, lineY);
      ctx.stroke();
    }

    // Vertical dividers
    const sections = 3;
    for (let i = 1; i < sections; i++) {
      const lineX = x + (w / sections) * i;
      ctx.beginPath();
      ctx.moveTo(lineX, y + 10);
      ctx.lineTo(lineX, y + h - 10);
      ctx.stroke();
    }

    // === RIVETS (40+ for texture) ===
    const rivetPositions = [];
    // Top edge rivets
    for (let i = 0; i < 12; i++) {
      rivetPositions.push({x: x + (w / 12) * i + 20, y: y + 12});
    }
    // Bottom edge rivets
    for (let i = 0; i < 12; i++) {
      rivetPositions.push({x: x + (w / 12) * i + 20, y: y + h - 12});
    }
    // Left edge rivets
    for (let i = 1; i < 5; i++) {
      rivetPositions.push({x: x + 15, y: y + (h / 5) * i});
    }
    // Right edge rivets
    for (let i = 1; i < 5; i++) {
      rivetPositions.push({x: x + w - 15, y: y + (h / 5) * i});
    }

    for (const rivet of rivetPositions) {
      // Rivet shadow
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(rivet.x + 1, rivet.y + 1, 2, 0, Math.PI * 2);
      ctx.fill();

      // Rivet body
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(rivet.x, rivet.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Rivet highlight
      ctx.fillStyle = '#3a3a3a';
      ctx.beginPath();
      ctx.arc(rivet.x - 0.5, rivet.y - 0.5, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // === WEAR MARKS AND SCRATCHES ===
    ctx.globalAlpha = 0.2;
    const wearColors = ['#2a2a2a', '#333333', '#252525'];
    for (let i = 0; i < 30; i++) {
      const wx = x + Math.random() * w;
      const wy = y + Math.random() * h;
      const ww = Math.random() * 15 + 5;
      const wh = Math.random() * 2 + 1;
      ctx.fillStyle = wearColors[Math.floor(Math.random() * wearColors.length)];
      ctx.fillRect(wx, wy, ww, wh);
    }
    ctx.globalAlpha = 1.0;

    // === WARNING STRIPS (corners) ===
    const stripW = 60;
    const stripH = 8;
    const stripPattern = ['#3a3a1a', '#1a1a1a'];

    // Top left warning strip
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = stripPattern[i % 2];
      ctx.fillRect(x + 20 + i * 10, y + 5, 10, stripH);
    }

    // Top right warning strip
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = stripPattern[i % 2];
      ctx.fillRect(x + w - 80 + i * 10, y + 5, 10, stripH);
    }

    // === EDGE HIGHLIGHTS (3D lighting) ===
    ctx.strokeStyle = '#2a2a35';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - skew + 2, y + 2);
    ctx.lineTo(x + w + skew - 2, y + 2);
    ctx.stroke();

    // === ENHANCED: Desk decorations ===
    // Serial identification plates
    this.drawSerialPlate(ctx, x + 40, y + 8, 80, 12, 'COCKPIT-DESK-MAIN');
    this.drawSerialPlate(ctx, x + w - 120, y + 8, 80, 12, 'MOD-REV-2.1.7');

    // Large corner screws
    this.drawScrew(ctx, x + 20, y + 15, 4);
    this.drawScrew(ctx, x + w - 20, y + 15, 4);
    this.drawScrew(ctx, x + 20, y + h - 15, 4);
    this.drawScrew(ctx, x + w - 20, y + h - 15, 4);

    // Welding seams at section dividers
    const sectionDividers = [x + w / 3, x + w * 2 / 3];
    for (const divX of sectionDividers) {
      this.drawWeldMarks(ctx, divX, y + 10, divX, y + h - 10);
    }
  }

  // LEFT SECTION: Damage control monitor, analog gauges, and side decorations
  // LEFT SECTION: Damage control monitor, analog gauges, and side decorations
  renderLeftSection(ctx, x, y, w, h) {
    if (!this.game.shipDamageSystem) return;

    // Split into damage monitor (left) and gauges (right)
    const monW = 260;
    const gaugeW = w - monW - 20;

    // Damage control monitor
    this.renderDamageMonitor(ctx, x, y, monW, h);

    // Three analog gauges stacked vertically
    const gaugeH = (h - 20) / 3;
    const gaugeX = x + monW + 20;

    const temp = this.game.player.temperature || 20;
    const rad = this.game.player.radiationLevel || 0;
    const power = this.game.player.power || 0;
    const maxPower = this.game.player.maxPower || 100;

    this.renderAnalogGauge(ctx, gaugeX, y, gaugeW, gaugeH - 5, 'TEMP', temp, 0, 100, temp > 60 ? '#aa4444' : '#4488aa');
    this.renderAnalogGauge(ctx, gaugeX, y + gaugeH + 5, gaugeW, gaugeH - 5, 'RAD', rad, 0, 100, rad > 50 ? '#aa5544' : '#6677aa');
    this.renderAnalogGauge(ctx, gaugeX, y + gaugeH * 2 + 10, gaugeW, gaugeH - 5, 'PWR', power, 0, maxPower, '#aa8844');

    // Decorative side panels
    this.renderSideDecoration(ctx, x - 15, y + h / 2 - 30, 10, 60);
  }

  // Damage control monitor with tilted CRT - trapezoid shape
  renderDamageMonitor(ctx, x, y, w, h) {
    const topW = w - 20; // Narrower at top
    const tilt = 15; // Stronger backward tilt

    // === CHASSIS - trapezoid shape ===
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.moveTo(x + 10 + 4, y + 4);
    ctx.lineTo(x + w - 10 + 4, y + 4);
    ctx.lineTo(x + w + 4, y + h + 4);
    ctx.lineTo(x + 4, y + h + 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1a1a24';
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + w - 10, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#0f0f15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + w - 10, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.stroke();

    // === TILTED CRT MONITOR - narrower at top ===
    const margin = 12;
    const monX = x + margin;
    const monY = y + margin + 8;
    const monW = w - margin * 2;
    const monH = h - margin * 2 - 8;

    // Monitor bezel - trapezoid tilted backward
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(monX + 15, monY);
    ctx.lineTo(monX + monW - 15, monY);
    ctx.lineTo(monX + monW, monY + monH);
    ctx.lineTo(monX, monY + monH);
    ctx.closePath();
    ctx.fill();

    // Screen - trapezoid tilted backward
    ctx.fillStyle = '#0d0e14';
    ctx.beginPath();
    ctx.moveTo(monX + 17, monY + 2);
    ctx.lineTo(monX + monW - 17, monY + 2);
    ctx.lineTo(monX + monW - 2, monY + monH - 2);
    ctx.lineTo(monX + 2, monY + monH - 2);
    ctx.closePath();
    ctx.fill();

    // Scanlines
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    for (let i = 0; i < monH - 4; i += 2) {
      const yPos = monY + 2 + i;
      const topOffset = 15 - (i / monH) * 15;
      ctx.beginPath();
      ctx.moveTo(monX + 2 + topOffset, yPos);
      ctx.lineTo(monX + monW - 2 - topOffset, yPos);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // === TITLE (BIGGER) ===
    ctx.fillStyle = '#aa4444';
    ctx.font = 'bold 11px monospace';
    const titleY = monY + 15;
    const titleX = monX + monW / 2;
    ctx.textAlign = 'center';
    ctx.fillText('DAMAGE CONTROL', titleX, titleY);
    ctx.textAlign = 'left';

    // === DAMAGE BARS (BIGGER TEXT) ===
    const sections = Object.values(this.game.shipDamageSystem.sections);
    const barStartY = monY + 28;
    const barH = (monH - 35) / sections.length;

    ctx.font = 'bold 9px monospace';

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const healthPercent = (section.currentHealth / section.maxHealth) * 100;
      const barY = barStartY + i * barH;
      const progressInMonitor = (barY - monY) / monH;
      const tiltOffset = 15 - progressInMonitor * 15; // Trapezoid offset
      const barX = monX + 6 + tiltOffset;

      // Determine color
      let barColor, glowColor;
      if (healthPercent < 30) {
        barColor = '#4a1a1a';
        glowColor = '#ff4444';
      } else if (healthPercent < 60) {
        barColor = '#4a3a1a';
        glowColor = '#ff8844';
      } else {
        barColor = '#1a2a3a';
        glowColor = '#4488ff';
      }

      // Section name (BIGGER)
      ctx.fillStyle = '#aaaacc';
      ctx.fillText(section.name.toUpperCase().substring(0, 9), barX, barY - 2);

      // Bar frame
      const barW = monW - tiltOffset - 70;
      const barInnerH = 8;
      ctx.fillStyle = '#000000';
      ctx.fillRect(barX, barY, barW, barInnerH);

      // Segmented bar (5 segments)
      const segW = (barW - 8) / 5;
      for (let seg = 0; seg < 5; seg++) {
        const segX = barX + 2 + seg * segW;
        if (healthPercent > (seg * 20)) {
          ctx.fillStyle = barColor;
          ctx.fillRect(segX, barY + 1, segW - 2, barInnerH - 2);
          ctx.fillStyle = glowColor + '33';
          ctx.fillRect(segX + 1, barY + 2, segW - 4, 2);
        }
      }

      // Border
      ctx.strokeStyle = '#1a1a22';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barInnerH);

      // Repair button (BIGGER TEXT)
      if (!section.destroyed && section.currentHealth < section.maxHealth) {
        const btnW = 42;
        const btnH = 11;
        const btnX = barX + barW + 3;
        const btnY = barY - 1;

        ctx.fillStyle = section.repairing ? '#2a2a3a' : '#1a1a22';
        ctx.fillRect(btnX, btnY, btnW, btnH);

        ctx.strokeStyle = '#3a3a4a';
        ctx.lineWidth = 1;
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        ctx.fillStyle = section.repairing ? '#6688aa' : '#556677';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(section.repairing ? 'REPR' : 'FIX', btnX + btnW / 2, btnY + 8);
        ctx.textAlign = 'left';

        if (!section.repairing) {
          this.game.damageControlButtons.push({
            x: btnX,
            y: btnY,
            w: btnW,
            h: btnH,
            action: () => this.game.shipDamageSystem.startRepair(Object.keys(this.game.shipDamageSystem.sections).find(key => this.game.shipDamageSystem.sections[key] === section))
          });
        }
      }
    }

    // Critical warning indicator
    const criticalCount = this.game.shipDamageSystem.getCriticalSections().length;
    if (criticalCount > 0 && Math.floor(this.game.time * 4) % 2 === 0) {
      ctx.fillStyle = '#aa3333';
      ctx.fillRect(x + w - 10, y + 6, 5, 5);
    }

    // === ENHANCED: CRT Glass overlay ===
    this.drawCRTGlassOverlay(ctx, monX + 17, monY + 2, monW - 34, monH - 4, true, 15);

    // === ENHANCED: Chassis decorations ===
    // Serial plate on chassis
    this.drawSerialPlate(ctx, x + 8, y + h - 18, 60, 12, 'DMG-CTRL-01');

    // Screws on chassis corners
    this.drawScrew(ctx, x + 15, y + 8, 3);
    this.drawScrew(ctx, x + w - 15, y + 8, 3);
    this.drawScrew(ctx, x + 15, y + h - 8, 3);
    this.drawScrew(ctx, x + w - 15, y + h - 8, 3);

    // Welding seams along chassis edges
    this.drawWeldMarks(ctx, x + 10, y, x + w - 10, y);
    this.drawWeldMarks(ctx, x, y + h, x + w, y + h);

    // Status indicator lights
    this.drawIndicatorLight(ctx, x + w - 20, y + h / 2, 3, '#aa7744', 'PWR', true);
    this.drawIndicatorLight(ctx, x + w - 20, y + h / 2 + 18, 3, criticalCount > 0 ? '#aa4444' : '#7799aa', 'SYS', criticalCount === 0);
  }

  // CENTER SECTION: Dual monitors with ship systems and oscilloscope
  renderCenterSection(ctx, x, y, w, h) {
    const p = this.game.player;

    // Single wide monitor for ship systems
    this.renderSystemsMonitor(ctx, x, y, w, h);
  }

  // Systems monitor showing 10+ ship systems - hexagonal top shape
  renderSystemsMonitor(ctx, x, y, w, h) {
    const p = this.game.player;

    // === CHASSIS - hexagonal top shape ===
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y);
    ctx.lineTo(x + w * 0.8, y);
    ctx.lineTo(x + w, y + 20);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + 20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1a1a24';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2 - 3, y - 3);
    ctx.lineTo(x + w * 0.8 + 3, y - 3);
    ctx.lineTo(x + w + 3, y + 17);
    ctx.lineTo(x + w + 3, y + h + 3);
    ctx.lineTo(x - 3, y + h + 3);
    ctx.lineTo(x - 3, y + 17);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#0f0f15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y);
    ctx.lineTo(x + w * 0.8, y);
    ctx.lineTo(x + w, y + 20);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + 20);
    ctx.closePath();
    ctx.stroke();

    // === TILTED CRT MONITOR - narrower at top ===
    const margin = 12;
    const monX = x + margin;
    const monY = y + margin + 10;
    const monW = w - margin * 2;
    const monH = h - margin * 2 - 10;

    // Bezel - trapezoid tilted backward
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(monX + 20, monY);
    ctx.lineTo(monX + monW - 20, monY);
    ctx.lineTo(monX + monW, monY + monH);
    ctx.lineTo(monX, monY + monH);
    ctx.closePath();
    ctx.fill();

    // Screen - trapezoid tilted backward
    ctx.fillStyle = '#0d0e14';
    ctx.beginPath();
    ctx.moveTo(monX + 22, monY + 2);
    ctx.lineTo(monX + monW - 22, monY + 2);
    ctx.lineTo(monX + monW - 2, monY + monH - 2);
    ctx.lineTo(monX + 2, monY + monH - 2);
    ctx.closePath();
    ctx.fill();

    // Scanlines
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    for (let i = 0; i < monH - 4; i += 2) {
      const yPos = monY + 2 + i;
      const topOffset = 20 - (i / monH) * 20;
      ctx.beginPath();
      ctx.moveTo(monX + 2 + topOffset, yPos);
      ctx.lineTo(monX + monW - 2 - topOffset, yPos);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // === TITLE (BIGGER) ===
    ctx.fillStyle = '#6688aa';
    ctx.font = 'bold 12px monospace';
    const titleY = monY + 18;
    const titleX = monX + monW / 2;
    ctx.textAlign = 'center';
    ctx.fillText('SHIP SYSTEMS', titleX, titleY);
    ctx.textAlign = 'left';

    // === SHIP SYSTEMS (BIGGER TEXT) ===
    const temp = p.temperature || 20;
    const rad = p.radiationLevel || 0;
    const cargo = 0; // TODO: Add cargo system
    const nav = 100; // TODO: Add navigation system

    const systems = [
      {name: 'HULL', value: p.hull, max: p.maxHull, color: '#4488aa'},
      {name: 'SHLD', value: p.shields, max: p.maxShields, color: '#6677aa'},
      {name: 'POWR', value: p.power, max: p.maxPower, color: '#aa8844'},
      {name: 'FUEL', value: p.fuel, max: p.maxFuel, color: '#aa7744'},
      {name: 'TEMP', value: temp, max: 100, color: temp > 60 ? '#aa4444' : '#4488aa'},
      {name: 'RAD', value: rad, max: 100, color: rad > 50 ? '#aa5544' : '#6677aa'},
      {name: 'WARP', value: p.warpCooldown > 0 ? (3 - p.warpCooldown) / 3 * 100 : (p.warpCharge || 0) * 100, max: 100, color: '#8866aa'},
      {name: 'ENG', value: 100, max: 100, color: '#5588aa'}, // TODO: Add engine system
      {name: 'REAC', value: 100, max: 100, color: '#88aa55'}, // TODO: Add reactor system
      {name: 'NAV', value: nav, max: 100, color: '#55aa88'},
      {name: 'CRGO', value: cargo, max: 100, color: '#aa8855'},
      {name: 'LIFE', value: 100, max: 100, color: '#88aa88'} // TODO: Add life support
    ];

    // Display in 2 columns (BIGGER TEXT)
    const cols = 2;
    const rows = Math.ceil(systems.length / cols);
    const colW = (monW - 50) / cols;
    const rowH = (monH - 30) / rows;

    ctx.font = 'bold 9px monospace';

    for (let i = 0; i < systems.length; i++) {
      const sys = systems[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const progressInMonitor = (row * rowH + 25) / monH;
      const tiltOffset = 20 - progressInMonitor * 20;  // Trapezoid offset
      const sysX = monX + 10 + col * colW + tiltOffset;
      const sysY = monY + 25 + row * rowH;
      const percent = (sys.value / sys.max) * 100;

      // Name (BIGGER)
      ctx.fillStyle = '#aaaacc';
      ctx.fillText(sys.name, sysX, sysY);

      // Horizontal bar
      const barW = colW - 15;
      const barH = 8;
      const barX = sysX;
      const barY = sysY + 4;

      ctx.fillStyle = '#000000';
      ctx.fillRect(barX, barY, barW, barH);

      // Segments (15 segments for fine detail)
      const segW = (barW - 2) / 15;
      for (let seg = 0; seg < 15; seg++) {
        const segX = barX + 1 + seg * segW;
        if (percent > (seg * 100 / 15)) {
          ctx.fillStyle = sys.color;
          ctx.fillRect(segX, barY + 1, segW - 0.5, barH - 2);
        }
      }

      // Border
      ctx.strokeStyle = '#1a1a22';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      // Value percentage (BIGGER)
      ctx.fillStyle = '#ccccdd';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(Math.floor(percent) + '%', sysX + barW + 3, sysY + 9);
      ctx.font = 'bold 9px monospace';
    }

    // === ENHANCED: CRT Glass overlay ===
    this.drawCRTGlassOverlay(ctx, monX + 22, monY + 2, monW - 44, monH - 4, true, 20);

    // === ENHANCED: Chassis decorations ===
    // Serial plate
    this.drawSerialPlate(ctx, x + w / 2 - 30, y - 8, 60, 12, 'SYS-MON-02');

    // Screws on hexagonal chassis
    this.drawScrew(ctx, x + w * 0.2 + 10, y + 5, 3);
    this.drawScrew(ctx, x + w * 0.8 - 10, y + 5, 3);
    this.drawScrew(ctx, x + 10, y + h - 10, 3);
    this.drawScrew(ctx, x + w - 10, y + h - 10, 3);

    // Welding seams
    this.drawWeldMarks(ctx, x + w * 0.2, y, x + w * 0.8, y);
    this.drawWeldMarks(ctx, x, y + h, x + w, y + h);

    // Multi-color status indicators
    this.drawIndicatorLight(ctx, x + 10, y + 25, 2, '#aa7744', null, true);
    this.drawIndicatorLight(ctx, x + 10, y + 35, 2, '#7799aa', null, p.power > p.maxPower * 0.5);
    this.drawIndicatorLight(ctx, x + 10, y + 45, 2, p.hull < p.maxHull * 0.3 ? '#aa4444' : '#7799aa', null, true);
  }

  // Oscilloscope display with animated waveform
  renderOscilloscope(ctx, x, y, w, h) {
    const tilt = 7;

    // === CHASSIS ===
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x + 4, y + 4, w, h);

    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = '#0f0f15';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // === TILTED MONITOR ===
    const margin = 10;
    const monX = x + margin;
    const monY = y + margin;
    const monW = w - margin * 2;
    const monH = h - margin * 2;

    // Bezel
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(monX, monY);
    ctx.lineTo(monX + monW - tilt, monY);
    ctx.lineTo(monX + monW, monY + monH);
    ctx.lineTo(monX + tilt, monY + monH);
    ctx.closePath();
    ctx.fill();

    // Screen
    ctx.fillStyle = '#0d0e14';
    ctx.beginPath();
    ctx.moveTo(monX + 2, monY + 2);
    ctx.lineTo(monX + monW - tilt - 2, monY + 2);
    ctx.lineTo(monX + monW - 2, monY + monH - 2);
    ctx.lineTo(monX + tilt + 2, monY + monH - 2);
    ctx.closePath();
    ctx.fill();

    // === TITLE ===
    ctx.fillStyle = '#88aa66';
    ctx.font = 'bold 8px monospace';
    const titleY = monY + 12;
    const titleX = monX + monW / 2 - tilt / 2 + (12 / monH) * tilt;
    ctx.textAlign = 'center';
    ctx.fillText('OSCILLOSCOPE', titleX, titleY);
    ctx.textAlign = 'left';

    // === GRID ===
    ctx.strokeStyle = '#1a2a1a';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    // Vertical grid lines
    for (let i = 0; i < 8; i++) {
      const gridX = monX + 5 + (monW - 10 - tilt) * (i / 8);
      ctx.beginPath();
      ctx.moveTo(gridX, monY + 15);
      ctx.lineTo(gridX + (monH - 20) / monH * tilt, monY + monH - 5);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i < 6; i++) {
      const gridY = monY + 15 + (monH - 20) * (i / 6);
      const tiltOffset = (gridY - monY) / monH * tilt;
      ctx.beginPath();
      ctx.moveTo(monX + 5 + tiltOffset, gridY);
      ctx.lineTo(monX + monW - 5 - tilt + tiltOffset, gridY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // === ANIMATED WAVEFORM ===
    const waveStartX = monX + 5;
    const waveY = monY + monH / 2;
    const waveW = monW - 10 - tilt;
    const waveH = (monH - 30) / 2;

    ctx.strokeStyle = '#44aa66';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#44aa66';
    ctx.shadowBlur = 4;

    ctx.beginPath();
    for (let px = 0; px < waveW; px++) {
      const x = waveStartX + px;
      const tiltOffset = ((waveY - monY) / monH) * tilt;
      // Multiple sine waves for complex pattern
      const wave1 = Math.sin((px / 20 + this.game.time * 2)) * waveH * 0.4;
      const wave2 = Math.sin((px / 10 + this.game.time * 3)) * waveH * 0.2;
      const wave3 = Math.sin((px / 30 + this.game.time * 1.5)) * waveH * 0.3;
      const y = waveY + wave1 + wave2 + wave3;

      if (px === 0) {
        ctx.moveTo(x + tiltOffset, y);
      } else {
        ctx.lineTo(x + tiltOffset, y);
      }
    }
    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  // RIGHT SECTION: Control buttons, LEDs, and decorative elements
  renderRightSection(ctx, x, y, w, h) {
    const p = this.game.player;

    // Control panel background - rounded top
    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath();
    ctx.moveTo(x + 20, y);
    ctx.lineTo(x + w - 20, y);
    ctx.lineTo(x + w, y + 15);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + 15);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#15151f';
    ctx.beginPath();
    ctx.moveTo(x + 20, y - 3);
    ctx.lineTo(x + w - 20, y - 3);
    ctx.lineTo(x + w - 3, y + 12);
    ctx.lineTo(x + w - 3, y + h - 3);
    ctx.lineTo(x + 3, y + h - 3);
    ctx.lineTo(x + 3, y + 12);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#0f0f15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 20, y);
    ctx.lineTo(x + w - 20, y);
    ctx.lineTo(x + w, y + 15);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + 15);
    ctx.closePath();
    ctx.stroke();

    // Panel surface
    const panelMargin = 10;
    const panelX = x + panelMargin;
    const panelY = y + panelMargin + 8;
    const panelW = w - panelMargin * 2;
    const panelH = h - panelMargin * 2 - 8;

    ctx.fillStyle = '#0d0d15';
    ctx.fillRect(panelX, panelY, panelW, panelH);

    // === SMALLER, MORE COMPLEX BUTTONS (4x4 grid) ===
    const btnW = 55;
    const btnH = 28;
    const btnGapX = 7;
    const btnGapY = 6;
    const gridCols = 4;
    const gridRows = 3;
    const gridStartX = panelX + 10;
    const gridStartY = panelY + 5;

    const buttons = [
      {label: 'SHD', color: '#5577aa', active: p.shieldActive},
      {label: 'WRP', color: '#7755aa', active: p.warpActive},
      {label: 'SCN', color: '#557799', active: false},
      {label: 'BRK', color: '#aa5544', active: false},
      {label: 'MIN', color: '#aa8844', active: false},
      {label: 'MAP', color: '#5588aa', active: false},
      {label: 'AUT', color: '#66aa66', active: false},
      {label: 'COM', color: '#aa6688', active: false},
      {label: 'TRG', color: '#aa8855', active: false},
      {label: 'NAV', color: '#88aa66', active: false},
      {label: 'SYS', color: '#6688aa', active: false},
      {label: 'HLP', color: '#aa66aa', active: false}
    ];

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const btnX = gridStartX + col * (btnW + btnGapX);
      const btnY = gridStartY + row * (btnH + btnGapY);

      // Button shadow
      ctx.fillStyle = '#000000';
      ctx.fillRect(btnX + 2, btnY + 2, btnW, btnH);

      // Button body with grooves
      ctx.fillStyle = btn.active ? btn.color : '#2a2a35';
      ctx.fillRect(btnX, btnY, btnW, btnH);

      // Horizontal groove lines for complexity
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      for (let g = 0; g < 3; g++) {
        ctx.beginPath();
        ctx.moveTo(btnX + 5, btnY + 8 + g * 6);
        ctx.lineTo(btnX + btnW - 5, btnY + 8 + g * 6);
        ctx.stroke();
      }

      // Bevels
      if (btn.active) {
        ctx.fillStyle = '#444455';
        ctx.fillRect(btnX, btnY, btnW, 2);
        ctx.fillRect(btnX, btnY, 2, btnH);
      } else {
        ctx.fillStyle = '#1a1a22';
        ctx.fillRect(btnX, btnY, btnW, 1);
        ctx.fillRect(btnX, btnY, 1, btnH);
      }

      // Border
      ctx.strokeStyle = btn.active ? btn.color : '#1a1a22';
      ctx.lineWidth = 1;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      // Label (BIGGER)
      ctx.fillStyle = btn.active ? '#ffffff' : '#777788';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(btn.label, btnX + btnW / 2, btnY + btnH / 2 + 3);
      ctx.textAlign = 'left';

      // Active indicator LED with label
      const ledX = btnX + btnW - 8;
      const ledY = btnY + 6;

      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.arc(ledX, ledY, 3, 0, Math.PI * 2);
      ctx.fill();

      if (btn.active) {
        ctx.fillStyle = btn.color;
        ctx.beginPath();
        ctx.arc(ledX, ledY, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = btn.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(ledX, ledY, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // === ROUND OSCILLOSCOPE (bottom center) ===
    const oscRadius = 45;
    const oscX = panelX + panelW / 2;
    const oscY = panelY + panelH - oscRadius - 15;

    // Oscilloscope chassis
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(oscX, oscY, oscRadius + 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(oscX, oscY, oscRadius + 5, 0, Math.PI * 2);
    ctx.stroke();

    // Screen bezel
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(oscX, oscY, oscRadius, 0, Math.PI * 2);
    ctx.fill();

    // Screen
    ctx.fillStyle = '#0d0e14';
    ctx.beginPath();
    ctx.arc(oscX, oscY, oscRadius - 3, 0, Math.PI * 2);
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = '#1a2a1a';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    // Vertical and horizontal grid
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(oscX + i * oscRadius * 0.6, oscY - oscRadius + 3);
      ctx.lineTo(oscX + i * oscRadius * 0.6, oscY + oscRadius - 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(oscX - oscRadius + 3, oscY + i * oscRadius * 0.6);
      ctx.lineTo(oscX + oscRadius - 3, oscY + i * oscRadius * 0.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Waveform
    ctx.strokeStyle = '#44aa66';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#44aa66';
    ctx.shadowBlur = 3;

    ctx.beginPath();
    const wavePoints = 80;
    for (let i = 0; i < wavePoints; i++) {
      const angle = (i / wavePoints) * Math.PI * 2;
      const wave1 = Math.sin(angle * 3 + this.game.time * 2) * 15;
      const wave2 = Math.sin(angle * 5 + this.game.time * 3) * 8;
      const radius = (oscRadius - 8) + wave1 + wave2;
      const px = oscX + Math.cos(angle) * radius * 0.6;
      const py = oscY + Math.sin(angle) * radius * 0.6;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle = '#88aa66';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OSC', oscX, oscY + oscRadius + 12);
    ctx.textAlign = 'left';

    // === 4 SMALL INDICATOR LEDS (corners) ===
    const ledPositions = [
      {x: panelX + 15, y: panelY + panelH - 15, color: '#44aa44'},
      {x: panelX + panelW - 15, y: panelY + panelH - 15, color: '#aa4444', blink: Math.floor(this.game.time * 3) % 2 === 0},
      {x: panelX + 15, y: gridStartY + gridRows * (btnH + btnGapY) + 15, color: '#aaaa44'},
      {x: panelX + panelW - 15, y: gridStartY + gridRows * (btnH + btnGapY) + 15, color: '#4444aa'}
    ];

    for (const led of ledPositions) {
      if (led.blink) continue;

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(led.x - 3, led.y - 3, 6, 6);

      ctx.fillStyle = led.color;
      ctx.fillRect(led.x - 2, led.y - 2, 4, 4);

      ctx.shadowColor = led.color;
      ctx.shadowBlur = 3;
      ctx.fillRect(led.x - 2, led.y - 2, 4, 4);
      ctx.shadowBlur = 0;
    }

    // === SMALL WHEELS (top corners) ===
    this.renderSmallWheel(ctx, panelX + 15, panelY + 5, 10);
    this.renderSmallWheel(ctx, panelX + panelW - 15, panelY + 5, 10);

    // === ENHANCED: Joysticks on side panels ===
    // Left joystick
    this.drawEnhancedJoystick(ctx, panelX - 25, panelY + panelH / 2, 18);
    // Right joystick
    this.drawEnhancedJoystick(ctx, panelX + panelW + 25, panelY + panelH / 2, 18);

    // === ENHANCED: Keypad array ===
    this.drawKeypadArray(ctx, panelX + panelW - 80, panelY + panelH - 55, 3, 3, 12, 3);

    // === ENHANCED: Panel decorations ===
    // Serial plate
    this.drawSerialPlate(ctx, panelX + 5, panelY - 8, 70, 12, 'CTRL-PANEL-03');

    // Screws
    this.drawScrew(ctx, panelX + 25, panelY + 5, 3);
    this.drawScrew(ctx, panelX + panelW - 25, panelY + 5, 3);
    this.drawScrew(ctx, panelX + 10, panelY + panelH - 10, 3);
    this.drawScrew(ctx, panelX + panelW - 10, panelY + panelH - 10, 3);

    // Welding seams
    this.drawWeldMarks(ctx, panelX + 20, panelY, panelX + panelW - 20, panelY);
    this.drawWeldMarks(ctx, panelX, panelY + panelH, panelX + panelW, panelY + panelH);

    // Additional indicator lights strip
    const lightY = panelY + panelH - 75;
    this.drawIndicatorLight(ctx, panelX + 15, lightY, 2, '#aa7744', null, true);
    this.drawIndicatorLight(ctx, panelX + 30, lightY, 2, '#aa7744', null, true);
    this.drawIndicatorLight(ctx, panelX + 45, lightY, 2, '#7799aa', null, p.shieldActive);
    this.drawIndicatorLight(ctx, panelX + 60, lightY, 2, '#8866aa', null, p.warpActive);
  }

  // HELPER: Analog gauge with needle
  renderAnalogGauge(ctx, x, y, w, h, label, value, min, max, color) {
    // Gauge background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x + 2, y + 2, w, h);

    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = '#0f0f15';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Gauge face
    const centerX = x + w / 2;
    const centerY = y + h - 8;
    const radius = Math.min(w, h) / 2 - 8;

    // Background arc
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.25);
    ctx.stroke();

    // Tick marks
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const angle = Math.PI * 0.75 + (i / 10) * (Math.PI * 1.5);
      const x1 = centerX + Math.cos(angle) * (radius - 3);
      const y1 = centerY + Math.sin(angle) * (radius - 3);
      const x2 = centerX + Math.cos(angle) * radius;
      const y2 = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Needle
    const percent = (value - min) / (max - min);
    const needleAngle = Math.PI * 0.75 + percent * (Math.PI * 1.5);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(needleAngle) * (radius - 5),
      centerY + Math.sin(needleAngle) * (radius - 5)
    );
    ctx.stroke();

    // Center pin
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, centerX, y + 10);

    // Value
    ctx.fillStyle = '#888899';
    ctx.font = '6px monospace';
    ctx.fillText(Math.floor(value), centerX, centerY + 12);
    ctx.textAlign = 'left';
  }

  // HELPER: Side decoration panel
  renderSideDecoration(ctx, x, y, w, h) {
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = '#0f0f15';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Vent lines
    for (let i = 0; i < h / 4; i++) {
      ctx.strokeStyle = '#0a0a0f';
      ctx.beginPath();
      ctx.moveTo(x, y + i * 4);
      ctx.lineTo(x + w, y + i * 4);
      ctx.stroke();
    }

    // Warning stripe
    const stripeH = 4;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#3a3a1a' : '#1a1a1a';
      ctx.fillRect(x, y + h / 2 - 6 + i * stripeH, w, stripeH);
    }
  }

  // HELPER: Decorative joystick
  renderDecorativeJoystick(ctx, x, y, w, h) {
    const centerX = x + w / 2;
    const centerY = y + h - 5;

    // Base
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, w / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, w / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Stick (slight angle for realism)
    const stickAngle = Math.sin(this.game.time * 0.5) * 0.1;
    const stickTipX = centerX + Math.sin(stickAngle) * 8;
    const stickTipY = y + 8;

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(stickTipX, stickTipY);
    ctx.stroke();

    // Stick top
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.arc(stickTipX, stickTipY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.arc(stickTipX - 1, stickTipY - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // HELPER: Decorative lever
  renderDecorativeLever(ctx, x, y, w, h) {
    // Base slot
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x + w / 2 - 3, y, 6, h);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + w / 2 - 3, y, 6, h);

    // Lever handle position (animated)
    const leverPos = y + h / 2 + Math.sin(this.game.time * 0.8) * (h / 4);

    // Lever handle
    ctx.fillStyle = '#aa4444';
    ctx.beginPath();
    ctx.arc(x + w / 2, leverPos, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#884444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + w / 2, leverPos, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Handle grip
    ctx.fillStyle = '#2a2a2a';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + w / 2 - 4, leverPos - 3 + i * 2, 8, 1);
    }
  }

  // HELPER: Small wheel/dial
  renderSmallWheel(ctx, x, y, radius) {
    // Wheel body
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Notches
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius
      );
      ctx.stroke();
    }

    // Center
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Indicator dot (rotates with time)
    const dotAngle = this.game.time * 0.5;
    const dotX = x + Math.cos(dotAngle) * (radius - 4);
    const dotY = y + Math.sin(dotAngle) * (radius - 4);

    ctx.fillStyle = '#aa4444';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // HELPER: Radar mini gauge (small analog gauge for radar panel)
  renderRadarMiniGauge(ctx, x, y, size, label, value, min, max, color) {
    // Gauge background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(x, y, size, size);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);

    // Gauge face
    const centerX = x + size / 2;
    const centerY = y + size - 4;
    const radius = size / 2 - 4;

    // Background arc
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 0.25);
    ctx.stroke();

    // Tick marks (5 major ticks)
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const angle = Math.PI * 0.75 + (i / 4) * (Math.PI * 1.5);
      const x1 = centerX + Math.cos(angle) * (radius - 2);
      const y1 = centerY + Math.sin(angle) * (radius - 2);
      const x2 = centerX + Math.cos(angle) * radius;
      const y2 = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Needle
    const percent = (value - min) / (max - min);
    const needleAngle = Math.PI * 0.75 + percent * (Math.PI * 1.5);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(needleAngle) * (radius - 2),
      centerY + Math.sin(needleAngle) * (radius - 2)
    );
    ctx.stroke();

    // Center pin
    ctx.fillStyle = '#444444';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    ctx.fill();

    // Label (BIGGER)
    ctx.fillStyle = color;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, centerX, y + 8);

    // Value (BIGGER)
    ctx.fillStyle = '#888888';
    ctx.font = '7px monospace';
    ctx.fillText(Math.floor(value), centerX, centerY + 7);
    ctx.textAlign = 'left';
  }

  // HELPER: Draw heavily pixelated panel texture with multiple color shades for depth
  drawPixelatedPanelTexture(ctx, x, y, w, h, baseColor = '#1a1a24') {
    const pixelSize = 2; // Heavy pixelation
    const rgb = this.hexToRgb(baseColor);

    for (let py = y; py < y + h; py += pixelSize) {
      for (let px = x; px < x + w; px += pixelSize) {
        // Multiple layers of noise for realistic metal texture
        const noise1 = Math.sin(px * 0.1 + py * 0.1) * 0.5 + 0.5;
        const noise2 = Math.cos(px * 0.07 + py * 0.13) * 0.3;
        const variation = Math.floor((noise1 + noise2) * 15 - 7);

        const r = Math.max(0, Math.min(255, rgb.r + variation));
        const g = Math.max(0, Math.min(255, rgb.g + variation));
        const b = Math.max(0, Math.min(255, rgb.b + variation));

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }
    }
  }

  // HELPER: Draw CRT glass overlay with reflections
  drawCRTGlassOverlay(ctx, x, y, w, h, isTilted = false, tilt = 0) {
    ctx.save();

    // Create clipping path for tilted screens
    if (isTilted && tilt > 0) {
      ctx.beginPath();
      ctx.moveTo(x + tilt, y);
      ctx.lineTo(x + w - tilt, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.clip();
    }

    // Glass reflection gradient (subtle)
    const gradient = ctx.createLinearGradient(x, y, x, y + h);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.02)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, w, h);

    // Curved glass highlight (top-left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.2, y);
    ctx.lineTo(x + w * 0.6, y);
    ctx.lineTo(x + w * 0.4, y + h * 0.3);
    ctx.lineTo(x + w * 0.1, y + h * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // HELPER: Draw serial number plate
  drawSerialPlate(ctx, x, y, w, h, text) {
    // Plate background - dark metal
    ctx.fillStyle = '#2a2418';
    ctx.fillRect(x, y, w, h);

    // Plate border
    ctx.strokeStyle = '#1a1208';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    // Rivets in corners
    const rivetPositions = [
      [x + 3, y + 3],
      [x + w - 3, y + 3],
      [x + 3, y + h - 3],
      [x + w - 3, y + h - 3]
    ];

    for (const [rx, ry] of rivetPositions) {
      ctx.fillStyle = '#1a1208';
      ctx.beginPath();
      ctx.arc(rx, ry, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath();
      ctx.arc(rx, ry, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Text
    ctx.fillStyle = '#887755';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + w / 2, y + h / 2 + 2);
    ctx.textAlign = 'left';
  }

  // HELPER: Draw welding marks
  drawWeldMarks(ctx, x1, y1, x2, y2) {
    const pixelSize = 2;
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    for (let i = 0; i < length; i += pixelSize * 2) {
      const px = x1 + Math.cos(angle) * i;
      const py = y1 + Math.sin(angle) * i;
      const variation = Math.random() * 2 - 1;

      ctx.fillStyle = Math.random() > 0.5 ? '#3a2a1a' : '#4a3a2a';
      ctx.fillRect(
        px + variation,
        py + variation,
        pixelSize,
        pixelSize
      );
    }
  }

  // HELPER: Draw screw
  drawScrew(ctx, x, y, size = 4) {
    // Screw head shadow
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 1, y + 1, size, 0, Math.PI * 2);
    ctx.fill();

    // Screw head
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Screw slot (cross)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - size + 1, y);
    ctx.lineTo(x + size - 1, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - size + 1);
    ctx.lineTo(x, y + size - 1);
    ctx.stroke();

    // Highlight
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.arc(x - 1, y - 1, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // HELPER: Draw indicator light with label
  drawIndicatorLight(ctx, x, y, size, color, label, active = true) {
    // Light housing
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(x - size - 1, y - size - 1, size * 2 + 2, size * 2 + 2);

    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - size, y - size, size * 2, size * 2);

    // Light
    if (active) {
      ctx.fillStyle = color;
      ctx.fillRect(x - size + 1, y - size + 1, size * 2 - 2, size * 2 - 2);

      // Glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.fillRect(x - size + 1, y - size + 1, size * 2 - 2, size * 2 - 2);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x - size + 1, y - size + 1, size * 2 - 2, size * 2 - 2);
    }

    // Label
    if (label) {
      ctx.fillStyle = '#887766';
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + size + 8);
      ctx.textAlign = 'left';
    }
  }

  // HELPER: Draw keypad button array
  drawKeypadArray(ctx, x, y, cols, rows, btnSize, gap) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const btnX = x + col * (btnSize + gap);
        const btnY = y + row * (btnSize + gap);

        // Button shadow
        ctx.fillStyle = '#000000';
        ctx.fillRect(btnX + 1, btnY + 1, btnSize, btnSize);

        // Button body - heavily pixelated
        const pixelSize = 2;
        for (let py = 0; py < btnSize; py += pixelSize) {
          for (let px = 0; px < btnSize; px += pixelSize) {
            const edge = px < 2 || py < 2 || px >= btnSize - 2 || py >= btnSize - 2;
            ctx.fillStyle = edge ? '#1a1a22' : '#2a2a35';
            ctx.fillRect(btnX + px, btnY + py, pixelSize, pixelSize);
          }
        }

        // Button number/symbol
        ctx.fillStyle = '#777788';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        const symbol = (row * cols + col + 1) % 10;
        ctx.fillText(symbol.toString(), btnX + btnSize / 2, btnY + btnSize / 2 + 2);
      }
    }
    ctx.textAlign = 'left';
  }

  // HELPER: Enhanced joystick with base detail
  drawEnhancedJoystick(ctx, x, y, radius) {
    const centerX = x;
    const centerY = y;

    // Base plate - hexagonal
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = centerX + Math.cos(angle) * (radius + 8);
      const py = centerY + Math.sin(angle) * (radius + 8);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Base ring
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Stick shaft (slightly angled)
    const stickAngle = Math.sin(this.game.time * 0.3) * 0.15;
    const stickTipX = centerX + Math.sin(stickAngle) * 10;
    const stickTipY = centerY - radius - 15;

    // Shaft shadow
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(centerX + 1, centerY + 1);
    ctx.lineTo(stickTipX + 1, stickTipY + 1);
    ctx.stroke();

    // Shaft body
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(stickTipX, stickTipY);
    ctx.stroke();

    // Stick grip (ball top)
    ctx.fillStyle = '#aa5544';
    ctx.beginPath();
    ctx.arc(stickTipX, stickTipY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Grip highlight
    ctx.fillStyle = '#cc7766';
    ctx.beginPath();
    ctx.arc(stickTipX - 2, stickTipY - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Grip texture lines
    ctx.strokeStyle = '#884433';
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(stickTipX - 4, stickTipY + i * 2);
      ctx.lineTo(stickTipX + 4, stickTipY + i * 2);
      ctx.stroke();
    }
  }

  // HUD UI OVERHAUL: Damage Control Panel (Enhanced & Compact)
  // NOTE: This is now replaced by renderBottomConsole() but kept for reference
  renderDamageControlPanel() {
    if (!this.game.shipDamageSystem) return;

    const ctx = this.game.ctx;
    const panelW = 340;  // More compact: 360 -> 340
    const panelH = 385;  // More compact: 420 -> 385
    const panelX = 18;
    const panelY = this.game.height / 2 - panelH / 2;

    // Reset button tracking for click/touch handling
    this.game.damageControlButtons = [];

    // === MULTIPLE SHADOW LAYERS FOR DEPTH ===
    // Shadow layer 4 (deepest)
    ctx.fillStyle = `${this.game.PALETTE.deepBlack}99`;
    ctx.fillRect(panelX + 12, panelY + 12, panelW, panelH);

    // Shadow layer 3
    ctx.fillStyle = `${this.game.PALETTE.deepBlack}bb`;
    ctx.fillRect(panelX + 9, panelY + 9, panelW, panelH);

    // Shadow layer 2
    ctx.fillStyle = `${this.game.PALETTE.shadowGray}88`;
    ctx.fillRect(panelX + 6, panelY + 6, panelW, panelH);

    // Shadow layer 1
    ctx.fillStyle = `${this.game.PALETTE.shadowGray}aa`;
    ctx.fillRect(panelX + 3, panelY + 3, panelW, panelH);

    // === MAIN PANEL BACKGROUND ===
    ctx.fillStyle = `${this.game.PALETTE.voidBlack}ee`;
    ctx.fillRect(panelX, panelY, panelW, panelH);

    // === RUSTY OUTER FRAME (TRIPLE LAYER) ===
    // Outer rust layer
    ctx.strokeStyle = '#0f0f12';
    ctx.lineWidth = 10;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // Middle metal layer
    ctx.strokeStyle = '#1a1a22';
    ctx.lineWidth = 8;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // Inner edge layer
    ctx.strokeStyle = '#252530';
    ctx.lineWidth = 6;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // === COMPLEX RUST AND DAMAGE TEXTURES ===
    const rustColors = ['#442211', '#332211', '#553322', '#221100', '#331100', '#221a00'];

    // Large rust patches
    for (let i = 0; i < 15; i++) {
      const rx = panelX + Math.random() * panelW;
      const ry = panelY + Math.random() * panelH;
      const rw = Math.random() * 20 + 10;
      const rh = Math.random() * 15 + 5;
      ctx.globalAlpha = 0.2 + Math.random() * 0.3;
      ctx.fillStyle = rustColors[Math.floor(Math.random() * rustColors.length)];
      ctx.fillRect(rx, ry, rw, rh);
    }

    // Small rust spots
    for (let i = 0; i < 50; i++) {
      const rx = panelX + Math.random() * panelW;
      const ry = panelY + Math.random() * panelH;
      const rsize = Math.random() * 4 + 1;
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      ctx.fillStyle = rustColors[Math.floor(Math.random() * rustColors.length)];
      ctx.fillRect(rx, ry, rsize, rsize);
    }

    // Scratches and wear marks
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#332211';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const sx = panelX + Math.random() * panelW;
      const sy = panelY + Math.random() * panelH;
      const length = Math.random() * 30 + 10;
      const angle = Math.random() * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(angle) * length, sy + Math.sin(angle) * length);
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;

    // === RIVETS AND BOLTS ===
    const rivetPositions = [
      // Top edge
      {x: panelX + 30, y: panelY + 8},
      {x: panelX + panelW / 2, y: panelY + 8},
      {x: panelX + panelW - 30, y: panelY + 8},
      // Bottom edge
      {x: panelX + 30, y: panelY + panelH - 8},
      {x: panelX + panelW / 2, y: panelY + panelH - 8},
      {x: panelX + panelW - 30, y: panelY + panelH - 8},
      // Left edge
      {x: panelX + 8, y: panelY + 60},
      {x: panelX + 8, y: panelY + panelH / 2},
      {x: panelX + 8, y: panelY + panelH - 60},
      // Right edge
      {x: panelX + panelW - 8, y: panelY + 60},
      {x: panelX + panelW - 8, y: panelY + panelH / 2},
      {x: panelX + panelW - 8, y: panelY + panelH - 60}
    ];

    for (const pos of rivetPositions) {
      // Rivet shadow
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pos.x + 0.5, pos.y + 0.5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Rivet body
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Rivet highlight
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.arc(pos.x - 0.5, pos.y - 0.5, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // === MAIN BORDER WITH GLOW ===
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.game.PALETTE.cautionOrange;
    ctx.strokeStyle = this.game.PALETTE.cautionOrange;
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8);
    ctx.shadowBlur = 0;

    // === CORNER BRACKETS ===
    this.drawRustyCorners(panelX, panelY, panelW, panelH, this.game.PALETTE.alertRed, 20);

    // CRT Screen background (where sections are displayed)
    const screenX = panelX + 15;
    const screenY = panelY + 60;
    const screenW = panelW - 30;
    const screenH = panelH - 80;

    ctx.fillStyle = '#050508';
    ctx.fillRect(screenX, screenY, screenW, screenH);

    // CRT scanlines on screen
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    for (let i = 0; i < screenH; i += 2) {
      ctx.beginPath();
      ctx.moveTo(screenX, screenY + i);
      ctx.lineTo(screenX + screenW, screenY + i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Screen border
    ctx.strokeStyle = '#6a4a2a';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY, screenW, screenH);

    // Title bar
    ctx.fillStyle = '#0f0f18';
    ctx.fillRect(panelX + 10, panelY + 10, panelW - 20, 42);

    ctx.strokeStyle = this.game.PALETTE.alertRed;
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + 10, panelY + 10, panelW - 20, 42);

    // Title text with glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.game.PALETTE.cautionOrange;
    ctx.fillStyle = this.game.PALETTE.cautionOrange;
    ctx.font = 'bold 16px DigitalDisco, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('◆ DAMAGE CONTROL ◆', panelX + 25, panelY + 35);
    ctx.shadowBlur = 0;

    // Warning LEDs (blinking)
    const critical = this.game.shipDamageSystem.getCriticalSections();
    const hasWarnings = critical.length > 0;
    if (hasWarnings && Math.floor(this.game.time * 3) % 2 === 0) {
      ctx.fillStyle = this.game.PALETTE.alertRed;
      ctx.beginPath();
      ctx.arc(panelX + panelW - 35, panelY + 31, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 8;
      ctx.shadowColor = this.game.PALETTE.alertRed;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Decorative screws
    const screwPositions = [
      {x: panelX + 18, y: panelY + 18},
      {x: panelX + panelW - 18, y: panelY + 18},
      {x: panelX + 18, y: panelY + panelH - 18},
      {x: panelX + panelW - 18, y: panelY + panelH - 18}
    ];

    for (const pos of screwPositions) {
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pos.x - 3, pos.y);
      ctx.lineTo(pos.x + 3, pos.y);
      ctx.stroke();
    }

    // Serial number label (decorative)
    ctx.fillStyle = '#444444';
    ctx.font = '8px DigitalDisco, monospace';
    ctx.fillText('DMG-CTL-7734-REV.4', panelX + 15, panelY + panelH - 8);

    // Render ship sections
    const sections = this.game.shipDamageSystem.sections;
    const sectionKeys = Object.keys(sections);
    let yPos = screenY + 10;

    ctx.textAlign = 'left';
    ctx.font = '11px DigitalDisco, monospace';

    for (const key of sectionKeys) {
      const section = sections[key];
      const healthPercent = this.game.shipDamageSystem.getHealthPercent(key);
      const sectionX = screenX + 10;
      const sectionY = yPos;
      const sectionH = 43;

      // Section background
      let bgColor = '#0a0a0f';
      if (section.destroyed) {
        bgColor = '#220000';
      } else if (healthPercent < section.criticalThreshold) {
        bgColor = '#221100';
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(sectionX, sectionY, screenW - 20, sectionH);

      // Section border
      let borderColor = this.game.PALETTE.statusBlue;
      if (section.destroyed) {
        borderColor = this.game.PALETTE.alertRed;
      } else if (healthPercent < section.criticalThreshold) {
        borderColor = this.game.PALETTE.cautionOrange;
      }

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(sectionX, sectionY, screenW - 20, sectionH);

      // Section icon and name
      ctx.fillStyle = section.destroyed ? this.game.PALETTE.alertRed :
                      healthPercent < section.criticalThreshold ? this.game.PALETTE.cautionOrange :
                      healthPercent < section.warningThreshold ? this.game.PALETTE.cautionOrange :
                      this.game.PALETTE.statusGreen;
      ctx.font = 'bold 10px DigitalDisco, monospace';
      ctx.fillText(section.icon, sectionX + 5, sectionY + 12);

      ctx.font = 'bold 11px DigitalDisco, monospace';
      ctx.fillText(section.name.toUpperCase(), sectionX + 45, sectionY + 12);

      // Health bar
      const barX = sectionX + 5;
      const barY = sectionY + 18;
      const barW = screenW - 100;
      const barH = 8;

      ctx.fillStyle = '#000000';
      ctx.fillRect(barX, barY, barW, barH);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      const fillW = (barW - 2) * (healthPercent / 100);
      let fillColor = this.game.PALETTE.statusGreen;
      if (section.destroyed) {
        fillColor = this.game.PALETTE.alertRed;
      } else if (healthPercent < section.criticalThreshold) {
        fillColor = this.game.PALETTE.alertRed;
      } else if (healthPercent < section.warningThreshold) {
        fillColor = this.game.PALETTE.cautionOrange;
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(barX + 1, barY + 1, fillW, barH - 2);

      // Health percentage text
      ctx.fillStyle = this.game.PALETTE.starWhite;
      ctx.font = 'bold 9px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(healthPercent)}%`, barX + barW / 2, barY + barH - 1);
      ctx.textAlign = 'left';

      // Repair button
      const btnX = sectionX + screenW - 85;
      const btnY = sectionY + 16;
      const btnW = 75;
      const btnH = 14;

      // Button clickable area tracking (store for mouse events)
      if (!this.game.damageControlButtons) this.game.damageControlButtons = [];
      this.game.damageControlButtons.push({
        x: btnX, y: btnY, w: btnW, h: btnH,
        section: key,
        action: () => {
          if (section.destroyed) {
            this.game.showNotification('Section destroyed - dock at station!', 'warning');
          } else if (section.repairing) {
            this.game.shipDamageSystem.cancelRepair(key);
          } else {
            this.game.shipDamageSystem.startRepair(key);
          }
        }
      });

      // Button rendering
      if (section.destroyed) {
        ctx.fillStyle = '#330000';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = this.game.PALETTE.alertRed;
        ctx.lineWidth = 1;
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        ctx.fillStyle = this.game.PALETTE.alertRed;
        ctx.font = 'bold 8px DigitalDisco, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DESTROYED', btnX + btnW / 2, btnY + btnH / 2 + 3);
      } else if (section.repairing) {
        ctx.fillStyle = `${this.game.PALETTE.statusBlue}44`;
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = this.game.PALETTE.statusBlue;
        ctx.lineWidth = 2;
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        // Repair progress bar
        const progressW = (btnW - 4) * section.repairProgress;
        ctx.fillStyle = this.game.PALETTE.statusGreen;
        ctx.fillRect(btnX + 2, btnY + 2, progressW, btnH - 4);

        ctx.fillStyle = this.game.PALETTE.starWhite;
        ctx.font = 'bold 8px DigitalDisco, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(section.repairProgress * 100)}%`, btnX + btnW / 2, btnY + btnH / 2 + 3);
      } else {
        ctx.fillStyle = healthPercent >= 100 ? '#001100' : '#002200';
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = healthPercent >= 100 ? '#334433' : this.game.PALETTE.statusGreen;
        ctx.lineWidth = 1;
        ctx.strokeRect(btnX, btnY, btnW, btnH);

        ctx.fillStyle = healthPercent >= 100 ? '#666666' : this.game.PALETTE.statusGreen;
        ctx.font = 'bold 8px DigitalDisco, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(healthPercent >= 100 ? 'OPTIMAL' : '[R] REPAIR', btnX + btnW / 2, btnY + btnH / 2 + 3);
      }
      ctx.textAlign = 'left';

      // Status text
      ctx.fillStyle = section.destroyed ? this.game.PALETTE.alertRed :
                      section.repairing ? this.game.PALETTE.statusBlue :
                      healthPercent < section.criticalThreshold ? this.game.PALETTE.alertRed :
                      '#888888';
      ctx.font = '8px DigitalDisco, monospace';
      ctx.fillText(
        section.destroyed ? 'CRITICAL FAILURE' :
        section.repairing ? 'REPAIRING...' :
        healthPercent < section.criticalThreshold ? 'CRITICAL' :
        healthPercent < section.warningThreshold ? 'DAMAGED' :
        'NOMINAL',
        sectionX + 5, sectionY + 38
      );

      yPos += sectionH + 3;
    }

    // Overall ship status at bottom
    const overallHealth = this.game.shipDamageSystem.getOverallHealth();
    ctx.fillStyle = '#0f0f18';
    ctx.fillRect(screenX, screenY + screenH - 28, screenW, 26);

    ctx.strokeStyle = overallHealth < 50 ? this.game.PALETTE.alertRed : this.game.PALETTE.statusGreen;
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY + screenH - 28, screenW, 26);

    ctx.fillStyle = overallHealth < 30 ? this.game.PALETTE.alertRed :
                    overallHealth < 60 ? this.game.PALETTE.cautionOrange :
                    this.game.PALETTE.statusGreen;
    ctx.font = 'bold 11px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`OVERALL: ${Math.floor(overallHealth)}%`, screenX + screenW / 2, screenY + screenH - 13);
    ctx.textAlign = 'left';

    // Station repair hint at bottom
    ctx.fillStyle = '#666666';
    ctx.font = '8px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DOCK AT STATION FOR FULL REPAIRS', screenX + screenW / 2, panelY + panelH - 30);
    ctx.textAlign = 'left';
  }

  renderTouchControls() {
    const ctx = this.game.ctx;

    // Virtual joystick
    const joyX = 110;
    const joyY = this.game.height - 110;
    const joyRadius = 80;

    ctx.strokeStyle = `${this.game.PALETTE.statusBlue}77`;
    ctx.fillStyle = `${this.game.PALETTE.statusBlue}22`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(joyX, joyY, joyRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner circle
    ctx.strokeStyle = `${this.game.PALETTE.statusBlue}55`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(joyX, joyY, joyRadius / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair
    ctx.strokeStyle = `${this.game.PALETTE.statusBlue}44`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(joyX - 15, joyY);
    ctx.lineTo(joyX + 15, joyY);
    ctx.moveTo(joyX, joyY - 15);
    ctx.lineTo(joyX, joyY + 15);
    ctx.stroke();

    // Stick
    if (this.game.input.touch.active) {
      const dx = this.game.input.touch.currentX - this.game.input.touch.startX;
      const dy = this.game.input.touch.currentY - this.game.input.touch.startY;
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), joyRadius - 30);
      const angle = Math.atan2(dy, dx);

      const stickX = joyX + Math.cos(angle) * distance;
      const stickY = joyY + Math.sin(angle) * distance;

      // Connection line
      ctx.strokeStyle = `${this.game.PALETTE.statusBlue}66`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(joyX, joyY);
      ctx.lineTo(stickX, stickY);
      ctx.stroke();

      // Stick
      ctx.fillStyle = `${this.game.PALETTE.statusBlue}dd`;
      ctx.strokeStyle = this.game.PALETTE.warpBlue;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(stickX, stickY, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Stick center
      ctx.fillStyle = this.game.PALETTE.warpBlue;
      ctx.beginPath();
      ctx.arc(stickX, stickY, 15, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = `${this.game.PALETTE.statusBlue}99`;
      ctx.beginPath();
      ctx.arc(joyX, joyY, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `${this.game.PALETTE.statusBlue}66`;
      ctx.beginPath();
      ctx.arc(joyX, joyY, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fire button
    const fireX = this.game.width - 110;
    const fireY = this.game.height - 110;
    const fireRadius = 70;

    ctx.strokeStyle = this.game.input.fire ? this.game.PALETTE.alertRed : `${this.game.PALETTE.alertRed}99`;
    ctx.fillStyle = this.game.input.fire ? `${this.game.PALETTE.alertRed}bb` : `${this.game.PALETTE.alertRed}33`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(fireX, fireY, fireRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = this.game.input.fire ? this.game.PALETTE.engineBright : `${this.game.PALETTE.alertRed}66`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fireX, fireY, fireRadius - 15, 0, Math.PI * 2);
    ctx.stroke();

    // Fire icon
    ctx.fillStyle = this.game.PALETTE.starWhite;
    ctx.font = 'bold 22px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FIRE', fireX, fireY + 8);
    ctx.textAlign = 'left';

    // Fire indicator lines
    if (this.game.input.fire) {
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + this.game.time * 5;
        const x1 = fireX + Math.cos(angle) * (fireRadius - 10);
        const y1 = fireY + Math.sin(angle) * (fireRadius - 10);
        const x2 = fireX + Math.cos(angle) * (fireRadius + 5);
        const y2 = fireY + Math.sin(angle) * (fireRadius + 5);

        ctx.strokeStyle = this.game.PALETTE.engineBright;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }
}
