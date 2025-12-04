/**
 * Pixelated 3D Asset Generators
 * Creates heavily pixelated 3D textures, panels, and buttons
 * Inspired by Alien movie retro sci-fi aesthetic with thousands of tiny pixels
 */

/**
 * Seeded random number generator for consistent results
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
 * Generate 3D pixelated cockpit interior background texture
 * Creates heavily detailed spaceship interior with metal panels, rivets, pipes, vents, and wiring
 * Inspired by Alien (1979) industrial aesthetic - VERY heavily pixelated
 */
export function generate3DBackgroundTexture(width, height, seed = 12345) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(seed);
  const pixelSize = 3; // PERFORMANCE: Optimized for visual quality with caching (was 8, originally 2)

  // === BASE METAL WALL TEXTURE ===
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const variation = rng.randomInt(-5, 5);
      const baseR = 20 + variation;
      const baseG = 15 + variation;
      const baseB = 10 + variation;
      ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  // === LARGE METAL PANELS WITH SEAMS AND 3D BEVELED DEPTH ===
  const panelSize = 180;
  for (let py = 0; py < height; py += panelSize) {
    for (let px = 0; px < width; px += panelSize) {
      // 3D beveled panel border with gradient depth
      for (let i = 0; i < 12; i += pixelSize) {
        const depth = i / 12;
        const shade = Math.floor(10 - depth * 5);
        for (let j = px; j < px + panelSize && j < width; j += pixelSize) {
          ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 3})`;
          ctx.fillRect(j, py + i, pixelSize, pixelSize);
          ctx.fillRect(j, py + panelSize - i - pixelSize, pixelSize, pixelSize);
        }
        for (let j = py; j < py + panelSize && j < height; j += pixelSize) {
          ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 3})`;
          ctx.fillRect(px + i, j, pixelSize, pixelSize);
          ctx.fillRect(px + panelSize - i - pixelSize, j, pixelSize, pixelSize);
        }
      }

      // Rivets at corners and edges with 3D depth
      const rivetSize = 8;
      const positions = [
        [px + 15, py + 15],
        [px + panelSize - 23, py + 15],
        [px + 15, py + panelSize - 23],
        [px + panelSize - 23, py + panelSize - 23],
        [px + panelSize / 2 - 4, py + 15],  // Top center
        [px + panelSize / 2 - 4, py + panelSize - 23],  // Bottom center
        [px + 15, py + panelSize / 2 - 4],  // Left center
        [px + panelSize - 23, py + panelSize / 2 - 4]  // Right center
      ];
      positions.forEach(([rx, ry]) => {
        if (rx + rivetSize < width && ry + rivetSize < height && rx >= 0 && ry >= 0) {
          // 3D rivet with circular shading
          for (let i = 0; i < rivetSize; i += pixelSize) {
            for (let j = 0; j < rivetSize; j += pixelSize) {
              const dist = Math.sqrt((i - rivetSize/2) ** 2 + (j - rivetSize/2) ** 2);
              if (dist < rivetSize / 2) {
                const depthShade = 1 - (dist / (rivetSize / 2));
                const shade = Math.floor(30 + depthShade * 20);
                ctx.fillStyle = `rgb(${shade}, ${shade - 8}, ${shade - 12})`;
                ctx.fillRect(rx + i, ry + j, pixelSize, pixelSize);
              }
            }
          }
          // Rivet highlight (3D effect)
          ctx.fillStyle = '#5a4a3a';
          ctx.fillRect(rx, ry, pixelSize * 2, pixelSize);
          ctx.fillRect(rx, ry, pixelSize, pixelSize * 2);
          // Rivet shadow
          ctx.fillStyle = '#1a1208';
          ctx.fillRect(rx + rivetSize - pixelSize * 2, ry + rivetSize - pixelSize, pixelSize * 2, pixelSize);
          ctx.fillRect(rx + rivetSize - pixelSize, ry + rivetSize - pixelSize * 2, pixelSize, pixelSize * 2);
        }
      });
    }
  }

  // === HORIZONTAL PIPES AND CONDUITS WITH 3D DEPTH ===
  const pipeY = [80, 220, 360, 500, 640];
  pipeY.forEach(y => {
    if (y < height) {
      // Main pipe body with cylindrical 3D shading
      for (let x = 0; x < width; x += pixelSize) {
        const pipeHeight = 16;
        for (let py = 0; py < pipeHeight; py += pixelSize) {
          // Cylindrical shading for realistic 3D pipe
          const normalizedY = py / pipeHeight;
          const shading = Math.sin(normalizedY * Math.PI);  // Curved shading
          const shade = Math.floor(20 + shading * 25);
          ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 8})`;
          ctx.fillRect(x, y + py, pixelSize, pixelSize);
        }
      }

      // Pipe shadow below
      for (let x = 0; x < width; x += pixelSize * 2) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x, y + 16, pixelSize * 2, pixelSize * 2);
      }

      // Pipe brackets with 3D depth every 80px
      for (let x = 40; x < width; x += 80) {
        // Bracket base with shading
        for (let py = -6; py < 22; py += pixelSize) {
          for (let px = 0; px < 12; px += pixelSize) {
            const depth = px / 12;
            const shade = Math.floor(26 - depth * 10);
            ctx.fillStyle = `rgb(${shade}, ${shade - 4}, ${shade - 6})`;
            ctx.fillRect(x + px, y + py, pixelSize, pixelSize);
          }
        }
        // Bracket rivets
        [[x + 3, y - 2], [x + 3, y + 18]].forEach(([rx, ry]) => {
          if (ry >= 0 && ry < height) {
            ctx.fillStyle = '#1a1208';
            ctx.fillRect(rx, ry, 3, 3);
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(rx, ry, pixelSize, pixelSize);
          }
        });
      }
    }
  });

  // === ENHANCED: Add rust, wear, and damage (optimized) ===
  // Rust patches (sparse for performance)
  for (let i = 0; i < 20; i++) {
    const rustX = rng.randomInt(0, width - 40);
    const rustY = rng.randomInt(0, height - 40);
    const rustSize = rng.randomInt(10, 30);

    for (let y = 0; y < rustSize; y += pixelSize * 2) {
      for (let x = 0; x < rustSize; x += pixelSize * 2) {
        if (rng.random() > 0.5) {
          const rustShade = rng.randomInt(25, 40);
          ctx.fillStyle = `rgb(${rustShade}, ${Math.floor(rustShade * 0.4)}, ${Math.floor(rustShade * 0.2)})`;
          ctx.fillRect(rustX + x, rustY + y, pixelSize * 2, pixelSize * 2);
        }
      }
    }
  }

  // === ENHANCED: Warning stripes (yellow/black) on edges ===
  const stripeWidth = 12;
  for (let x = 0; x < width; x += stripeWidth * 2) {
    // Top edge
    ctx.fillStyle = '#3a3a0a';
    ctx.fillRect(x, 0, stripeWidth, 6);
    ctx.fillStyle = '#1a1208';
    ctx.fillRect(x + stripeWidth, 0, stripeWidth, 6);

    // Bottom edge
    ctx.fillRect(x, height - 6, stripeWidth, 6);
    ctx.fillStyle = '#3a3a0a';
    ctx.fillRect(x + stripeWidth, height - 6, stripeWidth, 6);
  }

  // === ENHANCED: Scratches and wear marks ===
  for (let i = 0; i < 40; i++) {
    const sx = rng.randomInt(0, width - 30);
    const sy = rng.randomInt(0, height);
    const sw = rng.randomInt(10, 40);
    ctx.fillStyle = rng.random() > 0.5 ? '#0a0805' : '#2a2018';
    ctx.fillRect(sx, sy, sw, pixelSize);
  }

  // === ENHANCED: Small vents/grills ===
  for (let i = 0; i < 12; i++) {
    const ventX = rng.randomInt(50, width - 80);
    const ventY = rng.randomInt(50, height - 40);
    const ventW = 60;
    const ventH = 24;

    // Vent recess (dark)
    ctx.fillStyle = '#0a0805';
    ctx.fillRect(ventX, ventY, ventW, ventH);

    // Vent slats
    for (let s = 0; s < ventH; s += 6) {
      ctx.fillStyle = '#1a1410';
      ctx.fillRect(ventX + 3, ventY + s + 2, ventW - 6, 2);
    }
  }

  // === ENHANCED: Control boxes and junction boxes (optimized) ===
  const boxCount = 4;
  for (let i = 0; i < boxCount; i++) {
    const bx = rng.randomInt(100, width - 120);
    const by = rng.randomInt(100, height - 100);
    const bw = rng.randomInt(40, 60);
    const bh = rng.randomInt(50, 70);

    if (bx + bw < width && by + bh < height && bx >= 0 && by >= 0) {
      // Box body with optimized 3D shading
      for (let y = 0; y < bh; y += pixelSize * 2) {
        for (let x = 0; x < bw; x += pixelSize * 2) {
          const edgeDist = Math.min(x, y, bw - x, bh - y);
          const shade = edgeDist < 6 ? Math.floor(15 + edgeDist) : 28;
          ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 8})`;
          ctx.fillRect(bx + x, by + y, pixelSize * 2, pixelSize * 2);
        }
      }

      // Control panel inset
      const insetX = bx + 8;
      const insetY = by + 8;
      const insetW = bw - 16;
      const insetH = bh - 16;
      ctx.fillStyle = '#0a0805';
      ctx.fillRect(insetX, insetY, insetW, insetH);

      // Indicator LEDs on box
      const ledCount = rng.randomInt(2, 3);
      for (let l = 0; l < ledCount; l++) {
        const ledX = insetX + 5 + l * 12;
        const ledY = insetY + 5;
        if (ledX + 4 < insetX + insetW) {
          ctx.fillStyle = rng.random() > 0.5 ? '#3a2a1a' : '#1a1410';
          ctx.fillRect(ledX, ledY, 4, 4);
        }
      }

      // Box screws at corners
      [[bx + 3, by + 3], [bx + bw - 6, by + 3], [bx + 3, by + bh - 6], [bx + bw - 6, by + bh - 6]].forEach(([sx, sy]) => {
        ctx.fillStyle = '#1a1208';
        ctx.fillRect(sx, sy, 3, 3);
      });
    }
  }

  // === ENHANCED: Data port panels (optimized) ===
  const dataPortPositions = [
    [150, height - 80, 50, 30],
    [width - 220, 120, 50, 30],
  ];
  dataPortPositions.forEach(([px, py, pw, ph]) => {
    if (px >= 0 && py >= 0 && px + pw < width && py + ph < height) {
      // Port panel background
      ctx.fillStyle = '#0a0805';
      ctx.fillRect(px, py, pw, ph);

      // Port slots (3 vertical rectangles)
      for (let i = 0; i < 3; i++) {
        const slotX = px + 8 + i * 14;
        const slotY = py + 8;
        ctx.fillStyle = '#1a1208';
        ctx.fillRect(slotX, slotY, 8, 14);

        // Port pins
        for (let j = 0; j < 3; j++) {
          ctx.fillStyle = '#3a2a1a';
          ctx.fillRect(slotX + 2, slotY + 3 + j * 4, 4, 2);
        }
      }

      // Border
      ctx.fillStyle = '#2a1a10';
      ctx.fillRect(px, py, pw, 2);
      ctx.fillRect(px, py + ph - 2, pw, 2);
      ctx.fillRect(px, py, 2, ph);
      ctx.fillRect(px + pw - 2, py, 2, ph);
    }
  });

  // === ENHANCED: Indicator lights (status LEDs) ===
  const ledPositions = [
    [40, 60], [100, 60], [160, 60],
    [width - 200, 80], [width - 160, 80],
    [50, height - 70], [110, height - 70],
  ];
  ledPositions.forEach(([lx, ly], idx) => {
    if (lx >= 0 && ly >= 0 && lx + 10 < width && ly + 10 < height) {
      // LED housing
      ctx.fillStyle = '#1a1208';
      ctx.fillRect(lx, ly, 10, 10);

      // LED light (different colors)
      const ledColors = ['#2a4a2a', '#4a2a2a', '#2a3a4a', '#4a3a2a', '#1a1410'];
      const ledColor = ledColors[idx % ledColors.length];
      ctx.fillStyle = ledColor;
      ctx.fillRect(lx + 2, ly + 2, 6, 6);

      // Highlight
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(lx + 3, ly + 3, 2, 2);
    }
  });

  // === ENHANCED: Pipes and conduits (space-themed details) ===
  const pipeCount = 3;
  for (let i = 0; i < pipeCount; i++) {
    const pipeY = rng.randomInt(100, height - 100);
    const pipeWidth = rng.randomInt(8, 14);

    // Horizontal pipe across width
    for (let x = 50; x < width - 50; x += 4) {
      // Pipe body
      ctx.fillStyle = '#2a2018';
      ctx.fillRect(x, pipeY, 4, pipeWidth);
      // Pipe highlight
      ctx.fillStyle = '#3a2a20';
      ctx.fillRect(x, pipeY, 4, 2);
      // Pipe shadow
      ctx.fillStyle = '#1a1410';
      ctx.fillRect(x, pipeY + pipeWidth - 2, 4, 2);
    }

    // Pipe joints/connectors
    const jointPositions = [100, width / 2, width - 150];
    jointPositions.forEach(jx => {
      if (jx >= 0 && jx + 20 < width) {
        ctx.fillStyle = '#2a1a10';
        ctx.fillRect(jx, pipeY - 4, 20, pipeWidth + 8);
        ctx.fillStyle = '#1a1208';
        ctx.fillRect(jx + 2, pipeY - 2, 16, pipeWidth + 4);
      }
    });
  }

  return canvas;
}

