import { useEffect, useRef, useState } from 'react';
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

const CanvasLoadGameScreen = ({ onLoad, onCancel }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  // PERFORMANCE: Asset caching to avoid regenerating expensive 3D assets
  const cachedAssets = useRef({});
  const lastDimensions = useRef({ width: 0, height: 0 });
  // PERFORMANCE: Removed animFrame state - no animations for 60fps performance
  const [savedGames, setSavedGames] = useState([]);
  const [selectedSave, setSelectedSave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [buttons, setButtons] = useState([]);
  const [saveSlots, setSaveSlots] = useState([]);
  // PERFORMANCE: Memoize callback references to avoid re-renders
  const onLoadRef = useRef(onLoad);
  const onCancelRef = useRef(onCancel);
  onLoadRef.current = onLoad;
  onCancelRef.current = onCancel;

  useEffect(() => {
    const loadSavedGames = () => {
      try {
        const saves = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('pixelversum_save_')) {
            const saveData = JSON.parse(localStorage.getItem(key));
            saves.push({
              id: key.replace('pixelversum_save_', ''),
              ...saveData,
            });
          }
        }
        saves.sort((a, b) => b.timestamp - a.timestamp);
        setSavedGames(saves);
        setLoading(false);
      } catch (error) {
        console.error('Error loading saved games:', error);
        setLoading(false);
      }
    };
    loadSavedGames();
  }, []);

  // PERFORMANCE: Removed animation loop - all assets are static for 60fps performance

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
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

      saveSlots.forEach(slot => {
        if (x >= slot.x && x <= slot.x + slot.width && y >= slot.y && y <= slot.y + slot.height) {
          setSelectedSave(slot.save);
        }
      });
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [buttons, saveSlots]);

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
      cachedAssets.current.background = generate3DBackgroundTexture(width, height, 24680);
    }
    ctx.drawImage(cachedAssets.current.background, 0, 0);

    // Helper function for simple pixel drawing (used for LEDs)
    const drawPixel = (x, y, color, size = 1) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    };

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).replace(/\//g, '-');
    };

    const centerX = width / 2;
    const centerY = height / 2;

    // Optimize panel sizing for new thin frame
    const panelWidth = Math.min(width * 0.95, 2000);
    const panelHeight = Math.min(height * 0.92, 1300);
    const panelX = centerX - panelWidth / 2;
    const panelY = centerY - panelHeight / 2;

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
    ctx.fillText('LOAD MISSION - ARCHIVE ACCESS', centerX, panelY + 15 + titleBarHeight / 2);

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
    ctx.rect(crtX + 10, crtY + 10, crtW - 25, crtH - 20);
    ctx.clip();

    let yOffset = crtY + 20 - scrollOffset;
    const contentX = crtX + 20;
    const newSaveSlots = [];

    if (loading) {
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.textAlign = 'center';
      // PERFORMANCE: Static loading text (no pulsing animation)
      ctx.fillStyle = '#8a7462';  // Dark amber
      ctx.fillText('ACCESSING ARCHIVE DATABASE...', centerX, crtY + crtH / 2);
    } else if (savedGames.length === 0) {
      ctx.font = `bold 16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.textAlign = 'center';
      ctx.fillText('NO SAVED GAMES FOUND', centerX, crtY + crtH / 2 - 30);

      ctx.font = `11px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('START A NEW MISSION TO CREATE A SAVE', centerX, crtY + crtH / 2);
    } else {
      const slotH = 80;
      const slotSpacing = 10;

      savedGames.forEach((save, index) => {
        const slotY = yOffset + index * (slotH + slotSpacing);
        const slotX = contentX + 5;
        const slotW = crtW - 50;
        const isSelected = selectedSave && selectedSave.id === save.id;

        // Slot background
        ctx.fillStyle = isSelected ? COCKPIT_COLORS.PANEL_DETAIL : COCKPIT_COLORS.PANEL_BG;
        ctx.fillRect(slotX, slotY, slotW, slotH);

        // Save info
        ctx.font = `bold 12px ${fontLoader.getFontFamily('DigitalDisco')}`;
        ctx.fillStyle = isSelected ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
        ctx.textAlign = 'left';
        ctx.fillText(`${save.callsign || 'UNKNOWN'} | ${save.shipName || 'UNNAMED'}`, slotX + 12, slotY + 18);

        ctx.font = `9px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;

        const date = new Date(save.timestamp).toLocaleString();
        ctx.fillText(`DATE: ${date}`, slotX + 12, slotY + 35);

        const playtime = save.playtime || 0;
        const hours = Math.floor(playtime / 60);
        const mins = playtime % 60;
        ctx.fillText(`TIME: ${hours}h ${mins}m`, slotX + 12, slotY + 50);

        ctx.fillText(`CREDITS: ${save.credits || 0}`, slotX + 250, slotY + 50);

        if (isSelected) {
          ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
          ctx.font = `bold 10px ${fontLoader.getFontFamily('DigitalDisco')}`;
          ctx.textAlign = 'right';
          ctx.fillText('> SELECTED', slotX + slotW - 12, slotY + slotH - 12);
        }

        newSaveSlots.push({
          x: slotX,
          y: slotY,
          width: slotW,
          height: slotH,
          save: save,
        });
      });
    }

    ctx.restore();

    const buttonY = panelY + panelHeight - 70;
    const buttonW = 180;
    const buttonH = 45;
    const buttonSpacing = 15;

    const loadBtnX = centerX - buttonW - buttonSpacing / 2;
    const cancelBtnX = centerX + buttonSpacing / 2;

    const newButtons = [];

    // Load button - 3D button
    const loadEnabled = selectedSave !== null;
    const loadColor = loadEnabled ? '#2a1a0a' : '#1a120a';
    const loadButtonCanvas = generate3DButton(buttonW, buttonH, '[>] LOAD MISSION', {
      state: loadEnabled ? 'normal' : 'normal',
      baseColor: loadColor,
      textColor: loadEnabled ? '#8a6a4a' : '#3a2a1a',
      hasLED: false,
      pixelSize: 0.8
    });
    ctx.drawImage(loadButtonCanvas, loadBtnX, buttonY);

    ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = loadEnabled ? COCKPIT_COLORS.TEXT_BRIGHT : COCKPIT_COLORS.TEXT_DIM;
    ctx.textAlign = 'center';
    ctx.fillText('LOAD MISSION', loadBtnX + buttonW / 2, buttonY + buttonH / 2 + 4);

    if (loadEnabled) {
      newButtons.push({
        x: loadBtnX,
        y: buttonY,
        width: buttonW,
        height: buttonH,
        onClick: () => {
          if (selectedSave && onLoadRef.current) {
            onLoadRef.current(selectedSave);
          }
        },
      });
    }

    // Cancel button - 3D button
    const cancelButtonCanvas = generate3DButton(buttonW, buttonH, '[X] CANCEL', {
      state: 'normal',
      baseColor: '#1a120a',
      textColor: '#8a6a4a',
      hasLED: false,
      pixelSize: 0.8
    });
    ctx.drawImage(cancelButtonCanvas, cancelBtnX, buttonY);

    ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
    ctx.fillText('CANCEL', cancelBtnX + buttonW / 2, buttonY + buttonH / 2 + 4);

    newButtons.push({
      x: cancelBtnX,
      y: buttonY,
      width: buttonW,
      height: buttonH,
      onClick: () => onCancelRef.current && onCancelRef.current(),
    });

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
    setSaveSlots(newSaveSlots);

  }, [savedGames, selectedSave, loading, scrollOffset]);  // PERFORMANCE: Removed animFrame and callback dependencies - use refs

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

export default CanvasLoadGameScreen;
