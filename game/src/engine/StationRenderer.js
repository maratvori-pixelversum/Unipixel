/**
 * Enhanced Station Renderer
 * 16-bit style detailed pixelated space stations
 * Includes: research stations, military outposts, trading hubs, mining platforms
 */

export class StationRenderer {
  constructor() {
    this.stationTypes = [
      'research',
      'military',
      'trading',
      'mining',
      'refinery',
      'dockyard',
      'mining_machine',
      'trade_convoy',
      'satellite',
      'comm_relay',
      'defense_platform',
      // NEW ENHANCED TYPES
      'orbital_shipyard',
      'medical_station',
      'agricultural_station',
      'science_outpost',
      'listening_post',
      'habitat_ring',
      'fuel_depot'
    ];
  }

  /**
   * Render a space station with detailed pixel art
   */
  renderStation(ctx, x, y, station, rotation, palette) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    const type = station.stationType || 'research';

    switch (type) {
      case 'research':
        this.renderResearchStation(ctx, palette);
        break;
      case 'military':
        this.renderMilitaryOutpost(ctx, palette);
        break;
      case 'trading':
        this.renderTradingHub(ctx, palette);
        break;
      case 'mining':
        this.renderMiningPlatform(ctx, palette);
        break;
      case 'refinery':
        this.renderRefinery(ctx, palette);
        break;
      case 'dockyard':
        this.renderDockyard(ctx, palette);
        break;
      case 'mining_machine':
        this.renderMiningMachine(ctx, palette);
        break;
      case 'trade_convoy':
        this.renderTradeConvoy(ctx, palette);
        break;
      case 'satellite':
        this.renderSatellite(ctx, palette);
        break;
      case 'comm_relay':
        this.renderCommRelay(ctx, palette);
        break;
      case 'defense_platform':
        this.renderDefensePlatform(ctx, palette);
        break;
      case 'orbital_shipyard':
        this.renderOrbitalShipyard(ctx, palette);
        break;
      case 'medical_station':
        this.renderMedicalStation(ctx, palette);
        break;
      case 'agricultural_station':
        this.renderAgriculturalStation(ctx, palette);
        break;
      case 'science_outpost':
        this.renderScienceOutpost(ctx, palette);
        break;
      case 'listening_post':
        this.renderListeningPost(ctx, palette);
        break;
      case 'habitat_ring':
        this.renderHabitatRing(ctx, palette);
        break;
      case 'fuel_depot':
        this.renderFuelDepot(ctx, palette);
        break;
      default:
        this.renderResearchStation(ctx, palette);
        break;
    }

