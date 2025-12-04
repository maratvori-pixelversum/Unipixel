import { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { SYMBOLS } from '../theme';
import './TerminalCheckbox.css';

/**
 * TerminalCheckbox - Industrial terminal checkbox
 * Touch-friendly with keyboard support
 */
const TerminalCheckbox = ({
  checked = false,
  onChange,
  label = '',
  description = '',
  disabled = false,
  className = '',
  ...props
}) => {
  const { theme } = useContext(ThemeContext);

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      className={`terminal-checkbox ${checked ? 'checked' : ''} ${
        disabled ? 'disabled' : ''
      } ${className}`}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      style={{
        '--checkbox-text': theme.text,
        '--checkbox-accent': theme.primary,
        '--checkbox-glow': theme.glowStrong,
        '--checkbox-border': theme.border,
      }}
      {...props}
    >
      <span className="checkbox-symbol">
        {checked ? SYMBOLS.check : SYMBOLS.uncheck}
      </span>
      <div className="checkbox-content">
        <span className="checkbox-label">{label}</span>
        {description && (
          <span className="checkbox-description">{description}</span>
        )}
      </div>
    </div>
  );
};

export default TerminalCheckbox;
