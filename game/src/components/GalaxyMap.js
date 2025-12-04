import React, { useEffect, useRef, useState } from 'react';

/**
 * Enhanced Galaxy Map Component
 * - Realistic galaxy background with nebulae and dust clouds
 * - Zoom and pan functionality
 * - Detailed star system rendering
 * - Improved UI and information panels
 */
const GalaxyMap = ({ galaxy, currentSystemIndex, onSelectSystem, onClose }) => {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Warp animation state
  const [warpState, setWarpState] = useState({
    active: false,
    progress: 0, // 0 to 1
    fromSystem: null,
    toSystem: null,
    phase: 'idle' // 'idle', 'accelerating', 'hyperspace', 'decelerating'
  });

  // Filter state
  const [filters, setFilters] = useState({
    // Discovery status
    showDiscovered: true,
    showUndiscovered: true,
    showVisited: true,
    // Danger level
    showLowDanger: true,    // 1-3
    showMedDanger: true,    // 4-6
    showHighDanger: true,   // 7-10
    // Special features
    showBlackHoles: true,
    showMegastructures: true,
    showHiveAliens: true,
    showNormal: true,
    // Star types
    showMClass: true,
    showKClass: true,
    showGClass: true,
    showFClass: true,
    showAClass: true,
  });

  // Visualization toggles
  const [showTradeRoutes, setShowTradeRoutes] = useState(false);
  const [showTerritories, setShowTerritories] = useState(false);

  // Generate trade routes (memoized)
  const tradeRoutes = React.useMemo(() => {
    const routes = [];

    for (let i = 0; i < galaxy.length; i++) {
      const sys1 = galaxy[i];
      if (!sys1.discovered) continue;

      for (let j = i + 1; j < galaxy.length; j++) {
        const sys2 = galaxy[j];
        if (!sys2.discovered) continue;

        const dx = sys2.position.x - sys1.position.x;
        const dy = sys2.position.y - sys1.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Trade likelihood based on multiple factors
        const maxTradeDistance = 4000;
        if (dist > maxTradeDistance) continue;

        // Calculate trade value (0-1)
        const distanceFactor = 1 - (dist / maxTradeDistance);
        const resourceFactor = (sys1.resourceRichness + sys2.resourceRichness) / 2;
        const stationFactor = ((sys1.stationCount || 0) + (sys2.stationCount || 0)) / 16;
        const dangerPenalty = 1 - ((sys1.dangerLevel + sys2.dangerLevel) / 20);

        const tradeValue = distanceFactor * 0.3 + resourceFactor * 0.3 +
                          stationFactor * 0.2 + dangerPenalty * 0.2;

        // Only show significant trade routes
        if (tradeValue > 0.4) {
          routes.push({
            from: i,
            to: j,
            value: tradeValue,
            importance: tradeValue > 0.7 ? 'high' : tradeValue > 0.55 ? 'medium' : 'low'
          });
        }
      }
    }

    return routes;
  }, [galaxy]);

  // Generate faction territories (memoized)
  const territories = React.useMemo(() => {
    const factions = [
      { name: 'United Terran Coalition', color: '#4488ff', claim: [] },
      { name: 'Independent Worlds', color: '#44ff88', claim: [] },
      { name: 'Mining Consortium', color: '#ffaa44', claim: [] },
      { name: 'Hive Collectives', color: '#ff4444', claim: [] },
      { name: 'Neutral Zone', color: '#888888', claim: [] }
    ];

    // Assign systems to factions based on properties
    galaxy.forEach((sys, index) => {
      if (!sys.discovered) return;

      if (sys.hasHiveAliens) {
        factions[3].claim.push(index); // Hive
      } else if (sys.resourceRichness > 0.7 && (sys.stationCount || 0) > 5) {
        factions[2].claim.push(index); // Mining Consortium
      } else if (sys.dangerLevel > 6 || !sys.visited) {
        factions[4].claim.push(index); // Neutral/Unclaimed
      } else if (index === 0 || (sys.hasMegastructure && sys.visited)) {
        factions[0].claim.push(index); // Terran Coalition
      } else {
        factions[1].claim.push(index); // Independent
      }
    });

    return factions.filter(f => f.claim.length > 0);
  }, [galaxy]);

  // Warp animation progression
  useEffect(() => {
    if (!warpState.active) return;

    const animationDuration = 3000; // 3 seconds total
    const startTime = Date.now();
    const targetSystem = warpState.toSystem;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Determine phase based on progress
      let phase = 'accelerating';
      if (progress < 0.2) {
        phase = 'accelerating';
      } else if (progress < 0.8) {
        phase = 'hyperspace';
      } else {
        phase = 'decelerating';
      }

      setWarpState(prev => ({
        ...prev,
        progress,
        phase
      }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete - actually change system
        if (targetSystem !== null) {
          onSelectSystem(targetSystem);
        }
        // Reset warp state
        setWarpState({
          active: false,
          progress: 0,
          fromSystem: null,
          toSystem: null,
          phase: 'idle'
        });
      }
    };

    requestAnimationFrame(animate);
  }, [warpState.active, warpState.toSystem, onSelectSystem]);

  // Intercept system selection to trigger warp animation
  const handleSystemSelect = (systemIndex) => {
    if (systemIndex === currentSystemIndex) return;

    setWarpState({
      active: true,
      progress: 0,
      fromSystem: currentSystemIndex,
      toSystem: systemIndex,
      phase: 'accelerating'
    });
  };

  // Filter checking function
  const passesFilters = (system, index) => {
    // Always show current system
    if (index === currentSystemIndex) return true;

    // Discovery status filter
    if (system.discovered && system.visited && !filters.showVisited) return false;
    if (system.discovered && !system.visited && !filters.showDiscovered) return false;
    if (!system.discovered && !filters.showUndiscovered) return false;

    // Danger level filter
    const danger = system.dangerLevel || 0;
    if (danger <= 3 && !filters.showLowDanger) return false;
    if (danger >= 4 && danger <= 6 && !filters.showMedDanger) return false;
    if (danger >= 7 && !filters.showHighDanger) return false;

    // Special features filter
    const hasSpecial = system.hasBlackhole || system.hasMegastructure || system.hasHiveAliens;
    if (system.hasBlackhole && !filters.showBlackHoles) return false;
    if (system.hasMegastructure && !filters.showMegastructures) return false;
    if (system.hasHiveAliens && !filters.showHiveAliens) return false;
    if (!hasSpecial && !filters.showNormal) return false;

    // Star type filter
    const starClass = system.starType?.class || 'G';
    if (starClass === 'M' && !filters.showMClass) return false;
    if (starClass === 'K' && !filters.showKClass) return false;
    if (starClass === 'G' && !filters.showGClass) return false;
    if (starClass === 'F' && !filters.showFClass) return false;
    if (starClass === 'A' && !filters.showAClass) return false;

    return true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size
    const width = 1200;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // === REALISTIC GALAXY BACKGROUND ===

    // Deep space gradient
    const bgGradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );
    bgGradient.addColorStop(0, '#0a0a1a');
    bgGradient.addColorStop(0.5, '#050510');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Nebula clouds (multi-colored, layered)
    const nebulaClouds = [
      { x: width * 0.3, y: height * 0.4, size: 300, color: '#1a0a2a', opacity: 0.3 },
      { x: width * 0.7, y: height * 0.6, size: 250, color: '#0a1a2a', opacity: 0.25 },
      { x: width * 0.5, y: height * 0.3, size: 200, color: '#2a0a1a', opacity: 0.2 },
      { x: width * 0.2, y: height * 0.7, size: 220, color: '#0a2a1a', opacity: 0.22 },
      { x: width * 0.8, y: height * 0.2, size: 180, color: '#1a1a0a', opacity: 0.18 },
    ];

    nebulaClouds.forEach(cloud => {
      const nebulaGradient = ctx.createRadialGradient(
        cloud.x, cloud.y, 0,
        cloud.x, cloud.y, cloud.size
      );
      nebulaGradient.addColorStop(0, `${cloud.color}${Math.floor(cloud.opacity * 255).toString(16).padStart(2, '0')}`);
      nebulaGradient.addColorStop(0.5, `${cloud.color}${Math.floor(cloud.opacity * 128).toString(16).padStart(2, '0')}`);
      nebulaGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = nebulaGradient;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dust lanes (dark streaks)
    ctx.strokeStyle = '#05050a';
    ctx.lineWidth = 40;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const startDist = 100;
      const endDist = Math.max(width, height) / 2;

      ctx.beginPath();
      ctx.moveTo(
        width / 2 + Math.cos(angle) * startDist,
        height / 2 + Math.sin(angle) * startDist
      );
      ctx.lineTo(
        width / 2 + Math.cos(angle) * endDist,
        height / 2 + Math.sin(angle) * endDist
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Background starfield (dense)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1.5;
      const brightness = Math.random();

      ctx.globalAlpha = brightness * 0.7;
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;

    // Colored stars (rare, bright)
    const coloredStars = [
      '#ff8844', '#44ff88', '#8844ff', '#ff4488', '#88ff44', '#4488ff'
    ];
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const color = coloredStars[Math.floor(Math.random() * coloredStars.length)];
      const size = 1 + Math.random() * 2;

      const starGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      starGlow.addColorStop(0, color);
      starGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = starGlow;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }

    // === GALAXY STRUCTURE ===

    // Calculate map bounds
    const minX = Math.min(...galaxy.map(s => s.position.x));
    const maxX = Math.max(...galaxy.map(s => s.position.x));
    const minY = Math.min(...galaxy.map(s => s.position.y));
    const maxY = Math.max(...galaxy.map(s => s.position.y));

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const baseScale = Math.min((width - 200) / rangeX, (height - 200) / rangeY);
    const scale = baseScale * zoom;

    // Apply pan offset
    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;

    // Draw galaxy spiral arms (enhanced, more realistic)
    ctx.strokeStyle = '#2a3a5a';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3;
    for (let arm = 0; arm < 4; arm++) {
      const armOffset = arm * (Math.PI / 2);

      // Main spiral
      ctx.beginPath();
      for (let i = 0; i <= 150; i++) {
        const t = i / 150;
        const angle = armOffset + t * Math.PI * 5;
        const radius = t * Math.max(rangeX, rangeY) / 2;
        const x = centerX + Math.cos(angle) * radius * scale;
        const y = centerY + Math.sin(angle) * radius * scale;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Spiral glow
      ctx.strokeStyle = '#1a2a4a';
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.15;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Galactic core (bright center)
    const coreGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 80 * zoom
    );
    coreGradient.addColorStop(0, '#ffffee');
    coreGradient.addColorStop(0.3, '#ffdd88');
    coreGradient.addColorStop(0.6, '#ff8844');
    coreGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // === WARP LANES (connections) ===
    ctx.strokeStyle = '#336699';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.25;

    for (let i = 0; i < galaxy.length; i++) {
      const system1 = galaxy[i];
      if (!system1.discovered) continue;
      if (!passesFilters(system1, i)) continue; // Filter check

      const x1 = centerX + (system1.position.x - (minX + maxX) / 2) * scale;
      const y1 = centerY + (system1.position.y - (minY + maxY) / 2) * scale;

      for (let j = i + 1; j < galaxy.length; j++) {
        const system2 = galaxy[j];
        if (!system2.discovered) continue;
        if (!passesFilters(system2, j)) continue; // Filter check

        const dx = system2.position.x - system1.position.x;
        const dy = system2.position.y - system1.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Draw connection if systems are close
        if (dist < 3000) {
          const x2 = centerX + (system2.position.x - (minX + maxX) / 2) * scale;
          const y2 = centerY + (system2.position.y - (minY + maxY) / 2) * scale;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;

    // === TERRITORIAL BOUNDARIES ===
    if (showTerritories) {
      territories.forEach(faction => {
        if (faction.claim.length === 0) return;

        // Calculate territory center and radius
        let territoryX = 0, territoryY = 0;
        faction.claim.forEach(idx => {
          const sys = galaxy[idx];
          territoryX += sys.position.x;
          territoryY += sys.position.y;
        });
        territoryX /= faction.claim.length;
        territoryY /= faction.claim.length;

        // Find max distance from center
        let maxDist = 0;
        faction.claim.forEach(idx => {
          const sys = galaxy[idx];
          const dx = sys.position.x - territoryX;
          const dy = sys.position.y - territoryY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          maxDist = Math.max(maxDist, dist);
        });

        // Draw territory circle
        const tx = centerX + (territoryX - (minX + maxX) / 2) * scale;
        const ty = centerY + (territoryY - (minY + maxY) / 2) * scale;
        const radius = (maxDist + 800) * scale;

        ctx.strokeStyle = faction.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.arc(tx, ty, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Faction name
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = faction.color;
        ctx.font = 'bold 14px DigitalDisco, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(faction.name.toUpperCase(), tx, ty - radius - 10);
        ctx.globalAlpha = 1;
      });
    }

    // === TRADE ROUTES ===
    if (showTradeRoutes) {
      const time = Date.now() / 1000;

      tradeRoutes.forEach(route => {
        const sys1 = galaxy[route.from];
        const sys2 = galaxy[route.to];

        const x1 = centerX + (sys1.position.x - (minX + maxX) / 2) * scale;
        const y1 = centerY + (sys1.position.y - (minY + maxY) / 2) * scale;
        const x2 = centerX + (sys2.position.x - (minX + maxX) / 2) * scale;
        const y2 = centerY + (sys2.position.y - (minY + maxY) / 2) * scale;

        // Color and width based on importance
        const colors = {
          high: '#ffdd44',
          medium: '#88ccff',
          low: '#666688'
        };
        const widths = {
          high: 3,
          medium: 2,
          low: 1
        };

        ctx.strokeStyle = colors[route.importance];
        ctx.lineWidth = widths[route.importance];
        ctx.globalAlpha = 0.6;

        // Animated dashed line
        const dashOffset = (time * 20) % 20;
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = -dashOffset;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;

        // Arrow indicators for high-value routes
        if (route.importance === 'high') {
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const angle = Math.atan2(y2 - y1, x2 - x1);

          ctx.save();
          ctx.translate(midX, midY);
          ctx.rotate(angle);
          ctx.fillStyle = colors.high;
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(-4, -6);
          ctx.lineTo(-4, 6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      ctx.globalAlpha = 1;
    }

    // === STAR SYSTEMS ===
    galaxy.forEach((system, index) => {
      // Apply filters
      if (!passesFilters(system, index)) return;

      const x = centerX + (system.position.x - (minX + maxX) / 2) * scale;
      const y = centerY + (system.position.y - (minY + maxY) / 2) * scale;

      // Skip if off-screen
      if (x < -50 || x > width + 50 || y < -50 || y > height + 50) return;

      if (system.discovered) {
        // System glow (more intense for discovered)
        const glowSize = (index === currentSystemIndex ? 30 : 20) * zoom;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        gradient.addColorStop(0, system.starColor + 'cc');
        gradient.addColorStop(0.5, system.starColor + '44');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        const starSize = (index === currentSystemIndex ? 8 : 6) * Math.min(zoom, 2);
        ctx.fillStyle = system.starColor;
        ctx.beginPath();
        ctx.arc(x, y, starSize, 0, Math.PI * 2);
        ctx.fill();

        // Star highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - starSize * 0.3, y - starSize * 0.3, starSize * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Current system indicator (pulsing)
        if (index === currentSystemIndex) {
          const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
          ctx.strokeStyle = `#00ffff${Math.floor(pulse * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 3 * Math.min(zoom, 2);
          ctx.beginPath();
          ctx.arc(x, y, 20 * zoom, 0, Math.PI * 2);
          ctx.stroke();

          // Outer ring
          ctx.strokeStyle = `#00ffff${Math.floor(pulse * 128).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 2 * Math.min(zoom, 2);
          ctx.beginPath();
          ctx.arc(x, y, 28 * zoom, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Discovered but not visited
        if (system.discovered && !system.visited && index !== currentSystemIndex) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 2 * Math.min(zoom, 2);
          ctx.beginPath();
          ctx.arc(x, y, 15 * zoom, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Special system markers
        if (system.hasBlackhole) {
          const bhSize = 12 * Math.min(zoom, 2);
          ctx.strokeStyle = '#ff00ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, bhSize, 0, Math.PI * 2);
          ctx.stroke();

          // Accretion disk hint
          ctx.strokeStyle = '#ff00ff44';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, bhSize + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (system.hasMegastructure) {
          const megaSize = 10 * Math.min(zoom, 2);
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.rect(x - megaSize, y - megaSize, megaSize * 2, megaSize * 2);
          ctx.stroke();
        }

        if (system.hasHiveAliens) {
          const hiveSize = 12 * Math.min(zoom, 2);
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.moveTo(x, y - hiveSize);
          ctx.lineTo(x - hiveSize * 0.8, y + hiveSize);
          ctx.lineTo(x + hiveSize * 0.8, y + hiveSize);
          ctx.closePath();
          ctx.fill();
        }

        // System name (only at higher zoom)
        if (zoom >= 1.5 && system.discovered) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px DigitalDisco, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(system.name, x, y + 35 * zoom);
        }
      } else {
        // Undiscovered systems (faded, no detail)
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.arc(x, y, 4 * Math.min(zoom, 1.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });

    // === UI OVERLAY ===

    // Title
    ctx.fillStyle = '#4488ff';
    ctx.font = 'bold 28px DigitalDisco, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GALACTIC CARTOGRAPHY', width / 2, 35);

    // Subtitle with filter count
    const visibleCount = galaxy.filter((s, i) => passesFilters(s, i)).length;
    const discoveredCount = galaxy.filter(s => s.discovered).length;
    ctx.font = '14px DigitalDisco, monospace';
    ctx.fillStyle = '#8899aa';
    const subtitleText = visibleCount < galaxy.length
      ? `Systems: ${visibleCount}/${galaxy.length} | Discovered: ${discoveredCount} | Zoom: ${(zoom * 100).toFixed(0)}% | FILTERED`
      : `Systems: ${galaxy.length} | Discovered: ${discoveredCount} | Zoom: ${(zoom * 100).toFixed(0)}%`;
    ctx.fillText(subtitleText, width / 2, 60);

  }, [galaxy, currentSystemIndex, zoom, pan, filters, showTradeRoutes, showTerritories, tradeRoutes, territories, passesFilters]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Calculate same scaling as render
    const width = 1200;
    const height = 800;

    const minX = Math.min(...galaxy.map(s => s.position.x));
    const maxX = Math.max(...galaxy.map(s => s.position.x));
    const minY = Math.min(...galaxy.map(s => s.position.y));
    const maxY = Math.max(...galaxy.map(s => s.position.y));

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const baseScale = Math.min((width - 200) / rangeX, (height - 200) / rangeY);
    const scale = baseScale * zoom;

    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;

    // Check if clicked on a system
    for (let i = 0; i < galaxy.length; i++) {
      const system = galaxy[i];
      const x = centerX + (system.position.x - (minX + maxX) / 2) * scale;
      const y = centerY + (system.position.y - (minY + maxY) / 2) * scale;

      const dx = clickX - x;
      const dy = clickY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 25 * zoom) {
        if (system.discovered) {
          if (e.shiftKey) {
            // Shift+click to travel with warp animation
            handleSystemSelect(i);
          } else {
            // Click to show info
            setSelectedInfo(i);
          }
        }
        break;
      }
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3.0, prev + delta)));
  };

  // Filter toggle functions
  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setAllFilters = (value) => {
    setFilters(prev => {
      const newFilters = {};
      for (const key in prev) {
        newFilters[key] = value;
      }
      return newFilters;
    });
  };

  const setDangerousOnly = () => {
    setFilters({
      showDiscovered: true,
      showUndiscovered: true,
      showVisited: true,
      showLowDanger: false,
      showMedDanger: false,
      showHighDanger: true,
      showBlackHoles: true,
      showMegastructures: true,
      showHiveAliens: true,
      showNormal: false,
      showMClass: true,
      showKClass: true,
      showGClass: true,
      showFClass: true,
      showAClass: true,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.98)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          border: '3px solid #4488ff',
          cursor: isDragging ? 'grabbing' : 'grab',
          imageRendering: 'pixelated',
          boxShadow: '0 0 30px rgba(68, 136, 255, 0.5)'
        }}
      />

      <div style={{
        marginTop: '20px',
        color: '#ffffff',
        fontSize: '14px',
        fontFamily: 'monospace',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '10px', color: '#4488ff' }}>
          CLICK: View Info | SHIFT+CLICK: Travel | DRAG: Pan | SCROLL: Zoom | Use FILTERS to search
        </div>
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => setShowTradeRoutes(!showTradeRoutes)}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              fontFamily: 'monospace',
              backgroundColor: showTradeRoutes ? '#ffaa44' : '#443322',
              color: '#ffffff',
              border: showTradeRoutes ? '2px solid #ffdd66' : '2px solid #665544',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: showTradeRoutes ? '0 0 15px rgba(255, 170, 68, 0.4)' : 'none'
            }}
            onMouseOver={(e) => e.target.style.filter = 'brightness(1.2)'}
            onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
          >
            {showTradeRoutes ? '✓' : '○'} TRADE ROUTES
          </button>
          <button
            onClick={() => setShowTerritories(!showTerritories)}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              fontFamily: 'monospace',
              backgroundColor: showTerritories ? '#4488ff' : '#223344',
              color: '#ffffff',
              border: showTerritories ? '2px solid #66aaff' : '2px solid #445566',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: showTerritories ? '0 0 15px rgba(68, 136, 255, 0.4)' : 'none'
            }}
            onMouseOver={(e) => e.target.style.filter = 'brightness(1.2)'}
            onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
          >
            {showTerritories ? '✓' : '○'} TERRITORIES
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '12px 35px',
            fontSize: '16px',
            fontFamily: 'monospace',
            backgroundColor: '#336699',
            color: '#ffffff',
            border: '3px solid #4488ff',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 0 15px rgba(68, 136, 255, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#4488ff'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#336699'}
        >
          CLOSE MAP [M]
        </button>
      </div>

      {/* Current system info panel */}
      {galaxy[currentSystemIndex] && (
        <div style={{
          position: 'absolute',
          top: '100px',
          right: '50px',
          backgroundColor: 'rgba(10, 10, 30, 0.95)',
          border: '3px solid #4488ff',
          padding: '20px',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '12px',
          minWidth: '280px',
          boxShadow: '0 0 20px rgba(68, 136, 255, 0.4)'
        }}>
          <div style={{ color: '#4488ff', fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', borderBottom: '2px solid #4488ff', paddingBottom: '8px' }}>
            CURRENT LOCATION
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#33aa33' }}>NAME:</span> {galaxy[currentSystemIndex].name}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#33aa33' }}>STAR:</span> {galaxy[currentSystemIndex].starType.class}-class
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#33aa33' }}>TEMP:</span> {galaxy[currentSystemIndex].starType.temperature}K
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#33aa33' }}>PLANETS:</span> {galaxy[currentSystemIndex].planetCount}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#33aa33' }}>DANGER:</span> <span style={{ color: galaxy[currentSystemIndex].dangerLevel > 7 ? '#ff3333' : galaxy[currentSystemIndex].dangerLevel > 4 ? '#ffaa00' : '#33aa33' }}>[{galaxy[currentSystemIndex].dangerLevel}/10]</span>
          </div>
          {galaxy[currentSystemIndex].hasMegastructure && (
            <div style={{ color: '#00ff00', marginTop: '12px', padding: '6px', backgroundColor: 'rgba(0, 255, 0, 0.1)', border: '1px solid #00ff00' }}>
              ✦ MEGASTRUCTURE DETECTED
            </div>
          )}
          {galaxy[currentSystemIndex].hasBlackhole && (
            <div style={{ color: '#ff00ff', marginTop: '12px', padding: '6px', backgroundColor: 'rgba(255, 0, 255, 0.1)', border: '1px solid #ff00ff' }}>
              ⚫ BLACK HOLE PRESENT
            </div>
          )}
          {galaxy[currentSystemIndex].hasHiveAliens && (
            <div style={{ color: '#ff0000', marginTop: '12px', padding: '6px', backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff0000' }}>
              ⚠ HIVE INFESTATION
            </div>
          )}
        </div>
      )}

      {/* Selected system info panel */}
      {selectedInfo !== null && galaxy[selectedInfo] && (
        <div style={{
          position: 'absolute',
          top: '100px',
          left: '50px',
          backgroundColor: 'rgba(10, 10, 30, 0.95)',
          border: '3px solid #44aaff',
          padding: '20px',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '12px',
          minWidth: '280px',
          boxShadow: '0 0 20px rgba(68, 170, 255, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ color: '#44aaff', fontSize: '18px', fontWeight: 'bold' }}>
              SYSTEM INTEL
            </div>
            <button
              onClick={() => setSelectedInfo(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff4444',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0 5px'
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ borderBottom: '2px solid #44aaff', paddingBottom: '8px', marginBottom: '8px' }}></div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#33aa33' }}>NAME:</span> {galaxy[selectedInfo].name}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#33aa33' }}>STAR:</span> {galaxy[selectedInfo].starType.class}-class
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#33aa33' }}>TEMP:</span> {galaxy[selectedInfo].starType.temperature}K
          </div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ color: '#33aa33' }}>PLANETS:</span> {galaxy[selectedInfo].planetCount}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ color: '#33aa33' }}>DANGER:</span> <span style={{ color: galaxy[selectedInfo].dangerLevel > 7 ? '#ff3333' : galaxy[selectedInfo].dangerLevel > 4 ? '#ffaa00' : '#33aa33' }}>[{galaxy[selectedInfo].dangerLevel}/10]</span>
          </div>
          {galaxy[selectedInfo].hasMegastructure && (
            <div style={{ color: '#00ff00', marginTop: '8px', fontSize: '11px' }}>
              ✦ Megastructure Present
            </div>
          )}
          {galaxy[selectedInfo].hasBlackhole && (
            <div style={{ color: '#ff00ff', marginTop: '8px', fontSize: '11px' }}>
              ⚫ Black Hole Detected
            </div>
          )}
          {galaxy[selectedInfo].hasHiveAliens && (
            <div style={{ color: '#ff0000', marginTop: '8px', fontSize: '11px' }}>
              ⚠ Hive Infestation
            </div>
          )}
          <button
            onClick={() => handleSystemSelect(selectedInfo)}
            style={{
              marginTop: '15px',
              width: '100%',
              padding: '10px',
              backgroundColor: '#336699',
              color: '#ffffff',
              border: '2px solid #44aaff',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#44aaff'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#336699'}
          >
            TRAVEL TO SYSTEM
          </button>
        </div>
      )}

      {/* Filter Panel */}
      <div style={{
        position: 'absolute',
        top: '100px',
        left: '30px',
        backgroundColor: 'rgba(10, 10, 30, 0.95)',
        border: '3px solid #44ff88',
        padding: '15px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '11px',
        maxHeight: '550px',
        overflowY: 'auto',
        boxShadow: '0 0 20px rgba(68, 255, 136, 0.3)',
        width: showFilters ? '240px' : 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ color: '#44ff88', fontWeight: 'bold', fontSize: '13px' }}>
            FILTERS
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: 'none',
              border: '1px solid #44ff88',
              color: '#44ff88',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '2px 8px',
              fontFamily: 'monospace'
            }}
          >
            {showFilters ? '▼' : '▶'}
          </button>
        </div>

        {showFilters && (
          <>
            {/* Quick presets */}
            <div style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #44ff8844' }}>
              <button
                onClick={() => setAllFilters(true)}
                style={{
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  backgroundColor: '#336699',
                  color: '#ffffff',
                  border: '1px solid #44ff88',
                  cursor: 'pointer',
                  marginRight: '5px',
                  marginBottom: '5px'
                }}
              >
                ALL
              </button>
              <button
                onClick={() => setAllFilters(false)}
                style={{
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  backgroundColor: '#336699',
                  color: '#ffffff',
                  border: '1px solid #44ff88',
                  cursor: 'pointer',
                  marginRight: '5px',
                  marginBottom: '5px'
                }}
              >
                NONE
              </button>
              <button
                onClick={setDangerousOnly}
                style={{
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  backgroundColor: '#663333',
                  color: '#ffffff',
                  border: '1px solid #ff4444',
                  cursor: 'pointer',
                  marginBottom: '5px'
                }}
              >
                DANGER
              </button>
            </div>

            {/* Discovery Status */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: '#44aaff', fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>
                DISCOVERY STATUS
              </div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showDiscovered}
                  onChange={() => toggleFilter('showDiscovered')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span>Discovered</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showVisited}
                  onChange={() => toggleFilter('showVisited')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span>Visited</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showUndiscovered}
                  onChange={() => toggleFilter('showUndiscovered')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span>Undiscovered</span>
              </label>
            </div>

            {/* Danger Level */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: '#ffaa00', fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>
                DANGER LEVEL
              </div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showLowDanger}
                  onChange={() => toggleFilter('showLowDanger')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#33aa33' }}>Low (1-3)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showMedDanger}
                  onChange={() => toggleFilter('showMedDanger')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#ffaa00' }}>Medium (4-6)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showHighDanger}
                  onChange={() => toggleFilter('showHighDanger')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#ff3333' }}>High (7-10)</span>
              </label>
            </div>

            {/* Special Features */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ color: '#ff44ff', fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>
                SPECIAL FEATURES
              </div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showBlackHoles}
                  onChange={() => toggleFilter('showBlackHoles')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#ff00ff' }}>Black Holes</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showMegastructures}
                  onChange={() => toggleFilter('showMegastructures')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#00ff00' }}>Megastructures</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showHiveAliens}
                  onChange={() => toggleFilter('showHiveAliens')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#ff0000' }}>Hive Aliens</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showNormal}
                  onChange={() => toggleFilter('showNormal')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span>Normal Systems</span>
              </label>
            </div>

            {/* Star Types */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ color: '#ffdd88', fontWeight: 'bold', marginBottom: '6px', fontSize: '11px' }}>
                STAR CLASS
              </div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showMClass}
                  onChange={() => toggleFilter('showMClass')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#ff8844' }}>M-class (Red)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showKClass}
                  onChange={() => toggleFilter('showKClass')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#ffaa44' }}>K-class (Orange)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showGClass}
                  onChange={() => toggleFilter('showGClass')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#ffff44' }}>G-class (Yellow)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showFClass}
                  onChange={() => toggleFilter('showFClass')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#ffffaa' }}>F-class (Yellow-White)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showAClass}
                  onChange={() => toggleFilter('showAClass')}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                <span style={{ color: '#aaddff' }}>A-class (White)</span>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '30px',
        backgroundColor: 'rgba(10, 10, 30, 0.9)',
        border: '2px solid #4488ff',
        padding: '15px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '11px',
        boxShadow: '0 0 15px rgba(68, 136, 255, 0.3)'
      }}>
        <div style={{ color: '#4488ff', fontWeight: 'bold', marginBottom: '10px', fontSize: '13px' }}>LEGEND</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#00ffff', marginRight: '10px', border: '2px solid #00ffff' }}></div>
          <span>Current System</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#ffff00', marginRight: '10px', border: '2px solid #ffff00' }}></div>
          <span>Discovered</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#666666', marginRight: '10px', opacity: 0.5 }}></div>
          <span>Undiscovered</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #ff00ff', marginRight: '10px' }}></div>
          <span>Black Hole</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #00ff00', marginRight: '10px' }}></div>
          <span>Megastructure</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '0', height: '0', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '16px solid #ff0000', marginRight: '10px', marginLeft: '4px' }}></div>
          <span>Hive Aliens</span>
        </div>
      </div>

      {/* Warp Animation Overlay */}
      {warpState.active && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          {/* Star streak effect using CSS animation */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          }}>
            {Array.from({ length: 100 }).map((_, i) => {
              const angle = (i / 100) * Math.PI * 2;
              const distance = 20 + (i % 30) * 3;
              const speed = warpState.phase === 'hyperspace' ? 800 : 400;
              const length = warpState.phase === 'hyperspace' ? 200 : 100;
              const opacity = warpState.phase === 'hyperspace' ? 0.8 : 0.4;

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: `${length * (1 + warpState.progress)}px`,
                    height: '2px',
                    background: `linear-gradient(to right, transparent, ${i % 3 === 0 ? '#4488ff' : i % 3 === 1 ? '#88ccff' : '#ffffff'})`,
                    opacity: opacity * (1 - Math.abs(warpState.progress - 0.5) * 2),
                    transform: `rotate(${angle}rad) translateX(${distance + warpState.progress * speed}px)`,
                    transformOrigin: 'left center',
                    pointerEvents: 'none'
                  }}
                />
              );
            })}
          </div>

          {/* Tunnel effect */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: warpState.phase === 'hyperspace'
              ? `radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(68, 136, 255, ${0.3 * (1 - Math.abs(warpState.progress - 0.5) * 2)}) 50%, rgba(0, 0, 0, 0.9) 80%)`
              : 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 1) 70%)',
            animation: warpState.phase === 'hyperspace' ? 'pulse 0.5s infinite alternate' : 'none'
          }} />

          {/* Speed lines (radial) */}
          {warpState.phase === 'hyperspace' && (
            <>
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={`speed-${i}`}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '4px',
                    height: '400px',
                    background: 'linear-gradient(to bottom, transparent, #00ffff, transparent)',
                    opacity: 0.6 * Math.sin(warpState.progress * Math.PI),
                    transform: `rotate(${(i / 16) * 360}deg) translateY(-200px)`,
                    transformOrigin: 'center center',
                    pointerEvents: 'none',
                    filter: 'blur(2px)'
                  }}
                />
              ))}
            </>
          )}

          {/* Text overlay */}
          <div style={{
            position: 'relative',
            zIndex: 2001,
            textAlign: 'center',
            color: '#ffffff',
            fontFamily: 'monospace',
            textShadow: '0 0 10px rgba(68, 136, 255, 0.8)'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#4488ff',
              textTransform: 'uppercase',
              letterSpacing: '8px',
              animation: 'flicker 0.3s infinite alternate'
            }}>
              {warpState.phase === 'accelerating' && 'ENGAGING WARP DRIVE'}
              {warpState.phase === 'hyperspace' && 'HYPERSPACE'}
              {warpState.phase === 'decelerating' && 'DROPPING TO REALSPACE'}
            </div>

            {warpState.toSystem !== null && galaxy[warpState.toSystem] && (
              <div style={{
                fontSize: '24px',
                color: '#88ccff',
                marginTop: '20px',
                letterSpacing: '4px'
              }}>
                {warpState.phase === 'accelerating' && `DEPARTING ${galaxy[currentSystemIndex]?.name || 'UNKNOWN'}`}
                {warpState.phase === 'hyperspace' && `EN ROUTE TO ${galaxy[warpState.toSystem].name}`}
                {warpState.phase === 'decelerating' && `ARRIVING AT ${galaxy[warpState.toSystem].name}`}
              </div>
            )}

            {/* Progress bar */}
            <div style={{
              marginTop: '40px',
              width: '400px',
              height: '8px',
              backgroundColor: 'rgba(68, 136, 255, 0.2)',
              border: '2px solid #4488ff',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(68, 136, 255, 0.5)'
            }}>
              <div style={{
                height: '100%',
                width: `${warpState.progress * 100}%`,
                backgroundColor: '#4488ff',
                boxShadow: '0 0 10px #4488ff',
                transition: 'width 0.1s linear'
              }} />
            </div>

            <div style={{
              marginTop: '15px',
              fontSize: '18px',
              color: '#88ccff',
              letterSpacing: '2px'
            }}>
              {Math.round(warpState.progress * 100)}%
            </div>
          </div>

          {/* Add keyframe animations */}
          <style>{`
            @keyframes flicker {
              0% { opacity: 1; }
              50% { opacity: 0.8; }
              100% { opacity: 1; }
            }
            @keyframes pulse {
              0% { opacity: 0.8; }
              100% { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default GalaxyMap;
