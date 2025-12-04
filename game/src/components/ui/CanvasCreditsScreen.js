import { useEffect, useRef, useState, useCallback } from 'react';
import fontLoader from '../../utils/FontLoader';
import CockpitFrame from './common/CockpitFrame';
import {
  generate3DBackgroundTexture,
  generate3DPanel,
  generate3DButton
} from '../../utils/Pixelated3DGenerators';
import {
  drawMetalPanel,
  drawCRTScreen,
  drawCockpitButton,
  drawRivet,
  COCKPIT_COLORS,
} from './common/CockpitAssets';

const CREDITS_DATA = {
  development: [
    { role: 'GAME DESIGN', name: 'Pixelversum Team' },
    { role: 'LEAD PROGRAMMING', name: 'Pixelversum Team' },
    { role: 'UI/UX DESIGN', name: 'Pixelversum Team' },
    { role: 'GAME ENGINE', name: 'Custom Canvas Engine' },
  ],
  technology: [
    { name: 'React 18', purpose: 'UI Framework' },
    { name: 'Canvas API', purpose: 'Graphics Rendering' },
    { name: 'Web Audio API', purpose: 'Sound System' },
    { name: 'LocalStorage', purpose: 'Save System' },
  ],
  specialThanks: [
    'All playtesters and supporters',
    'The indie game community',
    'Open source contributors',
    'Retro space game enthusiasts',
  ],
};

