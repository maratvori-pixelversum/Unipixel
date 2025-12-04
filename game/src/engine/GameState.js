/**
 * GameState - Centralized state management for the Pixelversum game
 *
 * This class encapsulates all game state in one place, making it easier to:
 * - Save and load game state
 * - Reason about state changes
 * - Debug state issues
 * - Extract state management from the monolithic Game class
 *
 * ARCHITECTURE: This is step 1 of refactoring - creating the state container.
 * Future steps will gradually move state from Game.js into this class.
 */

export class GameState {
  constructor(config = {}) {
    // Game version for save compatibility
    this.VERSION = '0.2.0';

    // Game configuration (from setup screen)
    this.config = {
      // Player customization
      callsign: config.callsign || 'NOVA-7',
      shipName: config.shipName || 'WANDERER',
      shipColor: config.shipColor || 'blue',
      shipClass: config.shipClass || 'explorer',
      playerRace: config.playerRace || 'human',
      playerGender: config.playerGender || 'male',

      // Faction and traits
      faction: config.faction || 'independent',
      trait: config.trait || null,

      // Galaxy settings
      galaxySize: config.galaxySize || 'medium',
      difficulty: config.difficulty || 'adventurer',
      seed: config.seed || Math.floor(Math.random() * 1000000),

      // Gameplay options
      ironman: config.ironman || false,
      permadeath: config.permadeath || false,
      startingBonus: config.startingBonus || 'balanced',
      friendlyFire: config.friendlyFire || false,
      randomEvents: config.randomEvents !== undefined ? config.randomEvents : 50,
      encounterRate: config.encounterRate !== undefined ? config.encounterRate : 50,
      economyDifficulty: config.economyDifficulty !== undefined ? config.economyDifficulty : 50,
      resourceScarcity: config.resourceScarcity !== undefined ? config.resourceScarcity : 50,
      alienEncounters: config.alienEncounters !== undefined ? config.alienEncounters : 50,
      pirateActivity: config.pirateActivity !== undefined ? config.pirateActivity : 50,

      // Quality of life
      autoSave: config.autoSave !== undefined ? config.autoSave : true,
      tutorialMode: config.tutorialMode !== undefined ? config.tutorialMode : true,
      combatPause: config.combatPause !== undefined ? config.combatPause : false,
      crewPermadeath: config.crewPermadeath !== undefined ? config.crewPermadeath : false,

      // Crew members
      crewMembers: config.crewMembers || {
        engineer: { race: 'human', gender: 'male', seed: 11111 },
        pilot: { race: 'human', gender: 'female', seed: 22222 },
        scientist: { race: 'alien_grey', gender: 'other', seed: 33333 },
        medic: { race: 'human', gender: 'female', seed: 44444 },
      }
    };

    // Playtime tracking
    this.playtime = 0; // Total playtime in milliseconds
    this.sessionStartTime = Date.now();

    // Current scene
    this.scene = 'system'; // 'system', 'interstellar', 'galaxy'

    // Game flags
    this.gameOver = false;
    this.isPaused = false;

    // Galaxy navigation
    this.currentSystemSeed = this.config.seed;
    this.currentSystemIndex = 0;
    this.discoveredSystems = new Set([this.config.seed]);

    // Interstellar position (for galaxy map navigation)
    this.interstellarPlayerX = 0;
    this.interstellarPlayerY = 0;

    // Player state
    this.player = {
      // Position and movement
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      rotation: 0,

      // Ship status
      hull: 100,
      maxHull: 100,
      shields: 50,
      maxShields: 50,
      power: 100,
      maxPower: 100,
      fuel: 100,
      maxFuel: 100,
      temperature: 20,
      heatStatus: 'safe',

      // Ship state flags
      shieldActive: false,
      heatDamage: false,
      docked: false,
      landed: false,
      mining: false,

      // Ship capabilities (based on ship class)
      maxSpeed: 10,
      acceleration: 0.3,
      rotationSpeed: 0.05,
      weaponDamage: 10,
      weaponCooldown: 200,
      lastFireTime: 0,

      // Resources and cargo
      cargo: {},
      cargoCapacity: 100,
      money: 1000,
      reputation: {},

      // Ship upgrades
      upgrades: {
        engine: 0,
        shields: 0,
        weapons: 0,
        cargo: 0,
        mining: 0,
        scanner: 0
      },

      // Collected artifacts
      artifacts: []
    };

    // Current system state (entities in the current star system)
    this.system = {
      seed: this.config.seed,
      data: null, // System data from EnhancedSystemGenerator

      // Star
      star: { x: 0, y: 0, radius: 400, mass: 10000 },

      // Celestial bodies
      planets: [],
      asteroidBelts: [],
      asteroids: [],
      comets: [],

      // Structures
      stations: [],
      megastructures: [],
      warpGates: [],

      // Entities
      enemies: [],
      alienConvoys: [],

      // Items
      artifacts: []
    };

    // Active projectiles and effects
    this.projectiles = [];
    this.particles = [];
    this.explosions = [];

    // UI state
    this.ui = {
      // Screen states
      showInventory: false,
      showTrading: false,
      showDiplomacy: false,
      showGalaxyMap: false,
      showSaveScreen: false,
      showLoadScreen: false,
      showStatistics: false,

      // Selected tabs
      selectedTab: 'cargo', // For inventory: cargo, artifacts, ship
      selectedTradeTab: 'buy', // For trading: buy, sell, refuel
      selectedFaction: null, // For diplomacy screen
      selectedSaveSlot: null, // For save/load screens

      // Interaction state
      hoveredItem: null,
      scrollOffset: 0,

      // Pop-up system
      showPopup: false,
      popupType: null, // 'planet', 'station', 'convoy', 'asteroid', etc.
      popupTarget: null, // The celestial body/entity object
      popupButtons: [], // Available action buttons

      // Notifications and warnings
      gravityWarning: null,
      tidalWarning: 0,
      heatWarning: false,

      // Autosave indicator
      autosaving: false,
      autosaveIndicatorTime: 0
    };

    // Statistics tracking
    this.statistics = {
      totalDistance: 0,
      systemsExplored: 0,
      enemiesDestroyed: 0,
      planetsScanned: 0,
      artifactsFound: 0,
      stationsVisited: 0,
      resourcesMined: 0,
      tradesMade: 0,
      deaths: 0,
      saves: 0,
      loads: 0
    };

    // Quest and mission state
    this.quests = {
      active: [],
      completed: [],
      failed: []
    };

    // Settings (can be changed during gameplay)
    this.settings = {
      // Graphics
      showParticles: true,
      showScreenEffects: true,
      showStars: true,
      performanceMode: false,

      // Controls
      mouseControl: false,
      invertY: false,
      edgeScroll: true,
      keyboardSpeed: 1.0,

      // Gameplay
      autoSaveEnabled: this.config.autoSave,
      autoSaveInterval: 5 * 60 * 1000, // 5 minutes
      pauseOnLostFocus: true,
      showTutorials: this.config.tutorialMode,

      // UI
      uiScale: 1.0,
      showMinimap: true,
      showFPS: false
    };
  }

