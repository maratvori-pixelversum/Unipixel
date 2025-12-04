import { useEffect, useRef } from 'react';
import fontLoader from '../../utils/FontLoader';
import CockpitFrame from './common/CockpitFrame';
import {
  generate3DBackgroundTexture
} from '../../utils/Pixelated3DGenerators';
import {
  generateCRTMonitor,
  generateLED,
  generateWarningLabel
} from '../../utils/CockpitAssetGenerators';
import {
  drawMetalPanel,
  drawCRTScreen,
  drawIndicatorLED,
  drawProgressBar,
  drawRivet,
  COCKPIT_COLORS,
} from './common/CockpitAssets';

// PERFORMANCE: Moved outside component to prevent re-creation on every render
const LOADING_STAGES = [
  { progress: 5, message: '> BIOS v4.2.1 INITIALIZED', detail: 'CPU: OK | RAM: 512MB | ROM: 2GB' },
  { progress: 10, message: '> INITIALIZING SHIP SYSTEMS', detail: 'POWER GRID: ONLINE | LIFE SUPPORT: ACTIVE' },
  { progress: 15, message: '> LOADING NAVIGATIONAL DATA', detail: 'STAR CHARTS: 94,583 SYSTEMS | WAYPOINTS: 1,442' },
  { progress: 20, message: '> SEEDING PROCEDURAL GENERATOR', detail: 'SEED: 0x7FA3B91C | ENTROPY: HIGH' },
  { progress: 25, message: '> GENERATING STAR CHART DATABASE', detail: 'SECTORS: 16 | NEBULAE: 34 | ANOMALIES: 127' },
  { progress: 30, message: '> CONSTRUCTING GALAXY MAP', detail: 'TRADE ROUTES: 523 | STATIONS: 89' },
  { progress: 35, message: '> CALIBRATING SENSOR ARRAYS', detail: 'RADAR: OK | SONAR: OK | THERMAL: OK' },
  { progress: 40, message: '> ESTABLISHING COMMUNICATION PROTOCOLS', detail: 'CHANNELS: 16 | ENCRYPTION: AES-512' },
  { progress: 45, message: '> LOADING WEAPON SYSTEMS', detail: 'PLASMA: OK | MISSILES: OK | SHIELDS: OK' },
  { progress: 50, message: '> INITIALIZING AI CORE', detail: 'NEURAL NET: ACTIVE | DECISION TREES: 45,129' },
  { progress: 55, message: '> LOADING FACTION DATABASE', detail: 'FACTIONS: 24 | RELATIONS: CALCULATING...' },
  { progress: 60, message: '> GENERATING MISSION POOL', detail: 'AVAILABLE MISSIONS: 387 | CONTRACTS: 142' },
  { progress: 65, message: '> LOADING CARGO MANIFEST', detail: 'COMMODITIES: 156 | MARKET DATA: UPDATED' },
  { progress: 70, message: '> INITIALIZING PHYSICS ENGINE', detail: 'GRAVITY: OK | COLLISION: OK | PARTICLES: OK' },
  { progress: 75, message: '> LOADING AUDIO SUBSYSTEM', detail: 'SFX: 892 | MUSIC: 24 TRACKS | AMBIENCE: 67' },
  { progress: 80, message: '> RUNNING SYSTEM DIAGNOSTICS', detail: 'HULL: 100% | FUEL: 100% | AMMO: 100%' },
  { progress: 85, message: '> ESTABLISHING QUANTUM LINK', detail: 'ENTANGLEMENT: STABLE | LATENCY: 0.03ms' },
  { progress: 90, message: '> FINALIZING BOOT SEQUENCE', detail: 'CHECKSUMS: VERIFIED | INTEGRITY: 100%' },
  { progress: 95, message: '> ALL SYSTEMS OPERATIONAL', detail: 'READY FOR DEEP SPACE OPERATIONS' },
  { progress: 100, message: '> BOOT COMPLETE', detail: 'WELCOME ABOARD, CAPTAIN' },
];

/**
 * CanvasLoadingScreen - Complete cockpit redesign
 * Features: Heavily pixelated spaceship control panel with CRT monitor,
 * indicator lights, metal panels, rivets, and industrial aesthetic
 */