const CanvasCreditsScreen = ({ onClose }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const cachedAssets = useRef({}); // PERFORMANCE: Cache pre-rendered assets
  // PERFORMANCE: Removed animFrame state - no animations for 60fps performance
  const [scrollOffset, setScrollOffset] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [buttons, setButtons] = useState([]);
  // PERFORMANCE: Memoize onClose callback reference
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // PERFORMANCE: Auto-scroll only (no animFrame updates for static rendering)
  useEffect(() => {
    if (!autoScroll) return;
    const interval = setInterval(() => {
      setScrollOffset(prev => prev + 0.5);
    }, 33);  // ~30fps for auto-scroll only
    return () => clearInterval(interval);
  }, [autoScroll]);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      setAutoScroll(false);
      setScrollOffset(prev => Math.max(0, prev + e.deltaY * 0.5));
    };
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel);
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      buttons.forEach(btn => {
        if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
          btn.onClick();
        }
      });
    };
    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [buttons]);

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

    // PERFORMANCE: Cache expensive background generation
    if (!cachedAssets.current.background) {
      cachedAssets.current.background = generate3DBackgroundTexture(width, height, 13579);
    }
    ctx.drawImage(cachedAssets.current.background, 0, 0);

    // Helper function for simple pixel drawing (used for LEDs)
    const drawPixel = (x, y, color, size = 1) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    };

    const centerX = width / 2;
    const centerY = height / 2;

    // Optimize panel sizing for new thin frame
    const panelWidth = Math.min(width * 0.95, 2000);
    const panelHeight = Math.min(height * 0.92, 1300);
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    // Generate 3D main panel with beveled edges
    const mainPanelCanvas = generate3DPanel(panelWidth, panelHeight, {
      baseColor: '#1a120a',
      bevelSize: 10,
      hasScanlines: true,
      hasPanelDividers: false,
      pixelSize: 0.8
    });
    ctx.drawImage(mainPanelCanvas, panelX, panelY);

    // Title bar - 3D raised panel
    const titleBarHeight = 35;
    const titleBarCanvas = generate3DPanel(panelWidth - 20, titleBarHeight, {
      baseColor: '#2a1a0a',
      bevelSize: 3,
      hasScanlines: false,
      hasPanelDividers: false,
      pixelSize: 0.8
    });
    ctx.drawImage(titleBarCanvas, panelX + 10, panelY + 10);

    ctx.font = `bold 22px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CREW ROSTER & CREDITS', centerX, panelY + 15 + titleBarHeight / 2);

    const crtX = panelX + 15;
    const crtY = panelY + titleBarHeight + 75;
    const crtW = panelWidth - 30;
    const crtH = panelHeight - (crtY - panelY) - 110;

    drawMetalPanel(ctx, crtX - 8, crtY - 8, crtW + 16, crtH + 16, {
      rustAmount: 0.2,
      scratchCount: 8,
      depth3D: true,
    });

    drawCRTScreen(ctx, crtX, crtY, crtW, crtH, {
      scanlineIntensity: 0.4,
      glowAmount: 0.25,
    });

    ctx.save();
    ctx.beginPath();
    ctx.rect(crtX + 10, crtY + 10, crtW - 20, crtH - 20);
    ctx.clip();

    let yOffset = crtY + 30 - scrollOffset;

    ctx.font = `bold 24px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.fillText('PIXELVERSUM', centerX, yOffset);
    yOffset += 35;

    ctx.font = `10px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
    ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
    ctx.fillText('DEEP SPACE EXPLORATION SIMULATOR', centerX, yOffset);
    yOffset += 50;

    ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
    ctx.fillText('DEVELOPMENT TEAM', centerX, yOffset);
    yOffset += 25;

    ctx.font = `10px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
    ctx.textAlign = 'left';
    CREDITS_DATA.development.forEach(item => {
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText(item.role + ':', crtX + 50, yOffset);
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText(item.name, crtX + 200, yOffset);
      yOffset += 20;
    });
    yOffset += 30;

    ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.fillText('TECHNOLOGY', centerX, yOffset);
    yOffset += 25;

    ctx.font = `10px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
    ctx.textAlign = 'left';
    CREDITS_DATA.technology.forEach(item => {
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText(item.name + ':', crtX + 50, yOffset);
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText(item.purpose, crtX + 200, yOffset);
      yOffset += 20;
    });
    yOffset += 30;

    ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.fillText('SPECIAL THANKS', centerX, yOffset);
    yOffset += 25;

    ctx.font = `10px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
    CREDITS_DATA.specialThanks.forEach(thanks => {
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('> ' + thanks, centerX, yOffset);
      yOffset += 20;
    });
    yOffset += 30;

    ctx.fillText('© 2025 PIXELVERSUM PROJECT', centerX, yOffset);
    yOffset += 15;
    ctx.fillText('ALL RIGHTS RESERVED', centerX, yOffset);

    ctx.restore();

    // Return button (fixed at bottom) - 3D button
    const buttonY = panelY + panelHeight - 55;
    const buttonWidth = 250;
    const buttonHeight = 40;
    const buttonX = centerX - buttonWidth / 2;

    const returnButtonCanvas = generate3DButton(buttonWidth, buttonHeight, '[X] RETURN TO MAIN MENU', {
      state: 'normal',
      baseColor: '#2a1a0a',
      textColor: '#8a6a4a',
      hasLED: false,
      pixelSize: 0.8
    });
    ctx.drawImage(returnButtonCanvas, buttonX, buttonY);

    ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.fillText('RETURN TO MENU', centerX, buttonY + buttonHeight / 2 + 4);

    const newButtons = [{
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      onClick: () => onCloseRef.current && onCloseRef.current(),
    }];

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
    if (!cachedAssets.current[vignetteKey]) {
      const vignetteCanvas = document.createElement('canvas');
      vignetteCanvas.width = width;
      vignetteCanvas.height = height;
      const vignetteCtx = vignetteCanvas.getContext('2d');
      const vignetteGrad = vignetteCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.7);
      vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
      vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      vignetteCtx.fillStyle = vignetteGrad;
      vignetteCtx.fillRect(0, 0, width, height);
      cachedAssets.current[vignetteKey] = vignetteCanvas;
    }
    ctx.drawImage(cachedAssets.current[vignetteKey], 0, 0);

    setButtons(newButtons);

  }, [scrollOffset, autoScroll]);  // PERFORMANCE: Removed animFrame and onClose dependencies - use ref

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
            cursor: 'default',
          }}
          onClick={() => setAutoScroll(false)}
        />
      </div>
    </CockpitFrame>
  );
};

export default CanvasCreditsScreen;