  /**
   * Get the complete state as a serializable object for saving
   */
  toJSON() {
    return {
      version: this.VERSION,
      config: this.config,
      playtime: this.playtime + (Date.now() - this.sessionStartTime),
      scene: this.scene,
      gameOver: this.gameOver,
      currentSystemSeed: this.currentSystemSeed,
      currentSystemIndex: this.currentSystemIndex,
      discoveredSystems: Array.from(this.discoveredSystems),
      interstellarPlayerX: this.interstellarPlayerX,
      interstellarPlayerY: this.interstellarPlayerY,
      player: this.player,
      system: {
        seed: this.system.seed,
        // Note: system.data is regenerated from seed on load
      },
      ui: {
        // Only save persistent UI state
        selectedTab: this.ui.selectedTab,
        selectedTradeTab: this.ui.selectedTradeTab
      },
      statistics: this.statistics,
      quests: this.quests,
      settings: this.settings
    };
  }

  /**
   * Restore state from a saved JSON object
   */
  static fromJSON(data) {
    const state = new GameState(data.config);

    state.playtime = data.playtime || 0;
    state.sessionStartTime = Date.now(); // Reset session start
    state.scene = data.scene || 'system';
    state.gameOver = data.gameOver || false;
    state.currentSystemSeed = data.currentSystemSeed;
    state.currentSystemIndex = data.currentSystemIndex || 0;
    state.discoveredSystems = new Set(data.discoveredSystems || []);
    state.interstellarPlayerX = data.interstellarPlayerX || 0;
    state.interstellarPlayerY = data.interstellarPlayerY || 0;

    // Restore player state
    if (data.player) {
      state.player = { ...state.player, ...data.player };
    }

    // Restore system seed (system will be regenerated from seed)
    if (data.system) {
      state.system.seed = data.system.seed;
    }

    // Restore UI state
    if (data.ui) {
      state.ui.selectedTab = data.ui.selectedTab || 'cargo';
      state.ui.selectedTradeTab = data.ui.selectedTradeTab || 'buy';
    }

    // Restore statistics
    if (data.statistics) {
      state.statistics = { ...state.statistics, ...data.statistics };
    }

    // Restore quests
    if (data.quests) {
      state.quests = { ...state.quests, ...data.quests };
    }

    // Restore settings
    if (data.settings) {
      state.settings = { ...state.settings, ...data.settings };
    }

    return state;
  }

