import { useEffect, useRef } from 'react';

/**
 * SpaceshipPreview - Generates heavily pixelated spaceship preview images
 * Top-down isometric view with detailed pixel art
 */
const SpaceshipPreview = ({
  shipClass = 'explorer',
  color = '#4488ff',
  width = 200,
  height = 200,
  pixelSize = 2,
  showDetails = true,
  animated = true,
  className = '',
  style = {},
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = false;

    const drawPixel = (x, y, color, alpha = 1) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, pixelSize, pixelSize);
      ctx.globalAlpha = 1;
    };

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 68, g: 136, b: 255 };
    };

    const rgb = hexToRgb(color);

    const darken = (amount) => {
      return `rgb(${Math.max(0, rgb.r - amount)}, ${Math.max(0, rgb.g - amount)}, ${Math.max(0, rgb.b - amount)})`;
    };

    const lighten = (amount) => {
      return `rgb(${Math.min(255, rgb.r + amount)}, ${Math.min(255, rgb.g + amount)}, ${Math.min(255, rgb.b + amount)})`;
    };

    let engineGlowPhase = 0;

    const drawShip = () => {
      // Clear
      ctx.fillStyle = '#000814';
      ctx.fillRect(0, 0, width, height);

      // Stars in background
      for (let i = 0; i < 30; i++) {
        const x = (i * 37) % width;
        const y = (i * 53) % height;
        const size = (i % 3) + 1;
        drawPixel(x, y, 'rgba(255, 255, 255, 0.6)', 1);
      }

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-Math.PI / 4); // Isometric angle

      const ps = pixelSize;

      switch (shipClass) {
        case 'scout':
          // Small, agile scout ship
          // Cockpit
          drawPixel(-ps * 2, -ps * 8, lighten(60));
          drawPixel(-ps, -ps * 8, lighten(60));
          drawPixel(0, -ps * 8, lighten(60));

          // Main body
          for (let y = -7; y < 3; y++) {
            for (let x = -2; x < 2; x++) {
              drawPixel(x * ps, y * ps, color);
            }
          }

          // Wings (small)
          for (let x = -4; x < -2; x++) {
            for (let y = -2; y < 2; y++) {
              drawPixel(x * ps, y * ps, darken(30));
            }
          }
          for (let x = 2; x < 4; x++) {
            for (let y = -2; y < 2; y++) {
              drawPixel(x * ps, y * ps, darken(30));
            }
          }

          // Engine nozzles
          drawPixel(-ps, ps * 3, '#1a1a2e');
          drawPixel(0, ps * 3, '#1a1a2e');

          // Engine glow
          if (animated) {
            const glow = Math.sin(engineGlowPhase) * 0.5 + 0.5;
            drawPixel(-ps, ps * 4, `rgba(68, 255, 255, ${glow})`);
            drawPixel(0, ps * 4, `rgba(68, 255, 255, ${glow})`);
          }
          break;

        case 'explorer':
          // Balanced multi-role ship
          // Cockpit
          for (let x = -1; x < 2; x++) {
            drawPixel(x * ps, -ps * 10, lighten(60));
          }

          // Main hull
          for (let y = -9; y < 5; y++) {
            const width = Math.max(2, 4 - Math.abs(y + 2) / 3);
            for (let x = -width; x < width; x++) {
              drawPixel(x * ps, y * ps, color);
            }
          }

          // Side pods
          for (let y = -5; y < 3; y++) {
            drawPixel(-ps * 5, y * ps, darken(20));
            drawPixel(-ps * 4, y * ps, darken(20));
            drawPixel(ps * 4, y * ps, darken(20));
            drawPixel(ps * 5, y * ps, darken(20));
          }

          // Weapon hardpoints
          drawPixel(-ps * 5, -ps * 3, '#ff8844');
          drawPixel(ps * 5, -ps * 3, '#ff8844');

          // Engine array
          for (let x = -2; x < 3; x++) {
            drawPixel(x * ps, ps * 5, '#1a1a2e');
            if (animated) {
              const glow = Math.sin(engineGlowPhase + x * 0.5) * 0.5 + 0.5;
              drawPixel(x * ps, ps * 6, `rgba(68, 255, 255, ${glow})`);
            }
          }

          // Hull details
          if (showDetails) {
            drawPixel(0, -ps * 4, lighten(40));
            drawPixel(-ps * 2, 0, darken(40));
            drawPixel(ps * 2, 0, darken(40));
          }
          break;

        case 'fighter':
          // Heavy combat fighter
          // Cockpit (armored)
          for (let x = -1; x < 2; x++) {
            drawPixel(x * ps, -ps * 11, lighten(50));
          }

          // Heavy armor plating
          for (let y = -10; y < 6; y++) {
            const width = Math.max(2, 4 - Math.abs(y + 2) / 2.5);
            for (let x = -width; x < width; x++) {
              // Armor panels
              const panel = Math.floor(y / 3);
              const shade = (panel % 2) === 0 ? 0 : -20;
              drawPixel(x * ps, y * ps, darken(Math.abs(shade)));
            }
          }

          // Weapon pods (heavy)
          for (let y = -8; y < 4; y++) {
            for (let x = -7; x < -4; x++) {
              drawPixel(x * ps, y * ps, darken(40));
            }
            for (let x = 4; x < 7; x++) {
              drawPixel(x * ps, y * ps, darken(40));
            }
          }

          // Cannons
          for (let i = 0; i < 4; i++) {
            drawPixel(-ps * 6, -ps * (10 - i * 2), '#ff4444');
            drawPixel(ps * 6, -ps * (10 - i * 2), '#ff4444');
          }

          // Engine cluster
          for (let x = -3; x < 4; x++) {
            drawPixel(x * ps, ps * 6, '#1a1a2e');
            if (animated) {
              const glow = Math.sin(engineGlowPhase + x * 0.3) * 0.5 + 0.5;
              drawPixel(x * ps, ps * 7, `rgba(255, 100, 100, ${glow})`);
            }
          }
          break;

        case 'trader':
          // Cargo hauler
          // Small cockpit
          drawPixel(0, -ps * 8, lighten(40));

          // Large cargo sections
          for (let y = -7; y < 8; y++) {
            const width = 6;
            for (let x = -width; x < width; x++) {
              // Cargo module panels
              const moduleY = Math.floor(y / 4);
              const shade = (moduleY % 2) === 0 ? -10 : -30;
              drawPixel(x * ps, y * ps, darken(Math.abs(shade)));
            }
          }

          // Cargo containers (detail)
          if (showDetails) {
            for (let y = -6; y < 6; y += 4) {
              for (let x = -5; x < 6; x += 4) {
                drawPixel(x * ps, y * ps, '#886633');
              }
            }
          }

          // Engine pods
          drawPixel(-ps * 3, ps * 8, '#1a1a2e');
          drawPixel(ps * 3, ps * 8, '#1a1a2e');
          if (animated) {
            const glow = Math.sin(engineGlowPhase) * 0.5 + 0.5;
            drawPixel(-ps * 3, ps * 9, `rgba(68, 255, 255, ${glow})`);
            drawPixel(ps * 3, ps * 9, `rgba(68, 255, 255, ${glow})`);
          }
          break;

        case 'tank':
          // Heavy dreadnought
          // Armored command deck
          for (let x = -2; x < 3; x++) {
            drawPixel(x * ps, -ps * 12, lighten(30));
          }

          // Massive hull
          for (let y = -11; y < 8; y++) {
            const width = 7;
            for (let x = -width; x < width; x++) {
              // Heavy armor plating
              const plateY = Math.floor((y + 11) / 2);
              const shade = (plateY % 2) === 0 ? -15 : -35;
              drawPixel(x * ps, y * ps, darken(Math.abs(shade)));
            }
          }

          // Heavy weapon turrets
          for (let y = -8; y < 6; y += 6) {
            drawPixel(-ps * 8, y * ps, '#666666');
            drawPixel(ps * 8, y * ps, '#666666');
            drawPixel(-ps * 8, (y - 1) * ps, '#ff6644');
            drawPixel(ps * 8, (y - 1) * ps, '#ff6644');
          }

          // Massive engine array
          for (let x = -4; x < 5; x++) {
            for (let y = 8; y < 10; y++) {
              drawPixel(x * ps, y * ps, '#1a1a2e');
            }
            if (animated) {
              const glow = Math.sin(engineGlowPhase + x * 0.2) * 0.5 + 0.5;
              drawPixel(x * ps, ps * 10, `rgba(255, 150, 100, ${glow})`);
            }
          }
          break;

        case 'stealth':
          // Stealth/phantom ship
          // Minimal profile cockpit
          drawPixel(0, -ps * 9, lighten(20));

          // Angular stealth hull
          for (let y = -8; y < 5; y++) {
            const width = Math.max(1, 3 - Math.abs(y + 2) / 4);
            for (let x = -width; x < width; x++) {
              // Dark, low-reflection coating
              drawPixel(x * ps, y * ps, darken(60));
            }
          }

          // Angular wings
          for (let y = -4; y < 2; y++) {
            const wingWidth = Math.abs(y) + 2;
            drawPixel(-ps * wingWidth, y * ps, darken(70));
            drawPixel(ps * wingWidth, y * ps, darken(70));
          }

          // Concealed engines (dim)
          drawPixel(-ps, ps * 5, '#0a0a1a');
          drawPixel(0, ps * 5, '#0a0a1a');
          if (animated) {
            const glow = (Math.sin(engineGlowPhase) * 0.3 + 0.3) * 0.5; // Dimmer
            drawPixel(-ps, ps * 6, `rgba(100, 100, 255, ${glow})`);
            drawPixel(0, ps * 6, `rgba(100, 100, 255, ${glow})`);
          }
          break;
      }

      ctx.restore();

      // HUD overlay
      if (showDetails) {
        ctx.strokeStyle = 'rgba(68, 136, 170, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        // Targeting reticle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - 70, centerY);
        ctx.lineTo(centerX - 50, centerY);
        ctx.moveTo(centerX + 50, centerY);
        ctx.lineTo(centerX + 70, centerY);
        ctx.moveTo(centerX, centerY - 70);
        ctx.lineTo(centerX, centerY - 50);
        ctx.moveTo(centerX, centerY + 50);
        ctx.lineTo(centerX, centerY + 70);
        ctx.stroke();

        ctx.setLineDash([]);

        // Ship class label
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(shipClass.toUpperCase(), centerX, height - 10);
      }
    };

    if (animated) {
      const animate = () => {
        engineGlowPhase += 0.1;
        drawShip();
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      drawShip();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [shipClass, color, width, height, pixelSize, showDetails, animated]);

  return (
    <canvas
      ref={canvasRef}
      className={`spaceship-preview ${className}`}
      style={{
        imageRendering: 'pixelated',
        imageRendering: '-moz-crisp-edges',
        imageRendering: 'crisp-edges',
        border: '2px solid rgba(68, 136, 170, 0.5)',
        backgroundColor: '#000814',
        ...style,
      }}
    />
  );
};

export default SpaceshipPreview;
