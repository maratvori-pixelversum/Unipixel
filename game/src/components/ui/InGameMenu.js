import { useState, useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import TerminalPanel from './common/TerminalPanel';
import TerminalButton from './common/TerminalButton';
import CRTOverlay from './common/CRTOverlay';
import { SYMBOLS } from './theme';
import './InGameMenu.css';

/**
 * InGameMenu - Pause menu during gameplay (Alien 1979 aesthetic)
 * Shown when ESC is pressed, provides navigation options
 */
const InGameMenu = ({
  onResume,
  onSave,
  onLoad,
  onSettings,
  onStatistics,
  onMainMenu,
  onQuit,
  gameData,
}) => {
  const { theme, crtEnabled, crtIntensity } = useContext(ThemeContext);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const handleQuit = () => {
    if (confirmQuit) {
      if (onQuit) onQuit();
    } else {
      setConfirmQuit(true);
      setTimeout(() => setConfirmQuit(false), 3000);
    }
  };

  const formatPlaytime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div
      className="in-game-menu"
      style={{
        '--menu-bg': theme.background,
        '--menu-text': theme.text,
        '--menu-accent': theme.primary,
        '--menu-glow': theme.glowStrong,
        '--menu-border': theme.border,
        '--menu-danger': theme.danger,
      }}
    >
      <CRTOverlay enabled={crtEnabled} intensity={crtIntensity} />

      {/* Blur background */}
      <div className="menu-backdrop" onClick={onResume} />

      <div className="menu-container">
        {/* Title */}
        <div className="menu-title">
          <h1>MISSION PAUSED</h1>
          <p>SYSTEMS ON STANDBY</p>
        </div>

        {/* Main menu panel */}
        <TerminalPanel
          title="MENU OPTIONS"
          width="600px"
          borderStyle="double"
          glow={true}
          depth3d={true}
          className="menu-panel"
        >
          <div className="menu-content">
            {/* Current mission info */}
            <div className="mission-info">
              <div className="info-row">
                <span className="info-label">CALLSIGN:</span>
                <span className="info-value">{gameData?.callsign || 'UNKNOWN'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">VESSEL:</span>
                <span className="info-value">{gameData?.shipName || 'UNNAMED'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">PLAYTIME:</span>
                <span className="info-value">
                  {formatPlaytime(gameData?.playtime || 0)}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">SYSTEMS:</span>
                <span className="info-value">{gameData?.systemsExplored || 0} EXPLORED</span>
              </div>
            </div>

            {/* Menu buttons */}
            <div className="menu-buttons">
              <TerminalButton
                variant="primary"
                size="large"
                onClick={onResume}
                glowing={true}
              >
                {SYMBOLS.arrow} RESUME MISSION
              </TerminalButton>

              <TerminalButton
                variant="secondary"
                size="large"
                onClick={onSave}
              >
                SAVE MISSION
              </TerminalButton>

              <TerminalButton
                variant="secondary"
                size="large"
                onClick={onLoad}
              >
                LOAD MISSION
              </TerminalButton>

              <TerminalButton
                variant="secondary"
                size="large"
                onClick={onSettings}
              >
                SETTINGS
              </TerminalButton>

              <TerminalButton
                variant="secondary"
                size="large"
                onClick={onStatistics}
              >
                STATISTICS
              </TerminalButton>

              <div className="button-divider" />

              <TerminalButton
                variant="secondary"
                size="large"
                onClick={onMainMenu}
              >
                RETURN TO MAIN MENU
              </TerminalButton>

              <TerminalButton
                variant="danger"
                size="large"
                onClick={handleQuit}
              >
                {confirmQuit ? 'CONFIRM QUIT?' : 'QUIT TO DESKTOP'}
              </TerminalButton>
            </div>
          </div>
        </TerminalPanel>

        {/* Footer hint */}
        <div className="menu-footer">
          <div className="footer-text">
            {SYMBOLS.arrow} PRESS ESC TO RESUME
          </div>
        </div>
      </div>
    </div>
  );
};

export default InGameMenu;
