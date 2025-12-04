/**
 * CockpitAssets.js
 *
 * Comprehensive asset generation system for creating realistic, heavily pixelated
 * spaceship cockpit UI elements inspired by Alien (1979) aesthetic.
 *
 * Features:
 * - Heavily pixelated textures (thousands of tiny pixels)
 * - Dark, weathered metal panels with rust and scratches
 * - Old CRT monitors with scanlines and phosphor glow
 * - Analog gauges, switches, and physical controls
 * - Indicator lights (LEDs) with glow effects
 * - 3D depth using multiple shades of dark colors
 * - NO green, cyan, or bright neon colors - only dark palette
 */

/**
 * Dark color palette - browns, grays, dark oranges, blacks
 * Inspired by industrial spaceship aesthetic
 */
const COCKPIT_COLORS = {
  // Metal base colors (dark grays and browns)
  METAL_DARK: '#1a1612',
  METAL_MED: '#2a2420',
  METAL_LIGHT: '#3a342e',
  METAL_HIGHLIGHT: '#4a443e',

  // Rust and weathering (dark oranges and browns)
  RUST_DARK: '#2a1810',
  RUST_MED: '#3a2418',
  RUST_LIGHT: '#4a3020',

  // Panel colors (very dark)
  PANEL_BG: '#0f0d0a',
  PANEL_FRAME: '#1f1b16',
  PANEL_DETAIL: '#2f2822',

  // CRT screen colors (dark with amber/orange tint)
  SCREEN_BG: '#0a0805',
  SCREEN_TEXT: '#6a5442',
  SCREEN_TEXT_BRIGHT: '#8a7462',
  SCREEN_GLOW: '#4a3828',

  // Indicator lights (dark, muted)
  LED_OFF: '#1a1410',
  LED_AMBER_DIM: '#4a3420',
  LED_AMBER: '#6a4830',
  LED_AMBER_BRIGHT: '#8a5840',
  LED_RED_DIM: '#4a2420',
  LED_RED: '#6a3430',
  LED_ORANGE_DIM: '#4a3020',
  LED_ORANGE: '#6a4230',

  // Button/switch colors
  BUTTON_BASE: '#2a2218',
  BUTTON_PRESSED: '#1a1410',
  BUTTON_HIGHLIGHT: '#3a3228',

  // Text colors (dark amber/brown tones)
  TEXT_DIM: '#4a3a2a',
  TEXT_NORMAL: '#6a4a3a',
  TEXT_BRIGHT: '#8a6a4a',
  TEXT_HIGHLIGHT: '#aa8a6a',
};

/**
 * Utility: Convert hex color to RGB object
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Utility: Draw a single pixel
 */
function drawPixel(ctx, x, y, color, size = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
}

/**
 * Core function: Draw heavily pixelated rectangle
 * Creates the appearance of thousands of tiny individual pixels
 */
export function drawPixelatedRect(ctx, x, y, w, h, baseColor, pixelSize = 1, variation = 15) {
  const rgb = hexToRgb(baseColor);

  // Draw pixel by pixel with variation for realistic texture
  for (let py = 0; py < h; py += pixelSize) {
    for (let px = 0; px < w; px += pixelSize) {
      // Random variation for each pixel
      const vary = (Math.random() - 0.5) * variation;
      const r = Math.max(0, Math.min(255, rgb.r + vary));
      const g = Math.max(0, Math.min(255, rgb.g + vary));
      const b = Math.max(0, Math.min(255, rgb.b + vary));

      drawPixel(ctx, x + px, y + py, `rgb(${r},${g},${b})`, pixelSize);
    }
  }
}

/**
 * Draw weathered metal panel with rust, scratches, and wear
 */
