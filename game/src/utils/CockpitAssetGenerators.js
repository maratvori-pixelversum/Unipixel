/**
 * CockpitAssetGenerators.js
 *
 * Advanced generators for creating realistic spaceship cockpit UI elements
 * with heavily pixelated 3D aesthetic inspired by Alien movie retro sci-fi.
 *
 * All generators create off-screen canvases that can be cached and reused.
 * Uses thousands of tiny pixels (1px base) to create extreme detail.
 * 3D depth achieved through extensive dark color shading.
 */

// ============================================================================
// SEEDED RANDOM NUMBER GENERATOR
// ============================================================================

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  random() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min, max) {
    return min + this.random() * (max - min);
  }

  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function blendColors(color1, color2, ratio) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  return rgbToHex(
    c1.r + (c2.r - c1.r) * ratio,
    c1.g + (c2.g - c1.g) * ratio,
    c1.b + (c2.b - c1.b) * ratio
  );
}

// ============================================================================
// ENHANCED CRT MONITOR GENERATOR
// ============================================================================

/**
 * Generate a realistic CRT monitor panel with curved screen effect
 * @param {number} width - Monitor width
 * @param {number} height - Monitor height
 * @param {object} options - Configuration
 * @returns {HTMLCanvasElement}
 */
export function generateCRTMonitor(width, height, options = {}) {
  const {
    phosphorColor = 'amber', // Changed default from 'green' to 'amber' - NO GREEN
    frameColor = '#3a3a3a',
    screenInset = 20,
    hasScanlines = true,
    scanlineIntensity = 0.3,
    hasVignette = true,
    hasCurve = true,
    hasReflections = true,
    pixelSize = 1
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(12345);

  // Phosphor color mapping - DARK COLORS ONLY (NO GREEN/BRIGHT)
  const phosphorColors = {
    green: { base: '#1a1208', glow: '#4a3828', bright: '#6a5442' },  // Changed from green to dark brown
    amber: { base: '#1a1208', glow: '#4a3828', bright: '#6a5442' },  // Dark amber/brown
    white: { base: '#0a0805', glow: '#2a2218', bright: '#4a3a2a' }   // Dark gray/brown
  };

  const colors = phosphorColors[phosphorColor] || phosphorColors.amber;

  // === OUTER BEZEL (raised metal frame) ===
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distFromEdge = Math.min(x, y, width - x - 1, height - y - 1);

      if (distFromEdge < screenInset) {
        const frameRgb = hexToRgb(frameColor);
        let r = frameRgb.r;
        let g = frameRgb.g;
        let b = frameRgb.b;

        // Top-left highlight
        if (y < 8 && x < width - 8) {
          const factor = 1 + (8 - y) * 0.08;
          r *= factor;
          g *= factor;
          b *= factor;
        }

        // Bottom-right shadow
        if (y > height - 8 && x > 8) {
          const factor = 0.4;
          r *= factor;
          g *= factor;
          b *= factor;
        }

        // Surface texture
        const noise = (rng.random() - 0.5) * 15;
        r = Math.max(0, Math.min(255, r + noise));
        g = Math.max(0, Math.min(255, g + noise));
        b = Math.max(0, Math.min(255, b + noise));

        // Scratches
        if (rng.random() > 0.998) {
          r += 30;
          g += 30;
          b += 30;
        }

        ctx.fillStyle = rgbToHex(r, g, b);
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }

  // === SCREEN AREA (inset) ===
  const screenX = screenInset;
  const screenY = screenInset;
  const screenW = width - screenInset * 2;
  const screenH = height - screenInset * 2;

  // Base screen color (phosphor when off)
  ctx.fillStyle = colors.base;
  ctx.fillRect(screenX, screenY, screenW, screenH);

  // === SCREEN CURVATURE EFFECT ===
  if (hasCurve) {
    for (let y = screenY; y < screenY + screenH; y++) {
      for (let x = screenX; x < screenX + screenW; x++) {
        const relX = (x - screenX) / screenW - 0.5;
        const relY = (y - screenY) / screenH - 0.5;
        const dist = Math.sqrt(relX * relX + relY * relY);

        // Darken edges to simulate curve
        if (dist > 0.4) {
          const darkFactor = 0.7 - (dist - 0.4) * 2;
          ctx.fillStyle = `rgba(0, 0, 0, ${1 - darkFactor})`;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    }
  }

  // === SCANLINES ===
  if (hasScanlines) {
    for (let y = screenY; y < screenY + screenH; y += 2) {
      ctx.fillStyle = `rgba(0, 0, 0, ${scanlineIntensity})`;
      ctx.fillRect(screenX, y, screenW, 1);
    }
  }

  // === VIGNETTE ===
  if (hasVignette) {
    const gradient = ctx.createRadialGradient(
      screenX + screenW / 2, screenY + screenH / 2, 0,
      screenX + screenW / 2, screenY + screenH / 2, Math.max(screenW, screenH) * 0.6
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(screenX, screenY, screenW, screenH);
  }

  // === SCREEN REFLECTIONS ===
  if (hasReflections) {
    // Simulated light reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(screenX + screenW * 0.1, screenY + screenH * 0.1, screenW * 0.3, screenH * 0.2);
  }

  return canvas;
}

// ============================================================================
// PHYSICAL BUTTON GENERATORS
// ============================================================================

/**
 * Generate a chunky mechanical keyboard-style button
 * @param {number} width - Button width
 * @param {number} height - Button height
 * @param {string} label - Button text
 * @param {object} options - Configuration
 * @returns {HTMLCanvasElement}
 */
export function generateMechanicalButton(width, height, label, options = {}) {
  const {
    state = 'normal', // 'normal', 'hover', 'pressed'
    baseColor = '#4a4a4a',
    textColor = '#dddddd',
    hasLED = false,
    ledColor = '#8a5840', // Dark amber (NO GREEN)
    ledOn = true,
    pixelSize = 1
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(label.charCodeAt(0) || 42);

  const pressed = state === 'pressed';
  const hover = state === 'hover';

  // Adjust dimensions for pressed state
  const offsetY = pressed ? 3 : 0;
  const btnHeight = pressed ? height - 3 : height - 2;

  // === BUTTON SHADOW (only when not pressed) ===
  if (!pressed) {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, height - 4, width, 4);
  }

  // === BUTTON BODY ===
  const rgb = hexToRgb(hover ? blendColors(baseColor, '#ffffff', 0.2) : baseColor);

  for (let y = 0; y < btnHeight; y++) {
    for (let x = 0; x < width; x++) {
      let r = rgb.r;
      let g = rgb.g;
      let b = rgb.b;

      // Top highlight
      if (y < 4) {
        const factor = 1 + (4 - y) * 0.15;
        r *= factor;
        g *= factor;
        b *= factor;
      }

      // Bottom shadow
      if (y > btnHeight - 6) {
        const factor = 0.5;
        r *= factor;
        g *= factor;
        b *= factor;
      }

      // Left highlight
      if (x < 4) {
        const factor = 1 + (4 - x) * 0.1;
        r *= factor;
        g *= factor;
        b *= factor;
      }

      // Right shadow
      if (x > width - 6) {
        const factor = 0.6;
        r *= factor;
        g *= factor;
        b *= factor;
      }

      // Surface texture
      const noise = (rng.random() - 0.5) * 10;
      r = Math.max(0, Math.min(255, r + noise));
      g = Math.max(0, Math.min(255, g + noise));
      b = Math.max(0, Math.min(255, b + noise));

      ctx.fillStyle = rgbToHex(r, g, b);
      ctx.fillRect(x, y + offsetY, pixelSize, pixelSize);
    }
  }

  // === LED INDICATOR ===
  if (hasLED && ledOn) {
    const ledX = width - 12;
    const ledY = 6 + offsetY;
    const ledSize = 4;

    // LED glow
    const ledRgb = hexToRgb(ledColor);
    ctx.fillStyle = `rgba(${ledRgb.r}, ${ledRgb.g}, ${ledRgb.b}, 0.3)`;
    ctx.beginPath();
    ctx.arc(ledX + ledSize / 2, ledY + ledSize / 2, ledSize * 2, 0, Math.PI * 2);
    ctx.fill();

    // LED core
    ctx.fillStyle = ledColor;
    ctx.fillRect(ledX, ledY, ledSize, ledSize);

    // LED highlight
    ctx.fillStyle = blendColors(ledColor, '#ffffff', 0.5);
    ctx.fillRect(ledX + 1, ledY + 1, 2, 2);
  }

  // === BUTTON TEXT ===
  if (label) {
    ctx.font = `bold ${Math.floor(height * 0.35)}px monospace`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, width / 2, btnHeight / 2 + offsetY);
  }

  return canvas;
}

/**
 * Generate a toggle switch (2-position)
 * @param {number} width - Switch width
 * @param {number} height - Switch height
 * @param {boolean} isOn - Switch state
 * @param {object} options - Configuration
 * @returns {HTMLCanvasElement}
 */
export function generateToggleSwitch(width, height, isOn, options = {}) {
  const {
    switchColor = '#3a3a3a',
    handleColor = '#ff4444',
    ledOnColor = '#8a5840', // Dark amber (NO GREEN)
    ledOffColor = '#1a1410', // Dark off color (NO GREEN)
    pixelSize = 1
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(54321);

  // === SWITCH BASE ===
  const baseRgb = hexToRgb(switchColor);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = baseRgb.r;
      let g = baseRgb.g;
      let b = baseRgb.b;

      // Inset effect (darker)
      if (y < 3 || x < 3) {
        r *= 0.5;
        g *= 0.5;
        b *= 0.5;
      }

      const noise = (rng.random() - 0.5) * 8;
      r = Math.max(0, Math.min(255, r + noise));
      g = Math.max(0, Math.min(255, g + noise));
      b = Math.max(0, Math.min(255, b + noise));

      ctx.fillStyle = rgbToHex(r, g, b);
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  // === SWITCH HANDLE ===
  const handleW = width * 0.6;
  const handleH = height * 0.7;
  const handleX = isOn ? width - handleW - 4 : 4;
  const handleY = (height - handleH) / 2;

  const handleRgb = hexToRgb(handleColor);
  for (let y = 0; y < handleH; y++) {
    for (let x = 0; x < handleW; x++) {
      let r = handleRgb.r;
      let g = handleRgb.g;
      let b = handleRgb.b;

      // Top highlight
      if (y < 3) {
        r *= 1.3;
        g *= 1.3;
        b *= 1.3;
      }

      // Bottom shadow
      if (y > handleH - 4) {
        r *= 0.5;
        g *= 0.5;
        b *= 0.5;
      }

      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));

      ctx.fillStyle = rgbToHex(r, g, b);
      ctx.fillRect(handleX + x, handleY + y, pixelSize, pixelSize);
    }
  }

  // === LED INDICATORS ===
  const ledSize = 4;
  const ledY = height - ledSize - 3;

  // ON LED (green, right side)
  const onLedX = width - ledSize - 4;
  ctx.fillStyle = isOn ? ledOnColor : '#003300';
  ctx.fillRect(onLedX, ledY, ledSize, ledSize);
  if (isOn) {
    ctx.fillStyle = blendColors(ledOnColor, '#ffffff', 0.4);
    ctx.fillRect(onLedX + 1, ledY + 1, 2, 2);
  }

  // OFF LED (red, left side)
  const offLedX = 4;
  ctx.fillStyle = isOn ? ledOffColor : '#ff4444';
  ctx.fillRect(offLedX, ledY, ledSize, ledSize);
  if (!isOn) {
    ctx.fillStyle = blendColors('#ff4444', '#ffffff', 0.4);
    ctx.fillRect(offLedX + 1, ledY + 1, 2, 2);
  }

  return canvas;
}

// ============================================================================
// ANALOG CONTROL GENERATORS
// ============================================================================

/**
 * Generate a circular gauge with needle
 * @param {number} diameter - Gauge diameter
 * @param {number} value - Current value (0-100)
 * @param {object} options - Configuration
 * @returns {HTMLCanvasElement}
 */
export function generateCircularGauge(diameter, value, options = {}) {
  const {
    label = '',
    unit = '',
    min = 0,
    max = 100,
    dangerZone = 80,
    faceColor = '#2a2a2a',
    needleColor = '#ffaa00',
    dangerColor = '#ff4444',
    textColor = '#cccccc',
    pixelSize = 1
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = diameter;
  canvas.height = diameter;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const centerX = diameter / 2;
  const centerY = diameter / 2;
  const radius = diameter / 2 - 10;
  const rng = new SeededRandom(label.charCodeAt(0) || 123);

  // === GAUGE FACE ===
  const faceRgb = hexToRgb(faceColor);
  for (let y = 0; y < diameter; y++) {
    for (let x = 0; x < diameter; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        let r = faceRgb.r;
        let g = faceRgb.g;
        let b = faceRgb.b;

        // Circular gradient
        const gradientFactor = 1 - (dist / radius) * 0.3;
        r *= gradientFactor;
        g *= gradientFactor;
        b *= gradientFactor;

        const noise = (rng.random() - 0.5) * 12;
        r = Math.max(0, Math.min(255, r + noise));
        g = Math.max(0, Math.min(255, g + noise));
        b = Math.max(0, Math.min(255, b + noise));

        ctx.fillStyle = rgbToHex(r, g, b);
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }

  // === TICK MARKS ===
  const startAngle = -225 * Math.PI / 180; // Bottom left
  const endAngle = 45 * Math.PI / 180;     // Bottom right
  const angleRange = endAngle - startAngle;

  for (let i = 0; i <= 10; i++) {
    const angle = startAngle + (angleRange * i / 10);
    const isMajor = i % 2 === 0;
    const tickLength = isMajor ? 12 : 6;
    const tickWidth = isMajor ? 2 : 1;

    const x1 = centerX + Math.cos(angle) * (radius - tickLength);
    const y1 = centerY + Math.sin(angle) * (radius - tickLength);
    const x2 = centerX + Math.cos(angle) * radius;
    const y2 = centerY + Math.sin(angle) * radius;

    // Draw tick as rectangle
    const isDanger = (i / 10 * (max - min) + min) >= dangerZone;
    ctx.fillStyle = isDanger ? dangerColor : textColor;

    for (let t = 0; t < tickWidth; t++) {
      ctx.fillRect(x1 - t, y1, x2 - x1 + t * 2, y2 - y1);
    }
  }

  // === VALUE TEXT ===
  ctx.font = `bold ${diameter * 0.12}px monospace`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(value) + (unit || ''), centerX, centerY + diameter * 0.15);

  // === LABEL ===
  if (label) {
    ctx.font = `${diameter * 0.08}px monospace`;
    ctx.fillText(label, centerX, centerY - diameter * 0.2);
  }

  // === NEEDLE ===
  const needleAngle = startAngle + (angleRange * ((value - min) / (max - min)));
  const needleLength = radius - 15;

  // Needle shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  const shadowX = centerX + Math.cos(needleAngle) * needleLength + 2;
  const shadowY = centerY + Math.sin(needleAngle) * needleLength + 2;
  ctx.fillRect(shadowX - 2, shadowY - 2, 4, 4);

  // Needle body
  const needleX = centerX + Math.cos(needleAngle) * needleLength;
  const needleY = centerY + Math.sin(needleAngle) * needleLength;

  ctx.strokeStyle = needleColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(needleX, needleY);
  ctx.stroke();

  // Needle tip
  ctx.fillStyle = needleColor;
  ctx.fillRect(needleX - 2, needleY - 2, 4, 4);

  // Center pivot
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(centerX - 4, centerY - 4, 8, 8);
  ctx.fillStyle = needleColor;
  ctx.fillRect(centerX - 2, centerY - 2, 4, 4);

  return canvas;
}

/**
 * Generate a horizontal fader/slider
 * @param {number} width - Slider width
 * @param {number} height - Slider height
 * @param {number} value - Current value (0-100)
 * @param {object} options - Configuration
 * @returns {HTMLCanvasElement}
 */
export function generateHorizontalFader(width, height, value, options = {}) {
  const {
    label = '',
    trackColor = '#1a1a1a',
    handleColor = '#4a4a4a',
    fillColor = '#ffaa00',
    showFill = true,
    pixelSize = 1
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(label.charCodeAt(0) || 456);

  const trackHeight = Math.floor(height * 0.3);
  const trackY = (height - trackHeight) / 2;
  const handleWidth = 12;
  const handleHeight = height * 0.8;
  const handleX = (width - handleWidth) * (value / 100);
  const handleY = (height - handleHeight) / 2;

  // === TRACK (inset) ===
  const trackRgb = hexToRgb(trackColor);
  for (let y = trackY; y < trackY + trackHeight; y++) {
    for (let x = 0; x < width; x++) {
      let r = trackRgb.r;
      let g = trackRgb.g;
      let b = trackRgb.b;

      // Inset shadow
      if (y < trackY + 2 || x < 2) {
        r *= 0.5;
        g *= 0.5;
        b *= 0.5;
      }

      const noise = (rng.random() - 0.5) * 8;
      r = Math.max(0, Math.min(255, r + noise));
      g = Math.max(0, Math.min(255, g + noise));
      b = Math.max(0, Math.min(255, b + noise));

      ctx.fillStyle = rgbToHex(r, g, b);
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  // === FILL (value indicator) ===
  if (showFill && value > 0) {
    const fillWidth = handleX + handleWidth / 2;
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, trackY + 2, fillWidth, trackHeight - 4);
  }

  // === HANDLE (raised) ===
  const handleRgb = hexToRgb(handleColor);
  for (let y = 0; y < handleHeight; y++) {
    for (let x = 0; x < handleWidth; x++) {
      let r = handleRgb.r;
      let g = handleRgb.g;
      let b = handleRgb.b;

      // Top/left highlight
      if (y < 3 || x < 2) {
        r *= 1.4;
        g *= 1.4;
        b *= 1.4;
      }

      // Bottom/right shadow
      if (y > handleHeight - 4 || x > handleWidth - 3) {
        r *= 0.5;
        g *= 0.5;
        b *= 0.5;
      }

      const noise = (rng.random() - 0.5) * 10;
      r = Math.max(0, Math.min(255, r + noise));
      g = Math.max(0, Math.min(255, g + noise));
      b = Math.max(0, Math.min(255, b + noise));

      ctx.fillStyle = rgbToHex(r, g, b);
      ctx.fillRect(handleX + x, handleY + y, pixelSize, pixelSize);
    }
  }

  // Handle center line (grip detail)
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(handleX + handleWidth / 2 - 1, handleY + 4, 2, handleHeight - 8);

  return canvas;
}

// ============================================================================
// LED INDICATOR SYSTEM
// ============================================================================

/**
 * Generate an LED indicator (single light)
 * @param {number} size - LED diameter
 * @param {boolean} isOn - LED state
 * @param {object} options - Configuration
 * @returns {HTMLCanvasElement}
 */
export function generateLED(size, isOn, options = {}) {
  const {
    color = '#8a5840', // Dark amber (NO GREEN)
    offColor = '#1a1410', // Dark off color (NO GREEN)
    glowIntensity = 0.4,
    pixelSize = 1
  } = options;

  const canvas = document.createElement('canvas');
  const glowSize = isOn ? size * 3 : size;
  canvas.width = glowSize;
  canvas.height = glowSize;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const centerX = glowSize / 2;
  const centerY = glowSize / 2;

  // === GLOW EFFECT (when on) ===
  if (isOn) {
    const ledRgb = hexToRgb(color);
    for (let y = 0; y < glowSize; y++) {
      for (let x = 0; x < glowSize; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = glowSize / 2;

        if (dist < maxDist) {
          const alpha = glowIntensity * (1 - dist / maxDist) * (1 - dist / maxDist);
          ctx.fillStyle = `rgba(${ledRgb.r}, ${ledRgb.g}, ${ledRgb.b}, ${alpha})`;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    }
  }

  // === LED BODY ===
  const ledX = (glowSize - size) / 2;
  const ledY = (glowSize - size) / 2;
  const activeColor = isOn ? color : offColor;
  const ledRgb = hexToRgb(activeColor);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - size / 2;
      const dy = y - size / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < size / 2) {
        let r = ledRgb.r;
        let g = ledRgb.g;
        let b = ledRgb.b;

        // Circular gradient
        const gradientFactor = 1 - (dist / (size / 2)) * 0.3;
        r *= gradientFactor;
        g *= gradientFactor;
        b *= gradientFactor;

        ctx.fillStyle = rgbToHex(r, g, b);
        ctx.fillRect(ledX + x, ledY + y, pixelSize, pixelSize);
      }
    }
  }

  // === HIGHLIGHT (when on) ===
  if (isOn) {
    const highlightSize = Math.floor(size * 0.4);
    const highlightX = ledX + Math.floor(size * 0.25);
    const highlightY = ledY + Math.floor(size * 0.25);

    ctx.fillStyle = blendColors(color, '#ffffff', 0.6);
    for (let y = 0; y < highlightSize; y++) {
      for (let x = 0; x < highlightSize; x++) {
        ctx.fillRect(highlightX + x, highlightY + y, pixelSize, pixelSize);
      }
    }
  }

  return canvas;
}

/**
 * Generate a 7-segment display showing a number
 * @param {number} width - Display width
 * @param {number} height - Display height
 * @param {string} value - Number to display (0-9 or blank)
 * @param {object} options - Configuration
 * @returns {HTMLCanvasElement}
 */
export function generate7SegmentDisplay(width, height, value, options = {}) {
  const {
    onColor = '#ff4444',
    offColor = '#220000',
    bgColor = '#0a0a0a',
    pixelSize = 1
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Segment definitions (which segments are on for each digit)
  const digitSegments = {
    '0': [1, 1, 1, 1, 1, 1, 0],
    '1': [0, 1, 1, 0, 0, 0, 0],
    '2': [1, 1, 0, 1, 1, 0, 1],
    '3': [1, 1, 1, 1, 0, 0, 1],
    '4': [0, 1, 1, 0, 0, 1, 1],
    '5': [1, 0, 1, 1, 0, 1, 1],
    '6': [1, 0, 1, 1, 1, 1, 1],
    '7': [1, 1, 1, 0, 0, 0, 0],
    '8': [1, 1, 1, 1, 1, 1, 1],
    '9': [1, 1, 1, 1, 0, 1, 1],
    ' ': [0, 0, 0, 0, 0, 0, 0]
  };

  const segments = digitSegments[value] || digitSegments[' '];

  const segW = width * 0.6;
  const segH = height * 0.08;
  const segVW = height * 0.08;
  const segVH = height * 0.35;
  const gap = 3;

  const centerX = width / 2;
  const topY = height * 0.15;
  const midY = height / 2;
  const bottomY = height * 0.85;

  // Helper to draw segment
  const drawSegment = (x, y, w, h, isOn) => {
    ctx.fillStyle = isOn ? onColor : offColor;
    ctx.fillRect(x, y, w, h);
  };

  // Draw segments (a-g)
  drawSegment(centerX - segW / 2, topY - segH / 2, segW, segH, segments[0]); // a (top)
  drawSegment(centerX + segW / 2 - segVW / 2, topY, segVW, segVH, segments[1]); // b (top right)
  drawSegment(centerX + segW / 2 - segVW / 2, midY, segVW, segVH, segments[2]); // c (bottom right)
  drawSegment(centerX - segW / 2, bottomY - segH / 2, segW, segH, segments[3]); // d (bottom)
  drawSegment(centerX - segW / 2 - segVW / 2, midY, segVW, segVH, segments[4]); // e (bottom left)
  drawSegment(centerX - segW / 2 - segVW / 2, topY, segVW, segVH, segments[5]); // f (top left)
  drawSegment(centerX - segW / 2, midY - segH / 2, segW, segH, segments[6]); // g (middle)

  return canvas;
}

// ============================================================================
// PANEL DETAIL GENERATORS
// ============================================================================

/**
 * Generate a vent grille pattern
 * @param {number} width - Grille width
 * @param {number} height - Grille height
 * @param {object} options - Configuration
 * @returns {HTMLCanvasElement}
 */
export function generateVentGrille(width, height, options = {}) {
  const {
    pattern = 'horizontal', // 'horizontal', 'vertical', 'diamond'
    slotWidth = 2,
    slotSpacing = 4,
    baseColor = '#2a2a2a',
    pixelSize = 1
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(789);
  const rgb = hexToRgb(baseColor);

  // Base panel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = rgb.r;
      let g = rgb.g;
      let b = rgb.b;

      const noise = (rng.random() - 0.5) * 15;
      r = Math.max(0, Math.min(255, r + noise));
      g = Math.max(0, Math.min(255, g + noise));
      b = Math.max(0, Math.min(255, b + noise));

      ctx.fillStyle = rgbToHex(r, g, b);
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  // Vent slots
  if (pattern === 'horizontal') {
    for (let y = 0; y < height; y += slotSpacing + slotWidth) {
      // Slot shadow (inset)
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, y, width, slotWidth);

      // Slot highlight
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(0, y + slotWidth - 1, width, 1);
    }
  } else if (pattern === 'vertical') {
    for (let x = 0; x < width; x += slotSpacing + slotWidth) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(x, 0, slotWidth, height);

      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(x + slotWidth - 1, 0, 1, height);
    }
  } else if (pattern === 'diamond') {
    const spacing = slotSpacing + slotWidth;
    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        // Diamond shape (rotated square)
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(x + spacing / 2 - slotWidth / 2, y, slotWidth, slotWidth);
        ctx.fillRect(x, y + spacing / 2 - slotWidth / 2, slotWidth, slotWidth);
        ctx.fillRect(x + spacing - slotWidth, y + spacing / 2 - slotWidth / 2, slotWidth, slotWidth);
        ctx.fillRect(x + spacing / 2 - slotWidth / 2, y + spacing - slotWidth, slotWidth, slotWidth);
      }
    }
  }

  return canvas;
}

/**
 * Generate a warning label/sticker
 * @param {number} width - Label width
 * @param {number} height - Label height
 * @param {string} text - Warning text
 * @param {object} options - Configuration
 * @returns {HTMLCanvasElement}
 */
export function generateWarningLabel(width, height, text, options = {}) {
  const {
    bgColor = '#ffaa00',
    textColor = '#000000',
    borderColor = '#000000',
    hasStripes = true,
    pixelSize = 1
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Warning stripes
  if (hasStripes) {
    ctx.fillStyle = borderColor;
    const stripeWidth = 8;
    const stripeAngle = Math.PI / 4;

    for (let x = -height; x < width + height; x += stripeWidth * 2) {
      ctx.save();
      ctx.translate(x, 0);
      ctx.rotate(stripeAngle);
      ctx.fillRect(0, 0, stripeWidth, height * 2);
      ctx.restore();
    }
  }

  // Border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Text
  ctx.font = `bold ${Math.floor(height * 0.4)}px monospace`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  return canvas;
}

/**
 * Generate a coffee mug prop
 * @param {number} size - Mug size
 * @param {object} options - Configuration
 * @returns {HTMLCanvasElement}
 */
export function generateCoffeeMug(size, options = {}) {
  const {
    mugColor = '#8a6a4a',
    coffeeColor = '#1a0a00',
    steamColor = '#cccccc',
    hasHandle = true,
    pixelSize = 1
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(999);

  const mugW = size * 0.6;
  const mugH = size * 0.7;
  const mugX = size * 0.2;
  const mugY = size * 0.25;

  // === MUG BODY ===
  const mugRgb = hexToRgb(mugColor);
  for (let y = 0; y < mugH; y++) {
    for (let x = 0; x < mugW; x++) {
      let r = mugRgb.r;
      let g = mugRgb.g;
      let b = mugRgb.b;

      // Cylindrical shading
      const distFromCenter = Math.abs(x - mugW / 2) / (mugW / 2);
      const shadeFactor = 1 - distFromCenter * 0.4;
      r *= shadeFactor;
      g *= shadeFactor;
      b *= shadeFactor;

      // Left highlight
      if (x < mugW * 0.3) {
        r *= 1.3;
        g *= 1.3;
        b *= 1.3;
      }

      const noise = (rng.random() - 0.5) * 12;
      r = Math.max(0, Math.min(255, r + noise));
      g = Math.max(0, Math.min(255, g + noise));
      b = Math.max(0, Math.min(255, b + noise));

      ctx.fillStyle = rgbToHex(r, g, b);
      ctx.fillRect(mugX + x, mugY + y, pixelSize, pixelSize);
    }
  }

  // === COFFEE (top view) ===
  const coffeeY = mugY + 5;
  const coffeeH = 8;
  ctx.fillStyle = coffeeColor;
  ctx.fillRect(mugX + 2, coffeeY, mugW - 4, coffeeH);

  // Coffee highlight
  ctx.fillStyle = blendColors(coffeeColor, '#ffffff', 0.2);
  ctx.fillRect(mugX + 2, coffeeY, mugW * 0.3, 2);

  // === HANDLE ===
  if (hasHandle) {
    const handleX = mugX + mugW;
    const handleY = mugY + mugH * 0.3;
    const handleW = size * 0.15;
    const handleH = mugH * 0.4;

    // Handle outer
    ctx.strokeStyle = blendColors(mugColor, '#000000', 0.2);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(handleX + handleW / 2, handleY + handleH / 2, handleW, 0, Math.PI * 2);
    ctx.stroke();

    // Handle inner (to create hollow effect)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(handleX + handleW / 2, handleY + handleH / 2, handleW - 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === STEAM ===
  ctx.fillStyle = `rgba(204, 204, 204, 0.3)`;
  for (let i = 0; i < 3; i++) {
    const steamX = mugX + mugW / 2 - 5 + i * 5;
    const steamY = coffeeY - 15 - i * 5;
    ctx.fillRect(steamX, steamY, 3, 10);
  }

  return canvas;
}

// Export all generators
export default {
  generateCRTMonitor,
  generateMechanicalButton,
  generateToggleSwitch,
  generateCircularGauge,
  generateHorizontalFader,
  generateLED,
  generate7SegmentDisplay,
  generateVentGrille,
  generateWarningLabel,
  generateCoffeeMug
};
