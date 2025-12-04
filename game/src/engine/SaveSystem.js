/**
 * SaveSystem - Handles game save/load functionality with LocalStorage
 *
 * Features:
 * - Manual save to multiple slots (1-10)
 * - Autosave system with configurable interval
 * - Save data validation and error recovery
 * - Export/import save files
 * - Version compatibility checking
 */

export class SaveSystem {
  constructor(game) {
    this.game = game;

    // Autosave configuration
    this.autosaveInterval = 5 * 60 * 1000; // 5 minutes in ms
    this.autosaveTimer = null;
    this.lastAutosaveTime = 0;

    // Save format version for compatibility
    this.SAVE_FORMAT_VERSION = 1;

    // Maximum number of save slots
    this.MAX_SAVE_SLOTS = 10;
  }

  /**
   * Start autosave timer
   */
  startAutosave() {
    if (this.autosaveTimer) {
      this.stopAutosave();
    }

    this.lastAutosaveTime = Date.now();
    this.autosaveTimer = setInterval(() => {
      this.saveGame('autosave', 'Autosave');
    }, this.autosaveInterval);

    console.log('[SaveSystem] Autosave started (interval: 5 minutes)');
  }

  /**
   * Stop autosave timer
   */
  stopAutosave() {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
      console.log('[SaveSystem] Autosave stopped');
    }
  }

  /**
   * Save game to specified slot
   * @param {string} slot - 'autosave', 'save_1', 'save_2', etc.
   * @param {string} saveName - User-friendly name for save
   * @returns {boolean} Success status
   */
  saveGame(slot, saveName) {
    try {
      console.log(`[SaveSystem] Saving to ${slot}: ${saveName}`);

      // Gather all game state
      const saveData = this.gatherSaveData(saveName);

      // Serialize to JSON
      const json = JSON.stringify(saveData);

      // Check size
      const sizeKB = (json.length / 1024).toFixed(2);
      console.log(`[SaveSystem] Save size: ${sizeKB} KB`);

      // PERFORMANCE FIX: Check localStorage size before saving to prevent quota exceeded crash
      // Most browsers have 5-10MB limit, we'll enforce 4MB to be safe
      const MAX_SAVE_SIZE = 4 * 1024 * 1024; // 4MB in bytes
      if (json.length > MAX_SAVE_SIZE) {
        console.error(`[SaveSystem] Save too large: ${sizeKB} KB exceeds 4MB limit`);
        if (this.game.notificationSystem) {
          this.game.notificationSystem.show('Save too large! Game state exceeds storage limit.', 'error');
        }
        return false;
      }

      // Save to localStorage
      const key = slot === 'autosave' ? 'pixelversum_autosave' : `pixelversum_${slot}`;
      localStorage.setItem(key, json);

      // Update last save timestamp
      if (this.game.lastSaveTime !== undefined) {
        this.game.lastSaveTime = Date.now();
      }

      // Show notification
      if (this.game.notificationSystem) {
        this.game.notificationSystem.show(`Game saved: ${saveName}`, 'success');
      }

      console.log(`[SaveSystem] Save successful: ${slot}`);
      return true;

    } catch (error) {
      console.error('[SaveSystem] Save failed:', error);

      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        if (this.game.notificationSystem) {
          this.game.notificationSystem.show('Save failed! Storage full.', 'error');
        }
      } else {
        if (this.game.notificationSystem) {
          this.game.notificationSystem.show('Save failed! Unknown error.', 'error');
        }
      }

      return false;
    }
  }

  /**
   * Load game from specified slot
   * @param {string} slot - 'autosave', 'save_1', 'save_2', etc.
   * @returns {boolean} Success status
   */
  loadGame(slot) {
    try {
      console.log(`[SaveSystem] Loading from ${slot}`);

      // Get save data from localStorage
      const key = slot === 'autosave' ? 'pixelversum_autosave' : `pixelversum_${slot}`;
      const json = localStorage.getItem(key);

      if (!json) {
        if (this.game.notificationSystem) {
          this.game.notificationSystem.show('No save found in this slot', 'warning');
        }
        return false;
      }

      // Parse JSON
      const saveData = JSON.parse(json);

      // Validate save data
      if (!this.validateSaveData(saveData)) {
        console.error('[SaveSystem] Save data validation failed');
        if (this.game.notificationSystem) {
          this.game.notificationSystem.show('Save data corrupted!', 'error');
        }
        return false;
      }

      // Apply save data to game
      this.applySaveData(saveData);

      // Show notification
      if (this.game.notificationSystem) {
        this.game.notificationSystem.show(`Game loaded: ${saveData.saveName}`, 'success');
      }

      console.log(`[SaveSystem] Load successful: ${slot}`);
      return true;

    } catch (error) {
      console.error('[SaveSystem] Load failed:', error);

      // Try autosave fallback if loading manual save failed
      if (slot !== 'autosave') {
        console.log('[SaveSystem] Attempting autosave fallback...');
        return this.loadGame('autosave');
      }

      if (this.game.notificationSystem) {
        this.game.notificationSystem.show('Load failed! Save corrupted.', 'error');
      }

      return false;
    }
  }

  /**
   * Gather all game state into save data object
   */
  gatherSaveData(saveName) {
    const game = this.game;
    const player = game.player;

    return {
      // === METADATA ===
      version: game.VERSION || '0.2.0',
      saveFormatVersion: this.SAVE_FORMAT_VERSION,
      saveName: saveName,
      timestamp: Date.now(),
      playtime: game.playtime || 0,
      saveType: 'manual',

      // === PLAYER DATA ===
      player: {
        callsign: player.callsign || 'PILOT',
        shipName: player.shipName || 'WANDERER',
        shipColor: player.shipColor || game.playerShipColor || 'purple',

        // Position & Movement
        x: player.x,
        y: player.y,
        vx: player.vx,
        vy: player.vy,
        rotation: player.rotation,

        // Resources
        hull: player.hull,
        maxHull: player.maxHull,
        shields: player.shields,
        maxShields: player.maxShields,
        power: player.power,
        maxPower: player.maxPower,
        fuel: player.fuel || 100,
        maxFuel: player.maxFuel || 100,
        credits: player.credits || 0,

        // Stats
        kills: player.kills || 0,
        score: player.score || 0,
        level: player.level || 1,
        experience: player.experience || 0
      },

      // === GALAXY STATE ===
      galaxy: {
        seed: game.seed,
        currentSystemIndex: game.currentSystemIndex,
        exploredSystems: game.exploredSystems || [],
        discoveredSystems: game.discoveredSystems || []
      },

      // === ECONOMY & CARGO ===
      economy: {
        cargo: game.economySystem ? game.economySystem.cargo : [],
        cargoCapacity: game.economySystem ? game.economySystem.cargoCapacity : 50,
        credits: player.credits || 0
      },

      // === FACTION RELATIONSHIPS ===
      factions: game.factionSystem ? game.factionSystem.factions : {},

      // === ARTIFACTS ===
      artifacts: {
        inventory: game.artifactSystem ? game.artifactSystem.inventory : [],
        assembled: game.artifactSystem ? game.artifactSystem.assembledArtifacts : []
      },

      // === STATISTICS ===
      stats: {
        systemsVisited: game.exploredSystems ? game.exploredSystems.length : 0,
        warpJumps: game.warpJumps || 0,
        totalDistance: game.totalDistance || 0,
        enemiesDestroyed: player.kills || 0,
        creditsEarned: game.creditsEarned || 0
      },

      // === FLAGS & PROGRESS ===
      flags: {
        tutorialCompleted: game.tutorialCompleted || false,
        firstWarpGateUsed: game.firstWarpGateUsed || false
      }
    };
  }

  /**
   * Validate save data structure and integrity
   */
  validateSaveData(saveData) {
    // Check required fields
    if (!saveData.version || !saveData.player || !saveData.galaxy) {
      console.error('[SaveSystem] Missing required fields');
      return false;
    }

    // Check player position
    if (typeof saveData.player.x !== 'number' ||
        typeof saveData.player.y !== 'number' ||
        isNaN(saveData.player.x) ||
        isNaN(saveData.player.y)) {
      console.error('[SaveSystem] Invalid player position');
      return false;
    }

    // Check galaxy seed
    if (typeof saveData.galaxy.seed !== 'number') {
      console.error('[SaveSystem] Invalid galaxy seed');
      return false;
    }

    // Version compatibility check (warn if newer version)
    const saveVersion = saveData.version.split('.')[0];
    const gameVersion = (this.game.VERSION || '0.2.0').split('.')[0];

    if (parseInt(saveVersion) > parseInt(gameVersion)) {
      console.warn('[SaveSystem] Save from newer game version, may have compatibility issues');
    }

    return true;
  }

  /**
   * Apply loaded save data to game
   */
  applySaveData(saveData) {
    const game = this.game;

    console.log('[SaveSystem] Applying save data...');

    // Apply player data
    const p = game.player;
    p.x = saveData.player.x;
    p.y = saveData.player.y;
    p.vx = saveData.player.vx;
    p.vy = saveData.player.vy;
    p.rotation = saveData.player.rotation;
    p.hull = saveData.player.hull;
    p.maxHull = saveData.player.maxHull;
    p.shields = saveData.player.shields;
    p.maxShields = saveData.player.maxShields;
    p.power = saveData.player.power;
    p.maxPower = saveData.player.maxPower;
    p.fuel = saveData.player.fuel;
    p.maxFuel = saveData.player.maxFuel;
    p.credits = saveData.player.credits;
    p.kills = saveData.player.kills;
    p.score = saveData.player.score;
    p.level = saveData.player.level || 1;
    p.experience = saveData.player.experience || 0;
    p.callsign = saveData.player.callsign || 'PILOT';
    p.shipName = saveData.player.shipName || 'WANDERER';

    // Apply galaxy state
    game.seed = saveData.galaxy.seed;
    game.currentSystemIndex = saveData.galaxy.currentSystemIndex;
    game.exploredSystems = saveData.galaxy.exploredSystems || [];
    game.discoveredSystems = saveData.galaxy.discoveredSystems || [];

    // Regenerate galaxy from seed (if galaxy generator exists)
    if (game.galaxyGenerator && typeof game.galaxyGenerator.setSeed === 'function') {
      game.galaxyGenerator.setSeed(saveData.galaxy.seed);
      game.galaxy = game.galaxyGenerator.generate();
    }

    // Load current star system
    if (typeof game.loadStarSystem === 'function') {
      game.loadStarSystem(saveData.galaxy.currentSystemIndex);
    }

    // Apply economy data
    if (game.economySystem && saveData.economy) {
      game.economySystem.cargo = saveData.economy.cargo || [];
      game.economySystem.cargoCapacity = saveData.economy.cargoCapacity || 50;
    }

    // Apply faction data
    if (game.factionSystem && saveData.factions) {
      game.factionSystem.factions = saveData.factions;
    }

    // Apply artifact data
    if (game.artifactSystem && saveData.artifacts) {
      game.artifactSystem.inventory = saveData.artifacts.inventory || [];
      game.artifactSystem.assembledArtifacts = saveData.artifacts.assembled || [];
    }

    // Apply playtime
    game.playtime = saveData.playtime || 0;

    // Apply flags
    if (saveData.flags) {
      game.tutorialCompleted = saveData.flags.tutorialCompleted || false;
      game.firstWarpGateUsed = saveData.flags.firstWarpGateUsed || false;
    }

    console.log('[SaveSystem] Save data applied successfully');
  }

  /**
   * Get list of all saves with metadata
   * @returns {Array} Array of save info objects
   */
  getSaveList() {
    const saves = [];

    // Check autosave
    const autosave = this.getSaveMetadata('autosave');
    if (autosave) {
      saves.push({ slot: 'autosave', ...autosave });
    }

    // Check manual saves
    for (let i = 1; i <= this.MAX_SAVE_SLOTS; i++) {
      const save = this.getSaveMetadata(`save_${i}`);
      if (save) {
        saves.push({ slot: `save_${i}`, slotNumber: i, ...save });
      } else {
        saves.push({ slot: `save_${i}`, slotNumber: i, empty: true });
      }
    }

    return saves;
  }

  /**
   * Get metadata for a save without fully loading it
   * @param {string} slot - Save slot name
   * @returns {Object|null} Save metadata or null if not found
   */
  getSaveMetadata(slot) {
    try {
      const key = slot === 'autosave' ? 'pixelversum_autosave' : `pixelversum_${slot}`;
      const json = localStorage.getItem(key);

      if (!json) return null;

      const saveData = JSON.parse(json);

      // Extract only metadata
      return {
        saveName: saveData.saveName,
        timestamp: saveData.timestamp,
        playtime: saveData.playtime,
        callsign: saveData.player.callsign,
        shipName: saveData.player.shipName,
        level: saveData.player.level || 1,
        credits: saveData.player.credits || 0,
        currentSystem: saveData.galaxy.currentSystemIndex,
        systemsVisited: saveData.stats ? saveData.stats.systemsVisited : 0
      };

    } catch (error) {
      console.error('[SaveSystem] Failed to read save metadata:', error);
      return null;
    }
  }

  /**
   * Delete save from slot
   * @param {string} slot - Save slot name
   */
  deleteSave(slot) {
    try {
      const key = slot === 'autosave' ? 'pixelversum_autosave' : `pixelversum_${slot}`;
      localStorage.removeItem(key);

      if (this.game.notificationSystem) {
        this.game.notificationSystem.show('Save deleted', 'success');
      }

      console.log(`[SaveSystem] Deleted save: ${slot}`);
      return true;

    } catch (error) {
      console.error('[SaveSystem] Delete failed:', error);
      return false;
    }
  }

  /**
   * Export save to downloadable file
   * @param {string} slot - Save slot name
   */
  exportSave(slot) {
    try {
      const key = slot === 'autosave' ? 'pixelversum_autosave' : `pixelversum_${slot}`;
      const json = localStorage.getItem(key);

      if (!json) {
        if (this.game.notificationSystem) {
          this.game.notificationSystem.show('No save to export', 'warning');
        }
        return false;
      }

      // Create downloadable file
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixelversum_save_${slot}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (this.game.notificationSystem) {
        this.game.notificationSystem.show('Save exported!', 'success');
      }

      console.log(`[SaveSystem] Exported save: ${slot}`);
      return true;

    } catch (error) {
      console.error('[SaveSystem] Export failed:', error);
      if (this.game.notificationSystem) {
        this.game.notificationSystem.show('Export failed!', 'error');
      }
      return false;
    }
  }

  /**
   * Import save from file
   * @param {File} file - File object from input
   * @param {string} slot - Destination save slot
   */
  importSave(file, slot) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = e.target.result;
        const saveData = JSON.parse(json);

        // Validate
        if (!this.validateSaveData(saveData)) {
          if (this.game.notificationSystem) {
            this.game.notificationSystem.show('Invalid save file!', 'error');
          }
          return;
        }

        // Save to slot
        const key = slot === 'autosave' ? 'pixelversum_autosave' : `pixelversum_${slot}`;
        localStorage.setItem(key, json);

        if (this.game.notificationSystem) {
          this.game.notificationSystem.show('Save imported!', 'success');
        }

        console.log(`[SaveSystem] Imported save to: ${slot}`);

      } catch (error) {
        console.error('[SaveSystem] Import failed:', error);
        if (this.game.notificationSystem) {
          this.game.notificationSystem.show('Import failed! Corrupted file?', 'error');
        }
      }
    };

    reader.onerror = () => {
      if (this.game.notificationSystem) {
        this.game.notificationSystem.show('Failed to read file!', 'error');
      }
    };

    reader.readAsText(file);
  }

  /**
   * Format playtime for display (converts ms to readable string)
   * @param {number} ms - Playtime in milliseconds
   * @returns {string} Formatted time string
   */
  static formatPlaytime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format timestamp for display
   * @param {number} timestamp - Unix timestamp in ms
   * @returns {string} Formatted date string
   */
  static formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
}