const CanvasLoadingScreen = ({ progress = 0 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const cachedAssets = useRef({}); // PERFORMANCE: Cache pre-rendered assets
  // PERFORMANCE: Use ref for logs to avoid re-renders - only update when needed
  const logsRef = useRef([]);
  const lastProgressRef = useRef(-1);
  // PERFORMANCE: Removed animFrame state - no animations for 60fps performance

  // PERFORMANCE: Update logs using ref - no state updates during render
  // Only update when progress actually changes
  if (lastProgressRef.current !== progress) {
    lastProgressRef.current = progress;
    const currentStage = LOADING_STAGES.find(stage =>
      Math.floor(progress) >= stage.progress - 5 && Math.floor(progress) < stage.progress
    );
    if (currentStage && !logsRef.current.some(log => log.message === currentStage.message)) {
      logsRef.current = [...logsRef.current, currentStage].slice(-10);
    }
  }
  // Get current logs for rendering
  const logs = logsRef.current;

  // PERFORMANCE: Removed animation loop - all assets are static for 60fps performance

  // Render cockpit loading panel
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

    // ===================================================================
    // COCKPIT BOOT TERMINAL DESIGN
    // ===================================================================

    // PERFORMANCE: Cache expensive background generation
    if (!cachedAssets.current.background) {
      cachedAssets.current.background = generate3DBackgroundTexture(width, height, 12345);
    }
    ctx.drawImage(cachedAssets.current.background, 0, 0);

    const centerX = width / 2;
    const centerY = height / 2;

    // === LARGE CENTRAL CRT MONITOR (OPTIMIZED FOR THIN FRAME) ===
    const monitorWidth = Math.min(width * 0.95, 2000);
    const monitorHeight = Math.min(height * 0.92, 1300);
    const monitorX = centerX - monitorWidth / 2;
    const monitorY = centerY - monitorHeight / 2;

    // Generate CRT monitor with DARK AMBER phosphor (NO GREEN)
    const crtMonitor = generateCRTMonitor(monitorWidth, monitorHeight, {
      phosphorColor: 'amber',  // Changed from 'green' to 'amber' - dark brown/orange only
      frameColor: '#3a3a3a',
      screenInset: 24,
      hasScanlines: true,
      scanlineIntensity: 0.25,
      hasVignette: true,
      hasCurve: true,
      hasReflections: true
    });
    ctx.drawImage(crtMonitor, monitorX, monitorY);

    // === SCREEN CONTENT AREA ===
    const screenInset = 16;
    const screenX = monitorX + screenInset;
    const screenY = monitorY + screenInset;
    const screenW = monitorWidth - screenInset * 2;
    const screenH = monitorHeight - screenInset * 2;

    // === BOOT HEADER === - ULTRA-ENHANCED: MUCH larger text (2x original)
    ctx.save();
    ctx.font = `bold 40px ${fontLoader.getFontFamily('DigitalDisco')}`;  // ULTRA-INCREASED from 20px to 40px (2x)
    ctx.fillStyle = '#8a6a4a'; // Dark amber text (NO GREEN)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('PIXELVERSUM DEEP SPACE OS v4.2.1', screenX + screenW / 2, screenY + 15);

    ctx.font = `24px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // ULTRA-INCREASED from 12px to 24px (2x)
    ctx.fillText('BIOS BOOT SEQUENCE INITIALIZED', screenX + screenW / 2, screenY + 55);

    // === STATUS LED INDICATORS (Top of screen) - ENHANCED with more systems ===
    const indicators = [
      { label: 'PWR', active: true, color: '#8a5840' },  // Dark amber - Power always on
      { label: 'CPU', active: progress > 5, color: '#8a5840' },
      { label: 'MEM', active: progress > 10, color: '#8a5840' },
      { label: 'DSK', active: progress > 15, color: '#6a4230' },  // Dark orange
      { label: 'GPU', active: progress > 20, color: '#8a5840' },  // NEW: Graphics
      { label: 'NET', active: progress > 30, color: '#6a4230' },
      { label: 'SYS', active: progress > 40, color: '#6a4230' },
      { label: 'NAV', active: progress > 50, color: '#8a5840' },
      { label: 'SEN', active: progress > 60, color: '#8a5840' },  // NEW: Sensors
      { label: 'WPN', active: progress > 70, color: '#6a4230' },
      { label: 'SHD', active: progress > 75, color: '#8a5840' },
      { label: 'COM', active: progress > 85, color: '#8a5840' },
      { label: 'ENG', active: progress > 90, color: '#6a4230' },  // NEW: Engines
      { label: 'RDY', active: progress >= 100, color: '#8a5840' }, // NEW: Ready
    ];

    const ledStartY = screenY + 60;
    const ledSpacing = screenW / indicators.length;

    indicators.forEach((ind, i) => {
      const ledX = screenX + ledSpacing * i + ledSpacing / 2;
      const ledY = ledStartY;

      // PERFORMANCE: Static LED (no blinking animation)
      const ledCanvas = generateLED(6, ind.active, {
        color: ind.color,
        offColor: '#1a1410',  // Dark off color
        glowIntensity: 0.3
      });
      ctx.drawImage(ledCanvas, ledX - ledCanvas.width / 2, ledY - ledCanvas.height / 2);

      // Label - ULTRA-ENHANCED: MUCH larger LED labels
      ctx.font = `bold 18px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // ULTRA-INCREASED from 10px to 18px (1.8x)
      ctx.fillStyle = '#6a5442';  // Dark amber text
      ctx.textAlign = 'center';
      ctx.fillText(ind.label, ledX, ledY + 18);
    });

    // === PROGRESS BAR ===
    const progressBarY = screenY + 110;
    const progressBarWidth = screenW - 60;
    const progressBarHeight = 35;
    const progressBarX = screenX + 30;

    ctx.font = `24px ${fontLoader.getFontFamily('DigitalDisco')}`;  // ULTRA-INCREASED from 12px to 24px (2x)
    ctx.fillStyle = '#8a7462';  // Dark amber text
    ctx.textAlign = 'center';
    ctx.fillText('INITIALIZATION PROGRESS', screenX + screenW / 2, progressBarY - 12);

    // Draw progress bar using CockpitAssets function
    drawProgressBar(ctx, progressBarX, progressBarY, progressBarWidth, progressBarHeight, progress, 100, {
      fillColor: '#8a5840',  // Dark amber fill
      bgColor: '#1a1208',    // Dark background
      borderColor: '#3a2a1a', // Dark border
      hasGlow: false,        // No glow for dark theme
      height: progressBarHeight
    });

    // Percentage text below bar - ULTRA-ENHANCED: MUCH larger percentage
    ctx.font = `bold 32px ${fontLoader.getFontFamily('DigitalDisco')}`;  // ULTRA-INCREASED from 16px to 32px (2x)
    ctx.fillStyle = '#8a6a4a';  // Dark amber
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(progress)}%`, screenX + screenW / 2, progressBarY + progressBarHeight + 24);

    // === BOOT LOG CONSOLE === - ULTRA-ENHANCED: MUCH larger log text
    const logStartY = screenY + 210;
    const logLineHeight = 26;  // ULTRA-INCREASED from 14 to 26 (1.86x)

    ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // ULTRA-INCREASED from 11px to 20px (1.8x)
    ctx.textAlign = 'left';

    logs.forEach((log, i) => {
      const logY = logStartY + i * logLineHeight;
      const alpha = 0.5 + (i / Math.max(logs.length, 1)) * 0.5;

      // Main message - dark amber color (NO GREEN)
      const amber = { r: 138, g: 106, b: 74 };  // #8a6a4a
      ctx.fillStyle = `rgba(${amber.r}, ${amber.g}, ${amber.b}, ${alpha})`;
      ctx.fillText(log.message, screenX + 15, logY);

      // Detail on next line
      ctx.fillStyle = `rgba(${amber.r}, ${amber.g}, ${amber.b}, ${alpha * 0.6})`;
      ctx.fillText(log.detail, screenX + 30, logY + logLineHeight - 3);
    });

    // === BOTTOM STATUS LINE ===
    const bottomY = screenY + screenH - 40;

    ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // ULTRA-INCREASED from 10px to 20px (2x)
    ctx.fillStyle = '#8a7462';  // Dark amber (NO GREEN)
    ctx.textAlign = 'center';
    ctx.fillText('STARSHIP SYSTEMS ONLINE | DEEP SPACE OPERATIONS v4.2.1', screenX + screenW / 2, bottomY);

    ctx.restore();

    // Add rivets to CRT frame
    drawRivet(ctx, screenX - 6, screenY - 6, 4);
    drawRivet(ctx, screenX + screenW + 6, screenY - 6, 4);
    drawRivet(ctx, screenX - 6, screenY + screenH + 6, 4);
    drawRivet(ctx, screenX + screenW + 6, screenY + screenH + 6, 4);

    // PERFORMANCE: Static skip hint (no pulsing animation) - ENHANCED: Larger hint text
    if (progress < 100) {
      ctx.font = `13px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // INCREASED from 10px to 13px
      ctx.fillStyle = '#8a7462';  // Dark amber
      ctx.textAlign = 'center';
      ctx.fillText('[PRESS ANY KEY TO SKIP]', screenX + screenW / 2, bottomY + 20);
    }

    // === SIDE PANEL LEDS (warning labels) ===
    if (monitorX > 60) {
      // Left side - Warning label (DARK ORANGE - NO BRIGHT)
      const warningLabel = generateWarningLabel(120, 40, 'CAUTION', {
        bgColor: '#4a3020',  // Changed from bright #ffaa00 to dark orange
        textColor: '#1a1208',
        borderColor: '#1a1208',
        hasStripes: true
      });
      ctx.drawImage(warningLabel, 20, centerY - 20);

      // Right side status LEDs (DARK AMBER - NO GREEN)
      for (let i = 0; i < 5; i++) {
        const ledY = monitorY + 40 + i * 30;
        const isActive = progress > i * 20;
        const ledCanvas = generateLED(8, isActive, {
          color: i < 3 ? '#8a5840' : '#6a4230',  // Changed from bright green/orange to dark amber/orange
          offColor: '#1a1410',  // Dark off color (NO GREEN)
          glowIntensity: 0.3  // Reduced glow intensity
        });
        ctx.drawImage(ledCanvas, width - 40, ledY);
      }
    }
    ctx.restore();

  }, [progress]);  // PERFORMANCE: Removed animFrame and logs dependencies - logs now use ref

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
          }}
        />
      </div>
    </CockpitFrame>
  );
};

export default CanvasLoadingScreen;
