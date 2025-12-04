import { RETRO_PALETTE } from './constants.js';
import { SeededRandom } from '../utils/SeededRandom.js';
import { GalaxyGenerator } from './GalaxyGenerator.js';
import { AdvancedPhysics } from './AdvancedPhysics.js';
import { EnhancedSystemGenerator } from './EnhancedSystemGenerator.js';
import { SCALE_SYSTEM, DISTANCE_SYSTEM, getSystemSize } from './ScaleSystem.js';
import { Megastructure } from './Megastructure.js';
import { AlienShip } from './AlienShip.js';
import { WeaponSystem, updateProjectile } from './WeaponSystem.js';
import { ShieldSystem } from './ShieldSystem.js';
import { InertialMovement } from './InertialMovement.js';
import { BlackholeRenderer } from './BlackholeRenderer.js';
import { BlackHoleWarpEffect } from './BlackHoleWarpEffect.js';
import { StellarRenderer } from './StellarRenderer.js';
import { CollisionSystem } from './CollisionSystem.js';
import { StationRenderer } from './StationRenderer.js';
import { InterstellarRenderer } from './InterstellarRenderer.js';
import { AsteroidRenderer } from './AsteroidRenderer.js';
import { MobileControls } from './MobileControls.js';
import { ResourceSystem } from './ResourceSystem.js';
import { CargoSystem } from './CargoSystem.js';
import { MiningSystem } from './MiningSystem.js';
import { AlienRaceSystem } from './AlienRaceSystem.js';
import { AlienShipRenderer } from './AlienShipRenderer.js';
import { FactionSystem } from './FactionSystem.js';
import { EconomySystem } from './EconomySystem.js';
import { WarpGateSystem } from './WarpGateSystem.js';
import { ArtifactSystem } from './ArtifactSystem.js';
import { UIRenderer } from './UIRenderer.js';
import { InteractionSystem } from './InteractionSystem.js';
import { SaveSystem } from './SaveSystem.js';
// Enhanced systems
import { PerformanceOptimizer } from './PerformanceOptimizer.js';
import { EnhancedEffects } from './EnhancedEffects.js';
import { RetroScreenEffects } from './RetroScreenEffects.js';
import { ENHANCED_ARTIFACTS, generateRandomArtifact } from './EnhancedItems.js';
// PERFORMANCE: Optimized rendering and particle systems
import { OptimizedRenderer } from './OptimizedRenderer.js';
import { ParticleManager } from './ParticleManager.js';
import { ThrusterEffects } from './ThrusterEffects.js';
// SPRITES: High-performance sprite-based rendering system
import { SpriteManager } from './sprites/SpriteManager.js';
// REALISTIC UPGRADE: New systems for enhanced realism
import { SpaceEnvironmentRenderer } from './SpaceEnvironmentRenderer.js';
import { CelestialRotation } from './CelestialRotation.js';
import { OrbitalMechanics } from './OrbitalMechanics.js';
import { ShipDamageSystem } from './ShipDamageSystem.js';
import { EnvironmentalHazards } from './EnvironmentalHazards.js';
// PERFORMANCE OPTIMIZATION: LOD and Object Pooling
import { LODSystem } from './LODSystem.js';
import { PoolManager } from './ObjectPool.js';
// HUD RENDERING: Extracted from Game.js for better organization
import { HUDRenderer } from './HUDRenderer.js';
// SHIP RENDERING: Extracted from Game.js for better organization
import { ShipRenderer } from './ShipRenderer.js';
// PHYSICS ENGINE: Extracted from Game.js for better organization
import { PhysicsEngine } from './PhysicsEngine.js';

/**
 * Main Game class that handles the entire game loop, rendering, physics, and game state.
 * Manages player, enemies, celestial bodies, and all game entities.
 */
export class Game {
  /**
   * Safely convert alpha value to 2-digit hex string (clamped to 0-255)
   */
  static alphaToHex(alpha) {
    return Math.max(0, Math.min(255, Math.floor(alpha))).toString(16).padStart(2, '0');
  }

  /**
   * Get or create a cached gradient (PERFORMANCE FIX)
   * Avoids creating the same gradient every frame
   */
  getCachedGradient(ctx, key, createFn) {
    if (!this.gradientCache) {
      this.gradientCache = new Map();
    }

    if (!this.gradientCache.has(key)) {
      this.gradientCache.set(key, createFn(ctx));
    }

    return this.gradientCache.get(key);
  }

