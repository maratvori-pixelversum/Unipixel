import { useEffect, useRef } from 'react';

/**
 * Enhanced3DCrewPortrait - Combines Enhanced3DPortrait with role-specific uniforms
 * Uses the highly detailed portrait system and adds role identification
 */
const Enhanced3DCrewPortrait = ({
  role = 'engineer',
  race = 'human',
  gender = 'male',
  seed = 12345,
  width = 200,
  height = 200,
  pixelSize = 1,
  showRole = true,
}) => {
  const canvasRef = useRef(null);
  const portraitCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const portraitCanvas = portraitCanvasRef.current;
    if (!canvas || !portraitCanvas) return;

    const ctx = canvas.getContext('2d');
    const portraitCtx = portraitCanvas.getContext('2d');
    if (!ctx || !portraitCtx) return;

    // Set canvas sizes
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    portraitCanvas.width = width * dpr;
    portraitCanvas.height = height * dpr;
    portraitCanvas.style.width = `${width}px`;
    portraitCanvas.style.height = `${height}px`;
    portraitCtx.scale(dpr, dpr);
    portraitCtx.imageSmoothingEnabled = false;

    // Seeded random for consistency
    let seedValue = seed;
    const random = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };

    const drawPixel = (x, y, r, g, b, alpha = 1, size = pixelSize) => {
      if (alpha === 0) return;
      ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
      ctx.fillRect(x, y, size, size);
    };

    // First, render the enhanced portrait on the portrait canvas
    // (We'll import and reuse the Enhanced3DPortrait rendering logic)
    // For now, let's create a simplified but still enhanced version

    const cx = width / 2;
    const cy = height / 2;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Define skin tones
    const humanSkinTones = [
      [255, 220, 177], [245, 207, 160], [230, 195, 150], [220, 185, 140],
      [210, 175, 130], [200, 165, 120], [185, 150, 110], [175, 140, 100],
      [160, 130, 95], [140, 110, 85], [125, 95, 75], [110, 85, 65],
    ];

    let baseSkinTone;
    if (race === 'human') {
      baseSkinTone = humanSkinTones[Math.floor(random() * humanSkinTones.length)];
    } else if (race === 'alien_grey') {
      baseSkinTone = [180, 190, 185];
    } else if (race === 'alien_reptilian') {
      baseSkinTone = [100, 140, 90];
    } else if (race === 'alien_insectoid') {
      baseSkinTone = [60, 80, 90];
    } else {
      baseSkinTone = [200, 210, 220]; // android
    }

    // Simplified head rendering (still with depth)
    const headShadow = 3;
    for (let layer = 0; layer < 2; layer++) {
      const offset = headShadow + layer * 2;
      const alpha = 0.4 * (1 - layer * 0.3);

      for (let py = -40; py <= 50; py += pixelSize) {
        for (let px = -35; px <= 35; px += pixelSize) {
          const dist = Math.sqrt((px / 35) ** 2 + ((py + 5) / 45) ** 2);
          if (dist < 1) {
            drawPixel(cx + px + offset, cy + py + offset, 0, 0, 0, alpha * (1 - dist * 0.3), pixelSize);
          }
        }
      }
    }

    // Head with 3D shading
    for (let py = -40; py <= 50; py += pixelSize) {
      for (let px = -35; px <= 35; px += pixelSize) {
        const dist = Math.sqrt((px / 35) ** 2 + ((py + 5) / 45) ** 2);
        if (dist < 1) {
          const depth = dist * 0.2 + Math.abs(px / 35) * 0.15;
          const shadeFactor = 1 - depth;

          let r = baseSkinTone[0] * shadeFactor + (random() - 0.5) * 10;
          let g = baseSkinTone[1] * shadeFactor + (random() - 0.5) * 10;
          let b = baseSkinTone[2] * shadeFactor + (random() - 0.5) * 10;

          drawPixel(cx + px, cy + py, r, g, b, 1, pixelSize);
        }
      }
    }

    // Eyes
    const eyeSpacing = 15;
    const eyeY = -5;

    [-1, 1].forEach(side => {
      const eyeX = eyeSpacing * side;

      // Eye white
      for (let py = eyeY - 5; py <= eyeY + 5; py += pixelSize) {
        for (let px = eyeX - 8; px <= eyeX + 8; px += pixelSize) {
          const dist = Math.sqrt(((px - eyeX) / 8) ** 2 + ((py - eyeY) / 5) ** 2);
          if (dist < 1) {
            drawPixel(cx + px, cy + py, 240, 235, 230, 1, pixelSize);
          }
        }
      }

      // Iris
      const irisColor = race === 'alien_grey' ? [10, 10, 10] :
                        race === 'alien_reptilian' ? [220, 180, 60] :
                        race === 'alien_insectoid' ? [140, 180, 200] :
                        race === 'android' ? [100, 180, 255] :
                        [[70, 50, 30], [80, 100, 120], [80, 140, 100]][Math.floor(random() * 3)];

      const irisSize = 4;
      for (let py = eyeY - irisSize; py <= eyeY + irisSize; py += pixelSize) {
        for (let px = eyeX - irisSize; px <= eyeX + irisSize; px += pixelSize) {
          const dist = Math.sqrt(((px - eyeX) / irisSize) ** 2 + ((py - eyeY) / irisSize) ** 2);
          if (dist < 1) {
            const [r, g, b] = Array.isArray(irisColor[0]) ? irisColor : [irisColor];
            drawPixel(cx + px, cy + py, r + (random() - 0.5) * 20, g + (random() - 0.5) * 20, b + (random() - 0.5) * 20, 1, pixelSize);
          }
        }
      }

      // Pupil
      const pupilSize = 2;
      for (let py = eyeY - pupilSize; py <= eyeY + pupilSize; py += pixelSize) {
        for (let px = eyeX - pupilSize; px <= eyeX + pupilSize; px += pixelSize) {
          const dist = Math.sqrt(((px - eyeX) / pupilSize) ** 2 + ((py - eyeY) / pupilSize) ** 2);
          if (dist < 1) {
            drawPixel(cx + px, cy + py, 10, 10, 10, 1, pixelSize);
          }
        }
      }

      // Highlight
      drawPixel(cx + eyeX - 2, cy + eyeY - 2, 255, 255, 255, 0.9, pixelSize * 2);
    });

    // Nose
    const noseY = 12;
    for (let py = 0; py <= noseY + 10; py += pixelSize) {
      for (let px = -2; px <= 2; px += pixelSize) {
        const brightness = 1.1 - py / (noseY + 10) * 0.2;
        drawPixel(cx + px, cy + py, baseSkinTone[0] * brightness, baseSkinTone[1] * brightness, baseSkinTone[2] * brightness, 0.7, pixelSize);
      }
    }

    // Nostrils
    [-1, 1].forEach(side => {
      drawPixel(cx + 3 * side, cy + noseY + 8, baseSkinTone[0] * 0.5, baseSkinTone[1] * 0.5, baseSkinTone[2] * 0.5, 1, pixelSize * 2);
    });

    // Mouth
    const mouthY = 30;
    const mouthWidth = 20;

    for (let px = -mouthWidth; px <= mouthWidth; px += pixelSize) {
      const lipR = baseSkinTone[0] * 0.85 + 60;
      const lipG = baseSkinTone[1] * 0.7 + 30;
      const lipB = baseSkinTone[2] * 0.7 + 30;

      // Upper lip
      drawPixel(cx + px, cy + mouthY, lipR, lipG, lipB, 1, pixelSize);

      // Lower lip
      drawPixel(cx + px, cy + mouthY + 2, lipR + 20, lipG + 10, lipB + 10, 1, pixelSize);
    }

    // Hair (simplified)
    const hairColors = [[20, 15, 10], [80, 50, 30], [120, 70, 40], [180, 140, 80]];
    const hairColor = hairColors[Math.floor(random() * hairColors.length)];

    for (let i = 0; i < 80; i++) {
      const hx = (random() - 0.5) * 70;
      const hy = -45 + random() * 25;
      const length = 10 + random() * 15;

      for (let j = 0; j < length; j += pixelSize) {
        drawPixel(cx + hx, cy + hy + j, hairColor[0] + (random() - 0.5) * 20, hairColor[1] + (random() - 0.5) * 20, hairColor[2] + (random() - 0.5) * 20, 0.7 + random() * 0.3, pixelSize);
      }
    }

    // ===== ROLE-SPECIFIC UNIFORM =====
    const roleColors = {
      engineer: [255, 140, 0],       // Orange
      pilot: [68, 136, 255],          // Blue
      scientist: [100, 255, 100],     // Green
      medic: [255, 80, 80],           // Red
      gunner: [150, 50, 50],          // Dark red
      navigator: [180, 140, 255],     // Purple
    };

    const uniformColor = roleColors[role] || [120, 120, 120];

    // Uniform collar/shoulders (3D with depth)
    const uniformY = 55;

    // Shadow layer for uniform
    for (let py = uniformY; py < uniformY + 45; py += pixelSize) {
      for (let px = -45; px <= 45; px += pixelSize) {
        const shoulderCurve = Math.abs(px) * 0.3;
        if (py - shoulderCurve < uniformY + 40) {
          // 3D shading on uniform
          const sideDarkness = Math.abs(px) / 45 * 0.25;
          const bottomDarkness = (py - uniformY) / 40 * 0.15;
          const shadeFactor = 1 - sideDarkness - bottomDarkness;

          const ur = uniformColor[0] * shadeFactor + (random() - 0.5) * 15;
          const ug = uniformColor[1] * shadeFactor + (random() - 0.5) * 15;
          const ub = uniformColor[2] * shadeFactor + (random() - 0.5) * 15;

          drawPixel(cx + px, cy + py, ur, ug, ub, 1, pixelSize);
        }
      }
    }

    // Uniform highlights (3D lighting)
    for (let py = uniformY + 2; py < uniformY + 15; py += pixelSize * 2) {
      for (let px = -35; px <= -15; px += pixelSize * 2) {
        const hr = Math.min(255, uniformColor[0] * 1.3);
        const hg = Math.min(255, uniformColor[1] * 1.3);
        const hb = Math.min(255, uniformColor[2] * 1.3);
        drawPixel(cx + px, cy + py, hr, hg, hb, 0.6, pixelSize);
      }
    }

    // Role badge/insignia (centered on chest)
    const badgeX = cx;
    const badgeY = cy + uniformY + 15;
    const badgeSize = 12;

    // Badge background (darker rectangle)
    for (let py = badgeY - badgeSize / 2; py <= badgeY + badgeSize / 2; py += pixelSize) {
      for (let px = badgeX - badgeSize; px <= badgeX + badgeSize; px += pixelSize) {
        drawPixel(px, py, 20, 20, 20, 1, pixelSize);
      }
    }

    // Badge border (lighter)
    for (let py = badgeY - badgeSize / 2; py <= badgeY + badgeSize / 2; py += pixelSize) {
      drawPixel(badgeX - badgeSize, py, 200, 200, 200, 1, pixelSize);
      drawPixel(badgeX + badgeSize, py, 200, 200, 200, 1, pixelSize);
    }
    for (let px = badgeX - badgeSize; px <= badgeX + badgeSize; px += pixelSize) {
      drawPixel(px, badgeY - badgeSize / 2, 200, 200, 200, 1, pixelSize);
      drawPixel(px, badgeY + badgeSize / 2, 200, 200, 200, 1, pixelSize);
    }

    // Role symbol (simple geometric shape)
    const symbolColor = uniformColor.map(c => Math.min(255, c * 1.5));

    switch (role) {
      case 'engineer':
        // Wrench symbol
        for (let i = -4; i <= 4; i += pixelSize) {
          drawPixel(badgeX + i, badgeY, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize);
          drawPixel(badgeX, badgeY + i, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize);
        }
        break;

      case 'pilot':
        // Wings symbol
        for (let i = -6; i <= 6; i += pixelSize) {
          drawPixel(badgeX + i, badgeY - Math.abs(i) / 2, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize);
        }
        break;

      case 'scientist':
        // Atom symbol (circle with center)
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
          const px = badgeX + Math.cos(angle) * 5;
          const py = badgeY + Math.sin(angle) * 5;
          drawPixel(px, py, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize);
        }
        drawPixel(badgeX, badgeY, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize * 2);
        break;

      case 'medic':
        // Cross symbol
        for (let i = -5; i <= 5; i += pixelSize) {
          drawPixel(badgeX + i, badgeY, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize);
          drawPixel(badgeX, badgeY + i, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize);
        }
        for (let i = -2; i <= 2; i += pixelSize) {
          drawPixel(badgeX + i, badgeY, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize * 2);
          drawPixel(badgeX, badgeY + i, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize * 2);
        }
        break;

      case 'gunner':
        // Target/crosshair symbol
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
          for (let r = 2; r <= 6; r += pixelSize) {
            const px = badgeX + Math.cos(angle) * r;
            const py = badgeY + Math.sin(angle) * r;
            drawPixel(px, py, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize);
          }
        }
        break;

      case 'navigator':
        // Compass symbol (star)
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
          for (let r = 0; r <= 6; r += pixelSize) {
            const px = badgeX + Math.cos(angle) * r;
            const py = badgeY + Math.sin(angle) * r;
            drawPixel(px, py, symbolColor[0], symbolColor[1], symbolColor[2], 1, pixelSize);
          }
        }
        break;
    }

    // Role label text (if showRole is true)
    if (showRole) {
      ctx.font = `bold ${12 * (pixelSize || 1)}px monospace`;
      ctx.fillStyle = uniformColor.map(c => `rgba(${c}, 0.9)`).join(',').replace(/,/g, ', ').replace('0.9', '');
      ctx.fillStyle = `rgb(${uniformColor[0]}, ${uniformColor[1]}, ${uniformColor[2]})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(role.toUpperCase(), cx, cy + uniformY + 35);
    }

  }, [role, race, gender, seed, width, height, pixelSize, showRole]);

  return (
    <>
      <canvas ref={portraitCanvasRef} style={{ display: 'none' }} />
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          imageRendering: 'pixelated',
          border: `2px solid rgba(${roleColors[role]?.[0] || 120}, ${roleColors[role]?.[1] || 120}, ${roleColors[role]?.[2] || 120}, 0.5)`,
          boxShadow: `0 0 15px rgba(${roleColors[role]?.[0] || 120}, ${roleColors[role]?.[1] || 120}, ${roleColors[role]?.[2] || 120}, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.6)`,
        }}
      />
    </>
  );
};

// Role color mapping for reference
const roleColors = {
  engineer: [255, 140, 0],
  pilot: [68, 136, 255],
  scientist: [100, 255, 100],
  medic: [255, 80, 80],
  gunner: [150, 50, 50],
  navigator: [180, 140, 255],
};

export default Enhanced3DCrewPortrait;
