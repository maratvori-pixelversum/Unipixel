import { useState, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { BOX_CHARS } from '../theme';
import './TerminalButton.css';

/**
 * TerminalButton - Horror-themed button with touch support
 * Supports primary/secondary styles, icons, and disabled state
 * Mobile-friendly with larger touch targets
 */
const TerminalButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  icon = null,
  fullWidth = false,
  glowing = false,
  className = '',
  ...props
}) => {
  const { theme } = useContext(ThemeContext);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // Get border characters based on variant
  const getChars = () => {
    if (variant === 'primary') {
      return {
        tl: BOX_CHARS.rTopLeft,
        tr: BOX_CHARS.rTopRight,
        bl: BOX_CHARS.rBottomLeft,
        br: BOX_CHARS.rBottomRight,
        h: BOX_CHARS.sHorizontal,
        v: BOX_CHARS.sVertical,
      };
    } else {
      return {
        tl: BOX_CHARS.sTopLeft,
        tr: BOX_CHARS.sTopRight,
        bl: BOX_CHARS.sBottomLeft,
        br: BOX_CHARS.sBottomRight,
        h: BOX_CHARS.sHorizontal,
        v: BOX_CHARS.sVertical,
      };
    }
  };

  const chars = getChars();

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleTouchStart = (e) => {
    if (!disabled) {
      setIsTouched(true);
      setIsPressed(true);
      // Prevent mouse events from firing
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    setIsTouched(false);
    setIsPressed(false);
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  const handleClick = (e) => {
    // Only fire if not touched (prevent double-firing on mobile)
    if (!isTouched && !disabled && onClick) {
      onClick(e);
    }
  };

  const getVariantColors = () => {
    switch (variant) {
      case 'danger':
        return {
          bg: theme.danger,
          border: theme.warning,
          text: theme.text,
          glow: theme.glowStrong,
        };
      case 'secondary':
        return {
          bg: theme.secondary,
          border: theme.border,
          text: theme.textDim,
          glow: theme.glow,
        };
      default: // primary
        return {
          bg: theme.primary,
          border: theme.accent,
          text: theme.text,
          glow: theme.glowStrong,
        };
    }
  };

  const colors = getVariantColors();

  return (
    <button
      className={`terminal-button ${variant} ${size} ${
        disabled ? 'disabled' : ''
      } ${isPressed ? 'pressed' : ''} ${glowing ? 'glowing' : ''} ${
        fullWidth ? 'full-width' : ''
      } ${className}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      disabled={disabled}
      style={{
        '--btn-bg': colors.bg,
        '--btn-border': colors.border,
        '--btn-text': colors.text,
        '--btn-glow': colors.glow,
      }}
      {...props}
    >
      {/* Top border */}
      <span className="btn-border btn-top">
        <span className="corner">{chars.tl}</span>
        <span className="horizontal">{chars.h}</span>
        <span className="corner">{chars.tr}</span>
      </span>

      {/* Button content */}
      <span className="btn-content">
        <span className="btn-side-border">{chars.v}</span>
        <span className="btn-inner">
          {icon && <span className="btn-icon">{icon}</span>}
          <span className="btn-text">{children}</span>
        </span>
        <span className="btn-side-border">{chars.v}</span>
      </span>

      {/* Bottom border */}
      <span className="btn-border btn-bottom">
        <span className="corner">{chars.bl}</span>
        <span className="horizontal">{chars.h}</span>
        <span className="corner">{chars.br}</span>
      </span>
    </button>
  );
};

export default TerminalButton;
