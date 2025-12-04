import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import fontLoader from '../../utils/FontLoader';
import CockpitFrame from './common/CockpitFrame';
import {
  generate3DBackgroundTexture,
  generate3DPanel,
  generate3DButton,
  generate3DTerminalScreen
} from '../../utils/Pixelated3DGenerators';
import {
  drawMetalPanel,
  drawRivet,
  drawIndicatorLED,
  COCKPIT_COLORS,
} from './common/CockpitAssets';

/**
 * CanvasMainMenu - Complete cockpit redesign
 * Features: Mission control panel with CRT monitor showing menu options,
 * heavily pixelated metal panels, indicator lights, industrial aesthetic
 */
const CanvasMainMenu = ({
  onNewGame,
  onContinue,
  onLoadGame,
  onSettings,
  onCredits,
  onExit,
  hasSaveData = false,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  // PERFORMANCE: Removed unused animFrame state - no animations for 60fps performance
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [buttons, setButtons] = useState([]);

  // PERFORMANCE: Cache generated assets to avoid regeneration
  const cachedAssets = useRef({});
  const lastDimensions = useRef({ width: 0, height: 0 });
  const cachedGradients = useRef({});
  const lastRenderRef = useRef(0);
  const renderThrottleMs = 16; // ~60fps throttle for hover effects

  // PERFORMANCE: Off-screen canvas for static background (rendered once)
  const staticBackgroundRef = useRef(null);
  const needsBackgroundRedraw = useRef(true);

  // PERFORMANCE: Memoize menu items to prevent recreation
  const menuItems = useMemo(() => [
    { label: 'NEW MISSION', onClick: onNewGame, enabled: true, icon: '[+]' },
    { label: 'CONTINUE', onClick: onContinue, enabled: hasSaveData, icon: '[>]' },
    { label: 'LOAD MISSION', onClick: onLoadGame, enabled: true, icon: '[<]' },
    { label: 'SETTINGS', onClick: onSettings, enabled: true, icon: '[*]' },
    { label: 'CREDITS', onClick: onCredits, enabled: true, icon: '[i]' },
    { label: 'EXIT', onClick: onExit, enabled: true, icon: '[X]' },
  ], [onNewGame, onContinue, hasSaveData, onLoadGame, onSettings, onCredits, onExit]);

  // PERFORMANCE: Remove animation loop - static design only for 60fps performance
  // All assets are heavily pixelated but static (no animations)

  // Handle clicks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      buttons.forEach((btn, index) => {
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height &&
            btn.enabled) {
          btn.onClick();
        }
      });
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let newSelected = -1;
      buttons.forEach((btn, index) => {
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height &&
            btn.enabled) {
          newSelected = index;
        }
      });

      if (newSelected !== -1 && newSelected !== selectedIndex) {
        // PERFORMANCE: Throttle hover re-renders to max 60fps
        const now = Date.now();
        if (now - lastRenderRef.current >= renderThrottleMs) {
          setSelectedIndex(newSelected);
          lastRenderRef.current = now;
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [buttons, selectedIndex]);

  // Render cockpit main menu
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    // PERFORMANCE: Check if dimensions changed - clear cache if so
    const dimensionsChanged = lastDimensions.current.width !== width || lastDimensions.current.height !== height;
    if (dimensionsChanged) {
      cachedAssets.current = {};
      lastDimensions.current = { width, height };
    }

    // PERFORMANCE: Cache expensive background generation
    if (!cachedAssets.current.background) {
      cachedAssets.current.background = generate3DBackgroundTexture(width, height, 54321);
    }
    ctx.drawImage(cachedAssets.current.background, 0, 0);

    // Helper function for simple pixel drawing (used for LEDs)
    const drawPixel = (x, y, color, size = 1) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    };

    const centerX = width / 2;
    const centerY = height / 2;

    // ======================
    // COCKPIT PANEL LAYOUT
    // ======================

    // ENHANCED: CRT almost full screen (only tiny border - 2-3px)
    const panelWidth = Math.min(width * 0.996, 3000);
    const panelHeight = Math.min(height * 0.994, 2400);
    const panelX = centerX - panelWidth / 2;
    const panelY = centerY - panelHeight / 2;

    // PERFORMANCE: Cache expensive 3D main panel generation
    const panelKey = `mainPanel_${panelWidth}_${panelHeight}`;
    if (!cachedAssets.current[panelKey]) {
      cachedAssets.current[panelKey] = generate3DPanel(panelWidth, panelHeight, {
        baseColor: '#1a120a',
        bevelSize: 10,
        hasScanlines: true,
        hasPanelDividers: false,
        pixelSize: 0.8
      });
    }
    ctx.drawImage(cachedAssets.current[panelKey], panelX, panelY);

    // Decorative corner brackets - removed for cleaner look

    // Corner rivets
    [[panelX + 10, panelY + 10],
     [panelX + panelWidth - 10, panelY + 10],
     [panelX + 10, panelY + panelHeight - 10],
     [panelX + panelWidth - 10, panelY + panelHeight - 10]
    ].forEach(([x, y]) => drawRivet(ctx, x, y, 5));

    // ======================
    // TOP PANEL - TITLE
    // ======================

    const titleBarH = 80;  // ENHANCED: Increased from 60 to 80 for larger title
    drawMetalPanel(ctx, panelX + 15, panelY + 15, panelWidth - 30, titleBarH, {
      rustAmount: 0.2,
      scratchCount: 10,
      depth3D: true,
    });

    ctx.font = `bold 56px ${fontLoader.getFontFamily('DigitalDisco')}`;  // ENHANCED: Increased from 28px to 42px (1.5x larger)
    ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PIXELVERSUM', centerX, panelY + 15 + titleBarH / 2);

    drawRivet(ctx, panelX + 25, panelY + 15 + titleBarH / 2, 4);
    drawRivet(ctx, panelX + panelWidth - 25, panelY + 15 + titleBarH / 2, 4);

    // ======================
    // SIDE PANELS
    // ======================

    const sidePanelW = 100;
    const sidePanelH = panelHeight - titleBarH - 120;
    const sidePanelY = panelY + titleBarH + 60;

    // Left panel - mission status
    drawMetalPanel(ctx, panelX + 15, sidePanelY, sidePanelW, sidePanelH, {
      rustAmount: 0.3,
      scratchCount: 15,
      depth3D: true,
    });

    ctx.font = `bold 12px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
    ctx.textAlign = 'center';

    // Status LEDs
    const statusIndicators = [
      { label: 'SYS', state: 'amber' },
      { label: 'PWR', state: 'amber' },
      { label: 'NAV', state: 'amber' },
      { label: 'COM', state: 'amber' },
      { label: 'WPN', state: 'off' },
      { label: 'SHD', state: 'off' },
    ];

    statusIndicators.forEach((ind, i) => {
      const ledX = panelX + 15 + sidePanelW / 2 - 4;
      const ledY = sidePanelY + 20 + i * 50;

      // PERFORMANCE: Static LEDs (no blinking animation)
      drawIndicatorLED(ctx, ledX, ledY, 8, {
        state: ind.state,
        blinking: false,  // Removed blinking for performance
        animFrame: 0,
      });

      ctx.fillStyle = ind.state === 'amber' ? COCKPIT_COLORS.TEXT_NORMAL : COCKPIT_COLORS.TEXT_DIM;
      ctx.fillText(ind.label, ledX + 4, ledY + 18);
    });

    // Main menu panel - 3D panel with deep inset - ENHANCED: CRT almost fills screen
    const menuPanelW = Math.min(panelWidth * 0.98, 2400);
    const menuPanelH = Math.min(panelHeight - titleBarH - 30, height * 0.93);
    const menuPanelX = centerX - menuPanelW / 2;
    const menuPanelY = panelY + titleBarH + 20;

    // PERFORMANCE: Cache expensive 3D menu panel generation
    const menuPanelKey = `menuPanel_${menuPanelW}_${menuPanelH}`;
    if (!cachedAssets.current[menuPanelKey]) {
      cachedAssets.current[menuPanelKey] = generate3DPanel(menuPanelW, menuPanelH, {
        baseColor: '#0f0a06',
        bevelSize: 8,
        hasScanlines: true,
        hasPanelDividers: false,
        pixelSize: 0.8
      });
    }
    ctx.drawImage(cachedAssets.current[menuPanelKey], menuPanelX, menuPanelY);

    // PERFORMANCE: Cache title bar panel
    const titleBarKey = `titleBar_${menuPanelW - 30}_35`;
    if (!cachedAssets.current[titleBarKey]) {
      cachedAssets.current[titleBarKey] = generate3DPanel(menuPanelW - 30, 35, {
        baseColor: '#2a1a0a',
        bevelSize: 3,
        hasScanlines: false,
        hasPanelDividers: false,
        pixelSize: 0.8
      });
    }
    ctx.drawImage(cachedAssets.current[titleBarKey], menuPanelX + 15, menuPanelY + 15);

    // CRT screen area
    const crtX = menuPanelX + 15;
    const crtY = menuPanelY + 60;
    const crtW = menuPanelW - 30;
    const crtH = menuPanelH - 80;

    // CRT content - menu header - ENHANCED: Larger text
    ctx.save();
    ctx.font = `bold 36px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 18px to 26px (1.4x larger)
    ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.fillText('MISSION CONTROL CENTER', crtX + crtW / 2, crtY + 40);

    // Subtitle - ENHANCED: Larger text
    ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // INCREASED from 10px to 14px (1.4x larger)
    ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
    ctx.fillText('SELECT OPERATION', crtX + crtW / 2, crtY + 65);

    // Menu buttons - HORIZONTAL LAYOUT with smaller buttons
    const buttonStartY = crtY + 120;
    const buttonCount = menuItems.length;
    const buttonH = 50;  // Fixed smaller button height
    const buttonW = Math.min(Math.floor(crtW * 0.28), 220);  // Smaller button width
    const buttonSpacing = 15;  // Horizontal spacing between buttons
    const buttonRows = 2;  // Two rows of buttons
    const buttonsPerRow = Math.ceil(buttonCount / buttonRows);
    const totalRowWidth = buttonsPerRow * buttonW + (buttonsPerRow - 1) * buttonSpacing;
    const rowStartX = crtX + (crtW - totalRowWidth) / 2;

    const newButtons = [];

    menuItems.forEach((item, index) => {
      const row = Math.floor(index / buttonsPerRow);
      const col = index % buttonsPerRow;
      const btnX = rowStartX + col * (buttonW + buttonSpacing);
      const btnY = buttonStartY + row * (buttonH + 40);  // 40px spacing between rows
      const isSelected = selectedIndex === index;
      const isEnabled = item.enabled;

      // PERFORMANCE: Cache button variants (normal, hover, disabled)
      const buttonState = isSelected && isEnabled ? 'hover' : 'normal';
      const buttonVariant = isEnabled ? (isSelected ? 'selected' : 'normal') : 'disabled';
      const buttonKey = `btn_${buttonW}_${buttonH}_${buttonVariant}`;

      if (!cachedAssets.current[buttonKey]) {
        cachedAssets.current[buttonKey] = generate3DButton(buttonW, buttonH, '', {
          state: buttonState,
          baseColor: isEnabled ? '#2a1a0a' : '#1a1208',
          textColor: isEnabled ? (isSelected ? '#8a6a4a' : '#6a4a2a') : '#3a2a1a',
          hasLED: false,
          pixelSize: 0.8
        });
      }
      ctx.drawImage(cachedAssets.current[buttonKey], btnX, btnY);

      // Button text - Smaller text for compact buttons
      const textSize = 14;  // Fixed smaller text size
      ctx.font = `bold ${textSize}px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = isEnabled ?
        (isSelected ? COCKPIT_COLORS.TEXT_BRIGHT : COCKPIT_COLORS.TEXT_NORMAL) :
        COCKPIT_COLORS.TEXT_DIM;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, btnX + 10, btnY + buttonH / 2);
      ctx.fillText(item.label, btnX + 35, btnY + buttonH / 2);

      // PERFORMANCE: Static selection indicator (no animation) - RESPONSIVE: Scale arrow
      if (isSelected && isEnabled) {
        ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
        ctx.font = `bold ${Math.floor(textSize * 1.2)}px ${fontLoader.getFontFamily('DigitalDisco')}`;
        ctx.textAlign = 'right';
        ctx.fillText('>', btnX + buttonW - 10, btnY + buttonH / 2);
      }

      newButtons.push({
        x: btnX,
        y: btnY,
        width: buttonW,
        height: buttonH,
        onClick: item.onClick,
        enabled: isEnabled,
      });
    });

    // PERFORMANCE: Cache info panel
    const infoY = menuPanelY + menuPanelH - 70;
    const infoPanelKey = `infoPanel_${menuPanelW - 40}_50`;
    if (!cachedAssets.current[infoPanelKey]) {
      cachedAssets.current[infoPanelKey] = generate3DTerminalScreen(menuPanelW - 40, 50, {
        baseColor: '#050402',
        hasVignette: false,
        hasScanlines: true,
        flickerIntensity: 0,  // Remove flicker for performance
        inset: true
      });
    }
    ctx.drawImage(cachedAssets.current[infoPanelKey], menuPanelX + 20, infoY);

    ctx.restore();

    // ======================
    // BOTTOM INFO PANEL
    // ======================

    const infoPanelY = panelY + panelHeight - 105;
    const infoPanelH = 90;

    // PERFORMANCE: Cache left side panel
    const leftPanelX = menuPanelX - sidePanelW - 30;
    if (leftPanelX > panelX + 30) {
      const leftPanelKey = `leftPanel_${sidePanelW}_${sidePanelH}`;
      if (!cachedAssets.current[leftPanelKey]) {
        cachedAssets.current[leftPanelKey] = generate3DPanel(sidePanelW, sidePanelH, {
          baseColor: '#0f0a06',
          bevelSize: 6,
          hasScanlines: true,
          hasPanelDividers: false,
          pixelSize: 0.8
        });
      }
      ctx.drawImage(cachedAssets.current[leftPanelKey], leftPanelX, menuPanelY);
    }

    // ENHANCED: System status text with more detail and LARGER fonts
    ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 10px to 14px
    ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.fillText('═══ SYSTEM STATUS ═══', centerX, infoPanelY + 18);

    ctx.font = `18px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // INCREASED from 9px to 13px
    ctx.fillStyle = COCKPIT_COLORS.TEXT_NORMAL;
    ctx.fillText('SHIP STATUS: DOCKED AT STATION ALPHA-7 | ALL SYSTEMS NOMINAL', centerX, infoPanelY + 38);
    ctx.fillText('CREW: 4 READY | FUEL: 100% | HULL: 100% | SHIELDS: 100% | POWER: 100%', centerX, infoPanelY + 54);
    ctx.fillText('WEAPONS: ARMED | CARGO: 0/100 | CREDITS: 1000 CR | LOCATION: SOL SYSTEM', centerX, infoPanelY + 70);

    // PERFORMANCE: Cache right side panel
    const rightPanelX = menuPanelX + menuPanelW + 30;
    if (rightPanelX + sidePanelW < panelX + panelWidth - 30) {
      const rightPanelKey = `rightPanel_${sidePanelW}_${sidePanelH}`;
      if (!cachedAssets.current[rightPanelKey]) {
        cachedAssets.current[rightPanelKey] = generate3DPanel(sidePanelW, sidePanelH, {
          baseColor: '#0f0a06',
          bevelSize: 6,
          hasScanlines: true,
          hasPanelDividers: false,
          pixelSize: 0.8
        });
      }
      ctx.drawImage(cachedAssets.current[rightPanelKey], rightPanelX, menuPanelY);
    }

    // Version info - ENHANCED: Larger version text
    ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // INCREASED from 8px to 12px
    ctx.fillStyle = COCKPIT_COLORS.TEXT_DIM;
    ctx.fillText('PIXELVERSUM v0.2.0-ALPHA | BUILD 2025.01.15', centerX, infoPanelY + 90);

    // ======================
    // GLOBAL CRT EFFECTS
    // ======================

    // PERFORMANCE: Cache scanlines to off-screen canvas
    const scanlinesKey = `scanlines_${width}_${height}`;
    if (!cachedAssets.current[scanlinesKey]) {
      const scanlinesCanvas = document.createElement('canvas');
      scanlinesCanvas.width = width;
      scanlinesCanvas.height = height;
      const scanlinesCtx = scanlinesCanvas.getContext('2d');
      scanlinesCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < height; y += 3) {
        scanlinesCtx.fillRect(0, y, width, 1);
      }
      cachedAssets.current[scanlinesKey] = scanlinesCanvas;
    }
    ctx.drawImage(cachedAssets.current[scanlinesKey], 0, 0);

    // PERFORMANCE: Cache vignette gradient
    const vignetteKey = `vignette_${width}_${height}`;
    if (!cachedGradients.current[vignetteKey]) {
      const vignetteGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.7);
      vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
      vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      cachedGradients.current[vignetteKey] = vignetteGrad;
    }
    ctx.fillStyle = cachedGradients.current[vignetteKey];
    ctx.fillRect(0, 0, width, height);

    setButtons(newButtons);

  }, [selectedIndex, hasSaveData]);  // PERFORMANCE: Removed callback dependencies - they don't affect rendering

  return (
    <CockpitFrame>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            cursor: 'pointer',
          }}
        />
      </div>
    </CockpitFrame>
  );
};

export default CanvasMainMenu;