// REMOVED BELOW - too expensive for performance:
// Control boxes, scratches, dents, hazard stripes, LEDs, data ports
/*
  // === CONTROL BOXES AND JUNCTION BOXES (3D DEPTH) ===
  const boxCount = 6;
  for (let i = 0; i < boxCount; i++) {
    const bx = rng.randomInt(100, width - 120);
    const by = rng.randomInt(100, height - 100);
    const bw = rng.randomInt(40, 70);
    const bh = rng.randomInt(50, 80);

    if (bx + bw < width && by + bh < height && bx >= 0 && by >= 0) {
      // Box shadow for depth
      for (let y = 0; y < bh + 4; y += pixelSize) {
        for (let x = 0; x < bw + 4; x += pixelSize) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(bx + x + 3, by + y + 3, pixelSize, pixelSize);
        }
      }

      // Box body with 3D shading
      for (let y = 0; y < bh; y += pixelSize) {
        for (let x = 0; x < bw; x += pixelSize) {
          const edgeDist = Math.min(x, y, bw - x, bh - y);
          const shade = edgeDist < 6 ? Math.floor(15 + edgeDist) : 28;
          ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 8})`;
          ctx.fillRect(bx + x, by + y, pixelSize, pixelSize);
        }
      }

      // Control panel inset
      const insetX = bx + 8;
      const insetY = by + 8;
      const insetW = bw - 16;
      const insetH = bh - 16;
      for (let y = 0; y < insetH; y += pixelSize) {
        for (let x = 0; x < insetW; x += pixelSize) {
          ctx.fillStyle = '#0a0805';
          ctx.fillRect(insetX + x, insetY + y, pixelSize, pixelSize);
        }
      }

      // Indicator LEDs on box
      const ledCount = rng.randomInt(2, 4);
      for (let l = 0; l < ledCount; l++) {
        const ledX = insetX + 5 + l * 12;
        const ledY = insetY + 5;
        if (ledX + 4 < insetX + insetW) {
          ctx.fillStyle = rng.random() > 0.5 ? '#4a3020' : '#1a1410';
          ctx.fillRect(ledX, ledY, 4, 4);
        }
      }

      // Box screws at corners
      [[bx + 3, by + 3], [bx + bw - 6, by + 3], [bx + 3, by + bh - 6], [bx + bw - 6, by + bh - 6]].forEach(([sx, sy]) => {
        ctx.fillStyle = '#1a1208';
        ctx.fillRect(sx, sy, 3, 3);
        ctx.fillStyle = '#2a1a10';
        ctx.fillRect(sx, sy, pixelSize, pixelSize);
      });
    }
  }

  // === SCRATCHES AND WEAR MARKS (MORE DETAIL) ===
  for (let i = 0; i < 80; i++) {
    const sx = rng.randomInt(0, width - 40);
    const sy = rng.randomInt(0, height);
    const sw = rng.randomInt(15, 50);
    const thickness = rng.randomInt(1, 3);
    if (sx + sw < width && sy < height) {
      ctx.fillStyle = rng.random() > 0.7 ? '#0a0805' : '#1a1410';
      ctx.fillRect(sx, sy, sw, thickness);
    }
  }

  // === DENTS AND IMPACT MARKS ===
  for (let i = 0; i < 15; i++) {
    const dx = rng.randomInt(20, width - 30);
    const dy = rng.randomInt(20, height - 30);
    const dsize = rng.randomInt(8, 16);
    for (let y = 0; y < dsize; y += pixelSize) {
      for (let x = 0; x < dsize; x += pixelSize) {
        const dist = Math.sqrt((x - dsize/2) ** 2 + (y - dsize/2) ** 2);
        if (dist < dsize / 2) {
          const shade = Math.floor(12 + (dist / dsize) * 8);
          ctx.fillStyle = `rgb(${shade}, ${shade - 3}, ${shade - 5})`;
          ctx.fillRect(dx + x, dy + y, pixelSize, pixelSize);
        }
      }
    }
  }

  // === HAZARD STRIPES (YELLOW/BLACK DIAGONAL WARNING PATTERNS) ===
  const hazardZones = [
    [width - 80, 60, 60, 25],
    [20, height - 90, 60, 25],
    [width / 2 - 30, 20, 60, 25],
  ];
  hazardZones.forEach(([hx, hy, hw, hh]) => {
    if (hx >= 0 && hy >= 0 && hx + hw < width && hy + hh < height) {
      // Background
      for (let y = 0; y < hh; y += pixelSize) {
        for (let x = 0; x < hw; x += pixelSize) {
          const stripePattern = Math.floor((x + y) / 10) % 2;
          ctx.fillStyle = stripePattern === 0 ? '#5a4a20' : '#1a1410';
          ctx.fillRect(hx + x, hy + y, pixelSize, pixelSize);
        }
      }
      // Border
      ctx.fillStyle = '#1a1208';
      ctx.fillRect(hx, hy, hw, 2);
      ctx.fillRect(hx, hy + hh - 2, hw, 2);
      ctx.fillRect(hx, hy, 2, hh);
      ctx.fillRect(hx + hw - 2, hy, 2, hh);
    }
  });

  // === INDICATOR LIGHTS (COLORFUL STATUS LEDS) ===
  const ledPositions = [
    [40, 60], [100, 60], [160, 60], // Top row
    [width - 200, 80], [width - 160, 80], [width - 120, 80], // Top right
    [50, height - 70], [110, height - 70], // Bottom left
    [width - 180, height - 60], [width - 140, height - 60], // Bottom right
  ];
  ledPositions.forEach(([lx, ly], idx) => {
    if (lx >= 0 && ly >= 0 && lx + 12 < width && ly + 12 < height) {
      // LED housing
      for (let y = 0; y < 10; y += pixelSize) {
        for (let x = 0; x < 10; x += pixelSize) {
          ctx.fillStyle = '#1a1208';
          ctx.fillRect(lx + x, ly + y, pixelSize, pixelSize);
        }
      }
      // LED light (different colors)
      const ledColors = ['#2a4a2a', '#4a2a2a', '#2a3a4a', '#4a3a2a', '#1a1410'];
      const ledColor = ledColors[idx % ledColors.length];
      for (let y = 2; y < 8; y += pixelSize) {
        for (let x = 2; x < 8; x += pixelSize) {
          const dist = Math.sqrt((x - 5) ** 2 + (y - 5) ** 2);
          if (dist < 3) {
            ctx.fillStyle = ledColor;
            ctx.fillRect(lx + x, ly + y, pixelSize, pixelSize);
          }
        }
      }
      // Highlight
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(lx + 3, ly + 3, 2, 2);
    }
  });

  // === DATA PORT PANELS ===
  const dataPortPositions = [
    [150, height - 80, 50, 30],
    [width - 220, 120, 50, 30],
    [width / 2 + 100, height - 100, 50, 30],
  ];
  dataPortPositions.forEach(([px, py, pw, ph]) => {
    if (px >= 0 && py >= 0 && px + pw < width && py + ph < height) {
      // Port panel background
      for (let y = 0; y < ph; y += pixelSize) {
        for (let x = 0; x < pw; x += pixelSize) {
          ctx.fillStyle = '#0a0805';
          ctx.fillRect(px + x, py + y, pixelSize, pixelSize);
        }
      }
      // Port slots (3 vertical rectangles)
      for (let i = 0; i < 3; i++) {
        const slotX = px + 8 + i * 14;
        const slotY = py + 8;
        for (let y = 0; y < 14; y += pixelSize) {
          for (let x = 0; x < 8; x += pixelSize) {
            ctx.fillStyle = '#1a1208';
            ctx.fillRect(slotX + x, slotY + y, pixelSize, pixelSize);
          }
        }
        // Port pins
        for (let j = 0; j < 3; j++) {
          ctx.fillStyle = '#3a2a1a';
          ctx.fillRect(slotX + 2, slotY + 3 + j * 4, 4, 2);
        }
      }
      // Border
      ctx.fillStyle = '#2a1a10';
      ctx.fillRect(px, py, pw, 2);
      ctx.fillRect(px, py + ph - 2, pw, 2);
      ctx.fillRect(px, py, 2, ph);
      ctx.fillRect(px + pw - 2, py, 2, ph);
    }
  });

  // === CIRCUIT BOARD PATTERNS ===
  const circuitBoxes = [
    [width - 120, height - 140, 80, 60],
    [70, height / 2 - 30, 70, 50],
  ];
  circuitBoxes.forEach(([cx, cy, cw, ch]) => {
    if (cx >= 0 && cy >= 0 && cx + cw < width && cy + ch < height) {
      // Background
      for (let y = 0; y < ch; y += pixelSize) {
        for (let x = 0; x < cw; x += pixelSize) {
          ctx.fillStyle = '#1a1a10';
          ctx.fillRect(cx + x, cy + y, pixelSize, pixelSize);
        }
      }
      // Circuit traces (horizontal and vertical lines)
      for (let i = 10; i < ch - 10; i += 12) {
        ctx.fillStyle = '#2a2418';
        ctx.fillRect(cx + 8, cy + i, cw - 16, 2);
      }
      for (let i = 10; i < cw - 10; i += 15) {
        ctx.fillStyle = '#2a2418';
        ctx.fillRect(cx + i, cy + 8, 2, ch - 16);
      }
      // Small components (resistors/capacitors)
      for (let i = 0; i < 6; i++) {
        const compX = cx + 12 + (i % 3) * 20;
        const compY = cy + 15 + Math.floor(i / 3) * 20;
        ctx.fillStyle = '#1a1208';
        ctx.fillRect(compX, compY, 6, 4);
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(compX + 1, compY + 1, 4, 2);
      }
      // Border
      ctx.fillStyle = '#0a0805';
      ctx.fillRect(cx, cy, cw, 2);
      ctx.fillRect(cx, cy + ch - 2, cw, 2);
      ctx.fillRect(cx, cy, 2, ch);
      ctx.fillRect(cx + cw - 2, cy, 2, ch);
    }
  });

  // === CABLE MANAGEMENT CLIPS ===
  for (let x = 100; x < width - 100; x += 180) {
    for (let y = 50; y < height - 50; y += 150) {
      if (x >= 0 && y >= 0 && x + 18 < width && y + 12 < height) {
        // Clip base
        for (let cy = 0; cy < 12; cy += pixelSize) {
          for (let cx = 0; cx < 18; cx += pixelSize) {
            const edgeDist = Math.min(cx, cy, 18 - cx, 12 - cy);
            const shade = edgeDist < 3 ? 15 : 25;
            ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 8})`;
            ctx.fillRect(x + cx, y + cy, pixelSize, pixelSize);
          }
        }
        // Clip opening
        for (let cx = 4; cx < 14; cx += pixelSize) {
          ctx.fillStyle = '#0a0805';
          ctx.fillRect(x + cx, y + 3, pixelSize, 6);
        }
        // Cable inside clip
        for (let cx = 6; cx < 12; cx += pixelSize) {
          ctx.fillStyle = '#1a1410';
          ctx.fillRect(x + cx, y + 5, pixelSize, 2);
        }
      }
    }
  }

  // === EMERGENCY EQUIPMENT LABELS (RED BORDERS) ===
  const emergencyLabels = [
    [width - 140, 200, 100, 30],
    [50, 250, 90, 30],
  ];
  emergencyLabels.forEach(([ex, ey, ew, eh]) => {
    if (ex >= 0 && ey >= 0 && ex + ew < width && ey + eh < height) {
      // Red border
      ctx.fillStyle = '#4a2020';
      ctx.fillRect(ex, ey, ew, 3);
      ctx.fillRect(ex, ey + eh - 3, ew, 3);
      ctx.fillRect(ex, ey, 3, eh);
      ctx.fillRect(ex + ew - 3, ey, 3, eh);
      // Interior
      for (let y = 3; y < eh - 3; y += pixelSize) {
        for (let x = 3; x < ew - 3; x += pixelSize) {
          ctx.fillStyle = '#2a1810';
          ctx.fillRect(ex + x, ey + y, pixelSize, pixelSize);
        }
      }
      // Diagonal stripe pattern
      for (let y = 3; y < eh - 3; y += pixelSize * 3) {
        for (let x = 3; x < ew - 3; x += pixelSize * 3) {
          if ((x + y) % 12 < 6) {
            ctx.fillStyle = '#3a2418';
            ctx.fillRect(ex + x, ey + y, pixelSize * 2, pixelSize * 2);
          }
        }
      }
    }
  });

  return canvas;
*/

