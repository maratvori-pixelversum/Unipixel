import { useState, useRef, useCallback, useEffect } from 'react';
import SpaceGame from './SpaceGame';
import UIManager from './ui/UIManager';
import GameStateManager from '../utils/GameStateManager';

/**
 * GameContainer - Top-level game container
 * Manages UI screens, game state, save/load operations
 */
const GameContainer = () => {
  const [showUI, setShowUI] = useState(true);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameKey, setGameKey] = useState(0); // Force new game instance when needed
  const [gameState, setGameState] = useState({
    playtime: 0,
    credits: 0,
    systemsExplored: 0,
    player: {
      callsign: 'NOVA-7',
      shipName: 'WANDERER',
      color: 'blue',
      hp: 100,
      maxHp: 100,
      shield: 100,
      maxShield: 100,
    },
    statistics: {
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

      // Achievements
      achievements: [
        { id: 'first_jump', name: 'FIRST JUMP', description: 'Complete your first warp jump', unlocked: false },
        { id: 'explorer', name: 'EXPLORER', description: 'Visit 10 different star systems', unlocked: false },
        { id: 'combatant', name: 'COMBATANT', description: 'Destroy 25 enemy ships', unlocked: false },
        { id: 'survivor', name: 'SURVIVOR', description: 'Survive 1 hour of gameplay', unlocked: false },
        { id: 'wealthy', name: 'WEALTHY', description: 'Accumulate 10,000 credits', unlocked: false },
        { id: 'artifact_hunter', name: 'ARTIFACT HUNTER', description: 'Discover 5 ancient artifacts', unlocked: false },
      ],
    },
  });

  const gameInstanceRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);
  const isInitializingRef = useRef(false); // Prevent multiple simultaneous initializations

  // Auto-save function (defined early so useEffect can reference it)
  const handleAutoSave = useCallback(() => {
    if (!isGameActive || isPaused) return;

    let currentState = gameState;
    if (gameInstanceRef.current && gameInstanceRef.current.getGameState) {
      currentState = gameInstanceRef.current.getGameState();
      setGameState(currentState);
    }

    const result = GameStateManager.autoSave(currentState);
    if (result.success) {
      console.log('Auto-save successful');
    } else {
      console.error('Auto-save failed:', result.error);
    }
  }, [isGameActive, isPaused, gameState]);

  // Setup auto-save
  useEffect(() => {
    // Don't setup autosave until game is actually running
    if (!isGameActive || isPaused || !gameInstanceRef.current) {
      return;
    }

    // Auto-save every 5 minutes
    const intervalId = setInterval(() => {
      try {
        handleAutoSave();
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 5 * 60 * 1000);

    autoSaveIntervalRef.current = intervalId;

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [isGameActive, isPaused, handleAutoSave]);

  // Handle new game start
  const handleNewGame = useCallback((setupData) => {
    // Prevent multiple simultaneous initializations
    if (isInitializingRef.current) {
      console.warn('[GameContainer] Game initialization already in progress, ignoring duplicate call');
      return;
    }

    isInitializingRef.current = true;

    try {
      // Clean up any existing game instance first
      if (gameInstanceRef.current && gameInstanceRef.current.destroy) {
        try {
          gameInstanceRef.current.destroy();
        } catch (error) {
          console.error('[GameContainer] Error destroying previous game instance:', error);
        }
        gameInstanceRef.current = null;
      }

      // Generate random seed if not provided
      const gameSeed = setupData.seed || Math.floor(Math.random() * 1000000);

      // Update game state with ALL setup data
      const newGameState = {
        // Player customization
        callsign: setupData.callsign,
        shipName: setupData.shipName,
        shipColor: setupData.shipColor,
        playerRace: setupData.playerRace,
        playerGender: setupData.playerGender,

        // Ship configuration
        shipClass: setupData.shipClass || 'explorer',

        // Faction and traits
        faction: setupData.faction || 'independent',
        trait: setupData.trait || null,

        // Galaxy settings
        galaxySize: setupData.galaxySize || 'medium',
        difficulty: setupData.difficulty || 'explorer',
        seed: gameSeed,

        // Game modes
        ironman: setupData.ironman || false,
        permadeath: setupData.permadeath || false,

        // Starting bonus
        startingBonus: setupData.startingBonus || 'credits',

        // Combat settings
        friendlyFire: setupData.friendlyFire !== undefined ? setupData.friendlyFire : true,
        combatPause: setupData.combatPause || false,

        // World settings
        randomEvents: setupData.randomEvents !== undefined ? setupData.randomEvents : true,
        encounterRate: setupData.encounterRate || 50,
        alienEncounters: setupData.alienEncounters || 50,
        pirateActivity: setupData.pirateActivity || 50,

        // Economy settings
        economyDifficulty: setupData.economyDifficulty || 50,
        resourceScarcity: setupData.resourceScarcity || 50,

        // Quality of life
        autoSave: setupData.autoSave !== undefined ? setupData.autoSave : true,
        tutorialMode: setupData.tutorialMode || false,

        // Crew settings
        crewPermadeath: setupData.crewPermadeath || false,
        crewMembers: setupData.crewMembers || [],

        // Game state
        playtime: 0,
        credits: 0, // Will be set by Game.js based on startingBonus

        // Player stats
        player: {
          callsign: setupData.callsign,
          shipName: setupData.shipName,
          color: setupData.shipColor || 'blue',
          hp: 100,
          maxHp: 100,
          shield: 100,
          maxShield: 100,
        },

        // Statistics
        statistics: {
          enemiesDestroyed: 0,
          shotsFired: 0,
          shotsHit: 0,
          damageDealt: 0,
          damageTaken: 0,
          shieldsLost: 0,
          deaths: 0,
          totalPlaytime: 0,
          missionsCompleted: 0,
          systemsExplored: 0,
          planetsVisited: 0,
          stationsVisited: 0,
          jumpsExecuted: 0,
          totalCreditsEarned: 0,
          totalCreditsSpent: 0,
          resourcesMined: 0,
          itemsPurchased: 0,
          itemsSold: 0,
          artifactsFound: 0,
          megastructuresDiscovered: 0,
          blackholesEncountered: 0,
          asteroidsMined: 0,
          jumpGatesUsed: 0,
          achievements: [
            { id: 'first_jump', name: 'FIRST JUMP', description: 'Complete your first warp jump', unlocked: false },
            { id: 'explorer', name: 'EXPLORER', description: 'Visit 10 different star systems', unlocked: false },
            { id: 'combatant', name: 'COMBATANT', description: 'Destroy 25 enemy ships', unlocked: false },
            { id: 'survivor', name: 'SURVIVOR', description: 'Survive 1 hour of gameplay', unlocked: false },
            { id: 'wealthy', name: 'WEALTHY', description: 'Accumulate 10,000 credits', unlocked: false },
            { id: 'artifact_hunter', name: 'ARTIFACT HUNTER', description: 'Discover 5 ancient artifacts', unlocked: false },
          ],
        },
      };

      // React 18 batches state updates automatically
      setGameState(newGameState);
      setGameKey(prev => prev + 1); // Force new game instance with unique key
      setShowUI(false);
      setIsGameActive(true);
      setIsPaused(false);

      // Reset initialization flag after state updates complete
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 100);
    } catch (error) {
      console.error('[GameContainer] Error in handleNewGame:', error.message);
      alert('Failed to initialize game: ' + error.message);
      setShowUI(true);
      setIsGameActive(false);
      isInitializingRef.current = false;
    }
  }, []);

  // Handle game load
  const handleLoadGame = useCallback((saveData) => {
    if (isInitializingRef.current) {
      console.warn('[GameContainer] Game initialization already in progress, ignoring duplicate call');
      return;
    }

    isInitializingRef.current = true;
    console.log('Loading game:', saveData);

    const result = GameStateManager.loadGame(saveData.id);
    if (result.success) {
      setGameState(result.gameState);
      setGameKey(prev => prev + 1); // Force new game instance with unique key
      setShowUI(false);
      setIsGameActive(true);
      setIsPaused(false);

      setTimeout(() => {
        isInitializingRef.current = false;
      }, 100);
    } else {
      console.error('Failed to load game:', result.error);
      alert(`LOAD FAILED: ${result.error}`);
      isInitializingRef.current = false;
    }
  }, []);

  // Handle game save
  const handleSaveGame = useCallback(async (saveId, saveData) => {
    console.log('Saving game:', saveId);

    // Get current game state from game instance if available
    let currentState = gameState;
    if (gameInstanceRef.current && gameInstanceRef.current.getGameState) {
      currentState = gameInstanceRef.current.getGameState();
      setGameState(currentState);
    }

    const result = GameStateManager.saveGame(saveId, currentState, saveData.name);
    if (result.success) {
      console.log('Game saved successfully');
      // Could show a success message to the user
    } else {
      console.error('Failed to save game:', result.error);
      alert(`SAVE FAILED: ${result.error}`);
    }
  }, [gameState]);

  // Handle resume game
  const handleResumeGame = useCallback(() => {
    setShowUI(false);
    setIsPaused(false);
  }, []);

  // Handle quit game
  const handleQuitGame = useCallback((quitToDesktop) => {
    console.log('Quitting game, quit to desktop:', quitToDesktop);

    // Cleanup game instance
    if (gameInstanceRef.current && gameInstanceRef.current.destroy) {
      gameInstanceRef.current.destroy();
      gameInstanceRef.current = null;
    }

    // Reset state
    setIsGameActive(false);
    setIsPaused(false);
    setShowUI(true);

    // Clear auto-save interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    // In a web context, we can't truly quit to desktop
    // Could potentially close the window or redirect
    if (quitToDesktop) {
      // window.close(); // This usually won't work due to browser security
      console.log('Quit to desktop requested (not implemented in web context)');
    }
  }, []);

  // Handle settings change
  const handleSettingsChange = useCallback((settings) => {
    console.log('Settings changed:', settings);

    // Save settings
    GameStateManager.saveSettings(settings);

    // Apply settings to game instance if it exists
    if (gameInstanceRef.current && gameInstanceRef.current.applySettings) {
      gameInstanceRef.current.applySettings(settings);
    }
  }, []);

  // Listen for game state updates from the game engine
  // FIXED: Removed state updates that cause unnecessary re-renders and potential infinite loops
  // The game state is managed by the Game instance, we don't need to sync it back to React state
  // except when explicitly saving/loading
  useEffect(() => {
    // Event listener removed - no longer needed as it was causing re-render loops
    // Game state is accessed via gameInstanceRef.current.getGameState() when needed (save/load)
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Game Canvas */}
      {isGameActive && !showUI && (
        <SpaceGame
          key={`game-${gameKey}`} // Unique key per game session to force fresh instance
          ref={gameInstanceRef}
          initialState={gameState}
          onStateChange={setGameState}
        />
      )}

      {/* UI Overlay */}
      {showUI && (
        <UIManager
          gameState={gameState}
          onNewGame={handleNewGame}
          onLoadGame={handleLoadGame}
          onSaveGame={handleSaveGame}
          onResumeGame={handleResumeGame}
          onQuitGame={handleQuitGame}
          onSettingsChange={handleSettingsChange}
          isGameActive={isGameActive}
        />
      )}

      {/* In-game menu overlay (ESC pressed) */}
      {isGameActive && isPaused && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2000,
        }}>
          <UIManager
            gameState={gameState}
            onNewGame={handleNewGame}
            onLoadGame={handleLoadGame}
            onSaveGame={handleSaveGame}
            onResumeGame={handleResumeGame}
            onQuitGame={handleQuitGame}
            onSettingsChange={handleSettingsChange}
            isGameActive={isGameActive}
          />
        </div>
      )}
    </div>
  );
};

export default GameContainer;
