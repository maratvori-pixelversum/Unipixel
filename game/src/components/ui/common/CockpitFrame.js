import { useEffect, useRef, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import './CockpitFrame.css';

/**
 * CockpitFrame - 3D spaceship cockpit frame with heavily pixelated CRT monitors
 * Inspired by concept art: ui_status_and_control_panel.jpg
 * Creates depth, shadows, and retro sci-fi decorative elements
 * OPTIMIZED: Uses canvas caching to prevent lag
 */
const CockpitFrame = ({ children, variant = 'single' }) => {
  const { theme } = useContext(ThemeContext);
  const canvasRef = useRef(null);
  const cachedCanvasRef = useRef(null); // Cache for performance

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Check if we already have a cached version for this size
    if (cachedCanvasRef.current &&
        cachedCanvasRef.current.width === width * dpr &&
        cachedCanvasRef.current.height === height * dpr) {
      // Use cached canvas
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      ctx.drawImage(cachedCanvasRef.current, 0, 0, width, height);
      return;
    }

    // Create cache canvas
    const cacheCanvas = document.createElement('canvas');
    const cacheCtx = cacheCanvas.getContext('2d');
    cacheCanvas.width = width * dpr;
    cacheCanvas.height = height * dpr;
    cacheCtx.scale(dpr, dpr);
    cacheCtx.imageSmoothingEnabled = false;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    const drawCockpit = (targetCtx) => {
      // Clear canvas
      targetCtx.clearRect(0, 0, width, height);

      // Enhanced pixelated metal chassis colors - DARK INDUSTRIAL
      const metalBase = '#2a2a2a';
      const metalDark = '#1a1a1a';
      const metalLight = '#3a3a3a';
      const rustOrange = '#6a3a1a';
      const darkMetal = '#1a1208';  // Changed from beige to dark metal
      const darkPlastic = '#0a0a0a';
      const screwMetal = '#2a2a2a';

      // Draw outer chassis with heavy pixelation (2px for better performance)
      const drawChassisPanel = (x, y, w, h, pixelSize = 2) => {
        for (let py = y; py < y + h; py += pixelSize) {
          for (let px = x; px < x + w; px += pixelSize) {
            // Dark industrial metal with subtle variation
            const variation = Math.random() * 15 - 7;
            const baseR = 26;
            const baseG = 18;
            const baseB = 8;

            // Add panel seams every 60px
            const seamX = (px - x) % 60 < 3;
            const seamY = (py - y) % 60 < 3;

            let r = baseR, g = baseG, b = baseB;

            if (seamX || seamY) {
              // Darker seams
              r -= 40; g -= 40; b -= 40;
            } else {
              r = Math.max(0, Math.min(255, baseR + variation));
              g = Math.max(0, Math.min(255, baseG + variation));
              b = Math.max(0, Math.min(255, baseB + variation));
            }

            // Add scratch marks and wear
            if (Math.random() > 0.985) {
              r -= 50; g -= 50; b -= 50;
            }

            // Add dust/dirt accumulation
            if (Math.random() > 0.99) {
              r -= 30; g -= 30; b -= 30;
            }

            targetCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            targetCtx.fillRect(px, py, pixelSize, pixelSize);
          }
        }
      };

      // Draw dark CRT-style metal panel (NO BLUE - use dark industrial colors)
      const drawMetalPanel = (x, y, w, h, pixelSize = 2, rust = false) => {
        for (let py = y; py < y + h; py += pixelSize) {
          for (let px = x; px < x + w; px += pixelSize) {
            let variation = Math.random() * 30 - 15;
            let isRust = rust && Math.random() > 0.97;

            // CHANGED: Dark CRT-style colors matching terminal screens (dark brown/gray instead of blue)
            let baseR = 32, baseG = 28, baseB = 24;
            if (isRust) {
              baseR = 106; baseG = 58; baseB = 26; // Darker rust
            }

            const r = Math.max(0, Math.min(255, baseR + variation));
            const g = Math.max(0, Math.min(255, baseG + variation));
            const b = Math.max(0, Math.min(255, baseB + variation));

            targetCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            targetCtx.fillRect(px, py, pixelSize, pixelSize);
          }
        }
      };

      // Draw screw/rivet
      const drawScrew = (x, y, size = 8) => {
        // Screw head (dark)
        targetCtx.fillStyle = '#2a2a2a';
        targetCtx.fillRect(x - size/2, y - size/2, size, size);

        // Highlight
        targetCtx.fillStyle = '#4a4a4a';
        targetCtx.fillRect(x - size/2 + 1, y - size/2 + 1, size - 2, 1);
        targetCtx.fillRect(x - size/2 + 1, y - size/2 + 1, 1, size - 2);

        // Cross slot
        targetCtx.fillStyle = '#1a1a1a';
        targetCtx.fillRect(x - size/3, y, size * 2/3, 1);
        targetCtx.fillRect(x, y - size/3, 1, size * 2/3);
      };

      // Draw indicator light
      const drawIndicator = (x, y, color, size = 6, on = true) => {
        const pixelSize = 2;
        for (let py = y - size/2; py < y + size/2; py += pixelSize) {
          for (let px = x - size/2; px < x + size/2; px += pixelSize) {
            const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
            if (dist < size/2) {
              if (on) {
                const brightness = Math.random() * 30 + 200;
                targetCtx.fillStyle = color;
              } else {
                targetCtx.fillStyle = '#2a2a2a';
              }
              targetCtx.fillRect(px, py, pixelSize, pixelSize);
            }
          }
        }
      };

      // Draw serial number
      const drawSerialNumber = (x, y, text) => {
        targetCtx.font = 'bold 10px monospace';
        targetCtx.fillStyle = '#1a1a1a';
        targetCtx.fillText(text, x, y);
      };

      // Ultra-thin cockpit frame layout - minimal borders for maximum content space
      const topBarHeight = 20;  // Ultra-thin top bar for more content space
      const bottomBarHeight = 25;  // Ultra-thin bottom bar
      const sideBarWidth = 15;  // Minimal side bars for maximum CRT area

      // Draw 3D depth layers for top bar
      // Shadow layer
      targetCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      targetCtx.fillRect(0, topBarHeight - 5, width, 5);

      // TOP CHASSIS BAR - heavily pixelated
      drawChassisPanel(0, 0, width, topBarHeight, 1);

      // Add metal trim strips
      drawMetalPanel(0, topBarHeight - 8, width, 8, 1, true);

      // Inner dark panel for depth
      drawMetalPanel(10, 8, width - 20, 20, 1, false);

      // Add screws to top bar (fewer due to thinner bar)
      for (let i = 80; i < width; i += 120) {
        drawScrew(i, topBarHeight / 2);
      }

      // Add indicators to top bar (left side) - NO GREEN, only dark amber/orange
      drawIndicator(20, topBarHeight / 2 - 3, '#8a5840', 6, true); // Dark amber - POWER
      drawIndicator(45, topBarHeight / 2 - 3, '#8a5840', 6, true); // Dark amber - SYSTEMS
      drawIndicator(70, topBarHeight / 2 - 3, '#6a4230', 6, Math.random() > 0.5); // Dark orange - WARNING
      drawIndicator(95, topBarHeight / 2 - 3, '#6a3430', 6, false); // Dark red - ERROR (off)

      // Serial number and labels on top (condensed)
      targetCtx.font = 'bold 8px monospace';
      targetCtx.fillStyle = '#1a1a1a';
      drawSerialNumber(width - 220, topBarHeight / 2 - 2, 'PXLV-2025 | COCKPIT-4000X');

      // Warning labels
      targetCtx.font = 'bold 8px monospace';
      targetCtx.fillStyle = '#aa6633';
      drawSerialNumber(width / 2 - 80, 50, '⚠ WEAR PROTECTIVE EYEWEAR ⚠');

      // Shadow layer for bottom bar
      targetCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      targetCtx.fillRect(0, height - bottomBarHeight, width, 5);

      // BOTTOM CHASSIS BAR (keyboard/control area) - heavily pixelated
      drawChassisPanel(0, height - bottomBarHeight, width, bottomBarHeight, 1);

      // Add metal trim strip
      drawMetalPanel(0, height - bottomBarHeight, width, 8, 1, true);

      // Multiple control panel layers for depth
      drawMetalPanel(15, height - bottomBarHeight + 12, width - 30, 45, 1, true);

      // Inner dark recess panel
      targetCtx.fillStyle = '#0a0a0a';
      targetCtx.fillRect(25, height - bottomBarHeight + 20, width - 50, 30);

      // Add more screws to bottom bar
      for (let i = 80; i < width; i += 120) {
        drawScrew(i, height - bottomBarHeight + 15);
        drawScrew(i, height - 22);
      }

      // Draw keyboard-like buttons with dark CRT style (NO BLUE)
      const buttonY = height - 55;
      const buttonSpacing = 28;
      const startX = width / 2 - 220;
      for (let i = 0; i < 16; i++) {
        const btnX = startX + i * buttonSpacing;
        // Button shadow
        targetCtx.fillStyle = '#1a1a1a';
        targetCtx.fillRect(btnX, buttonY + 2, 22, 18);
        // Button base - CHANGED: Dark brown/gray instead of blue
        targetCtx.fillStyle = '#3a2a1a';
        targetCtx.fillRect(btnX, buttonY, 22, 16);
        // Button highlight - CHANGED: Amber/brown instead of blue
        targetCtx.fillStyle = '#5a4a3a';
        targetCtx.fillRect(btnX + 1, buttonY + 1, 20, 2);
        // Button label - CHANGED: Warmer tone
        targetCtx.fillStyle = '#7a6a5a';
        targetCtx.fillRect(btnX + 8, buttonY + 6, 6, 6);
      }

      // Control panel labels
      targetCtx.font = 'bold 7px monospace';
      targetCtx.fillStyle = '#888888';
      drawSerialNumber(30, height - 75, 'MANUAL OVERRIDE PANEL');
      drawSerialNumber(width - 200, height - 75, 'INPUT CONTROLS');

      // LEFT SIDE PANEL - heavily pixelated with depth
      // Shadow layer
      targetCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      targetCtx.fillRect(sideBarWidth - 3, topBarHeight, 3, height - topBarHeight - bottomBarHeight);

      drawMetalPanel(0, topBarHeight, sideBarWidth, height - topBarHeight - bottomBarHeight, 1, true);

      // Add dark inset panel
      drawMetalPanel(8, topBarHeight + 8, sideBarWidth - 16, height - topBarHeight - bottomBarHeight - 16, 1, false);

      // Add multiple vent grilles with depth
      for (let i = topBarHeight + 30; i < height - bottomBarHeight - 30; i += 45) {
        // Vent frame
        targetCtx.fillStyle = '#2a2a2a';
        targetCtx.fillRect(12, i, sideBarWidth - 24, 30);
        // Vent grilles
        targetCtx.fillStyle = '#0a0a0a';
        for (let j = 0; j < 7; j++) {
          targetCtx.fillRect(15, i + 3 + j * 4, sideBarWidth - 30, 2);
        }
      }

      // Left side screws - more of them
      for (let i = topBarHeight + 25; i < height - bottomBarHeight; i += 60) {
        drawScrew(18, i);
        drawScrew(sideBarWidth - 18, i);
      }

      // Add compact gauge/meter on left side - NO GREEN, only dark colors
      const gaugeY = topBarHeight + height / 2 - 80;
      targetCtx.fillStyle = '#1a1a1a';
      targetCtx.fillRect(8, gaugeY, sideBarWidth - 16, 50);
      targetCtx.fillStyle = '#8a5840';  // Dark amber (NO GREEN)
      targetCtx.fillRect(12, gaugeY + 5, sideBarWidth - 24, 6);
      targetCtx.fillStyle = '#6a4230';  // Dark orange
      targetCtx.fillRect(12, gaugeY + 15, sideBarWidth - 30, 6);
      targetCtx.fillStyle = '#6a3430';  // Dark red
      targetCtx.fillRect(12, gaugeY + 25, sideBarWidth - 36, 6);
      targetCtx.font = 'bold 5px monospace';
      targetCtx.fillStyle = '#666666';
      targetCtx.fillText('RCTR', 12, gaugeY + 40);

      // RIGHT SIDE PANEL - heavily pixelated with depth
      // Shadow layer
      targetCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      targetCtx.fillRect(width - sideBarWidth, topBarHeight, 3, height - topBarHeight - bottomBarHeight);

      drawMetalPanel(width - sideBarWidth, topBarHeight, sideBarWidth, height - topBarHeight - bottomBarHeight, 1, true);

      // Add dark inset panel
      drawMetalPanel(width - sideBarWidth + 8, topBarHeight + 8, sideBarWidth - 16, height - topBarHeight - bottomBarHeight - 16, 1, false);

      // Right side screws - more of them
      for (let i = topBarHeight + 25; i < height - bottomBarHeight; i += 60) {
        drawScrew(width - 18, i);
        drawScrew(width - sideBarWidth + 18, i);
      }

      // Add compact status indicators on right - NO GREEN, only dark colors
      const indicators = [
        { y: topBarHeight + 25, color: '#8a5840', label: 'PWR', on: true },  // Dark amber
        { y: topBarHeight + 48, color: '#8a5840', label: 'SYS', on: true },  // Dark amber
        { y: topBarHeight + 71, color: '#8a5840', label: 'HUL', on: true },  // Dark amber
        { y: topBarHeight + 94, color: '#6a4230', label: 'TMP', on: Math.random() > 0.5 },  // Dark orange
        { y: topBarHeight + 117, color: '#6a4230', label: 'FUE', on: Math.random() > 0.3 },  // Dark orange
        { y: topBarHeight + 140, color: '#6a3430', label: 'ERR', on: false },  // Dark red
      ];

      indicators.forEach(ind => {
        // Compact indicator frame
        targetCtx.fillStyle = '#2a2a2a';
        targetCtx.fillRect(width - sideBarWidth + 8, ind.y - 6, sideBarWidth - 16, 16);
        targetCtx.fillStyle = '#1a1a1a';
        targetCtx.fillRect(width - sideBarWidth + 10, ind.y - 4, sideBarWidth - 20, 12);

        drawIndicator(width - sideBarWidth + 14, ind.y, ind.color, 6, ind.on);
        targetCtx.font = 'bold 6px monospace';
        targetCtx.fillStyle = '#888888';
        targetCtx.fillText(ind.label, width - sideBarWidth + 24, ind.y + 2);
      });

      // CRT MONITOR BEZEL - main screen area with ultra-thin bezel for maximum content space
      const bezelThickness = 4; // Minimal bezel to maximize content area
      const screenX = sideBarWidth + bezelThickness;
      const screenY = topBarHeight + bezelThickness;
      const screenW = width - (sideBarWidth * 2) - (bezelThickness * 2);
      const screenH = height - topBarHeight - bottomBarHeight - (bezelThickness * 2);

      // Outer bezel frame (lighter)
      targetCtx.fillStyle = '#2a2a2a';
      targetCtx.fillRect(sideBarWidth, topBarHeight, width - (sideBarWidth * 2), bezelThickness);
      targetCtx.fillRect(sideBarWidth, topBarHeight, bezelThickness, height - topBarHeight - bottomBarHeight);
      targetCtx.fillRect(width - sideBarWidth - bezelThickness, topBarHeight, bezelThickness, height - topBarHeight - bottomBarHeight);
      targetCtx.fillRect(sideBarWidth, height - bottomBarHeight - bezelThickness, width - (sideBarWidth * 2), bezelThickness);

      // Inner bezel recess (darker) for depth
      const innerBezel = 3;
      targetCtx.fillStyle = '#0a0a0a';
      targetCtx.fillRect(sideBarWidth + innerBezel, topBarHeight + innerBezel, width - (sideBarWidth * 2) - innerBezel * 2, bezelThickness - innerBezel);
      targetCtx.fillRect(sideBarWidth + innerBezel, topBarHeight + innerBezel, bezelThickness - innerBezel, height - topBarHeight - bottomBarHeight - innerBezel * 2);
      targetCtx.fillRect(width - sideBarWidth - bezelThickness + innerBezel, topBarHeight + innerBezel, bezelThickness - innerBezel, height - topBarHeight - bottomBarHeight - innerBezel * 2);
      targetCtx.fillRect(sideBarWidth + innerBezel, height - bottomBarHeight - bezelThickness + innerBezel, width - (sideBarWidth * 2) - innerBezel * 2, bezelThickness - innerBezel);

      // Add bezel screws in all corners and sides
      const bezelScrewPositions = [
        // Corners
        { x: sideBarWidth + 18, y: topBarHeight + 18 },
        { x: width - sideBarWidth - 18, y: topBarHeight + 18 },
        { x: sideBarWidth + 18, y: height - bottomBarHeight - 18 },
        { x: width - sideBarWidth - 18, y: height - bottomBarHeight - 18 },
        // Top side
        { x: width / 2, y: topBarHeight + 18 },
        // Bottom side
        { x: width / 2, y: height - bottomBarHeight - 18 },
        // Left side
        { x: sideBarWidth + 18, y: topBarHeight + (height - topBarHeight - bottomBarHeight) / 2 },
        // Right side
        { x: width - sideBarWidth - 18, y: topBarHeight + (height - topBarHeight - bottomBarHeight) / 2 },
      ];

      bezelScrewPositions.forEach(pos => drawScrew(pos.x, pos.y));

      // Add manufacturer logos and labels on bezel
      targetCtx.font = 'bold 9px monospace';
      targetCtx.fillStyle = '#555555';
      targetCtx.fillText('PIXELVERSUM SYSTEMS™', sideBarWidth + 50, topBarHeight + 23);
      targetCtx.font = 'bold 7px monospace';
      targetCtx.fillStyle = '#444444';
      targetCtx.fillText('RETRO CRT DISPLAY MODULE', sideBarWidth + 50, topBarHeight + 32);

      targetCtx.font = 'bold 8px monospace';
      targetCtx.fillStyle = '#555555';
      targetCtx.fillText('MODEL: CRT-4000X-HD', width - sideBarWidth - 140, height - bottomBarHeight - 20);
      targetCtx.font = 'bold 7px monospace';
      targetCtx.fillText('MADE IN LUNAR COLONY 5', width - sideBarWidth - 140, height - bottomBarHeight - 12);

      // Warning stickers on bezel
      targetCtx.fillStyle = '#aa6633';
      targetCtx.fillRect(sideBarWidth + bezelThickness - 25, height / 2 - 15, 20, 30);
      targetCtx.fillStyle = '#1a1a1a';
      targetCtx.font = 'bold 6px monospace';
      targetCtx.save();
      targetCtx.translate(sideBarWidth + bezelThickness - 16, height / 2);
      targetCtx.rotate(-Math.PI / 2);
      targetCtx.fillText('CAUTION', -15, 0);
      targetCtx.restore();

      // Enhanced shadow/depth effect for 3D appearance
      // Top shadow
      const topShadow = targetCtx.createLinearGradient(0, topBarHeight + bezelThickness, 0, topBarHeight + bezelThickness + 40);
      topShadow.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      topShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      targetCtx.fillStyle = topShadow;
      targetCtx.fillRect(screenX, screenY, screenW, 40);

      // Left shadow
      const leftShadow = targetCtx.createLinearGradient(screenX, 0, screenX + 40, 0);
      leftShadow.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      leftShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      targetCtx.fillStyle = leftShadow;
      targetCtx.fillRect(screenX, screenY, 40, screenH);
    };

    // Draw to cache canvas first
    drawCockpit(cacheCtx);

    // Store cache
    cachedCanvasRef.current = cacheCanvas;

    // Copy from cache to main canvas
    ctx.drawImage(cacheCanvas, 0, 0, width, height);

    // Redraw on resize - clear cache to force redraw
    const handleResize = () => {
      cachedCanvasRef.current = null;
      // The effect will re-run and redraw
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme]);

  return (
    <div className="cockpit-frame">
      <canvas ref={canvasRef} className="cockpit-canvas" />
      <div className="cockpit-content">
        {children}
      </div>
    </div>
  );
};

export default CockpitFrame;
