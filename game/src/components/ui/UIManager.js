import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './ThemeContext';
import CanvasLoadingScreen from './CanvasLoadingScreen';
// REMOVED: CanvasSystemLoadingScreen - was causing black screen and lag issues
// import CanvasSystemLoadingScreen from './CanvasSystemLoadingScreen';
import CanvasMainMenu from './CanvasMainMenu';
import CanvasNewGameSetup from './CanvasNewGameSetup';
import CanvasLoadGameScreen from './CanvasLoadGameScreen';
import CanvasSaveGameScreen from './CanvasSaveGameScreen';
import CanvasSettingsScreen from './CanvasSettingsScreen';
import InGameMenu from './InGameMenu';
import StatisticsScreen from './StatisticsScreen';
import CanvasCreditsScreen from './CanvasCreditsScreen';

/**
 * UIManager - Central UI screen management and navigation
 * Handles all screen transitions and state management
 */
const UIManager = ({
  gameState,
  onNewGame,
  onLoadGame,
  onSaveGame,
  onResumeGame,
  onQuitGame,
  onSettingsChange,
  isGameActive,
}) => {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [previousScreen, setpreviousScreen] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [settingsData, setSettingsData] = useState(null);
  // REMOVED: newGameSetupData - no longer needed without loading screen
  // const [newGameSetupData, setNewGameSetupData] = useState(null);

  // Initialize - show loading screen briefly, then main menu
  useEffect(() => {
    // PERFORMANCE FIX: Removed fake 2.5s loading delay
    // Show loading screen briefly for visual feedback, then immediately go to main menu
    const timer = setTimeout(() => {
      setLoadingProgress(100);
      setCurrentScreen('mainMenu');
    }, 300); // Just 300ms for smooth transition

    return () => clearTimeout(timer);
  }, []);

  // Listen for ESC key to show in-game menu
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        if (isGameActive && currentScreen === 'game') {
          setCurrentScreen('inGameMenu');
        } else if (currentScreen === 'inGameMenu') {
          setCurrentScreen('game');
          if (onResumeGame) onResumeGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGameActive, currentScreen, onResumeGame]);

  // Navigation handlers
  const handleNewGame = useCallback((setupData) => {
    // FIXED: Skip loading screen - directly start the game
    // The loading screen was causing black screen and lag issues
    if (onNewGame) {
      onNewGame(setupData);
    }
    setCurrentScreen('game');
  }, [onNewGame]);

  const handleSystemLoadingComplete = useCallback((setupData) => {
    // DEPRECATED: No longer used - loading screen removed
    // Loading complete - now create the actual game
    if (onNewGame) {
      onNewGame(setupData);
    }
    setCurrentScreen('game');
    // setNewGameSetupData(null); // REMOVED: state no longer exists
  }, [onNewGame]);

  const handleLoadGame = useCallback((saveData) => {
    if (onLoadGame) {
      onLoadGame(saveData);
    }
    setCurrentScreen('game');
  }, [onLoadGame]);

  const handleSaveGame = useCallback(async (saveId, saveData) => {
    if (onSaveGame) {
      await onSaveGame(saveId, saveData);
    }
    // Return to in-game menu after saving
    setCurrentScreen('inGameMenu');
  }, [onSaveGame]);

  const handleResumeGame = useCallback(() => {
    setCurrentScreen('game');
    if (onResumeGame) onResumeGame();
  }, [onResumeGame]);

  const handleReturnToMainMenu = useCallback(() => {
    if (window.confirm('RETURN TO MAIN MENU? UNSAVED PROGRESS WILL BE LOST.')) {
      setCurrentScreen('mainMenu');
      if (onQuitGame) onQuitGame(false);
    }
  }, [onQuitGame]);

  const handleQuitToDesktop = useCallback(() => {
    if (window.confirm('QUIT TO DESKTOP? UNSAVED PROGRESS WILL BE LOST.')) {
      if (onQuitGame) onQuitGame(true);
      // In a web context, we can't truly quit, so just return to main menu
      setCurrentScreen('mainMenu');
    }
  }, [onQuitGame]);

  const handleSettingsApply = useCallback((settings) => {
    setSettingsData(settings);
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [onSettingsChange]);

  // Navigation from main menu
  const handleMainMenuNewGame = () => setCurrentScreen('newGameSetup');
  const handleMainMenuLoadGame = () => setCurrentScreen('loadGame');
  const handleMainMenuSettings = () => {
    setpreviousScreen('mainMenu');
    setCurrentScreen('settings');
  };
  const handleMainMenuCredits = () => setCurrentScreen('credits');
  const handleMainMenuQuit = () => {
    if (window.confirm('QUIT TO DESKTOP?')) {
      if (onQuitGame) onQuitGame(true);
    }
  };

  // Navigation from in-game menu
  const handleInGameSave = () => setCurrentScreen('saveGame');
  const handleInGameLoad = () => setCurrentScreen('loadGame');
  const handleInGameSettings = () => {
    setpreviousScreen('inGameMenu');
    setCurrentScreen('settings');
  };
  const handleInGameStatistics = () => setCurrentScreen('statistics');

  // Back navigation
  const handleBackToMainMenu = () => setCurrentScreen('mainMenu');
  const handleBackToInGameMenu = () => setCurrentScreen('inGameMenu');
  const handleBackFromSettings = () => {
    setCurrentScreen(previousScreen || 'mainMenu');
    setpreviousScreen(null);
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return <CanvasLoadingScreen progress={loadingProgress} />;

      case 'mainMenu':
        return (
          <CanvasMainMenu
            onNewGame={handleMainMenuNewGame}
            onContinue={null}
            onLoadGame={handleMainMenuLoadGame}
            onSettings={handleMainMenuSettings}
            onCredits={handleMainMenuCredits}
            onExit={handleMainMenuQuit}
          />
        );

      case 'newGameSetup':
        return (
          <CanvasNewGameSetup
            onStart={handleNewGame}
            onCancel={handleBackToMainMenu}
          />
        );

      // REMOVED: systemLoading screen - was causing black screen and lag issues
      // Now transitions directly from newGameSetup to game
      // case 'systemLoading':
      //   return (
      //     <CanvasSystemLoadingScreen
      //       setupData={newGameSetupData}
      //       onComplete={handleSystemLoadingComplete}
      //     />
      //   );

      case 'loadGame':
        return (
          <CanvasLoadGameScreen
            onLoad={handleLoadGame}
            onCancel={
              previousScreen === 'inGameMenu'
                ? handleBackToInGameMenu
                : handleBackToMainMenu
            }
          />
        );

      case 'saveGame':
        return (
          <CanvasSaveGameScreen
            onSave={handleSaveGame}
            onCancel={handleBackToInGameMenu}
            gameData={gameState}
          />
        );

      case 'settings':
        return (
          <CanvasSettingsScreen
            onClose={handleBackFromSettings}
            onApply={handleSettingsApply}
          />
        );

      case 'inGameMenu':
        return (
          <InGameMenu
            onResume={handleResumeGame}
            onSave={handleInGameSave}
            onLoad={handleInGameLoad}
            onSettings={handleInGameSettings}
            onStatistics={handleInGameStatistics}
            onMainMenu={handleReturnToMainMenu}
            onQuit={handleQuitToDesktop}
            gameData={gameState}
          />
        );

      case 'statistics':
        return (
          <StatisticsScreen
            onClose={handleBackToInGameMenu}
            statistics={gameState?.statistics}
          />
        );

      case 'credits':
        return (
          <CanvasCreditsScreen
            onClose={handleBackToMainMenu}
          />
        );

      case 'game':
        // Game is rendered outside UIManager, so return null
        return null;

      default:
        return (
          <CanvasMainMenu
            onNewGame={handleMainMenuNewGame}
            onContinue={null}
            onLoadGame={handleMainMenuLoadGame}
            onSettings={handleMainMenuSettings}
            onCredits={handleMainMenuCredits}
            onExit={handleMainMenuQuit}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      {renderScreen()}
    </ThemeProvider>
  );
};

export default UIManager;