// End of removed expensive code

/**
 * Generate 3D pixelated panel with depth
 * Creates retro computer panel with beveled edges and surface detail
 */
export function generate3DPanel(width, height, options = {}) {
  const {
    seed = 12345,
    baseColor = '#4a3a2a',
    bevelSize = 4,
    hasScreenLines = true,
    hasPanelDividers = false,
    depth = 1.0
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(seed);
  const pixelSize = 1;

  // Parse base color
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [74, 58, 42];
  };

  const [baseR, baseG, baseB] = hexToRgb(baseColor);

  // Main panel surface with micro-variation
  for (let y = bevelSize; y < height - bevelSize; y += pixelSize) {
    for (let x = bevelSize; x < width - bevelSize; x += pixelSize) {
      const variation = rng.randomInt(-8, 8);
      const r = Math.max(0, Math.min(255, baseR + variation));
      const g = Math.max(0, Math.min(255, baseG + variation));
      const b = Math.max(0, Math.min(255, baseB + variation));

      // Surface scratches and imperfections
      const imperfection = rng.random() < 0.01 ? rng.randomInt(-15, -5) : 0;

      ctx.fillStyle = `rgb(${r + imperfection}, ${g + imperfection}, ${b + imperfection})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  // === ENHANCED: Stronger 3D beveled edges with metallic highlights ===
  // Top bevel (bright highlight)
  for (let i = 0; i < bevelSize; i++) {
    const intensity = (bevelSize - i) / bevelSize;
    const highlightR = Math.min(255, baseR + 90 * intensity * depth);
    const highlightG = Math.min(255, baseG + 90 * intensity * depth);
    const highlightB = Math.min(255, baseB + 90 * intensity * depth);

    for (let x = i; x < width - i; x += pixelSize) {
      ctx.fillStyle = `rgb(${highlightR}, ${highlightG}, ${highlightB})`;
      ctx.fillRect(x, i, pixelSize, pixelSize);
    }
  }

  // Left bevel (medium highlight)
  for (let i = 0; i < bevelSize; i++) {
    const intensity = (bevelSize - i) / bevelSize;
    const highlightR = Math.min(255, baseR + 75 * intensity * depth);
    const highlightG = Math.min(255, baseG + 75 * intensity * depth);
    const highlightB = Math.min(255, baseB + 75 * intensity * depth);

    for (let y = i; y < height - i; y += pixelSize) {
      ctx.fillStyle = `rgb(${highlightR}, ${highlightG}, ${highlightB})`;
      ctx.fillRect(i, y, pixelSize, pixelSize);
    }
  }

  // Bottom bevel (deep shadow)
  for (let i = 0; i < bevelSize; i++) {
    const intensity = (bevelSize - i) / bevelSize;
    const shadowR = Math.floor(baseR * (1 - 0.6 * intensity * depth));
    const shadowG = Math.floor(baseG * (1 - 0.6 * intensity * depth));
    const shadowB = Math.floor(baseB * (1 - 0.6 * intensity * depth));

    for (let x = i; x < width - i; x += pixelSize) {
      ctx.fillStyle = `rgb(${shadowR}, ${shadowG}, ${shadowB})`;
      ctx.fillRect(x, height - 1 - i, pixelSize, pixelSize);
    }
  }

  // Right bevel (deeper shadow)
  for (let i = 0; i < bevelSize; i++) {
    const intensity = (bevelSize - i) / bevelSize;
    const shadowR = Math.floor(baseR * (1 - 0.7 * intensity * depth));
    const shadowG = Math.floor(baseG * (1 - 0.7 * intensity * depth));
    const shadowB = Math.floor(baseB * (1 - 0.7 * intensity * depth));

    for (let y = i; y < height - i; y += pixelSize) {
      ctx.fillStyle = `rgb(${shadowR}, ${shadowG}, ${shadowB})`;
      ctx.fillRect(width - 1 - i, y, pixelSize, pixelSize);
    }
  }

  // === ENHANCED: Rust and corrosion around edges ===
  for (let i = 0; i < 8; i++) {
    const rustX = i < 4 ? rng.randomInt(0, bevelSize * 3) : rng.randomInt(width - bevelSize * 3, width);
    const rustY = rng.randomInt(0, height);
    const rustSize = rng.randomInt(4, 12);

    for (let y = 0; y < rustSize; y += 2) {
      for (let x = 0; x < rustSize; x += 2) {
        if (rng.random() > 0.5) {
          const rustShade = rng.randomInt(20, 35);
          ctx.fillStyle = `rgb(${rustShade}, ${Math.floor(rustShade * 0.4)}, ${Math.floor(rustShade * 0.2)})`;
          ctx.fillRect(rustX + x, rustY + y, 2, 2);
        }
      }
    }
  }

  // === ENHANCED: Metallic plate seams (vertical and horizontal) ===
  if (width > 60) {
    const seamX = Math.floor(width / 2);
    for (let y = bevelSize + 10; y < height - bevelSize - 10; y += 2) {
      ctx.fillStyle = `rgb(${Math.floor(baseR * 0.4)}, ${Math.floor(baseG * 0.4)}, ${Math.floor(baseB * 0.4)})`;
      ctx.fillRect(seamX, y, 1, 1);
      ctx.fillStyle = `rgb(${Math.min(255, baseR * 1.4)}, ${Math.min(255, baseG * 1.4)}, ${Math.min(255, baseB * 1.4)})`;
      ctx.fillRect(seamX + 1, y, 1, 1);
    }
  }

  // === ENHANCED: Rivets at corners ===
  const rivetPositions = [
    [bevelSize + 4, bevelSize + 4],
    [width - bevelSize - 8, bevelSize + 4],
    [bevelSize + 4, height - bevelSize - 8],
    [width - bevelSize - 8, height - bevelSize - 8]
  ];
  rivetPositions.forEach(([rx, ry]) => {
    // Rivet recess
    for (let y = -2; y <= 2; y++) {
      for (let x = -2; x <= 2; x++) {
        const dist = Math.sqrt(x * x + y * y);
        if (dist < 2.5) {
          ctx.fillStyle = `rgb(${Math.floor(baseR * 0.5)}, ${Math.floor(baseG * 0.5)}, ${Math.floor(baseB * 0.5)})`;
          ctx.fillRect(rx + x, ry + y, 1, 1);
        }
      }
    }
    // Rivet head
    ctx.fillStyle = `rgb(${Math.floor(baseR * 0.7)}, ${Math.floor(baseG * 0.7)}, ${Math.floor(baseB * 0.7)})`;
    ctx.fillRect(rx - 1, ry - 1, 3, 3);
    ctx.fillStyle = `rgb(${Math.min(255, baseR * 1.2)}, ${Math.min(255, baseG * 1.2)}, ${Math.min(255, baseB * 1.2)})`;
    ctx.fillRect(rx, ry, 1, 1);
  });

  // Scan lines (CRT effect)
  if (hasScreenLines) {
    ctx.globalAlpha = 0.15;
    for (let y = 0; y < height; y += 2) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, y, width, 1);
    }
    ctx.globalAlpha = 1.0;
  }

  // Panel dividers (vertical sections)
  if (hasPanelDividers) {
    const dividerCount = Math.floor(width / 120);
    for (let d = 1; d < dividerCount; d++) {
      const dividerX = Math.floor((width / dividerCount) * d);
      for (let y = bevelSize; y < height - bevelSize; y += pixelSize) {
        // Recessed line
        ctx.fillStyle = `rgb(${Math.floor(baseR * 0.5)}, ${Math.floor(baseG * 0.5)}, ${Math.floor(baseB * 0.5)})`;
        ctx.fillRect(dividerX, y, 1, pixelSize);
        // Highlight line
        ctx.fillStyle = `rgb(${Math.min(255, baseR * 1.3)}, ${Math.min(255, baseG * 1.3)}, ${Math.min(255, baseB * 1.3)})`;
        ctx.fillRect(dividerX + 1, y, 1, pixelSize);
      }
    }
  }

  return canvas;
}

/**
 * Generate 3D pixelated button
 * Creates interactive button with hover/pressed states
 */
export function generate3DButton(width, height, text, options = {}) {
  const {
    seed = 12345,
    baseColor = '#6a5a4a',
    textColor = '#ffcc88',
    state = 'normal', // 'normal', 'hover', 'pressed'
    fontSize = 14,
    hasLED = true
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(seed);
  const pixelSize = 1;

  // Parse base color
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [106, 90, 74];
  };

  const [baseR, baseG, baseB] = hexToRgb(baseColor);

  // Adjust colors based on state
  let colorMultiplier = 1.0;
  let bevelDirection = 1; // 1 = raised, -1 = pressed

  if (state === 'hover') {
    colorMultiplier = 1.15;
  } else if (state === 'pressed') {
    colorMultiplier = 0.85;
    bevelDirection = -1;
  }

  const adjustedR = Math.min(255, Math.floor(baseR * colorMultiplier));
  const adjustedG = Math.min(255, Math.floor(baseG * colorMultiplier));
  const adjustedB = Math.min(255, Math.floor(baseB * colorMultiplier));

  const bevelSize = state === 'pressed' ? 2 : 4; // ENHANCED: Deeper bevel

  // Main button surface
  for (let y = bevelSize; y < height - bevelSize; y += pixelSize) {
    for (let x = bevelSize; x < width - bevelSize; x += pixelSize) {
      const variation = rng.randomInt(-5, 5);
      const r = Math.max(0, Math.min(255, adjustedR + variation));
      const g = Math.max(0, Math.min(255, adjustedG + variation));
      const b = Math.max(0, Math.min(255, adjustedB + variation));

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }

  // === ENHANCED: Stronger beveled edges with more pronounced depth ===
  const highlightMult = bevelDirection > 0 ? 1.6 : 0.5;
  const shadowMult = bevelDirection > 0 ? 0.5 : 1.4;

  // Top and left (highlight or shadow)
  for (let i = 0; i < bevelSize; i++) {
    const intensity = (bevelSize - i) / bevelSize;
    const edgeR = Math.min(255, Math.floor(adjustedR * (highlightMult - 0.6 * (1 - intensity))));
    const edgeG = Math.min(255, Math.floor(adjustedG * (highlightMult - 0.6 * (1 - intensity))));
    const edgeB = Math.min(255, Math.floor(adjustedB * (highlightMult - 0.6 * (1 - intensity))));

    // Top
    for (let x = i; x < width - i; x++) {
      ctx.fillStyle = `rgb(${edgeR}, ${edgeG}, ${edgeB})`;
      ctx.fillRect(x, i, 1, 1);
    }
    // Left
    for (let y = i; y < height - i; y++) {
      ctx.fillStyle = `rgb(${edgeR}, ${edgeG}, ${edgeB})`;
      ctx.fillRect(i, y, 1, 1);
    }
  }

  // Bottom and right (shadow or highlight)
  for (let i = 0; i < bevelSize; i++) {
    const intensity = (bevelSize - i) / bevelSize;
    const edgeR = Math.floor(adjustedR * (shadowMult + 0.5 * (1 - intensity)));
    const edgeG = Math.floor(adjustedG * (shadowMult + 0.5 * (1 - intensity)));
    const edgeB = Math.floor(adjustedB * (shadowMult + 0.5 * (1 - intensity)));

    // Bottom
    for (let x = i; x < width - i; x++) {
      ctx.fillStyle = `rgb(${edgeR}, ${edgeG}, ${edgeB})`;
      ctx.fillRect(x, height - 1 - i, 1, 1);
    }
    // Right
    for (let y = i; y < height - i; y++) {
      ctx.fillStyle = `rgb(${edgeR}, ${edgeG}, ${edgeB})`;
      ctx.fillRect(width - 1 - i, y, 1, 1);
    }
  }

  // === ENHANCED: Wear marks and scratches on button surface ===
  for (let i = 0; i < 6; i++) {
    const scratchX = rng.randomInt(bevelSize, width - bevelSize - 10);
    const scratchY = rng.randomInt(bevelSize, height - bevelSize);
    const scratchLength = rng.randomInt(5, 15);
    ctx.fillStyle = `rgb(${Math.floor(adjustedR * 0.6)}, ${Math.floor(adjustedG * 0.6)}, ${Math.floor(adjustedB * 0.6)})`;
    ctx.fillRect(scratchX, scratchY, scratchLength, 1);
  }

  // === ENHANCED: Worn edges (darker spots around corners) ===
  const wornSpots = [
    [bevelSize + 2, bevelSize + 2],
    [width - bevelSize - 4, bevelSize + 2],
    [bevelSize + 2, height - bevelSize - 4],
    [width - bevelSize - 4, height - bevelSize - 4]
  ];
  wornSpots.forEach(([wx, wy]) => {
    for (let y = -2; y <= 2; y++) {
      for (let x = -2; x <= 2; x++) {
        if (rng.random() > 0.3) {
          ctx.fillStyle = `rgb(${Math.floor(adjustedR * 0.7)}, ${Math.floor(adjustedG * 0.7)}, ${Math.floor(adjustedB * 0.7)})`;
          ctx.fillRect(wx + x, wy + y, 1, 1);
        }
      }
    }
  });

  // LED indicator (optional)
  if (hasLED) {
    const ledX = width - 12;
    const ledY = 6;
    const ledSize = 4;
    const ledColor = state === 'pressed' ? [100, 255, 100] : [255, 200, 100];

    // LED glow
    ctx.globalAlpha = 0.4;
    for (let py = -2; py <= 2; py++) {
      for (let px = -2; px <= 2; px++) {
        ctx.fillStyle = `rgb(${ledColor[0]}, ${ledColor[1]}, ${ledColor[2]})`;
        ctx.fillRect(ledX + px, ledY + py, ledSize + Math.abs(px) + Math.abs(py), ledSize + Math.abs(px) + Math.abs(py));
      }
    }
    ctx.globalAlpha = 1.0;

    // LED core
    ctx.fillStyle = `rgb(${ledColor[0]}, ${ledColor[1]}, ${ledColor[2]})`;
    ctx.fillRect(ledX, ledY, ledSize, ledSize);
  }

  // Button text
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textY = state === 'pressed' ? height / 2 + 1 : height / 2;
  ctx.fillText(text, width / 2, textY);

  return canvas;
}

/**
 * Generate retro computer terminal screen texture
 */
export function generate3DTerminalScreen(width, height, options = {}) {
  const {
    seed = 12345,
    screenColor = '#1a2a1a',
    scanlineIntensity = 0.2,
    hasFlicker = true
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rng = new SeededRandom(seed);

  // Parse screen color
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [26, 42, 26];
  };

  const [baseR, baseG, baseB] = hexToRgb(screenColor);

  // === ENHANCED: Screen bezel with 3D depth ===
  const bezelSize = 8;
  for (let i = 0; i < bezelSize; i++) {
    const intensity = (bezelSize - i) / bezelSize;
    const bezelShade = Math.floor(15 + intensity * 25);

    // Top bezel
    for (let x = 0; x < width; x++) {
      ctx.fillStyle = `rgb(${bezelShade}, ${bezelShade - 3}, ${bezelShade - 5})`;
      ctx.fillRect(x, i, 1, 1);
    }
    // Left bezel
    for (let y = 0; y < height; y++) {
      ctx.fillStyle = `rgb(${bezelShade}, ${bezelShade - 3}, ${bezelShade - 5})`;
      ctx.fillRect(i, y, 1, 1);
    }
    // Bottom bezel (darker)
    for (let x = 0; x < width; x++) {
      ctx.fillStyle = `rgb(${Math.floor(bezelShade * 0.5)}, ${Math.floor(bezelShade * 0.4)}, ${Math.floor(bezelShade * 0.3)})`;
      ctx.fillRect(x, height - 1 - i, 1, 1);
    }
    // Right bezel (darker)
    for (let y = 0; y < height; y++) {
      ctx.fillStyle = `rgb(${Math.floor(bezelShade * 0.5)}, ${Math.floor(bezelShade * 0.4)}, ${Math.floor(bezelShade * 0.3)})`;
      ctx.fillRect(width - 1 - i, y, 1, 1);
    }
  }

  // Base screen color with subtle variation and curvature effect
  for (let y = bezelSize; y < height - bezelSize; y++) {
    for (let x = bezelSize; x < width - bezelSize; x++) {
      // === ENHANCED: CRT screen curvature simulation ===
      const centerX = width / 2;
      const centerY = height / 2;
      const distX = (x - centerX) / centerX;
      const distY = (y - centerY) / centerY;
      const curvature = 1 - (distX * distX + distY * distY) * 0.08;

      const variation = rng.randomInt(-3, 3);
      const flickerVar = hasFlicker && rng.random() < 0.02 ? rng.randomInt(-8, 8) : 0;
      const r = Math.max(0, Math.min(255, Math.floor((baseR + variation + flickerVar) * curvature)));
      const g = Math.max(0, Math.min(255, Math.floor((baseG + variation + flickerVar) * curvature)));
      const b = Math.max(0, Math.min(255, Math.floor((baseB + variation + flickerVar) * curvature)));

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // === ENHANCED: Stronger scan lines for authentic CRT look ===
  ctx.globalAlpha = scanlineIntensity * 1.5;
  for (let y = bezelSize; y < height - bezelSize; y += 2) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(bezelSize, y, width - bezelSize * 2, 1);
  }
  ctx.globalAlpha = 1.0;

  // === ENHANCED: Stronger vignette for CRT curved screen effect ===
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * 0.6
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // === ENHANCED: Corner reflections for glass screen effect ===
  const reflections = [
    [bezelSize + 10, bezelSize + 10],
    [width - bezelSize - 30, bezelSize + 10]
  ];
  reflections.forEach(([rx, ry]) => {
    ctx.globalAlpha = 0.15;
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        const dist = Math.sqrt((x - 10) ** 2 + (y - 10) ** 2);
        if (dist < 10) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx + x, ry + y, 1, 1);
        }
      }
    }
    ctx.globalAlpha = 1.0;
  });

  return canvas;
}
