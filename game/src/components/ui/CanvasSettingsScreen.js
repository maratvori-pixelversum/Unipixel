import { useEffect, useRef, useState, useContext, useCallback, useMemo } from 'react';
import fontLoader from '../../utils/FontLoader';
import CockpitFrame from './common/CockpitFrame';
import { ThemeContext } from './ThemeContext';
import {
  generate3DBackgroundTexture,
  generate3DPanel,
  generate3DButton
} from '../../utils/Pixelated3DGenerators';
import {
  drawMetalPanel,
  drawCRTScreen,
  drawCockpitButton,
  drawToggleSwitch,
  drawRivet,
  COCKPIT_COLORS,
} from './common/CockpitAssets';
// PERFORMANCE: Removed unused DebounceRAFRenderer import

/**
 * CanvasSettingsScreen - Complete cockpit redesign
 * Configuration terminal with tabbed interface preserving all existing settings
 */
const CanvasSettingsScreen = ({ onClose, onApply }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  // PERFORMANCE: Asset caching to avoid regenerating expensive 3D assets
  const cachedAssets = useRef({});
  const lastDimensions = useRef({ width: 0, height: 0 });
  // PERFORMANCE: Removed animFrame state - no animations for 60fps performance
  const [activeTab, setActiveTab] = useState('graphics');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [buttons, setButtons] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [draggingSlider, setDraggingSlider] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  const {
    themeName,
    setTheme,
    crtEnabled,
    setCrtEnabled,
    crtIntensity,
    setCrtIntensity,
  } = useContext(ThemeContext);

  // PERFORMANCE: Use ref to avoid re-renders on every setting change
  const settingsRef = useRef({
    // Graphics
    crtEffects: crtEnabled,
    crtStrength: crtIntensity,
    pixelPerfect: true,
    vsync: true,
    screenShake: true,
    particleEffects: true,
    lightingQuality: 'high',
    shadowQuality: 'high',
    textureQuality: 'high',
    // Audio
    masterVolume: 80,
    musicVolume: 70,
    sfxVolume: 85,
    ambientVolume: 60,
    uiSounds: true,
    voiceVolume: 75,
    // Controls
    mouseSensitivity: 50,
    invertY: false,
    edgeScroll: true,
    keyboardSpeed: 50,
    autoAim: false,
    // Gameplay
    autoSave: true,
    autoSaveInterval: 5,
    showTutorials: true,
    pauseOnLostFocus: true,
    difficultyIndicators: true,
    damageNumbers: true,
    minimapSize: 100,
  });
  const [renderKey, setRenderKey] = useState(0); // PERFORMANCE: Only re-render when explicitly requested

  // PERFORMANCE: Removed animation loop - all assets are static for 60fps performance

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      buttons.forEach(btn => {
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height) {
          btn.onClick();
        }
      });

      checkboxes.forEach(cb => {
        if (x >= cb.x && x <= cb.x + cb.size &&
            y >= cb.y && y <= cb.y + cb.size) {
          cb.onClick();
        }
      });

      tabs.forEach(tab => {
        if (x >= tab.x && x <= tab.x + tab.width &&
            y >= tab.y && y <= tab.y + tab.height) {
          tab.onClick();
          setScrollOffset(0);
        }
      });
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      sliders.forEach((slider, index) => {
        const thumbX = slider.x + (slider.width * (slider.value - slider.min) / (slider.max - slider.min));
        if (x >= thumbX - 10 && x <= thumbX + 10 &&
            y >= slider.y - 10 && y <= slider.y + 20) {
          setDraggingSlider(index);
        }
      });
    };

    const handleMouseMove = (e) => {
      if (draggingSlider !== null) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const slider = sliders[draggingSlider];

        const relX = Math.max(slider.x, Math.min(x, slider.x + slider.width));
        const newValue = slider.min + ((relX - slider.x) / slider.width) * (slider.max - slider.min);
        slider.onChange(Math.round(newValue * 10) / 10);
      }
    };

    const handleMouseUp = () => {
      setDraggingSlider(null);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      setScrollOffset(prev => Math.max(0, prev + e.deltaY * 0.5));
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && touchStartY !== null) {
        e.preventDefault();
        const deltaY = touchStartY - e.touches[0].clientY;
        setScrollOffset(prev => Math.max(0, prev + deltaY * 0.8));
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      setTouchStartY(null);
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [buttons, checkboxes, sliders, tabs, draggingSlider, touchStartY]);

  // PERFORMANCE: Memoize apply handler to prevent recreation
  const handleApply = useCallback(() => {
    if (onApply) {
      setCrtEnabled(settingsRef.current.crtEffects);
      setCrtIntensity(settingsRef.current.crtStrength);
      onApply(settingsRef.current);
    }
  }, [onApply, setCrtEnabled, setCrtIntensity]);

  // PERFORMANCE: Memoize setting update handlers - use ref to avoid re-renders
  const updateSetting = useCallback((key, value) => {
    settingsRef.current = { ...settingsRef.current, [key]: value };
    setRenderKey(k => k + 1); // Trigger single re-render
  }, []);

  const toggleSetting = useCallback((key) => {
    settingsRef.current = { ...settingsRef.current, [key]: !settingsRef.current[key] };
    setRenderKey(k => k + 1); // Trigger single re-render
  }, []);

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
      cachedAssets.current.background = generate3DBackgroundTexture(width, height, 98765);
    }
    ctx.drawImage(cachedAssets.current.background, 0, 0);

    const centerX = width / 2;
    const centerY = height / 2;

    // Optimize panel sizing for new thin frame
    const panelWidth = Math.min(width * 0.95, 2000);
    const panelHeight = Math.min(height * 0.92, 1300);
    const panelX = centerX - panelWidth / 2;
    const panelY = centerY - panelHeight / 2;

    // PERFORMANCE: Cache expensive 3D main panel generation
    const panelKey = `mainPanel_${panelWidth}_${panelHeight}`;
    if (!cachedAssets.current[panelKey]) {
      cachedAssets.current[panelKey] = generate3DPanel(panelWidth, panelHeight, {
        baseColor: '#1a120a',
        bevelSize: 10,
        hasScanlines: true,
        hasPanelDividers: true,
        pixelSize: 0.8
      });
    }
    ctx.drawImage(cachedAssets.current[panelKey], panelX, panelY);

    // Title
    const titleBarH = 50;
    drawMetalPanel(ctx, panelX + 15, panelY + 15, panelWidth - 30, titleBarH, {
      rustAmount: 0.2,
      scratchCount: 10,
      depth3D: true,
    });

    ctx.font = `bold 44px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 22px to 32px (1.5x)
    ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SYSTEM CONFIGURATION', centerX, panelY + 15 + titleBarH / 2);

    // Tabs
    const tabsData = [
      { id: 'graphics', label: 'GRAPHICS' },
      { id: 'audio', label: 'AUDIO' },
      { id: 'controls', label: 'CONTROLS' },
      { id: 'gameplay', label: 'GAMEPLAY' },
    ];

    const tabY = panelY + titleBarH + 25;
    const tabW = 140;
    const tabH = 35;
    const tabSpacing = 10;
    const tabsStartX = centerX - ((tabW + tabSpacing) * tabsData.length - tabSpacing) / 2;

    const newTabs = [];
    tabsData.forEach((tab, index) => {
      const tabX = tabsStartX + index * (tabW + tabSpacing);
      const isActive = activeTab === tab.id;

      // PERFORMANCE: Cache 3D tab button generation
      const tabButtonKey = `tab_${tab.id}_${isActive ? 'active' : 'normal'}_${tabW}_${tabH}`;
      if (!cachedAssets.current[tabButtonKey]) {
        cachedAssets.current[tabButtonKey] = generate3DButton(tabW, tabH, '', {
          state: isActive ? 'hover' : 'normal',
          baseColor: isActive ? '#3a2a1a' : '#2a1a0a',
          textColor: isActive ? '#8a6a4a' : '#6a4a2a',
          hasLED: false,
          pixelSize: 0.8
        });
      }
      ctx.drawImage(cachedAssets.current[tabButtonKey], tabX, tabY);

      ctx.font = `bold 16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = isActive ? COCKPIT_COLORS.TEXT_BRIGHT : COCKPIT_COLORS.TEXT_NORMAL;
      ctx.textAlign = 'center';
      ctx.fillText(tab.label, tabX + tabW / 2, tabY + tabH / 2 + 3);

      newTabs.push({
        x: tabX,
        y: tabY,
        width: tabW,
        height: tabH,
        onClick: () => setActiveTab(tab.id),
      });
    });

    // Content area with CRT
    const crtX = panelX + 15;
    const crtY = tabY + tabH + 20;
    const crtW = panelWidth - 30;
    const crtH = panelHeight - (crtY - panelY) - 110;

    drawMetalPanel(ctx, crtX - 8, crtY - 8, crtW + 16, crtH + 16, {
      rustAmount: 0.2,
      scratchCount: 8,
      depth3D: true,
    });

    drawCRTScreen(ctx, crtX, crtY, crtW, crtH, {
      scanlineIntensity: 0.3,
      glowAmount: 0.2,
    });

    // Scrollable content
    ctx.save();
    ctx.beginPath();
    ctx.rect(crtX + 10, crtY + 10, crtW - 30, crtH - 20);
    ctx.clip();

    let yOffset = crtY + 20 - scrollOffset;
    const contentX = crtX + 20;
    const newSliders = [];
    const newCheckboxes = [];

    ctx.font = `14px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
    ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
    ctx.textAlign = 'left';

    // Render settings based on active tab - ENHANCED: Larger text throughout
    if (activeTab === 'graphics') {
      // CRT checkbox
      ctx.font = `bold 22px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 11px to 16px
      ctx.fillText('CRT EFFECTS:', contentX, yOffset);
      yOffset += 24;

      const cbSize = 14;
      drawToggleSwitch(ctx, contentX + 10, yOffset - 7, 40, 14, settingsRef.current.crtEffects);
      newCheckboxes.push({
        x: contentX + 10,
        y: yOffset - 7,
        size: 40,
        onClick: () => toggleSetting('crtEffects'),
      });
      yOffset += 30;

      // Other graphics checkboxes
      const graphicsSettings = [
        { key: 'pixelPerfect', label: 'Pixel-Perfect Rendering' },
        { key: 'vsync', label: 'V-Sync' },
        { key: 'screenShake', label: 'Screen Shake' },
        { key: 'particleEffects', label: 'Particle Effects' },
      ];

      graphicsSettings.forEach(setting => {
        drawToggleSwitch(ctx, contentX + 10, yOffset - 7, 40, 14, settingsRef.current[setting.key]);
        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // INCREASED from 10px to 14px
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(setting.label, contentX + 60, yOffset);

        newCheckboxes.push({
          x: contentX + 10,
          y: yOffset - 7,
          size: 40,
          onClick: () => toggleSetting(setting.key),
        });

        yOffset += 25;
      });

    } else if (activeTab === 'audio') {
      const audioSettings = [
        { key: 'masterVolume', label: 'Master Volume', max: 100 },
        { key: 'musicVolume', label: 'Music Volume', max: 100 },
        { key: 'sfxVolume', label: 'SFX Volume', max: 100 },
        { key: 'ambientVolume', label: 'Ambient Volume', max: 100 },
        { key: 'voiceVolume', label: 'Voice Volume', max: 100 },
      ];

      audioSettings.forEach(setting => {
        ctx.font = `22px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 11px to 15px
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
        ctx.fillText(`${setting.label}:`, contentX, yOffset);
        yOffset += 22;

        const sliderX = contentX + 10;
        const sliderW = 300;
        const sliderY = yOffset;

        // Slider track
        ctx.fillStyle = COCKPIT_COLORS.PANEL_BG;
        ctx.fillRect(sliderX, sliderY, sliderW, 8);

        // Slider fill
        const fillW = (sliderW * settingsRef.current[setting.key]) / setting.max;
        ctx.fillStyle = COCKPIT_COLORS.LED_AMBER;
        ctx.fillRect(sliderX, sliderY, fillW, 8);

        // Thumb
        const thumbX = sliderX + fillW;
        ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
        ctx.fillRect(thumbX - 4, sliderY - 4, 8, 16);

        // Value - ENHANCED: Larger value display
        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 10px to 14px
        ctx.fillText(`${settingsRef.current[setting.key]}%`, sliderX + sliderW + 15, sliderY + 8);

        newSliders.push({
          x: sliderX,
          y: sliderY + 4,
          width: sliderW,
          min: 0,
          max: setting.max,
          value: settingsRef.current[setting.key],
          onChange: (val) => updateSetting(setting.key, Math.round(val)),
        });

        yOffset += 35;
      });

    } else if (activeTab === 'controls') {
      ctx.font = `22px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 11px to 15px
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('Mouse Sensitivity:', contentX, yOffset);
      yOffset += 22;

      const sliderX = contentX + 10;
      const sliderW = 300;
      let sliderY = yOffset;

      ctx.fillStyle = COCKPIT_COLORS.PANEL_BG;
      ctx.fillRect(sliderX, sliderY, sliderW, 8);

      const fillW = (sliderW * (settingsRef.current.mouseSensitivity - 10)) / 190;
      ctx.fillStyle = COCKPIT_COLORS.LED_AMBER;
      ctx.fillRect(sliderX, sliderY, fillW, 8);

      ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
      ctx.fillRect(sliderX + fillW - 4, sliderY - 4, 8, 16);

      ctx.font = `14px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillText(`${settingsRef.current.mouseSensitivity}%`, sliderX + sliderW + 15, sliderY + 8);

      newSliders.push({
        x: sliderX,
        y: sliderY + 4,
        width: sliderW,
        min: 10,
        max: 200,
        value: settingsRef.current.mouseSensitivity,
        onChange: (val) => updateSetting('mouseSensitivity', Math.round(val)),
      });

      yOffset += 45;

      const controlSettings = [
        { key: 'invertY', label: 'Invert Y-Axis' },
        { key: 'edgeScroll', label: 'Edge Scrolling' },
        { key: 'autoAim', label: 'Auto-Aim Assist' },
      ];

      controlSettings.forEach(setting => {
        drawToggleSwitch(ctx, contentX + 10, yOffset - 7, 40, 14, settingsRef.current[setting.key]);
        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // INCREASED from 10px to 14px
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(setting.label, contentX + 60, yOffset);

        newCheckboxes.push({
          x: contentX + 10,
          y: yOffset - 7,
          size: 40,
          onClick: () => toggleSetting(setting.key),
        });

        yOffset += 25;
      });

    } else if (activeTab === 'gameplay') {
      const gameplaySettings = [
        { key: 'autoSave', label: 'Auto-Save' },
        { key: 'showTutorials', label: 'Show Tutorials' },
        { key: 'pauseOnLostFocus', label: 'Pause When Unfocused' },
        { key: 'difficultyIndicators', label: 'Difficulty Indicators' },
        { key: 'damageNumbers', label: 'Damage Numbers' },
      ];

      gameplaySettings.forEach(setting => {
        drawToggleSwitch(ctx, contentX + 10, yOffset - 7, 40, 14, settingsRef.current[setting.key]);
        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // INCREASED from 10px to 14px
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(setting.label, contentX + 60, yOffset);

        newCheckboxes.push({
          x: contentX + 10,
          y: yOffset - 7,
          size: 40,
          onClick: () => toggleSetting(setting.key),
        });

        yOffset += 25;
      });
    }

    const totalContentHeight = yOffset - crtY + scrollOffset;
    ctx.restore();

    // Action buttons
    const buttonY = panelY + panelHeight - 70;
    const buttonW = 180;
    const buttonH = 45;
    const buttonSpacing = 15;

    const applyBtnX = centerX - buttonW - buttonSpacing / 2;
    const closeBtnX = centerX + buttonSpacing / 2;

    const newButtons = [];

    // Apply button - 3D raised button
    const applyButtonCanvas = generate3DButton(buttonW, buttonH, 'APPLY SETTINGS', {
      state: 'normal',
      baseColor: '#3a2a1a',
      textColor: '#8a6a4a',
      hasLED: false,
      pixelSize: 0.8
    });
    ctx.drawImage(applyButtonCanvas, applyBtnX, buttonY);

    ctx.font = `bold 28px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 14px to 20px
    ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.fillText('APPLY', applyBtnX + buttonW / 2, buttonY + buttonH / 2 + 5);

    newButtons.push({
      x: applyBtnX,
      y: buttonY,
      width: buttonW,
      height: buttonH,
      onClick: handleApply,
    });

    // Close button - 3D button
    const closeButtonCanvas = generate3DButton(buttonW, buttonH, 'CLOSE', {
      state: 'normal',
      baseColor: '#2a1a0a',
      textColor: '#8a6a4a',
      hasLED: false,
      pixelSize: 0.8
    });
    ctx.drawImage(closeButtonCanvas, closeBtnX, buttonY);

    ctx.font = `bold 28px ${fontLoader.getFontFamily('DigitalDisco')}`;  // Added explicit font size
    ctx.fillText('CLOSE', closeBtnX + buttonW / 2, buttonY + buttonH / 2 + 5);

    newButtons.push({
      x: closeBtnX,
      y: buttonY,
      width: buttonW,
      height: buttonH,
      onClick: onClose,
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
    setSliders(newSliders);
    setCheckboxes(newCheckboxes);
    setTabs(newTabs);

  }, [activeTab, renderKey, scrollOffset, draggingSlider]); // PERFORMANCE: Reduced dependencies massively!

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
        />
      </div>
    </CockpitFrame>
  );
};

export default CanvasSettingsScreen;
