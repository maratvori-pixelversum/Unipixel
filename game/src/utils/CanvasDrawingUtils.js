/**
 * Canvas Drawing Utility Functions
 * Shared drawing utilities for UI canvas screens
 * Consolidates duplicate functions from multiple Canvas UI components
 */

/**
 * Convert hex color to RGB components
 * @param {string} hex - Hex color string (e.g., '#ff0000' or 'ff0000')
 * @returns {{r: number, g: number, b: number}}
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

/**
 * Draw a single pixel
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Color
 * @param {number} size - Pixel size (default 1)
 */
export const drawPixel = (ctx, x, y, color, size = 1) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
};

/**
 * Draw a pixelated rectangle with color variation
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {string} baseColor - Base hex color
 * @param {number} pixelSize - Size of each pixel (default 1)
 * @param {number} variation - Color variation amount (default 10)
 */
export const drawPixelatedRect = (ctx, x, y, w, h, baseColor, pixelSize = 1, variation = 10) => {
  // Fast path: if variation is low or area is large, just fill
  if (variation < 5 || w * h > 10000) {
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, w, h);

    // Add subtle noise overlay instead of pixel-by-pixel
    if (variation > 0) {
      const rgb = hexToRgb(baseColor);
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < Math.min(50, (w * h) / 100); i++) {
        const px = x + Math.random() * w;
        const py = y + Math.random() * h;
        const vary = (Math.random() - 0.5) * variation * 2;
        const r = Math.max(0, Math.min(255, rgb.r + vary));
        const g = Math.max(0, Math.min(255, rgb.g + vary));
        const b = Math.max(0, Math.min(255, rgb.b + vary));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(Math.floor(px), Math.floor(py), pixelSize, pixelSize);
      }
      ctx.globalAlpha = 1.0;
    }
    return;
  }

  // Standard path with pixel-by-pixel variation
  const rgb = hexToRgb(baseColor);
  for (let py = y; py < y + h; py += pixelSize) {
    for (let px = x; px < x + w; px += pixelSize) {
      const vary = (Math.random() - 0.5) * variation;
      const r = Math.max(0, Math.min(255, rgb.r + vary));
      const g = Math.max(0, Math.min(255, rgb.g + vary));
      const b = Math.max(0, Math.min(255, rgb.b + vary));
      drawPixel(ctx, px, py, `rgb(${r},${g},${b})`, pixelSize);
    }
  }
};

/**
 * Draw an LED indicator
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - LED size
 * @param {string} color - LED color
 * @param {boolean} isOn - Whether LED is lit
 * @param {number} glowIntensity - Glow intensity (0-1, default 0.5)
 */
