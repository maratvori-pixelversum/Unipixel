import { useEffect, useState } from 'react';
import { CRT_EFFECTS } from '../theme';
import './CRTOverlay.css';

/**
 * CRT Overlay - Adds vintage horror CRT monitor effects
 * - Scanlines
 * - Phosphor glow
 * - Screen curvature
 * - Chromatic aberration
 * - Static/noise
 * - Flicker
 * - Vignette
 */
const CRTOverlay = ({ enabled = true, intensity = 1.0 }) => {
  const [flicker, setFlicker] = useState(1);
  const [glitch, setGlitch] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    // Flicker effect - subtle brightness variation
    const flickerInterval = setInterval(() => {
      const variation = 1 - (Math.random() * CRT_EFFECTS.flickerIntensity * intensity);
      setFlicker(variation);
    }, CRT_EFFECTS.flickerSpeed);

    // Occasional glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance
        setGlitch(Math.random() * 5);
        setTimeout(() => setGlitch(0), 50);
      }
    }, CRT_EFFECTS.glitchSpeed);

    return () => {
      clearInterval(flickerInterval);
      clearInterval(glitchInterval);
    };
  }, [enabled, intensity]);

  if (!enabled) return null;

  return (
    <div className="crt-overlay" style={{ opacity: intensity }}>
      {/* Scanlines */}
      <div
        className="crt-scanlines"
        style={{
          opacity: CRT_EFFECTS.scanlineOpacity,
          backgroundSize: `100% ${CRT_EFFECTS.scanlineHeight}px`
        }}
      />

      {/* Phosphor glow */}
      <div
        className="crt-glow"
        style={{
          filter: `blur(${CRT_EFFECTS.glowBlur}px)`,
          opacity: CRT_EFFECTS.glowIntensity
        }}
      />

      {/* Static noise */}
      <div
        className="crt-noise"
        style={{ opacity: CRT_EFFECTS.noiseOpacity }}
      />

      {/* Flicker effect */}
      <div
        className="crt-flicker"
        style={{ opacity: 1 - flicker }}
      />

      {/* Vignette (dark edges) */}
      <div
        className="crt-vignette"
        style={{ opacity: CRT_EFFECTS.vignetteStrength }}
      />

      {/* Screen curvature (CSS transform) */}
      <div
        className="crt-curve"
        style={{
          transform: `perspective(1000px)
                     rotateX(${glitch * 0.1}deg)
                     rotateY(${glitch * 0.1}deg)`
        }}
      />

      {/* Chromatic aberration on edges */}
      <div className="crt-chromatic" />
    </div>
  );
};

export default CRTOverlay;