  /**
   * Update playtime counter
   */
  updatePlaytime() {
    const now = Date.now();
    this.playtime += (now - this.sessionStartTime);
    this.sessionStartTime = now;
  }

  /**
   * Reset state for a new game (useful for testing)
   */
  reset() {
    const config = this.config;
    Object.assign(this, new GameState(config));
  }

  /**
   * Helper methods for common state operations
   */

  // Player helpers
  isDocked() {
    return this.player.docked;
  }

  isLanded() {
    return this.player.landed;
  }

  canWarp() {
    return this.player.fuel > 10 && !this.isDocked() && !this.isLanded();
  }

  canMine() {
    return this.player.upgrades.mining > 0;
  }

  // System helpers
  getCurrentSystem() {
    return this.system;
  }

  isInSystem() {
    return this.scene === 'system';
  }

  isInInterstellar() {
    return this.scene === 'interstellar';
  }

  // UI helpers
  isAnyMenuOpen() {
    return this.ui.showInventory ||
           this.ui.showTrading ||
           this.ui.showDiplomacy ||
           this.ui.showGalaxyMap ||
           this.ui.showSaveScreen ||
           this.ui.showLoadScreen ||
           this.ui.showStatistics;
  }

  closeAllMenus() {
    this.ui.showInventory = false;
    this.ui.showTrading = false;
    this.ui.showDiplomacy = false;
    this.ui.showGalaxyMap = false;
    this.ui.showSaveScreen = false;
    this.ui.showLoadScreen = false;
    this.ui.showStatistics = false;
    this.ui.showPopup = false;
  }

  // Statistics helpers
  incrementStat(statName, amount = 1) {
    if (this.statistics.hasOwnProperty(statName)) {
      this.statistics[statName] += amount;
    }
  }

  // Resource helpers
  addCargo(item, amount) {
    const current = this.player.cargo[item] || 0;
    const total = current + amount;
    const capacity = this.player.cargoCapacity;

    if (total <= capacity) {
      this.player.cargo[item] = total;
      return amount;
    } else {
      const added = capacity - current;
      this.player.cargo[item] = capacity;
      return added;
    }
  }

  removeCargo(item, amount) {
    const current = this.player.cargo[item] || 0;
    const removed = Math.min(current, amount);
    this.player.cargo[item] = current - removed;

    if (this.player.cargo[item] === 0) {
      delete this.player.cargo[item];
    }

    return removed;
  }

  getTotalCargoUsed() {
    return Object.values(this.player.cargo).reduce((sum, amount) => sum + amount, 0);
  }

  getCargoSpace() {
    return this.player.cargoCapacity - this.getTotalCargoUsed();
  }

  // Money helpers
  addMoney(amount) {
    this.player.money += amount;
  }

  removeMoney(amount) {
    if (this.player.money >= amount) {
      this.player.money -= amount;
      return true;
    }
    return false;
  }

  canAfford(amount) {
    return this.player.money >= amount;
  }

  // Reputation helpers
  addReputation(faction, amount) {
    if (!this.player.reputation[faction]) {
      this.player.reputation[faction] = 0;
    }
    this.player.reputation[faction] += amount;
  }

  getReputation(faction) {
    return this.player.reputation[faction] || 0;
  }
}
