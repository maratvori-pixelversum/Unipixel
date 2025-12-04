import { useState, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { BOX_CHARS } from '../theme';
import './TerminalSelector.css';

/**
 * TerminalSelector - Retro-styled numeric selector to replace sliders
 * Features:
 * - Discrete value selection with +/- buttons
 * - Retro CRT terminal aesthetic
 * - Touch-friendly controls
 * - Customizable min/max/step
 * - Optional value formatting
 */
const TerminalSelector = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  formatValue = (v) => v,
  description = '',
  unit = '',
  className = '',
}) => {
  const { theme } = useContext(ThemeContext);
  const [isTouched, setIsTouched] = useState(false);

  const handleDecrease = (e) => {
    e.preventDefault();
    if (!disabled) {
      const newValue = Math.max(min, value - step);
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    if (!disabled) {
      const newValue = Math.min(max, value + step);
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  // Calculate percentage for visual bar
  const percentage = ((value - min) / (max - min)) * 100;

  // Generate value ticks for display
  const generateTicks = () => {
    const numTicks = 20;
    const ticks = [];
    for (let i = 0; i < numTicks; i++) {
      const filled = (i / numTicks) * 100 < percentage;
      ticks.push(filled ? '█' : '░');
    }
    return ticks.join('');
  };

  const handleTouchStart = (e, action) => {
    setIsTouched(true);
    action(e);
  };

  const handleTouchEnd = () => {
    setIsTouched(false);
  };

  return (
    <div
      className={`terminal-selector ${disabled ? 'disabled' : ''} ${className}`}
      style={{
        '--selector-bg': theme.background,
        '--selector-border': theme.border,
        '--selector-accent': theme.primary,
        '--selector-text': theme.text,
        '--selector-dim': theme.textDim,
        '--selector-glow': theme.glow,
      }}
    >
      {/* Label */}
      {label && (
        <div className="selector-label">
          <span className="label-bracket">[</span>
          {label}
          <span className="label-bracket">]</span>
        </div>
      )}

      {/* Control container */}
      <div className="selector-control">
        {/* Decrease button */}
        <button
          className="selector-button decrease"
          onClick={handleDecrease}
          onTouchStart={(e) => handleTouchStart(e, handleDecrease)}
          onTouchEnd={handleTouchEnd}
          disabled={disabled || value <= min}
          aria-label="Decrease value"
        >
          <span className="button-border">{BOX_CHARS.sTopLeft}</span>
          <span className="button-content">◄</span>
          <span className="button-border">{BOX_CHARS.sBottomRight}</span>
        </button>

        {/* Value display area */}
        <div className="selector-display">
          {/* Top border */}
          <div className="display-border display-top">
            <span className="corner">{BOX_CHARS.sTopLeft}</span>
            <span className="horizontal">{BOX_CHARS.sHorizontal.repeat(30)}</span>
            <span className="corner">{BOX_CHARS.sTopRight}</span>
          </div>

          {/* Value and bar */}
          <div className="display-content">
            <span className="side-border">{BOX_CHARS.sVertical}</span>
            <div className="display-inner">
              <div className="value-display">
                <span className="value-number">
                  {formatValue(value)}
                  {unit && <span className="value-unit">{unit}</span>}
                </span>
              </div>
              <div className="value-bar">
                <span className="bar-ticks">{generateTicks()}</span>
              </div>
            </div>
            <span className="side-border">{BOX_CHARS.sVertical}</span>
          </div>

          {/* Bottom border */}
          <div className="display-border display-bottom">
            <span className="corner">{BOX_CHARS.sBottomLeft}</span>
            <span className="horizontal">{BOX_CHARS.sHorizontal.repeat(30)}</span>
            <span className="corner">{BOX_CHARS.sBottomRight}</span>
          </div>
        </div>

        {/* Increase button */}
        <button
          className="selector-button increase"
          onClick={handleIncrease}
          onTouchStart={(e) => handleTouchStart(e, handleIncrease)}
          onTouchEnd={handleTouchEnd}
          disabled={disabled || value >= max}
          aria-label="Increase value"
        >
          <span className="button-border">{BOX_CHARS.sTopLeft}</span>
          <span className="button-content">►</span>
          <span className="button-border">{BOX_CHARS.sBottomRight}</span>
        </button>
      </div>

      {/* Range indicator */}
      <div className="selector-range">
        <span className="range-value range-min">{formatValue(min)}{unit}</span>
        <span className="range-separator">━━━</span>
        <span className="range-value range-max">{formatValue(max)}{unit}</span>
      </div>

      {/* Description */}
      {description && (
        <div className="selector-description">
          <span className="desc-icon">►</span> {description}
        </div>
      )}
    </div>
  );
};

export default TerminalSelector;
