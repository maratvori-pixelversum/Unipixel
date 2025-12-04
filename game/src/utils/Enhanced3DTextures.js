/**
 * Enhanced 3D Spaceship Interior Textures
 * Creates highly detailed, deeply 3D spaceship interior elements
 * with realistic depth, complex geometry, and rich textures
 */

/**
 * Seeded random for consistent generation
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  random() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

/**
 * Generate deeply beveled 3D metal panel with EXTREME depth
 * Creates panels that look like they're carved from solid metal
 */
export function generateDeep3DMetalPanel(width, height, seed = 12345) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(seed);

  // EXTREME 3D depth - 20px bevels instead of 4px
  const bevelDepth = 20;
  const pixelSize = 2;

  // Base metal color with wear
  const baseR = 45;
  const baseG = 35;
  const baseB = 25;

  // Main panel surface with detailed wear
  for (let y = bevelDepth; y < height - bevelDepth; y += pixelSize) {
    for (let x = bevelDepth; x < width - bevelDepth; x += pixelSize) {
      const variation = rng.randomInt(-8, 8);

      // Add scratches and wear marks
      const scratchChance = rng.random();
      const scratchIntensity = scratchChance < 0.02 ? rng.randomInt(-20, -10) : 0;

      const r = Math.max(0, Math.min(255, baseR + variation + scratchIntensity));
      const g = Math.max(0, Math.min(255, baseG + variation + scratchIntensity));
      const b = Math.max(0, Math.min(255, baseB + variation + scratchIntensity));

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  // EXTREME depth bevels - multi-stage gradient
  // Top bevel - bright highlight
  for (let i = 0; i < bevelDepth; i += pixelSize) {
    const depth = i / bevelDepth;
    // Exponential falloff for more realistic lighting
    const intensity = Math.pow(1 - depth, 2);

    const highlightR = Math.min(255, baseR + 120 * intensity);
    const highlightG = Math.min(255, baseG + 100 * intensity);
    const highlightB = Math.min(255, baseB + 80 * intensity);

    for (let x = i; x < width - i; x += pixelSize) {
      ctx.fillStyle = `rgb(${Math.floor(highlightR)}, ${Math.floor(highlightG)}, ${Math.floor(highlightB)})`;
      ctx.fillRect(x, i, pixelSize, pixelSize);
    }
  }

  // Left bevel - secondary highlight
  for (let i = 0; i < bevelDepth; i += pixelSize) {
    const depth = i / bevelDepth;
    const intensity = Math.pow(1 - depth, 2);

    const highlightR = Math.min(255, baseR + 100 * intensity);
    const highlightG = Math.min(255, baseG + 85 * intensity);
    const highlightB = Math.min(255, baseB + 70 * intensity);

    for (let y = i; y < height - i; y += pixelSize) {
      ctx.fillStyle = `rgb(${Math.floor(highlightR)}, ${Math.floor(highlightG)}, ${Math.floor(highlightB)})`;
      ctx.fillRect(i, y, pixelSize, pixelSize);
    }
  }

  // Bottom bevel - deep shadow
  for (let i = 0; i < bevelDepth; i += pixelSize) {
    const depth = i / bevelDepth;
    const intensity = Math.pow(1 - depth, 1.5);

    const shadowR = Math.floor(baseR * (0.2 + 0.5 * intensity));
    const shadowG = Math.floor(baseG * (0.2 + 0.5 * intensity));
    const shadowB = Math.floor(baseB * (0.2 + 0.5 * intensity));

    for (let x = i; x < width - i; x += pixelSize) {
      ctx.fillStyle = `rgb(${shadowR}, ${shadowG}, ${shadowB})`;
      ctx.fillRect(x, height - pixelSize - i, pixelSize, pixelSize);
    }
  }

  // Right bevel - darkest shadow
  for (let i = 0; i < bevelDepth; i += pixelSize) {
    const depth = i / bevelDepth;
    const intensity = Math.pow(1 - depth, 1.5);

    const shadowR = Math.floor(baseR * (0.15 + 0.5 * intensity));
    const shadowG = Math.floor(baseG * (0.15 + 0.5 * intensity));
    const shadowB = Math.floor(baseB * (0.15 + 0.5 * intensity));

    for (let y = i; y < height - i; y += pixelSize) {
      ctx.fillStyle = `rgb(${shadowR}, ${shadowG}, ${shadowB})`;
      ctx.fillRect(width - pixelSize - i, y, pixelSize, pixelSize);
    }
  }

  // Corner accents - extra depth
  const cornerSize = bevelDepth;
  const corners = [
    [0, 0],
    [width - cornerSize, 0],
    [0, height - cornerSize],
    [width - cornerSize, height - cornerSize]
  ];

  corners.forEach(([cx, cy]) => {
    for (let y = 0; y < cornerSize; y += pixelSize) {
      for (let x = 0; x < cornerSize; x += pixelSize) {
        const dist = Math.sqrt(x * x + y * y) / cornerSize;
        const shade = Math.floor(baseR * (0.3 + 0.4 * (1 - dist)));
        ctx.fillStyle = `rgb(${shade}, ${Math.floor(shade * 0.8)}, ${Math.floor(shade * 0.7)})`;
        ctx.fillRect(cx + x, cy + y, pixelSize, pixelSize);
      }
    }
  });

  return canvas;
}

/**
 * Generate highly detailed control panel with buttons, LEDs, and displays
 */
export function generateDetailedControlPanel(width, height, seed = 12345) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(seed);
  const pixelSize = 2;

  // Dark control panel base
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const variation = rng.randomInt(-3, 3);
      const baseShade = 15 + variation;
      ctx.fillStyle = `rgb(${baseShade}, ${baseShade - 2}, ${baseShade - 3})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  // Control sections with 3D depth
  const sections = [
    { x: 20, y: 20, w: width - 40, h: 80, type: 'display' },
    { x: 20, y: 120, w: (width - 60) / 2, h: 120, type: 'buttons' },
    { x: width / 2 + 10, y: 120, w: (width - 60) / 2, h: 120, type: 'leds' },
  ];

  sections.forEach(section => {
    if (section.x + section.w > width || section.y + section.h > height) return;

    // Deep recessed panel
    const recessDepth = 8;
    for (let i = 0; i < recessDepth; i += pixelSize) {
      const depth = i / recessDepth;
      const shade = Math.floor(10 + depth * 15);

      // Top and left - dark shadow
      for (let x = section.x + i; x < section.x + section.w - i; x += pixelSize) {
        ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 3})`;
        ctx.fillRect(x, section.y + i, pixelSize, pixelSize);
      }
      for (let y = section.y + i; y < section.y + section.h - i; y += pixelSize) {
        ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 3})`;
        ctx.fillRect(section.x + i, y, pixelSize, pixelSize);
      }

      // Bottom and right - subtle highlight
      const highlightShade = Math.floor(25 + (1 - depth) * 10);
      for (let x = section.x + i; x < section.x + section.w - i; x += pixelSize) {
        ctx.fillStyle = `rgb(${highlightShade}, ${highlightShade - 3}, ${highlightShade - 5})`;
        ctx.fillRect(x, section.y + section.h - pixelSize - i, pixelSize, pixelSize);
      }
      for (let y = section.y + i; y < section.y + section.h - i; y += pixelSize) {
        ctx.fillStyle = `rgb(${highlightShade}, ${highlightShade - 3}, ${highlightShade - 5})`;
        ctx.fillRect(section.x + section.w - pixelSize - i, y, pixelSize, pixelSize);
      }
    }

    // Section content based on type
    if (section.type === 'display') {
      // CRT display with scan lines
      const displayX = section.x + 15;
      const displayY = section.y + 15;
      const displayW = section.w - 30;
      const displayH = section.h - 30;

      // Display background - green tint
      for (let y = 0; y < displayH; y += pixelSize) {
        for (let x = 0; x < displayW; x += pixelSize) {
          ctx.fillStyle = '#0a1a0a';
          ctx.fillRect(displayX + x, displayY + y, pixelSize, pixelSize);
        }
      }

      // Scanlines
      for (let y = 0; y < displayH; y += 3) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(displayX, displayY + y, displayW, 1);
      }

    } else if (section.type === 'buttons') {
      // Button grid with 3D buttons
      const buttonSize = 30;
      const buttonSpacing = 10;
      const buttonsPerRow = Math.floor((section.w - 30) / (buttonSize + buttonSpacing));
      const buttonRows = 2;

      for (let row = 0; row < buttonRows; row++) {
        for (let col = 0; col < buttonsPerRow; col++) {
          const bx = section.x + 15 + col * (buttonSize + buttonSpacing);
          const by = section.y + 20 + row * (buttonSize + buttonSpacing + 10);

          // 3D raised button
          for (let i = 0; i < 4; i += pixelSize) {
            const depth = i / 4;
            const shade = Math.floor(60 - depth * 20);

            // Top highlight
            for (let x = 0; x < buttonSize; x += pixelSize) {
              ctx.fillStyle = `rgb(${shade}, ${shade - 10}, ${shade - 15})`;
              ctx.fillRect(bx + x, by + i, pixelSize, pixelSize);
            }
            // Left highlight
            for (let y = 0; y < buttonSize; y += pixelSize) {
              ctx.fillStyle = `rgb(${shade}, ${shade - 10}, ${shade - 15})`;
              ctx.fillRect(bx + i, by + y, pixelSize, pixelSize);
            }
          }

          // Button center
          for (let y = 4; y < buttonSize - 4; y += pixelSize) {
            for (let x = 4; x < buttonSize - 4; x += pixelSize) {
              const variation = rng.randomInt(-3, 3);
              ctx.fillStyle = `rgb(${45 + variation}, ${30 + variation}, ${20 + variation})`;
              ctx.fillRect(bx + x, by + y, pixelSize, pixelSize);
            }
          }

          // Small LED on button
          ctx.fillStyle = rng.random() > 0.5 ? '#ff4400' : '#00ff44';
          ctx.fillRect(bx + buttonSize - 8, by + 4, 4, 4);
        }
      }

    } else if (section.type === 'leds') {
      // LED indicator grid
      const ledSize = 12;
      const ledSpacing = 8;
      const ledsPerRow = Math.floor((section.w - 30) / (ledSize + ledSpacing));
      const ledRows = 4;

      const ledColors = [
        ['#ff0000', '#660000'], // Red
        ['#00ff00', '#006600'], // Green
        ['#ffff00', '#666600'], // Yellow
        ['#0088ff', '#003366'], // Blue
        ['#ff4400', '#661800'], // Orange
      ];

      for (let row = 0; row < ledRows; row++) {
        for (let col = 0; col < ledsPerRow; col++) {
          const lx = section.x + 15 + col * (ledSize + ledSpacing);
          const ly = section.y + 20 + row * (ledSize + ledSpacing + 10);

          // LED housing - recessed
          for (let y = 0; y < ledSize; y += pixelSize) {
            for (let x = 0; x < ledSize; x += pixelSize) {
              ctx.fillStyle = '#0a0805';
              ctx.fillRect(lx + x, ly + y, pixelSize, pixelSize);
            }
          }

          // LED light - randomactive/inactive state
          const isActive = rng.random() > 0.4;
          const colorPair = ledColors[rng.randomInt(0, ledColors.length - 1)];
          const ledColor = isActive ? colorPair[0] : colorPair[1];

          for (let y = 2; y < ledSize - 2; y += pixelSize) {
            for (let x = 2; x < ledSize - 2; x += pixelSize) {
              const dist = Math.sqrt(Math.pow(x - ledSize / 2, 2) + Math.pow(y - ledSize / 2, 2));
              if (dist < ledSize / 2 - 2) {
                ctx.fillStyle = ledColor;
                ctx.fillRect(lx + x, ly + y, pixelSize, pixelSize);
              }
            }
          }

          // LED highlight for active
          if (isActive) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(lx + 4, ly + 4, 2, 2);
          }
        }
      }
    }
  });

  return canvas;
}

/**
 * Generate 3D pipe with realistic cylindrical shading and brackets
 */
export function generate3DPipe(length, diameter, seed = 12345) {
  const canvas = document.createElement('canvas');
  canvas.width = length;
  canvas.height = diameter + 12; // Extra for shadow
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(seed);
  const pixelSize = 2;

  // Cylindrical pipe shading
  for (let x = 0; x < length; x += pixelSize) {
    for (let y = 0; y < diameter; y += pixelSize) {
      // Calculate normalized position on cylinder (0 at top, 1 at bottom)
      const normalizedY = y / diameter;

      // Cylindrical lighting (sine wave for round appearance)
      const cylinderShade = Math.sin(normalizedY * Math.PI);

      // Base color with variation
      const baseShade = 35;
      const shade = Math.floor(baseShade + cylinderShade * 30);
      const variation = rng.randomInt(-4, 4);

      const r = Math.max(0, Math.min(255, shade + variation));
      const g = Math.max(0, Math.min(255, shade - 5 + variation));
      const b = Math.max(0, Math.min(255, shade - 8 + variation));

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  // Pipe shadow
  for (let x = 0; x < length; x += pixelSize * 2) {
    for (let y = diameter; y < diameter + 8; y += pixelSize) {
      const shadowIntensity = (diameter + 8 - y) / 8;
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowIntensity * 0.4})`;
      ctx.fillRect(x, y, pixelSize * 2, pixelSize);
    }
  }

  // Pipe brackets every 100px
  for (let x = 50; x < length; x += 100) {
    const bracketWidth = 18;
    const bracketHeight = diameter + 10;

    // Bracket with 3D depth
    for (let by = -5; by < bracketHeight - diameter; by += pixelSize) {
      for (let bx = 0; bx < bracketWidth; bx += pixelSize) {
        const depth = bx / bracketWidth;
        const shade = Math.floor(40 - depth * 15);
        ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 8})`;
        ctx.fillRect(x + bx - bracketWidth / 2, by, pixelSize, pixelSize);
      }
    }

    // Bracket rivets
    [[x, -3], [x, diameter + 4]].forEach(([rx, ry]) => {
      // Rivet shadow
      ctx.fillStyle = '#0a0805';
      ctx.fillRect(rx - 2, ry - 2, 6, 6);
      // Rivet body
      ctx.fillStyle = '#4a3a2a';
      ctx.fillRect(rx - 1, ry - 1, 4, 4);
      // Rivet highlight
      ctx.fillStyle = '#6a5a4a';
      ctx.fillRect(rx - 1, ry - 1, 2, 2);
    });
  }

  return canvas;
}

/**
 * Generate ventilation grating with deep shadows
 */
export function generate3DVent(width, height, seed = 12345) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const pixelSize = 2;

  // Vent frame
  const frameDepth = 10;
  for (let i = 0; i < frameDepth; i += pixelSize) {
    const depth = i / frameDepth;
    const shade = Math.floor(50 - depth * 30);

    // Frame border
    for (let x = i; x < width - i; x += pixelSize) {
      ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 8})`;
      ctx.fillRect(x, i, pixelSize, pixelSize);
      ctx.fillRect(x, height - pixelSize - i, pixelSize, pixelSize);
    }
    for (let y = i; y < height - i; y += pixelSize) {
      ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 8})`;
      ctx.fillRect(i, y, pixelSize, pixelSize);
      ctx.fillRect(width - pixelSize - i, y, pixelSize, pixelSize);
    }
  }

  // Vent grating - horizontal slats with extreme 3D depth
  const slatHeight = 8;
  const slatSpacing = 12;
  const gratingStart = frameDepth + 5;
  const gratingEnd = height - frameDepth - 5;

  for (let y = gratingStart; y < gratingEnd; y += slatSpacing) {
    // Slat top surface (bright)
    for (let x = frameDepth + 5; x < width - frameDepth - 5; x += pixelSize) {
      ctx.fillStyle = '#5a4a3a';
      ctx.fillRect(x, y, pixelSize, 2);
    }

    // Slat front face (medium)
    for (let x = frameDepth + 5; x < width - frameDepth - 5; x += pixelSize) {
      for (let sy = 2; sy < slatHeight - 2; sy += pixelSize) {
        const shade = Math.floor(45 - sy * 2);
        ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 8})`;
        ctx.fillRect(x, y + sy, pixelSize, pixelSize);
      }
    }

    // Slat shadow (very dark)
    for (let x = frameDepth + 5; x < width - frameDepth - 5; x += pixelSize) {
      ctx.fillStyle = '#0a0805';
      ctx.fillRect(x, y + slatHeight - 2, pixelSize, 2);
    }

    // Deep shadow between slats
    for (let x = frameDepth + 5; x < width - frameDepth - 5; x += pixelSize * 2) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y + slatHeight, pixelSize * 2, slatSpacing - slatHeight);
    }
  }

  // Vent mounting screws at corners
  const screwPositions = [
    [frameDepth / 2, frameDepth / 2],
    [width - frameDepth / 2 - 4, frameDepth / 2],
    [frameDepth / 2, height - frameDepth / 2 - 4],
    [width - frameDepth / 2 - 4, height - frameDepth / 2 - 4]
  ];

  screwPositions.forEach(([sx, sy]) => {
    // Screw hole (dark)
    for (let y = 0; y < 8; y += pixelSize) {
      for (let x = 0; x < 8; x += pixelSize) {
        const dist = Math.sqrt(Math.pow(x - 4, 2) + Math.pow(y - 4, 2));
        if (dist < 4) {
          ctx.fillStyle = '#0a0805';
          ctx.fillRect(sx + x, sy + y, pixelSize, pixelSize);
        }
      }
    }
    // Screw slot
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(sx + 2, sy + 3, 4, 2);
  });

  return canvas;
}

export default {
  generateDeep3DMetalPanel,
  generateDetailedControlPanel,
  generate3DPipe,
  generate3DVent,
};
