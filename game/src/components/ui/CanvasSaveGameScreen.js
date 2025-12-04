import { useEffect, useRef, useState, useMemo } from 'react';
import fontLoader from '../../utils/FontLoader';
import CockpitFrame from './common/CockpitFrame';

/**
 * CanvasSaveGameScreen - Enhanced with larger panels, 1px pixelation,
 * MUCH darker vintage colors, compact layout, and more metadata display
 */
const CanvasSaveGameScreen = ({ onSave, onCancel, gameData }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [animFrame, setAnimFrame] = useState(0);
  const [saveName, setSaveName] = useState('');
  const [existingSaves, setExistingSaves] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [buttons, setButtons] = useState([]);
  const [inputFocused, setInputFocused] = useState(false);

  // Memoize to prevent infinite re-renders
  const existingSavesCount = existingSaves.length;

  // Generate default save name
  useEffect(() => {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    setSaveName(`SAVE_${date}_${time}`);
  }, []);

  // Load existing saves
  useEffect(() => {
    const loadExistingSaves = () => {
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
        setExistingSaves(saves);
      } catch (error) {
        console.error('Error loading saves:', error);
      }
    };

    loadExistingSaves();
  }, []);

  // Animation loop - optimized with requestAnimationFrame
  useEffect(() => {
    let lastTime = 0;
    let rafId;

    const animate = (time) => {
      // Throttle to ~30fps for better performance
      if (time - lastTime > 33) {
        setAnimFrame(prev => (prev + 1) % 120);
        lastTime = time;
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Handle clicks - optimized with debouncing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let clickTimeout;
    const handleClick = (e) => {
      // Prevent double-clicks
      if (clickTimeout) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Use find for immediate return
      const clickedButton = buttons.find(btn =>
        x >= btn.x && x <= btn.x + btn.width &&
        y >= btn.y && y <= btn.y + btn.height
      );

      if (clickedButton) {
        clickedButton.onClick();
        clickTimeout = setTimeout(() => { clickTimeout = null; }, 150);
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
      if (clickTimeout) clearTimeout(clickTimeout);
    };
  }, [buttons]);

  const validateSaveName = () => {
    if (!saveName || saveName.trim().length === 0) {
      setError('SAVE NAME CANNOT BE EMPTY');
      return false;
    }
    if (saveName.length > 50) {
      setError('SAVE NAME TOO LONG (MAX 50 CHARACTERS)');
      return false;
    }
    if (!/^[a-zA-Z0-9_\-\s]+$/.test(saveName)) {
      setError('INVALID CHARACTERS (USE A-Z, 0-9, _, -, SPACE)');
      return false;
    }
    setError('');
    return true;
  };

  const handleSaveClick = async () => {
    if (!validateSaveName()) return;

    setSaving(true);
    setError('');

    try {
      const saveId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const saveData = {
        name: saveName.trim(),
        timestamp: Date.now(),
        ...gameData,
      };

      localStorage.setItem(`pixelversum_save_${saveId}`, JSON.stringify(saveData));

      if (onSave) {
        await onSave(saveId, saveData);
      }

      setSaving(false);
    } catch (error) {
      console.error('Error saving game:', error);
      setError('SAVE FAILED - STORAGE ERROR');
      setSaving(false);
    }
  };

  const handleQuickSave = () => {
    setSaveName('QUICKSAVE');
    setTimeout(() => handleSaveClick(), 100);
  };

  // Render
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

    // Clear
    ctx.fillStyle = '#0d0a08';
    ctx.fillRect(0, 0, width, height);

    // Helper functions
    const drawPixel = (x, y, color, size = 1) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    };

    // Optimized pixelation with fast path for performance
    const drawPixelatedRect = (x, y, w, h, baseColor, pixelSize = 1, variation = 10) => {
      // Fast path: if variation is low or area is large, just fill
      if (variation < 5 || w * h > 10000) {
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, w, h);
        return;
      }

      // Standard path with noise overlay
      const rgb = hexToRgb(baseColor);
      ctx.fillStyle = baseColor;
      ctx.fillRect(x, y, w, h);

      // Add subtle noise overlay instead of pixel-by-pixel
      if (variation > 0) {
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < Math.min(50, (w * h) / 100); i++) {
          const px = x + Math.random() * w;
          const py = y + Math.random() * h;
          const vary = (Math.random() - 0.5) * variation * 2;
          const r = Math.max(0, Math.min(255, rgb.r + vary));
          const g = Math.max(0, Math.min(255, rgb.g + vary));
          const b = Math.max(0, Math.min(255, rgb.b + vary));
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(px, py, pixelSize * 2, pixelSize * 2);
        }
        ctx.globalAlpha = 1.0;
      }
    };

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
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

    const formatPlaytime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const centerX = width / 2;
    const centerY = height / 2;

    // 65% width, 70% height panel coverage
    const panelWidth = Math.min(width * 0.80, 2000);
    const panelHeight = Math.min(height * 0.85, 1200);
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;

    // 3D shadow effect
    ctx.save();
    ctx.translate(panelX + 6, panelY + 6);
    ctx.transform(1, 0.02, 0, 1, 0, 0);
    drawPixelatedRect(0, 0, panelWidth, panelHeight, '#000000', 1, 5);
    ctx.restore();

    // Main panel with darker vintage colors
    drawPixelatedRect(panelX, panelY, panelWidth, panelHeight, '#080604', 1, 8);

    // Title bar with 3D tilt
    const titleBarHeight = 35;
    ctx.save();
    ctx.translate(panelX, panelY);
    ctx.transform(1, -0.03, 0, 1, 0, 0);
    drawPixelatedRect(10, 10, panelWidth - 20, titleBarHeight, '#1a120a', 1, 12);
    ctx.restore();

    ctx.font = `bold 16px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = '#8a6a4a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SAVE MISSION - ARCHIVE EXPEDITION', centerX, panelY + 27);

    // 6 status LEDs in title bar
    for (let i = 0; i < 6; i++) {
      const ledX = panelX + 20 + i * 12;
      const ledY = panelY + 18;
      const ledOn = Math.sin(animFrame * 0.2 + i) > 0;
      const ledColor = ledOn ? '#4a3a2a' : '#1a1208';

      for (let py = -2; py <= 2; py += 1) {
        for (let px = -2; px <= 2; px += 1) {
          const dist = Math.sqrt(px * px + py * py);
          if (dist < 2.5) {
            drawPixel(ledX + px, ledY + py, ledColor, 1);
          }
        }
      }

      if (ledOn) {
        ctx.fillStyle = 'rgba(74, 58, 42, 0.15)';
        ctx.beginPath();
        ctx.arc(ledX, ledY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Content area
    const contentX = panelX + 25;
    const contentY = panelY + titleBarHeight + 25;

    // Save name input section - compact
    ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = '#8a6a4a';
    ctx.textAlign = 'left';
    ctx.fillText('> SAVE FILE NAME', contentX, contentY);

    const inputY = contentY + 22;
    const inputWidth = panelWidth - 50;
    const inputHeight = 35;

    // Input box
    drawPixelatedRect(contentX, inputY, inputWidth, inputHeight, '#080604', 1, 8);

    // Input text with cursor
    ctx.font = `18px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.textAlign = 'left';
    const displayText = saveName || 'ENTER SAVE NAME...';
    const textColor = saveName ? '#8a6a4a' : '#3a2a1a';
    ctx.fillStyle = textColor;
    ctx.fillText(displayText, contentX + 12, inputY + inputHeight / 2 + 4);

    // Cursor blink
    if (inputFocused && Math.sin(animFrame * 0.2) > 0) {
      const textWidth = ctx.measureText(saveName).width;
      ctx.fillStyle = '#8a6a4a';
      ctx.fillRect(contentX + 12 + textWidth + 2, inputY + 9, 2, 18);
    }

    // Error message - compact
    if (error) {
      ctx.font = `10px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = '#ff4444';
      ctx.fillText(`! ${error}`, contentX, inputY + inputHeight + 16);
    }

    // Current mission status - compact
    let yOffset = inputY + inputHeight + (error ? 38 : 28);
    ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = '#8a6a4a';
    ctx.fillText('> CURRENT MISSION STATUS', contentX, yOffset);

    yOffset += 25;

    // Two-column compact layout
    const infoItems = [
      { label: 'CALLSIGN:', value: gameData?.callsign || 'UNKNOWN' },
      { label: 'VESSEL:', value: gameData?.shipName || 'UNNAMED' },
      { label: 'PLAYTIME:', value: formatPlaytime(gameData?.playtime || 0) },
      { label: 'SYSTEMS:', value: `${gameData?.systemsExplored || 0}` },
      { label: 'CREDITS:', value: `${gameData?.credits || 0}` },
      { label: 'STATUS:', value: gameData?.crewAlive ? 'OPERATIONAL' : 'CRITICAL' },
      { label: 'GALAXY:', value: (gameData?.galaxySize || 'MEDIUM').toUpperCase() },
      { label: 'DIFFICULTY:', value: (gameData?.difficulty || 'ADVENTURER').toUpperCase() },
    ];

    ctx.font = `11px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;

    infoItems.forEach((item, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const itemX = contentX + col * (panelWidth / 2 - 40);
      const itemY = yOffset + row * 20;

      ctx.fillStyle = '#8a6a4a';
      ctx.fillText(item.label, itemX, itemY);

      ctx.fillStyle = '#8a6a4a';
      ctx.fillText(item.value, itemX + 110, itemY);
    });

    yOffset += 100;

    // Existing saves - compact list
    if (existingSaves.length > 0) {
      ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = '#8a6a4a';
      ctx.fillText('> EXISTING SAVE FILES', contentX, yOffset);

      yOffset += 20;

      ctx.font = `10px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = '#8a6a4a';
      ctx.fillText('(Click existing save to overwrite)', contentX, yOffset);

      yOffset += 20;

      const displaySaves = existingSaves.slice(0, 4);
      displaySaves.forEach((save, index) => {
        const saveY = yOffset + index * 16;

        ctx.font = `10px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
        ctx.fillStyle = '#8a6a4a';
        ctx.fillText(`• ${save.name} - ${formatTimestamp(save.timestamp)}`, contentX, saveY);
      });
    }

    // Hint at bottom of panel - compact
    const hintY = panelY + panelHeight - 75;
    ctx.font = `10px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
    ctx.fillStyle = '#8a6a4a';
    ctx.textAlign = 'center';
    ctx.fillText('√ SAVE DATA STORED LOCALLY IN BROWSER', centerX, hintY);

    // Action buttons - compact
    const buttonY = panelY + panelHeight - 55;
    const buttonWidth = 170;
    const buttonHeight = 38;
    const buttonSpacing = 12;

    const saveBtnX = centerX - buttonWidth * 1.5 - buttonSpacing;
    const quickSaveBtnX = centerX - buttonWidth / 2;
    const cancelBtnX = centerX + buttonWidth / 2 + buttonSpacing;

    const newButtons = [];

    // Save button
    const saveEnabled = !saving && saveName.trim().length > 0;
    const saveColor = saveEnabled ? '#1a120a' : '#100a06';
    drawPixelatedRect(saveBtnX, buttonY, buttonWidth, buttonHeight, saveColor, 1, 12);

    ctx.font = `bold 18px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = saveEnabled ? '#8a6a4a' : '#3a2a1a';
    ctx.textAlign = 'center';
    ctx.fillText(saving ? 'SAVING...' : '[√] SAVE', saveBtnX + buttonWidth / 2, buttonY + buttonHeight / 2 + 2);

    if (saveEnabled) {
      newButtons.push({
        x: saveBtnX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        onClick: handleSaveClick,
      });
    }

    // Quick Save button
    const quickSaveEnabled = !saving;
    const quickSaveColor = quickSaveEnabled ? '#100a06' : '#080604';
    drawPixelatedRect(quickSaveBtnX, buttonY, buttonWidth, buttonHeight, quickSaveColor, 1, 10);

    ctx.fillStyle = quickSaveEnabled ? '#8a6a4a' : '#3a2a1a';
    ctx.fillText('[>>] QUICK SAVE', quickSaveBtnX + buttonWidth / 2, buttonY + buttonHeight / 2 + 2);

    if (quickSaveEnabled) {
      newButtons.push({
        x: quickSaveBtnX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        onClick: handleQuickSave,
      });
    }

    // Cancel button
    drawPixelatedRect(cancelBtnX, buttonY, buttonWidth, buttonHeight, '#100a06', 1, 10);

    ctx.fillStyle = '#8a6a4a';
    ctx.fillText('[X] CANCEL', cancelBtnX + buttonWidth / 2, buttonY + buttonHeight / 2 + 2);

    newButtons.push({
      x: cancelBtnX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      onClick: onCancel,
    });

    // CRT Effects
    for (let y = 0; y < height; y += 4) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, y, width, 2);
    }

    const vignetteGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.7);
    vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
    vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(204, 136, 68, 0.02)';
    ctx.fillRect(0, 0, width, height);

    setButtons(newButtons);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animFrame, saveName, existingSavesCount, error, saving, inputFocused]);

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
        {/* Hidden input for keyboard input */}
        <input
          ref={inputRef}
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value.toUpperCase())}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          maxLength={50}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            padding: '10px',
            background: 'rgba(13, 10, 8, 0.95)',
            border: '2px solid #8a6a4a',
            color: '#8a6a4a',
            fontFamily: fontLoader.getFontFamily('DigitalDisco'),
            fontSize: '14px',
            outline: 'none',
            zIndex: 10,
          }}
          autoFocus
        />
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
        />
      </div>
    </CockpitFrame>
  );
};

export default CanvasSaveGameScreen;
