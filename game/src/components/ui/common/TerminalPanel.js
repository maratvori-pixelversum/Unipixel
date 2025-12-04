import { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';
import { BOX_CHARS } from '../theme';
import './TerminalPanel.css';

/**
 * TerminalPanel - Horror-themed terminal panel with box-drawing borders
 * Supports double-line, single-line, and rounded corners
 * Has pixelated 3D depth effect
 */
const TerminalPanel = ({
  children,
  title = '',
  borderStyle = 'double', // 'double', 'single', 'rounded'
  width = 'auto',
  height = 'auto',
  glow = true,
  depth3d = true,
  className = '',
  style = {},
}) => {
  const { theme } = useContext(ThemeContext);

  // Select border characters based on style
  const getChars = () => {
    switch (borderStyle) {
      case 'single':
        return {
          tl: BOX_CHARS.sTopLeft,
          tr: BOX_CHARS.sTopRight,
          bl: BOX_CHARS.sBottomLeft,
          br: BOX_CHARS.sBottomRight,
          h: BOX_CHARS.sHorizontal,
          v: BOX_CHARS.sVertical,
          hd: BOX_CHARS.sHorizontalDown,
          hu: BOX_CHARS.sHorizontalUp,
        };
      case 'rounded':
        return {
          tl: BOX_CHARS.rTopLeft,
          tr: BOX_CHARS.rTopRight,
          bl: BOX_CHARS.rBottomLeft,
          br: BOX_CHARS.rBottomRight,
          h: BOX_CHARS.sHorizontal,
          v: BOX_CHARS.sVertical,
          hd: BOX_CHARS.sHorizontalDown,
          hu: BOX_CHARS.sHorizontalUp,
        };
      default: // 'double'
        return {
          tl: BOX_CHARS.topLeft,
          tr: BOX_CHARS.topRight,
          bl: BOX_CHARS.bottomLeft,
          br: BOX_CHARS.bottomRight,
          h: BOX_CHARS.horizontal,
          v: BOX_CHARS.vertical,
          hd: BOX_CHARS.horizontalDown,
          hu: BOX_CHARS.horizontalUp,
        };
    }
  };

  const chars = getChars();

  return (
    <div
      className={`terminal-panel ${depth3d ? 'depth-3d' : ''} ${
        glow ? 'glow-effect' : ''
      } ${className}`}
      style={{
        width,
        height,
        '--panel-bg': theme.background,
        '--panel-border': theme.border,
        '--panel-text': theme.text,
        '--panel-glow': theme.glowStrong,
        ...style,
      }}
    >
      {/* Top border */}
      <div className="panel-border panel-top">
        <span className="corner">{chars.tl}</span>
        {title && (
          <>
            <span className="horizontal">{chars.h.repeat(2)}</span>
            <span className="title"> {title} </span>
            <span className="horizontal flex-grow">{chars.h}</span>
          </>
        )}
        {!title && <span className="horizontal flex-grow">{chars.h}</span>}
        <span className="corner">{chars.tr}</span>
      </div>

      {/* Content area with side borders */}
      <div className="panel-content">
        <span className="panel-border-left">{chars.v}</span>
        <div className="panel-inner">{children}</div>
        <span className="panel-border-right">{chars.v}</span>
      </div>

      {/* Bottom border */}
      <div className="panel-border panel-bottom">
        <span className="corner">{chars.bl}</span>
        <span className="horizontal flex-grow">{chars.h}</span>
        <span className="corner">{chars.br}</span>
      </div>
    </div>
  );
};

export default TerminalPanel;