export function drawMetalPanel(ctx, x, y, w, h, options = {}) {
  const {
    rustAmount = 0.3,  // How much rust (0-1)
    scratchCount = 20,  // Number of scratches
    pixelSize = 1,
    depth3D = true,     // Add 3D beveled edges
  } = options;

  // Base metal texture - heavily pixelated
  drawPixelatedRect(ctx, x, y, w, h, COCKPIT_COLORS.METAL_MED, pixelSize, 20);

  // Add rust patches
  const rustPatches = Math.floor(rustAmount * 10);
  for (let i = 0; i < rustPatches; i++) {
    const rustX = x + Math.random() * w;
    const rustY = y + Math.random() * h;
    const rustW = Math.random() * w * 0.2;
    const rustH = Math.random() * h * 0.2;

    drawPixelatedRect(ctx, rustX, rustY, rustW, rustH, COCKPIT_COLORS.RUST_MED, pixelSize, 25);
  }

  // Add scratches (dark lines)
  ctx.save();
  ctx.strokeStyle = COCKPIT_COLORS.METAL_DARK;
  ctx.lineWidth = 1;

  for (let i = 0; i < scratchCount; i++) {
    const x1 = x + Math.random() * w;
    const y1 = y + Math.random() * h;
    const length = Math.random() * Math.min(w, h) * 0.3;
    const angle = Math.random() * Math.PI * 2;
    const x2 = x1 + Math.cos(angle) * length;
    const y2 = y1 + Math.sin(angle) * length;

    ctx.globalAlpha = 0.3 + Math.random() * 0.3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  // Add 3D depth with beveled edges
  if (depth3D) {
    // Top highlight
    const gradient1 = ctx.createLinearGradient(x, y, x, y + 3);
    gradient1.addColorStop(0, 'rgba(74, 68, 62, 0.4)');
    gradient1.addColorStop(1, 'rgba(74, 68, 62, 0)');
    ctx.fillStyle = gradient1;
    ctx.fillRect(x, y, w, 3);

    // Left highlight
    const gradient2 = ctx.createLinearGradient(x, y, x + 3, y);
    gradient2.addColorStop(0, 'rgba(74, 68, 62, 0.4)');
    gradient2.addColorStop(1, 'rgba(74, 68, 62, 0)');
    ctx.fillStyle = gradient2;
    ctx.fillRect(x, y, 3, h);

    // Bottom shadow
    const gradient3 = ctx.createLinearGradient(x, y + h - 3, x, y + h);
    gradient3.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient3.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = gradient3;
    ctx.fillRect(x, y + h - 3, w, 3);

    // Right shadow
    const gradient4 = ctx.createLinearGradient(x + w - 3, y, x + w, y);
    gradient4.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient4.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = gradient4;
    ctx.fillRect(x + w - 3, y, 3, h);
  }
}

/**
 * Draw CRT monitor screen with scanlines and phosphor glow
 */
export function drawCRTScreen(ctx, x, y, w, h, options = {}) {
  const {
    scanlineIntensity = 0.3,
    glowAmount = 0.2,
    pixelSize = 1,
    curvature = 0.02,  // Subtle screen curvature
  } = options;

  // Dark screen background
  drawPixelatedRect(ctx, x, y, w, h, COCKPIT_COLORS.SCREEN_BG, pixelSize, 10);

  // Add subtle vignette (darker edges)
  const centerX = x + w / 2;
  const centerY = y + h / 2;
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(w, h) * 0.7);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.7, `rgba(0, 0, 0, ${glowAmount})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, ${glowAmount * 2})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);

  // Scanlines (horizontal lines across screen)
  ctx.save();
  ctx.globalAlpha = scanlineIntensity;
  for (let sy = y; sy < y + h; sy += 2) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, sy, w, 1);
  }
  ctx.restore();

  // Add subtle phosphor glow pattern
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let py = y; py < y + h; py += pixelSize * 3) {
    for (let px = x; px < x + w; px += pixelSize * 3) {
      const glowIntensity = Math.random() * 50;
      ctx.fillStyle = `rgb(${glowIntensity + 106}, ${glowIntensity + 84}, ${glowIntensity + 66})`;
      ctx.fillRect(px, py, pixelSize, pixelSize);
    }
  }
  ctx.restore();

  // Frame/bezel around screen
  ctx.strokeStyle = COCKPIT_COLORS.PANEL_FRAME;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
}

/**
 * Draw heavily pixelated button with 3D depth
 */
export function drawCockpitButton(ctx, x, y, w, h, options = {}) {
  const {
    pressed = false,
    enabled = true,
    glowColor = null,
    pixelSize = 1,
    label = '',
  } = options;

  // Base button color
  const baseColor = !enabled ? COCKPIT_COLORS.METAL_DARK :
                   pressed ? COCKPIT_COLORS.BUTTON_PRESSED :
                   COCKPIT_COLORS.BUTTON_BASE;

  // Draw button body
  drawPixelatedRect(ctx, x, y, w, h, baseColor, pixelSize, 18);

  // 3D depth effect
  if (!pressed) {
    // Highlight on top/left
    const highlightGrad = ctx.createLinearGradient(x, y, x, y + h / 3);
    highlightGrad.addColorStop(0, 'rgba(90, 80, 70, 0.3)');
    highlightGrad.addColorStop(1, 'rgba(90, 80, 70, 0)');
    ctx.fillStyle = highlightGrad;
    ctx.fillRect(x, y, w, h / 3);

    // Shadow on bottom/right
    const shadowGrad = ctx.createLinearGradient(x, y + h * 2/3, x, y + h);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(x, y + h * 2/3, w, h / 3);
  }

  // Glow effect if specified
  if (glowColor) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    const glowGrad = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, Math.max(w, h));
    glowGrad.addColorStop(0, glowColor);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
    ctx.restore();
  }

  return { x, y, w, h }; // Return bounds for click detection
}

/**
 * Draw indicator LED light with glow
 */
export function drawIndicatorLED(ctx, x, y, size = 6, options = {}) {
  const {
    state = 'off',  // 'off', 'amber', 'red', 'orange'
    blinking = false,
    animFrame = 0,
  } = options;

  // Determine color based on state
  let ledColor = COCKPIT_COLORS.LED_OFF;
  let glowColor = null;

  if (state !== 'off') {
    const blinkOn = !blinking || (animFrame % 60 < 30);

    if (blinkOn) {
      switch (state) {
        case 'amber':
          ledColor = COCKPIT_COLORS.LED_AMBER;
          glowColor = COCKPIT_COLORS.LED_AMBER_BRIGHT;
          break;
        case 'red':
          ledColor = COCKPIT_COLORS.LED_RED;
          glowColor = '#8a4a40';
          break;
        case 'orange':
          ledColor = COCKPIT_COLORS.LED_ORANGE;
          glowColor = '#8a5a40';
          break;
      }
    } else {
      ledColor = state === 'amber' ? COCKPIT_COLORS.LED_AMBER_DIM :
                state === 'red' ? COCKPIT_COLORS.LED_RED_DIM :
                COCKPIT_COLORS.LED_ORANGE_DIM;
    }
  }

  // Draw LED with pixelated circle
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = size / 2;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px - size / 2;
      const dy = py - size / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // Vary color slightly for pixelated effect
        const rgb = hexToRgb(ledColor);
        const vary = (Math.random() - 0.5) * 15;
        const r = Math.max(0, Math.min(255, rgb.r + vary));
        const g = Math.max(0, Math.min(255, rgb.g + vary));
        const b = Math.max(0, Math.min(255, rgb.b + vary));

        drawPixel(ctx, x + px, y + py, `rgb(${r},${g},${b})`, 1);
      }
    }
  }

  // Add glow if LED is on
  if (glowColor && state !== 'off') {
    ctx.save();
    ctx.globalAlpha = 0.3;
    const glowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 2);
    glowGrad.addColorStop(0, glowColor);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(x - size, y - size, size * 3, size * 3);
    ctx.restore();
  }
}

/**
 * Draw analog gauge/meter
 */
export function drawAnalogGauge(ctx, x, y, radius, value, options = {}) {
  const {
    min = 0,
    max = 100,
    label = '',
    unit = '',
    pixelSize = 1,
    startAngle = -Math.PI * 0.75,
    endAngle = Math.PI * 0.75,
  } = options;

  const centerX = x + radius;
  const centerY = y + radius;

  // Draw gauge background (dark circle)
  for (let py = 0; py < radius * 2; py++) {
    for (let px = 0; px < radius * 2; px++) {
      const dx = px - radius;
      const dy = py - radius;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius && dist > radius - 5) {
        drawPixel(ctx, x + px, y + py, COCKPIT_COLORS.PANEL_BG, pixelSize);
      }
    }
  }

  // Draw tick marks
  ctx.save();
  ctx.strokeStyle = COCKPIT_COLORS.TEXT_DIM;
  ctx.lineWidth = 1;

  const tickCount = 10;
  for (let i = 0; i <= tickCount; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / tickCount);
    const tickLength = i % 5 === 0 ? 8 : 4;
    const x1 = centerX + Math.cos(angle) * (radius - 2);
    const y1 = centerY + Math.sin(angle) * (radius - 2);
    const x2 = centerX + Math.cos(angle) * (radius - 2 - tickLength);
    const y2 = centerY + Math.sin(angle) * (radius - 2 - tickLength);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Draw needle
  const normalizedValue = Math.max(min, Math.min(max, value));
  const needleAngle = startAngle + (endAngle - startAngle) * ((normalizedValue - min) / (max - min));
  const needleLength = radius - 10;

  ctx.strokeStyle = COCKPIT_COLORS.TEXT_BRIGHT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(needleAngle) * needleLength,
    centerY + Math.sin(needleAngle) * needleLength
  );
  ctx.stroke();

  // Draw center dot
  ctx.fillStyle = COCKPIT_COLORS.METAL_MED;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw toggle switch (physical)
 */
export function drawToggleSwitch(ctx, x, y, w, h, state = false, options = {}) {
  const {
    pixelSize = 1,
    vertical = false,
  } = options;

  // Switch housing
  drawPixelatedRect(ctx, x, y, w, h, COCKPIT_COLORS.PANEL_FRAME, pixelSize, 15);

  // Toggle indicator
  const toggleW = vertical ? w - 4 : (w / 2) - 2;
  const toggleH = vertical ? (h / 2) - 2 : h - 4;
  const toggleX = vertical ? x + 2 : state ? x + (w / 2) : x + 2;
  const toggleY = vertical ? state ? y + (h / 2) : y + 2 : y + 2;

  drawPixelatedRect(ctx, toggleX, toggleY, toggleW, toggleH,
    state ? COCKPIT_COLORS.LED_AMBER : COCKPIT_COLORS.BUTTON_BASE, pixelSize, 12);
}

/**
 * Draw progress bar (industrial style)
 */
export function drawProgressBar(ctx, x, y, w, h, value, options = {}) {
  const {
    min = 0,
    max = 100,
    pixelSize = 1,
    showPercentage = true,
  } = options;

  // Background
  drawPixelatedRect(ctx, x, y, w, h, COCKPIT_COLORS.PANEL_BG, pixelSize, 10);

  // Fill
  const normalizedValue = Math.max(min, Math.min(max, value));
  const fillWidth = (w - 4) * ((normalizedValue - min) / (max - min));

  if (fillWidth > 0) {
    drawPixelatedRect(ctx, x + 2, y + 2, fillWidth, h - 4, COCKPIT_COLORS.LED_AMBER, pixelSize, 15);
  }

  // Segments (industrial look)
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  const segmentCount = 10;
  for (let i = 1; i < segmentCount; i++) {
    const segX = x + (w / segmentCount) * i;
    ctx.beginPath();
    ctx.moveTo(segX, y);
    ctx.lineTo(segX, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draw rivet/screw (decorative detail)
 */
export function drawRivet(ctx, x, y, size = 4) {
  // Outer ring
  ctx.fillStyle = COCKPIT_COLORS.METAL_DARK;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // Inner highlight
  ctx.fillStyle = COCKPIT_COLORS.METAL_HIGHLIGHT;
  ctx.beginPath();
  ctx.arc(x - size / 3, y - size / 3, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Cross (Phillips screw)
  ctx.strokeStyle = COCKPIT_COLORS.METAL_DARK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size / 2, y);
  ctx.lineTo(x + size / 2, y);
  ctx.moveTo(x, y - size / 2);
  ctx.lineTo(x, y + size / 2);
  ctx.stroke();
}

/**
 * Draw warning stripe pattern (yellow/black)
 */
export function drawWarningStripes(ctx, x, y, w, h, angle = 45) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle * Math.PI / 180);

  const stripeWidth = 8;
  let offset = 0;

  while (offset < w + h) {
    ctx.fillStyle = COCKPIT_COLORS.LED_AMBER_DIM;
    ctx.fillRect(offset, -h, stripeWidth, h * 2);
    offset += stripeWidth * 2;
  }

  ctx.restore();
}

// Export color palette for use in scenes
export { COCKPIT_COLORS };
