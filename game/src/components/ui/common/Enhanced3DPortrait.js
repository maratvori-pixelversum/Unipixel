import { useEffect, useRef } from 'react';

/**
 * Enhanced3DPortrait - Generates highly detailed 3D portraits with hundreds of tiny pixels
 * Features: Multiple depth layers, realistic shading, complex details, micro-pixelation
 */
const Enhanced3DPortrait = ({
  type = 'human',
  gender = 'male',
  seed = 12345,
  width = 200,
  height = 200,
  pixelSize = 1, // Much smaller pixels for hundreds of details
  showRole = false,
  role = 'crew',
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    // Seeded random for consistency
    let seedValue = seed;
    const random = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };

    const randomInt = (min, max) => Math.floor(random() * (max - min + 1)) + min;

    // Draw pixel with micro-detail
    const drawPixel = (x, y, r, g, b, alpha = 1, size = pixelSize) => {
      if (alpha === 0) return;
      ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
      ctx.fillRect(x, y, size, size);
    };

    // Add 3D depth shadow
    const addDepthShadow = (x, y, r, g, b, depth = 0.3) => {
      const shadowR = r * (1 - depth);
      const shadowG = g * (1 - depth);
      const shadowB = b * (1 - depth);
      return [shadowR, shadowG, shadowB];
    };

    // Add 3D highlight
    const addHighlight = (x, y, r, g, b, strength = 0.3) => {
      const highlightR = Math.min(255, r + 255 * strength);
      const highlightG = Math.min(255, g + 255 * strength);
      const highlightB = Math.min(255, b + 255 * strength);
      return [highlightR, highlightG, highlightB];
    };

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Define color palettes based on race
    let skinTones, hairColors, eyeColors, features;

    switch (type) {
      case 'human':
        // 20 different human skin tones for maximum variety
        const humanSkinTones = [
          [255, 220, 177], // Very pale
          [255, 213, 170], // Pale
          [245, 207, 160], // Light
          [230, 195, 150], // Fair
          [220, 185, 140], // Medium fair
          [210, 175, 130], // Medium
          [200, 165, 120], // Tan
          [185, 150, 110], // Medium tan
          [175, 140, 100], // Olive
          [160, 130, 95],  // Deep olive
          [140, 110, 85],  // Bronze
          [125, 95, 75],   // Deep bronze
          [110, 85, 65],   // Brown
          [95, 75, 55],    // Deep brown
          [80, 65, 50],    // Dark brown
          [70, 55, 45],    // Very dark brown
          [60, 48, 38],    // Ebony
          [50, 40, 32],    // Deep ebony
          [235, 180, 145], // Reddish
          [200, 155, 125], // Warm tan
        ];
        skinTones = [humanSkinTones[Math.floor(random() * humanSkinTones.length)]];

        hairColors = [
          [20, 15, 10],     // Black
          [40, 30, 20],     // Dark brown
          [80, 50, 30],     // Brown
          [120, 70, 40],    // Light brown
          [180, 140, 80],   // Blonde
          [220, 200, 160],  // Light blonde
          [160, 90, 50],    // Auburn
          [140, 60, 40],    // Red
          [180, 180, 180],  // Gray
          [240, 240, 240],  // White
        ];

        eyeColors = [
          [70, 50, 30],     // Brown
          [100, 80, 60],    // Light brown
          [80, 100, 120],   // Blue
          [60, 120, 180],   // Bright blue
          [80, 140, 100],   // Green
          [100, 160, 120],  // Bright green
          [120, 120, 120],  // Gray
          [60, 80, 90],     // Hazel
        ];

        features = {
          hasEyebrows: true,
          hasBeard: gender === 'male' && random() > 0.4,
          hasFreckles: random() > 0.6,
          hasScarLeft: random() > 0.85,
          hasWrinkles: random() > 0.7,
          noseType: randomInt(1, 5),
          earSize: randomInt(1, 3),
          lipFullness: randomInt(1, 3),
        };
        break;

      case 'alien_grey':
        skinTones = [[180, 190, 185], [160, 170, 165], [140, 150, 145]];
        hairColors = [[200, 200, 200]]; // None, but keeping for structure
        eyeColors = [[10, 10, 10]]; // Pure black
        features = {
          hasEyebrows: false,
          largeEyes: true,
          smallNose: true,
          thinLips: true,
          noseType: 1,
        };
        break;

      case 'alien_reptilian':
        skinTones = [[100, 140, 90], [90, 120, 80], [80, 110, 70]];
        hairColors = [[80, 100, 70]]; // Scales
        eyeColors = [[220, 180, 60], [180, 140, 40]]; // Yellow/gold
        features = {
          hasScales: true,
          verticalPupils: true,
          ridges: true,
          noseType: 2,
        };
        break;

      case 'alien_insectoid':
        skinTones = [[60, 80, 90], [50, 70, 80], [70, 90, 100]];
        hairColors = [[40, 60, 70]];
        eyeColors = [[140, 180, 200], [100, 140, 160]]; // Compound eyes
        features = {
          compoundEyes: true,
          mandibles: true,
          antennae: true,
          chitinousPlates: true,
        };
        break;

      case 'android':
        skinTones = [[200, 210, 220], [180, 190, 200], [220, 225, 230]];
        hairColors = [[180, 190, 200]];
        eyeColors = [[100, 180, 255], [255, 100, 100]]; // LED eyes
        features = {
          hasSeams: true,
          hasLEDs: true,
          metallic: true,
          geometric: true,
        };
        break;

      default:
        skinTones = [[220, 180, 140]];
        hairColors = [[80, 50, 30]];
        eyeColors = [[70, 50, 30]];
        features = {};
    }

    const baseSkinTone = skinTones[Math.floor(random() * skinTones.length)];
    const hairColor = hairColors[Math.floor(random() * hairColors.length)];
    const eyeColor = eyeColors[Math.floor(random() * eyeColors.length)];

    // ===== LAYER 1: BACK SHADOW (3D Depth) =====
    const shadowOffset = 3;
    const shadowAlpha = 0.5;

    // Draw shadow layer first (offset to create depth)
    for (let layer = 0; layer < 3; layer++) {
      const layerAlpha = shadowAlpha * (1 - layer * 0.2);
      const layerOffset = shadowOffset + layer * 2;

      // Head shadow ellipse
      for (let py = -50; py <= 60; py += pixelSize) {
        for (let px = -40; px <= 40; px += pixelSize) {
          const dist = Math.sqrt((px / 40) ** 2 + ((py + 10) / 55) ** 2);
          if (dist < 1) {
            drawPixel(cx + px + layerOffset, cy + py + layerOffset, 0, 0, 0, layerAlpha * (1 - dist * 0.3), pixelSize);
          }
        }
      }

      // Neck shadow
      for (let py = 55; py < 75; py += pixelSize) {
        for (let px = -18; px <= 18; px += pixelSize) {
          drawPixel(cx + px + layerOffset, cy + py + layerOffset, 0, 0, 0, layerAlpha * 0.8, pixelSize);
        }
      }
    }

    // ===== LAYER 2: NECK (3D Foundation) =====
    for (let py = 55; py < 80; py += pixelSize) {
      for (let px = -18; px <= 18; px += pixelSize) {
        // Add depth variation
        const depthVar = (px / 18) * 0.15; // Sides darker
        const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.1 + Math.abs(depthVar));

        // Micro variation
        const variation = (random() - 0.5) * 10;
        drawPixel(cx + px, cy + py, r + variation, g + variation, b + variation, 1, pixelSize);
      }
    }

    // Neck highlight (3D lighting from left)
    for (let py = 56; py < 65; py += pixelSize * 2) {
      for (let px = -15; px <= -8; px += pixelSize * 2) {
        const [r, g, b] = addHighlight(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.2);
        drawPixel(cx + px, cy + py, r, g, b, 0.7, pixelSize);
      }
    }

    // ===== LAYER 3: HEAD BASE (3D Face Structure) =====
    // Complex head shape with micro-pixels
    for (let py = -50; py <= 60; py += pixelSize) {
      for (let px = -40; px <= 40; px += pixelSize) {
        // Elliptical head shape
        const dist = Math.sqrt((px / 40) ** 2 + ((py + 10) / 55) ** 2);

        if (dist < 1) {
          // 3D depth calculation based on position
          const depth = dist * 0.25; // Edges darker
          const xDepth = (px / 40) * 0.2; // Right side slightly darker
          const yDepth = ((py + 10) / 55) * 0.1; // Bottom slightly darker

          const totalDepth = depth + Math.abs(xDepth) + yDepth;

          // Base skin color with depth
          let [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], totalDepth);

          // Micro-variation for realistic skin texture (hundreds of tiny pixels)
          const microVar = (random() - 0.5) * 15;
          r += microVar;
          g += microVar;
          b += microVar;

          // Pore details (random darker spots)
          if (random() > 0.97) {
            r *= 0.9;
            g *= 0.9;
            b *= 0.9;
          }

          drawPixel(cx + px, cy + py, r, g, b, 1, pixelSize);
        }
      }
    }

    // ===== LAYER 4: 3D HIGHLIGHTS (Lighting from upper-left) =====
    for (let py = -40; py <= 10; py += pixelSize) {
      for (let px = -30; px <= -5; px += pixelSize) {
        const dist = Math.sqrt((px / 25) ** 2 + ((py + 15) / 40) ** 2);
        if (dist < 1) {
          const [r, g, b] = addHighlight(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.25 * (1 - dist));
          drawPixel(cx + px, cy + py, r, g, b, 0.6 * (1 - dist * 0.5), pixelSize);
        }
      }
    }

    // Cheekbone highlights
    for (let px = -28; px <= 28; px += pixelSize) {
      const cheekY = 5 + Math.abs(px) / 6;
      const highlightStr = Math.max(0, 1 - Math.abs(px) / 30);
      const [r, g, b] = addHighlight(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.15 * highlightStr);
      drawPixel(cx + px, cy + cheekY, r, g, b, 0.5 * highlightStr, pixelSize * 2);
    }

    // ===== LAYER 5: FACIAL FEATURES (Maximum Detail) =====

    // EYES (Highly detailed with multiple layers)
    const eyeSpacing = 18;
    const eyeY = -8;
    const eyeWidth = 12;
    const eyeHeight = 10;

    // Draw both eyes
    [-1, 1].forEach(side => {
      const eyeX = eyeSpacing * side;

      // Eye socket shadow (3D depth)
      for (let py = eyeY - eyeHeight - 2; py <= eyeY + eyeHeight + 2; py += pixelSize) {
        for (let px = eyeX - eyeWidth - 2; px <= eyeX + eyeWidth + 2; px += pixelSize) {
          const dist = Math.sqrt(((px - eyeX) / (eyeWidth + 2)) ** 2 + ((py - eyeY) / (eyeHeight + 2)) ** 2);
          if (dist < 1) {
            const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.3 * (1 - dist));
            drawPixel(cx + px, cy + py, r, g, b, 0.8, pixelSize);
          }
        }
      }

      // Eye white
      for (let py = eyeY - eyeHeight / 2; py <= eyeY + eyeHeight / 2; py += pixelSize) {
        for (let px = eyeX - eyeWidth; px <= eyeX + eyeWidth; px += pixelSize) {
          const dist = Math.sqrt(((px - eyeX) / eyeWidth) ** 2 + ((py - eyeY) / (eyeHeight / 2)) ** 2);
          if (dist < 1) {
            const whiteColor = 240 - random() * 10; // Slight variation
            drawPixel(cx + px, cy + py, whiteColor, whiteColor - 5, whiteColor - 10, 1, pixelSize);
          }
        }
      }

      // Iris (detailed)
      const irisSize = 6;
      for (let py = eyeY - irisSize; py <= eyeY + irisSize; py += pixelSize) {
        for (let px = eyeX - irisSize; px <= eyeX + irisSize; px += pixelSize) {
          const dist = Math.sqrt(((px - eyeX) / irisSize) ** 2 + ((py - eyeY) / irisSize) ** 2);
          if (dist < 1) {
            // Radial iris patterns
            const angle = Math.atan2(py - eyeY, px - eyeX);
            const pattern = Math.sin(angle * 12) * 0.15;

            const [r, g, b] = eyeColor;
            const varR = r + pattern * 30 + (random() - 0.5) * 20;
            const varG = g + pattern * 30 + (random() - 0.5) * 20;
            const varB = b + pattern * 30 + (random() - 0.5) * 20;

            drawPixel(cx + px, cy + py, varR, varG, varB, 1, pixelSize);
          }
        }
      }

      // Pupil
      const pupilSize = 3;
      for (let py = eyeY - pupilSize; py <= eyeY + pupilSize; py += pixelSize) {
        for (let px = eyeX - pupilSize; px <= eyeX + pupilSize; px += pixelSize) {
          const dist = Math.sqrt(((px - eyeX) / pupilSize) ** 2 + ((py - eyeY) / pupilSize) ** 2);
          if (dist < 1) {
            drawPixel(cx + px, cy + py, 10, 10, 10, 1, pixelSize);
          }
        }
      }

      // Eye highlight (3D gloss)
      drawPixel(cx + eyeX - 2, cy + eyeY - 2, 255, 255, 255, 0.9, pixelSize * 2);
      drawPixel(cx + eyeX - 1, cy + eyeY - 1, 255, 255, 255, 0.7, pixelSize);

      // Eyelid shadow (upper)
      for (let px = eyeX - eyeWidth; px <= eyeX + eyeWidth; px += pixelSize) {
        for (let i = 0; i < 3; i++) {
          const py = eyeY - eyeHeight / 2 - i - 1;
          const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.2);
          drawPixel(cx + px, cy + py, r, g, b, 0.6, pixelSize);
        }
      }

      // Eyelashes (micro-details)
      if (pixelSize <= 1) {
        for (let i = 0; i < 8; i++) {
          const lashX = eyeX - eyeWidth + i * 3;
          const lashY = eyeY - eyeHeight / 2 - 2;
          drawPixel(cx + lashX, cy + lashY, 20, 15, 10, 0.8, pixelSize);
          drawPixel(cx + lashX, cy + lashY - 1, 20, 15, 10, 0.5, pixelSize);
        }
      }
    });

    // EYEBROWS (Detailed with individual hair-like strokes)
    if (features.hasEyebrows) {
      [-1, 1].forEach(side => {
        const browX = eyeSpacing * side;
        const browY = eyeY - 15;

        for (let px = browX - 14; px <= browX + 10; px += pixelSize) {
          // Curved eyebrow shape
          const curvature = -Math.pow((px - browX) / 10, 2) * 3;
          const browHeight = browY + curvature;

          // Multiple rows for thickness
          for (let thickness = 0; thickness < 3; thickness++) {
            const py = browHeight + thickness * pixelSize;
            const [r, g, b] = hairColor;

            // Random gaps for hair-like appearance
            if (random() > 0.3) {
              const hairVar = (random() - 0.5) * 15;
              drawPixel(cx + px, cy + py, r + hairVar, g + hairVar, b + hairVar, 0.85, pixelSize);
            }
          }
        }
      });
    }

    // NOSE (3D structure with multiple depth levels)
    const noseY = 10;

    // Nose bridge (highlight)
    for (let py = -5; py <= noseY + 8; py += pixelSize) {
      for (let px = -3; px <= 3; px += pixelSize) {
        const width = 2 + Math.abs(py - noseY / 2) * 0.3;
        if (Math.abs(px) <= width) {
          const [r, g, b] = addHighlight(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.15);
          drawPixel(cx + px, cy + py, r, g, b, 0.7, pixelSize);
        }
      }
    }

    // Nose tip (rounded)
    for (let py = noseY + 5; py <= noseY + 12; py += pixelSize) {
      for (let px = -5; px <= 5; px += pixelSize) {
        const dist = Math.sqrt((px / 5) ** 2 + ((py - noseY - 8) / 4) ** 2);
        if (dist < 1) {
          const depthFactor = dist * 0.15;
          const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], depthFactor);
          drawPixel(cx + px, cy + py, r, g, b, 1, pixelSize);
        }
      }
    }

    // Nostrils (3D depth)
    [-1, 1].forEach(side => {
      const nostrilX = 4 * side;
      const nostrilY = noseY + 10;

      for (let py = nostrilY; py <= nostrilY + 3; py += pixelSize) {
        for (let px = nostrilX - 2; px <= nostrilX + 2; px += pixelSize) {
          const dist = Math.sqrt(((px - nostrilX) / 2) ** 2 + ((py - nostrilY - 1.5) / 1.5) ** 2);
          if (dist < 1) {
            const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.6);
            drawPixel(cx + px, cy + py, r, g, b, 1, pixelSize);
          }
        }
      }
    });

    // Nose sides shadow (3D contour)
    [-1, 1].forEach(side => {
      for (let py = noseY - 2; py <= noseY + 12; py += pixelSize) {
        for (let px = 6 * side; px <= 10 * side; px += pixelSize * side) {
          const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.2);
          drawPixel(cx + px, cy + py, r, g, b, 0.5, pixelSize);
        }
      }
    });

    // MOUTH (Highly detailed lips with 3D structure)
    const mouthY = 35;
    const mouthWidth = 25;

    // Upper lip (3D curved)
    for (let px = -mouthWidth; px <= mouthWidth; px += pixelSize) {
      const cupidsBow = -Math.abs(px) * 0.08 + 2; // Cupid's bow curve
      const lipThickness = 4 - Math.abs(px) / 10;

      for (let thick = 0; thick < lipThickness; thick += pixelSize) {
        const py = mouthY + cupidsBow - thick;

        // Lip color (darker/redder than skin)
        const lipShade = thick / lipThickness;
        const [r, g, b] = baseSkinTone;
        const lipR = Math.min(255, r * 0.9 + 60 * (1 - lipShade));
        const lipG = Math.min(255, g * 0.7 + 30 * (1 - lipShade));
        const lipB = Math.min(255, b * 0.7 + 30 * (1 - lipShade));

        drawPixel(cx + px, cy + py, lipR, lipG, lipB, 1, pixelSize);
      }
    }

    // Lower lip (3D curved, lighter highlight)
    for (let px = -mouthWidth + 3; px <= mouthWidth - 3; px += pixelSize) {
      const curve = Math.abs(px) * 0.06;
      const lipThickness = 5 - Math.abs(px) / 12;

      for (let thick = 0; thick < lipThickness; thick += pixelSize) {
        const py = mouthY + 2 + curve + thick;

        const lipShade = thick / lipThickness;
        const [r, g, b] = baseSkinTone;

        // Lower lip is lighter (catches light)
        const lipR = Math.min(255, r * 0.95 + 50 * (1 - lipShade) + 20);
        const lipG = Math.min(255, g * 0.75 + 25 * (1 - lipShade) + 10);
        const lipB = Math.min(255, b * 0.75 + 25 * (1 - lipShade) + 10);

        drawPixel(cx + px, cy + py, lipR, lipG, lipB, 1, pixelSize);
      }
    }

    // Mouth corner shadows
    [-1, 1].forEach(side => {
      for (let i = 0; i < 3; i++) {
        const cornerX = (mouthWidth - 2) * side;
        const cornerY = mouthY + 1;
        const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.3);
        drawPixel(cx + cornerX + i * side, cy + cornerY + i, r, g, b, 0.7, pixelSize);
      }
    });

    // Lip highlight (glossy 3D effect)
    for (let px = -15; px <= 15; px += pixelSize * 2) {
      const highlightY = mouthY + 4 + Math.abs(px) * 0.05;
      const [r, g, b] = addHighlight(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.3);
      drawPixel(cx + px, cy + highlightY, r, g, b, 0.4, pixelSize);
    }

    // EARS (3D structure with depth)
    [-1, 1].forEach(side => {
      const earX = 38 * side;
      const earY = 0;
      const earWidth = 8;
      const earHeight = 20;

      // Ear shadow
      for (let py = earY - earHeight / 2; py <= earY + earHeight / 2; py += pixelSize) {
        for (let px = earX - earWidth * side; px <= earX; px += pixelSize * side) {
          const dist = Math.sqrt(((px - earX) / earWidth) ** 2 + ((py - earY) / (earHeight / 2)) ** 2);
          if (dist < 1) {
            const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.25);
            drawPixel(cx + px, cy + py, r, g, b, 0.8, pixelSize);
          }
        }
      }

      // Ear inner detail (darker)
      for (let py = earY - 6; py <= earY + 6; py += pixelSize) {
        for (let px = earX - 4 * side; px <= earX - 2 * side; px += pixelSize * side) {
          const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.4);
          drawPixel(cx + px, cy + py, r, g, b, 1, pixelSize);
        }
      }
    });

    // HAIR (Complex layered strands with hundreds of pixels)
    const hairStyle = randomInt(1, 5);

    // Hair shadow behind head
    for (let py = -60; py <= 20; py += pixelSize) {
      for (let px = -50; px <= 50; px += pixelSize) {
        const hairDist = Math.sqrt((px / 50) ** 2 + ((py + 20) / 60) ** 2);
        if (hairDist < 1 && hairDist > 0.85) {
          const [r, g, b] = hairColor;
          const variation = (random() - 0.5) * 25;
          const alpha = 0.6 + random() * 0.3;
          drawPixel(cx + px, cy + py, r + variation, g + variation, b + variation, alpha, pixelSize);
        }
      }
    }

    // Detailed hair strands
    for (let strand = 0; strand < 150; strand++) {
      const startX = (random() - 0.5) * 80;
      const startY = -55 + random() * 30;
      const strandLength = 15 + random() * 25;
      const strandCurve = (random() - 0.5) * 2;

      const [r, g, b] = hairColor;
      const strandShade = (random() - 0.5) * 30;

      for (let i = 0; i < strandLength; i += pixelSize) {
        const x = startX + strandCurve * i * 0.1;
        const y = startY + i;
        const alpha = 0.7 + random() * 0.3;

        drawPixel(cx + x, cy + y, r + strandShade, g + strandShade, b + strandShade, alpha, pixelSize);
      }
    }

    // FACIAL HAIR (if male human)
    if (features.hasBeard) {
      const beardDensity = 200;
      const [r, g, b] = hairColor;

      // Beard area
      for (let i = 0; i < beardDensity; i++) {
        const beardX = (random() - 0.5) * 50;
        const beardY = 25 + random() * 35;

        // Check if in beard region (chin, jaw)
        if (Math.abs(beardY - 40) < 20 && Math.abs(beardX) < 30) {
          const beardAlpha = 0.4 + random() * 0.4;
          const beardShade = (random() - 0.5) * 20;

          drawPixel(cx + beardX, cy + beardY, r + beardShade, g + beardShade, b + beardShade, beardAlpha, pixelSize);

          // Add a bit of length
          if (random() > 0.7) {
            drawPixel(cx + beardX, cy + beardY + 1, r + beardShade, g + beardShade, b + beardShade, beardAlpha * 0.8, pixelSize);
          }
        }
      }
    }

    // SKIN DETAILS (Freckles, moles, wrinkles)
    if (features.hasFreckles) {
      for (let i = 0; i < 30; i++) {
        const freckleX = (random() - 0.5) * 60;
        const freckleY = -20 + random() * 40;

        const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.25);
        drawPixel(cx + freckleX, cy + freckleY, r, g, b, 0.6, pixelSize * 2);
      }
    }

    // Wrinkles/expression lines (micro-details)
    if (features.hasWrinkles) {
      // Forehead lines
      for (let line = 0; line < 3; line++) {
        const lineY = -30 - line * 5;
        for (let px = -25; px <= 25; px += pixelSize * 2) {
          const curve = Math.sin(px * 0.1) * 2;
          const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.15);
          drawPixel(cx + px, cy + lineY + curve, r, g, b, 0.4, pixelSize);
        }
      }

      // Crow's feet (around eyes)
      [-1, 1].forEach(side => {
        for (let i = 0; i < 5; i++) {
          const lineStartX = (eyeSpacing + 12) * side;
          const lineStartY = eyeY - 8 + i * 3;
          for (let len = 0; len < 8; len++) {
            const lineX = lineStartX + len * side;
            const lineY = lineStartY + len * 0.3;
            const [r, g, b] = addDepthShadow(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.12);
            drawPixel(cx + lineX, cy + lineY, r, g, b, 0.35, pixelSize);
          }
        }
      });
    }

    // Scar (if present)
    if (features.hasScarLeft) {
      const scarStartX = -25;
      const scarStartY = -15;
      for (let i = 0; i < 25; i++) {
        const scarX = scarStartX + i * 0.8;
        const scarY = scarStartY + i * 1.2 + Math.sin(i * 0.5) * 2;

        // Scar is lighter
        const [r, g, b] = addHighlight(0, 0, baseSkinTone[0], baseSkinTone[1], baseSkinTone[2], 0.2);
        drawPixel(cx + scarX, cy + scarY, r, g, b, 0.7, pixelSize);

        // Scar edges darker
        drawPixel(cx + scarX + 1, cy + scarY, r * 0.9, g * 0.9, b * 0.9, 0.5, pixelSize);
      }
    }

    // ===== LAYER 6: SPACE PILOT EQUIPMENT (Helmet, Visor, Breathing Apparatus) =====
    // Add realistic space pilot gear with retro sci-fi aesthetic

    const helmetColor = [120, 130, 140]; // Metallic gray
    const visorColor = [60, 120, 180]; // Blue tint
    const breathingApparatusColor = [100, 110, 120]; // Dark gray

    // HELMET - Covers upper head and sides
    // Helmet back rim (behind head)
    for (let py = -55; py <= 30; py += pixelSize) {
      for (let px = -48; px <= -42; px += pixelSize) {
        const dist = Math.sqrt((px / 48) ** 2 + ((py + 12) / 58) ** 2);
        if (dist > 0.85 && dist < 1.1) {
          const [r, g, b] = addDepthShadow(0, 0, helmetColor[0], helmetColor[1], helmetColor[2], 0.4);
          const microVar = (random() - 0.5) * 8;
          drawPixel(cx + px, cy + py, r + microVar, g + microVar, b + microVar, 0.95, pixelSize);
        }
      }
      for (let px = 42; px <= 48; px += pixelSize) {
        const dist = Math.sqrt((px / 48) ** 2 + ((py + 12) / 58) ** 2);
        if (dist > 0.85 && dist < 1.1) {
          const [r, g, b] = addDepthShadow(0, 0, helmetColor[0], helmetColor[1], helmetColor[2], 0.3);
          const microVar = (random() - 0.5) * 8;
          drawPixel(cx + px, cy + py, r + microVar, g + microVar, b + microVar, 0.95, pixelSize);
        }
      }
    }

    // Helmet top dome
    for (let py = -60; py <= -45; py += pixelSize) {
      for (let px = -42; px <= 42; px += pixelSize) {
        const dist = Math.sqrt((px / 42) ** 2 + ((py + 55) / 8) ** 2);
        if (dist < 1) {
          const depthFactor = Math.abs(px / 42) * 0.2;
          const [r, g, b] = addDepthShadow(0, 0, helmetColor[0], helmetColor[1], helmetColor[2], 0.15 + depthFactor);
          const microVar = (random() - 0.5) * 8;
          drawPixel(cx + px, cy + py, r + microVar, g + microVar, b + microVar, 0.95, pixelSize);
        }
      }
    }

    // Helmet highlight (3D metallic shine)
    for (let py = -58; py <= -48; py += pixelSize * 2) {
      for (let px = -25; px <= -10; px += pixelSize * 2) {
        const [r, g, b] = addHighlight(0, 0, helmetColor[0], helmetColor[1], helmetColor[2], 0.4);
        drawPixel(cx + px, cy + py, r, g, b, 0.6, pixelSize);
      }
    }

    // Helmet seams and panel lines (retro detail)
    for (let px = -40; px <= 40; px += pixelSize) {
      drawPixel(cx + px, cy - 50, helmetColor[0] * 0.5, helmetColor[1] * 0.5, helmetColor[2] * 0.5, 0.9, pixelSize);
    }
    [-1, 1].forEach(side => {
      for (let py = -55; py <= -20; py += pixelSize) {
        drawPixel(cx + (35 * side), cy + py, helmetColor[0] * 0.6, helmetColor[1] * 0.6, helmetColor[2] * 0.6, 0.8, pixelSize);
      }
    });

    // VISOR - Reflective transparent covering over eyes and upper face
    const visorTop = -45;
    const visorBottom = 15;
    const visorLeft = -38;
    const visorRight = 38;

    // Visor frame (metallic border)
    for (let px = visorLeft - 2; px <= visorRight + 2; px += pixelSize) {
      // Top frame
      for (let i = 0; i < 3; i++) {
        drawPixel(cx + px, cy + visorTop + i, helmetColor[0] * 0.7, helmetColor[1] * 0.7, helmetColor[2] * 0.7, 0.95, pixelSize);
      }
      // Bottom frame
      for (let i = 0; i < 2; i++) {
        drawPixel(cx + px, cy + visorBottom + i, helmetColor[0] * 0.8, helmetColor[1] * 0.8, helmetColor[2] * 0.8, 0.95, pixelSize);
      }
    }

    // Side frames
    for (let py = visorTop; py <= visorBottom; py += pixelSize) {
      [-1, 1].forEach(side => {
        const frameX = side > 0 ? visorRight : visorLeft;
        for (let i = 0; i < 2; i++) {
          drawPixel(cx + frameX + i * side, cy + py, helmetColor[0] * 0.7, helmetColor[1] * 0.7, helmetColor[2] * 0.7, 0.95, pixelSize);
        }
      });
    }

    // Visor glass (semi-transparent blue tint with reflections)
    for (let py = visorTop + 3; py <= visorBottom - 2; py += pixelSize) {
      for (let px = visorLeft + 2; px <= visorRight - 2; px += pixelSize) {
        // Curved visor shape
        const curveDist = Math.abs(px) / visorRight;
        const curveDepth = Math.sqrt(1 - curveDist * curveDist) * 0.3;

        // Blue tint with transparency
        const alpha = 0.4 + curveDepth * 0.2;
        const [r, g, b] = visorColor;
        const microVar = (random() - 0.5) * 10;

        drawPixel(cx + px, cy + py, r + microVar, g + microVar, b + microVar, alpha, pixelSize);
      }
    }

    // Visor reflections (environmental reflections - horizontal streaks)
    for (let py = visorTop + 5; py <= visorTop + 12; py += pixelSize * 3) {
      for (let px = visorLeft + 5; px <= visorRight - 5; px += pixelSize) {
        const reflectionStrength = 1 - Math.abs(px) / visorRight;
        const [r, g, b] = addHighlight(0, 0, visorColor[0], visorColor[1], visorColor[2], 0.5);
        drawPixel(cx + px, cy + py, r, g, b, 0.3 * reflectionStrength, pixelSize);
      }
    }

    // Visor highlight (bright glare spot - upper left)
    for (let py = visorTop + 8; py <= visorTop + 18; py += pixelSize) {
      for (let px = visorLeft + 8; px <= visorLeft + 22; px += pixelSize) {
        const dist = Math.sqrt(((px - (visorLeft + 15)) / 10) ** 2 + ((py - (visorTop + 13)) / 8) ** 2);
        if (dist < 1) {
          const alpha = (1 - dist) * 0.6;
          drawPixel(cx + px, cy + py, 255, 255, 255, alpha, pixelSize);
        }
      }
    }

    // BREATHING APPARATUS - Lower face mask/respirator
    const maskTop = 20;
    const maskBottom = 55;
    const maskWidth = 32;

    // Mask body (covers mouth and nose area)
    for (let py = maskTop; py <= maskBottom; py += pixelSize) {
      for (let px = -maskWidth; px <= maskWidth; px += pixelSize) {
        const dist = Math.sqrt((px / maskWidth) ** 2 + ((py - 37) / 20) ** 2);
        if (dist < 1) {
          const depthFactor = Math.abs(px / maskWidth) * 0.25 + (py - maskTop) / (maskBottom - maskTop) * 0.15;
          const [r, g, b] = addDepthShadow(0, 0, breathingApparatusColor[0], breathingApparatusColor[1], breathingApparatusColor[2], depthFactor);
          const microVar = (random() - 0.5) * 8;
          drawPixel(cx + px, cy + py, r + microVar, g + microVar, b + microVar, 0.98, pixelSize);
        }
      }
    }

    // Mask highlight (metallic shine on left side)
    for (let py = maskTop + 5; py <= maskTop + 20; py += pixelSize * 2) {
      for (let px = -maskWidth + 5; px <= -maskWidth + 15; px += pixelSize * 2) {
        const [r, g, b] = addHighlight(0, 0, breathingApparatusColor[0], breathingApparatusColor[1], breathingApparatusColor[2], 0.3);
        drawPixel(cx + px, cy + py, r, g, b, 0.5, pixelSize);
      }
    }

    // Air filters (side vents - hexagonal pattern)
    [-1, 1].forEach(side => {
      const filterX = maskWidth * 0.7 * side;
      const filterY = maskTop + 15;

      // Hexagonal vent pattern
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          const hexX = filterX + (col - 1) * 4;
          const hexY = filterY + row * 4 + (col % 2) * 2;

          // Draw small hexagon
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hx = hexX + Math.cos(angle) * 1.5;
            const hy = hexY + Math.sin(angle) * 1.5;
            drawPixel(cx + hx, cy + hy, 40, 45, 50, 0.9, pixelSize);
          }
        }
      }
    });

    // Breathing tube connectors (sides of mask)
    [-1, 1].forEach(side => {
      const tubeX = maskWidth * 0.9 * side;
      const tubeY = maskTop + 18;

      // Circular connector
      for (let py = tubeY - 5; py <= tubeY + 5; py += pixelSize) {
        for (let px = tubeX - 3; px <= tubeX + 3; px += pixelSize) {
          const dist = Math.sqrt(((px - tubeX) / 3) ** 2 + ((py - tubeY) / 5) ** 2);
          if (dist < 1) {
            const [r, g, b] = addDepthShadow(0, 0, 80, 85, 90, dist * 0.3);
            drawPixel(cx + px, cy + py, r, g, b, 0.95, pixelSize);
          }
        }
      }

      // Connector highlight
      drawPixel(cx + tubeX - (side), cy + tubeY - 2, 180, 185, 190, 0.7, pixelSize * 2);
    });

    // Mask seam lines (retro detail)
    for (let px = -maskWidth; px <= maskWidth; px += pixelSize) {
      // Horizontal seams
      drawPixel(cx + px, cy + maskTop + 10, breathingApparatusColor[0] * 0.5, breathingApparatusColor[1] * 0.5, breathingApparatusColor[2] * 0.5, 0.8, pixelSize);
      drawPixel(cx + px, cy + maskTop + 25, breathingApparatusColor[0] * 0.5, breathingApparatusColor[1] * 0.5, breathingApparatusColor[2] * 0.5, 0.8, pixelSize);
    }

    // Vertical center seam
    for (let py = maskTop; py <= maskBottom; py += pixelSize) {
      drawPixel(cx, cy + py, breathingApparatusColor[0] * 0.6, breathingApparatusColor[1] * 0.6, breathingApparatusColor[2] * 0.6, 0.7, pixelSize);
    }

    // Status LED indicators on mask (small lights)
    [-8, 0, 8].forEach((offset, idx) => {
      const ledX = offset;
      const ledY = maskTop + 5;
      const ledColors = [[100, 255, 100], [100, 255, 100], [255, 200, 100]]; // Green, green, amber
      const [r, g, b] = ledColors[idx];

      // LED glow
      for (let py = ledY - 1; py <= ledY + 1; py += pixelSize) {
        for (let px = ledX - 1; px <= ledX + 1; px += pixelSize) {
          drawPixel(cx + px, cy + py, r, g, b, 0.8, pixelSize);
        }
      }

      // LED core (bright)
      drawPixel(cx + ledX, cy + ledY, 255, 255, 255, 0.9, pixelSize);
    });

    // ===== LAYER 7: AMBIENT OCCLUSION (Final 3D depth pass) =====
    // Darken creases and folds for enhanced depth

    // Under chin shadow
    for (let px = -18; px <= 18; px += pixelSize) {
      const shadowY = 54 + Math.abs(px) * 0.1;
      drawPixel(cx + px, cy + shadowY, 0, 0, 0, 0.3, pixelSize);
    }

    // Nasolabial folds (smile lines)
    [-1, 1].forEach(side => {
      for (let i = 0; i < 20; i++) {
        const foldX = 12 * side + i * 0.5 * side;
        const foldY = noseY + 5 + i * 1.5;
        drawPixel(cx + foldX, cy + foldY, 0, 0, 0, 0.2, pixelSize);
      }
    });

  }, [type, gender, seed, width, height, pixelSize, role, showRole]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        imageRendering: 'pixelated',
        border: '3px solid rgba(100, 180, 255, 0.4)',
        boxShadow: '0 0 20px rgba(100, 180, 255, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.8), 0 6px 12px rgba(0, 0, 0, 0.9)',
      }}
    />
  );
};

export default Enhanced3DPortrait;
