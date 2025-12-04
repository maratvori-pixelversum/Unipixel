/**
 * GameStateManager - Save and load game state
 * Handles localStorage operations and game state serialization
 */

const SAVE_KEY_PREFIX = 'pixelversum_save_';
const SETTINGS_KEY = 'pixelversum_settings';
const STATISTICS_KEY = 'pixelversum_statistics';

/**
 * Save game state to localStorage
 */
export const saveGame = (saveId, gameState, saveName) => {
  try {
    const saveData = {
      id: saveId,
      name: saveName || `SAVE_${new Date().toISOString()}`,
      timestamp: Date.now(),

      // Player data
      callsign: gameState.player?.callsign || 'UNKNOWN',
      shipName: gameState.player?.shipName || 'UNNAMED',
      shipColor: gameState.player?.color || 'blue',

      // Game progress
      playtime: gameState.playtime || 0,
      currentSystem: gameState.currentSystem || null,
      systemsExplored: gameState.systemsExplored || 0,
      galaxySize: gameState.galaxySize || 'medium',
      difficulty: gameState.difficulty || 'adventurer',
      seed: gameState.seed || null,

      // Player state
      player: {
        x: gameState.player?.x || 0,
        y: gameState.player?.y || 0,
        vx: gameState.player?.vx || 0,
        vy: gameState.player?.vy || 0,
        rotation: gameState.player?.rotation || 0,
        hp: gameState.player?.hp || 100,
        maxHp: gameState.player?.maxHp || 100,
        shield: gameState.player?.shield || 100,
        maxShield: gameState.player?.maxShield || 100,
        power: gameState.player?.power || 100,
        maxPower: gameState.player?.maxPower || 100,
        fuel: gameState.player?.fuel || 100,
        maxFuel: gameState.player?.maxFuel || 100,
      },

      // Economy
      credits: gameState.credits || 0,
      cargo: gameState.cargo || [],

      // Statistics
      statistics: gameState.statistics || {
        enemiesDestroyed: 0,
        shotsFired: 0,
        shotsHit: 0,
        damageDealt: 0,
        damageTaken: 0,
        resourcesMined: 0,
        artifactsFound: 0,
        jumpsExecuted: 0,
      },

      // Status flags
      crewAlive: gameState.player?.hp > 0,
      gameOver: gameState.gameOver || false,
    };

    localStorage.setItem(`${SAVE_KEY_PREFIX}${saveId}`, JSON.stringify(saveData));
    return { success: true, saveData };
  } catch (error) {
    console.error('Failed to save game:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load game state from localStorage
 */
export const loadGame = (saveId) => {
  try {
    const saveKey = saveId.startsWith(SAVE_KEY_PREFIX)
      ? saveId
      : `${SAVE_KEY_PREFIX}${saveId}`;

    const savedData = localStorage.getItem(saveKey);
    if (!savedData) {
      throw new Error('Save file not found');
    }

    const gameState = JSON.parse(savedData);
    return { success: true, gameState };
  } catch (error) {
    console.error('Failed to load game:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all saved games
 */
export const getAllSaves = () => {
  try {
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SAVE_KEY_PREFIX)) {
        const saveData = JSON.parse(localStorage.getItem(key));
        saves.push({
          id: key.replace(SAVE_KEY_PREFIX, ''),
          ...saveData,
        });
      }
    }

    // Sort by timestamp (most recent first)
    saves.sort((a, b) => b.timestamp - a.timestamp);
    return { success: true, saves };
  } catch (error) {
    console.error('Failed to get saves:', error);
    return { success: false, error: error.message, saves: [] };
  }
};

/**
 * Delete a saved game
 */
export const deleteSave = (saveId) => {
  try {
    const saveKey = saveId.startsWith(SAVE_KEY_PREFIX)
      ? saveId
      : `${SAVE_KEY_PREFIX}${saveId}`;

    localStorage.removeItem(saveKey);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete save:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save game settings
 */
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return { success: true };
  } catch (error) {
    console.error('Failed to save settings:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load game settings
 */
export const loadSettings = () => {
  try {
    const settingsData = localStorage.getItem(SETTINGS_KEY);
    if (!settingsData) {
      return { success: true, settings: null };
    }

    const settings = JSON.parse(settingsData);
    return { success: true, settings };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { success: false, error: error.message, settings: null };
  }
};

/**
 * Save statistics
 */
export const saveStatistics = (statistics) => {
  try {
    localStorage.setItem(STATISTICS_KEY, JSON.stringify(statistics));
    return { success: true };
  } catch (error) {
    console.error('Failed to save statistics:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load statistics
 */
export const loadStatistics = () => {
  try {
    const statsData = localStorage.getItem(STATISTICS_KEY);
    if (!statsData) {
      return { success: true, statistics: null };
    }

    const statistics = JSON.parse(statsData);
    return { success: true, statistics };
  } catch (error) {
    console.error('Failed to load statistics:', error);
    return { success: false, error: error.message, statistics: null };
  }
};

/**
 * Auto-save functionality
 */
export const autoSave = (gameState) => {
  const autoSaveId = 'autosave';
  return saveGame(autoSaveId, gameState, 'AUTOSAVE');
};

/**
 * Quick save functionality
 */
export const quickSave = (gameState) => {
  const quickSaveId = 'quicksave';
  return saveGame(quickSaveId, gameState, 'QUICKSAVE');
};

/**
 * Check if auto-save exists
 */
export const hasAutoSave = () => {
  const autoSaveKey = `${SAVE_KEY_PREFIX}autosave`;
  return localStorage.getItem(autoSaveKey) !== null;
};

/**
 * Check if quick save exists
 */
export const hasQuickSave = () => {
  const quickSaveKey = `${SAVE_KEY_PREFIX}quicksave`;
  return localStorage.getItem(quickSaveKey) !== null;
};

/**
 * Export save data (for backup)
 */
export const exportSave = (saveId) => {
  try {
    const result = loadGame(saveId);
    if (!result.success) {
      throw new Error(result.error);
    }

    const dataStr = JSON.stringify(result.gameState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `pixelversum_save_${saveId}_${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Failed to export save:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Import save data (from backup)
 */
export const importSave = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const gameState = JSON.parse(e.target.result);
        const saveId = `import_${Date.now()}`;
        const result = saveGame(saveId, gameState, `IMPORTED_${gameState.name || 'SAVE'}`);

        if (result.success) {
          resolve({ success: true, saveId });
        } else {
          reject(new Error(result.error));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Clear all saves (dangerous!)
 */
export const clearAllSaves = () => {
  try {
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SAVE_KEY_PREFIX)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => localStorage.removeItem(key));
    return { success: true, deletedCount: keysToDelete.length };
  } catch (error) {
    console.error('Failed to clear saves:', error);
    return { success: false, error: error.message };
  }
};

export default {
  saveGame,
  loadGame,
  getAllSaves,
  deleteSave,
  saveSettings,
  loadSettings,
  saveStatistics,
  loadStatistics,
  autoSave,
  quickSave,
  hasAutoSave,
  hasQuickSave,
  exportSave,
  importSave,
  clearAllSaves,
};
