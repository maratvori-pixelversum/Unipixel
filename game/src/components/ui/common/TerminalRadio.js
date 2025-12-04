import { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { SYMBOLS } from '../theme';
import './TerminalRadio.css';

/**
 * TerminalRadio - Industrial terminal radio button group
 * Touch-friendly with keyboard navigation
 */
const TerminalRadio = ({
  options = [],
  value,
  onChange,
  name,
  disabled = false,
  className = '',
}) => {
  const { theme } = useContext(ThemeContext);

  const handleChange = (optionValue) => {
    if (!disabled && onChange) {
      onChange(optionValue);
    }
  };

  const handleKeyDown = (e, optionValue) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      handleChange(optionValue);
    }
  };

  return (
    <div
      className={`terminal-radio-group ${disabled ? 'disabled' : ''} ${className}`}
      style={{
        '--radio-text': theme.text,
        '--radio-accent': theme.primary,
        '--radio-glow': theme.glowStrong,
        '--radio-border': theme.border,
      }}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <div
            key={option.value}
            className={`radio-option ${isSelected ? 'selected' : ''} ${
              isDisabled ? 'disabled' : ''
            }`}
            onClick={() => !isDisabled && handleChange(option.value)}
            onKeyDown={(e) => !isDisabled && handleKeyDown(e, option.value)}
            tabIndex={isDisabled ? -1 : 0}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isDisabled}
          >
            <span className="radio-symbol">
              {isSelected ? SYMBOLS.radio : SYMBOLS.radioEmpty}
            </span>
            <span className="radio-label">{option.label}</span>
            {option.description && (
              <span className="radio-description">{option.description}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TerminalRadio;