  /**
   * Add particle with automatic bounds checking (PERFORMANCE FIX)
   * Prevents memory leaks from unbounded particle arrays
   */
  addParticle(particle) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();  // Remove oldest particle
    }
    this.particles.push(particle);
  }

  /**
   * Add projectile with automatic bounds checking (PERFORMANCE FIX)
   * Prevents memory leaks from unbounded projectile arrays
   */
  addProjectile(projectile) {
    const maxProjectiles = 100;  // Reasonable limit
    if (this.projectiles.length >= maxProjectiles) {
      this.projectiles.shift();  // Remove oldest projectile
    }
    this.projectiles.push(projectile);
  }

  constructor(canvas, config = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    // CRITICAL: Disable image smoothing for crisp pixelated graphics
    // Must be set every frame as canvas operations can reset it
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;

    this.width = 1920;
    this.height = 1080;
    this.scale = Math.min(window.innerWidth / this.width, window.innerHeight / this.height);

    canvas.width = this.width;
    canvas.height = this.height;
    canvas.style.width = `${this.width * this.scale}px`;
    canvas.style.height = `${this.height * this.scale}px`;

    // Game version for save compatibility
    this.VERSION = '0.2.0';

    // Playtime tracking
    this.playtime = 0; // Total playtime in milliseconds
    this.sessionStartTime = Date.now();

    // NEW GAME SETUP OPTIONS: Apply configuration from setup screen
    this.gameConfig = {
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
      difficulty: config.difficulty || 'explorer',
      seed: config.seed || 12345,

      // Game modes
      ironman: config.ironman || false,
      permadeath: config.permadeath || false,

      // Rewards
      startingBonus: config.startingBonus || 'balanced',

      // Combat settings
      friendlyFire: config.friendlyFire || false,
      combatPause: config.combatPause || false,

      // World settings
      randomEvents: config.randomEvents || 'normal',
      encounterRate: config.encounterRate || 'normal',
      alienEncounters: config.alienEncounters || 'normal',
      pirateActivity: config.pirateActivity || 'normal',

      // Economy
      economyDifficulty: config.economyDifficulty || 'normal',
      resourceScarcity: config.resourceScarcity || 'normal',

      // Quality of life
      autoSave: config.autoSave !== undefined ? config.autoSave : true,
      tutorialMode: config.tutorialMode || false,

      // Crew settings
      crewPermadeath: config.crewPermadeath || false,
      crewMembers: config.crewMembers || [],
    };

    // Economy - apply starting bonus
    const startingCreditsMap = {
      'minimal': 500,
      'balanced': 1000,
      'comfortable': 2000,
      'wealthy': 5000,
    };
    this.credits = startingCreditsMap[this.gameConfig.startingBonus] || 1000;
    this.cargo = [];

    // Statistics tracking
    this.statistics = {
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
    };

    // Settings (defaults) - apply from config
    this.mouseSensitivity = 1.0;
    this.invertY = false;
    this.edgeScroll = true;
    this.keyboardSpeed = 1.0;
    this.autoSaveEnabled = this.gameConfig.autoSave;
    this.autoSaveInterval = 5 * 60 * 1000; // 5 minutes
    this.pauseOnLostFocus = true;
    this.showTutorials = this.gameConfig.tutorialMode;
    this.uiScale = 1.0;

    // Game state flags
    this.gameOver = false;

    this.entities = new Map();
    this.particles = [];
    this.projectiles = [];
    this.stars = [];
    this.asteroids = [];
    this.enemies = [];
    this.explosions = [];
    this.planets = [];
    this.stations = [];

    // PERFORMANCE FIX: Cache gradients to avoid creating them every frame
    this.gradientCache = new Map();

    this.time = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.scene = 'system';
    // Use configured seed from game setup
    const startingSeed = this.gameConfig.seed;
    this.currentSystemSeed = startingSeed;
    this.discoveredSystems = new Set([startingSeed]);
    this.systemSeed = startingSeed;

    // New galaxy and physics systems
    this.galaxy = [];
    this.galaxyGenerator = null;
    this.advancedPhysics = null;
    this.currentSystemIndex = 0;
    this.currentSystemData = null;
    this.gravityWarning = null;
    this.tidalWarning = 0;
    this.showGalaxyMap = false;
    this.asteroidBelts = [];
    this.comets = [];
    this.megastructures = [];

    // UI State Management
    this.uiState = {
      showInventory: false,
      showTrading: false,
      showDiplomacy: false,
      showGalaxyMap: false,
      showSaveScreen: false,
      showLoadScreen: false,
      selectedTab: 'cargo', // For inventory: cargo, artifacts, ship
      selectedTradeTab: 'buy', // For trading: buy, sell, refuel
      selectedFaction: null, // For diplomacy screen
      selectedSaveSlot: null, // For save/load screens
      hoveredItem: null,
      scrollOffset: 0,
      // Pop-up system
      showPopup: false,
      popupType: null, // 'planet', 'station', 'convoy', 'asteroid', etc.
      popupTarget: null, // The celestial body/entity object
      popupButtons: [] // Available action buttons
    };

    // Autosave indicator
    this.autosaving = false;
    this.autosaveIndicatorTime = 0;

    this.input = {
      thrust: 0,
      rotation: 0,
      fire: false,
      warp: false,
      brake: false,
      shield: false,
      mining: false,
      keys: new Set(),
      mouse: { x: 0, y: 0, down: false },
      touch: { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 }
    };

    this.camera = { x: 0, y: 0, zoom: 1, shake: 0 };
    this.PALETTE = RETRO_PALETTE;

    // PERFORMANCE: Pre-allocated constants for render optimizations
    this.PARALLAX_VALUES = [0.08, 0.25, 0.45];

    // PERFORMANCE: Pre-allocated hex alpha lookup for common values (0-255)
    this.HEX_ALPHA_CACHE = new Array(256);
    for (let i = 0; i < 256; i++) {
      this.HEX_ALPHA_CACHE[i] = i.toString(16).padStart(2, '0');
    }

    // PERFORMANCE: Pre-allocated objects for render loop to avoid GC pressure
    this._renderViewport = { x: 0, y: 0, width: 0, height: 0 };
    this._starPosition = { x: 0, y: 0 };

    // Use configured seed for random generation
    this.seed = startingSeed;
    this.rng = new SeededRandom(this.seed);

    // Initialize with safe default values to prevent null reference errors
    // These will be properly set in initPlayer/loadStarSystem
    this.player = {
      x: 0, y: 0, vx: 0, vy: 0, rotation: 0,
      hull: 100, maxHull: 100, shields: 50, maxShields: 50,
      power: 100, fuel: 100, temperature: 20, heatStatus: 'safe',
      shieldActive: false, heatDamage: false, docked: false, landed: false
    };
    this.star = { x: 0, y: 0, radius: 400, mass: 10000 };

    this.initInput();
    this.initStarfield();
    this.initPlayer();

    // Initialize new galaxy and physics systems
    this.galaxyGenerator = new GalaxyGenerator(this.seed);
    this.advancedPhysics = new AdvancedPhysics();
    this.blackholeRenderer = new BlackholeRenderer();
    this.blackHoleWarpEffect = new BlackHoleWarpEffect();
    this.stellarRenderer = new StellarRenderer(); // FIXED: Initialize new stellar renderer
    this.stationRenderer = new StationRenderer();
    this.asteroidRenderer = new AsteroidRenderer();
    this.collisionSystem = new CollisionSystem(this);
    // PERFORMANCE FIX: Use lazy generation - only generates starting system
    this.galaxy = this.galaxyGenerator.generateLazy();
    this.interstellarRenderer = new InterstellarRenderer(this.galaxy);
    this.currentSystemIndex = 0;
    this.interstellarPlayerX = 0;
    this.interstellarPlayerY = 0;

    // Initialize faction, economy, and other new systems
    this.factionSystem = new FactionSystem();
    this.economySystem = new EconomySystem(this);
    this.warpGateSystem = new WarpGateSystem();
    this.artifactSystem = new ArtifactSystem();

    // Make enhanced items available to UI
    this.ENHANCED_ARTIFACTS = ENHANCED_ARTIFACTS;

    // Track artifacts in current system
    this.systemArtifacts = [];

    // Track warp gates in current system
    this.systemWarpGates = [];

    // PERFORMANCE FIX: Defer faction and warp gate initialization to async method
    // These work on placeholder data and don't block the first render
    this.galaxyInitialized = false;

    // Initialize mobile controls
    this.mobileControls = new MobileControls(canvas, this);

    // Initialize UI renderer
    this.uiRenderer = new UIRenderer(this);

    // Initialize interaction system
    this.interactionSystem = new InteractionSystem(this);

    // Initialize enhanced systems
    this.performanceOptimizer = new PerformanceOptimizer(this);
    this.enhancedEffects = new EnhancedEffects(this);
    this.retroScreenEffects = new RetroScreenEffects(canvas, ctx);

    // PERFORMANCE: Initialize optimized rendering and particle systems
    this.optimizedRenderer = new OptimizedRenderer(this);
    this.particleManager = new ParticleManager(800); // OPTIMIZED: Reduced from 3000 to 800 for better performance
    // LAZY LOAD: Thruster effects initialized on first use
    this.thrusterEffects = null;

    // SPRITES: Initialize sprite-based rendering system
    this.spriteManager = new SpriteManager(this);
    // PERFORMANCE FIX: Generate only star sprite initially, planets on-demand
    this.useSpriteRendering = true; // ENABLED: Using optimized progressive generation
    this.progressiveSpriteGeneration = true; // Generate sprites across multiple frames

    // HUD UI OVERHAUL: Initialize ship damage system
    this.shipDamageSystem = new ShipDamageSystem(this, 'explorer');

    // LAZY LOAD: Realistic space systems - initialized only when needed in loadStarSystem
    this.spaceEnvironmentRenderer = null;
    this.celestialRotation = null;
    this.orbitalMechanics = null;

    // LAZY LOAD: Environmental hazards - initialized only when needed
    this.environmentalHazards = null;

    // PERFORMANCE OPTIMIZATION: LOD system and object pooling
    this.lodSystem = new LODSystem();
    this.poolManager = new PoolManager();

    // HUD RENDERING: Extracted HUD renderer for better code organization
    this.hudRenderer = new HUDRenderer(this);

    // SHIP RENDERING: Extracted ship renderer for better code organization
    this.shipRenderer = new ShipRenderer(this);

    // PHYSICS ENGINE: Extracted physics engine for better code organization
    this.physicsEngine = new PhysicsEngine(this);

    // Initialize save system
    this.saveSystem = new SaveSystem(this);
    this.lastSaveTime = 0;

    // Performance settings (can be modified by optimizer)
    // OPTIMIZED: Aggressively reduced for better startup FPS
    this.maxParticles = 150; // PERFORMANCE: Reduced from 200 to 150 for better FPS
    this.maxStars = 100; // PERFORMANCE: Reduced from 150 to 100 for better FPS
    this.particleLifetime = 0.8; // PERFORMANCE: Reduced from 1.0 to 0.8 for faster cleanup
    this.enableGlow = true;
    this.enableScanlines = false; // DISABLED: Expensive effect, can be enabled in settings
    this.qualityLevel = 1; // OPTIMIZED: Start with Medium quality, not High

    // Shockwaves array for enhanced explosions
    this.shockwaves = [];

    // Initialize game world with error handling (async)
    this.systemLoading = true;
    this.running = true; // Set running flag early so loop can check systemLoading

    // Track sprite generation progress
    this.spriteGenerationProgress = 0;
    this.spriteGenerationStage = 'Initializing...';

    // FIXED: Load star system and ensure systemLoading is properly managed
    // Don't set systemLoading=false here, let loadStarSystem handle it completely
    console.log('[Game] Starting async star system load...');
    this.loadStarSystem(0)
      .then(() => {
        console.log('[Game] ✓ Star system load promise resolved');
        // Don't set systemLoading here - sprite generation handles it
      })
      .catch(error => {
        console.error('[Game] ✗ Failed to load star system:', error);
        console.error('[Game] Error details:', error.message, error.stack);
        this.systemLoading = false; // Set false on error
        this.useSpriteRendering = false; // Disable sprites on error
        // Continue anyway with procedural rendering fallback
      });

    try {
      this.spawnEnemies();
    } catch (error) {
      console.error('Failed to spawn enemies:', error);
      // Continue anyway without enemies
    }

    // Don't start autosave - let GameContainer handle it
    // this.saveSystem.startAutosave();

    // PERFORMANCE FIX: Initialize galaxy systems asynchronously (doesn't block first render)
    this.initializeGalaxySystemsAsync();

    // FIX: Render initial frame immediately to prevent black screen flash
    // This ensures the canvas shows the game background before the first loop iteration
    try {
      this.ctx.fillStyle = this.PALETTE.voidBlack;
      this.ctx.fillRect(0, 0, this.width, this.height);
    } catch (error) {
      console.warn('Failed to render initial frame:', error);
    }

    // Start game loop with error handling
    try {
      this.loop();
    } catch (error) {
      console.error('Failed to start game loop:', error);
      this.running = false;
    }
  }

  /**
   * PERFORMANCE: Initialize galaxy-wide systems asynchronously
   * Runs in background without blocking the first render
   */
  async initializeGalaxySystemsAsync() {
    try {
      console.log('[Performance] Initializing galaxy systems asynchronously...');

      // OPTIMIZED: Properly yield to event loop with setTimeout
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assign factions to galaxy systems
      this.factionSystem.assignTerritories(this.galaxy);

      // Yield again to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));

      // Generate warp gate network
      this.warpGateSystem.generateGateNetwork(this.galaxy);

      this.galaxyInitialized = true;
      console.log('[Performance] Galaxy systems initialized');
    } catch (error) {
      console.error('Failed to initialize galaxy systems:', error);
      // Continue anyway - game will work without factions/gates
    }
  }

  initInput() {
    // Store event handlers for cleanup
    this.eventHandlers = {
      keydown: null,
      keyup: null,
      mousedown: null,
      mouseup: null,
      contextmenu: null,
      click: null,
      mousemove: null,
      touchstart: null,
      touchmove: null,
      touchend: null,
      visibilitychange: null
    };

    this.eventHandlers.keydown = (e) => {
      this.input.keys.add(e.code);
      if (e.code === 'Space') {
        this.input.fire = true;
        e.preventDefault();
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.input.warp = true;
      }
      if (e.code === 'KeyX') {
        this.input.brake = true;
      }
      if (e.code === 'KeyZ') {
        this.input.shield = true;
      }
      // Weapon switching
      if (e.code === 'KeyQ' && this.weaponSystem) {
        this.weaponSystem.previousWeapon();
      }
      // 'E' key - prioritize interaction over weapon switching
      if (e.code === 'KeyE') {
        if (this.interactionSystem && this.uiState.showInteractionPrompt) {
          // Activate full interaction popup when prompt is showing
          this.interactionSystem.activateFullPopup();
          e.preventDefault();
        } else if (this.weaponSystem) {
          // Weapon switching (only when not near interactive objects)
          this.weaponSystem.nextWeapon();
        }
      }
      // Inertial dampening toggle
      if (e.code === 'KeyJ' && this.inertialSystem) {
        this.inertialSystem.toggleInertialDampening();
      }
      // Mining
      if (e.code === 'KeyF') {
        this.input.mining = true;
      }

      // UI Screens (toggle on/off)
      if (e.code === 'KeyI') {
        // Inventory screen
        this.uiState.showInventory = !this.uiState.showInventory;
        if (this.uiState.showInventory) {
          this.uiState.showTrading = false;
          this.uiState.showDiplomacy = false;
          this.uiState.showGalaxyMap = false;
        }
        this.updatePauseState();
      }
      if (e.code === 'KeyT') {
        // Trading screen (only if near station)
        this.uiState.showTrading = !this.uiState.showTrading;
        if (this.uiState.showTrading) {
          this.uiState.showInventory = false;
          this.uiState.showDiplomacy = false;
          this.uiState.showGalaxyMap = false;
        }
        this.updatePauseState();
      }
      if (e.code === 'KeyM') {
        // Galaxy Map
        this.uiState.showGalaxyMap = !this.uiState.showGalaxyMap;
        if (this.uiState.showGalaxyMap) {
          this.uiState.showInventory = false;
          this.uiState.showTrading = false;
          this.uiState.showDiplomacy = false;
        }
        this.updatePauseState();
      }
      if (e.code === 'KeyD') {
        // Diplomacy/Factions screen (D for Diplomacy)
        this.uiState.showDiplomacy = !this.uiState.showDiplomacy;
        if (this.uiState.showDiplomacy) {
          this.uiState.showInventory = false;
          this.uiState.showTrading = false;
          this.uiState.showGalaxyMap = false;
        }
        this.updatePauseState();
      }
      // Let InteractionSystem handle popup navigation first
      if (this.interactionSystem && this.interactionSystem.handleKeyDown(e.code)) {
        e.preventDefault();
        return;
      }

      if (e.code === 'Escape') {
        // Close popup if showing
        if (this.uiState.showPopup) {
          this.uiState.showPopup = false;
          this.uiState.popupTarget = null;
          return;
        }
        // Close all UI screens
        this.uiState.showInventory = false;
        this.uiState.showTrading = false;
        this.uiState.showDiplomacy = false;
        this.uiState.showGalaxyMap = false;
        this.uiState.showSaveScreen = false;
        this.uiState.showLoadScreen = false;
        this.updatePauseState();
      }

      // Save/Load shortcuts
      if (e.code === 'F5') {
        e.preventDefault();
        // Quick save to slot 1
        if (this.saveSystem) {
          this.saveSystem.saveGame('save_1', 'Quick Save');
        }
      }
      if (e.code === 'F6') {
        e.preventDefault();
        // Open save screen
        this.uiState.showSaveScreen = !this.uiState.showSaveScreen;
        if (this.uiState.showSaveScreen) {
          // Close other UI screens
          this.uiState.showLoadScreen = false;
          this.uiState.showInventory = false;
          this.uiState.showTrading = false;
          this.uiState.showDiplomacy = false;
          this.uiState.showGalaxyMap = false;
        }
        this.updatePauseState();
      }
      if (e.code === 'F7') {
        e.preventDefault();
        // Open load screen
        this.uiState.showLoadScreen = !this.uiState.showLoadScreen;
        if (this.uiState.showLoadScreen) {
          // Close other UI screens
          this.uiState.showSaveScreen = false;
          this.uiState.showInventory = false;
          this.uiState.showTrading = false;
          this.uiState.showDiplomacy = false;
          this.uiState.showGalaxyMap = false;
        }
        this.updatePauseState();
      }
      if (e.code === 'F9') {
        e.preventDefault();
        // Quick load from most recent save
        if (this.saveSystem) {
          const saves = this.saveSystem.getSaveList();
          // Find most recent save
          let mostRecent = null;
          let latestTime = 0;
          for (const save of saves) {
            if (!save.empty && save.timestamp && save.timestamp > latestTime) {
              latestTime = save.timestamp;
              mostRecent = save;
            }
          }
          if (mostRecent) {
            this.saveSystem.loadGame(mostRecent.slot);
          } else {
            if (this.notificationSystem) {
              this.notificationSystem.show('No saves found', 'warning');
            }
          }
        }
      }
    };
    window.addEventListener('keydown', this.eventHandlers.keydown);

    this.eventHandlers.keyup = (e) => {
      this.input.keys.delete(e.code);
      if (e.code === 'Space') {
        this.input.fire = false;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.input.warp = false;
      }
      if (e.code === 'KeyX') {
        this.input.brake = false;
      }
      if (e.code === 'KeyZ') {
        this.input.shield = false;
      }
      if (e.code === 'KeyF') {
        this.input.mining = false;
      }
    };
    window.addEventListener('keyup', this.eventHandlers.keyup);

    this.eventHandlers.mousedown = (e) => {
      this.input.mouse.down = true;

      // Galaxy map drag-to-pan
      if (this.uiState.showGalaxyMap && this.galaxyMapState) {
        this.galaxyMapState.dragging = true;
        this.galaxyMapState.lastMouseX = this.input.mouse.x;
        this.galaxyMapState.lastMouseY = this.input.mouse.y;
      }

      if (e.button === 0) this.input.fire = true;
      if (e.button === 2) this.input.shield = true;
    };
    this.canvas.addEventListener('mousedown', this.eventHandlers.mousedown);

    this.eventHandlers.mouseup = (e) => {
      this.input.mouse.down = false;

      // Galaxy map drag-to-pan
      if (this.galaxyMapState) {
        this.galaxyMapState.dragging = false;
      }

      if (e.button === 0) this.input.fire = false;
      if (e.button === 2) this.input.shield = false;
    };
    this.canvas.addEventListener('mouseup', this.eventHandlers.mouseup);

    this.eventHandlers.contextmenu = (e) => e.preventDefault();
    this.canvas.addEventListener('contextmenu', this.eventHandlers.contextmenu);

    // Click handler for celestial bodies and entities
    this.eventHandlers.click = (e) => {
      this.handleCanvasClick(e);
    };
    this.canvas.addEventListener('click', this.eventHandlers.click);

    this.eventHandlers.mousemove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.input.mouse.x = (e.clientX - rect.left) / this.scale;
      this.input.mouse.y = (e.clientY - rect.top) / this.scale;

      // Galaxy map drag-to-pan
      if (this.galaxyMapState && this.galaxyMapState.dragging && this.uiState.showGalaxyMap) {
        const dx = this.input.mouse.x - this.galaxyMapState.lastMouseX;
        const dy = this.input.mouse.y - this.galaxyMapState.lastMouseY;
        this.galaxyMapState.offsetX += dx;
        this.galaxyMapState.offsetY += dy;
        this.galaxyMapState.lastMouseX = this.input.mouse.x;
        this.galaxyMapState.lastMouseY = this.input.mouse.y;
      }
    };
    this.canvas.addEventListener('mousemove', this.eventHandlers.mousemove);

    // Mouse wheel zoom for galaxy map and inventory scrolling
    this.eventHandlers.wheel = (e) => {
      if (this.uiState.showGalaxyMap && this.galaxyMapState) {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        this.galaxyMapState.zoom = Math.max(0.01, Math.min(0.2, this.galaxyMapState.zoom * zoomFactor));
      }
      // Inventory scrolling
      if (this.uiState.showInventory && this.inventoryScrollState) {
        e.preventDefault();
        const scrollAmount = e.deltaY > 0 ? 50 : -50;
        this.inventoryScrollState.scrollOffset = Math.max(0, this.inventoryScrollState.scrollOffset + scrollAmount);
      }
    };
    this.canvas.addEventListener('wheel', this.eventHandlers.wheel, { passive: false });

    this.eventHandlers.touchstart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / this.scale;
      const y = (touch.clientY - rect.top) / this.scale;

      // Check popup button touches first
      if (this.uiState.showPopup && this.popupButtonBounds) {
        for (const button of this.popupButtonBounds) {
          if (x >= button.x && x <= button.x + button.w &&
              y >= button.y && y <= button.y + button.h) {
            // Touch on popup button
            if (typeof button.action === 'function') {
              button.action();
            } else {
              this.handlePopupAction(button.action);
            }
            return;
          }
        }
        // Touch outside popup - close it
        if (this.interactionSystem) {
          this.interactionSystem.closePopup();
        }
        return;
      }

      if (x > this.width - 150) {
        this.input.fire = true;
      } else {
        this.input.touch.active = true;
        this.input.touch.startX = x;
        this.input.touch.startY = y;
        this.input.touch.currentX = x;
        this.input.touch.currentY = y;
      }
    };
    this.canvas.addEventListener('touchstart', this.eventHandlers.touchstart);

    this.eventHandlers.touchmove = (e) => {
      e.preventDefault();
      if (!this.input.touch.active) return;
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.input.touch.currentX = (touch.clientX - rect.left) / this.scale;
      this.input.touch.currentY = (touch.clientY - rect.top) / this.scale;
    };
    this.canvas.addEventListener('touchmove', this.eventHandlers.touchmove);

    this.eventHandlers.touchend = (e) => {
      e.preventDefault();
      this.input.touch.active = false;
      this.input.fire = false;
      this.input.thrust = 0;
      this.input.rotation = 0;
    };
    this.canvas.addEventListener('touchend', this.eventHandlers.touchend);

    // Add Page Visibility API to pause game when tab is hidden
    this.eventHandlers.visibilitychange = () => {
      if (document.hidden) {
        this.paused = true;
      } else {
        this.paused = false;
      }
    };
    document.addEventListener('visibilitychange', this.eventHandlers.visibilitychange);
  }

  initStarfield() {
    // OPTIMIZED: Generate only as many stars as maxStars setting (was 1200!)
    const starCount = this.maxStars || 150;
    for (let i = 0; i < starCount; i++) {
      const color = Math.random() > 0.8 ? (Math.random() > 0.5 ? this.PALETTE.warpBlue : this.PALETTE.statusBlue) : this.PALETTE.starWhite;
      // PERFORMANCE: Pre-cache base color for faster rendering
      const cachedBaseColor = color.replace('rgb(', 'rgba(').replace(')', '');
      this.stars.push({
        x: Math.random() * this.width * 4,
        y: Math.random() * this.height * 4,
        size: Math.random() * 2.5 + 0.5,
        brightness: Math.random() * 0.6 + 0.4,
        twinkle: Math.random() * Math.PI * 2,
        layer: Math.random() < 0.2 ? 0 : (Math.random() < 0.5 ? 1 : 2),
        color,
        cachedBaseColor // Pre-cached for render optimization
      });
    }
  }

  initPlayer() {
    // Apply ship class bonuses
    const shipClassBonuses = {
      'scout': { hull: 0.7, shields: 0.8, speed: 1.4, fuel: 1.2, cargo: 0.6 },
      'explorer': { hull: 1.0, shields: 1.0, speed: 1.0, fuel: 1.5, cargo: 1.0 },
      'fighter': { hull: 0.8, shields: 1.2, speed: 1.2, fuel: 0.8, cargo: 0.5 },
      'trader': { hull: 0.9, shields: 0.9, speed: 0.8, fuel: 1.0, cargo: 2.0 },
      'research': { hull: 0.85, shields: 1.1, speed: 0.9, fuel: 1.3, cargo: 1.2 },
      'military': { hull: 1.5, shields: 1.5, speed: 0.7, fuel: 0.9, cargo: 0.8 },
    };
    const shipClass = this.gameConfig.shipClass || 'explorer';
    const bonuses = shipClassBonuses[shipClass] || shipClassBonuses['explorer'];

    this.player = {
      // Player identity from game setup
      callsign: this.gameConfig.callsign,
      shipName: this.gameConfig.shipName,
      color: this.gameConfig.shipColor,
      race: this.gameConfig.playerRace,
      gender: this.gameConfig.playerGender,
      shipClass: shipClass,
      faction: this.gameConfig.faction,
      trait: this.gameConfig.trait,

      // Position and movement
      x: this.width / 2,
      y: this.height / 2,
      vx: 0,
      vy: 0,
      rotation: 0,
      rotationVel: 0,
      thrust: 0,

      // Stats (modified by ship class)
      hull: Math.floor(100 * bonuses.hull),
      maxHull: Math.floor(100 * bonuses.hull),
      shields: Math.floor(100 * bonuses.shields),
      maxShields: Math.floor(100 * bonuses.shields),
      shieldRecharge: 8,
      shieldActive: false,
      shieldCooldown: 0,
      fuel: Math.floor(1000 * bonuses.fuel),
      maxFuel: Math.floor(1000 * bonuses.fuel),
      power: 100,
      maxPower: 100,
      powerRegen: 25,
      oxygen: 100,
      temperature: 20,
      heatStatus: 'safe',
      mass: Math.floor(100 * (2.0 - bonuses.speed)), // Faster ships = lighter
      warpCharge: 0,
      warpActive: false,
      warpCooldown: 0,
      weapons: [{
        type: 'plasma',
        cooldown: 0,
        maxCooldown: 0.12,
        damage: 30,
        energyCost: 4
      }],
      inertialDampening: true,
      damageFlash: 0,
      kills: 0,
      score: 0,
      isDying: false
    };

    // Initialize new combat systems - Add ALL weapon types
    this.weaponSystem = new WeaponSystem();
    this.weaponSystem.addWeapon('plasma_cannon', 1);
    this.weaponSystem.addWeapon('kinetic_cannon', 1);
    this.weaponSystem.addWeapon('laser_beam', 1);
    this.weaponSystem.addWeapon('missile_launcher', 1);
    this.weaponSystem.addWeapon('railgun', 1);
    this.weaponSystem.addWeapon('nuclear_missile', 1);
    this.weaponSystem.addWeapon('mine_launcher', 1);
    this.weaponSystem.addWeapon('point_defense', 1);

    // Assign weapon system to player for mobile controls access
    this.player.weaponSystem = this.weaponSystem;

    this.shieldSystem = new ShieldSystem();
    this.shieldSystem.addShield('energy_shield', 1);
    this.shieldSystem.addShield('kinetic_barrier', 1);

    this.inertialSystem = new InertialMovement(this.player);

    // Initialize resource and cargo systems (cargo capacity modified by ship class)
    this.resourceSystem = new ResourceSystem();
    const cargoCapacity = Math.floor(100 * bonuses.cargo);
    this.cargoSystem = new CargoSystem(cargoCapacity);

    // Add some starting resources for testing
    this.resourceSystem.addResource('iron', 10);
    this.resourceSystem.addResource('water', 5);
    this.cargoSystem.addCargo('iron', 10);
    this.cargoSystem.addCargo('water', 5);

    // Initialize mining system (pass 'this' after all systems are ready)
    this.miningSystem = null; // Will be initialized after first frame
    this.miningSystemReady = false;

    // Initialize alien race system
    this.alienRaceSystem = new AlienRaceSystem();
    this.alienShipRenderer = new AlienShipRenderer(this.PALETTE);
  }

  async loadStarSystem(systemIndex) {
    // SPRITES: Load sprite library on first system load
    // This pre-generates hundreds of unique celestial body sprites for variety
    if (this.spriteManager && !this.spriteManager.libraryLoaded) {
      console.log('[Game] Loading sprite library (first time only)...');
      this.systemLoading = true; // Show loading screen

      try {
        // Configure sprite library quality
        // Options: { fullQuality: true } for 80/40 sprites (slow)
        //          { lowQuality: true } for 5/3 sprites (fast)
        //          Default: 20/15 sprites (balanced)
        const libraryOptions = {}; // Use default (20/15 sprites)

        const success = await this.spriteManager.loadSpriteLibrary(
          libraryOptions,
          (progress, stage) => {
            console.log(`[Game] Sprite library loading: ${progress.toFixed(1)}% - ${stage}`);
          }
        );

        if (success) {
          console.log('[Game] ✓ Sprite library loaded successfully');
        } else {
          console.warn('[Game] Sprite library failed to load, will use procedural generation');
        }
      } catch (error) {
        console.error('[Game] Error loading sprite library:', error);
      }
    }

    let systemData = this.galaxy[systemIndex];

    // PERFORMANCE FIX: Generate full system data on-demand if it's a placeholder
    if (systemData && systemData.isPlaceholder) {
      systemData = this.galaxyGenerator.generateSystemOnDemand(systemIndex);
      this.galaxy[systemIndex] = systemData; // Update galaxy array with full data
    }

    this.currentSystemIndex = systemIndex;
    this.currentSystemData = systemData;
    this._stellarDebugLogged = false; // Reset debug flag for new system

    const generator = new EnhancedSystemGenerator(systemData);
    const system = generator.generate();

    this.star = system.star;

    // FIXED: Add stellar classification to the generated star
    if (this.stellarRenderer) {
      const stellarData = this.stellarRenderer.selectStellarClass(systemData.seed);
      const stellarRadius = stellarData.size * 1200; // LARGER: Red dwarf (0.4) = 480px, Sun (1.0) = 1200px, Giants = huge
      const stellarMass = Math.pow(stellarData.size, 2.5) * 1000;


      // Update star with stellar classification
      this.star.stellarData = stellarData;
      this.star.radius = stellarRadius;
      this.star.mass = stellarMass;
      this.star.luminosity = stellarData.luminosity;
      this.star.color = stellarData.color;
      this.star.temperature = stellarData.temp;
      this.star.type = stellarData.class;
      this.star.stellarClass = stellarData.class; // FIXED: Add stellarClass property for sprite generation
      this.star.isBlackhole = stellarData.class === 'BlackHole' || stellarData.class === 'QuasarCore';

    } else {
      console.error('❌ StellarRenderer not initialized!');
    }

    this.planets = system.planets;
    this.asteroidBelts = system.asteroidBelts;
    this.asteroids = []; // Flatten asteroid belts
    for (const belt of system.asteroidBelts) {
      this.asteroids.push(...belt.asteroids);
    }
    this.stations = system.stations;
    this.comets = system.comets || [];

    // NOTE: Feature generation removed - using sprite-based rendering only

    // OPTIMIZED: Skip expensive environmental system initialization for better performance
    // These systems are not essential for gameplay and significantly slow down loading
    // They can be re-enabled in a future update with proper lazy loading
    try {
      // PERFORMANCE FIX: Instantiate systems immediately instead of lazy loading
      // These modules are already in the bundle, dynamic import just adds lag
      if (!this.spaceEnvironmentRenderer) {
        this.spaceEnvironmentRenderer = new SpaceEnvironmentRenderer();
      }
      if (!this.celestialRotation) {
        this.celestialRotation = new CelestialRotation();
      }
      if (!this.orbitalMechanics) {
        this.orbitalMechanics = new OrbitalMechanics();
      }

      // OPTIMIZED: Only initialize for first system load, skip for subsequent loads during spawn
      if (systemIndex === 0 || systemIndex === this.currentSystemIndex) {
        // Reset space environment
        this.spaceEnvironmentRenderer.reset();

        // Initialize space environment with minimal settings
        const systemRadius = systemData.systemSize || DISTANCE_SYSTEM.MEDIUM_SYSTEM_RADIUS;
        this.spaceEnvironmentRenderer.initialize(systemData.seed, systemRadius);

        // Initialize rotation for star only (skip planets for performance)
        this.celestialRotation.initializeRotation(this.star, 'star', systemData.seed);

        // SKIP: Planet rotation, atmosphere, and orbital mechanics initialization
        // These are expensive and not critical for initial spawn
      }
    } catch (error) {
      console.warn('Failed to initialize realistic space systems:', error);
      // Continue without these enhancements
    }

    // Initialize megastructures if system has them
    this.megastructures = [];
    if (systemData.hasMegastructure) {
      const megaType = systemData.megastructureType;

      // Map megastructure type names to simplified types
      let structureType = 'dyson';
      if (megaType === 'ring_habitat' || megaType === 'orbital_ring') {
        structureType = 'ring';
      } else if (megaType === 'warp_gate') {
        structureType = 'warp_gate';
      } else if (megaType === 'dyson_sphere' || megaType === 'stellar_engine') {
        structureType = 'dyson';
      } else if (megaType === 'space_city') {
        structureType = 'space_city';
      } else if (megaType === 'planet_ring') {
        structureType = 'planet_ring';
      } else if (megaType === 'death_star') {
        structureType = 'death_star';
      }

      const megastructure = new Megastructure(structureType, this.star, systemData);
      this.megastructures.push(megastructure);
    }

    // OPTIMIZED: Skip environmental hazards generation for better performance
    // Lazy load only if needed
    if (this.environmentalHazards) {
      const systemRadius = systemData.systemSize || DISTANCE_SYSTEM.MEDIUM_SYSTEM_RADIUS;
      this.environmentalHazards.generateSystemHazards(
        systemData,
        this.star.x,
        this.star.y,
        systemRadius
      );
    }

    // Generate artifacts for this system
    this.systemArtifacts = this.artifactSystem.generateSystemArtifacts(
      systemData,
      systemIndex,
      systemData.seed
    );

    // Get warp gates for this system
    this.systemWarpGates = this.warpGateSystem.getGatesInSystem(systemIndex);

    // Generate market for this system
    const factionData = systemData.factionData;
    this.currentMarket = this.economySystem.generateSystemMarket(systemIndex, systemData, factionData);

    // Mark spatial grid for rebuild (new system loaded)
    if (this.interactionSystem) {
      this.interactionSystem.gridNeedsRebuild = true;
    }

    // SPRITES: Generate ONLY star sprite synchronously, rest progressively
    // This prevents long blocking and allows game to start quickly
    if (this.spriteManager) {
      try {
        // Generate ONLY star sprite (fast - ~100ms)
        console.log('[Game] Generating star sprite...');
        const starGenData = {
          name: systemData.name,
          seed: systemData.seed,
          star: this.star,
          planets: [] // Empty - will generate progressively
        };

        await this.spriteManager.generateSystemSprites(starGenData);
        console.log('[Game] ✓ Star sprite ready');

        // Start game immediately with star sprite only
        this.systemLoading = false;

        // FIX: Wait for planet/moon sprites to finish generating before continuing
        // Planets won't render if sprites aren't ready!
        await this.generateRemainingSpritesAsync(systemData);
      } catch (error) {
        console.error('[Game] Star sprite generation failed:', error);
        this.systemLoading = false;
        this.useSpriteRendering = false;
      }
    } else {
      console.warn('[Game] No sprite manager available');
      this.systemLoading = false;
    }
  }

  /**
   * Generate remaining sprites progressively in background
   * Non-blocking - allows game to start while sprites generate
   */
  async generateRemainingSpritesAsync(systemData) {
    console.log('[Game] Starting progressive sprite generation in background...');

    try {
      // Generate planets and moons
      for (let i = 0; i < this.planets.length; i++) {
        const planet = this.planets[i];
        // Use generatePlanetSprite which properly creates sprite sheets
        const maxPlanetRadius = 40;  // ULTRA-OPTIMIZED: Match SpriteManager cap
        const planetSpriteData = await this.spriteManager.celestialGen.generatePlanetSprite({
          type: planet.type || 'terran',
          radius: Math.min(planet.radius || 50, maxPlanetRadius),
          seed: systemData.seed + i * 1000,
          animationFrames: 2  // ULTRA-OPTIMIZED: Match SpriteManager settings
        });

        // Cache it with the correct ID
        const planetId = `planet_${systemData.seed}_${i}`;
        if (planetSpriteData && planetSpriteData.name) {
          this.spriteManager.spriteCache.set(planetId, {
            type: 'planet',
            sprite: planetSpriteData,
            data: planet,
            index: i
          });
          console.log(`[Game] ✓ Cached planet sprite: ${planetId}`);
        } else {
          console.error(`[Game] ✗ Failed to generate planet sprite ${i}`);
        }

        // Generate moons for this planet
        if (planet.moons) {
          for (let j = 0; j < planet.moons.length; j++) {
            const moon = planet.moons[j];
            // Use generateMoonSprite wrapper (which delegates to generatePlanet)
            const maxMoonRadius = 15;  // ULTRA-OPTIMIZED: Match SpriteManager cap
            const moonSpriteData = await this.spriteManager.celestialGen.generateMoonSprite({
              type: moon.type || 'rocky',
              radius: Math.min(moon.radius || 20, maxMoonRadius),
              seed: systemData.seed + i * 1000 + j * 100
            });

            const moonId = `moon_${systemData.seed}_${i}_${j}`;
            if (moonSpriteData && moonSpriteData.name) {
              this.spriteManager.spriteCache.set(moonId, {
                type: 'moon',
                sprite: moonSpriteData,
                data: moon,
                planetIndex: i,
                moonIndex: j
              });
              console.log(`[Game] ✓ Cached moon sprite: ${moonId}`);
            } else {
              console.error(`[Game] ✗ Failed to generate moon sprite ${i}-${j}`);
            }
          }
        }

        // Yield to browser every planet to prevent freezing
        await new Promise(resolve => requestAnimationFrame(resolve));
      }

      console.log('[Game] ✓ All sprites generated progressively');
    } catch (error) {
      console.error('[Game] Progressive sprite generation error:', error);
      console.error('[Game] Error message:', error.message);
      console.error('[Game] Error stack:', error.stack);
      // Continue anyway - fallback rendering will be used
    }

    // NOTE: Asset pre-generation removed - using sprite-based rendering only

    // FIXED: Use currentSystemIndex instead of undefined systemIndex variable
    // Autosave when changing systems (important game state change)
    if (this.saveSystem && this.currentSystemIndex !== 0) { // Don't autosave on initial load
      try {
        this.saveSystem.saveGame('autosave', 'Autosave');
      } catch (error) {
        console.warn('[Game] Autosave failed:', error);
        // Don't crash - continue anyway
      }
    }
  }

  /**
   * DEPRECATED: Asset pre-generation is no longer needed with sprite-based rendering
   */
  preGenerateSystemAssets() {
    // Sprite-based rendering does not require asset pre-generation
  }


  generateStarType(rng) {
    const type = rng.next();
    if (type < 0.76) return { name: 'M', radius: 80, mass: 30000, luminosity: 0.5, color: '#ff8844', temperature: 3500 };
    if (type < 0.84) return { name: 'K', radius: 100, mass: 40000, luminosity: 0.7, color: '#ffaa66', temperature: 4500 };
    if (type < 0.92) return { name: 'G', radius: 120, mass: 50000, luminosity: 1.0, color: this.PALETTE.starYellow, temperature: 5800 };
    if (type < 0.97) return { name: 'F', radius: 140, mass: 60000, luminosity: 1.3, color: '#ffffcc', temperature: 6500 };
    return { name: 'A', radius: 160, mass: 80000, luminosity: 2.0, color: this.PALETTE.starWhite, temperature: 8500 };
  }

  generateMoons(rng, planetSize) {
    const moons = [];
    const moonCount = planetSize > 80 ? rng.int(2, 5) : rng.int(0, 2);

    for (let i = 0; i < moonCount; i++) {
      moons.push({
        distance: (i + 1) * (planetSize + 30),
        angle: rng.next() * Math.PI * 2,
        orbitSpeed: 0.02 / (i + 1),
        radius: rng.int(8, 15),
        color: '#999999'
      });
    }
    return moons;
  }

  generateAsteroidShape(rng) {
    const vertices = [];
    const sides = rng.int(6, 10);

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const radius = rng.range(0.6, 1.4);
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }

    return vertices;
  }

  spawnEnemies() {
    const systemData = this.currentSystemData;
    const dangerLevel = systemData ? systemData.dangerLevel : 3;

    // Apply difficulty and encounter rate modifiers
    const difficultyMultipliers = {
      'story': 0.5,
      'explorer': 0.7,
      'adventurer': 1.0,
      'veteran': 1.3,
      'hardcore': 1.6,
      'nightmare': 2.0,
    };
    const encounterMultipliers = {
      'low': 0.5,
      'normal': 1.0,
      'high': 1.5,
      'extreme': 2.0,
    };
    const alienEncounterMultipliers = {
      'rare': 0.3,
      'low': 0.6,
      'normal': 1.0,
      'high': 1.4,
      'maximum': 2.0,
    };

    const difficultyMult = difficultyMultipliers[this.gameConfig.difficulty] || 1.0;
    const encounterMult = encounterMultipliers[this.gameConfig.encounterRate] || 1.0;
    const alienMult = alienEncounterMultipliers[this.gameConfig.alienEncounters] || 1.0;

    // OPTIMIZED: Reduce initial enemy count for better spawn performance
    let baseCount = 1 + dangerLevel * 0.5; // Reduced from 2 + dangerLevel * 0.8
    const enemyCount = Math.floor(baseCount * difficultyMult * encounterMult * alienMult);

    // Ship type distribution based on danger level
    const shipTypes = ['scout', 'fighter', 'bomber', 'frigate'];

    for (let i = 0; i < enemyCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 600 + Math.random() * 1200;

      // Select ship type based on danger level
      let shipType;
      const roll = Math.random();

      if (dangerLevel <= 3) {
        // Low danger: mostly scouts and fighters
        shipType = roll < 0.6 ? 'scout' : 'fighter';
      } else if (dangerLevel <= 6) {
        // Medium danger: mix of all except frigates
        if (roll < 0.3) shipType = 'scout';
        else if (roll < 0.7) shipType = 'fighter';
        else shipType = 'bomber';
      } else {
        // High danger: heavy ships, including frigates
        if (roll < 0.2) shipType = 'scout';
        else if (roll < 0.5) shipType = 'fighter';
        else if (roll < 0.8) shipType = 'bomber';
        else shipType = 'frigate';
      }

      // Select a random alien race for this ship
      const race = this.alienRaceSystem.getRandomRace();
      const isHostile = this.alienRaceSystem.willAttack(race.id);

      const enemy = new AlienShip(
        shipType,
        this.player.x + Math.cos(angle) * distance,
        this.player.y + Math.sin(angle) * distance,
        isHostile,
        race
      );

      this.enemies.push(enemy);
    }

    // Spawn hive drones if system has hive aliens
    if (systemData && systemData.hasHiveAliens) {
      this.spawnHiveDrones();
    }
  }

  spawnHiveDrones() {
    // OPTIMIZED: Reduced hive drone count for better performance
    const droneCount = Math.floor(6 + Math.random() * 5); // Reduced from 10-20 to 6-10

    // Create 1-2 clusters instead of 2-3
    const clusterCount = Math.floor(1 + Math.random() * 2);

    // Hive drones use Mycelian race (organic hive-mind)
    const race = this.alienRaceSystem.getRace('mycelians');
    const isHostile = this.alienRaceSystem.willAttack('mycelians');

    for (let c = 0; c < clusterCount; c++) {
      const clusterAngle = Math.random() * Math.PI * 2;
      const clusterDistance = 800 + Math.random() * 600;
      const clusterX = this.player.x + Math.cos(clusterAngle) * clusterDistance;
      const clusterY = this.player.y + Math.sin(clusterAngle) * clusterDistance;

      const dronesPerCluster = Math.floor(droneCount / clusterCount);

      for (let i = 0; i < dronesPerCluster; i++) {
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDist = Math.random() * 150;

        const drone = new AlienShip(
          'hive_drone',
          clusterX + Math.cos(offsetAngle) * offsetDist,
          clusterY + Math.sin(offsetAngle) * offsetDist,
          isHostile,
          race
        );

        this.enemies.push(drone);
      }
    }
  }

  /**
   * Update pause state based on open UI screens
   * Pauses game when inventory, trade, diplomacy, galaxy map, save, load, or popup screens are open
   */
  updatePauseState() {
    const anyScreenOpen = this.uiState.showInventory ||
                          this.uiState.showTrading ||
                          this.uiState.showDiplomacy ||
                          this.uiState.showGalaxyMap ||
                          this.uiState.showSaveScreen ||
                          this.uiState.showLoadScreen ||
                          this.uiState.showPopup;

    // Pause game when UI screens are open
    this.paused = anyScreenOpen;

    // Store orbital state when popup opens
    if (this.uiState.showPopup && !this.orbitalStateSaved) {
      this.saveOrbitalState();
    } else if (!this.uiState.showPopup && this.orbitalStateSaved) {
      this.orbitalStateSaved = false;
    }
  }

  /**
   * Save ship's current orbital state for restoration
   */
  saveOrbitalState() {
    if (!this.player) return;

    this.savedOrbitalState = {
      x: this.player.x,
      y: this.player.y,
      vx: this.player.vx,
      vy: this.player.vy,
      rotation: this.player.rotation
    };
    this.orbitalStateSaved = true;
  }

  processInput() {
    // Keyboard thrust
    if (this.input.keys.has('KeyW') || this.input.keys.has('ArrowUp')) {
      this.input.thrust = 1;
    } else if (this.input.keys.has('KeyS') || this.input.keys.has('ArrowDown')) {
      this.input.thrust = -0.5;
    } else {
      this.input.thrust = 0;
    }

    // Keyboard rotation
    if (this.input.keys.has('KeyA') || this.input.keys.has('ArrowLeft')) {
      this.input.rotation = -1;
    } else if (this.input.keys.has('KeyD') || this.input.keys.has('ArrowRight')) {
      this.input.rotation = 1;
    } else {
      this.input.rotation = 0;
    }

    // Touch joystick
    if (this.input.touch.active) {
      const dx = this.input.touch.currentX - this.input.touch.startX;
      const dy = this.input.touch.currentY - this.input.touch.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 10) {
        const angle = Math.atan2(dy, dx);
        const strength = Math.min(distance / 50, 1);

        const targetAngle = angle;
        let angleDiff = targetAngle - this.player.rotation;

        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        this.input.rotation = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff) * 2, 1);
        this.input.thrust = strength;
      }
    }
  }

  updateEnemyAI(enemy, dt) {
    const p = this.player;
    const dx = p.x - enemy.x;
    const dy = p.y - enemy.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    enemy.ai.thinkTimer -= dt;

    if (enemy.ai.thinkTimer <= 0) {
      enemy.ai.thinkTimer = 0.5;

      // State transitions
      if (enemy.hp < enemy.ai.fleeThreshold) {
        enemy.ai.state = 'flee';
      } else if (distToPlayer < enemy.ai.aggroRange) {
        if (distToPlayer < enemy.ai.attackRange) {
          enemy.ai.state = 'attack';
        } else {
          enemy.ai.state = 'pursue';
        }
      } else {
        enemy.ai.state = 'patrol';
      }

      // Set target based on state
      if (enemy.ai.state === 'patrol') {
        if (Math.abs(enemy.x - enemy.ai.targetX) < 50 && Math.abs(enemy.y - enemy.ai.targetY) < 50) {
          enemy.ai.targetX = this.star.x + (Math.random() - 0.5) * 1000;
          enemy.ai.targetY = this.star.y + (Math.random() - 0.5) * 1000;
        }
      } else if (enemy.ai.state === 'flee') {
        enemy.ai.targetX = enemy.x - dx * 2;
        enemy.ai.targetY = enemy.y - dy * 2;
      }
    }

    // Execute behavior
    if (enemy.ai.state === 'attack') {
      // Strafe and shoot
      const angleToPlayer = Math.atan2(dy, dx);
      enemy.rotation = angleToPlayer;

      // Strafe movement
      const strafeAngle = angleToPlayer + Math.PI / 2;
      const strafeDir = Math.sin(this.time * 2) > 0 ? 1 : -1;
      enemy.vx += Math.cos(strafeAngle) * strafeDir * 100 * dt;
      enemy.vy += Math.sin(strafeAngle) * strafeDir * 100 * dt;

      // Maintain distance
      if (distToPlayer < 200) {
        enemy.vx -= Math.cos(angleToPlayer) * 80 * dt;
        enemy.vy -= Math.sin(angleToPlayer) * 80 * dt;
      } else if (distToPlayer > 350) {
        enemy.vx += Math.cos(angleToPlayer) * 60 * dt;
        enemy.vy += Math.sin(angleToPlayer) * 60 * dt;
      }

      // Fire weapon
      if (enemy.weapon.cooldown <= 0 && distToPlayer < enemy.ai.attackRange) {
        enemy.weapon.cooldown = enemy.weapon.maxCooldown;

        // Enemy fires laser
        this.projectiles.push({
          x: enemy.x + Math.cos(enemy.rotation) * 20,
          y: enemy.y + Math.sin(enemy.rotation) * 20,
          vx: Math.cos(enemy.rotation) * 450 + enemy.vx * 0.5,
          vy: Math.sin(enemy.rotation) * 450 + enemy.vy * 0.5,
          life: 2,
          damage: enemy.weapon.damage,
          size: 5,
          color: this.PALETTE.laserRed,
          friendly: false
        });

        // Muzzle flash
        for (let i = 0; i < 6; i++) {
          this.particles.push({
            x: enemy.x + Math.cos(enemy.rotation) * 20,
            y: enemy.y + Math.sin(enemy.rotation) * 20,
            vx: Math.cos(enemy.rotation + (Math.random() - 0.5) * 0.4) * 180,
            vy: Math.sin(enemy.rotation + (Math.random() - 0.5) * 0.4) * 180,
            life: 1,
            maxLife: 0.12,
            size: 3,
            color: this.PALETTE.laserRed,
            type: 'flash'
          });
        }
      }
    } else {
      // Move toward target
      const targetDx = enemy.ai.targetX - enemy.x;
      const targetDy = enemy.ai.targetY - enemy.y;
      const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);

      if (targetDist > 20) {
        const targetAngle = Math.atan2(targetDy, targetDx);
        enemy.rotation = targetAngle;

        const thrust = enemy.ai.state === 'flee' ? 150 : 80;
        enemy.vx += Math.cos(targetAngle) * thrust * dt;
        enemy.vy += Math.sin(targetAngle) * thrust * dt;
      }
    }

    // Engine particles
    if (Math.random() < 0.3) {
      this.particles.push({
        x: enemy.x - Math.cos(enemy.rotation) * 15,
        y: enemy.y - Math.sin(enemy.rotation) * 15,
        vx: -Math.cos(enemy.rotation) * 80 + (Math.random() - 0.5) * 30,
        vy: -Math.sin(enemy.rotation) * 80 + (Math.random() - 0.5) * 30,
        life: 1,
        maxLife: 0.4,
        size: 2,
        color: this.PALETTE.enemyRed,
        type: 'engine'
      });
    }
  }

  createExplosion(x, y, radius) {
    this.explosions.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: radius,
      life: 1,
      maxLife: 0.8,
      expandSpeed: radius * 2
    });

    // ENHANCED: Increased particle count for density (30 -> 80)
    const particleCount = Math.floor(radius * 0.8); // More particles for larger explosions
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;

      // Color gradient - hot center to cool edges
      let color;
      const heat = Math.random();
      if (heat > 0.8) {
        color = this.PALETTE.starWhite; // Bright white (hottest)
      } else if (heat > 0.6) {
        color = this.PALETTE.engineBright; // Bright yellow
      } else if (heat > 0.3) {
        color = this.PALETTE.engineOrange; // Orange
      } else {
        color = '#cc4422'; // Red (cooling)
      }

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.4,
        size: 2 + Math.random() * 5,
        color: color,
        type: 'explosion',
        heat: heat // Track heat for color gradients
      });
    }

    // ENHANCED: Realistic ship debris fragments (hull plates, engine parts, wing sections)
    const debrisTypes = [
      { color: '#2a2a38', size: 8, type: 'hull' },      // Hull plating (dark gray)
      { color: '#3a3a48', size: 6, type: 'armor' },     // Armor plates (lighter gray)
      { color: '#0a0a0f', size: 10, type: 'engine' },   // Engine fragments (black)
      { color: '#445566', size: 7, type: 'structural' }, // Structural beams (blue-gray)
      { color: '#1a1a28', size: 5, type: 'panel' }      // Panels (very dark)
    ];

    for (let i = 0; i < 20; i++) { // Increased from 15 for more visible debris
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      const debrisType = debrisTypes[Math.floor(Math.random() * debrisTypes.length)];

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1.2 + Math.random() * 0.8, // Debris lasts longer
        size: debrisType.size + Math.random() * 4,
        color: debrisType.color,
        type: 'debris',
        debrisType: debrisType.type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 6, // Faster tumbling
        // Add shape variety
        width: debrisType.size + Math.random() * 3,
        height: debrisType.size * (0.5 + Math.random() * 0.5)
      });
    }

    // Add smoke particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 60;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1.0 + Math.random() * 0.5,
        size: 8 + Math.random() * 12,
        color: '#444444',
        type: 'smoke',
        expansion: 1 + Math.random() * 2
      });
    }

    this.camera.shake = Math.min(radius / 30, 1);
  }

  applyExplosionDamage(x, y, radius, damage, isFriendly) {
    if (isFriendly) {
      // Damage all enemies in explosion radius
      for (let i = 0; i < this.enemies.length; i++) {
        const enemy = this.enemies[i];
        const dx = enemy.x - x;
        const dy = enemy.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          // Calculate damage falloff based on distance (100% at center, 30% at edge)
          const falloff = 1 - (dist / radius) * 0.7;
          const finalDamage = damage * falloff;

          // Apply damage using enemy's takeDamage method
          if (enemy.takeDamage) {
            enemy.takeDamage(finalDamage);
            if (enemy.shields > 0) {
              this.createShieldImpact(enemy.x, enemy.y);
            } else {
              this.createHitSparks(enemy.x, enemy.y);
            }
          } else {
            // Fallback for old enemy format
            if (enemy.shields > 0) {
              enemy.shields -= finalDamage * 0.5;
              this.createShieldImpact(enemy.x, enemy.y);
            } else {
              enemy.hp -= finalDamage;
              enemy.damageFlash = 1;
              this.createHitSparks(enemy.x, enemy.y);
            }
          }
        }
      }

      // Damage asteroids in explosion radius
      if (this.asteroids) {
        for (let i = 0; i < this.asteroids.length; i++) {
          const asteroid = this.asteroids[i];
          if (asteroid.destroyed) continue;

          const asteroidPos = {
            x: this.star.x + Math.cos(asteroid.angle) * asteroid.distance,
            y: this.star.y + Math.sin(asteroid.angle) * asteroid.distance
          };

          const dx = asteroidPos.x - x;
          const dy = asteroidPos.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius) {
            const falloff = 1 - (dist / radius) * 0.7;
            const finalDamage = damage * falloff;
            this.collisionSystem.handleWeaponDamageToAsteroid(asteroidPos, asteroid, finalDamage, this.particles);
          }
        }
      }

      // Damage comets in explosion radius
      if (this.comets) {
        for (let i = 0; i < this.comets.length; i++) {
          const comet = this.comets[i];
          if (comet.destroyed) continue;

          const cometPos = {
            x: this.star.x + Math.cos(comet.angle) * comet.distance,
            y: this.star.y + Math.sin(comet.angle) * comet.distance
          };

          const dx = cometPos.x - x;
          const dy = cometPos.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius) {
            const falloff = 1 - (dist / radius) * 0.7;
            const finalDamage = damage * falloff;
            this.collisionSystem.handleWeaponDamageToComet(cometPos, comet, finalDamage, this.particles);
          }
        }
      }

      // Damage stations in explosion radius
      if (this.stations) {
        for (let i = 0; i < this.stations.length; i++) {
          const station = this.stations[i];
          if (station.destroyed) continue;

          const stationPos = {
            x: this.star.x + Math.cos(station.angle) * station.distance,
            y: this.star.y + Math.sin(station.angle) * station.distance
          };

          const dx = stationPos.x - x;
          const dy = stationPos.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < radius) {
            const falloff = 1 - (dist / radius) * 0.7;
            const finalDamage = damage * falloff;
            this.collisionSystem.handleWeaponDamageToStation(stationPos, station, finalDamage, this.particles);
          }
        }
      }
    }
    // Could add enemy explosion damage to player here if needed
  }

  createShieldImpact(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 40;
      this.particles.push({
        x: x + Math.cos(angle) * 25,
        y: y + Math.sin(angle) * 25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.3,
        size: 3,
        color: this.PALETTE.shieldCyan,
        type: 'shield'
      });
    }
  }

  createHitSparks(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 60;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.4,
        size: 2,
        color: this.PALETTE.cautionOrange,
        type: 'spark'
      });
    }
  }

  /**
   * Show notification message to player
   */
  showNotification(message, type = 'info') {
    if (!this.notifications) {
      this.notifications = [];
    }

    this.notifications.push({
      message,
      type, // 'info', 'warning', 'success', 'error'
      life: 1,
      maxLife: 3, // 3 seconds
      timestamp: Date.now()
    });

    // Keep only last 5 notifications
    if (this.notifications.length > 5) {
      this.notifications.shift();
    }
  }

  resetGame() {
    this.initPlayer();
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.explosions = [];
    this.spawnEnemies();

    // HUD UI OVERHAUL: Reset ship damage system on respawn
    if (this.shipDamageSystem) {
      this.shipDamageSystem.resetAllSections();
    }
  }

  /**
   * Main render method that draws all game entities, effects, and UI elements.
   */
  /**
   * Handle canvas click for celestial body interaction
   */
  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / this.scale;
    const clickY = (e.clientY - rect.top) / this.scale;

    // Check if popup is showing and handle button clicks
    if (this.uiState.showPopup && this.popupButtonBounds) {
      for (const button of this.popupButtonBounds) {
        if (clickX >= button.x && clickX <= button.x + button.w &&
            clickY >= button.y && clickY <= button.y + button.h) {
          // New InteractionSystem format: button.action is a function
          if (typeof button.action === 'function') {
            button.action();
          } else {
            // Fallback for old format
            this.handlePopupAction(button.action);
          }
          return;
        }
      }
      // Click was on popup but not on a button, ignore it
      return;
    }

    // HUD UI OVERHAUL: Check damage control panel repair button clicks
    if (this.damageControlButtons && this.damageControlButtons.length > 0) {
      for (const button of this.damageControlButtons) {
        if (clickX >= button.x && clickX <= button.x + button.w &&
            clickY >= button.y && clickY <= button.y + button.h) {
          if (typeof button.action === 'function') {
            button.action();
          }
          return;
        }
      }
    }

    // Check UI screen button clicks BEFORE early return
    if (this.uiState.showInventory && this.inventoryButtonBounds) {
      for (const button of this.inventoryButtonBounds) {
        if (clickX >= button.x && clickX <= button.x + button.w &&
            clickY >= button.y && clickY <= button.y + button.h) {
          if (typeof button.action === 'function') {
            button.action();
          }
          return;
        }
      }
      return; // Click on inventory but not on button, ignore
    }

    if (this.uiState.showTrading && this.tradingButtonBounds) {
      for (const button of this.tradingButtonBounds) {
        if (clickX >= button.x && clickX <= button.x + button.w &&
            clickY >= button.y && clickY <= button.y + button.h) {
          if (typeof button.action === 'function') {
            button.action();
          }
          return;
        }
      }
      return; // Click on trading but not on button, ignore
    }

    if (this.uiState.showDiplomacy && this.diplomacyButtonBounds) {
      for (const button of this.diplomacyButtonBounds) {
        if (clickX >= button.x && clickX <= button.x + button.w &&
            clickY >= button.y && clickY <= button.y + button.h) {
          if (typeof button.action === 'function') {
            button.action();
          }
          return;
        }
      }
      return; // Click on diplomacy but not on button, ignore
    }

    if (this.uiState.showGalaxyMap && this.galaxyMapButtonBounds) {
      for (const button of this.galaxyMapButtonBounds) {
        if (clickX >= button.x && clickX <= button.x + button.w &&
            clickY >= button.y && clickY <= button.y + button.h) {
          if (typeof button.action === 'function') {
            button.action();
          }
          return;
        }
      }
      return; // Click on galaxy map but not on button, ignore
    }

    // Don't handle world clicks if UI screens are open
    if (this.uiState.showInventory || this.uiState.showTrading ||
        this.uiState.showDiplomacy || this.uiState.showGalaxyMap) {
      return;
    }

    // Convert screen coordinates to world coordinates
    const worldX = clickX - this.width / 2 + this.camera.x;
    const worldY = clickY - this.height / 2 + this.camera.y;

    // Check planets
    for (const planet of this.planets) {
      const dx = planet.x - worldX;
      const dy = planet.y - worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < planet.radius + 20) { // 20px click tolerance
        this.openCelestialBodyPopup(planet, 'planet');
        return;
      }

      // Check moons
      if (planet.moons) {
        for (const moon of planet.moons) {
          const moonWorldX = planet.x + moon.orbitRadius * Math.cos(moon.orbitAngle);
          const moonWorldY = planet.y + moon.orbitRadius * Math.sin(moon.orbitAngle);
          const mdx = moonWorldX - worldX;
          const mdy = moonWorldY - worldY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < moon.radius + 15) {
            this.openCelestialBodyPopup(moon, 'moon', planet);
            return;
          }
        }
      }
    }

    // Check stations
    for (const station of this.stations) {
      const dx = station.x - worldX;
      const dy = station.y - worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 40) { // Station click radius
        this.openStationPopup(station);
        return;
      }
    }

    // Check asteroids
    for (const asteroid of this.asteroids) {
      const dx = asteroid.x - worldX;
      const dy = asteroid.y - worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < asteroid.size + 10) {
        this.openAsteroidPopup(asteroid);
        return;
      }
    }
  }

  /**
   * Open popup for celestial bodies (planets, moons)
   */
  openCelestialBodyPopup(body, type, parentPlanet = null) {
    this.uiState.showPopup = true;
    this.uiState.popupType = type;
    this.uiState.popupTarget = {
      ...body,
      parentPlanet: parentPlanet
    };

    // Determine available actions
    const actions = ['Scan', 'Orbit'];

    if (body.landable !== false) {
      actions.push('Land');
    }

    if (body.resources && body.resources.length > 0) {
      actions.push('Mine');
    }

    if (body.inhabited || body.civilization) {
      actions.push('Contact');
    }

    actions.push('Exit');

    this.uiState.popupButtons = actions;
  }

  /**
   * Open popup for space stations
   */
  openStationPopup(station) {
    this.uiState.showPopup = true;
    this.uiState.popupType = 'station';
    this.uiState.popupTarget = station;

    const actions = ['Dock', 'Trade', 'Repair', 'Refuel', 'Exit'];
    this.uiState.popupButtons = actions;
  }

  /**
   * Open popup for asteroids
   */
  openAsteroidPopup(asteroid) {
    this.uiState.showPopup = true;
    this.uiState.popupType = 'asteroid';
    this.uiState.popupTarget = asteroid;

    const actions = ['Scan', 'Mine', 'Exit'];
    this.uiState.popupButtons = actions;
  }

  /**
   * Handle popup button actions
   */
  handlePopupAction(action) {
    const target = this.uiState.popupTarget;
    const type = this.uiState.popupType;

    switch (action) {
      case 'Exit':
        this.uiState.showPopup = false;
        this.uiState.popupTarget = null;
        break;

      case 'Land':
        // Initiate landing sequence on planet/moon
        if (target && target.object) {
          const landingResult = this.attemptLanding(target.type, target.object, target.x, target.y);

          if (landingResult.success) {
            this.showNotification(`Landing on ${target.object.name}...`, 'info');
          } else {
            this.showNotification(landingResult.message, 'warning');
          }
        }
        this.uiState.showPopup = false;
        break;

      case 'Orbit':
        // Enter stable orbit around the target body
        if (target && target.object) {
          this.enterOrbit(target.type, target.object, target.x, target.y);
          this.showNotification(`Entering orbit around ${target.object.name}`, 'info');
        }
        this.uiState.showPopup = false;
        break;

      case 'Mine':
        // Start mining the target asteroid
        if (this.miningSystem && target && target.object) {
          // Set mining target directly to the asteroid object
          this.miningSystem.miningTarget = target.object;
          this.miningSystem.miningProgress = 0;
          this.miningSystem.miningActive = true;

          // Create mining beam visual
          this.miningSystem.miningBeam = {
            startX: this.player.x,
            startY: this.player.y,
            endX: target.object.x,
            endY: target.object.y,
            color: '#00ff88',
            width: 3,
            particles: []
          };

          this.showNotification('Mining started...', 'info');
        }
        this.uiState.showPopup = false;
        break;

      case 'Contact':
      case 'Dock':
      case 'Trade':
        this.uiState.showPopup = false;
        this.uiState.showTrading = true;
        break;

      case 'Repair':
        // Calculate repair needs and costs
        const repairInfo = this.calculateRepairCosts();

        if (repairInfo.totalDamage === 0) {
          this.showNotification('Ship is already at full health', 'info');
          this.uiState.showPopup = false;
        } else if (this.economySystem.credits < repairInfo.totalCost) {
          this.showNotification(`Insufficient credits! Need ${repairInfo.totalCost} credits`, 'warning');
        } else {
          // Perform repair
          this.performRepair(repairInfo);
          this.showNotification(`Ship repaired! Cost: ${repairInfo.totalCost} credits`, 'success');
          this.uiState.showPopup = false;
        }
        break;

      case 'Refuel':
        this.uiState.showPopup = false;
        this.uiState.showTrading = true;
        this.uiState.selectedTradeTab = 'refuel';
        break;

      case 'Scan':
        // Perform detailed scan of the target
        if (target && target.object) {
          const scanData = this.performDetailedScan(target.type, target.object);

          // Create scan results popup
          this.uiState.showPopup = true;
          this.uiState.popupType = 'scan_results';
          this.uiState.popupTarget = { ...target, scanData };
          this.uiState.popupButtons = [{ label: 'Close', action: 'Exit' }];

          this.showNotification('Scan complete', 'info');
        }
        break;
    }
  }

  /**
   * Perform detailed scan of a celestial body or object
   */
  performDetailedScan(targetType, targetObject) {
    const scanData = {
      name: targetObject.name || 'Unknown',
      type: targetType,
      scannedAt: Date.now()
    };

    if (targetType === 'planet' || targetType === 'moon') {
      // Planet/Moon scan
      scanData.planetType = targetObject.type || 'Unknown';
      scanData.radius = targetObject.radius;
      scanData.mass = targetObject.mass;
      scanData.distance = targetObject.distance;

      // Atmospheric composition (procedural based on planet type)
      const planetTypeLower = (targetObject.type || '').toLowerCase();
      if (planetTypeLower.includes('terran') || planetTypeLower.includes('oceanic')) {
        scanData.atmosphere = {
          present: true,
          composition: ['Nitrogen: 78%', 'Oxygen: 21%', 'Other: 1%'],
          pressure: (0.8 + Math.random() * 0.4).toFixed(2) + ' atm',
          temperature: (15 + Math.random() * 10).toFixed(1) + '°C'
        };
      } else if (planetTypeLower.includes('gas')) {
        scanData.atmosphere = {
          present: true,
          composition: ['Hydrogen: 89%', 'Helium: 10%', 'Methane: 1%'],
          pressure: (100 + Math.random() * 400).toFixed(0) + ' atm',
          temperature: (-150 + Math.random() * 100).toFixed(1) + '°C'
        };
      } else if (planetTypeLower.includes('desert') || planetTypeLower.includes('volcanic')) {
        scanData.atmosphere = {
          present: true,
          composition: ['Carbon Dioxide: 95%', 'Nitrogen: 3%', 'Other: 2%'],
          pressure: (0.01 + Math.random() * 0.1).toFixed(3) + ' atm',
          temperature: (30 + Math.random() * 50).toFixed(1) + '°C'
        };
      } else {
        scanData.atmosphere = {
          present: false,
          composition: ['None'],
          pressure: '0.00 atm',
          temperature: (-200 + Math.random() * 50).toFixed(1) + '°C'
        };
      }

      // Resource composition (procedural)
      scanData.resources = [];
      const resourceTypes = [
        { name: 'Iron', probability: 0.8, abundance: 'High' },
        { name: 'Silicon', probability: 0.7, abundance: 'Moderate' },
        { name: 'Water Ice', probability: 0.6, abundance: 'Moderate' },
        { name: 'Titanium', probability: 0.4, abundance: 'Low' },
        { name: 'Platinum', probability: 0.2, abundance: 'Trace' },
        { name: 'Rare Earth Elements', probability: 0.15, abundance: 'Trace' }
      ];

      for (const resource of resourceTypes) {
        if (Math.random() < resource.probability) {
          scanData.resources.push({
            name: resource.name,
            abundance: resource.abundance
          });
        }
      }

      // Special features
      scanData.features = [];
      if (Math.random() > 0.7) {
        scanData.features.push('Magnetic field detected');
      }
      if (Math.random() > 0.8 && scanData.atmosphere.present) {
        scanData.features.push('Signs of geological activity');
      }
      if (Math.random() > 0.95) {
        scanData.features.push('⚠ Anomalous readings detected');
        scanData.hasAnomaly = true;
      }

    } else if (targetType === 'asteroid') {
      // Asteroid scan
      scanData.size = targetObject.size;
      scanData.mass = targetObject.mass || 8;
      scanData.rotation = (targetObject.rotationSpeed * 100).toFixed(2) + ' rad/s';

      // Mineral composition
      scanData.minerals = [];
      const mineralTypes = [
        { name: 'Iron Ore', probability: 0.9, yield: '50-100 units' },
        { name: 'Silicon', probability: 0.7, yield: '30-70 units' },
        { name: 'Carbon', probability: 0.6, yield: '20-50 units' },
        { name: 'Titanium', probability: 0.3, yield: '10-30 units' },
        { name: 'Platinum', probability: 0.1, yield: '5-15 units' },
        { name: 'Exotic Matter', probability: 0.05, yield: '1-5 units' }
      ];

      for (const mineral of mineralTypes) {
        if (Math.random() < mineral.probability) {
          scanData.minerals.push({
            name: mineral.name,
            estimatedYield: mineral.yield
          });
        }
      }

      scanData.miningDifficulty = targetObject.hp > 40 ? 'High' : (targetObject.hp > 25 ? 'Moderate' : 'Low');
      scanData.estimatedValue = (targetObject.resources * 10 + Math.floor(Math.random() * 100)) + ' credits';

    } else if (targetType === 'station') {
      // Station scan
      const stationTypes = ['Trading Hub', 'Military Outpost', 'Research Station', 'Mining Station', 'Refinery'];
      scanData.stationType = stationTypes[targetObject.type] || stationTypes[0];
      scanData.operational = !targetObject.hostile;
      scanData.dockingBays = 4 + Math.floor(Math.random() * 4);
      scanData.population = (100 + Math.floor(Math.random() * 900)) + ' personnel';
      scanData.services = [];

      if (scanData.stationType.includes('Trading')) {
        scanData.services.push('Commodity Exchange', 'Ship Outfitting', 'Repair Services');
      } else if (scanData.stationType.includes('Military')) {
        scanData.services.push('Weapon Systems', 'Defense Contracts', 'Patrol Missions');
      } else if (scanData.stationType.includes('Research')) {
        scanData.services.push('Technology Blueprints', 'Artifact Analysis', 'Scientific Data');
      } else if (scanData.stationType.includes('Mining')) {
        scanData.services.push('Ore Processing', 'Mining Equipment', 'Resource Trading');
      } else if (scanData.stationType.includes('Refinery')) {
        scanData.services.push('Material Processing', 'Fuel Production', 'Component Manufacturing');
      }
    }

    return scanData;
  }

  /**
   * Calculate repair costs based on ship damage
   */
  calculateRepairCosts() {
    const p = this.player;

    // Calculate hull damage
    const hullDamage = p.maxHull - p.hull;
    const hullRepairCost = Math.ceil(hullDamage * 5); // 5 credits per hull point

    // Calculate shield damage
    const shieldDamage = p.maxShields - p.shields;
    const shieldRepairCost = Math.ceil(shieldDamage * 3); // 3 credits per shield point

    const totalDamage = hullDamage + shieldDamage;
    const totalCost = hullRepairCost + shieldRepairCost;

    return {
      hullDamage,
      hullRepairCost,
      shieldDamage,
      shieldRepairCost,
      totalDamage,
      totalCost
    };
  }

  /**
   * Perform ship repair and deduct credits
   */
  performRepair(repairInfo) {
    const p = this.player;

    // Repair hull
    p.hull = p.maxHull;

    // Repair shields
    p.shields = p.maxShields;

    // Deduct credits
    this.economySystem.credits -= repairInfo.totalCost;

    // Visual effect - flash green
    p.damageFlash = -0.5; // Negative value for repair flash (green)

    // Create repair particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      this.particles.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.4,
        size: 2 + Math.random() * 3,
        color: '#00ff88',
        alpha: 1
      });
    }
  }

  /**
   * Enter stable orbit around a celestial body
   */
  enterOrbit(targetType, targetObject, targetX, targetY) {
    const p = this.player;

    // Calculate distance from player to target
    const dx = targetX - p.x;
    const dy = targetY - p.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // ENHANCED: Better minimum distance check based on celestial body size
    const bodyRadius = targetObject.radius || 50;
    const minimumOrbitDistance = bodyRadius * 1.5; // Must be at least 1.5x the body's radius

    if (distance < minimumOrbitDistance) {
      // Too close - can't establish orbit
      this.showNotification(`Too close to establish orbit. Move to at least ${Math.floor(minimumOrbitDistance)} units away.`, 'warning');
      return;
    }

    // ENHANCED: Better orbital radius calculation for stable orbit
    // If player is very close, establish orbit at safe distance from surface
    let orbitalRadius = Math.max(distance, bodyRadius * 2);

    // Determine body mass with better scaling for different body types
    let bodyMass = targetObject.mass || (bodyRadius * bodyRadius * 0.5);  // Mass scales with radius²

    // Calculate gravitational parameter (GM)
    const G = 0.15; // ENHANCED: Slightly increased for more pronounced orbital mechanics
    const mu = G * bodyMass;

    // Calculate orbital velocity for circular orbit: v = sqrt(mu / r)
    const orbitalSpeed = Math.sqrt(mu / orbitalRadius);

    // Calculate direction perpendicular to radius vector (for circular orbit)
    // Perpendicular vector: rotate radius vector by 90 degrees
    const perpX = -dy / distance; // Perpendicular to radius
    const perpY = dx / distance;

    // Set player velocity to orbital velocity
    p.vx = perpX * orbitalSpeed;
    p.vy = perpY * orbitalSpeed;

    // Visual effect - create orbital insertion particles
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;
      this.particles.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(angle) * speed + p.vx,
        vy: Math.sin(angle) * speed + p.vy,
        life: 0.6 + Math.random() * 0.4,
        size: 1 + Math.random() * 2,
        color: this.PALETTE.warpBlue,
        alpha: 1
      });
    }

    // Store orbit information for display
    p.orbitInfo = {
      active: true,
      target: targetObject.name,
      targetType: targetType,
      targetX: targetX,
      targetY: targetY,
      radius: orbitalRadius,
      speed: orbitalSpeed
    };

    // Auto-disable orbit info after 10 seconds
    setTimeout(() => {
      if (p.orbitInfo) {
        p.orbitInfo.active = false;
      }
    }, 10000);
  }

  /**
   * Attempt to land on a celestial body
   */
  attemptLanding(targetType, targetObject, targetX, targetY) {
    const p = this.player;

    // Only planets and moons can be landed on
    if (targetType !== 'planet' && targetType !== 'moon') {
      return { success: false, message: 'Cannot land on this object' };
    }

    // Check if planet type is landable
    const planetTypeLower = (targetObject.type || '').toLowerCase();
    if (planetTypeLower.includes('gas')) {
      return { success: false, message: 'Cannot land on gas giants' };
    }

    // Calculate distance to target
    const dx = targetX - p.x;
    const dy = targetY - p.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Must be within landing range (planet radius + buffer)
    const landingRange = targetObject.radius + 50;
    if (distance > landingRange) {
      return { success: false, message: 'Too far from surface' };
    }

    // Check velocity (must be slow enough)
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 150) {
      return { success: false, message: 'Velocity too high for landing' };
    }

    // All checks passed - initiate landing
    this.performLanding(targetObject, targetX, targetY);

    return { success: true };
  }

  /**
   * Perform the landing sequence
   */
  performLanding(targetObject, targetX, targetY) {
    const p = this.player;

    // Stop all movement
    p.vx = 0;
    p.vy = 0;

    // Set landed state
    p.landed = true;
    p.landedOn = {
      name: targetObject.name,
      type: targetObject.type || 'Unknown',
      x: targetX,
      y: targetY,
      radius: targetObject.radius
    };

    // Position player on surface
    p.x = targetX;
    p.y = targetY - targetObject.radius - 20; // Just above surface

    // Landing particles (dust cloud)
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      this.particles.push({
        x: p.x,
        y: p.y + 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 50, // Spread downward
        life: 0.5 + Math.random() * 0.5,
        size: 3 + Math.random() * 5,
        color: '#aa8866', // Dust color
        alpha: 0.8
      });
    }

    // Surface resources available for collection
    p.surfaceResources = this.generateSurfaceResources(targetObject);
  }

  /**
   * Generate resources available on planet surface
   */
  generateSurfaceResources(targetObject) {
    const resources = [];
    const planetTypeLower = (targetObject.type || '').toLowerCase();

    // Different resources based on planet type
    if (planetTypeLower.includes('terran') || planetTypeLower.includes('oceanic')) {
      resources.push(
        { id: 'water', name: 'Water', quantity: 20 + Math.floor(Math.random() * 30) },
        { id: 'organic_compounds', name: 'Organic Compounds', quantity: 10 + Math.floor(Math.random() * 20) }
      );
    } else if (planetTypeLower.includes('desert') || planetTypeLower.includes('volcanic')) {
      resources.push(
        { id: 'silicon', name: 'Silicon', quantity: 15 + Math.floor(Math.random() * 25) },
        { id: 'iron', name: 'Iron Ore', quantity: 10 + Math.floor(Math.random() * 20) }
      );
    } else if (planetTypeLower.includes('ice')) {
      resources.push(
        { id: 'water_ice', name: 'Water Ice', quantity: 30 + Math.floor(Math.random() * 40) },
        { id: 'frozen_gases', name: 'Frozen Gases', quantity: 10 + Math.floor(Math.random() * 15) }
      );
    } else {
      // Rocky/unknown planets
      resources.push(
        { id: 'minerals', name: 'Minerals', quantity: 15 + Math.floor(Math.random() * 25) },
        { id: 'iron', name: 'Iron Ore', quantity: 10 + Math.floor(Math.random() * 20) }
      );
    }

    // Rare chance of special resources
    if (Math.random() > 0.8) {
      resources.push({
        id: 'rare_isotopes',
        name: 'Rare Isotopes',
        quantity: 2 + Math.floor(Math.random() * 5)
      });
    }

    return resources;
  }

  /**
   * Launch from planet surface
   */
  launchFromSurface() {
    const p = this.player;

    if (!p.landed) {
      return { success: false, message: 'Not currently landed' };
    }

    // Check fuel requirement
    const launchFuelCost = 50;
    if (p.fuel < launchFuelCost) {
      return { success: false, message: `Insufficient fuel! Need ${launchFuelCost} units` };
    }

    // Deduct fuel
    p.fuel -= launchFuelCost;

    // Clear landed state
    p.landed = false;
    p.landedOn = null;
    p.surfaceResources = null;

    // Give upward velocity
    p.vy = -200; // Launch upward

    // Launch particles (rocket exhaust)
    for (let i = 0; i < 60; i++) {
      const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.5; // Downward cone
      const speed = 100 + Math.random() * 200;
      this.particles.push({
        x: p.x,
        y: p.y + 15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.6,
        size: 4 + Math.random() * 6,
        color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00',
        alpha: 1
      });
    }

    this.showNotification(`Launched! -${launchFuelCost} fuel`, 'info');

    return { success: true };
  }

  /**
   * Collect resources from surface
   */
  collectSurfaceResources() {
    const p = this.player;

    if (!p.landed || !p.surfaceResources) {
      return { success: false, message: 'Not on a surface' };
    }

    if (p.surfaceResources.length === 0) {
      return { success: false, message: 'No resources remaining' };
    }

    const collected = [];

    for (const resource of p.surfaceResources) {
      const result = this.cargoSystem.addCargo(resource.id, resource.quantity);

      if (result.success) {
        this.resourceSystem.addResource(resource.id, resource.quantity);
        collected.push({
          name: resource.name,
          quantity: resource.quantity
        });
      } else if (result.success === 'partial') {
        this.resourceSystem.addResource(resource.id, result.added);
        collected.push({
          name: resource.name,
          quantity: result.added,
          partial: true
        });
      }
    }

    // Clear surface resources after collection
    p.surfaceResources = [];

    // Show notifications
    for (const item of collected) {
      this.showNotification(`+${item.quantity} ${item.name}`, 'success');
    }

    return { success: true, collected };
  }

  render() {
    // CRASH PREVENTION: Wrap entire render in try-catch
    try {
      const ctx = this.ctx;

      if (!ctx) {
        console.error('[Game] Canvas context is null, skipping render');
        return;
      }

      // CRITICAL FIX: Force disable image smoothing every frame (prevents blurred sprites)
      // Canvas operations can reset this, so we must enforce it each frame
      ctx.imageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;

      // CRITICAL: Don't render game content while sprites are loading
      // Show minimal loading screen
      if (this.systemLoading) {
      ctx.fillStyle = this.PALETTE.voidBlack;
      ctx.fillRect(0, 0, this.width, this.height);

      // Simple pulsing dots
      const dots = Math.floor(this.time * 2) % 4;
      const dotStr = '.'.repeat(dots);
      ctx.fillStyle = this.PALETTE.statusBlue;
      ctx.font = '18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`INITIALIZING${dotStr}`, this.width / 2, this.height / 2);

      return; // Skip rest of rendering
    }

    // PERFORMANCE: Update LOD system based on current FPS
    if (this.lodSystem) {
      this.lodSystem.updatePerformanceLevel(this.fps, 1/60);
      this.lodSystem.resetStats();
    }

    // Apply camera shake
    let shakeX = 0, shakeY = 0;
    if (this.camera.shake > 0) {
      shakeX = (Math.random() - 0.5) * this.camera.shake * 15;
      shakeY = (Math.random() - 0.5) * this.camera.shake * 15;
    }

    const camX = this.camera.x + shakeX;
    const camY = this.camera.y + shakeY;

    // OPTIMIZED: Update viewport for efficient culling
    if (this.optimizedRenderer) {
      this.optimizedRenderer.updateViewport(camX, camY, this.width, this.height);
    }

    // Background
    ctx.fillStyle = this.PALETTE.voidBlack;
    ctx.fillRect(0, 0, this.width, this.height);

    // CAMERA FIX: No zoom transforms - keep coordinate system simple for perfect centering
    // Zoom is disabled (always 1.0) so these transforms just add complexity
    ctx.save();

    // FIX: Keep zoom variable for LOD calculations (but don't apply transform)
    const zoom = this.camera.zoom || 1.0;

    // OPTIMIZED: Starfield with parallax and viewport culling
    // Pre-calculate constants outside loop for better performance
    const viewportLeft = -10;
    const viewportRight = this.width + 10;
    const viewportTop = -10;
    const viewportBottom = this.height + 10;
    const widthWrap = this.width * 4;
    const heightWrap = this.height * 4;
    const timeSin = this.time * 2.5;

    // Only render stars that are within viewport
    // PERFORMANCE: Optimized star rendering with pre-allocated values and cached length
    const starCount = this.stars.length;
    for (let i = 0; i < starCount; i++) {
      const star = this.stars[i];
      const parallax = this.PARALLAX_VALUES[star.layer];
      let sx = (star.x - camX * parallax) % widthWrap;
      let sy = (star.y - camY * parallax) % heightWrap;

      if (sx < 0) sx += widthWrap;
      if (sy < 0) sy += heightWrap;

      // Early viewport culling
      if (sx < viewportLeft || sx > viewportRight || sy < viewportTop || sy > viewportBottom) continue;

      // PERFORMANCE: Pre-calculate alpha and use cached color if available
      const brightness = star.brightness + Math.sin(timeSin + star.twinkle) * 0.2;
      if (star.cachedBaseColor) {
        // Use cached base color for faster rendering
        ctx.fillStyle = `${star.cachedBaseColor}, ${brightness})`;
      } else {
        ctx.fillStyle = star.color.replace(')', `, ${brightness})`).replace('rgb', 'rgba');
      }
      // PERFORMANCE: Bitwise OR for faster floor operation
      ctx.fillRect(sx | 0, sy | 0, star.size, star.size);
    }

    // REALISTIC UPGRADE: Render space environment (nebulae, dust, cosmic particles)
    // RE-ENABLED: Render every frame to prevent flickering
    if (this.scene === 'system' && this.spaceEnvironmentRenderer) {
      try {
        // PERFORMANCE: Reuse pre-allocated objects to reduce GC pressure
        if (!this._starPosition) this._starPosition = { x: 0, y: 0 };
        if (!this._renderViewport) this._renderViewport = { x: 0, y: 0, width: 0, height: 0 };

        this._starPosition.x = 0;
        this._starPosition.y = 0;
        this._renderViewport.x = camX;
        this._renderViewport.y = camY;
        this._renderViewport.width = this.width;
        this._renderViewport.height = this.height;
        this.spaceEnvironmentRenderer.render(
          ctx,
          this._renderViewport,
          this.time,
          this._starPosition
        );
      } catch (error) {
        // Silently continue if space environment fails to render
      }
    }

    // === INTERSTELLAR SCENE RENDERING ===
    if (this.scene === 'interstellar') {
      // Render interstellar space with star system bubbles
      this.interstellarRenderer.renderInterstellarSpace(
        ctx,
        { x: this.interstellarPlayerX, y: this.interstellarPlayerY },
        this.currentSystemIndex,
        this.interstellarPlayerX,
        this.interstellarPlayerY
      );

      // Render enhanced player ship in center (larger for interstellar travel)
      const p = this.player;
      const px = this.width / 2;
      const py = this.height / 2;
      const scale = 1.5; // Larger in interstellar space

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rotation);
      ctx.scale(scale, scale);

      // Engine glow trails (interstellar warp effect)
      // PERFORMANCE: Use cached hex alpha values for faster rendering
      const enginePulse = Math.sin(this.time * 10) * 0.3 + 0.7;
      const alpha1 = Math.max(0, Math.min(255, Math.floor(enginePulse * 100)));
      const alpha2 = Math.max(0, Math.min(255, Math.floor(enginePulse * 80)));
      ctx.fillStyle = `${this.PALETTE.warpBlue}${this.HEX_ALPHA_CACHE[alpha1]}`;
      ctx.fillRect(-18, -6, 6, 12);
      ctx.fillStyle = `${this.PALETTE.warpPurple}${this.HEX_ALPHA_CACHE[alpha2]}`;
      ctx.fillRect(-22, -4, 6, 8);

      // NO SHADOW - Clean pixelated ship without glow

      // Main hull
      ctx.fillStyle = p.damageFlash > 0.5 ? this.PALETTE.alertRed : this.PALETTE.hullPrimary;
      ctx.fillRect(-14, -9, 28, 18);

      // Hull panels
      ctx.fillStyle = this.PALETTE.hullSecondary;
      ctx.fillRect(-14, -4, 28, 3);
      ctx.fillRect(-14, 1, 28, 3);

      // Hull details
      ctx.fillStyle = this.PALETTE.darkGray;
      ctx.fillRect(-10, -9, 2, 18);
      ctx.fillRect(-4, -9, 2, 18);
      ctx.fillRect(2, -9, 2, 18);
      ctx.fillRect(8, -9, 2, 18);

      // Cockpit
      const cockpitGrad = ctx.createLinearGradient(8, -6, 16, -6);
      cockpitGrad.addColorStop(0, this.PALETTE.statusBlue);
      cockpitGrad.addColorStop(0.5, this.PALETTE.warpBlue);
      cockpitGrad.addColorStop(1, this.PALETTE.statusBlue);
      ctx.fillStyle = cockpitGrad;
      ctx.fillRect(8, -6, 9, 12);

      // Cockpit shine
      ctx.fillStyle = `${this.PALETTE.starWhite}99`;
      ctx.fillRect(9, -5, 4, 4);

      // Cockpit frame
      ctx.strokeStyle = this.PALETTE.hullHighlight;
      ctx.lineWidth = 1;
      ctx.strokeRect(8, -6, 9, 12);

      // Wings
      ctx.fillStyle = this.PALETTE.hullSecondary;
      ctx.fillRect(-10, -14, 16, 6);
      ctx.fillRect(-10, 8, 16, 6);

      // Wing tips
      ctx.fillStyle = this.PALETTE.hullHighlight;
      ctx.fillRect(4, -14, 3, 6);
      ctx.fillRect(4, 8, 3, 6);

      // Engine exhausts
      ctx.fillStyle = this.PALETTE.darkGray;
      ctx.fillRect(-14, -6, 2, 5);
      ctx.fillRect(-14, 1, 2, 5);

      // Engine glow (pulsing) - FIXED: Remove greenish glow, use only blue
      const glowColor = this.PALETTE.warpBlue;
      ctx.fillStyle = `${glowColor}${Math.floor(enginePulse * 200).toString(16).padStart(2, '0')}`;
      ctx.fillRect(-15, -5, 3, 4);
      ctx.fillRect(-15, 2, 3, 4);

      ctx.restore();

      // Render UI overlay with interstellar coordinates
      this.hudRenderer.render();

      // Add interstellar space indicator
      ctx.fillStyle = '#4488ff';
      ctx.font = 'bold 20px DigitalDisco, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('INTERSTELLAR SPACE', this.width / 2, 50);

      ctx.font = '12px DigitalDisco, monospace';
      ctx.fillStyle = '#8899aa';
      ctx.fillText(
        `Coordinates: X=${Math.floor(this.interstellarPlayerX)} Y=${Math.floor(this.interstellarPlayerY)}`,
        this.width / 2,
        75
      );

      // Render mobile controls for interstellar scene
      if (this.mobileControls) {
        this.mobileControls.render(ctx);
      }

      // Legacy touch controls (fallback)
      if ('ontouchstart' in window && this.mobileControls && !this.mobileControls.isMobile) {
        this.renderTouchControls();
      }

      // Render UI screens (inventory, trading, diplomacy, map) for interstellar scene
      if (this.uiRenderer) {
        this.uiRenderer.render(ctx);
      }

      return; // Skip system rendering
    }

    // === STAR SYSTEM SCENE RENDERING ===

    // Central star
    const starX = Math.floor(this.star.x - camX);
    const starY = Math.floor(this.star.y - camY);

    // Larger buffer for stars (up to 1200px radius, generous buffer to prevent disappearing)
    if (starX > -2000 && starX < this.width + 2000 && starY > -2000 && starY < this.height + 2000) {
      // SPRITES: Use sprite-based rendering (with emergency fallback only if sprite system failed)
      if (this.spriteManager && this.useSpriteRendering) {
        // FIXED: Normalize stellar class to match sprite generation (M0 -> M, G2 -> G, etc.)
        const rawStellarClass = this.star.stellarData?.class || this.star.stellarClass || 'G';
        const stellarClass = this.spriteManager.normalizeStellarClass(rawStellarClass);
        const spriteId = `star_${stellarClass}_${this.currentSystemData.seed}`;

        // Calculate proper scale factor to match actual star size
        // Stars larger than 100px radius are capped in sprite generation
        const MAX_SPRITE_RADIUS = 100;  // ULTRA-OPTIMIZED: Match SpriteManager's cap
        const actualRadius = this.star.radius || 720;
        const spriteScale = actualRadius > MAX_SPRITE_RADIUS ? actualRadius / MAX_SPRITE_RADIUS : 1.0;

        this.spriteManager.renderAnimatedSprite(
          ctx,
          spriteId,
          starX,
          starY,
          this.time,
          { scale: spriteScale, camX, camY }
        );
      } else if (!this.useSpriteRendering && this.star.stellarData) {
        // EMERGENCY FALLBACK: Only used if sprite system failed during initialization
        const stellarClass = this.star.stellarData.class;
        if (stellarClass === 'BlackHole' || stellarClass === 'QuasarCore') {
          this.stellarRenderer.renderBlackHole(ctx, starX, starY, this.star.radius, this.systemSeed);
        } else if (stellarClass === 'NeutronStar' || stellarClass === 'Pulsar' || stellarClass === 'Magnetar') {
          this.stellarRenderer.renderNeutronStar(ctx, starX, starY, this.star.radius, this.systemSeed);
        } else {
          this.stellarRenderer.renderStar(ctx, starX, starY, this.star.stellarData, this.systemSeed);
        }
      }
    }

    // PERFORMANCE: Disable corona ejections rendering (expensive)
    // if (this.stellarRenderer) {
    //   this.stellarRenderer.renderCoronaEjections(ctx, camX, camY);
    // }

    // OPTIMIZED: Planets - pre-calculate cosine and sine for planet loop
    // PERFORMANCE: Cache array length and use aggressive culling with LOD
    const planetCount = this.planets.length;

    for (let planetIdx = 0; planetIdx < planetCount; planetIdx++) {
      const planet = this.planets[planetIdx];
      const cosAngle = Math.cos(planet.angle);
      const sinAngle = Math.sin(planet.angle);
      const px = (this.star.x + cosAngle * planet.distance - camX) | 0;
      const py = (this.star.y + sinAngle * planet.distance - camY) | 0;

      // PERFORMANCE: LOD-based culling - check if planet should be rendered
      let planetLOD = 0; // Default to ULTRA
      if (this.lodSystem) {
        const planetWorldX = this.star.x + cosAngle * planet.distance;
        const planetWorldY = this.star.y + sinAngle * planet.distance;
        planetLOD = this.lodSystem.calculateLOD(
          planetWorldX, planetWorldY, planet.radius,
          this.camera.x, this.camera.y, zoom,
          this.width, this.height
        );

        // Skip planets that are too far or too small
        if (planetLOD >= this.lodSystem.LOD_LEVELS.HIDDEN) continue;
      } else {
        // Fallback to simple culling if LOD not available
        if (px < -1800 || px > this.width + 1800 || py < -1800 || py > this.height + 1800) continue;
      }

      // SPRITES: Use sprite-based rendering (with emergency fallback only if sprite system failed)
      if (this.spriteManager && this.useSpriteRendering) {
        const spriteId = `planet_${this.currentSystemData.seed}_${planetIdx}`;

        // FIX: Calculate dynamic shadow angle using world coordinates (not planet.x/y which don't exist)
        // Planets use distance/angle, not x/y coordinates
        const planetWorldX = this.star.x + cosAngle * planet.distance;
        const planetWorldY = this.star.y + sinAngle * planet.distance;
        const dx = this.star.x - planetWorldX;
        const dy = this.star.y - planetWorldY;
        const lightAngle = Math.atan2(dy, dx);

        const rendered = this.spriteManager.renderAnimatedSprite(
          ctx,
          spriteId,
          px,
          py,
          this.time + planetIdx * 1000,
          {
            rotation: planet.rotation || 0,
            shadowAngle: lightAngle,      // Dynamic shadow based on orbital position
            shadowIntensity: 0.7          // Slightly stronger shadows for planets
          }
        );

        // FALLBACK: If sprite not ready yet, render simple circle
        if (!rendered) {
          ctx.save();
          ctx.translate(px, py);
          ctx.beginPath();
          ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
          ctx.fillStyle = planet.color || '#888888';
          ctx.fill();
          ctx.restore();
        }
      } else if (!this.useSpriteRendering) {
        // EMERGENCY FALLBACK: Only used if sprite system failed during initialization
        ctx.save();
        ctx.translate(px, py);
        ctx.beginPath();
        ctx.arc(0, 0, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = planet.color || '#888888';
        ctx.fill();
        ctx.restore();
      }

      // Moons (use sprite or renderer) - Skip moons at LOW+ LOD
      if (planetLOD <= this.lodSystem.LOD_LEVELS.MEDIUM) {
        for (let j = 0; j < planet.moons.length; j++) {
        const moon = planet.moons[j];
        const mx = px + Math.cos(moon.angle) * moon.distance;
        const my = py + Math.sin(moon.angle) * moon.distance;

        // Culling check for moons (buffer for moon size up to 150px radius)
        if (mx < -300 || mx > this.width + 300 || my < -300 || my > this.height + 300) continue;

        // SPRITES: Use sprite-based rendering (with emergency fallback only if sprite system failed)
        if (this.spriteManager && this.useSpriteRendering) {
          const spriteId = `moon_${this.currentSystemData.seed}_${planetIdx}_${j}`;

          // FIX: Calculate moon world position correctly (planet uses distance/angle, not x/y)
          const planetWorldX = this.star.x + cosAngle * planet.distance;
          const planetWorldY = this.star.y + sinAngle * planet.distance;
          const moonWorldX = planetWorldX + Math.cos(moon.angle) * moon.distance;
          const moonWorldY = planetWorldY + Math.sin(moon.angle) * moon.distance;
          const moonDx = this.star.x - moonWorldX;
          const moonDy = this.star.y - moonWorldY;
          const moonLightAngle = Math.atan2(moonDy, moonDx);

          const rendered = this.spriteManager.renderAnimatedSprite(
            ctx,
            spriteId,
            mx,
            my,
            this.time + j * 500,
            {
              rotation: moon.angle || 0,
              shadowAngle: moonLightAngle,  // Dynamic shadow based on orbital position
              shadowIntensity: 0.7
            }
          );

          // FALLBACK: If sprite not ready yet, render simple circle
          if (!rendered) {
            ctx.save();
            ctx.translate(mx, my);
            ctx.beginPath();
            ctx.arc(0, 0, moon.radius, 0, Math.PI * 2);
            ctx.fillStyle = moon.color || '#aaaaaa';
            ctx.fill();
            ctx.restore();
          }
        } else if (!this.useSpriteRendering) {
          // EMERGENCY FALLBACK: Only used if sprite system failed during initialization
          ctx.save();
          ctx.translate(mx, my);
          ctx.beginPath();
          ctx.arc(0, 0, moon.radius, 0, Math.PI * 2);
          ctx.fillStyle = moon.color || '#aaaaaa';
          ctx.fill();
          ctx.restore();
        }
        }
      }
    }

    // Asteroids - Enhanced with 3D depth and pixelated textures
    // PERFORMANCE: Cache array length and use bitwise operations
    const asteroidCount = this.asteroids.length;
    for (let i = 0; i < asteroidCount; i++) {
      const asteroid = this.asteroids[i];
      const ax = (this.star.x + Math.cos(asteroid.angle) * asteroid.distance - camX) | 0;
      const ay = (this.star.y + Math.sin(asteroid.angle) * asteroid.distance - camY) | 0;

      // Buffer for asteroids (small but need visibility)
      if (ax < -100 || ax > this.width + 100 || ay < -100 || ay > this.height + 100) continue;

      // SPRITES: Use sprite-based rendering (with emergency fallback only if sprite system failed)
      if (this.spriteManager && this.useSpriteRendering) {
        const spriteId = `asteroid_${this.currentSystemData.seed}_${i}`;
        const rendered = this.spriteManager.renderSprite(
          ctx,
          spriteId,
          ax,
          ay,
          asteroid.rotation,
          { scale: 1.0 }
        );

        // FALLBACK: If sprite not ready, use renderer
        if (!rendered) {
          ctx.save();
          ctx.translate(ax, ay);
          ctx.rotate(asteroid.rotation);
          this.asteroidRenderer.renderAsteroid(ctx, asteroid, i, asteroid.rotation, asteroid.mined);
          ctx.restore();
        }
      } else if (!this.useSpriteRendering) {
        // EMERGENCY FALLBACK: Only used if sprite system failed during initialization
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(asteroid.rotation);
        this.asteroidRenderer.renderAsteroid(ctx, asteroid, i, asteroid.rotation, asteroid.mined);
        ctx.restore();
      }
    }

    // Stations (using sprites or enhanced renderer)
    for (let i = 0; i < this.stations.length; i++) {
      const station = this.stations[i];
      const stX = Math.floor(this.star.x + Math.cos(station.angle) * station.distance - camX);
      const stY = Math.floor(this.star.y + Math.sin(station.angle) * station.distance - camY);

      // Buffer for stations (can be 100-200px)
      if (stX < -300 || stX > this.width + 300 || stY < -300 || stY > this.height + 300) continue;

      // SPRITES: Use sprite-based rendering (with emergency fallback only if sprite system failed)
      if (this.spriteManager && this.useSpriteRendering) {
        const spriteId = `station_${this.currentSystemData.seed}_${i}`;
        const rendered = this.spriteManager.renderAnimatedSprite(
          ctx,
          spriteId,
          stX,
          stY,
          this.time + i * 300, // Offset animation per station
          { rotation: station.rotation || 0, scale: 1.0 }
        );

        // FALLBACK: If sprite not ready, use renderer
        if (!rendered) {
          this.stationRenderer.renderStation(ctx, stX, stY, station, station.rotation, this.PALETTE);
        }
      } else if (!this.useSpriteRendering) {
        // EMERGENCY FALLBACK: Only used if sprite system failed during initialization
        this.stationRenderer.renderStation(ctx, stX, stY, station, station.rotation, this.PALETTE);
      }
    }

    // Comets (with enhanced tails and pixelated nucleus)
    // OPTIMIZED: Use OptimizedRenderer for cached gradients and reduced debris
    if (this.comets) {
      for (const comet of this.comets) {
        if (this.optimizedRenderer) {
          this.optimizedRenderer.renderComet(ctx, comet, this.star.x, this.star.y, camX, camY, this.time);
          continue;
        }

        // Fallback to old rendering
        const cx = Math.floor(this.star.x + Math.cos(comet.angle) * comet.distance - camX);
        const cy = Math.floor(this.star.y + Math.sin(comet.angle) * comet.distance - camY);

        // Buffer for comets (20-25px radius + tail)
        if (cx < -500 || cx > this.width + 500 || cy < -500 || cy > this.height + 500) continue;

        ctx.save();

        // Comet tail (points away from star)
        const tailAngle = Math.atan2(cy - starY, cx - starX);
        const tailLength = comet.tailLength || 200;

        // Multi-layer tail with more depth
        // Outer gas tail (wider, blue-white)
        const gasTailGrad = ctx.createLinearGradient(
          cx, cy,
          cx + Math.cos(tailAngle) * tailLength,
          cy + Math.sin(tailAngle) * tailLength
        );
        gasTailGrad.addColorStop(0, `${this.PALETTE.statusBlue}88`);
        gasTailGrad.addColorStop(0.4, `${this.PALETTE.statusBlue}44`);
        gasTailGrad.addColorStop(1, `${this.PALETTE.statusBlue}00`);

        ctx.strokeStyle = gasTailGrad;
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(tailAngle) * tailLength,
          cy + Math.sin(tailAngle) * tailLength
        );
        ctx.stroke();

        // Middle dust tail (narrower, white-yellow)
        const dustTailGrad = ctx.createLinearGradient(
          cx, cy,
          cx + Math.cos(tailAngle) * tailLength * 0.8,
          cy + Math.sin(tailAngle) * tailLength * 0.8
        );
        dustTailGrad.addColorStop(0, `${this.PALETTE.starWhite}cc`);
        dustTailGrad.addColorStop(0.5, `${this.PALETTE.starWhite}66`);
        dustTailGrad.addColorStop(1, `${this.PALETTE.starWhite}00`);

        ctx.strokeStyle = dustTailGrad;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(tailAngle) * tailLength * 0.8,
          cy + Math.sin(tailAngle) * tailLength * 0.8
        );
        ctx.stroke();

        // Inner bright tail
        const brightTailGrad = ctx.createLinearGradient(
          cx, cy,
          cx + Math.cos(tailAngle) * tailLength * 0.5,
          cy + Math.sin(tailAngle) * tailLength * 0.5
        );
        brightTailGrad.addColorStop(0, `${this.PALETTE.starWhite}ff`);
        brightTailGrad.addColorStop(0.6, `${this.PALETTE.starWhite}88`);
        brightTailGrad.addColorStop(1, `${this.PALETTE.starWhite}00`);

        ctx.strokeStyle = brightTailGrad;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(tailAngle) * tailLength * 0.5,
          cy + Math.sin(tailAngle) * tailLength * 0.5
        );
        ctx.stroke();

        // Pixelated debris particles in tail
        const debrisCount = 30;
        for (let d = 0; d < debrisCount; d++) {
          const t = Math.random();
          const debrisX = cx + Math.cos(tailAngle) * tailLength * t;
          const debrisY = cy + Math.sin(tailAngle) * tailLength * t;
          const spread = (Math.random() - 0.5) * 20 * t;
          const dx = debrisX + Math.cos(tailAngle + Math.PI/2) * spread;
          const dy = debrisY + Math.sin(tailAngle + Math.PI/2) * spread;

          const debrisAlpha = (1 - t) * 0.6;
          const debrisColor = Math.random() > 0.5 ? this.PALETTE.starWhite : this.PALETTE.statusBlue;
          ctx.fillStyle = `${debrisColor}${Math.floor(debrisAlpha * 255).toString(16).padStart(2, '0')}`;
          ctx.fillRect(Math.floor(dx) - 1, Math.floor(dy) - 1, 2, 2);
        }

        // Enhanced comet nucleus with pixelated rocky surface
        const cometRadius = comet.radius || 22;

        // Base nucleus with depth
        const coreGrad = ctx.createRadialGradient(cx - cometRadius*0.3, cy - cometRadius*0.3, 0, cx, cy, cometRadius);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, '#eeffff');
        coreGrad.addColorStop(0.6, '#aaccff');
        coreGrad.addColorStop(1, `${this.PALETTE.statusBlue}aa`);

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, cometRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pixelated icy/rocky surface texture
        const surfacePixels = 40;
        const pixelSize = 2;
        for (let i = 0; i < surfacePixels; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * cometRadius;
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;

          const pixelType = Math.random();
          if (pixelType > 0.7) {
            // Ice patches (white/blue)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          } else if (pixelType > 0.4) {
            // Rock patches (gray)
            ctx.fillStyle = 'rgba(150, 160, 180, 0.6)';
          } else {
            // Dark crevices
            ctx.fillStyle = 'rgba(80, 100, 120, 0.5)';
          }
          ctx.fillRect(Math.floor(px) - pixelSize/2, Math.floor(py) - pixelSize/2, pixelSize, pixelSize);
        }

        // Bright coma (gas envelope around nucleus)
        const comaGrad = ctx.createRadialGradient(cx, cy, cometRadius * 0.5, cx, cy, cometRadius * 1.8);
        comaGrad.addColorStop(0, `${this.PALETTE.starWhite}66`);
        comaGrad.addColorStop(0.5, `${this.PALETTE.statusBlue}33`);
        comaGrad.addColorStop(1, `${this.PALETTE.statusBlue}00`);

        ctx.fillStyle = comaGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, cometRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Bright core highlight with pixelated sparkle
        ctx.fillStyle = this.PALETTE.starWhite;
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 5, 6, 0, Math.PI * 2);
        ctx.fill();

        // Additional sparkles
        const sparkleCount = 4;
        for (let s = 0; s < sparkleCount; s++) {
          const sparkleAngle = (s / sparkleCount) * Math.PI * 2 + this.time * 2;
          const sparkleDist = 10 + Math.sin(this.time * 3 + s) * 3;
          const sparkleSize = 2 + Math.sin(this.time * 4 + s * 0.5);
          const sx = cx + Math.cos(sparkleAngle) * sparkleDist;
          const sy = cy + Math.sin(sparkleAngle) * sparkleDist;

          ctx.fillStyle = this.PALETTE.starWhite;
          ctx.fillRect(Math.floor(sx) - sparkleSize/2, Math.floor(sy) - sparkleSize/2, sparkleSize, sparkleSize);
        }

        ctx.restore();
      }
    }

    // Artifacts
    if (this.systemArtifacts && this.systemArtifacts.length > 0) {
      for (const artifact of this.systemArtifacts) {
        this.artifactSystem.renderArtifact(
          ctx,
          artifact,
          this.star.x,
          this.star.y,
          { x: camX, y: camY },
          this.time
        );

        // Generate particles around artifacts
        this.artifactSystem.createArtifactParticles(
          artifact,
          this.star.x,
          this.star.y,
          this.particles,
          this.time
        );
      }
    }

    // Warp Gates
    if (this.systemWarpGates && this.systemWarpGates.length > 0) {
      for (let i = 0; i < this.systemWarpGates.length; i++) {
        const gate = this.systemWarpGates[i];
        const gatePos = this.warpGateSystem.getGatePosition(
          gate,
          this.star.x,
          this.star.y,
          this.systemWarpGates.length,
          i
        );

        this.warpGateSystem.renderGate(ctx, gatePos, gate, this.time, { x: camX, y: camY });

        // Generate gate particles
        this.warpGateSystem.createGateParticles(gatePos, this.particles, this.time);
      }
    }

    // Megastructures
    for (const megastructure of this.megastructures) {
      megastructure.render(ctx, { x: camX, y: camY, width: this.width, height: this.height });
    }

    // Explosions - Enhanced with pixelated debris and 3D depth
    // OPTIMIZED: Use OptimizedRenderer for cached gradients
    for (const exp of this.explosions) {
      if (this.optimizedRenderer) {
        this.optimizedRenderer.renderExplosion(ctx, exp, camX, camY);
        continue;
      }

      // Fallback to old rendering
      const ex = Math.floor(exp.x - camX);
      const ey = Math.floor(exp.y - camY);
      const alpha = exp.life / exp.maxLife;
      const invAlpha = 1 - alpha;

      ctx.save();

      // Multi-layer shockwave rings for depth
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = exp.radius * (1 + ring * 0.3);
        const ringAlpha = alpha * (1 - ring * 0.25);
        ctx.strokeStyle = `${this.PALETTE.engineOrange}${Math.floor(ringAlpha * 80).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 5 - ring;
        ctx.beginPath();
        ctx.arc(ex, ey, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Inner core - Multi-layer for 3D depth
      const coreGrad1 = ctx.createRadialGradient(ex - exp.radius * 0.2, ey - exp.radius * 0.2, 0, ex, ey, exp.radius * 0.8);
      // Use safe alpha conversion to prevent invalid hex colors
      coreGrad1.addColorStop(0, `${this.PALETTE.starWhite}${Game.alphaToHex(alpha * 255)}`);
      coreGrad1.addColorStop(0.3, `${this.PALETTE.engineBright}${Game.alphaToHex(alpha * 220)}`);
      coreGrad1.addColorStop(0.6, `${this.PALETTE.engineOrange}${Game.alphaToHex(alpha * 180)}`);
      coreGrad1.addColorStop(1, `${this.PALETTE.engineOrange}00`);
      ctx.fillStyle = coreGrad1;
      ctx.beginPath();
      ctx.arc(ex, ey, exp.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Pixelated debris field (simplified - no random for stability)
      const debrisCount = Math.floor(exp.radius * 1.5);
      const pixelSize = 3;
      for (let d = 0; d < debrisCount; d++) {
        const angle = (d / debrisCount) * Math.PI * 2 + exp.life * 0.5;
        const dist = exp.radius * (0.5 + (d % 3) * 0.3) * (1 + invAlpha * 0.5);
        const dx = ex + Math.cos(angle) * dist;
        const dy = ey + Math.sin(angle) * dist;

        // Deterministic debris type based on position
        const debrisType = (d % 10) / 10;
        let debrisColor;
        if (debrisType > 0.7) {
          // Hot debris - bright orange/yellow
          debrisColor = `rgba(255, ${Math.max(0, 200 - Math.floor(invAlpha * 100))}, 0, ${Math.min(1, alpha * 0.9)})`;
        } else if (debrisType > 0.4) {
          // Medium debris - orange
          debrisColor = `rgba(255, ${Math.max(0, 120 - Math.floor(invAlpha * 50))}, 0, ${Math.min(1, alpha * 0.7)})`;
        } else {
          // Cooler debris - dark red
          debrisColor = `rgba(${Math.max(0, 200 - Math.floor(invAlpha * 100))}, ${Math.max(0, 50 - Math.floor(invAlpha * 30))}, 0, ${Math.min(1, alpha * 0.5)})`;
        }

        // Multi-pixel debris with glow
        ctx.fillStyle = debrisColor;
        ctx.fillRect(Math.floor(dx) - 1, Math.floor(dy) - 1, pixelSize + 2, pixelSize + 2);

        // Core debris pixel
        ctx.fillStyle = debrisType > 0.7 ? `rgba(255, 255, 200, ${Math.min(1, alpha)})` : debrisColor;
        ctx.fillRect(Math.floor(dx), Math.floor(dy), pixelSize, pixelSize);
      }

      // Pixelated smoke/fire particles expanding outward (simplified - no random)
      const smokeCount = Math.floor(exp.radius * 1.2);
      const smokePixelSize = 4;
      for (let s = 0; s < smokeCount; s++) {
        const angle = (s / smokeCount) * Math.PI * 2 + exp.life;
        const dist = exp.radius * (0.6 + (s % 5) * 0.15) * (1 + invAlpha * 0.8);
        const sx = ex + Math.cos(angle) * dist;
        const sy = ey + Math.sin(angle) * dist;

        const smokeAlpha = Math.min(1, alpha * (0.4 + (s % 3) * 0.2));
        const brightness = 30 + ((s % 4) * 10);
        ctx.fillStyle = `rgba(${brightness}, ${Math.floor(brightness * 0.3)}, 0, ${smokeAlpha})`;
        ctx.fillRect(Math.floor(sx) - smokePixelSize/2, Math.floor(sy) - smokePixelSize/2, smokePixelSize, smokePixelSize);
      }

      // Bright flash at center (early in explosion)
      if (alpha > 0.7) {
        const flashIntensity = (alpha - 0.7) / 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.8})`;
        ctx.beginPath();
        ctx.arc(ex, ey, exp.radius * 0.3 * flashIntensity, 0, Math.PI * 2);
        ctx.fill();

        // Pixelated flash rays
        for (let r = 0; r < 8; r++) {
          const rayAngle = (r / 8) * Math.PI * 2 + exp.life * 2;
          const rayLength = exp.radius * flashIntensity * 0.5;
          const rayEnd = {
            x: ex + Math.cos(rayAngle) * rayLength,
            y: ey + Math.sin(rayAngle) * rayLength
          };

          ctx.strokeStyle = `rgba(255, 255, 200, ${flashIntensity * 0.6})`;
          ctx.lineWidth = 3;
          ctx.lineCap = 'square';
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(rayEnd.x, rayEnd.y);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // PERFORMANCE: Render optimized thruster effects first
    if (this.thrusterEffects) {
      this.thrusterEffects.render(this.ctx, this.particles, { x: camX, y: camY });
    }

    // OPTIMIZED: Particles with aggressive culling and batch rendering
    // Pre-calculate viewport boundaries for faster culling
    const viewLeft = camX - 50;
    const viewRight = camX + this.width + 50;
    const viewTop = camY - 50;
    const viewBottom = camY + this.height + 50;

    const particleCount = this.particles.length;
    for (let i = 0; i < particleCount; i++) {
      const p = this.particles[i];

      // PERFORMANCE: Skip particles already rendered by ThrusterEffects
      if (p.type === 'engine_exhaust' || p.type === 'rcs_puff') continue;

      // OPTIMIZED: Early culling check before position calculation
      if (p.x < viewLeft || p.x > viewRight || p.y < viewTop || p.y > viewBottom) continue;

      const px = Math.floor(p.x - camX);
      const py = Math.floor(p.y - camY);
      const alpha = p.life / p.maxLife;

      if (p.type === 'warp' || p.type === 'warp_ring') {
        // Standard warp particles with glow
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillRect(px - 3, py - 3, p.size + 2, p.size + 2);
        ctx.fillRect(px - 2, py - 2, p.size, p.size);
        ctx.globalAlpha = 1;
      } else if (p.type === 'warp_streak') {
        // Stretched warp streaks (space bending)
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha * 0.8;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - p.vx * 0.05, py - p.vy * 0.05);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (p.type === 'warp_bend') {
        // Convergence particles (tunnel effect)
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.6;
        const bendSize = p.size * (1 + (1 - alpha) * 2); // Expand as they fade
        ctx.fillRect(px - bendSize / 2, py - bendSize / 2, bendSize, bendSize);
        ctx.globalAlpha = 1;
      } else if (p.type === 'rcs' || p.type === 'retro') {
        // RCS and retro thrusters (white/blueish, tiny subtle puffs)
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.4; // REDUCED: was 0.75, now 0.4 for subtlety
        // Tiny glow
        ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
        // Core
        ctx.globalAlpha = alpha * 0.6; // REDUCED: was 0.9, now 0.6
        ctx.fillRect(px, py, p.size, p.size);
        ctx.globalAlpha = 1;
      } else if (p.type === 'shield') {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
        ctx.globalAlpha = 1;
      } else if (p.type === 'debris') {
        // ENHANCED: Realistic ship debris fragments (hull plates, engine parts, structural beams)
        ctx.save();
        ctx.translate(px, py);
        if (p.rotation !== undefined) {
          p.rotation += (p.rotationSpeed || 0) * 0.016; // Update rotation
          ctx.rotate(p.rotation);
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.9;

        // Different shapes based on debris type
        const w = p.width || p.size;
        const h = p.height || p.size;

        if (p.debrisType === 'hull' || p.debrisType === 'armor') {
          // Rectangular hull/armor plates with rivets
          ctx.fillRect(-w/2, -h/2, w, h);
          // Rivet details
          ctx.fillStyle = '#0a0a0f';
          ctx.globalAlpha = alpha * 0.6;
          ctx.fillRect(-w/2 + 1, -h/2 + 1, 1, 1);
          ctx.fillRect(w/2 - 2, -h/2 + 1, 1, 1);
        } else if (p.debrisType === 'engine') {
          // Cylindrical engine fragment (irregular polygon)
          ctx.beginPath();
          const vertices = 8;
          for (let i = 0; i < vertices; i++) {
            const angle = (i / vertices) * Math.PI * 2;
            const r = p.size * (0.7 + (i % 2) * 0.3);
            const vx = Math.cos(angle) * r;
            const vy = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.debrisType === 'structural') {
          // I-beam cross section
          ctx.fillRect(-w/2, -h/2, w, h);
          ctx.fillStyle = '#2a2a3a';
          ctx.fillRect(-w/2 + 2, -h/2 + 1, w - 4, h - 2);
        } else {
          // Generic panel - simple rectangle
          ctx.fillRect(-w/2, -h/2, w, h);
        }

        ctx.globalAlpha = 1;
        ctx.restore();
      } else if (p.type === 'smoke') {
        // Expanding smoke with fade
        const smokeSize = p.size * (1 + (1 - alpha) * (p.expansion || 1));
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillRect(px - smokeSize / 2, py - smokeSize / 2, smokeSize, smokeSize);
        ctx.globalAlpha = 1;
      } else if (p.type === 'explosion') {
        // Enhanced explosion particles with heat gradients
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.9;
        // Pixelated square with glow
        ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
        // Hot center
        if (p.heat && p.heat > 0.7) {
          ctx.fillStyle = this.PALETTE.starWhite;
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillRect(px, py, p.size, p.size);
        }
        ctx.globalAlpha = 1;
      } else if (p.type === 'missile_trail') {
        // Missile engine trail - bright orange/red glow
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillRect(px - 2, py - 2, p.size + 4, p.size + 4);
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
        ctx.globalAlpha = alpha;
        ctx.fillRect(px, py, p.size, p.size);
        ctx.globalAlpha = 1;
      } else if (p.type === 'beam_glow') {
        // Laser/beam weapon glow
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillRect(px - 2, py - 2, p.size + 4, p.size + 4);
        ctx.globalAlpha = 1;
      } else if (p.type === 'railgun_trail') {
        // Railgun contrail - blue electric trail
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillRect(px, py, p.size, p.size);
        ctx.globalAlpha = 1;
      } else if (p.type === 'ion_spark') {
        // Ion cannon electric discharge - cyan sparks
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.95;
        // Cross-shaped spark for electric effect
        ctx.fillRect(px - p.size, py, p.size * 3, p.size);
        ctx.fillRect(px, py - p.size, p.size, p.size * 3);
        ctx.globalAlpha = 1;
      } else if (p.type === 'graviton_wave') {
        // Graviton beam distortion - purple/magenta waves
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.7;
        const waveSize = p.size * (1 + (1 - alpha) * 0.5); // Slight expansion
        ctx.fillRect(px - waveSize / 2, py - waveSize / 2, waveSize, waveSize);
        ctx.globalAlpha = alpha * 0.4;
        ctx.fillRect(px - waveSize, py - waveSize, waveSize * 2, waveSize * 2);
        ctx.globalAlpha = 1;
      } else if (p.type === 'disruptor_pulse') {
        // Disruptor phase shift effect - orange/red pulses
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillRect(px - 2, py - 2, p.size + 4, p.size + 4);
        ctx.globalAlpha = 1;
      } else {
        // Default particle rendering
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillRect(px, py, p.size, p.size);
        ctx.globalAlpha = 1;
      }
    }

    // Projectiles with unique visual effects per weapon type
    for (const proj of this.projectiles) {
      const px = Math.floor(proj.x - camX);
      const py = Math.floor(proj.y - camY);

      // Weapon-specific visual effects
      switch (proj.type) {
        case 'plasma':
          // Plasma: Large glowing orb with pulsing effect
          const plasmaPulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
          ctx.fillStyle = `${proj.color}66`;
          ctx.fillRect(px - 8, py - 8, proj.size + 16, proj.size + 16);
          ctx.fillStyle = `${proj.color}aa`;
          ctx.fillRect(px - 4, py - 4, proj.size + 8, proj.size + 8);
          ctx.fillStyle = proj.color;
          ctx.fillRect(px - 1, py - 1, proj.size + 2, proj.size + 2);
          ctx.fillStyle = this.PALETTE.starWhite;
          ctx.fillRect(px + 1, py + 1, Math.max(proj.size - 2, 2), Math.max(proj.size - 2, 2));
          // Plasma trail (wider and more glowy)
          if (proj.friendly) {
            // Calculate or use stored angle to prevent trails from disappearing
            const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
            if (speed > 1) {
              proj.angle = Math.atan2(proj.vy, proj.vx);
            }
            const trailAngle = proj.angle || 0;

            for (let i = 0; i < 5; i++) {
              const trailDist = (i + 1) * 6;
              const tx = px - Math.cos(trailAngle) * trailDist;
              const ty = py - Math.sin(trailAngle) * trailDist;
              const opacity = Math.floor((1 - i / 5) * 100).toString(16).padStart(2, '0');
              ctx.fillStyle = `${proj.color}${opacity}`;
              ctx.fillRect(tx - 2, ty - 2, 4, 4);
            }
          }
          break;

        case 'kinetic':
          // Kinetic: Sharp, bullet-like with minimal glow
          ctx.fillStyle = `${proj.color}33`;
          ctx.fillRect(px - 3, py - 3, proj.size + 6, proj.size + 6);
          ctx.fillStyle = proj.color;
          ctx.fillRect(px, py, proj.size, proj.size);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 1, py + 1, Math.max(proj.size - 2, 1), Math.max(proj.size - 2, 1));
          // Kinetic trail (short and sharp)
          if (proj.friendly) {
            // Calculate or use stored angle to prevent trails from disappearing
            const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
            if (speed > 1) {
              proj.angle = Math.atan2(proj.vy, proj.vx);
            }
            const trailAngle = proj.angle || 0;

            for (let i = 0; i < 2; i++) {
              const trailDist = (i + 1) * 5;
              const tx = px - Math.cos(trailAngle) * trailDist;
              const ty = py - Math.sin(trailAngle) * trailDist;
              const opacity = Math.floor((1 - i / 2) * 120).toString(16).padStart(2, '0');
              ctx.fillStyle = `${proj.color}${opacity}`;
              ctx.fillRect(tx, ty, 2, 2);
            }
          }
          break;

        case 'missile':
          // Missile: Elongated with engine glow
          const speed1 = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
          if (speed1 > 1) {
            proj.angle = Math.atan2(proj.vy, proj.vx);
          }
          const missileAngle = proj.angle || 0;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(missileAngle);
          // Engine glow
          ctx.fillStyle = '#ff8800aa';
          ctx.fillRect(-8, -3, 6, 6);
          // Missile body
          ctx.fillStyle = proj.color;
          ctx.fillRect(-2, -2, 8, 4);
          ctx.fillStyle = '#ffcc00';
          ctx.fillRect(4, -2, 2, 4);
          // Contrail
          for (let i = 0; i < 6; i++) {
            ctx.fillStyle = `#ff8800${Math.floor((1 - i / 6) * 120).toString(16).padStart(2, '0')}`;
            ctx.fillRect(-8 - i * 3, -1, 3, 2);
          }
          ctx.restore();
          // Lock-on indicator for homing missiles
          if (proj.homingTarget && proj.friendly) {
            const targetX = Math.floor(proj.homingTarget.x - camX);
            const targetY = Math.floor(proj.homingTarget.y - camY);
            ctx.strokeStyle = '#ff8800';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(targetX, targetY, 25, 0, Math.PI * 2);
            ctx.stroke();
            // Lock-on line
            ctx.strokeStyle = `#ff880066`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
          }
          break;

        case 'laser':
          // Laser: Thin, bright beam-like
          const speed2 = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
          if (speed2 > 1) {
            proj.angle = Math.atan2(proj.vy, proj.vx);
          }
          const laserAngle = proj.angle || 0;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(laserAngle);
          // Outer glow
          ctx.fillStyle = `${proj.color}44`;
          ctx.fillRect(-2, -2, 10, 4);
          // Core beam
          ctx.fillStyle = proj.color;
          ctx.fillRect(0, -1, 8, 2);
          // Bright center line
          ctx.fillStyle = this.PALETTE.starWhite;
          ctx.fillRect(0, 0, 8, 1);
          ctx.restore();
          break;

        case 'railgun':
          // Railgun: Fast-moving streak with electromagnetic effect
          const speed3 = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
          if (speed3 > 1) {
            proj.angle = Math.atan2(proj.vy, proj.vx);
          }
          const railAngle = proj.angle || 0;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(railAngle);
          // Electromagnetic field
          ctx.fillStyle = `${proj.color}33`;
          ctx.fillRect(-3, -4, 12, 8);
          // Core projectile
          ctx.fillStyle = proj.color;
          ctx.fillRect(0, -1, 6, 2);
          ctx.fillStyle = this.PALETTE.starWhite;
          ctx.fillRect(1, 0, 4, 1);
          // Ionization trail
          for (let i = 0; i < 8; i++) {
            ctx.fillStyle = `${proj.color}${Math.floor((1 - i / 8) * 100).toString(16).padStart(2, '0')}`;
            ctx.fillRect(-4 - i * 4, -1, 3, 2);
          }
          ctx.restore();
          break;

        case 'nuclear_missile':
          // Nuclear Missile: Large warhead with pulsing red glow and intense engine
          const speed4 = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
          if (speed4 > 1) {
            proj.angle = Math.atan2(proj.vy, proj.vx);
          }
          const nuclearAngle = proj.angle || 0;
          const nuclearPulse = Math.sin(Date.now() * 0.015) * 0.4 + 0.6;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(nuclearAngle);
          // Radiation glow (large pulsing aura)
          ctx.fillStyle = `#ff0000${Math.floor(nuclearPulse * 80).toString(16).padStart(2, '0')}`;
          ctx.fillRect(-12, -8, 20, 16);
          ctx.fillStyle = `#ff4400${Math.floor(nuclearPulse * 120).toString(16).padStart(2, '0')}`;
          ctx.fillRect(-10, -6, 16, 12);
          // Engine glow (bright orange/red)
          ctx.fillStyle = `#ff6600${Math.floor(nuclearPulse * 200).toString(16).padStart(2, '0')}`;
          ctx.fillRect(-10, -4, 8, 8);
          ctx.fillStyle = '#ffaa00';
          ctx.fillRect(-8, -3, 6, 6);
          // Missile body (larger than standard missile)
          ctx.fillStyle = '#cc0000';
          ctx.fillRect(-2, -3, 10, 6);
          ctx.fillStyle = proj.color;
          ctx.fillRect(0, -2, 9, 4);
          // Warhead tip
          ctx.fillStyle = '#ffff00';
          ctx.fillRect(7, -2, 2, 4);
          ctx.fillStyle = this.PALETTE.starWhite;
          ctx.fillRect(8, -1, 1, 2);
          // Radioactive symbol on warhead
          ctx.fillStyle = '#ffff00';
          ctx.fillRect(2, -1, 1, 2);
          ctx.fillRect(4, -1, 1, 2);
          // Intense contrail with radiation particles
          for (let i = 0; i < 10; i++) {
            const trailOpacity = Math.floor((1 - i / 10) * 160 * nuclearPulse);
            ctx.fillStyle = `#ff4400${trailOpacity.toString(16).padStart(2, '0')}`;
            ctx.fillRect(-10 - i * 4, -2 - (i % 2), 4, 4 + (i % 2));
          }
          ctx.restore();
          // Lock-on indicator for nuclear missiles
          if (proj.homingTarget && proj.friendly) {
            const targetX = Math.floor(proj.homingTarget.x - camX);
            const targetY = Math.floor(proj.homingTarget.y - camY);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(targetX, targetY, 35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
            ctx.stroke();
            // Lock-on line
            ctx.strokeStyle = `#ff000066`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
          }
          break;

        case 'mine':
          // Mine: Spinning proximity device with blinking warning lights
          const mineTime = Date.now() * 0.003;
          const mineSpin = mineTime * 2;
          const mineArmed = proj.armed === true;
          const blinkRate = mineArmed ? 0.01 : 0.005;
          const blink = Math.sin(Date.now() * blinkRate) > 0.5;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(mineSpin);
          // Outer casing (octagonal)
          ctx.fillStyle = mineArmed ? '#ff4400' : '#886600';
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 7;
            const y = Math.sin(angle) * 7;
            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
          // Mine body
          ctx.fillStyle = proj.color;
          ctx.fillRect(-5, -5, 10, 10);
          ctx.fillStyle = '#cc6600';
          ctx.fillRect(-4, -4, 8, 8);
          // Warning stripes
          ctx.fillStyle = '#000000';
          ctx.fillRect(-4, -1, 8, 1);
          ctx.fillRect(-1, -4, 1, 8);
          // Blinking warning lights (when armed)
          if (blink) {
            ctx.fillStyle = mineArmed ? '#ff0000' : '#ffaa00';
            ctx.fillRect(-6, -6, 2, 2);
            ctx.fillRect(4, -6, 2, 2);
            ctx.fillRect(-6, 4, 2, 2);
            ctx.fillRect(4, 4, 2, 2);
          }
          // Center core
          ctx.fillStyle = mineArmed ? '#ff0000' : '#ffff00';
          ctx.fillRect(-2, -2, 4, 4);
          if (blink && mineArmed) {
            ctx.fillStyle = this.PALETTE.starWhite;
            ctx.fillRect(-1, -1, 2, 2);
          }
          ctx.restore();
          // Proximity radius indicator (when armed)
          if (mineArmed && proj.proximityRadius) {
            ctx.strokeStyle = '#ff440033';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(px, py, proj.proximityRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;

        case 'point_defense':
          // Point Defense: Small, fast tracer rounds with yellow glow
          const pdAngle = Math.atan2(proj.vy, proj.vx);
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(pdAngle);
          // Outer glow
          ctx.fillStyle = '#ffff0044';
          ctx.fillRect(-2, -2, 8, 4);
          // Core tracer
          ctx.fillStyle = proj.color;
          ctx.fillRect(0, -1, 6, 2);
          // Bright center
          ctx.fillStyle = this.PALETTE.starWhite;
          ctx.fillRect(1, 0, 4, 1);
          // Short tracer trail
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `#ffff00${Math.floor((1 - i / 3) * 100).toString(16).padStart(2, '0')}`;
            ctx.fillRect(-2 - i * 2, 0, 2, 1);
          }
          ctx.restore();
          break;

        default:
          // Default rendering for unknown types
          ctx.fillStyle = `${proj.color}55`;
          ctx.fillRect(px - 5, py - 5, proj.size + 10, proj.size + 10);
          ctx.fillStyle = proj.color;
          ctx.fillRect(px - 1, py - 1, proj.size + 2, proj.size + 2);
          ctx.fillStyle = this.PALETTE.starWhite;
          ctx.fillRect(px + 1, py + 1, Math.max(proj.size - 2, 2), Math.max(proj.size - 2, 2));
          if (proj.friendly) {
            for (let i = 0; i < 3; i++) {
              const trailDist = (i + 1) * 8;
              const tx = px - Math.cos(Math.atan2(proj.vy, proj.vx)) * trailDist;
              const ty = py - Math.sin(Math.atan2(proj.vy, proj.vx)) * trailDist;
              ctx.fillStyle = `${proj.color}${Math.floor((1 - i / 3) * 80).toString(16).padStart(2, '0')}`;
              ctx.fillRect(tx - 1, ty - 1, 3, 3);
            }
          }
          break;
      }
    }

    // Mining beam and effects
    if (this.miningSystem && this.miningSystem.isMining()) {
      this.miningSystem.render(ctx, { x: camX, y: camY });
    }

    // Enemies
    for (const enemy of this.enemies) {
      const ex = Math.floor(enemy.x - camX);
      const ey = Math.floor(enemy.y - camY);

      if (ex < -100 || ex > this.width + 100 || ey < -100 || ey > this.height + 100) continue;

      // Use AlienShip's render method if available
      if (enemy.render) {
        enemy.render(ctx, { x: camX, y: camY });
      } else {
        // Enhanced fallback for enemy ships with 3D depth
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(enemy.rotation);

        // Shield - Enhanced with more depth
        if (enemy.shields > 0) {
          const shieldStrength = enemy.shields / (enemy.maxShields || 100);
          const shieldRadius = 28;
          const redCore = '#ff4444';
          const orangeBright = '#ffaa44';
          const yellowLight = '#ffdd88';
          const alpha = 0.7 * shieldStrength;

          // Solid shield bubble with gradient (red/orange theme for enemies)
          const shieldGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shieldRadius);
          shieldGradient.addColorStop(0, `${redCore}00`);
          shieldGradient.addColorStop(0.5, `${redCore}${Math.floor(alpha * 80).toString(16).padStart(2, '0')}`);
          shieldGradient.addColorStop(0.85, `${orangeBright}${Math.floor(alpha * 150).toString(16).padStart(2, '0')}`);
          shieldGradient.addColorStop(1, `${yellowLight}${Math.floor(alpha * 210).toString(16).padStart(2, '0')}`);

          ctx.fillStyle = shieldGradient;
          ctx.beginPath();
          ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
          ctx.fill();

          // Edge glow
          ctx.strokeStyle = `${orangeBright}${Math.floor(alpha * 235).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Darker enemy colors
        const enemyHullDark = '#2a1010';
        const enemyHullMid = '#3a1a1a';
        const enemyHullRed = '#5a2020';

        // Multi-layer shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-9, -5, 22, 14);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-10, -6, 22, 14);

        // Main hull with 3D bevel
        ctx.fillStyle = enemy.damageFlash > 0.5 ? this.PALETTE.starWhite : enemyHullDark;
        ctx.fillRect(-12, -7, 24, 14);

        // Top edge highlight
        ctx.fillStyle = 'rgba(150, 80, 80, 0.4)';
        ctx.fillRect(-12, -7, 24, 1);
        ctx.fillRect(-12, -7, 1, 14);

        // Bottom edge shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-12, 6, 24, 1);
        ctx.fillRect(11, -7, 1, 14);

        // Pixelated hull texture
        // PERFORMANCE FIX: Use deterministic pattern based on enemy position
        // instead of Math.random() which causes flickering and performance issues
        const epx = 2;
        const seed = (enemy.x * 12345 + enemy.y * 67890) % 1000;  // Deterministic seed
        for (let x = -12; x < 12; x += epx * 2) {
          for (let y = -7; y < 7; y += epx * 2) {
            // Simple hash function for deterministic "random" values
            const hash = ((x + 12) * 31 + (y + 7) * 17 + seed) % 100;
            if (hash > 70) {  // Same threshold as before (0.7)
              const colorHash = ((x + 12) * 13 + (y + 7) * 29 + seed) % 2;
              ctx.fillStyle = colorHash === 0 ? enemyHullMid : enemyHullRed;
              ctx.fillRect(x, y, epx, epx);
            }
          }
        }

        // Hull accents with depth
        ctx.fillStyle = enemyHullMid;
        ctx.fillRect(-12, -3, 24, 3);
        ctx.fillRect(-12, 0, 24, 3);

        // Accent edges
        ctx.strokeStyle = 'rgba(100, 50, 50, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-12, -3, 24, 3);
        ctx.strokeRect(-12, 0, 24, 3);

        // Rivets
        for (const rx of [-10, -4, 2, 8]) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.beginPath();
          ctx.arc(rx, -1, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#aa4444';
          ctx.beginPath();
          ctx.arc(rx, -1, 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Enhanced cockpit with glow
        const eCockpitGrad = ctx.createRadialGradient(9, 0, 0, 9, 0, 5);
        eCockpitGrad.addColorStop(0, this.PALETTE.cautionOrange);
        eCockpitGrad.addColorStop(0.6, '#aa4400');
        eCockpitGrad.addColorStop(1, '#442200');
        ctx.fillStyle = eCockpitGrad;
        ctx.fillRect(6, -4, 6, 8);

        // Cockpit frame
        ctx.strokeStyle = '#0a0a0f';
        ctx.lineWidth = 1;
        ctx.strokeRect(6, -4, 6, 8);

        // Cockpit glow
        ctx.fillStyle = 'rgba(255, 150, 0, 0.6)';
        ctx.fillRect(7, -3, 2, 2);
        ctx.fillRect(9, -1, 2, 2);

        // Wings with 3D depth
        ctx.fillStyle = enemyHullMid;
        ctx.fillRect(-6, -10, 12, 4);
        ctx.fillRect(-6, 6, 12, 4);

        // Wing shadows
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-6, -7, 12, 1);
        ctx.fillRect(-6, 9, 12, 1);

        // Wing highlights
        ctx.fillStyle = 'rgba(150, 80, 80, 0.3)';
        ctx.fillRect(-6, -10, 12, 1);
        ctx.fillRect(-6, 6, 12, 1);

        // Wing details
        ctx.strokeStyle = '#0a0a0f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-4, -9);
        ctx.lineTo(-4, -7);
        ctx.moveTo(-4, 7);
        ctx.lineTo(-4, 9);
        ctx.stroke();

        // Engine housing with depth
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(-12, -4, 4, 8);

        ctx.strokeStyle = enemyHullDark;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-12, -4, 4, 8);

        // Engine vents
        ctx.fillStyle = '#050508';
        ctx.fillRect(-11, -3, 2, 1);
        ctx.fillRect(-11, 0, 2, 1);
        ctx.fillRect(-11, 2, 2, 1);

        // Engine glow (red/orange)
        const eGlowSize = 4;
        const eEngineGrad = ctx.createLinearGradient(-12 - eGlowSize, 0, -12, 0);
        eEngineGrad.addColorStop(0, `${this.PALETTE.engineOrange}00`);
        eEngineGrad.addColorStop(0.5, `${this.PALETTE.engineOrange}88`);
        eEngineGrad.addColorStop(1, this.PALETTE.alertRed);
        ctx.fillStyle = eEngineGrad;
        ctx.fillRect(-12 - eGlowSize, -2, eGlowSize, 4);

        ctx.fillStyle = this.PALETTE.cautionOrange;
        ctx.fillRect(-12, -1, 2, 2);

        // Weapon hardpoints with depth
        ctx.fillStyle = enemyHullDark;
        ctx.fillRect(10, -3, 4, 2);
        ctx.fillRect(10, 1, 4, 2);

        ctx.fillStyle = 'rgba(150, 80, 80, 0.4)';
        ctx.fillRect(10, -3, 4, 1);
        ctx.fillRect(10, 1, 4, 1);

        // Weapon barrels
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(14, -2, 3, 1);
        ctx.fillRect(14, 1, 3, 1);

        // Barrel glow (if firing)
        // PERFORMANCE FIX: Use time-based animation instead of random
        const firingPhase = Math.floor(this.time * 10) % 10;
        if (firingPhase === 0) {  // Fires 10% of time frames, deterministic
          ctx.fillStyle = this.PALETTE.alertRed;
          ctx.fillRect(16, -2, 2, 1);
          ctx.fillRect(16, 1, 2, 1);
        }

        ctx.restore();
      }

      // Health bar
      if (enemy.hp < enemy.maxHp) {
        const barWidth = 30;
        const barHeight = 4;
        const barX = ex - barWidth / 2;
        const barY = ey - 35;

        ctx.fillStyle = this.PALETTE.shadowGray;
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = enemy.hp > 50 ? this.PALETTE.statusGreen : (enemy.hp > 25 ? this.PALETTE.cautionOrange : this.PALETTE.alertRed);
        ctx.fillRect(barX, barY, barWidth * (enemy.hp / enemy.maxHp), barHeight);

        ctx.strokeStyle = this.PALETTE.hullHighlight;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
      }
    }

    // Player ship
    const p = this.player;
    // CAMERA FIX: Calculate player screen position (should always be centered due to camera)
    // Don't use Math.floor to avoid sub-pixel jitter
    const px = p.x - camX;
    const py = p.y - camY;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(p.rotation);

    // OLD Warp effect (DISABLED - replaced by black hole effect)
    // Skip this if black hole effect is active to prevent lag
    if (p.warpCharge > 0.15 && !this.blackHoleWarpEffect.active) {
      const warpAlpha = p.warpCharge * 0.6;
      ctx.strokeStyle = this.PALETTE.warpPurple;
      ctx.globalAlpha = warpAlpha;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Warp ring particles
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + this.time * 3;
        const radius = 40 + Math.sin(this.time * 5 + i) * 5;
        ctx.fillStyle = this.PALETTE.warpPurple;
        ctx.globalAlpha = warpAlpha;
        ctx.fillRect(
          Math.cos(angle) * radius - 2,
          Math.sin(angle) * radius - 2,
          4, 4
        );
      }
      ctx.globalAlpha = 1;
    }

    // Shield - ENHANCED Complex multi-layered energy barrier with blue/white/yellow
    // FIX: Only show shield when ACTIVATED (not just when shields > 0)
    if (p.shields > 0 && p.shieldActive) {
      const shieldStrength = p.shields / p.maxShields;
      const shieldRadius = 45; // LARGER to cover whole ship without holes
      const isActive = p.shieldActive;
      const time = this.time || 0;

      ctx.save();

      // Color scheme: Blue core, white energy, yellow highlights
      const blueCore = '#4488ff';
      const whitePure = '#ffffff';
      const yellowBright = '#ffdd44';
      const cyanLight = '#88ddff';
      const blueDeep = '#2255cc';
      const purpleDeep = '#8844ff';
      const electricBlue = '#00ddff';

      // Base alpha
      const baseAlpha = isActive ? 0.75 : 0.45;
      const alpha = baseAlpha * shieldStrength;

      // Layer 1: Solid energy field base (blue gradient)
      const fieldGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, shieldRadius);
      fieldGradient.addColorStop(0, `${blueCore}00`);
      fieldGradient.addColorStop(0.4, `${blueCore}${Math.floor(alpha * 60).toString(16).padStart(2, '0')}`);
      fieldGradient.addColorStop(0.75, `${cyanLight}${Math.floor(alpha * 140).toString(16).padStart(2, '0')}`);
      fieldGradient.addColorStop(1, `${whitePure}${Math.floor(alpha * 200).toString(16).padStart(2, '0')}`);

      ctx.fillStyle = fieldGradient;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Outer edge bright glow (white)
      ctx.strokeStyle = `${whitePure}${Math.floor(alpha * 240).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = isActive ? 3 : 2;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.stroke();

      if (isActive) {
        // Layer 3: Rotating energy rings - OPTIMIZED
        for (let ring = 0; ring < 2; ring++) {  // PERFORMANCE: Reduced from 3 to 2
          const ringRadius = shieldRadius - 5 - ring * 8;
          const ringRotation = time * (1 + ring * 0.3) + ring * Math.PI / 3;
          const ringAlpha = Math.floor((0.7 - ring * 0.2) * alpha * 180).toString(16).padStart(2, '0');

          ctx.strokeStyle = ring % 2 === 0 ? `${cyanLight}${ringAlpha}` : `${yellowBright}${ringAlpha}`;
          ctx.lineWidth = 1.5;

          // Segmented ring - PERFORMANCE: Reduced segments from 12 to 8
          for (let seg = 0; seg < 8; seg++) {
            const startAngle = (seg / 8) * Math.PI * 2 + ringRotation;
            const endAngle = startAngle + Math.PI / 6;
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, startAngle, endAngle);
            ctx.stroke();
          }
        }

        // OPTIMIZED: Flowing energy wave pulses (reduced from 3 to 2 waves)
        for (let wave = 0; wave < 2; wave++) {
          const wavePhase = (time * 3 + wave * 3) % 6;
          const waveRadius = (shieldRadius * 0.3) + (wavePhase / 6) * (shieldRadius * 0.7);
          const waveAlpha = Math.floor((1 - wavePhase / 6) * alpha * 150).toString(16).padStart(2, '0');

          ctx.strokeStyle = `${electricBlue}${waveAlpha}`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Layer 4: OPTIMIZED Fluid energy vortex particles (reduced from 50 to 30)
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
          // Smooth spiral flow with multiple frequencies
          const baseAngle = (i / particleCount) * Math.PI * 2;
          const flowAngle = baseAngle + time * 2 + Math.sin(time * 1.5 + i * 0.1) * 0.5;
          const spiralRadius = shieldRadius - 8 + Math.sin(time * 3 + i * 0.5) * 4 + Math.cos(time * 2 + i * 0.3) * 2;
          const px = Math.cos(flowAngle) * spiralRadius;
          const py = Math.sin(flowAngle) * spiralRadius;

          const particlePhase = Math.sin(time * 5 + i * 0.3);
          const particleSize = 2 + particlePhase;
          const particleColor = particlePhase > 0 ? yellowBright : whitePure;
          const particleAlpha = Math.floor((0.6 + particlePhase * 0.4) * alpha * 220).toString(16).padStart(2, '0');

          ctx.fillStyle = `${particleColor}${particleAlpha}`;
          ctx.fillRect(Math.floor(px - particleSize/2), Math.floor(py - particleSize/2), Math.ceil(particleSize), Math.ceil(particleSize));

          // OPTIMIZED: Energy trail (reduced frequency from 1/3 to 1/4)
          if (i % 4 === 0) {
            const trailAngle = flowAngle - 0.3;
            const trailRadius = spiralRadius - 2;
            const trailX = Math.cos(trailAngle) * trailRadius;
            const trailY = Math.sin(trailAngle) * trailRadius;
            const trailAlpha = Math.floor(alpha * 80).toString(16).padStart(2, '0');

            ctx.fillStyle = `${cyanLight}${trailAlpha}`;
            ctx.fillRect(Math.floor(trailX - 1), Math.floor(trailY - 1), 2, 2);
          }
        }

        // OPTIMIZED: Flowing energy streamers (reduced from 4 to 3, segments from 20 to 15)
        for (let streamer = 0; streamer < 3; streamer++) {
          const streamerBaseAngle = (streamer / 3) * Math.PI * 2 + time * 0.5;
          ctx.strokeStyle = `${purpleDeep}${Math.floor(alpha * 120).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 2;
          ctx.beginPath();

          for (let seg = 0; seg < 15; seg++) {
            const t = seg / 15;
            const angle = streamerBaseAngle + Math.sin(time * 3 + t * Math.PI * 2) * 0.4;
            const radius = shieldRadius * (0.6 + t * 0.35) + Math.sin(time * 4 + seg * 0.5) * 5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (seg === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Layer 5: Energy lightning arcs (white/yellow) - OPTIMIZED
        ctx.lineWidth = 1;
        for (let arc = 0; arc < 3; arc++) {  // PERFORMANCE: Reduced from 6 to 3
          const arcAngle = (arc / 6) * Math.PI * 2 + time * 0.8;
          const arcPhase = (time * 6 + arc) % (Math.PI * 2);
          if (Math.sin(arcPhase) < 0.3) continue; // Intermittent

          const arcAlpha = Math.floor(Math.abs(Math.sin(arcPhase)) * alpha * 200).toString(16).padStart(2, '0');
          ctx.strokeStyle = `${yellowBright}${arcAlpha}`;

          ctx.beginPath();
          const segments = 8;
          for (let s = 0; s <= segments; s++) {
            const t = s / segments;
            const r = shieldRadius * (0.5 + t * 0.5);
            // PERFORMANCE FIX: Deterministic jitter based on segment and arc index
            const angleJitter = (Math.sin(s * 2.5 + arc * 1.3) - 0.5) * 0.2;
            const posJitter = (Math.cos(s * 3.1 + arc * 1.7) - 0.5) * 3;
            const a = arcAngle + angleJitter;
            const x = Math.cos(a) * r + posJitter;
            const y = Math.sin(a) * r + posJitter;

            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Layer 6: Hexagonal energy cells (blue/cyan) - OPTIMIZED
        const hexSize = 7;
        const hexRows = 2;  // PERFORMANCE: Reduced from 5 to 2 (81% fewer hexagons)
        const hexCols = 2;  // PERFORMANCE: Reduced from 5 to 2
        const flowOffset = time * 2.5;

        for (let row = -hexRows; row <= hexRows; row++) {
          for (let col = -hexCols; col <= hexCols; col++) {
            const hexX = col * hexSize * 1.5;
            const hexY = row * hexSize * Math.sqrt(3) + (col % 2) * hexSize * Math.sqrt(3) / 2;

            const distFromCenter = Math.sqrt(hexX * hexX + hexY * hexY);
            if (distFromCenter > shieldRadius - 8) continue;

            // Multi-phase wave animation
            const wave1 = Math.sin(flowOffset + hexX * 0.12 + hexY * 0.12);
            const wave2 = Math.cos(flowOffset * 0.7 - hexX * 0.08 + hexY * 0.08);
            const wavePhase = (wave1 + wave2) * 0.5;
            const hexIntensity = wavePhase * 0.5 + 0.5;

            const hexAlpha = Math.floor(hexIntensity * alpha * 160).toString(16).padStart(2, '0');
            const hexColor = hexIntensity > 0.6 ? cyanLight : blueCore;
            ctx.strokeStyle = `${hexColor}${hexAlpha}`;
            ctx.lineWidth = 1;

            // Draw hexagon
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              const px = hexX + Math.cos(angle) * hexSize * 0.5;
              const py = hexY + Math.sin(angle) * hexSize * 0.5;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();

            // Hex core dot (yellow highlight)
            if (hexIntensity > 0.75) {
              const dotAlpha = Math.floor((hexIntensity - 0.75) * 4 * alpha * 220).toString(16).padStart(2, '0');
              ctx.fillStyle = `${yellowBright}${dotAlpha}`;
              ctx.fillRect(Math.floor(hexX - 1), Math.floor(hexY - 1), 2, 2);
            }
          }
        }

        // Layer 7: Energy streams (flowing cyan/white ribbons) - OPTIMIZED
        for (let stream = 0; stream < 4; stream++) {  // PERFORMANCE: Reduced from 10 to 4
          const streamAngle = (stream / 10) * Math.PI * 2 + time * 0.6;
          const streamPhase = (time * 5 + stream * 0.7) % (Math.PI * 2);
          const streamAlpha = (Math.sin(streamPhase) * 0.5 + 0.5) * alpha;

          const gradient = ctx.createLinearGradient(
            Math.cos(streamAngle) * 15,
            Math.sin(streamAngle) * 15,
            Math.cos(streamAngle) * shieldRadius,
            Math.sin(streamAngle) * shieldRadius
          );
          gradient.addColorStop(0, `${yellowBright}${Math.floor(streamAlpha * 240).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(0.5, `${whitePure}${Math.floor(streamAlpha * 200).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, `${cyanLight}00`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, shieldRadius - 3, streamAngle - 0.25, streamAngle + 0.25);
          ctx.stroke();
        }

        // Layer 8: Pulsing core (bright blue/white)
        const corePulse = Math.sin(time * 4) * 0.3 + 0.7;
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
        coreGradient.addColorStop(0, `${whitePure}${Math.floor(corePulse * alpha * 180).toString(16).padStart(2, '0')}`);
        coreGradient.addColorStop(0.6, `${blueCore}${Math.floor(corePulse * alpha * 100).toString(16).padStart(2, '0')}`);
        coreGradient.addColorStop(1, `${blueCore}00`);

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Layer 9: Plasma waves (flowing outward) - OPTIMIZED
        for (let wave = 0; wave < 2; wave++) {  // PERFORMANCE: Reduced from 5 to 2
          const waveTime = time * 3 - wave * 0.8;
          const waveRadius = (waveTime % 2) * (shieldRadius / 2) + shieldRadius * 0.5;
          const waveFade = 1 - ((waveTime % 2) / 2);
          const waveAlpha = Math.floor(waveFade * alpha * 150).toString(16).padStart(2, '0');

          ctx.strokeStyle = `${electricBlue}${waveAlpha}`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Layer 10: Quantum fluctuations (random energy bursts) - OPTIMIZED
        const burstCount = 20;  // PERFORMANCE: Reduced from 60 to 20 (67% fewer)
        for (let i = 0; i < burstCount; i++) {
          const angle = (i / burstCount) * Math.PI * 2;
          const burstPhase = Math.sin(time * 8 + i * 0.4);
          if (burstPhase < 0.6) continue;

          const burstRadius = shieldRadius - 5 + Math.sin(time * 10 + i) * 3;
          const burstSize = 1 + burstPhase * 2;
          const burstAlpha = Math.floor(burstPhase * alpha * 255).toString(16).padStart(2, '0');

          const bx = Math.cos(angle) * burstRadius;
          const by = Math.sin(angle) * burstRadius;

          ctx.fillStyle = `${whitePure}${burstAlpha}`;
          ctx.fillRect(Math.floor(bx - burstSize/2), Math.floor(by - burstSize/2), Math.ceil(burstSize), Math.ceil(burstSize));
        }

        // Layer 11: Energy tendrils (writhing plasma) - OPTIMIZED
        for (let tendril = 0; tendril < 4; tendril++) {  // PERFORMANCE: Reduced from 8 to 4
          const tendrilAngle = (tendril / 8) * Math.PI * 2 + time * 0.5;
          const tendrilPhase = Math.sin(time * 4 + tendril);

          ctx.strokeStyle = `${purpleDeep}${Math.floor((tendrilPhase * 0.5 + 0.5) * alpha * 180).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 2;
          ctx.beginPath();

          let prevX = 0, prevY = 0;
          for (let seg = 0; seg <= 10; seg++) {
            const t = seg / 10;
            const r = t * shieldRadius;
            const wobble = Math.sin(time * 6 + seg * 0.8 + tendril) * 5;
            const a = tendrilAngle + wobble * 0.05;
            const x = Math.cos(a) * r;
            const y = Math.sin(a) * r;

            if (seg === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            prevX = x;
            prevY = y;
          }
          ctx.stroke();
        }

        // Layer 12: Ripple interference patterns - OPTIMIZED
        for (let ripple = 0; ripple < 2; ripple++) {  // PERFORMANCE: Reduced from 4 to 2
          const rippleAngle = (ripple / 4) * Math.PI * 2 + time * 1.2;
          const ripplePhase = (time * 2 + ripple) % (Math.PI * 2);

          for (let r = 10; r < shieldRadius; r += 8) {
            const intensity = Math.sin(ripplePhase + r * 0.3) * 0.5 + 0.5;
            const rippleAlpha = Math.floor(intensity * alpha * 120).toString(16).padStart(2, '0');

            ctx.strokeStyle = `${cyanLight}${rippleAlpha}`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(
              Math.cos(rippleAngle) * 10,
              Math.sin(rippleAngle) * 10,
              r,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          }
        }

        // Layer 13: Fractal energy patterns (pixelated) - OPTIMIZED
        const fractalDetail = 24;  // PERFORMANCE: Reduced from 80 to 24 (70% fewer)
        for (let i = 0; i < fractalDetail; i++) {
          const angle = (i / fractalDetail) * Math.PI * 2;
          const noise1 = Math.sin(time * 3 + i * 0.2);
          const noise2 = Math.cos(time * 4.5 + i * 0.15);
          const noise3 = Math.sin(time * 5.7 + i * 0.25);

          const fractalRadius = shieldRadius - 8 + (noise1 + noise2 + noise3) * 3;
          const fractalBright = (noise1 + noise2 + noise3) / 3 * 0.5 + 0.5;
          const fractalAlpha = Math.floor(fractalBright * alpha * 200).toString(16).padStart(2, '0');

          const fx = Math.cos(angle) * fractalRadius;
          const fy = Math.sin(angle) * fractalRadius;

          const fractalColor = fractalBright > 0.7 ? yellowBright : (fractalBright > 0.4 ? whitePure : cyanLight);
          ctx.fillStyle = `${fractalColor}${fractalAlpha}`;
          ctx.fillRect(Math.floor(fx - 1.5), Math.floor(fy - 1.5), 3, 3);
        }

      } else {
        // Passive mode - subtle effects
        // Slow rotating segments (blue/white)
        const segmentCount = 8;
        for (let i = 0; i < segmentCount; i++) {
          const angle = (i / segmentCount) * Math.PI * 2 + time * 0.3;
          const nextAngle = ((i + 1) / segmentCount) * Math.PI * 2 + time * 0.3;
          const radius = shieldRadius - 6;

          const segAlpha = Math.floor((i % 2) * 0.4 * alpha * 100).toString(16).padStart(2, '0');
          ctx.strokeStyle = `${cyanLight}${segAlpha}`;
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
          ctx.lineTo(Math.cos(nextAngle) * radius, Math.sin(nextAngle) * radius);
          ctx.stroke();
        }

        // Shimmer effect
        const shimmer = Math.sin(time * 2.5) * 0.3 + 0.5;
        ctx.strokeStyle = `${whitePure}${Math.floor(shimmer * alpha * 100).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, shieldRadius - 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // === ENHANCED PLAYER SHIP WITH 3D DEPTH AND PIXELATED DETAILS ===

    // BUG FIX: Always use procedural rendering for reliability
    // Sprite rendering was causing ship to disappear after extended gameplay
    // Procedural rendering is guaranteed to always work
    const useSpriteForPlayer = false;  // DISABLED: Set to true to re-enable sprite rendering

    // SPRITES: Use sprite-based rendering if enabled (currently disabled)
    let playerShipRenderedWithSprite = false;
    if (useSpriteForPlayer && this.useSpriteRendering && this.spriteManager) {
      try {
        const rendered = this.spriteManager.renderSprite(
          ctx,
          'player_ship',
          0,
          0,
          0, // Rotation is handled by ctx.rotate above
          { scale: 1.0 }
        );

        if (rendered) {
          playerShipRenderedWithSprite = true;
        }
      } catch (error) {
        console.error('[Game] Player ship sprite rendering error:', error);
        playerShipRenderedWithSprite = false;
      }
    }

    // PROCEDURAL: Render procedural ship (now always used for reliability)
    if (!playerShipRenderedWithSprite) {
      // Render ship based on player's chosen ship class
      // Each class has distinct visual appearance: scout, explorer, fighter, trader, research, military
      this.shipRenderer.renderPlayerShip(ctx, p);
    }

    ctx.restore();

    // Black hole warp effect (render on top of player ship, locked to player position)
    if (this.blackHoleWarpEffect && this.blackHoleWarpEffect.active) {
      // PERFECT CENTERING: During warp, render at exact screen center for zero lag
      // Camera is set to keep ship centered (speed 25) so this should be the ship position
      const effectX = p.warpActive ? this.width / 2 : px;
      const effectY = p.warpActive ? this.height / 2 : py;
      this.blackHoleWarpEffect.render(ctx, effectX, effectY);
    }

    // FIX: Removed extra ctx.restore() - zoom transforms were removed so no second restore needed

    // HUD (rendered without zoom)
    this.hudRenderer.render();

    // Mobile controls (new system)
    if (this.mobileControls) {
      this.mobileControls.render(ctx);
    }

    // Legacy touch controls (fallback)
    if ('ontouchstart' in window && !this.mobileControls.isMobile) {
      this.renderTouchControls();
    }

    // Render UI screens (inventory, trading, diplomacy, map)
    if (this.uiRenderer) {
      this.uiRenderer.render(ctx);
    }

    // VISUAL ENHANCEMENT: Apply retro screen effects (scanlines, vignette, phosphor glow)
    if (this.retroScreenEffects) {
      this.retroScreenEffects.applyEffects(this.width, this.height);
    }
    } catch (error) {
      // CRASH PREVENTION: Log error but don't crash the game
      console.error('[Game] Render error:', error);
      console.error('[Game] Error stack:', error.stack);

      // Try to recover by clearing canvas and showing detailed error
      if (this.ctx) {
        try {
          this.ctx.fillStyle = '#000000';
          this.ctx.fillRect(0, 0, this.width, this.height);
          this.ctx.fillStyle = '#ff0000';
          this.ctx.font = '12px monospace';
          this.ctx.fillText('RENDER ERROR:', 10, 20);
          this.ctx.fillText(error.message || String(error), 10, 40);
          this.ctx.fillText('Check browser console for details (F12)', 10, 60);

          // Show error stack (first few lines)
          if (error.stack) {
            const stackLines = error.stack.split('\n').slice(0, 5);
            stackLines.forEach((line, i) => {
              this.ctx.fillText(line.substring(0, 80), 10, 80 + i * 15);
            });
          }
        } catch (e) {
          // If even recovery fails, just log and continue
          console.error('[Game] Failed to recover from render error:', e);
        }
      }
    }
  }

  /**
   * HELPER: Fill pixelated rectangle (shared by ship renderers and HUD)
   * PIXELATED: HUNDREDS OF TINY VISIBLE PIXELS - EXACTLY LIKE STAR TEXTURE
   * OPTIMIZED: Batches operations and pre-calculates shades for performance
   */
  fillPixelatedRect(ctx, x, y, width, height, color, pixelSize = 4) {
    const pixels = Math.ceil(width / pixelSize);
    const rows = Math.ceil(height / pixelSize);

    // PERFORMANCE: Cache color calculations
    if (!this._pixelColorCache) {
      this._pixelColorCache = new Map();
    }

    let colorData = this._pixelColorCache.get(color);
    if (!colorData) {
      // Parse color (handle both #RRGGBB and rgba formats)
      let r, g, b;
      if (color.startsWith('#')) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      } else {
        r = 128; g = 128; b = 128;
      }

      // ENHANCED: More color shades for richer texture (15 instead of 10)
      const shadeColors = [];
      for (let i = 0; i < 15; i++) {
        const factor = -0.6 + (i / 14) * 1.2; // INCREASED variation range
        const sr = Math.floor(Math.max(0, Math.min(255, r + factor * r * 0.6)));
        const sg = Math.floor(Math.max(0, Math.min(255, g + factor * g * 0.6)));
        const sb = Math.floor(Math.max(0, Math.min(255, b + factor * b * 0.6)));
        shadeColors.push(`rgb(${sr},${sg},${sb})`);
      }

      // ENHANCED: Add highlight colors for metallic effect
      const highlightColors = [];
      for (let i = 0; i < 5; i++) {
        const factor = 1.2 + i * 0.15;
        const hr = Math.floor(Math.min(255, r * factor));
        const hg = Math.floor(Math.min(255, g * factor));
        const hb = Math.floor(Math.min(255, b * factor));
        highlightColors.push(`rgb(${hr},${hg},${hb})`);
      }

      colorData = { shadeColors, highlightColors };
      this._pixelColorCache.set(color, colorData);
    }

    const { shadeColors, highlightColors } = colorData;
    const gridColor = 'rgba(0,0,0,0.6)'; // DARKER grid for more contrast
    const deepShadow = 'rgba(0,0,0,0.8)'; // ENHANCED: Deep shadow for depth

    // PERFORMANCE: Pre-calculate thresholds
    const totalPixels = pixels + rows;
    const highlightThreshold = pixels * 0.3;
    const highlightThresholdY = rows * 0.3;

    for (let px = 0; px < pixels; px++) {
      const xPos = x + px * pixelSize;
      const isHighlightX = px < highlightThreshold;

      for (let py = 0; py < rows; py++) {
        const yPos = y + py * pixelSize;

        // ENHANCED: Position-based shading for depth (top-left lighter, bottom-right darker)
        const depthFactor = (px + py) / totalPixels;
        const noise = Math.random();

        let selectedColor;
        if (noise < 0.05) {
          // 5% chance: Deep shadow pixel for texture
          selectedColor = deepShadow;
        } else if (noise < 0.12 && isHighlightX && py < highlightThresholdY) {
          // 7% chance on top-left: Highlight for metallic sheen
          selectedColor = highlightColors[(noise * 50) & 4]; // Fast random index 0-4
        } else {
          // Normal shading with depth gradient
          const shadeIndex = ((depthFactor * 0.6 + noise * 0.4) * 15) | 0; // Fast floor
          selectedColor = shadeColors[shadeIndex > 14 ? 14 : shadeIndex];
        }

        ctx.fillStyle = selectedColor;
        ctx.fillRect(xPos, yPos, pixelSize, pixelSize);

        // ENHANCED: Heavier grid lines with depth
        if (px > 0 && py > 0) {
          // Add subtle inner shadow at grid intersections
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(xPos, yPos, 1, 1);
        }

        // Main grid lines
        ctx.fillStyle = gridColor;
        ctx.fillRect(xPos + pixelSize - 1, yPos, 1, pixelSize);
        ctx.fillRect(xPos, yPos + pixelSize - 1, pixelSize, 1);

        // ENHANCED: Add occasional "wear" marks for detail
        if (noise > 0.97) {
          ctx.fillStyle = 'rgba(80, 80, 90, 0.4)';
          ctx.fillRect(xPos + 1, yPos + 1, pixelSize - 2, 1);
        }
      }
    }
  }

  /**
   * Scout: Small, fast, sleek design with antennas and sensors
   * ENHANCED: Pixelated textures, antennas, sleek armor panels, NO SHADOW
   */
  renderScoutShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (pixelated, sleek) ===
    this.fillPixelatedRect(ctx, -12, -6, 24, 12, p.damageFlash > 0.5 ? this.PALETTE.alertRed : hullDark, 2);

    // Armor panels (pixelated sections)
    this.fillPixelatedRect(ctx, -10, -5, 8, 10, hullMid, 2);
    this.fillPixelatedRect(ctx, 0, -5, 8, 10, hullMid, 2);

    // Panel lines (detail)
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -5, 8, 10);
    ctx.strokeRect(0, -5, 8, 10);

    // === WINGS (aerodynamic, pixelated) ===
    this.fillPixelatedRect(ctx, -8, -10, 12, 4, hullMid, 2);  // Top wing
    this.fillPixelatedRect(ctx, -8, 6, 12, 4, hullMid, 2);    // Bottom wing

    // Wing highlights
    ctx.fillStyle = metalLight;
    ctx.fillRect(-8, -9, 10, 1);
    ctx.fillRect(-8, 7, 10, 1);

    // === ANTENNAS (scout detection equipment) ===
    // Top antenna
    ctx.strokeStyle = '#6a7a8a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(2, -10);
    ctx.lineTo(2, -14);
    ctx.stroke();
    ctx.fillStyle = this.PALETTE.statusGreen;
    ctx.fillRect(1, -15, 2, 2); // Antenna tip

    // Bottom antenna
    ctx.strokeStyle = '#6a7a8a';
    ctx.beginPath();
    ctx.moveTo(2, 10);
    ctx.lineTo(2, 14);
    ctx.stroke();
    ctx.fillStyle = this.PALETTE.statusGreen;
    ctx.fillRect(1, 13, 2, 2);

    // === COCKPIT (small, pixelated, no glow) ===
    ctx.fillStyle = this.PALETTE.warpBlue;
    this.fillPixelatedRect(ctx, 8, -4, 7, 8, this.PALETTE.warpBlue, 2);

    // Cockpit window highlight
    ctx.fillStyle = '#4a5a7a';
    ctx.fillRect(9, -3, 5, 2);

    // === TWIN ENGINES (emphasized for speed, pixelated) ===
    this.fillPixelatedRect(ctx, -12, -4, 5, 3, '#0a0a0f', 2);
    this.fillPixelatedRect(ctx, -12, 1, 5, 3, '#0a0a0f', 2);

    // Engine vents
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(-11, -3, 3, 1);
    ctx.fillRect(-11, 2, 3, 1);

    // === SENSOR PODS (on wings) ===
    ctx.fillStyle = accentDark;
    ctx.fillRect(-7, -11, 2, 2);
    ctx.fillRect(-7, 9, 2, 2);

    // Sensor lights
    const sensorBlink = Math.floor(this.time * 4) % 2;
    if (sensorBlink) {
      ctx.fillStyle = this.PALETTE.statusBlue;
      ctx.fillRect(-6, -10, 1, 1);
      ctx.fillRect(-6, 10, 1, 1);
    }

    this.renderCommonShipFeatures(ctx, p, -12);
  }

  /**
   * Explorer: Balanced design with solar panels and sensors
   * ENHANCED: Pixelated textures, solar panels, sensor arrays, balanced equipment, NO SHADOW
   */
  renderExplorerShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (pixelated, balanced design) ===
    this.fillPixelatedRect(ctx, -14, -9, 28, 18, p.damageFlash > 0.5 ? this.PALETTE.alertRed : hullDark, 2);

    // Armor plating sections (visible panels)
    this.fillPixelatedRect(ctx, -12, -7, 10, 14, hullMid, 2);
    this.fillPixelatedRect(ctx, 0, -7, 10, 14, hullMid, 2);

    // Panel lines and rivets
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -7, 10, 14);
    ctx.strokeRect(0, -7, 10, 14);

    // Rivets (detail)
    ctx.fillStyle = '#1a1a1f';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-11, -5 + i * 6, 1, 1);
      ctx.fillRect(1, -5 + i * 6, 1, 1);
    }

    // === WINGS WITH SOLAR PANELS ===
    // Top wing with solar cells
    this.fillPixelatedRect(ctx, -10, -14, 16, 6, hullMid, 2);
    // Solar panel sections (blue tint)
    ctx.fillStyle = '#2a3a5a';
    ctx.fillRect(-9, -13, 4, 4);
    ctx.fillRect(-4, -13, 4, 4);
    ctx.fillRect(1, -13, 4, 4);

    // Solar cell grid lines
    ctx.strokeStyle = '#1a2a4a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(-9 + i * 5, -13, 4, 4);
    }

    // Bottom wing with solar cells
    this.fillPixelatedRect(ctx, -10, 8, 16, 6, hullMid, 2);
    ctx.fillStyle = '#2a3a5a';
    ctx.fillRect(-9, 9, 4, 4);
    ctx.fillRect(-4, 9, 4, 4);
    ctx.fillRect(1, 9, 4, 4);

    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(-9 + i * 5, 9, 4, 4);
    }

    // === SENSOR ARRAYS (on wing tips) ===
    ctx.fillStyle = accentDark;
    ctx.fillRect(6, -14, 3, 2);
    ctx.fillRect(6, 12, 3, 2);

    // Sensor lights (blinking)
    const sensorBlink = Math.floor(this.time * 3) % 2;
    if (sensorBlink) {
      ctx.fillStyle = this.PALETTE.statusGreen;
      ctx.fillRect(7, -13, 1, 1);
      ctx.fillRect(7, 12, 1, 1);
    }

    // === COCKPIT (standard, pixelated, no glow) ===
    ctx.fillStyle = this.PALETTE.warpBlue;
    this.fillPixelatedRect(ctx, 8, -6, 9, 12, this.PALETTE.warpBlue, 2);

    // Cockpit windows
    ctx.fillStyle = '#4a5a7a';
    ctx.fillRect(10, -4, 6, 3);
    ctx.fillRect(10, 1, 6, 3);

    // === SINGLE LARGE ENGINE (pixelated) ===
    this.fillPixelatedRect(ctx, -14, -6, 6, 12, '#0a0a0f', 2);

    // Engine cooling vents
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(-13, -4, 4, 2);
    ctx.fillRect(-13, 2, 4, 2);

    // Engine housing details
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(-14, -6, 6, 12);

    this.renderCommonShipFeatures(ctx, p, -14);
  }

  /**
   * Fighter: Compact, weapon-heavy design with gun turrets
   * ENHANCED: Pixelated textures, gun turrets, weapon pods, heavy armament, NO SHADOW
   */
  renderFighterShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (compact, aggressive, pixelated) ===
    this.fillPixelatedRect(ctx, -12, -8, 24, 16, p.damageFlash > 0.5 ? this.PALETTE.alertRed : hullDark, 2);

    // Heavy armor sections
    this.fillPixelatedRect(ctx, -10, -6, 8, 12, hullMid, 2);
    this.fillPixelatedRect(ctx, 0, -6, 8, 12, hullMid, 2);

    // Armor panel lines
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -6, 8, 12);
    ctx.strokeRect(0, -6, 8, 12);

    // === SWEPT WINGS (combat-oriented, pixelated) ===
    this.fillPixelatedRect(ctx, -9, -12, 14, 5, hullMid, 2);
    this.fillPixelatedRect(ctx, -9, 7, 14, 5, hullMid, 2);

    // Wing armor highlights
    ctx.fillStyle = metalLight;
    ctx.fillRect(-8, -11, 12, 1);
    ctx.fillRect(-8, 8, 12, 1);

    // === GUN TURRETS (on wings) ===
    // Top turret
    ctx.fillStyle = metalDark;
    this.fillPixelatedRect(ctx, -5, -14, 4, 3, metalDark, 1);
    // Gun barrel
    ctx.fillStyle = '#1a1a1f';
    ctx.fillRect(-4, -15, 2, 2);
    ctx.fillStyle = '#4a4a4f';
    ctx.fillRect(-3, -16, 1, 3);

    // Bottom turret
    this.fillPixelatedRect(ctx, -5, 11, 4, 3, metalDark, 1);
    ctx.fillStyle = '#1a1a1f';
    ctx.fillRect(-4, 13, 2, 2);
    ctx.fillStyle = '#4a4a4f';
    ctx.fillRect(-3, 13, 1, 3);

    // === WEAPON PODS (heavy armament) ===
    // Top weapon pod
    this.fillPixelatedRect(ctx, 12, -6, 8, 5, hullDark, 2);
    ctx.strokeStyle = metalDark;
    ctx.strokeRect(12, -6, 8, 5);
    // Weapon barrels
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(19, -5, 3, 1);
    ctx.fillRect(19, -3, 3, 1);

    // Bottom weapon pod
    this.fillPixelatedRect(ctx, 12, 1, 8, 5, hullDark, 2);
    ctx.strokeRect(12, 1, 8, 5);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(19, 2, 3, 1);
    ctx.fillRect(19, 4, 3, 1);

    // Weapon pod vents
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(14, -5, 2, 1);
    ctx.fillRect(14, 2, 2, 1);

    // === ARMORED COCKPIT (reinforced, pixelated, no glow) ===
    ctx.fillStyle = this.PALETTE.warpBlue;
    this.fillPixelatedRect(ctx, 7, -5, 8, 10, this.PALETTE.warpBlue, 2);

    // Cockpit armor frame
    ctx.strokeStyle = metalLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(7, -5, 8, 10);

    // Targeting window
    ctx.fillStyle = '#6a3a3a';
    ctx.fillRect(9, -2, 4, 4);

    // === POWERFUL ENGINES (pixelated) ===
    this.fillPixelatedRect(ctx, -12, -5, 5, 10, '#0a0a0f', 2);

    // Engine vents and cooling
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(-11, -3, 3, 2);
    ctx.fillRect(-11, 1, 3, 2);

    // Engine housing
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -5, 5, 10);

    this.renderCommonShipFeatures(ctx, p, -12);
  }

  /**
   * Trader: Large, cargo-focused design with containers and vents
   * ENHANCED: Pixelated textures, cargo containers, loading bays, cooling vents, NO SHADOW
   */
  renderTraderShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (large, boxy, pixelated) ===
    this.fillPixelatedRect(ctx, -16, -11, 32, 22, p.damageFlash > 0.5 ? this.PALETTE.alertRed : hullDark, 3);

    // Hull panel lines (industrial look)
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-16, -11, 32, 22);
    ctx.strokeRect(-15, -10, 30, 20);

    // === CARGO CONTAINERS (visible bulk, heavily pixelated) ===
    // Left cargo section
    this.fillPixelatedRect(ctx, -14, -9, 10, 18, hullMid, 3);
    // Cargo container details
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(-14, -9, 10, 18);
    ctx.strokeRect(-13, -8, 8, 16);

    // Container segments
    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(-13, -8 + i * 6, 8, 5);
    }

    // Loading bay indicators
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(-12, -6, 6, 3);
    ctx.fillRect(-12, 0, 6, 3);
    ctx.fillRect(-12, 6, 6, 3);

    // Right cargo section
    this.fillPixelatedRect(ctx, -2, -9, 10, 18, hullMid, 3);
    ctx.strokeStyle = metalDark;
    ctx.strokeRect(-2, -9, 10, 18);
    ctx.strokeRect(-1, -8, 8, 16);

    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(-1, -8 + i * 6, 8, 5);
    }

    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(0, -6, 6, 3);
    ctx.fillRect(0, 0, 6, 3);
    ctx.fillRect(0, 6, 6, 3);

    // === COOLING VENTS (heat dissipation, heavily pixelated) ===
    // Top vents
    this.fillPixelatedRect(ctx, -10, -15, 8, 3, metalDark, 2);
    ctx.strokeStyle = '#0a0a0f';
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(-10 + i * 2, -15, 1, 3);
    }

    this.fillPixelatedRect(ctx, 0, -15, 8, 3, metalDark, 2);
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(0 + i * 2, -15, 1, 3);
    }

    // Bottom vents
    this.fillPixelatedRect(ctx, -10, 12, 8, 3, metalDark, 2);
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(-10 + i * 2, 12, 1, 3);
    }

    this.fillPixelatedRect(ctx, 0, 12, 8, 3, metalDark, 2);
    for (let i = 0; i < 4; i++) {
      ctx.strokeRect(0 + i * 2, 12, 1, 3);
    }

    // Vent glow (heat)
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = this.PALETTE.cautionOrange;
    ctx.fillRect(-9, -14, 6, 1);
    ctx.fillRect(1, -14, 6, 1);
    ctx.globalAlpha = 1.0;

    // === SMALL WINGS (minimal, heavy ship) ===
    this.fillPixelatedRect(ctx, -12, -14, 10, 4, hullMid, 2);
    this.fillPixelatedRect(ctx, -12, 10, 10, 4, hullMid, 2);

    // === SMALL COCKPIT (proportionally smaller, pixelated, no glow) ===
    ctx.fillStyle = this.PALETTE.warpBlue;
    this.fillPixelatedRect(ctx, 10, -5, 7, 10, this.PALETTE.warpBlue, 2);

    // Cockpit window
    ctx.fillStyle = '#4a5a7a';
    ctx.fillRect(11, -3, 5, 6);

    // === LARGE ENGINES (heavy cargo, pixelated) ===
    this.fillPixelatedRect(ctx, -16, -7, 7, 14, '#0a0a0f', 3);

    // Engine housing and details
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(-16, -7, 7, 14);

    // Dual engine cores
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(-15, -5, 5, 4);
    ctx.fillRect(-15, 1, 5, 4);

    // Engine cooling vents
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(-14, -3, 3, 1);
    ctx.fillRect(-14, 3, 3, 1);

    this.renderCommonShipFeatures(ctx, p, -16);
  }

  /**
   * Research: Scientific vessel with satellite dishes and sensor arrays
   * ENHANCED: Pixelated textures, satellite dishes, antenna arrays, solar panels, sensor pods, NO SHADOW
   */
  renderResearchShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MAIN HULL (modular, scientific, pixelated) ===
    this.fillPixelatedRect(ctx, -14, -10, 28, 20, p.damageFlash > 0.5 ? this.PALETTE.alertRed : hullDark, 2);

    // Research modules (visible sections)
    this.fillPixelatedRect(ctx, -12, -8, 10, 16, hullMid, 2);
    this.fillPixelatedRect(ctx, 0, -8, 10, 16, hullMid, 2);

    // Module panel lines
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -8, 10, 16);
    ctx.strokeRect(0, -8, 10, 16);

    // Module segments
    for (let i = 0; i < 2; i++) {
      ctx.strokeRect(-12, -8 + i * 8, 10, 8);
      ctx.strokeRect(0, -8 + i * 8, 10, 8);
    }

    // === SENSOR ARRAYS (wings with equipment, pixelated) ===
    // Top sensor wing
    this.fillPixelatedRect(ctx, -11, -15, 18, 6, hullMid, 2);

    // Solar panels on top wing
    ctx.fillStyle = '#2a3a5a';
    ctx.fillRect(-10, -14, 4, 4);
    ctx.fillRect(-5, -14, 4, 4);
    ctx.fillRect(0, -14, 4, 4);

    // Bottom sensor wing
    this.fillPixelatedRect(ctx, -11, 9, 18, 6, hullMid, 2);

    // Solar panels on bottom wing
    ctx.fillStyle = '#2a3a5a';
    ctx.fillRect(-10, 10, 4, 4);
    ctx.fillRect(-5, 10, 4, 4);
    ctx.fillRect(0, 10, 4, 4);

    // === SATELLITE DISHES (major feature) ===
    // Top dish mount
    ctx.fillStyle = metalDark;
    ctx.fillRect(-8, -17, 2, 3);
    // Dish (circular)
    ctx.strokeStyle = metalLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-7, -18, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.arc(-7, -18, 2, 0, Math.PI * 2);
    ctx.fill();

    // Bottom dish mount
    ctx.fillStyle = metalDark;
    ctx.fillRect(-8, 14, 2, 3);
    // Dish
    ctx.strokeStyle = metalLight;
    ctx.beginPath();
    ctx.arc(-7, 18, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.arc(-7, 18, 2, 0, Math.PI * 2);
    ctx.fill();

    // === ANTENNA ARRAYS (multiple antennas) ===
    // Top antennas
    ctx.strokeStyle = '#6a7a8a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0 + i * 3, -15);
      ctx.lineTo(0 + i * 3, -19);
      ctx.stroke();
      // Antenna tips
      ctx.fillStyle = this.PALETTE.statusGreen;
      ctx.fillRect(-1 + i * 3, -20, 2, 2);
    }

    // Bottom antennas
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0 + i * 3, 15);
      ctx.lineTo(0 + i * 3, 19);
      ctx.stroke();
      ctx.fillStyle = this.PALETTE.statusGreen;
      ctx.fillRect(-1 + i * 3, 17, 2, 2);
    }

    // === SENSOR PODS (on wing tips, heavily pixelated) ===
    this.fillPixelatedRect(ctx, -10, -14, 3, 4, accentDark, 1);
    this.fillPixelatedRect(ctx, 5, -14, 3, 4, accentDark, 1);
    this.fillPixelatedRect(ctx, -10, 10, 3, 4, accentDark, 1);
    this.fillPixelatedRect(ctx, 5, 10, 3, 4, accentDark, 1);

    // Sensor pod lights (blinking)
    const sensorBlink = Math.floor(this.time * 3) % 2;
    if (sensorBlink) {
      ctx.fillStyle = this.PALETTE.statusBlue;
      ctx.fillRect(-9, -13, 1, 1);
      ctx.fillRect(6, -13, 1, 1);
      ctx.fillRect(-9, 11, 1, 1);
      ctx.fillRect(6, 11, 1, 1);
    }

    // === LARGE OBSERVATION COCKPIT (pixelated, no glow) ===
    ctx.fillStyle = this.PALETTE.warpBlue;
    this.fillPixelatedRect(ctx, 7, -7, 10, 14, this.PALETTE.warpBlue, 2);

    // Observation windows (larger for research)
    ctx.fillStyle = '#4a5a7a';
    ctx.fillRect(9, -5, 7, 4);
    ctx.fillRect(9, 1, 7, 4);

    // === STANDARD ENGINES (pixelated) ===
    this.fillPixelatedRect(ctx, -14, -6, 6, 12, '#0a0a0f', 2);

    // Engine housing
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(-14, -6, 6, 12);

    // Engine vents
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(-13, -4, 4, 2);
    ctx.fillRect(-13, 2, 4, 2);

    this.renderCommonShipFeatures(ctx, p, -14);
  }

  /**
   * Military: Heavy destroyer with armor plating, gun turrets, and energy core
   * ENHANCED: Heavily pixelated textures, armor plating, gun turrets, energy core, quad engines, NO SHADOW
   */
  renderMilitaryShip(ctx, p, hullDark, hullMid, hullLight, accentDark, metalDark, metalLight) {
    // === MASSIVE ARMORED HULL (heavily pixelated) ===
    this.fillPixelatedRect(ctx, -17, -12, 34, 24, p.damageFlash > 0.5 ? this.PALETTE.alertRed : hullDark, 3);

    // === HEAVY ARMOR PLATING (visible segments, heavily pixelated) ===
    // Left armor section
    this.fillPixelatedRect(ctx, -15, -10, 12, 20, hullMid, 3);
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 2;
    ctx.strokeRect(-15, -10, 12, 20);

    // Armor plate segments
    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(-15, -10 + i * 7, 12, 6);
    }

    // Right armor section
    this.fillPixelatedRect(ctx, -1, -10, 12, 20, hullMid, 3);
    ctx.strokeRect(-1, -10, 12, 20);

    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(-1, -10 + i * 7, 12, 6);
    }

    // Armor panel highlights
    ctx.fillStyle = metalLight;
    ctx.fillRect(-14, -9, 10, 1);
    ctx.fillRect(0, -9, 10, 1);

    // Rivets on armor (heavy industrial detail)
    ctx.fillStyle = '#1a1a1f';
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        ctx.fillRect(-14 + j * 10, -8 + i * 4, 2, 2);
        ctx.fillRect(1 + j * 9, -8 + i * 4, 2, 2);
      }
    }

    // === ARMOR WING EXTENSIONS (short, thick) ===
    this.fillPixelatedRect(ctx, -13, -16, 16, 5, hullMid, 3);
    this.fillPixelatedRect(ctx, -13, 11, 16, 5, hullMid, 3);

    // Wing armor panels
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(-13, -16, 16, 5);
    ctx.strokeRect(-13, 11, 16, 5);

    // === GUN TURRETS (multiple turrets) ===
    // Top-left turret
    ctx.fillStyle = metalDark;
    this.fillPixelatedRect(ctx, -10, -18, 5, 4, metalDark, 2);
    ctx.strokeStyle = '#0a0a0f';
    ctx.strokeRect(-10, -18, 5, 4);
    // Gun barrels
    ctx.fillStyle = '#1a1a1f';
    ctx.fillRect(-9, -19, 2, 2);
    ctx.fillRect(-6, -19, 2, 2);
    ctx.fillStyle = '#4a4a4f';
    ctx.fillRect(-9, -20, 2, 3);
    ctx.fillRect(-6, -20, 2, 3);

    // Top-right turret
    this.fillPixelatedRect(ctx, 0, -18, 5, 4, metalDark, 2);
    ctx.strokeRect(0, -18, 5, 4);
    ctx.fillStyle = '#1a1a1f';
    ctx.fillRect(1, -19, 2, 2);
    ctx.fillRect(4, -19, 2, 2);
    ctx.fillStyle = '#4a4a4f';
    ctx.fillRect(1, -20, 2, 3);
    ctx.fillRect(4, -20, 2, 3);

    // Bottom-left turret
    this.fillPixelatedRect(ctx, -10, 14, 5, 4, metalDark, 2);
    ctx.strokeRect(-10, 14, 5, 4);
    ctx.fillStyle = '#1a1a1f';
    ctx.fillRect(-9, 17, 2, 2);
    ctx.fillRect(-6, 17, 2, 2);
    ctx.fillStyle = '#4a4a4f';
    ctx.fillRect(-9, 17, 2, 3);
    ctx.fillRect(-6, 17, 2, 3);

    // Bottom-right turret
    this.fillPixelatedRect(ctx, 0, 14, 5, 4, metalDark, 2);
    ctx.strokeRect(0, 14, 5, 4);
    ctx.fillStyle = '#1a1a1f';
    ctx.fillRect(1, 17, 2, 2);
    ctx.fillRect(4, 17, 2, 2);
    ctx.fillStyle = '#4a4a4f';
    ctx.fillRect(1, 17, 2, 3);
    ctx.fillRect(4, 17, 2, 3);

    // === HEAVY WEAPON PODS (on front) ===
    // Top weapon pod
    this.fillPixelatedRect(ctx, 15, -8, 9, 6, hullDark, 3);
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 2;
    ctx.strokeRect(15, -8, 9, 6);
    // Weapon barrels
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(23, -7, 4, 2);
    ctx.fillRect(23, -4, 4, 2);

    // Bottom weapon pod
    this.fillPixelatedRect(ctx, 15, 2, 9, 6, hullDark, 3);
    ctx.strokeRect(15, 2, 9, 6);
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(23, 3, 4, 2);
    ctx.fillRect(23, 6, 4, 2);

    // === ENERGY CORE (glowing center, animated) ===
    const corePulse = Math.sin(this.time * 5) * 0.3 + 0.7;
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
    coreGrad.addColorStop(0, `rgba(100, 200, 255, ${corePulse})`);
    coreGrad.addColorStop(0.5, 'rgba(50, 100, 200, 0.5)');
    coreGrad.addColorStop(1, 'rgba(20, 40, 80, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Energy core housing (pixelated)
    this.fillPixelatedRect(ctx, -4, -4, 8, 8, '#2a3a5a', 2);
    ctx.strokeStyle = metalLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(-4, -4, 8, 8);

    // Core vents
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(-3, -3, 2, 6);
    ctx.fillRect(1, -3, 2, 6);

    // === ARMORED BRIDGE (reinforced, pixelated, no glow) ===
    ctx.fillStyle = this.PALETTE.warpBlue;
    this.fillPixelatedRect(ctx, 10, -7, 9, 14, this.PALETTE.warpBlue, 2);

    // Bridge armor frame
    ctx.strokeStyle = metalLight;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, -7, 9, 14);

    // Command windows
    ctx.fillStyle = '#5a6a8a';
    ctx.fillRect(12, -5, 6, 3);
    ctx.fillRect(12, 2, 6, 3);

    // === QUAD ENGINES (maximum power, heavily pixelated) ===
    // Top engines
    this.fillPixelatedRect(ctx, -17, -9, 7, 6, '#0a0a0f', 3);
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(-17, -9, 7, 6);

    // Bottom engines
    this.fillPixelatedRect(ctx, -17, 3, 7, 6, '#0a0a0f', 3);
    ctx.strokeRect(-17, 3, 7, 6);

    // Engine cores
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(-16, -7, 5, 4);
    ctx.fillRect(-16, 4, 5, 4);

    // Engine cooling vents
    ctx.fillStyle = '#2a2a3a';
    for (let i = 0; i < 2; i++) {
      ctx.fillRect(-15, -6 + i * 2, 3, 1);
      ctx.fillRect(-15, 5 + i * 2, 3, 1);
    }

    this.renderCommonShipFeatures(ctx, p, -17);
  }

  /**
   * Common features all ships share: engine glow, thrusters, lights
   * REMOVED: Engine glow for cleaner ship appearance
   */
  renderCommonShipFeatures(ctx, p, engineX) {
    // Engine exhaust (small pixelated flame, no glow)
    if (this.input.thrust > 0) {
      const enginePulse = Math.sin(this.time * 20) * 0.3 + 0.7;

      // Small bright exhaust flame (no gradient glow)
      ctx.fillStyle = this.PALETTE.engineBright;
      ctx.fillRect(engineX - 4, -2, 4, 4);

      // Inner bright core
      ctx.fillStyle = this.PALETTE.starWhite;
      ctx.fillRect(engineX - 2, -1, 2, 2);
    }

    // Side thrusters for turning
    if (p.angularVelocity < -0.01) {
      const thrustIntensity = Math.min(Math.abs(p.angularVelocity) * 20, 1);
      const thrustPulse = Math.sin(this.time * 25) * 0.4 + 0.6;
      ctx.fillStyle = `${this.PALETTE.engineOrange}${Game.alphaToHex(thrustIntensity * thrustPulse * 180)}`;
      ctx.fillRect(8, 8, 3, 6);
    }
    if (p.angularVelocity > 0.01) {
      const thrustIntensity = Math.min(Math.abs(p.angularVelocity) * 20, 1);
      const thrustPulse = Math.sin(this.time * 25) * 0.4 + 0.6;
      ctx.fillStyle = `${this.PALETTE.engineOrange}${Game.alphaToHex(thrustIntensity * thrustPulse * 180)}`;
      ctx.fillRect(8, -14, 3, 6);
    }

    // Navigation lights
    const blinkPhase = Math.floor(this.time * 3) % 2;
    if (blinkPhase) {
      ctx.fillStyle = this.PALETTE.alertRed;
      ctx.fillRect(-10, -14, 2, 2);
      ctx.fillStyle = this.PALETTE.statusGreen;
      ctx.fillRect(-10, 12, 2, 2);
    }
  }

  /**
   * Main game loop that updates physics and renders the game at 60 FPS.
   */
  loop() {
    if (!this.running) return;

    try {
      const frameStart = performance.now();
      const now = frameStart;
      // FIXED: Tighter dt cap to prevent teleporting (0.033 = ~30fps min)
      const dt = Math.min((now - this.lastTime) / 1000, 0.033);
      this.lastTime = now;

      // Frame budget: 16ms for 60fps, 33ms for 30fps
      const FRAME_BUDGET = 16; // Target 60fps

      // If paused (UI screens open), skip physics but still render
      if (this.paused) {
        // Still render to show UI screens
        this.render();
        requestAnimationFrame(() => this.loop());
        return;
      }

      this.time += dt;

      // Update playtime
      this.playtime += dt * 1000; // Convert to milliseconds
      if (this.statistics) {
        this.statistics.totalPlaytime = this.playtime;
      }

      this.fps = this.fps * 0.9 + (1 / dt) * 0.1;

      // PERFORMANCE FIX: Enforce array size limits to prevent memory leaks
      if (this.particles && this.particles.length > this.maxParticles) {
        this.particles = this.particles.slice(-this.maxParticles);  // Keep only newest
      }
      if (this.projectiles && this.projectiles.length > 100) {
        this.projectiles = this.projectiles.slice(-100);  // Keep only newest 100
      }
      if (this.explosions && this.explosions.length > 50) {
        this.explosions = this.explosions.slice(-50);  // Keep only newest 50
      }
      if (this.enemies && this.enemies.length > 50) {
        // Remove enemies farthest from player to keep performance good
        this.enemies.sort((a, b) => {
          const distA = Math.hypot(a.x - this.player.x, a.y - this.player.y);
          const distB = Math.hypot(b.x - this.player.x, b.y - this.player.y);
          return distB - distA;  // Farthest first
        });
        this.enemies = this.enemies.slice(0, 50);
      }
      if (this.notifications && this.notifications.length > 10) {
        this.notifications = this.notifications.slice(-10);  // Keep only newest 10
      }

      // PERFORMANCE: Broadcast state disabled - no longer needed as GameContainer uses ref
      // State is accessed via gameInstanceRef.current.getGameState() when needed
      // This saves CPU cycles by not dispatching unused events every 2 seconds

      // Update performance optimizer (FPS monitoring, adaptive quality, cleanup)
      if (this.performanceOptimizer) {
        this.performanceOptimizer.update(dt);
        // Run cleanup every 2 seconds to manage memory
        if (Math.floor(this.time) % 2 === 0 && this.time - Math.floor(this.time) < dt) {
          this.performanceOptimizer.cleanup();
        }
      }

      // OPTIMIZED: Update enhanced effects every other frame
      if (this.enhancedEffects) {
        if (!this._enhancedEffectsCounter) this._enhancedEffectsCounter = 0;
        this._enhancedEffectsCounter++;
        if (this._enhancedEffectsCounter >= 2) {
          this._enhancedEffectsCounter = 0;
          this.enhancedEffects.update(dt * 2); // Scale dt for missed frame
        }
      }

      // OPTIMIZED: Update retro screen effects every other frame
      if (this.retroScreenEffects) {
        if (!this._retroEffectsCounter) this._retroEffectsCounter = 0;
        this._retroEffectsCounter++;
        if (this._retroEffectsCounter >= 2) {
          this._retroEffectsCounter = 0;
          this.retroScreenEffects.update(dt * 2); // Scale dt for missed frame
        }
      }

      // PERFORMANCE: Disable stellar renderer updates (corona ejections, etc.)
      // if (this.stellarRenderer && this.fps > 30) {
      //   if (!this._stellarUpdateCounter) this._stellarUpdateCounter = 0;
      //   this._stellarUpdateCounter++;
      //   if (this._stellarUpdateCounter >= 3) {
      //     this._stellarUpdateCounter = 0;
      //     this.stellarRenderer.update(dt * 3);
      //   }
      // }

      // NOTE: Celestial renderer update removed - using sprite-based rendering only

      // OPTIMIZED: Update mobile controls only if actually in use
      if (this.mobileControls && this.mobileControls.isMobile) {
        this.mobileControls.update();
      }

      // OPTIMIZED: Update interaction system every other frame
      if (this.interactionSystem) {
        if (!this._interactionUpdateCounter) this._interactionUpdateCounter = 0;
        this._interactionUpdateCounter++;
        if (this._interactionUpdateCounter >= 2) {
          this._interactionUpdateCounter = 0;
          this.interactionSystem.update();
        }
      }

      // CRASH FIX: Wrap critical operations in try-catch
      try {
        this.processInput();
      } catch (error) {
        console.error('[Game Loop] Input processing error:', error);
      }

      try {
        this.physicsEngine.update(dt);
      } catch (error) {
        console.error('[Game Loop] Physics update error:', error);
      }

      try {
        this.render();
      } catch (error) {
        console.error('[Game Loop] Render error:', error);
      }

      requestAnimationFrame(() => this.loop());
    } catch (error) {
      console.error('[Game Loop] Critical error in game loop:', error);
      console.error('[Game Loop] Error stack:', error.stack);
      // Try to continue running despite the error
      requestAnimationFrame(() => this.loop());
    }
  }

  /**
   * Get current game state for saving
   */
  getGameState() {
    return {
      // Version for save compatibility
      version: this.VERSION,

      // Player info
      callsign: this.player.callsign || 'NOVA-7',
      shipName: this.player.shipName || 'WANDERER',
      shipColor: this.player.color || 'blue',

      // Game progress
      playtime: this.playtime || 0,
      currentSystem: this.currentSystemSeed,
      currentSystemIndex: this.currentSystemIndex,
      systemsExplored: this.discoveredSystems.size,
      galaxySize: this.galaxySize || 'medium',
      difficulty: this.difficulty || 'adventurer',
      seed: this.seed,

      // Player state
      player: {
        x: this.player.x,
        y: this.player.y,
        vx: this.player.vx,
        vy: this.player.vy,
        rotation: this.player.rotation,
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        shield: this.player.shield,
        maxShield: this.player.maxShield,
        power: this.player.power,
        maxPower: this.player.maxPower,
        fuel: this.player.fuel,
        maxFuel: this.player.maxFuel,
        callsign: this.player.callsign || 'NOVA-7',
        shipName: this.player.shipName || 'WANDERER',
        color: this.player.color || 'blue',
      },

      // Camera position
      camera: {
        x: this.camera.x,
        y: this.camera.y,
        zoom: this.camera.zoom,
      },

      // Interstellar mode position
      interstellarPlayerX: this.interstellarPlayerX,
      interstellarPlayerY: this.interstellarPlayerY,

      // Economy
      credits: this.credits || 0,
      cargo: this.cargo || [],

      // Discovered systems
      discoveredSystems: Array.from(this.discoveredSystems),

      // Scene
      scene: this.scene,

      // Statistics
      statistics: this.statistics || {
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
      crewAlive: this.player.hp > 0,
      gameOver: this.gameOver || false,
    };
  }

  /**
   * Load saved game state
   */
  async loadState(state) {
    if (!state) {
      console.warn('No state provided to loadState, skipping');
      return;
    }

    // Don't load state for brand new games (no playtime)
    if (!state.playtime || state.playtime === 0) {
      return;
    }


    try {
      // Check version compatibility
      if (state.version && state.version !== this.VERSION) {
        console.warn(`Save version mismatch: ${state.version} vs ${this.VERSION}`);
      }

      // Restore game progress
      if (state.playtime !== undefined) this.playtime = state.playtime;
      if (state.seed) this.seed = state.seed;
      if (state.currentSystem) this.currentSystemSeed = state.currentSystem;
      if (state.currentSystemIndex !== undefined) this.currentSystemIndex = state.currentSystemIndex;
      if (state.galaxySize) this.galaxySize = state.galaxySize;
      if (state.difficulty) this.difficulty = state.difficulty;

      // Restore player state
      if (state.player) {
        Object.assign(this.player, {
          x: state.player.x || 0,
          y: state.player.y || 0,
          vx: state.player.vx || 0,
          vy: state.player.vy || 0,
          rotation: state.player.rotation || 0,
          hp: state.player.hp || 100,
          maxHp: state.player.maxHp || 100,
          shield: state.player.shield || 100,
          maxShield: state.player.maxShield || 100,
          power: state.player.power || 100,
          maxPower: state.player.maxPower || 100,
          fuel: state.player.fuel || 100,
          maxFuel: state.player.maxFuel || 100,
          callsign: state.player.callsign || state.callsign || 'NOVA-7',
          shipName: state.player.shipName || state.shipName || 'WANDERER',
          color: state.player.color || state.shipColor || 'blue',
        });
      }

      // Restore camera
      if (state.camera) {
        this.camera.x = state.camera.x || 0;
        this.camera.y = state.camera.y || 0;
        this.camera.zoom = state.camera.zoom || 1;
      }

      // Restore interstellar position
      this.interstellarPlayerX = state.interstellarPlayerX || 0;
      this.interstellarPlayerY = state.interstellarPlayerY || 0;

      // Restore economy
      this.credits = state.credits || 0;
      this.cargo = state.cargo || [];

      // Restore discovered systems
      if (state.discoveredSystems) {
        this.discoveredSystems = new Set(state.discoveredSystems);
      }

      // Restore scene
      this.scene = state.scene || 'system';

      // Restore statistics
      if (state.statistics) {
        this.statistics = { ...state.statistics };
      }

      // Regenerate galaxy with same seed if needed
      if (this.seed && this.galaxyGenerator && this.seed !== this.galaxyGenerator.seed) {
        try {
          this.galaxyGenerator = new GalaxyGenerator(this.seed);
          this.galaxy = this.galaxyGenerator.generate();
          if (this.factionSystem) this.factionSystem.assignTerritories(this.galaxy);
          if (this.warpGateSystem) this.warpGateSystem.generateGateNetwork(this.galaxy);
          this.interstellarRenderer = new InterstellarRenderer(this.galaxy);
        } catch (error) {
          console.error('Error regenerating galaxy:', error);
        }
      }

      // Load current system
      if (this.scene === 'system' && this.currentSystemIndex !== undefined) {
        try {
          await this.loadStarSystem(this.currentSystemIndex);
        } catch (error) {
          console.error('Error loading system:', error);
        }
      }

      console.log('Game state loaded successfully');

      // Broadcast state after a short delay to ensure everything is initialized
      setTimeout(() => {
        if (this.broadcastState) {
          this.broadcastState();
        }
      }, 100);
    } catch (error) {
      console.error('Error loading game state:', error);
      // Don't throw - just log and continue with default state
    }
  }

  /**
   * Apply user settings
   */
  applySettings(settings) {
    if (!settings) return;

    console.log('Applying settings...', settings);

    try {
      // Graphics settings
      if (settings.resolution) {
        // Would need to resize canvas - complex operation
        console.log('Resolution setting:', settings.resolution);
      }

      if (settings.pixelPerfect !== undefined) {
        this.ctx.imageSmoothingEnabled = !settings.pixelPerfect;
      }

      // Audio settings would be handled by a separate audio system
      if (settings.masterVolume !== undefined) {
        console.log('Master volume:', settings.masterVolume);
        // TODO: Apply to audio system when implemented
      }

      if (settings.musicVolume !== undefined) {
        console.log('Music volume:', settings.musicVolume);
        // TODO: Apply to audio system when implemented
      }

      if (settings.sfxVolume !== undefined) {
        console.log('SFX volume:', settings.sfxVolume);
        // TODO: Apply to audio system when implemented
      }

      // Control settings
      if (settings.mouseSensitivity !== undefined) {
        this.mouseSensitivity = settings.mouseSensitivity / 100;
      }

      if (settings.invertY !== undefined) {
        this.invertY = settings.invertY;
      }

      if (settings.edgeScroll !== undefined) {
        this.edgeScroll = settings.edgeScroll;
      }

      if (settings.keyboardSpeed !== undefined) {
        this.keyboardSpeed = settings.keyboardSpeed / 100;
      }

      // Gameplay settings
      if (settings.autoSave !== undefined) {
        this.autoSaveEnabled = settings.autoSave;
      }

      if (settings.autoSaveInterval !== undefined) {
        this.autoSaveInterval = settings.autoSaveInterval * 60 * 1000; // Convert minutes to ms
      }

      if (settings.pauseOnLostFocus !== undefined) {
        this.pauseOnLostFocus = settings.pauseOnLostFocus;
      }

      if (settings.showTutorials !== undefined) {
        this.showTutorials = settings.showTutorials;
      }

      if (settings.uiScale !== undefined) {
        this.uiScale = settings.uiScale / 100;
      }

      console.log('Settings applied successfully');
    } catch (error) {
      console.error('Error applying settings:', error);
    }
  }

  /**
   * Broadcast current game state for UI updates
   */
  broadcastState() {
    try {
      if (!this.getGameState) {
        console.warn('getGameState method not available');
        return;
      }

      const state = this.getGameState();

      if (!state) {
        console.warn('No state to broadcast');
        return;
      }

      // Dispatch custom event for UI to listen to
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const event = new CustomEvent('gameStateUpdate', {
          detail: state
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error broadcasting game state:', error);
    }
  }

  destroy() {
    this.running = false;

    // Clean up all event listeners to prevent memory leaks
    if (this.eventHandlers) {
      if (this.eventHandlers.keydown) {
        window.removeEventListener('keydown', this.eventHandlers.keydown);
      }
      if (this.eventHandlers.keyup) {
        window.removeEventListener('keyup', this.eventHandlers.keyup);
      }
      if (this.canvas && this.eventHandlers.mousedown) {
        this.canvas.removeEventListener('mousedown', this.eventHandlers.mousedown);
      }
      if (this.canvas && this.eventHandlers.mouseup) {
        this.canvas.removeEventListener('mouseup', this.eventHandlers.mouseup);
      }
      if (this.canvas && this.eventHandlers.contextmenu) {
        this.canvas.removeEventListener('contextmenu', this.eventHandlers.contextmenu);
      }
      if (this.canvas && this.eventHandlers.click) {
        this.canvas.removeEventListener('click', this.eventHandlers.click);
      }
      if (this.canvas && this.eventHandlers.mousemove) {
        this.canvas.removeEventListener('mousemove', this.eventHandlers.mousemove);
      }
      if (this.canvas && this.eventHandlers.wheel) {
        this.canvas.removeEventListener('wheel', this.eventHandlers.wheel);
      }
      if (this.canvas && this.eventHandlers.touchstart) {
        this.canvas.removeEventListener('touchstart', this.eventHandlers.touchstart);
      }
      if (this.canvas && this.eventHandlers.touchmove) {
        this.canvas.removeEventListener('touchmove', this.eventHandlers.touchmove);
      }
      if (this.canvas && this.eventHandlers.touchend) {
        this.canvas.removeEventListener('touchend', this.eventHandlers.touchend);
      }
      if (this.eventHandlers.visibilitychange) {
        document.removeEventListener('visibilitychange', this.eventHandlers.visibilitychange);
      }
    }
  }
}
