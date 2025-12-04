import { useEffect, useRef } from 'react';

/**
 * PixelatedTexture - Generates heavily pixelated retro textures for UI backgrounds
 * Creates thousands of tiny pixels for authentic retro sci-fi aesthetic
 */
const PixelatedTexture = ({
  width = 800,
  height = 600,
  pixelSize = 2,
  pattern = 'metal', // 'metal', 'rust', 'circuit', 'panel', 'noise'
  baseColor = '#2a3a4a',
  animate = false,
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

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Disable smoothing for pixelated effect
    ctx.imageSmoothingEnabled = false;

    const generateTexture = (time = 0) => {
      // Parse base color
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 42, g: 58, b: 74 };
      };

      const rgb = hexToRgb(baseColor);

      // Generate pixelated texture
      for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
          let variation = 0;

          switch (pattern) {
            case 'metal':
              // Brushed metal effect
              variation = (Math.random() * 30 - 15) + Math.sin(x * 0.1) * 5;
              break;

            case 'rust':
              // Rusty, corroded surface
              const rustNoise = Math.random() * 60 - 30;
              const rustPattern = Math.sin(x * 0.05) * Math.cos(y * 0.07) * 20;
              variation = rustNoise + rustPattern;
              // Add rust spots
              if (Math.random() > 0.95) {
                variation += 40; // Orange rust spots
              }
              break;

            case 'circuit':
              // Circuit board pattern
              const gridX = x % 20 < 2;
              const gridY = y % 20 < 2;
              variation = (gridX || gridY) ? 30 : Math.random() * 15 - 7.5;
              // Add random circuit traces
              if (Math.random() > 0.98) {
                variation += 50;
              }
              break;

            case 'panel':
              // Paneled surface with seams
              const seamX = x % 80 < 3;
              const seamY = y % 80 < 3;
              variation = (seamX || seamY) ? -20 : Math.random() * 10 - 5;
              // Add rivet holes
              if ((x % 80 < 6 && x % 80 > 3) && (y % 80 < 6 && y % 80 > 3)) {
                variation = -30;
              }
              break;

            case 'noise':
            default:
              // Pure noise
              variation = Math.random() * 40 - 20;
              break;
          }

          // Animation
          if (animate) {
            variation += Math.sin(time * 0.001 + x * 0.01 + y * 0.01) * 5;
          }

          // Apply variation to base color
          const r = Math.max(0, Math.min(255, rgb.r + variation));
          const g = Math.max(0, Math.min(255, rgb.g + variation));
          const b = Math.max(0, Math.min(255, rgb.b + variation));

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    };

    if (animate) {
      let lastTime = 0;
      const animateTexture = (time) => {
        if (time - lastTime > 50) { // Update every 50ms
          generateTexture(time);
          lastTime = time;
        }
        animationRef.current = requestAnimationFrame(animateTexture);
      };
      animationRef.current = requestAnimationFrame(animateTexture);
    } else {
      generateTexture();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, pixelSize, pattern, baseColor, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`pixelated-texture ${className}`}
      style={{
        imageRendering: 'pixelated',
        imageRendering: '-moz-crisp-edges',
        imageRendering: 'crisp-edges',
        ...style,
      }}
    />
  );
};

export default PixelatedTexture;
