import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import TerminalPanel from './common/TerminalPanel';
import TerminalButton from './common/TerminalButton';
import CRTOverlay from './common/CRTOverlay';
import { SYMBOLS } from './theme';
import './StatisticsScreen.css';

/**
 * StatisticsScreen - Player statistics and achievements (Alien 1979 aesthetic)
 * Shows mission progress, combat stats, exploration data, and achievements
 */
const StatisticsScreen = ({ onClose, statistics }) => {
  const { theme, crtEnabled, crtIntensity } = useContext(ThemeContext);

  const stats = statistics || {
    // Mission stats
    totalPlaytime: 0,
    missionsCompleted: 0,
    systemsExplored: 0,
    planetsVisited: 0,
    stationsVisited: 0,
    jumpsExecuted: 0,

    // Combat stats
    enemiesDestroyed: 0,
    shotsFired: 0,
    shotsHit: 0,
    damageDealt: 0,
    damageTaken: 0,
    shieldsLost: 0,
    deaths: 0,

    // Economic stats
    totalCreditsEarned: 0,
    totalCreditsSpent: 0,
    currentCredits: 0,
    resourcesMined: 0,
    itemsPurchased: 0,
    itemsSold: 0,

    // Exploration stats
    artifactsFound: 0,
    megastructuresDiscovered: 0,
    blackholesEncountered: 0,
    asteroidsMined: 0,
    jumpGatesUsed: 0,

    // Achievements (example)
    achievements: [
      { id: 'first_jump', name: 'FIRST JUMP', description: 'Complete your first warp jump', unlocked: true },
      { id: 'explorer', name: 'EXPLORER', description: 'Visit 10 different star systems', unlocked: true },
      { id: 'combatant', name: 'COMBATANT', description: 'Destroy 25 enemy ships', unlocked: false },
      { id: 'survivor', name: 'SURVIVOR', description: 'Survive 1 hour of gameplay', unlocked: true },
      { id: 'wealthy', name: 'WEALTHY', description: 'Accumulate 10,000 credits', unlocked: false },
      { id: 'artifact_hunter', name: 'ARTIFACT HUNTER', description: 'Discover 5 ancient artifacts', unlocked: false },
    ],
  };

  const formatPlaytime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateAccuracy = () => {
    if (stats.shotsFired === 0) return '0.0';
    return ((stats.shotsHit / stats.shotsFired) * 100).toFixed(1);
  };

  const calculateKDRatio = () => {
    if (stats.deaths === 0) return stats.enemiesDestroyed.toFixed(1);
    return (stats.enemiesDestroyed / stats.deaths).toFixed(1);
  };

  const achievementProgress = () => {
    const unlocked = stats.achievements.filter(a => a.unlocked).length;
    return `${unlocked}/${stats.achievements.length}`;
  };

  const renderStatRow = (label, value, highlight = false) => (
    <div className={`stat-row ${highlight ? 'highlight' : ''}`}>
      <span className="stat-label">{label}:</span>
      <span className="stat-value">{value}</span>
    </div>
  );

  return (
    <div
      className="statistics-screen"
      style={{
        '--stats-bg': theme.background,
        '--stats-text': theme.text,
        '--stats-accent': theme.primary,
        '--stats-glow': theme.glowStrong,
        '--stats-border': theme.border,
        '--stats-success': theme.success,
      }}
    >
      <CRTOverlay enabled={crtEnabled} intensity={crtIntensity} />

      {/* Background */}
      <div className="stats-bg-effects">
        <div className="stars-field" />
      </div>

      <div className="stats-container">
        {/* Title */}
        <div className="stats-title">
          <h1>MISSION STATISTICS</h1>
          <p>EXPEDITION DATA ANALYSIS</p>
        </div>

        {/* Stats grid */}
        <div className="stats-grid">
          {/* Mission Statistics */}
          <TerminalPanel
            title="MISSION DATA"
            borderStyle="single"
            glow={true}
            depth3d={true}
            className="stats-panel"
          >
            <div className="stats-section">
              {renderStatRow('PLAYTIME', formatPlaytime(stats.totalPlaytime), true)}
              {renderStatRow('MISSIONS COMPLETED', stats.missionsCompleted)}
              {renderStatRow('SYSTEMS EXPLORED', stats.systemsExplored)}
              {renderStatRow('PLANETS VISITED', stats.planetsVisited)}
              {renderStatRow('STATIONS VISITED', stats.stationsVisited)}
              {renderStatRow('JUMPS EXECUTED', stats.jumpsExecuted)}
            </div>
          </TerminalPanel>

          {/* Combat Statistics */}
          <TerminalPanel
            title="COMBAT DATA"
            borderStyle="single"
            glow={true}
            depth3d={true}
            className="stats-panel"
          >
            <div className="stats-section">
              {renderStatRow('ENEMIES DESTROYED', stats.enemiesDestroyed, true)}
              {renderStatRow('SHOTS FIRED', stats.shotsFired)}
              {renderStatRow('SHOTS HIT', stats.shotsHit)}
              {renderStatRow('ACCURACY', `${calculateAccuracy()}%`)}
              {renderStatRow('DAMAGE DEALT', Math.floor(stats.damageDealt))}
              {renderStatRow('K/D RATIO', calculateKDRatio())}
            </div>
          </TerminalPanel>

          {/* Economic Statistics */}
          <TerminalPanel
            title="ECONOMIC DATA"
            borderStyle="single"
            glow={true}
            depth3d={true}
            className="stats-panel"
          >
            <div className="stats-section">
              {renderStatRow('CURRENT CREDITS', stats.currentCredits, true)}
              {renderStatRow('TOTAL EARNED', stats.totalCreditsEarned)}
              {renderStatRow('TOTAL SPENT', stats.totalCreditsSpent)}
              {renderStatRow('RESOURCES MINED', stats.resourcesMined)}
              {renderStatRow('ITEMS PURCHASED', stats.itemsPurchased)}
              {renderStatRow('ITEMS SOLD', stats.itemsSold)}
            </div>
          </TerminalPanel>

          {/* Exploration Statistics */}
          <TerminalPanel
            title="EXPLORATION DATA"
            borderStyle="single"
            glow={true}
            depth3d={true}
            className="stats-panel"
          >
            <div className="stats-section">
              {renderStatRow('ARTIFACTS FOUND', stats.artifactsFound, true)}
              {renderStatRow('MEGASTRUCTURES', stats.megastructuresDiscovered)}
              {renderStatRow('BLACKHOLES', stats.blackholesEncountered)}
              {renderStatRow('ASTEROIDS MINED', stats.asteroidsMined)}
              {renderStatRow('JUMP GATES USED', stats.jumpGatesUsed)}
              {renderStatRow('SYSTEMS EXPLORED', stats.systemsExplored)}
            </div>
          </TerminalPanel>
        </div>

        {/* Achievements */}
        <TerminalPanel
          title={`ACHIEVEMENTS ${achievementProgress()}`}
          width="900px"
          borderStyle="double"
          glow={true}
          depth3d={true}
          className="achievements-panel"
        >
          <div className="achievements-grid">
            {stats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">
                  {achievement.unlocked ? SYMBOLS.star : SYMBOLS.empty}
                </div>
                <div className="achievement-info">
                  <div className="achievement-name">{achievement.name}</div>
                  <div className="achievement-desc">{achievement.description}</div>
                </div>
                {achievement.unlocked && (
                  <div className="achievement-status">
                    {SYMBOLS.check} UNLOCKED
                  </div>
                )}
              </div>
            ))}
          </div>
        </TerminalPanel>

        {/* Action buttons */}
        <div className="stats-actions">
          <TerminalButton variant="primary" size="large" onClick={onClose} glowing={true}>
            CLOSE
          </TerminalButton>
        </div>
      </div>
    </div>
  );
};

export default StatisticsScreen;