    ctx.restore();
  }

  /**
   * Research Station - Modular design with lab sections (Ultra-Enhanced with Animations)
   */
  renderResearchStation(ctx, palette) {
    // Scale down by 0.7 for smaller, more compact stations
    const scale = 0.7;
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.scale(scale, scale);

    // Central hub - darker, weathered metal
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-40, -30, 80, 60);

    // Damaged/weathered panels (dark spots)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-38, -28, 12, 8);
    ctx.fillRect(26, -28, 12, 8);
    ctx.fillRect(-38, 20, 12, 8);
    ctx.fillRect(26, 20, 12, 8);

    // Hub details - very dark panels with pixel texture
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(-35, -25, 30, 20);
    ctx.fillRect(5, -25, 30, 20);
    ctx.fillRect(-35, 5, 30, 20);
    ctx.fillRect(5, 5, 30, 20);

    // Pixelated panel details (rivet/bolt patterns)
    ctx.fillStyle = '#151515';
    for (let x = -33; x < 33; x += 8) {
      for (let y = -23; y < 23; y += 8) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Lab modules (left and right) - darker
    ctx.fillStyle = '#252525';
    ctx.fillRect(-70, -15, 25, 30);
    ctx.fillRect(45, -15, 25, 30);

    // Module wear and tear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-68, -13, 8, 4);
    ctx.fillRect(-68, 9, 8, 4);
    ctx.fillRect(47, -13, 8, 4);
    ctx.fillRect(47, 9, 8, 4);

    // Module windows - dimmer, some flickering/broken
    for (let i = -10; i < 15; i += 12) {
      // Working windows (dimmer cyan)
      ctx.fillStyle = i % 24 === 0 ? '#004466' : '#006688';
      ctx.fillRect(-65, i, 6, 6);
      ctx.fillRect(50, i, 6, 6);

      // Broken/dark windows
      ctx.fillStyle = '#002233';
      ctx.fillRect(-56, i, 6, 6);
      ctx.fillRect(59, i, 6, 6);
    }

    // Central windows grid - darker, some broken
    for (let x = -30; x < 30; x += 15) {
      for (let y = -20; y < 20; y += 15) {
        ctx.fillStyle = (x + y) % 30 === 0 ? '#002244' : '#004466';
        ctx.fillRect(x, y, 7, 7);
        // Window frame
        ctx.fillStyle = '#111111';
        ctx.fillRect(x, y, 7, 1);
        ctx.fillRect(x, y, 1, 7);
      }
    }

    // Solar arrays (top and bottom) - darker, damaged
    ctx.fillStyle = '#1a2633';
    ctx.fillRect(-60, -45, 55, 12);
    ctx.fillRect(-60, 33, 55, 12);
    ctx.fillRect(5, -45, 55, 12);
    ctx.fillRect(5, 33, 55, 12);

    // Solar panel grid lines with damage
    ctx.strokeStyle = '#0d3d5c';
    ctx.lineWidth = 1;
    for (let i = -55; i < 60; i += 10) {
      if (i < 0) {
        // Top panels
        ctx.beginPath();
        ctx.moveTo(i, -45);
        ctx.lineTo(i, -33);
        ctx.stroke();
        // Horizontal lines
        if (i % 20 === 0) {
          ctx.beginPath();
          ctx.moveTo(i - 10, -39);
          ctx.lineTo(i, -39);
          ctx.stroke();
        }
      } else if (i > 5) {
        // Top right panels
        ctx.beginPath();
        ctx.moveTo(i, -45);
        ctx.lineTo(i, -33);
        ctx.stroke();
      }
    }

    // Damaged solar cells
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-55, -42, 6, 4);
    ctx.fillRect(-25, -42, 6, 4);
    ctx.fillRect(10, -42, 6, 4);

    // Communications dish - rusty/weathered
    ctx.strokeStyle = '#663300';
    ctx.fillStyle = '#442200';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -40, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dish grid pattern
    ctx.strokeStyle = '#331100';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, -40, 5 + i * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Antenna - corroded
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -54);
    ctx.lineTo(0, -40);
    ctx.stroke();

    // Antenna tip (blinking warning light)
    const antennaBlink = Math.floor(time * 2) % 2;
    ctx.fillStyle = antennaBlink ? '#ff3300' : '#660000';
    ctx.fillRect(-2, -56, 4, 4);

    // Structural supports/beams (add depth)
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-40, -30);
    ctx.lineTo(-70, -15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(40, -30);
    ctx.lineTo(70, -15);
    ctx.stroke();

    // Pixelated rust/damage spots
    ctx.fillStyle = '#3d2415';
    ctx.fillRect(-35, -15, 3, 3);
    ctx.fillRect(15, 10, 3, 3);
    ctx.fillRect(-60, 5, 3, 3);
    ctx.fillRect(55, -5, 3, 3);

    // ANIMATED ELEMENTS

    // Blinking status lights (sequential pattern)
    const statusPattern = Math.floor(time * 3) % 4;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = statusPattern === i ? '#00ff00' : '#003300';
      ctx.fillRect(-30 + i * 20, -28, 2, 2);
    }

    // Lab activity indicators (pulsing)
    const labPulse = Math.sin(time * 2) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(0, 150, 200, ${labPulse})`;
    ctx.fillRect(-68, -8, 3, 3);
    ctx.fillRect(65, -8, 3, 3);

    // Research beam (occasional emission)
    if (Math.sin(time * 1.5) > 0.7) {
      const beamAlpha = (Math.sin(time * 1.5) - 0.7) / 0.3;
      ctx.fillStyle = `rgba(100, 200, 255, ${beamAlpha * 0.6})`;
      ctx.fillRect(-8, -48, 16, 6);
      ctx.fillStyle = `rgba(150, 220, 255, ${beamAlpha * 0.8})`;
      ctx.fillRect(-6, -46, 12, 4);
    }

    // Exhaust vents (particle emissions)
    const exhaustPulse = Math.sin(time * 4);
    if (exhaustPulse > 0) {
      for (let i = 0; i < 3; i++) {
        const particleY = 45 + i * 4 + (time * 30) % 12;
        const particleAlpha = Math.max(0, exhaustPulse * (1 - i * 0.3));
        ctx.fillStyle = `rgba(200, 180, 100, ${particleAlpha * 0.4})`;
        ctx.fillRect(-25 + i * 2, particleY, 2, 2);
        ctx.fillRect(23 + i * 2, particleY, 2, 2);
      }
    }

    // Rotating communication dish (animated)
    const dishRotation = time * 0.8;
    ctx.save();
    ctx.translate(0, -40);
    ctx.rotate(dishRotation);

    // Dish arms (cross pattern)
    ctx.strokeStyle = '#442200';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.stroke();

    ctx.restore();

    // Transmission pulse (expanding ring)
    const transmitPhase = (time * 2) % 2;
    if (transmitPhase < 1) {
      const ringRadius = 50 + transmitPhase * 30;
      const ringAlpha = (1 - transmitPhase) * 0.3;
      ctx.strokeStyle = `rgba(100, 200, 255, ${ringAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -40, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Docking bay lights (blinking)
    const dockBlink = Math.sin(time * 4) > 0;
    ctx.fillStyle = dockBlink ? '#ffaa00' : '#332200';
    ctx.fillRect(-38, 28, 2, 2);
    ctx.fillRect(36, 28, 2, 2);

    ctx.restore();
  }

  /**
   * Military Outpost - Heavily armored with weapon platforms - ENHANCED with animations
   */
  renderMilitaryOutpost(ctx, palette) {
    const time = Date.now() * 0.001;

    // Main fortress body
    ctx.fillStyle = palette.hullSecondary || '#444444';
    ctx.fillRect(-50, -35, 100, 70);

    // Armor plating (darker sections)
    ctx.fillStyle = palette.shadowGray || '#222222';
    ctx.fillRect(-45, -30, 40, 25);
    ctx.fillRect(5, -30, 40, 25);
    ctx.fillRect(-45, 5, 40, 25);
    ctx.fillRect(5, 5, 40, 25);

    // Weapon turrets (corners)
    const turretPositions = [
      [-55, -40],
      [55, -40],
      [-55, 40],
      [55, 40]
    ];

    turretPositions.forEach(([tx, ty]) => {
      // Turret base
      ctx.fillStyle = palette.hullPrimary || '#555555';
      ctx.beginPath();
      ctx.arc(tx, ty, 12, 0, Math.PI * 2);
      ctx.fill();

      // Turret barrel
      ctx.fillStyle = palette.alertRed || '#ff0000';
      ctx.fillRect(tx - 3, ty - 18, 6, 12);

      // Barrel tip
      ctx.fillStyle = palette.cautionOrange || '#ff8800';
      ctx.fillRect(tx - 2, ty - 20, 4, 4);
    });

    // Viewports (narrow slits)
    ctx.fillStyle = palette.alertRed || '#ff0000';
    for (let x = -40; x < 40; x += 25) {
      ctx.fillRect(x, -15, 15, 3);
      ctx.fillRect(x, 12, 15, 3);
    }

    // Shield generators (glowing orbs)
    ctx.fillStyle = `${palette.shieldCyan || '#00ffff'}aa`;
    ctx.shadowColor = palette.shieldCyan || '#00ffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-30, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(30, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Warning stripes
    ctx.strokeStyle = palette.cautionOrange || '#ff8800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-50, -35, 100, 70);
    ctx.setLineDash([]);

    // ANIMATED ELEMENTS

    // Rotating turrets (track target)
    const turretRotation = Math.sin(time * 0.8) * 0.6;
    turretPositions.forEach(([tx, ty]) => {
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(turretRotation);

      // Turret tracking laser
      const laserPulse = Math.sin(time * 5) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(255, 0, 0, ${laserPulse * 0.4})`;
      ctx.fillRect(-1, -25, 2, 10);

      ctx.restore();
    });

    // Alert lights (blinking sequence)
    const alertPattern = Math.floor(time * 4) % 2;
    ctx.fillStyle = alertPattern ? palette.alertRed || '#ff0000' : '#330000';
    ctx.fillRect(-48, -33, 3, 3);
    ctx.fillRect(45, -33, 3, 3);
    ctx.fillRect(-48, 30, 3, 3);
    ctx.fillRect(45, 30, 3, 3);

    // Shield generator pulse
    const shieldPulse = Math.sin(time * 2.5) * 0.3 + 0.5;
    ctx.strokeStyle = `${palette.shieldCyan || '#00ffff'}${Math.floor(shieldPulse * 180).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.stroke();

    // Targeting grid (scanning)
    const gridPhase = (time * 0.5) % 1;
    ctx.strokeStyle = `rgba(255, 0, 0, ${(1 - gridPhase) * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-50, -35 + gridPhase * 70);
    ctx.lineTo(50, -35 + gridPhase * 70);
    ctx.stroke();
  }

  /**
   * Trading Hub - Large central ring with docking ports
   */
  renderTradingHub(ctx, palette) {
    // Main ring structure
    ctx.strokeStyle = palette.hullPrimary || '#555555';
    ctx.fillStyle = `${palette.hullPrimary || '#555555'}44`;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Inner details on ring
    ctx.lineWidth = 10;
    ctx.strokeStyle = palette.hullSecondary || '#333333';
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Docking ports (around the ring)
    const dockCount = 8;
    for (let i = 0; i < dockCount; i++) {
      const angle = (i / dockCount) * Math.PI * 2;
      const dx = Math.cos(angle) * 50;
      const dy = Math.sin(angle) * 50;

      // Docking bay
      ctx.fillStyle = palette.statusGreen || '#00ff00';
      ctx.fillRect(dx - 4, dy - 6, 8, 12);

      // Bay lights
      ctx.fillStyle = i % 2 === 0 ? palette.statusBlue || '#00aaff' : palette.cautionOrange || '#ff8800';
      ctx.fillRect(dx - 3, dy - 4, 6, 3);
    }

    // Central hub
    ctx.fillStyle = palette.hullPrimary || '#555555';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    // Hub windows
    ctx.fillStyle = palette.statusBlue || '#00aaff';
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const wx = Math.cos(angle) * 18;
      const wy = Math.sin(angle) * 18;
      ctx.fillRect(wx - 2, wy - 2, 4, 4);
    }

    // Trading beacon (center)
    ctx.fillStyle = palette.warpBlue || '#aa00ff';
    ctx.shadowColor = palette.warpBlue || '#aa00ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Spokes connecting ring to hub
    ctx.strokeStyle = palette.hullSecondary || '#333333';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 25, Math.sin(angle) * 25);
      ctx.lineTo(Math.cos(angle) * 50, Math.sin(angle) * 50);
      ctx.stroke();
    }
  }

  /**
   * Mining Platform - Industrial with ore processing
   */
  renderMiningPlatform(ctx, palette) {
    // Main platform base
    ctx.fillStyle = palette.hullSecondary || '#444444';
    ctx.fillRect(-45, -25, 90, 50);

    // Ore processing units
    ctx.fillStyle = palette.shadowGray || '#222222';
    ctx.fillRect(-40, -20, 35, 18);
    ctx.fillRect(5, -20, 35, 18);
    ctx.fillRect(-40, 2, 35, 18);
    ctx.fillRect(5, 2, 35, 18);

    // Industrial vents
    ctx.fillStyle = palette.cautionOrange || '#ff8800';
    for (let x = -35; x < 35; x += 15) {
      ctx.fillRect(x, -15, 4, 10);
      ctx.fillRect(x, 7, 4, 10);
    }

    // Ore storage containers (bottom)
    ctx.fillStyle = palette.hullPrimary || '#555555';
    ctx.fillRect(-55, 30, 25, 20);
    ctx.fillRect(-20, 30, 25, 20);
    ctx.fillRect(15, 30, 25, 20);

    // Container details
    ctx.strokeStyle = palette.cautionOrange || '#ff8800';
    ctx.lineWidth = 2;
    ctx.strokeRect(-55, 30, 25, 20);
    ctx.strokeRect(-20, 30, 25, 20);
    ctx.strokeRect(15, 30, 25, 20);

    // Mining drill arm (left side)
    ctx.strokeStyle = palette.hullPrimary || '#555555';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-45, 0);
    ctx.lineTo(-70, 15);
    ctx.stroke();

    // Drill head
    ctx.fillStyle = palette.mediumGray || '#666666';
    ctx.beginPath();
    ctx.moveTo(-70, 15);
    ctx.lineTo(-75, 10);
    ctx.lineTo(-75, 20);
    ctx.closePath();
    ctx.fill();

    // Hazard lights
    ctx.fillStyle = palette.alertRed || '#ff0000';
    ctx.shadowColor = palette.alertRed || '#ff0000';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-50, -30, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(50, -30, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Processing lights
    ctx.fillStyle = palette.plasmaGreen || '#00ff00';
    for (let i = -30; i < 30; i += 20) {
      ctx.fillRect(i, -2, 6, 3);
    }
  }

  /**
   * Refinery - Large processing facility with chimneys
   */
  renderRefinery(ctx, palette) {
    // Main refinery body
    ctx.fillStyle = palette.hullPrimary || '#555555';
    ctx.fillRect(-55, -20, 110, 60);

    // Processing tanks (cylindrical sections)
    const tankPositions = [-35, -10, 15, 40];
    tankPositions.forEach(tx => {
      ctx.fillStyle = palette.hullSecondary || '#333333';
      ctx.beginPath();
      ctx.arc(tx, 10, 12, 0, Math.PI * 2);
      ctx.fill();

      // Tank highlights
      ctx.fillStyle = palette.hullHighlight || '#777777';
      ctx.beginPath();
      ctx.arc(tx - 4, 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Tank gauge
      ctx.fillStyle = palette.statusGreen || '#00ff00';
      ctx.fillRect(tx - 2, 18, 4, 8);
    });

    // Chimneys (smoke stacks)
    ctx.fillStyle = palette.shadowGray || '#222222';
    ctx.fillRect(-45, -50, 12, 30);
    ctx.fillRect(0, -55, 12, 35);
    ctx.fillRect(33, -50, 12, 30);

    // Chimney tops
    ctx.fillStyle = palette.mediumGray || '#666666';
    ctx.fillRect(-47, -52, 16, 4);
    ctx.fillRect(-2, -57, 16, 4);
    ctx.fillRect(31, -52, 16, 4);

    // Emissions (glowing particles)
    ctx.fillStyle = `${palette.cautionOrange || '#ff8800'}66`;
    ctx.shadowColor = palette.cautionOrange || '#ff8800';
    ctx.shadowBlur = 4;
    ctx.fillRect(-42, -60, 6, 8);
    ctx.fillRect(3, -65, 6, 8);
    ctx.fillRect(36, -60, 6, 8);
    ctx.shadowBlur = 0;

    // Piping
    ctx.strokeStyle = palette.hullSecondary || '#333333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-50, 30);
    ctx.lineTo(-50, 40);
    ctx.lineTo(50, 40);
    ctx.lineTo(50, 30);
    ctx.stroke();

    // Pipe valves
    ctx.fillStyle = palette.alertRed || '#ff0000';
    for (let i = -40; i < 50; i += 30) {
      ctx.beginPath();
      ctx.arc(i, 40, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warning panels
    ctx.strokeStyle = palette.cautionOrange || '#ff8800';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-55, -20, 110, 60);
    ctx.setLineDash([]);

    // Windows
    ctx.fillStyle = palette.statusBlue || '#00aaff';
    for (let x = -45; x < 45; x += 25) {
      ctx.fillRect(x, -10, 8, 8);
    }
  }

  /**
   * Dockyard - Large ship construction and repair facility
   */
  renderDockyard(ctx, palette) {
    const scale = 0.75;
    ctx.save();
    ctx.scale(scale, scale);

    // Main platform - dark industrial grey
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-80, -40, 160, 80);

    // Structural framework
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 3;
    // Vertical beams
    for (let x = -75; x <= 75; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, -40);
      ctx.lineTo(x, 40);
      ctx.stroke();
    }
    // Horizontal beams
    for (let y = -35; y <= 35; y += 25) {
      ctx.beginPath();
      ctx.moveTo(-80, y);
      ctx.lineTo(80, y);
      ctx.stroke();
    }

    // Docking arms (extending outward)
    ctx.fillStyle = '#252525';
    ctx.fillRect(-100, -8, 20, 16);
    ctx.fillRect(80, -8, 20, 16);

    // Docking clamps
    ctx.fillStyle = '#333333';
    ctx.fillRect(-102, -12, 5, 8);
    ctx.fillRect(-102, 4, 5, 8);
    ctx.fillRect(97, -12, 5, 8);
    ctx.fillRect(97, 4, 5, 8);

    // Crane/lifting mechanism (top)
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(-30, -60, 60, 20);

    // Crane arm
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(0, -80);
    ctx.stroke();

    // Crane hook
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.arc(0, -85, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cable
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -80);
    ctx.lineTo(0, -40);
    ctx.stroke();

    // Central repair bay
    ctx.fillStyle = '#151515';
    ctx.fillRect(-40, -25, 80, 50);

    // Bay doors
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.strokeRect(-40, -25, 40, 50);
    ctx.strokeRect(0, -25, 40, 50);

    // Door panels (horizontal lines)
    for (let y = -20; y < 25; y += 10) {
      ctx.beginPath();
      ctx.moveTo(-40, y);
      ctx.lineTo(40, y);
      ctx.stroke();
    }

    // Work lights
    const time = Date.now() * 0.003;
    for (let i = 0; i < 6; i++) {
      const x = -60 + i * 24;
      const brightness = Math.sin(time + i) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 200, 50, ${brightness * 0.6})`;
      ctx.fillRect(x, -38, 4, 4);
    }

    // Warning stripes
    ctx.fillStyle = '#44330';
    for (let x = -75; x < 80; x += 8) {
      ctx.fillRect(x, 36, 4, 4);
    }

    // Sparks/welding effects (random)
    if (Math.random() > 0.7) {
      const sparkX = -30 + Math.random() * 60;
      const sparkY = -20 + Math.random() * 40;
      ctx.fillStyle = '#ffdd00';
      ctx.fillRect(sparkX, sparkY, 2, 2);
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(sparkX + 2, sparkY, 2, 2);
    }

    // Status displays
    ctx.fillStyle = '#004433';
    ctx.fillRect(-75, -8, 10, 16);
    ctx.fillRect(65, -8, 10, 16);

    // Weathering and damage
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(-70, -35, 8, 8);
    ctx.fillRect(30, 20, 8, 8);
    ctx.fillRect(-40, 15, 6, 6);

    ctx.restore();
  }

  /**
   * Mining Machine - Autonomous asteroid/resource extractor
   */
  renderMiningMachine(ctx, palette) {
    const scale = 0.6;
    ctx.save();
    ctx.scale(scale, scale);

    // Main body - compact, industrial
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(-35, -25, 70, 50);

    // Dark panels
    ctx.fillStyle = '#121212';
    ctx.fillRect(-32, -22, 30, 20);
    ctx.fillRect(2, -22, 30, 20);

    // Processing unit (center)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-25, 5, 50, 18);

    // Extraction drill (front)
    ctx.fillStyle = '#333333';
    ctx.fillRect(35, -10, 20, 20);

    // Drill bit (spinning animation)
    const rotation = Date.now() * 0.005;
    ctx.save();
    ctx.translate(55, 0);
    ctx.rotate(rotation);

    // Drill teeth
    ctx.fillStyle = '#555555';
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 10;
      const y = Math.sin(angle) * 10;
      ctx.fillRect(x - 2, y - 4, 4, 8);
    }

    // Drill core
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Ore collection hoppers (top)
    ctx.fillStyle = '#252525';
    ctx.fillRect(-30, -35, 20, 10);
    ctx.fillRect(10, -35, 20, 10);

    // Hopper contents (ore)
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(-28, -32, 16, 5);
    ctx.fillRect(12, -32, 16, 5);

    // Propulsion/movement tracks
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-35, 25, 70, 8);

    // Track segments
    ctx.fillStyle = '#2a2a2a';
    for (let x = -33; x < 35; x += 10) {
      ctx.fillRect(x, 26, 8, 6);
    }

    // Sensor array
    ctx.fillStyle = '#ff3300';
    ctx.fillRect(-18, -28, 3, 3);
    ctx.fillStyle = '#00ff33';
    ctx.fillRect(-12, -28, 3, 3);
    ctx.fillStyle = '#3366ff';
    ctx.fillRect(-6, -28, 3, 3);

    // Exhaust vents
    const exhaustGlow = Math.sin(Date.now() * 0.004) * 0.3 + 0.5;
    ctx.fillStyle = `rgba(255, 100, 0, ${exhaustGlow})`;
    ctx.fillRect(-36, -5, 3, 10);
    ctx.fillRect(-36, -5, 2, 2);

    // Wear patterns
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(-20, -15, 5, 5);
    ctx.fillRect(10, 10, 5, 5);
    ctx.fillRect(25, -18, 4, 4);

    // Warning labels
    ctx.fillStyle = '#664400';
    ctx.fillRect(-10, 8, 20, 12);
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, 8, 20, 12);

    ctx.restore();
  }

  /**
   * Trade Convoy - Mobile merchant fleet (multiple ships)
   */
  renderTradeConvoy(ctx, palette) {
    const scale = 0.65;
    ctx.save();
    ctx.scale(scale, scale);

    // Lead cargo hauler (center)
    ctx.fillStyle = '#2a2520';
    ctx.fillRect(-40, -20, 80, 40);

    // Cargo containers
    const containerColors = ['#3d2415', '#2d3420', '#2a2540', '#3d2a20'];
    for (let i = 0; i < 4; i++) {
      const x = -35 + i * 20;
      ctx.fillStyle = containerColors[i];
      ctx.fillRect(x, -15, 18, 30);

      // Container details
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, -15, 18, 30);

      // Locking mechanism
      ctx.fillStyle = '#555555';
      ctx.fillRect(x + 7, -17, 4, 2);
      ctx.fillRect(x + 7, 15, 4, 2);
    }

    // Bridge/cockpit
    ctx.fillStyle = '#333333';
    ctx.fillRect(30, -12, 25, 24);

    // Cockpit windows
    ctx.fillStyle = '#006688';
    ctx.fillRect(35, -8, 6, 6);
    ctx.fillRect(43, -8, 6, 6);
    ctx.fillRect(35, 2, 6, 6);
    ctx.fillRect(43, 2, 6, 6);

    // Engines (rear)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-45, -12, 8, 10);
    ctx.fillRect(-45, 2, 8, 10);

    // Engine glow
    const enginePulse = Math.sin(Date.now() * 0.006) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(100, 150, 255, ${enginePulse})`;
    ctx.fillRect(-47, -10, 4, 6);
    ctx.fillRect(-47, 4, 4, 6);

    // Escort ships (smaller, flanking)
    // Left escort
    ctx.save();
    ctx.translate(-60, -40);
    this.renderEscortShip(ctx, enginePulse);
    ctx.restore();

    // Right escort
    ctx.save();
    ctx.translate(-60, 40);
    this.renderEscortShip(ctx, enginePulse);
    ctx.restore();

    // Merchant markings/logo
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(-5, -8, 10, 16);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-3, -6, 6, 12);

    // Navigation lights
    ctx.fillStyle = '#ff3300';
    ctx.fillRect(-42, -22, 3, 3);
    ctx.fillStyle = '#00ff33';
    ctx.fillRect(-42, 19, 3, 3);

    ctx.restore();
  }

  /**
   * Helper: Render small escort ship for convoy
   */
  renderEscortShip(ctx, enginePulse) {
    // Small fighter-type escort
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-15, -8, 30, 16);

    // Wings
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(-12, -12, 20, 4);
    ctx.fillRect(-12, 8, 20, 4);

    // Cockpit
    ctx.fillStyle = '#004466';
    ctx.fillRect(8, -4, 6, 8);

    // Engine
    ctx.fillStyle = `rgba(100, 150, 255, ${enginePulse})`;
    ctx.fillRect(-17, -5, 4, 10);

    // Weapon hardpoint
    ctx.fillStyle = '#555555';
    ctx.fillRect(12, -3, 4, 2);
    ctx.fillRect(12, 1, 4, 2);
  }

  /**
   * Satellite - Small orbital platforms (Enhanced visibility)
   */
  renderSatellite(ctx, palette) {
    const scale = 1.2; // Larger for visibility
    ctx.save();
    ctx.scale(scale, scale);

    // Central body - darker metallic
    ctx.fillStyle = '#2a2a35';
    ctx.fillRect(-12, -12, 24, 24);

    // Corner details
    ctx.fillStyle = '#1a1a20';
    ctx.fillRect(-12, -12, 6, 6);
    ctx.fillRect(6, -12, 6, 6);
    ctx.fillRect(-12, 6, 6, 6);
    ctx.fillRect(6, 6, 6, 6);

    // Central sensor array
    ctx.fillStyle = '#3366aa';
    ctx.fillRect(-6, -6, 12, 12);

    // Sensor glow (pulsing)
    const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(51, 102, 170, ${pulse})`;
    ctx.fillRect(-4, -4, 8, 8);

    // Solar panels (extended)
    ctx.fillStyle = '#1a2633';
    // Left panel
    ctx.fillRect(-32, -8, 18, 16);
    // Right panel
    ctx.fillRect(14, -8, 18, 16);

    // Solar panel grid
    ctx.strokeStyle = '#0d3d5c';
    ctx.lineWidth = 1;
    for (let i = -30; i < -14; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, -8);
      ctx.lineTo(i, 8);
      ctx.stroke();
    }
    for (let i = 16; i < 32; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, -8);
      ctx.lineTo(i, 8);
      ctx.stroke();
    }

    // Antenna
    ctx.strokeStyle = '#4a4a55';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, -22);
    ctx.stroke();

    // Antenna tip (blinking)
    const blink = Math.floor(Date.now() / 500) % 2;
    if (blink) {
      ctx.fillStyle = '#aa2828';
      ctx.fillRect(-2, -24, 4, 4);
    }

    ctx.restore();
  }

  /**
   * Communication Relay - Larger satellite with dishes
   */
  renderCommRelay(ctx, palette) {
    const scale = 1.5;
    ctx.save();
    ctx.scale(scale, scale);

    // Main body - cylindrical shape
    ctx.fillStyle = '#2a2a35';
    ctx.fillRect(-15, -20, 30, 40);

    // Sections
    ctx.fillStyle = '#1a1a20';
    ctx.fillRect(-15, -20, 30, 4);
    ctx.fillRect(-15, -8, 30, 4);
    ctx.fillRect(-15, 4, 30, 4);
    ctx.fillRect(-15, 16, 30, 4);

    // Communication dishes (rotating)
    const rotation = Date.now() * 0.001;

    // Top dish
    ctx.save();
    ctx.translate(0, -25);
    ctx.rotate(rotation);
    ctx.fillStyle = '#3a3a42';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a2a35';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bottom dish
    ctx.save();
    ctx.translate(0, 25);
    ctx.rotate(-rotation);
    ctx.fillStyle = '#3a3a42';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a2a35';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Windows/sensors
    ctx.fillStyle = '#2a4a66';
    for (let y = -15; y < 15; y += 8) {
      ctx.fillRect(-10, y, 6, 4);
      ctx.fillRect(4, y, 6, 4);
    }

    // Transmission waves (visual effect)
    const wavePulse = (Date.now() % 2000) / 2000;
    ctx.strokeStyle = `rgba(51, 102, 170, ${1 - wavePulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 20 + wavePulse * 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Defense Platform - Weaponized station
   */
  renderDefensePlatform(ctx, palette) {
    const scale = 1.3;
    ctx.save();
    ctx.scale(scale, scale);

    // Central fortress structure
    ctx.fillStyle = '#2a2a35';
    ctx.fillRect(-25, -25, 50, 50);

    // Armor plating
    ctx.fillStyle = '#3a3a42';
    ctx.fillRect(-25, -25, 50, 8);
    ctx.fillRect(-25, 17, 50, 8);
    ctx.fillRect(-25, -25, 8, 50);
    ctx.fillRect(17, -25, 8, 50);

    // Corner towers
    ctx.fillStyle = '#1a1a20';
    ctx.fillRect(-30, -30, 12, 12);
    ctx.fillRect(18, -30, 12, 12);
    ctx.fillRect(-30, 18, 12, 12);
    ctx.fillRect(18, 18, 12, 12);

    // Weapon turrets (rotating)
    const turretRotation = Math.sin(Date.now() * 0.002) * 0.5;

    // Top-left turret
    ctx.save();
    ctx.translate(-24, -24);
    ctx.rotate(turretRotation);
    ctx.fillStyle = '#4a4a55';
    ctx.fillRect(-4, -6, 8, 12);
    ctx.fillStyle = '#aa2828';
    ctx.fillRect(-2, -8, 4, 4);
    ctx.restore();

    // Top-right turret
    ctx.save();
    ctx.translate(24, -24);
    ctx.rotate(-turretRotation);
    ctx.fillStyle = '#4a4a55';
    ctx.fillRect(-4, -6, 8, 12);
    ctx.fillStyle = '#aa2828';
    ctx.fillRect(-2, -8, 4, 4);
    ctx.restore();

    // Bottom turrets
    ctx.save();
    ctx.translate(-24, 24);
    ctx.rotate(turretRotation + Math.PI);
    ctx.fillStyle = '#4a4a55';
    ctx.fillRect(-4, -6, 8, 12);
    ctx.fillStyle = '#aa2828';
    ctx.fillRect(-2, -8, 4, 4);
    ctx.restore();

    ctx.save();
    ctx.translate(24, 24);
    ctx.rotate(-turretRotation + Math.PI);
    ctx.fillStyle = '#4a4a55';
    ctx.fillRect(-4, -6, 8, 12);
    ctx.fillStyle = '#aa2828';
    ctx.fillRect(-2, -8, 4, 4);
    ctx.restore();

    // Central command center
    ctx.fillStyle = '#2a4a66';
    ctx.fillRect(-10, -10, 20, 20);

    // Command center windows
    ctx.fillStyle = '#1a5588';
    ctx.fillRect(-8, -8, 6, 6);
    ctx.fillRect(2, -8, 6, 6);
    ctx.fillRect(-8, 2, 6, 6);
    ctx.fillRect(2, 2, 6, 6);

    // Shield generator (pulsing)
    const shieldPulse = Math.sin(Date.now() * 0.004) * 0.2 + 0.3;
    ctx.strokeStyle = `rgba(42, 187, 204, ${shieldPulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Orbital Shipyard - Massive construction facility (HEAVILY PIXELATED)
   */
  renderOrbitalShipyard(ctx, palette) {
    const scale = 1.4;
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.scale(scale, scale);

    // Main construction frame - enormous structure
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-90, -50, 180, 100);

    // Construction bay (open front)
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(-70, -35, 140, 70);

    // Structural girders (vertical)
    ctx.fillStyle = '#2a2a2a';
    for (let x = -85; x <= 85; x += 20) {
      ctx.fillRect(x, -50, 4, 100);
    }

    // Horizontal beams
    for (let y = -45; y <= 45; y += 20) {
      ctx.fillRect(-90, y, 180, 3);
    }

    // Construction arms (extending)
    ctx.fillStyle = '#333333';
    ctx.fillRect(-100, -15, 15, 30);
    ctx.fillRect(85, -15, 15, 30);

    // Robotic clamps
    ctx.fillStyle = '#444444';
    ctx.fillRect(-102, -20, 6, 12);
    ctx.fillRect(-102, 8, 6, 12);
    ctx.fillRect(96, -20, 6, 12);
    ctx.fillRect(96, 8, 6, 12);

    // Ship under construction (center)
    ctx.fillStyle = '#2d3342';
    ctx.fillRect(-35, -12, 70, 24);

    // Construction scaffolding around ship
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-40, -17, 80, 34);
    ctx.setLineDash([]);

    // Welding sparks (animated)
    if (Math.random() > 0.6) {
      const sparkX = -30 + Math.random() * 60;
      const sparkY = -10 + Math.random() * 20;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffff00' : '#ff8800';
      ctx.fillRect(sparkX, sparkY, 2, 2);
      ctx.fillRect(sparkX + 2, sparkY + 1, 2, 2);
    }

    // Work lights (blinking)
    const lightBlink = Math.floor(time * 3) % 3;
    for (let i = 0; i < 8; i++) {
      const x = -70 + i * 20;
      const brightness = (lightBlink === i % 3) ? 1 : 0.3;
      ctx.fillStyle = `rgba(255, 220, 100, ${brightness})`;
      ctx.fillRect(x, -48, 3, 3);
      ctx.fillRect(x, 45, 3, 3);
    }

    // Control tower (top)
    ctx.fillStyle = '#252525';
    ctx.fillRect(-25, -65, 50, 15);

    // Control windows
    ctx.fillStyle = '#006688';
    for (let x = -20; x < 20; x += 10) {
      ctx.fillRect(x, -62, 6, 8);
    }

    // Hazard stripes
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(-90, -52, 180, 4);
    ctx.fillRect(-90, 48, 180, 4);

    // Pixelated warning symbols
    ctx.fillStyle = '#ff3300';
    for (let i = 0; i < 6; i++) {
      const x = -75 + i * 30;
      ctx.fillRect(x, -50, 6, 2);
      ctx.fillRect(x + 2, -48, 2, 6);
    }

    ctx.restore();
  }

  /**
   * Medical Station - Hospital and bio-research (RED CROSS THEME)
   */
  renderMedicalStation(ctx, palette) {
    const scale = 1.2;
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.scale(scale, scale);

    // Main medical complex (white/clean appearance)
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(-50, -40, 100, 80);

    // Medical wings (cross shape)
    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(-70, -15, 20, 30);
    ctx.fillRect(50, -15, 20, 30);

    // Clean room sections
    ctx.fillStyle = '#f0f0f0';
    for (let x = -45; x < 45; x += 25) {
      for (let y = -35; y < 35; y += 25) {
        ctx.fillRect(x, y, 20, 20);
      }
    }

    // Medical cross (center - RED)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-8, -24, 16, 48);
    ctx.fillRect(-24, -8, 48, 16);

    // White border around cross
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-8, -24, 16, 48);
    ctx.strokeRect(-24, -8, 48, 16);

    // Bio-hazard containment (yellow panels)
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(-48, -38, 15, 12);
    ctx.fillRect(33, -38, 15, 12);

    // Bio-hazard symbol
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-40, -32, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(40, -32, 4, 0, Math.PI * 2);
    ctx.fill();

    // Sterile airlocks (blue sections)
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(-25, 35, 50, 8);

    // Life support indicators (pulsing green)
    const lifePulse = Math.sin(time * 2) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(0, 255, 0, ${lifePulse})`;
    for (let i = 0; i < 5; i++) {
      const x = -40 + i * 20;
      ctx.fillRect(x, -48, 4, 4);
    }

    // Medical bay windows
    ctx.fillStyle = '#88ccff';
    for (let x = -40; x < 40; x += 20) {
      for (let y = -30; y < 30; y += 20) {
        if (Math.abs(x) > 12 || Math.abs(y) > 12) { // Skip center (cross)
          ctx.fillRect(x, y, 8, 8);
        }
      }
    }

    // Emergency lights (red blinking)
    const emergencyBlink = Math.floor(time * 4) % 2;
    if (emergencyBlink) {
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-52, -42, 3, 3);
      ctx.fillRect(49, -42, 3, 3);
    }

    ctx.restore();
  }

  /**
   * Agricultural Station - Food production and hydroponics (GREEN)
   */
  renderAgriculturalStation(ctx, palette) {
    const scale = 1.3;
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.scale(scale, scale);

    // Main greenhouse structure
    ctx.fillStyle = '#2a3a2a';
    ctx.fillRect(-60, -35, 120, 70);

    // Transparent bio-domes (green tint)
    ctx.fillStyle = 'rgba(0, 150, 50, 0.3)';
    ctx.strokeStyle = '#00aa00';
    ctx.lineWidth = 2;

    // Left dome
    ctx.beginPath();
    ctx.arc(-30, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right dome
    ctx.beginPath();
    ctx.arc(30, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dome grid pattern
    ctx.strokeStyle = '#006600';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI;
      // Left dome
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-30 + Math.cos(angle) * 25, Math.sin(angle) * 25);
      ctx.stroke();
      // Right dome
      ctx.beginPath();
      ctx.moveTo(30, 0);
      ctx.lineTo(30 + Math.cos(angle) * 25, Math.sin(angle) * 25);
      ctx.stroke();
    }

    // Hydroponic arrays (center)
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(-15, -28, 30, 56);

    // Growing trays (stacked)
    ctx.fillStyle = '#00ff00';
    for (let y = -25; y < 25; y += 8) {
      ctx.fillRect(-12, y, 24, 4);
    }

    // Plant growth (random green pixels)
    ctx.fillStyle = '#33ff33';
    for (let i = 0; i < 30; i++) {
      const px = -10 + Math.random() * 20;
      const py = -25 + Math.random() * 50;
      ctx.fillRect(px, py, 2, 2);
    }

    // Water/nutrient tanks (blue)
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(-55, 25, 20, 12);
    ctx.fillRect(35, 25, 20, 12);

    // Tank level indicators
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-52, 28, 14, 6);
    ctx.fillRect(38, 28, 14, 6);

    // UV grow lights (purple glow - pulsing)
    const uvPulse = Math.sin(time * 3) * 0.2 + 0.6;
    ctx.fillStyle = `rgba(200, 0, 255, ${uvPulse})`;
    for (let x = -50; x <= 50; x += 25) {
      ctx.fillRect(x, -38, 10, 3);
    }

    // Atmosphere regulation vents
    ctx.fillStyle = '#004400';
    for (let i = 0; i < 4; i++) {
      const x = -45 + i * 30;
      ctx.fillRect(x, 32, 8, 6);
    }

    // Bio-monitoring sensors (blinking)
    const sensorBlink = Math.floor(time * 2) % 3;
    ctx.fillStyle = sensorBlink === 0 ? '#00ff00' : '#004400';
    ctx.fillRect(-58, -33, 3, 3);
    ctx.fillRect(55, -33, 3, 3);

    ctx.restore();
  }

  /**
   * Science Outpost - Deep space research (TECH FOCUSED)
   */
  renderScienceOutpost(ctx, palette) {
    const scale = 1.1;
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.scale(scale, scale);

    // Main observatory structure
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(-45, -30, 90, 60);

    // Research modules (modular design)
    const modules = [
      { x: -55, y: -15, w: 15, h: 30, color: '#2a2a3a' },
      { x: 40, y: -15, w: 15, h: 30, color: '#2a3a2a' },
      { x: -20, y: -45, w: 40, h: 15, color: '#3a2a2a' }
    ];

    modules.forEach(mod => {
      ctx.fillStyle = mod.color;
      ctx.fillRect(mod.x, mod.y, mod.w, mod.h);

      // Module windows
      ctx.fillStyle = '#4488ff';
      ctx.fillRect(mod.x + 3, mod.y + 3, mod.w - 6, mod.h - 6);
    });

    // Telescope array (top)
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(-8, -60, 16, 20);

    // Telescope lens
    ctx.fillStyle = '#000088';
    ctx.beginPath();
    ctx.arc(0, -50, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#4444ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -50, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Scanning array (rotating)
    const scanRotation = time * 0.5;
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(scanRotation);

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 35, Math.sin(angle) * 35);
      ctx.stroke();
    }

    ctx.restore();

    // Data transmission waves (pulsing)
    const wavePulse = (time * 2) % 1;
    ctx.strokeStyle = `rgba(0, 200, 255, ${1 - wavePulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -50, 15 + wavePulse * 25, 0, Math.PI * 2);
    ctx.stroke();

    // Laboratory windows (lit)
    ctx.fillStyle = '#66aaff';
    for (let x = -35; x < 35; x += 15) {
      for (let y = -20; y < 20; y += 15) {
        ctx.fillRect(x, y, 10, 10);
      }
    }

    // Data storage banks (bottom)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-40, 25, 80, 10);

    // Storage indicators (blinking data activity)
    for (let i = 0; i < 10; i++) {
      const dataActive = Math.floor(time * 10 + i) % 2;
      ctx.fillStyle = dataActive ? '#00ff00' : '#003300';
      ctx.fillRect(-38 + i * 8, 27, 3, 6);
    }

    // Particle beam emitter (experimental)
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(-3, 32, 6, 10);

    const beamPulse = Math.sin(time * 4) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 0, 255, ${beamPulse})`;
    ctx.fillRect(-2, 42, 4, 8);

    ctx.restore();
  }

  /**
   * Listening Post - Intelligence and surveillance (STEALTH)
   */
  renderListeningPost(ctx, palette) {
    const scale = 1.0;
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.scale(scale, scale);

    // Main stealth hull (dark, angular)
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(-40, -25, 80, 50);

    // Angular stealth panels
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-40, -25);
    ctx.lineTo(-30, -35);
    ctx.lineTo(30, -35);
    ctx.lineTo(40, -25);
    ctx.closePath();
    ctx.fill();

    // Sensor array (multiple dishes)
    const dishes = [
      { x: -25, y: -40, size: 12 },
      { x: 0, y: -45, size: 15 },
      { x: 25, y: -40, size: 12 }
    ];

    dishes.forEach((dish, idx) => {
      const dishRotation = time * 0.3 + idx;
      ctx.save();
      ctx.translate(dish.x, dish.y);
      ctx.rotate(dishRotation);

      // Dish surface
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.ellipse(0, 0, dish.size, dish.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dish grid
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, dish.size * (i + 1) / 3, dish.size * 0.6 * (i + 1) / 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });

    // Signal analysis chamber (center)
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(-20, -15, 40, 30);

    // Data stream visualization (flowing)
    const dataFlow = (time * 5) % 1;
    for (let i = 0; i < 8; i++) {
      const y = -12 + (i + dataFlow) * 5;
      if (y < 15) {
        const brightness = 1 - Math.abs((i + dataFlow - 4) / 4);
        ctx.fillStyle = `rgba(0, 255, 0, ${brightness * 0.6})`;
        ctx.fillRect(-15 + (i % 3) * 10, y, 6, 2);
      }
    }

    // Encryption modules (blinking)
    const encryptBlink = Math.floor(time * 3) % 2;
    ctx.fillStyle = encryptBlink ? '#ff0000' : '#330000';
    ctx.fillRect(-38, -5, 4, 10);
    ctx.fillRect(34, -5, 4, 10);

    // Stealth field generator (dark purple aura)
    const stealthPulse = Math.sin(time * 2) * 0.2 + 0.3;
    ctx.strokeStyle = `rgba(100, 0, 150, ${stealthPulse})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(-42, -27, 84, 54);

    // Communication beam (when transmitting)
    if (Math.sin(time * 1.5) > 0.5) {
      const beamAlpha = (Math.sin(time * 1.5) - 0.5) * 2;
      ctx.strokeStyle = `rgba(0, 150, 255, ${beamAlpha * 0.5})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -45);
      ctx.lineTo(0, -65);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Habitat Ring - Rotating living quarters (SPACE WHEEL)
   */
  renderHabitatRing(ctx, palette) {
    const scale = 1.4;
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.scale(scale, scale);

    // Rotate the entire ring
    ctx.rotate(time * 0.3);

    // Outer ring structure
    ctx.strokeStyle = '#445566';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Inner habitat band
    ctx.strokeStyle = '#556677';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Habitat segments (lit windows)
    const segments = 16;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * 50;
      const y = Math.sin(angle) * 50;

      // Segment lights (alternating colors)
      const isLit = (Math.floor(time * 2) + i) % 3 !== 0;
      ctx.fillStyle = isLit ? '#ffff88' : '#664400';
      ctx.fillRect(x - 3, y - 4, 6, 8);
    }

    // Spokes to central hub
    ctx.strokeStyle = '#334455';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 25, Math.sin(angle) * 25);
      ctx.lineTo(Math.cos(angle) * 50, Math.sin(angle) * 50);
      ctx.stroke();
    }

    // Central hub (stationary)
    ctx.rotate(-time * 0.3); // Counter-rotate hub
    ctx.fillStyle = '#445566';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    // Hub docking ports
    ctx.fillStyle = '#00ff00';
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      ctx.fillRect(
        Math.cos(angle) * 15 - 2,
        Math.sin(angle) * 15 - 2,
        4, 4
      );
    }

    ctx.restore();
  }

  /**
   * Fuel Depot - Massive fuel storage (INDUSTRIAL)
   */
  renderFuelDepot(ctx, palette) {
    const scale = 1.3;
    const time = Date.now() * 0.001;
    ctx.save();
    ctx.scale(scale, scale);

    // Main platform
    ctx.fillStyle = '#2a2a1a';
    ctx.fillRect(-60, -20, 120, 40);

    // Fuel tanks (large cylinders)
    const tanks = [
      { x: -40, y: 0, fuel: 0.8, type: 'deuterium' },
      { x: -13, y: 0, fuel: 0.6, type: 'antimatter' },
      { x: 14, y: 0, fuel: 0.9, type: 'hydrogen' },
      { x: 40, y: 0, fuel: 0.4, type: 'plasma' }
    ];

    tanks.forEach(tank => {
      // Tank body
      ctx.fillStyle = tank.type === 'antimatter' ? '#440044' : '#3a3a2a';
      ctx.fillRect(tank.x - 10, -30, 20, 60);

      // Tank top (dome)
      ctx.fillStyle = '#2a2a1a';
      ctx.beginPath();
      ctx.arc(tank.x, -30, 10, Math.PI, 0);
      ctx.fill();

      // Fuel level indicator
      const fuelHeight = 50 * tank.fuel;
      const fuelColor = tank.type === 'antimatter' ? '#ff00ff' :
                        tank.type === 'plasma' ? '#ff8800' :
                        tank.type === 'deuterium' ? '#0088ff' : '#88ff88';
      ctx.fillStyle = fuelColor;
      ctx.fillRect(tank.x - 9, 30 - fuelHeight, 18, fuelHeight);

      // Level gauge
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1;
      for (let y = -25; y < 30; y += 10) {
        ctx.beginPath();
        ctx.moveTo(tank.x - 11, y);
        ctx.lineTo(tank.x - 13, y);
        ctx.stroke();
      }
    });

    // Pumping station (center)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-8, -10, 16, 20);

    // Pipes connecting tanks
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    for (let i = 0; i < tanks.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(tanks[i].x, 25);
      ctx.lineTo(tanks[i + 1].x, 25);
      ctx.stroke();
    }

    // Pressure valves
    ctx.fillStyle = '#ff0000';
    tanks.forEach(tank => {
      ctx.beginPath();
      ctx.arc(tank.x, 25, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Warning lights (blinking)
    const warnBlink = Math.floor(time * 4) % 2;
    if (warnBlink) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(-62, -22, 4, 4);
      ctx.fillRect(58, -22, 4, 4);
    }

    // Fuel transfer in progress (animated flow)
    const flowPhase = (time * 2) % 1;
    for (let i = 0; i < 5; i++) {
      const x = -40 + (i + flowPhase) * 20;
      if (x < 40) {
        ctx.fillStyle = `rgba(100, 200, 255, ${1 - flowPhase})`;
        ctx.fillRect(x, 23, 4, 4);
      }
    }

    ctx.restore();
  }
}