export const drawLED = (ctx, x, y, size, color, isOn, glowIntensity = 0.5) => {
  if (isOn) {
    // Glow effect
    const gradient = ctx.createRadialGradient(x + size/2, y + size/2, 0, x + size/2, y + size/2, size);
    const rgb = hexToRgb(color);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${glowIntensity})`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(x - size/2, y - size/2, size * 2, size * 2);

    // LED core
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  } else {
    // Dark LED
    const rgb = hexToRgb(color);
    ctx.fillStyle = `rgb(${Math.floor(rgb.r * 0.2)}, ${Math.floor(rgb.g * 0.2)}, ${Math.floor(rgb.b * 0.2)})`;
    ctx.fillRect(x, y, size, size);
  }
};

/**
 * Draw pixelated text
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to draw
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Text color
 * @param {string} font - Font (default '12px monospace')
 * @param {string} align - Text align (default 'left')
 */
export const drawPixelatedText = (ctx, text, x, y, color, font = '12px monospace', align = 'left') => {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
};

/**
 * Draw a 3D beveled panel
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {string} baseColor - Base color
 * @param {number} bevelSize - Bevel size (default 2)
 * @param {boolean} inset - Whether panel is inset (default false)
 */
export const drawBeveledPanel = (ctx, x, y, w, h, baseColor, bevelSize = 2, inset = false) => {
  const rgb = hexToRgb(baseColor);

  // Main panel
  drawPixelatedRect(ctx, x + bevelSize, y + bevelSize, w - bevelSize * 2, h - bevelSize * 2, baseColor, 1, 8);

  // Highlight (top-left)
  const highlightColor = inset ?
    `rgb(${Math.floor(rgb.r * 0.5)}, ${Math.floor(rgb.g * 0.5)}, ${Math.floor(rgb.b * 0.5)})` :
    `rgb(${Math.min(255, rgb.r * 1.5)}, ${Math.min(255, rgb.g * 1.5)}, ${Math.min(255, rgb.b * 1.5)})`;

  for (let i = 0; i < bevelSize; i++) {
    // Top edge
    ctx.fillStyle = highlightColor;
    ctx.fillRect(x + i, y + i, w - i * 2, 1);
    // Left edge
    ctx.fillRect(x + i, y + i, 1, h - i * 2);
  }

  // Shadow (bottom-right)
  const shadowColor = inset ?
    `rgb(${Math.min(255, rgb.r * 1.5)}, ${Math.min(255, rgb.g * 1.5)}, ${Math.min(255, rgb.b * 1.5)})` :
    `rgb(${Math.floor(rgb.r * 0.5)}, ${Math.floor(rgb.g * 0.5)}, ${Math.floor(rgb.b * 0.5)})`;

  for (let i = 0; i < bevelSize; i++) {
    // Bottom edge
    ctx.fillStyle = shadowColor;
    ctx.fillRect(x + i, y + h - 1 - i, w - i * 2, 1);
    // Right edge
    ctx.fillRect(x + w - 1 - i, y + i, 1, h - i * 2);
  }
};

/**
 * Draw a progress bar
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {number} progress - Progress (0-1)
 * @param {string} bgColor - Background color
 * @param {string} fillColor - Fill color
 * @param {number} borderSize - Border size (default 2)
 */
export const drawProgressBar = (ctx, x, y, w, h, progress, bgColor, fillColor, borderSize = 2) => {
  // Background
  drawPixelatedRect(ctx, x, y, w, h, bgColor, 1, 5);

  // Fill
  const fillWidth = Math.max(0, (w - borderSize * 2) * Math.min(1, Math.max(0, progress)));
  if (fillWidth > 0) {
    drawPixelatedRect(ctx, x + borderSize, y + borderSize, fillWidth, h - borderSize * 2, fillColor, 1, 15);

    // Shine effect on fill
    const rgb = hexToRgb(fillColor);
    const shineColor = `rgba(${Math.min(255, rgb.r * 1.8)}, ${Math.min(255, rgb.g * 1.8)}, ${Math.min(255, rgb.b * 1.8)}, 0.3)`;
    ctx.fillStyle = shineColor;
    ctx.fillRect(x + borderSize, y + borderSize, fillWidth, Math.max(1, (h - borderSize * 2) / 3));
  }

  // Border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = borderSize;
  ctx.strokeRect(x + borderSize/2, y + borderSize/2, w - borderSize, h - borderSize);
};

/**
 * Draw a scanline effect (CRT effect)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} spacing - Scanline spacing (default 2)
 * @param {number} opacity - Scanline opacity (default 0.1)
 */
export const drawScanlines = (ctx, width, height, spacing = 2, opacity = 0.1) => {
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#000000';
  for (let y = 0; y < height; y += spacing) {
    ctx.fillRect(0, y, width, 1);
  }
  ctx.globalAlpha = 1.0;
};

/**
 * Draw a vignette effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} intensity - Vignette intensity (default 0.3)
 */
export const drawVignette = (ctx, width, height, intensity = 0.3) => {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * 0.7
  );
  gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

/**
 * Draw animated data stream particles
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {number} count - Particle count
 * @param {string} color - Particle color
 * @param {number} animFrame - Animation frame counter
 */
export const drawDataStream = (ctx, x, y, w, h, count, color, animFrame) => {
  const rgb = hexToRgb(color);
  for (let i = 0; i < count; i++) {
    const px = x + (i * 137.5 + animFrame * 2) % w;
    const py = y + ((i * 73.2 + animFrame * 1.5) % h);
    const size = 1 + Math.sin(i + animFrame * 0.1) * 0.5;
    const alpha = 0.3 + Math.sin(i * 2 + animFrame * 0.05) * 0.3;
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    ctx.fillRect(px, py, size, size);
  }
};

/**
 * Draw a checkbox
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} size - Checkbox size
 * @param {boolean} checked - Whether checked
 * @param {string} bgColor - Background color
 * @param {string} checkColor - Check color
 */
export const drawCheckbox = (ctx, x, y, size, checked, bgColor, checkColor) => {
  drawBeveledPanel(ctx, x, y, size, size, bgColor, 2, true);

  if (checked) {
    // Draw checkmark
    ctx.strokeStyle = checkColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.2, y + size * 0.5);
    ctx.lineTo(x + size * 0.4, y + size * 0.7);
    ctx.lineTo(x + size * 0.8, y + size * 0.3);
    ctx.stroke();
  }
};

/**
 * Draw a scrollbar
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {number} scrollPercent - Scroll percentage (0-1)
 * @param {number} visiblePercent - Visible percentage (0-1)
 * @param {string} trackColor - Track color
 * @param {string} thumbColor - Thumb color
 */
export const drawScrollbar = (ctx, x, y, width, height, scrollPercent, visiblePercent, trackColor, thumbColor) => {
  // Track
  drawPixelatedRect(ctx, x, y, width, height, trackColor, 1, 5);

  // Thumb
  const thumbHeight = Math.max(20, height * visiblePercent);
  const thumbY = y + (height - thumbHeight) * scrollPercent;
  drawBeveledPanel(ctx, x, thumbY, width, thumbHeight, thumbColor, 2, false);
};
