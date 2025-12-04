import { useState, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { SYMBOLS } from '../theme';
import './TerminalInput.css';

/**
 * TerminalInput - Industrial terminal text input with cursor
 * Touch-friendly with validation support
 */
const TerminalInput = ({
  value = '',
  onChange,
  onBlur,
  maxLength = 50,
  placeholder = '',
  disabled = false,
  label = '',
  error = '',
  className = '',
  ...props
}) => {
  const { theme } = useContext(ThemeContext);
  const [isFocused, setIsFocused] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Cursor blink effect
  useState(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    if (onChange) onChange(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  // Show remaining characters
  const remaining = maxLength - value.length;

  return (
    <div
      className={`terminal-input-wrapper ${disabled ? 'disabled' : ''} ${
        error ? 'error' : ''
      } ${className}`}
      style={{
        '--input-bg': theme.background,
        '--input-border': theme.border,
        '--input-text': theme.text,
        '--input-accent': theme.primary,
        '--input-glow': theme.glowStrong,
        '--input-error': theme.danger,
      }}
    >
      {label && <label className="input-label">{label}</label>}

      <div className={`input-container ${isFocused ? 'focused' : ''}`}>
        <span className="input-bracket">[</span>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className="input-field"
          {...props}
        />
        {isFocused && showCursor && (
          <span className="input-cursor">{SYMBOLS.cursor}</span>
        )}
        <span className="input-bracket">]</span>
      </div>

      <div className="input-footer">
        {error && <span className="input-error-text">{error}</span>}
        {!error && maxLength && (
          <span className="input-counter">
            {remaining}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default TerminalInput;
