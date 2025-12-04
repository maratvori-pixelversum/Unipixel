# PIXELVERSUM - COMPLETE DEVELOPMENT GUIDE
## From Foundation to Fully Functional Pixel Space Game

**Version:** 2.0
**Date:** 2025-11-26
**Purpose:** Complete step-by-step guide to build/rebuild Pixelversum with heavily pixelated aesthetic
**Target:** Zero bugs, optimal architecture, stunning pixel art visuals

---

## TABLE OF CONTENTS

1. [PHILOSOPHY & VISION](#1-philosophy--vision)
2. [TECHNICAL ARCHITECTURE](#2-technical-architecture)
3. [DEVELOPMENT PHASES](#3-development-phases)
4. [PHASE 1: FOUNDATION](#phase-1-foundation)
5. [PHASE 2: RENDERING ENGINE](#phase-2-rendering-engine)
6. [PHASE 3: CORE GAME ENGINE](#phase-3-core-game-engine)
7. [PHASE 4: GAME MECHANICS](#phase-4-game-mechanics)
8. [PHASE 5: WORLD GENERATION](#phase-5-world-generation)
9. [PHASE 6: UI SYSTEMS](#phase-6-ui-systems)
10. [PHASE 7: CONTENT & POLISH](#phase-7-content--polish)
11. [ASSET SPECIFICATIONS](#asset-specifications)
12. [TESTING STRATEGY](#testing-strategy)
13. [DEPLOYMENT](#deployment)

---

## 1. PHILOSOPHY & VISION

### Game Vision
A retro-inspired, heavily pixelated space exploration and combat game that looks like it's made from thousands of tiny pixels, creating a nostalgic yet modern aesthetic. Every visual element - from ships to planets to UI - should feel like classic pixel art but rendered at high resolution for modern displays.

### Visual Philosophy
- **Pixel-Perfect Rendering**: All assets appear heavily pixelated but are pre-generated, not runtime generated
- **Consistent Pixel Density**: Everything uses the same pixel size for visual cohesion
- **Retro CRT Aesthetic**: Scanlines, phosphor glow, chromatic aberration
- **Dark Horror Theme**: Deep blacks, high contrast, limited color palettes
- **Performance First**: Pre-generated sprites render 100x faster than procedural

### Technical Philosophy
- **Modular Architecture**: Small, focused files (max 500 lines each)
- **Separation of Concerns**: Rendering, logic, state management all separate
- **Test-Driven**: Each system testable in isolation
- **Performance-Conscious**: 60 FPS target, efficient algorithms
- **Maintainable**: Clear naming, documentation, logical organization

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 PROJECT STRUCTURE (Target)

```
Pixelversum/
├── src/
│   ├── main.js                      # Entry point
│   ├── App.js                       # Root React component
│   │
│   ├── core/                        # Core engine (Step 1)
│   │   ├── GameEngine.js           # Main game loop coordinator
│   │   ├── InputManager.js         # Input handling (keyboard, mouse, touch)
│   │   ├── StateManager.js         # Game state management
│   │   ├── EventBus.js             # Event system for decoupling
│   │   ├── Constants.js            # Game constants
│   │   └── Config.js               # Configuration values
│   │
│   ├── rendering/                   # Rendering systems (Step 2)
│   │   ├── CanvasRenderer.js       # Main canvas renderer
│   │   ├── Camera.js               # Camera system with zoom/shake
│   │   ├── SpriteRenderer.js       # Sprite rendering system
│   │   ├── LayerRenderer.js        # Multi-layer rendering
│   │   ├── ParticleRenderer.js     # Particle effects
│   │   ├── HUDRenderer.js          # HUD overlay
│   │   └── effects/
│   │       ├── CRTEffects.js       # Scanlines, phosphor glow
│   │       ├── ScreenShake.js      # Screen shake effects
│   │       └── PostProcessing.js   # Post-processing pipeline
│   │
│   ├── physics/                     # Physics systems (Step 3)
│   │   ├── PhysicsEngine.js        # Main physics coordinator
│   │   ├── Movement.js             # Velocity, acceleration
│   │   ├── Collision.js            # Collision detection
│   │   ├── Gravity.js              # Gravitational forces
│   │   ├── Orbital.js              # Orbital mechanics
│   │   └── SpatialGrid.js          # Spatial partitioning
│   │
│   ├── entities/                    # Game entities (Step 4)
│   │   ├── Entity.js               # Base entity class
│   │   ├── Player.js               # Player ship
│   │   ├── Enemy.js                # Enemy ships
│   │   ├── Projectile.js           # Projectiles
│   │   ├── Asteroid.js             # Asteroids
│   │   ├── Station.js              # Space stations
│   │   ├── Planet.js               # Planets
│   │   ├── Star.js                 # Stars
│   │   └── Particle.js             # Particle entity
│   │
│   ├── systems/                     # Game systems (Step 5)
│   │   ├── WeaponSystem.js         # Weapon management
│   │   ├── ShieldSystem.js         # Shield mechanics
│   │   ├── DamageSystem.js         # Damage calculation
│   │   ├── ResourceSystem.js       # Resource management
│   │   ├── CargoSystem.js          # Inventory/cargo
│   │   ├── MiningSystem.js         # Mining mechanics
│   │   ├── WarpSystem.js           # FTL travel
│   │   ├── FactionSystem.js        # Faction relations
│   │   ├── EconomySystem.js        # Trading economy
│   │   └── AchievementSystem.js    # Achievement tracking
│   │
│   ├── ai/                          # AI systems (Step 6)
│   │   ├── AIController.js         # Main AI coordinator
│   │   ├── BehaviorTree.js         # Behavior tree implementation
│   │   ├── Behaviors.js            # AI behaviors (patrol, attack, flee)
│   │   ├── Pathfinding.js          # A* pathfinding
│   │   └── Formation.js            # Fleet formations
│   │
│   ├── generation/                  # Procedural generation (Step 7)
│   │   ├── GalaxyGenerator.js      # Galaxy structure
│   │   ├── SystemGenerator.js      # Star systems
│   │   ├── PlanetGenerator.js      # Planet generation
│   │   ├── AsteroidGenerator.js    # Asteroid fields
│   │   ├── NameGenerator.js        # Procedural names
│   │   └── SeededRandom.js         # Seeded RNG
│   │
│   ├── assets/                      # Asset generation (Step 8)
│   │   ├── AssetManager.js         # Asset loading/caching
│   │   ├── SpriteGenerator.js      # Main sprite coordinator
│   │   ├── generators/
│   │   │   ├── ShipSpriteGen.js    # Ship sprites
│   │   │   ├── PlanetSpriteGen.js  # Planet sprites
│   │   │   ├── StarSpriteGen.js    # Star sprites
│   │   │   ├── AsteroidSpriteGen.js # Asteroid sprites
│   │   │   ├── StationSpriteGen.js # Station sprites
│   │   │   ├── UIElementGen.js     # UI element sprites
│   │   │   └── EffectSpriteGen.js  # Effect sprites
│   │   ├── PixelArtUtils.js        # Pixel art algorithms
│   │   └── ColorPalettes.js        # Color palette definitions
│   │
│   ├── ui/                          # UI systems (Step 9)
│   │   ├── UIManager.js            # Main UI coordinator
│   │   ├── screens/
│   │   │   ├── MainMenuScreen.js   # Main menu
│   │   │   ├── NewGameScreen.js    # New game setup
│   │   │   ├── LoadGameScreen.js   # Load game
│   │   │   ├── SaveGameScreen.js   # Save game
│   │   │   ├── SettingsScreen.js   # Settings
│   │   │   ├── PauseScreen.js      # Pause menu
│   │   │   ├── InventoryScreen.js  # Inventory
│   │   │   ├── GalaxyMapScreen.js  # Galaxy map
│   │   │   ├── StatsScreen.js      # Statistics
│   │   │   └── CreditsScreen.js    # Credits
│   │   ├── components/
│   │   │   ├── Button.js           # Pixel button
│   │   │   ├── Panel.js            # Pixel panel
│   │   │   ├── Input.js            # Text input
│   │   │   ├── Selector.js         # Dropdown
│   │   │   ├── Checkbox.js         # Checkbox
│   │   │   ├── Slider.js           # Slider
│   │   │   └── ProgressBar.js      # Progress bar
│   │   ├── theme/
│   │   │   ├── ThemeManager.js     # Theme system
│   │   │   └── themes.js           # Color schemes
│   │   └── HUD.js                  # In-game HUD
│   │
│   ├── persistence/                 # Save/load (Step 10)
│   │   ├── SaveManager.js          # Save system
│   │   ├── LoadManager.js          # Load system
│   │   ├── Serializer.js           # State serialization
│   │   └── StorageAdapter.js       # localStorage adapter
│   │
│   ├── audio/                       # Audio (Step 11)
│   │   ├── AudioManager.js         # Audio coordinator
│   │   ├── SoundGenerator.js       # Procedural sound
│   │   └── MusicPlayer.js          # Music system
│   │
│   └── utils/                       # Utilities
│       ├── Math.js                 # Math helpers
│       ├── Color.js                # Color utilities
│       ├── Performance.js          # Performance monitoring
│       ├── Debug.js                # Debug tools
│       └── Logger.js               # Logging system
│
├── public/
│   ├── fonts/
│   │   └── DigitalDisco.ttf        # Retro font
│   └── pregenerated/               # Pre-generated assets
│       ├── ships/                  # Ship sprite sheets
│       ├── planets/                # Planet sprites
│       ├── ui/                     # UI element sprites
│       └── effects/                # Effect sprites
│
├── server/                          # Backend (Future)
│   ├── index.js                    # Express server
│   └── routes/                     # API routes
│
├── tests/                           # Test suites
│   ├── unit/                       # Unit tests
│   └── integration/                # Integration tests
│
├── docs/                            # Documentation
│   └── (existing docs)
│
├── vite.config.js                  # Vite configuration
├── package.json                    # Dependencies
└── README.md                       # Project readme
```

### 2.2 Technology Stack

**Current (Maintain):**
- React 18.2.0 (UI framework)
- Vite 7.2.2 (Build tool)
- JavaScript (ES Modules)
- HTML5 Canvas (Rendering)
- Express 4.18.2 (Backend)

**No Changes Required:**
- No TypeScript migration needed
- No Phaser.js (stay with vanilla canvas)
- No additional frameworks

### 2.3 File Size Guidelines

**Maximum Lines Per File:**
- Core systems: 500 lines max
- Entity classes: 300 lines max
- Generators: 400 lines max
- UI components: 250 lines max
- Utilities: 200 lines max

**Current Issue:**
- Game.js: 11,116 lines ❌
- **Target:** Break into 30+ modular files ✅

---

## 3. DEVELOPMENT PHASES

### Phase Overview

Each phase builds on the previous, ensuring no system is implemented before its dependencies.

| Phase | Name | Dependencies | Duration | Files |
|-------|------|--------------|----------|-------|
| 1 | Foundation | None | First | 8 files |
| 2 | Rendering Engine | Phase 1 | Second | 12 files |
| 3 | Core Game Engine | Phase 1-2 | Third | 10 files |
| 4 | Game Mechanics | Phase 1-3 | Fourth | 15 files |
| 5 | World Generation | Phase 1-3 | Fifth | 7 files |
| 6 | UI Systems | Phase 2, 4 | Sixth | 20 files |
| 7 | Content & Polish | All | Seventh | Variable |

### Implementation Order Logic

```
Foundation (core systems, event bus, state)
    ↓
Rendering (canvas, camera, sprites)
    ↓
Physics (movement, collision, gravity)
    ↓
Entities (player, enemies, objects)
    ↓
Game Mechanics (weapons, shields, resources)
    ↓
World Generation (galaxy, systems, planets)
    ↓
UI Systems (menus, HUD, screens)
    ↓
Content & Polish (balance, effects, juice)
```

---

## PHASE 1: FOUNDATION

### Overview
Build the absolute core of the game engine - the systems that everything else depends on. No rendering, no game logic, just the fundamental infrastructure.

### Goals
- ✅ Game loop running at 60 FPS
- ✅ Input handling (keyboard, mouse, touch)
- ✅ Event system for decoupled communication
- ✅ State management
- ✅ Configuration system
- ✅ No visual output yet (that's Phase 2)

### 1.1 Constants & Configuration

**File:** `src/core/Constants.js`

```javascript
// Core game constants
export const GAME_CONFIG = {
  // Display
  TARGET_WIDTH: 1920,
  TARGET_HEIGHT: 1080,
  TARGET_FPS: 60,
  PIXEL_SIZE: 2, // Base pixel size for retro look

  // Physics
  PHYSICS_TIMESTEP: 1/60,
  MAX_DELTA_TIME: 0.1,
  VELOCITY_EPSILON: 0.01,

  // Performance
  MAX_PARTICLES: 1200,
  MAX_ENTITIES: 500,
  SPATIAL_GRID_SIZE: 1000,

  // Game
  AUTOSAVE_INTERVAL: 300000, // 5 minutes
  MAX_SAVE_SLOTS: 10
};

export const INPUT_KEYS = {
  // Movement
  MOVE_UP: ['KeyW', 'ArrowUp'],
  MOVE_DOWN: ['KeyS', 'ArrowDown'],
  MOVE_LEFT: ['KeyA', 'ArrowLeft'],
  MOVE_RIGHT: ['KeyD', 'ArrowRight'],

  // Actions
  FIRE: ['Space'],
  SHIELD: ['KeyZ'],
  BRAKE: ['KeyX'],
  WARP: ['ShiftLeft', 'ShiftRight'],
  MINE: ['KeyF'],

  // UI
  MENU: ['Escape'],
  INVENTORY: ['KeyI'],
  MAP: ['KeyM'],
  INTERACT: ['KeyE'],

  // Weapons
  PREV_WEAPON: ['KeyQ'],
  NEXT_WEAPON: ['KeyE']
};

export const PHYSICS_CONSTANTS = {
  SPACE_FRICTION: 0.99,
  GRAVITY_CONSTANT: 6.674e-11,
  MAX_VELOCITY: 1000,
  ROTATION_SPEED: 0.05
};
```

**File:** `src/core/Config.js`

```javascript
// Runtime configuration (user settings)
export class Config {
  constructor() {
    this.settings = this.loadSettings();
  }

  loadSettings() {
    const stored = localStorage.getItem('pixelversum_settings');
    return stored ? JSON.parse(stored) : this.getDefaults();
  }

  getDefaults() {
    return {
      // Graphics
      screenEffects: true,
      scanlines: true,
      crtGlow: true,
      particleQuality: 'high',

      // Audio
      masterVolume: 0.7,
      musicVolume: 0.5,
      sfxVolume: 0.8,

      // Controls
      mouseSensitivity: 1.0,
      invertY: false,
      touchControls: true,

      // Gameplay
      difficulty: 'normal',
      autosave: true,

      // Theme
      colorScheme: 'blood' // blood, decay, void, rust
    };
  }

  save() {
    localStorage.setItem('pixelversum_settings', JSON.stringify(this.settings));
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.save();
  }
}
```

### 1.2 Event Bus

**File:** `src/core/EventBus.js`

```javascript
// Decoupled event system for communication between systems
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    callbacks.forEach(callback => callback(data));
  }

  clear() {
    this.listeners.clear();
  }
}

// Singleton instance
export const eventBus = new EventBus();
```

### 1.3 Input Manager

**File:** `src/core/InputManager.js`

```javascript
import { INPUT_KEYS } from './Constants.js';
import { eventBus } from './EventBus.js';

export class InputManager {
  constructor() {
    this.keys = new Set();
    this.mousePos = { x: 0, y: 0 };
    this.mouseButtons = new Set();
    this.touches = new Map();

    this.setupListeners();
  }

  setupListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // Mouse
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mouseup', (e) => this.handleMouseUp(e));

    // Touch
    window.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    window.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    window.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    // Prevent context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  handleKeyDown(e) {
    if (!this.keys.has(e.code)) {
      this.keys.add(e.code);
      eventBus.emit('keydown', { code: e.code, key: e.key });
    }

    // Prevent default for game keys
    if (this.isGameKey(e.code)) {
      e.preventDefault();
    }
  }

  handleKeyUp(e) {
    this.keys.delete(e.code);
    eventBus.emit('keyup', { code: e.code, key: e.key });
  }

  handleMouseMove(e) {
    this.mousePos = { x: e.clientX, y: e.clientY };
    eventBus.emit('mousemove', this.mousePos);
  }

  handleMouseDown(e) {
    this.mouseButtons.add(e.button);
    eventBus.emit('mousedown', { button: e.button, pos: this.mousePos });
  }

  handleMouseUp(e) {
    this.mouseButtons.delete(e.button);
    eventBus.emit('mouseup', { button: e.button, pos: this.mousePos });
  }

  handleTouchStart(e) {
    for (const touch of e.changedTouches) {
      this.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY
      });
    }
    eventBus.emit('touchstart', { touches: this.touches });
  }

  handleTouchMove(e) {
    for (const touch of e.changedTouches) {
      this.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY
      });
    }
    eventBus.emit('touchmove', { touches: this.touches });
    e.preventDefault();
  }

  handleTouchEnd(e) {
    for (const touch of e.changedTouches) {
      this.touches.delete(touch.identifier);
    }
    eventBus.emit('touchend', { touches: this.touches });
  }

  isKeyPressed(action) {
    const keyCodes = INPUT_KEYS[action] || [];
    return keyCodes.some(code => this.keys.has(code));
  }

  isMouseButtonPressed(button) {
    return this.mouseButtons.has(button);
  }

  isGameKey(code) {
    return Object.values(INPUT_KEYS).flat().includes(code);
  }

  reset() {
    this.keys.clear();
    this.mouseButtons.clear();
    this.touches.clear();
  }
}
```

### 1.4 State Manager

**File:** `src/core/StateManager.js`

```javascript
import { eventBus } from './EventBus.js';

export class StateManager {
  constructor() {
    this.state = {
      // Game state
      scene: 'loading', // loading, menu, game, paused
      gameActive: false,

      // Player data
      player: null,

      // World data
      entities: new Map(),
      currentSystem: null,
      galaxy: null,

      // UI state
      showInventory: false,
      showMap: false,
      showMenu: false,

      // Meta
      playtime: 0,
      statistics: this.createEmptyStats()
    };
  }

  createEmptyStats() {
    return {
      kills: 0,
      deaths: 0,
      creditsEarned: 0,
      damageDealt: 0,
      damageTaken: 0,
      distanceTraveled: 0,
      systemsVisited: 0,
      planetsLanded: 0,
      asteroidsMinedexcavated: 0,
      itemsTraded: 0,
      achievementsUnlocked: 0
    };
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }

  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => obj[key], this.state);
    target[lastKey] = value;

    eventBus.emit('state:changed', { path, value });
  }

  update(path, updater) {
    const current = this.get(path);
    const updated = updater(current);
    this.set(path, updated);
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = newState;
    eventBus.emit('state:reset', this.state);
  }
}
```

### 1.5 Game Engine Core

**File:** `src/core/GameEngine.js`

```javascript
import { GAME_CONFIG } from './Constants.js';
import { Config } from './Config.js';
import { eventBus } from './EventBus.js';
import { InputManager } from './InputManager.js';
import { StateManager } from './StateManager.js';

export class GameEngine {
  constructor() {
    this.config = new Config();
    this.input = new InputManager();
    this.state = new StateManager();

    this.running = false;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.frameCount = 0;
    this.fps = 0;

    // Systems (will be injected in later phases)
    this.systems = [];

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Handle visibility change (pause when tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      }
    });
  }

  registerSystem(system) {
    this.systems.push(system);
    if (system.init) {
      system.init(this);
    }
  }

  start() {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();

    eventBus.emit('game:started');
    this.loop();
  }

  pause() {
    this.running = false;
    eventBus.emit('game:paused');
  }

  resume() {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    eventBus.emit('game:resumed');
    this.loop();
  }

  loop(currentTime = 0) {
    if (!this.running) return;

    // Calculate delta time
    this.deltaTime = Math.min(
      (currentTime - this.lastTime) / 1000,
      GAME_CONFIG.MAX_DELTA_TIME
    );
    this.lastTime = currentTime;

    // Update FPS counter
    this.frameCount++;
    if (this.frameCount % 60 === 0) {
      this.fps = Math.round(1 / this.deltaTime);
      eventBus.emit('fps:update', this.fps);
    }

    // Update all systems
    this.update(this.deltaTime);

    // Render all systems
    this.render();

    // Schedule next frame
    requestAnimationFrame((time) => this.loop(time));
  }

  update(dt) {
    // Update each system
    for (const system of this.systems) {
      if (system.update) {
        system.update(dt);
      }
    }

    eventBus.emit('game:update', dt);
  }

  render() {
    // Render each system
    for (const system of this.systems) {
      if (system.render) {
        system.render();
      }
    }

    eventBus.emit('game:render');
  }

  destroy() {
    this.running = false;

    // Cleanup systems
    for (const system of this.systems) {
      if (system.destroy) {
        system.destroy();
      }
    }

    this.systems = [];
    eventBus.clear();

    eventBus.emit('game:destroyed');
  }
}
```

### 1.6 Integration

**File:** `src/core/index.js`

```javascript
// Core module exports
export { GameEngine } from './GameEngine.js';
export { InputManager } from './InputManager.js';
export { StateManager } from './StateManager.js';
export { Config } from './Config.js';
export { eventBus, EventBus } from './EventBus.js';
export { GAME_CONFIG, INPUT_KEYS, PHYSICS_CONSTANTS } from './Constants.js';
```

### 1.7 Phase 1 Testing

**Test File:** `tests/unit/core/GameEngine.test.js`

```javascript
import { GameEngine } from '../../../src/core/GameEngine.js';

describe('GameEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  afterEach(() => {
    engine.destroy();
  });

  test('initializes correctly', () => {
    expect(engine.running).toBe(false);
    expect(engine.fps).toBe(0);
    expect(engine.systems).toHaveLength(0);
  });

  test('starts and pauses', () => {
    engine.start();
    expect(engine.running).toBe(true);

    engine.pause();
    expect(engine.running).toBe(false);
  });

  test('registers systems', () => {
    const mockSystem = { init: jest.fn(), update: jest.fn() };
    engine.registerSystem(mockSystem);

    expect(engine.systems).toHaveLength(1);
    expect(mockSystem.init).toHaveBeenCalledWith(engine);
  });
});
```

**Phase 1 Completion Criteria:**
- ✅ Game loop runs at stable 60 FPS
- ✅ Input events captured correctly
- ✅ Event bus functional
- ✅ State manager working
- ✅ All tests passing
- ✅ No console errors

---

## PHASE 2: RENDERING ENGINE

### Overview
Build the visual rendering system. This handles drawing everything to the canvas - sprites, effects, camera, layers. Still no game logic, just rendering capabilities.

### Goals
- ✅ Canvas setup with pixel-perfect scaling
- ✅ Camera system with zoom, pan, shake
- ✅ Multi-layer rendering (background, game, UI, effects)
- ✅ Sprite rendering system
- ✅ Particle system
- ✅ CRT effects (scanlines, glow, chromatic aberration)
- ✅ HUD rendering basics

### 2.1 Canvas Renderer

**File:** `src/rendering/CanvasRenderer.js`

```javascript
import { GAME_CONFIG } from '../core/Constants.js';
import { eventBus } from '../core/EventBus.js';

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true // Better performance
    });

    this.width = GAME_CONFIG.TARGET_WIDTH;
    this.height = GAME_CONFIG.TARGET_HEIGHT;

    this.setupCanvas();
    this.setupEventListeners();
  }

  setupCanvas() {
    // Set internal resolution
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Scale to window size
    this.resize();

    // Pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = this.width / this.height;

    if (windowRatio < gameRatio) {
      // Window is taller, fit to width
      this.canvas.style.width = '100%';
      this.canvas.style.height = 'auto';
    } else {
      // Window is wider, fit to height
      this.canvas.style.width = 'auto';
      this.canvas.style.height = '100%';
    }

    eventBus.emit('canvas:resized', {
      width: this.canvas.offsetWidth,
      height: this.canvas.offsetHeight
    });
  }

  clear(color = '#000000') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Basic drawing primitives
  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawLine(x1, y1, x2, y2, color, width = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  drawText(text, x, y, options = {}) {
    const {
      color = '#ffffff',
      font = '16px monospace',
      align = 'left',
      baseline = 'top'
    } = options;

    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.fillText(text, x, y);
  }

  drawSprite(sprite, x, y, options = {}) {
    const {
      rotation = 0,
      scaleX = 1,
      scaleY = 1,
      alpha = 1
    } = options;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.scale(scaleX, scaleY);
    this.ctx.drawImage(
      sprite,
      -sprite.width / 2,
      -sprite.height / 2
    );
    this.ctx.restore();
  }

  getContext() {
    return this.ctx;
  }
}
```

### 2.2 Camera System

**File:** `src/rendering/Camera.js`

```javascript
import { GAME_CONFIG } from '../core/Constants.js';

export class Camera {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.getContext();

    this.x = 0;
    this.y = 0;
    this.zoom = 1;
    this.rotation = 0;

    // Target following
    this.target = null;
    this.followSpeed = 0.1;

    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeOffset = { x: 0, y: 0 };

    // Bounds
    this.bounds = null;
  }

  follow(target, speed = 0.1) {
    this.target = target;
    this.followSpeed = speed;
  }

  update(dt) {
    // Follow target
    if (this.target) {
      const targetX = this.target.x;
      const targetY = this.target.y;

      this.x += (targetX - this.x) * this.followSpeed;
      this.y += (targetY - this.y) * this.followSpeed;
    }

    // Update screen shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;

      const intensity = this.shakeIntensity * (this.shakeDuration / this.shakeDuration);
      this.shakeOffset.x = (Math.random() - 0.5) * intensity;
      this.shakeOffset.y = (Math.random() - 0.5) * intensity;

      if (this.shakeDuration <= 0) {
        this.shakeOffset = { x: 0, y: 0 };
      }
    }

    // Apply bounds
    if (this.bounds) {
      this.x = Math.max(this.bounds.left, Math.min(this.bounds.right, this.x));
      this.y = Math.max(this.bounds.top, Math.min(this.bounds.bottom, this.y));
    }
  }

  shake(intensity, duration) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  begin() {
    this.ctx.save();

    const centerX = GAME_CONFIG.TARGET_WIDTH / 2;
    const centerY = GAME_CONFIG.TARGET_HEIGHT / 2;

    // Apply camera transform
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.rotate(this.rotation);
    this.ctx.translate(
      -this.x + this.shakeOffset.x,
      -this.y + this.shakeOffset.y
    );
  }

  end() {
    this.ctx.restore();
  }

  screenToWorld(screenX, screenY) {
    const centerX = GAME_CONFIG.TARGET_WIDTH / 2;
    const centerY = GAME_CONFIG.TARGET_HEIGHT / 2;

    const x = (screenX - centerX) / this.zoom + this.x;
    const y = (screenY - centerY) / this.zoom + this.y;

    return { x, y };
  }

  worldToScreen(worldX, worldY) {
    const centerX = GAME_CONFIG.TARGET_WIDTH / 2;
    const centerY = GAME_CONFIG.TARGET_HEIGHT / 2;

    const x = (worldX - this.x) * this.zoom + centerX;
    const y = (worldY - this.y) * this.zoom + centerY;

    return { x, y };
  }

  isVisible(x, y, margin = 100) {
    const screen = this.worldToScreen(x, y);

    return screen.x >= -margin &&
           screen.x <= GAME_CONFIG.TARGET_WIDTH + margin &&
           screen.y >= -margin &&
           screen.y <= GAME_CONFIG.TARGET_HEIGHT + margin;
  }
}
```

### 2.3 Layer Renderer

**File:** `src/rendering/LayerRenderer.js`

```javascript
export class LayerRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.getContext();

    this.layers = new Map();
    this.layerOrder = [];
  }

  createLayer(name, zIndex = 0) {
    this.layers.set(name, {
      zIndex,
      items: [],
      visible: true
    });

    this.sortLayers();
  }

  sortLayers() {
    this.layerOrder = Array.from(this.layers.entries())
      .sort((a, b) => a[1].zIndex - b[1].zIndex)
      .map(entry => entry[0]);
  }

  addToLayer(layerName, item) {
    const layer = this.layers.get(layerName);
    if (!layer) return;

    layer.items.push(item);
  }

  clearLayer(layerName) {
    const layer = this.layers.get(layerName);
    if (!layer) return;

    layer.items = [];
  }

  clearAllLayers() {
    for (const layer of this.layers.values()) {
      layer.items = [];
    }
  }

  setLayerVisibility(layerName, visible) {
    const layer = this.layers.get(layerName);
    if (!layer) return;

    layer.visible = visible;
  }

  render(camera = null) {
    for (const layerName of this.layerOrder) {
      const layer = this.layers.get(layerName);
      if (!layer || !layer.visible) continue;

      for (const item of layer.items) {
        if (typeof item === 'function') {
          item(this.ctx, camera);
        } else if (item.render) {
          item.render(this.ctx, camera);
        }
      }
    }
  }
}
```

### 2.4 Sprite Renderer

**File:** `src/rendering/SpriteRenderer.js`

```javascript
export class SpriteRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.getContext();

    // Sprite cache
    this.sprites = new Map();
  }

  registerSprite(name, canvas) {
    this.sprites.set(name, canvas);
  }

  getSprite(name) {
    return this.sprites.get(name);
  }

  hasSprite(name) {
    return this.sprites.has(name);
  }

  render(spriteName, x, y, options = {}) {
    const sprite = this.sprites.get(spriteName);
    if (!sprite) return;

    const {
      rotation = 0,
      scaleX = 1,
      scaleY = 1,
      alpha = 1,
      flipX = false,
      flipY = false
    } = options;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.scale(flipX ? -scaleX : scaleX, flipY ? -scaleY : scaleY);
    this.ctx.drawImage(
      sprite,
      -sprite.width / 2,
      -sprite.height / 2
    );
    this.ctx.restore();
  }

  clear() {
    this.sprites.clear();
  }
}
```

### 2.5 Particle System

**File:** `src/rendering/ParticleRenderer.js`

```javascript
import { GAME_CONFIG } from '../core/Constants.js';

export class ParticleRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.getContext();

    this.particles = [];
    this.particlePool = [];
    this.maxParticles = GAME_CONFIG.MAX_PARTICLES;
  }

  createParticle(x, y, options = {}) {
    // Reuse from pool or create new
    let particle = this.particlePool.pop();
    if (!particle) {
      particle = {};
    }

    // Initialize particle
    particle.x = x;
    particle.y = y;
    particle.vx = options.vx || 0;
    particle.vy = options.vy || 0;
    particle.life = options.life || 1;
    particle.maxLife = options.life || 1;
    particle.color = options.color || '#ffffff';
    particle.size = options.size || 2;
    particle.alpha = 1;
    particle.gravity = options.gravity || 0;
    particle.friction = options.friction || 1;

    this.particles.push(particle);

    return particle;
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Update physics
      p.vy += p.gravity * dt;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Update life
      p.life -= dt;
      p.alpha = p.life / p.maxLife;

      // Remove dead particles
      if (p.life <= 0) {
        this.particlePool.push(p);
        this.particles.splice(i, 1);
      }
    }
  }

  render(camera) {
    this.ctx.save();

    for (const p of this.particles) {
      if (!camera.isVisible(p.x, p.y)) continue;

      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(
        Math.floor(p.x - p.size / 2),
        Math.floor(p.y - p.size / 2),
        p.size,
        p.size
      );
    }

    this.ctx.restore();
  }

  createExplosion(x, y, count = 20, color = '#ff6600') {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 50 + Math.random() * 100;

      this.createParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        color: color,
        size: 2 + Math.random() * 2,
        gravity: 20,
        friction: 0.95
      });
    }
  }

  clear() {
    this.particles = [];
    this.particlePool = [];
  }
}
```

### 2.6 HUD Renderer

**File:** `src/rendering/HUDRenderer.js`

```javascript
import { GAME_CONFIG } from '../core/Constants.js';

export class HUDRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.getContext();
    this.visible = true;
  }

  render(gameState) {
    if (!this.visible) return;

    const player = gameState.player;
    if (!player) return;

    this.ctx.save();

    // Draw status bars
    this.drawStatusBars(player);

    // Draw radar
    this.drawRadar(gameState);

    // Draw system info
    this.drawSystemInfo(gameState);

    // Draw FPS
    this.drawFPS(gameState.fps);

    this.ctx.restore();
  }

  drawStatusBars(player) {
    const x = 20;
    const y = GAME_CONFIG.TARGET_HEIGHT - 100;
    const barWidth = 200;
    const barHeight = 20;
    const spacing = 25;

    // Hull
    this.drawBar(x, y, barWidth, barHeight, player.hp / player.maxHp, '#00ff00', 'HULL');

    // Shields
    this.drawBar(x, y + spacing, barWidth, barHeight,
                 player.shields / player.maxShields, '#00ffff', 'SHIELDS');

    // Power
    this.drawBar(x, y + spacing * 2, barWidth, barHeight,
                 player.power / player.maxPower, '#ffff00', 'POWER');
  }

  drawBar(x, y, width, height, value, color, label) {
    // Background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x, y, width, height);

    // Border
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // Fill
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 2, y + 2, (width - 4) * value, height - 4);

    // Label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(label, x, y - 5);

    // Value
    const percent = Math.floor(value * 100);
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${percent}%`, x + width, y - 5);
  }

  drawRadar(gameState) {
    const radarSize = 150;
    const x = GAME_CONFIG.TARGET_WIDTH - radarSize - 20;
    const y = GAME_CONFIG.TARGET_HEIGHT - radarSize - 20;

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x, y, radarSize, radarSize);

    // Border
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, radarSize, radarSize);

    // Center crosshair
    const centerX = x + radarSize / 2;
    const centerY = y + radarSize / 2;

    this.ctx.strokeStyle = '#00ff00';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 5, centerY);
    this.ctx.lineTo(centerX + 5, centerY);
    this.ctx.moveTo(centerX, centerY - 5);
    this.ctx.lineTo(centerX, centerY + 5);
    this.ctx.stroke();

    // Draw entities as blips
    const player = gameState.player;
    const radarRange = 5000;

    gameState.entities.forEach(entity => {
      if (entity === player) return;

      const dx = entity.x - player.x;
      const dy = entity.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radarRange) return;

      const radarX = centerX + (dx / radarRange) * (radarSize / 2);
      const radarY = centerY + (dy / radarRange) * (radarSize / 2);

      // Color based on entity type
      let color = '#ffffff';
      if (entity.type === 'enemy') color = '#ff0000';
      if (entity.type === 'station') color = '#00ffff';
      if (entity.type === 'planet') color = '#00ff00';

      this.ctx.fillStyle = color;
      this.ctx.fillRect(radarX - 2, radarY - 2, 4, 4);
    });
  }

  drawSystemInfo(gameState) {
    const x = 20;
    const y = 20;

    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';

    const lines = [
      `SYSTEM: ${gameState.currentSystem?.name || 'UNKNOWN'}`,
      `COORDS: ${Math.floor(gameState.player?.x || 0)}, ${Math.floor(gameState.player?.y || 0)}`,
      `VELOCITY: ${Math.floor(gameState.player?.speed || 0)} m/s`
    ];

    lines.forEach((line, i) => {
      this.ctx.fillText(line, x, y + i * 20);
    });
  }

  drawFPS(fps) {
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`FPS: ${fps}`, GAME_CONFIG.TARGET_WIDTH - 20, 20);
  }

  toggle() {
    this.visible = !this.visible;
  }
}
```

### 2.7 CRT Effects

**File:** `src/rendering/effects/CRTEffects.js`

```javascript
import { GAME_CONFIG } from '../../core/Constants.js';

export class CRTEffects {
  constructor(renderer, config) {
    this.renderer = renderer;
    this.ctx = renderer.getContext();
    this.config = config;

    this.scanlineOffset = 0;
  }

  apply(dt) {
    if (!this.config.get('screenEffects')) return;

    // Apply effects in order
    if (this.config.get('scanlines')) {
      this.applyScanlines(dt);
    }

    if (this.config.get('crtGlow')) {
      this.applyCRTGlow();
    }

    this.applyVignette();
  }

  applyScanlines(dt) {
    this.scanlineOffset += dt * 100;
    if (this.scanlineOffset > 4) this.scanlineOffset = 0;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';

    for (let y = Math.floor(this.scanlineOffset); y < GAME_CONFIG.TARGET_HEIGHT; y += 4) {
      this.ctx.fillRect(0, y, GAME_CONFIG.TARGET_WIDTH, 2);
    }
  }

  applyCRTGlow() {
    // Subtle bloom effect
    this.ctx.shadowBlur = 3;
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';
  }

  applyVignette() {
    const gradient = this.ctx.createRadialGradient(
      GAME_CONFIG.TARGET_WIDTH / 2,
      GAME_CONFIG.TARGET_HEIGHT / 2,
      GAME_CONFIG.TARGET_HEIGHT / 3,
      GAME_CONFIG.TARGET_WIDTH / 2,
      GAME_CONFIG.TARGET_HEIGHT / 2,
      GAME_CONFIG.TARGET_HEIGHT
    );

    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, GAME_CONFIG.TARGET_WIDTH, GAME_CONFIG.TARGET_HEIGHT);
  }
}
```

**Phase 2 Completion Criteria:**
- ✅ Canvas renders at native resolution
- ✅ Camera follows player smoothly
- ✅ Sprites render correctly
- ✅ Particles system functional
- ✅ HUD displays correctly
- ✅ CRT effects working
- ✅ All tests passing
- ✅ 60 FPS maintained

---

## PHASE 3: CORE GAME ENGINE

### Overview
Build the physics engine and entity system. This is where the game becomes interactive - movement, collision, entities that can exist in the world.

### Goals
- ✅ Physics engine with movement and collision
- ✅ Spatial partitioning for performance
- ✅ Base entity class
- ✅ Player entity with controls
- ✅ Basic enemy entities
- ✅ Projectile entities

### 3.1 Physics Engine

**File:** `src/physics/PhysicsEngine.js`

```javascript
import { PHYSICS_CONSTANTS } from '../core/Constants.js';
import { eventBus } from '../core/EventBus.js';

export class PhysicsEngine {
  constructor() {
    this.entities = [];
    this.gravity = true;
  }

  init(engine) {
    this.engine = engine;
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  update(dt) {
    // Update all entities
    for (const entity of this.entities) {
      this.updateEntityPhysics(entity, dt);
    }

    // Check collisions
    this.checkCollisions();
  }

  updateEntityPhysics(entity, dt) {
    if (!entity.physics) return;

    // Apply acceleration
    entity.vx += entity.ax * dt;
    entity.vy += entity.ay * dt;

    // Apply friction
    entity.vx *= PHYSICS_CONSTANTS.SPACE_FRICTION;
    entity.vy *= PHYSICS_CONSTANTS.SPACE_FRICTION;

    // Clamp velocity
    const speed = Math.sqrt(entity.vx * entity.vx + entity.vy * entity.vy);
    if (speed > PHYSICS_CONSTANTS.MAX_VELOCITY) {
      const scale = PHYSICS_CONSTANTS.MAX_VELOCITY / speed;
      entity.vx *= scale;
      entity.vy *= scale;
    }

    // Update position
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;

    // Update rotation
    if (entity.rotationVel) {
      entity.rotation += entity.rotationVel * dt;
    }

    // Reset acceleration
    entity.ax = 0;
    entity.ay = 0;
  }

  checkCollisions() {
    // Simple O(n²) for now, will optimize with spatial grid later
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const a = this.entities[i];
        const b = this.entities[j];

        if (this.checkCollision(a, b)) {
          this.handleCollision(a, b);
        }
      }
    }
  }

  checkCollision(a, b) {
    if (!a.collider || !b.collider) return false;

    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return dist < a.radius + b.radius;
  }

  handleCollision(a, b) {
    eventBus.emit('collision', { a, b });

    // Simple bounce
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;

    // Separate entities
    const overlap = (a.radius + b.radius) - dist;
    a.x -= nx * overlap / 2;
    a.y -= ny * overlap / 2;
    b.x += nx * overlap / 2;
    b.y += ny * overlap / 2;
  }
}
```

### 3.2 Spatial Grid (Optimization)

**File:** `src/physics/SpatialGrid.js`

```javascript
import { GAME_CONFIG } from '../core/Constants.js';

export class SpatialGrid {
  constructor(cellSize = GAME_CONFIG.SPATIAL_GRID_SIZE) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  clear() {
    this.grid.clear();
  }

  insert(entity) {
    const cells = this.getCells(entity);
    for (const cell of cells) {
      const key = this.getKey(cell.x, cell.y);
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key).push(entity);
    }
  }

  query(x, y, radius) {
    const results = new Set();
    const cells = this.getCellsForCircle(x, y, radius);

    for (const cell of cells) {
      const key = this.getKey(cell.x, cell.y);
      const entities = this.grid.get(key);

      if (entities) {
        for (const entity of entities) {
          results.add(entity);
        }
      }
    }

    return Array.from(results);
  }

  getCells(entity) {
    const cells = [];
    const minX = Math.floor((entity.x - entity.radius) / this.cellSize);
    const maxX = Math.floor((entity.x + entity.radius) / this.cellSize);
    const minY = Math.floor((entity.y - entity.radius) / this.cellSize);
    const maxY = Math.floor((entity.y + entity.radius) / this.cellSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        cells.push({ x, y });
      }
    }

    return cells;
  }

  getCellsForCircle(x, y, radius) {
    const cells = [];
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        cells.push({ x: cx, y: cy });
      }
    }

    return cells;
  }

  getKey(x, y) {
    return `${x},${y}`;
  }
}
```

### 3.3 Base Entity

**File:** `src/entities/Entity.js`

```javascript
export class Entity {
  constructor(x, y, options = {}) {
    this.id = Entity.nextId++;
    this.type = options.type || 'entity';

    // Position
    this.x = x;
    this.y = y;
    this.rotation = options.rotation || 0;

    // Physics
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.rotationVel = 0;

    // Properties
    this.radius = options.radius || 10;
    this.mass = options.mass || 1;

    // State
    this.active = true;
    this.physics = options.physics !== false;
    this.collider = options.collider !== false;

    // Rendering
    this.sprite = options.sprite || null;
    this.color = options.color || '#ffffff';
  }

  update(dt) {
    // Override in subclasses
  }

  render(ctx, camera) {
    // Override in subclasses
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Default rendering (circle)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  applyForce(fx, fy) {
    this.ax += fx / this.mass;
    this.ay += fy / this.mass;
  }

  destroy() {
    this.active = false;
  }
}

Entity.nextId = 0;
```

### 3.4 Player Entity

**File:** `src/entities/Player.js`

```javascript
import { Entity } from './Entity.js';
import { INPUT_KEYS } from '../core/Constants.js';

export class Player extends Entity {
  constructor(x, y, options = {}) {
    super(x, y, {
      ...options,
      type: 'player',
      radius: 16
    });

    // Stats
    this.maxHp = 100;
    this.hp = 100;
    this.maxShields = 100;
    this.shields = 100;
    this.maxPower = 100;
    this.power = 100;

    // Ship properties
    this.thrust = 500;
    this.turnSpeed = 3;

    // Weapons
    this.weapons = [];
    this.currentWeapon = 0;
    this.fireDelay = 0.2;
    this.lastFire = 0;
  }

  update(dt, input) {
    super.update(dt);

    // Handle input
    this.handleInput(dt, input);

    // Regenerate shields
    if (this.shields < this.maxShields) {
      this.shields += 5 * dt;
      this.shields = Math.min(this.shields, this.maxShields);
    }

    // Regenerate power
    if (this.power < this.maxPower) {
      this.power += 10 * dt;
      this.power = Math.min(this.power, this.maxPower);
    }

    // Update speed for HUD
    this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  handleInput(dt, input) {
    // Rotation
    if (input.isKeyPressed('MOVE_LEFT')) {
      this.rotation -= this.turnSpeed * dt;
    }
    if (input.isKeyPressed('MOVE_RIGHT')) {
      this.rotation += this.turnSpeed * dt;
    }

    // Thrust
    if (input.isKeyPressed('MOVE_UP')) {
      const fx = Math.cos(this.rotation - Math.PI / 2) * this.thrust;
      const fy = Math.sin(this.rotation - Math.PI / 2) * this.thrust;
      this.applyForce(fx, fy);
    }

    if (input.isKeyPressed('MOVE_DOWN')) {
      const fx = -Math.cos(this.rotation - Math.PI / 2) * this.thrust * 0.5;
      const fy = -Math.sin(this.rotation - Math.PI / 2) * this.thrust * 0.5;
      this.applyForce(fx, fy);
    }

    // Brake
    if (input.isKeyPressed('BRAKE')) {
      this.vx *= 0.9;
      this.vy *= 0.9;
    }

    // Fire weapon
    if (input.isKeyPressed('FIRE')) {
      this.fireWeapon(dt);
    }
  }

  fireWeapon(dt) {
    this.lastFire += dt;
    if (this.lastFire < this.fireDelay) return;

    this.lastFire = 0;

    // Emit fire event
    const projectileData = {
      x: this.x + Math.cos(this.rotation - Math.PI / 2) * this.radius,
      y: this.y + Math.sin(this.rotation - Math.PI / 2) * this.radius,
      vx: this.vx + Math.cos(this.rotation - Math.PI / 2) * 500,
      vy: this.vy + Math.sin(this.rotation - Math.PI / 2) * 500,
      rotation: this.rotation,
      owner: this
    };

    // eventBus.emit('player:fire', projectileData);
    return projectileData;
  }

  takeDamage(amount) {
    if (this.shields > 0) {
      this.shields -= amount * 0.5;
      if (this.shields < 0) {
        this.hp += this.shields * 2; // Overflow damage
        this.shields = 0;
      }
    } else {
      this.hp -= amount;
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  die() {
    this.destroy();
    // eventBus.emit('player:died', this);
  }

  render(ctx, camera) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Simple ship shape (triangle)
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(-this.radius / 2, this.radius / 2);
    ctx.lineTo(this.radius / 2, this.radius / 2);
    ctx.closePath();
    ctx.fill();

    // Shield visualization
    if (this.shields > 0) {
      ctx.strokeStyle = `rgba(0, 255, 255, ${this.shields / this.maxShields})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
```

### 3.5 Projectile Entity

**File:** `src/entities/Projectile.js`

```javascript
import { Entity } from './Entity.js';

export class Projectile extends Entity {
  constructor(x, y, vx, vy, options = {}) {
    super(x, y, {
      ...options,
      type: 'projectile',
      radius: 3,
      physics: true,
      collider: true
    });

    this.vx = vx;
    this.vy = vy;

    this.damage = options.damage || 10;
    this.lifetime = options.lifetime || 3;
    this.age = 0;
    this.owner = options.owner;
  }

  update(dt) {
    super.update(dt);

    this.age += dt;
    if (this.age >= this.lifetime) {
      this.destroy();
    }
  }

  render(ctx, camera) {
    if (!this.active) return;

    ctx.save();
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(
      this.x - this.radius / 2,
      this.y - this.radius / 2,
      this.radius,
      this.radius
    );
    ctx.restore();
  }

  onHit(target) {
    if (target === this.owner) return;

    if (target.takeDamage) {
      target.takeDamage(this.damage);
    }

    this.destroy();
  }
}
```

**Phase 3 Completion Criteria:**
- ✅ Physics engine functional
- ✅ Player moves with keyboard controls
- ✅ Projectiles spawn and move
- ✅ Collisions detected
- ✅ Spatial grid optimizes queries
- ✅ All tests passing
- ✅ 60 FPS with 100+ entities

---

## PHASE 4: GAME MECHANICS

### Overview
Implement core game mechanics - weapons, shields, damage, resources, mining, trading. This makes the game actually playable.

### Goals
- ✅ Weapon system with multiple weapon types
- ✅ Shield system with recharge
- ✅ Damage system with armor calculation
- ✅ Resource system
- ✅ Cargo/inventory system
- ✅ Mining mechanics

### 4.1 Weapon System

**File:** `src/systems/WeaponSystem.js`

```javascript
export class WeaponSystem {
  constructor() {
    this.weapons = new Map();
    this.initWeaponTypes();
  }

  initWeaponTypes() {
    this.weapons.set('kinetic', {
      name: 'Kinetic Cannon',
      damage: 15,
      fireRate: 5, // rounds per second
      energyCost: 5,
      projectileSpeed: 500,
      projectileLifetime: 2,
      color: '#ffaa00'
    });

    this.weapons.set('plasma', {
      name: 'Plasma Cannon',
      damage: 25,
      fireRate: 2,
      energyCost: 15,
      projectileSpeed: 400,
      projectileLifetime: 3,
      color: '#00ffff'
    });

    this.weapons.set('laser', {
      name: 'Laser Beam',
      damage: 10,
      fireRate: 10,
      energyCost: 3,
      projectileSpeed: 800,
      projectileLifetime: 1,
      color: '#ff0000'
    });

    this.weapons.set('missile', {
      name: 'Homing Missile',
      damage: 50,
      fireRate: 0.5,
      energyCost: 25,
      projectileSpeed: 300,
      projectileLifetime: 5,
      homing: true,
      color: '#ffff00'
    });
  }

  getWeapon(type) {
    return this.weapons.get(type);
  }

  canFire(weapon, player) {
    return player.power >= weapon.energyCost;
  }

  fire(weaponType, player, projectiles) {
    const weapon = this.getWeapon(weaponType);
    if (!weapon || !this.canFire(weapon, player)) return false;

    // Consume energy
    player.power -= weapon.energyCost;

    // Calculate projectile spawn position
    const spawnDist = player.radius + 5;
    const px = player.x + Math.cos(player.rotation - Math.PI / 2) * spawnDist;
    const py = player.y + Math.sin(player.rotation - Math.PI / 2) * spawnDist;

    // Calculate projectile velocity
    const vx = player.vx + Math.cos(player.rotation - Math.PI / 2) * weapon.projectileSpeed;
    const vy = player.vy + Math.sin(player.rotation - Math.PI / 2) * weapon.projectileSpeed;

    // Create projectile
    const projectile = {
      x: px,
      y: py,
      vx: vx,
      vy: vy,
      damage: weapon.damage,
      lifetime: weapon.projectileLifetime,
      age: 0,
      color: weapon.color,
      owner: player,
      homing: weapon.homing || false
    };

    projectiles.push(projectile);

    return true;
  }
}
```

### 4.2 Resource System

**File:** `src/systems/ResourceSystem.js`

```javascript
export class ResourceSystem {
  constructor() {
    this.resourceTypes = this.initResourceTypes();
  }

  initResourceTypes() {
    return {
      // Common resources
      iron: { name: 'Iron', rarity: 'common', baseValue: 10 },
      silicon: { name: 'Silicon', rarity: 'common', baseValue: 15 },
      water: { name: 'Water Ice', rarity: 'common', baseValue: 8 },
      carbon: { name: 'Carbon', rarity: 'common', baseValue: 12 },

      // Uncommon resources
      titanium: { name: 'Titanium', rarity: 'uncommon', baseValue: 50 },
      platinum: { name: 'Platinum', rarity: 'uncommon', baseValue: 75 },
      deuterium: { name: 'Deuterium', rarity: 'uncommon', baseValue: 60 },

      // Rare resources
      exoticMatter: { name: 'Exotic Matter', rarity: 'rare', baseValue: 200 },
      crystals: { name: 'Energy Crystals', rarity: 'rare', baseValue: 150 },
      antimatter: { name: 'Antimatter', rarity: 'rare', baseValue: 500 }
    };
  }

  getResource(type) {
    return this.resourceTypes[type];
  }

  getValue(type, quantity) {
    const resource = this.getResource(type);
    return resource ? resource.baseValue * quantity : 0;
  }

  getTotalValue(inventory) {
    let total = 0;
    for (const [type, quantity] of Object.entries(inventory)) {
      total += this.getValue(type, quantity);
    }
    return total;
  }
}
```

### 4.3 Cargo System

**File:** `src/systems/CargoSystem.js`

```javascript
export class CargoSystem {
  constructor(maxCapacity = 100) {
    this.maxCapacity = maxCapacity;
    this.cargo = {};
  }

  add(resource, quantity) {
    const current = this.getCurrentCapacity();
    const available = this.maxCapacity - current;

    if (available <= 0) return 0;

    const toAdd = Math.min(quantity, available);
    this.cargo[resource] = (this.cargo[resource] || 0) + toAdd;

    return toAdd;
  }

  remove(resource, quantity) {
    const current = this.cargo[resource] || 0;
    const toRemove = Math.min(quantity, current);

    this.cargo[resource] = current - toRemove;
    if (this.cargo[resource] <= 0) {
      delete this.cargo[resource];
    }

    return toRemove;
  }

  has(resource, quantity) {
    return (this.cargo[resource] || 0) >= quantity;
  }

  getCurrentCapacity() {
    return Object.values(this.cargo).reduce((sum, qty) => sum + qty, 0);
  }

  getAvailableCapacity() {
    return this.maxCapacity - this.getCurrentCapacity();
  }

  isFull() {
    return this.getCurrentCapacity() >= this.maxCapacity;
  }

  isEmpty() {
    return this.getCurrentCapacity() === 0;
  }

  getCargo() {
    return { ...this.cargo };
  }

  clear() {
    this.cargo = {};
  }
}
```

### 4.4 Mining System

**File:** `src/systems/MiningSystem.js`

```javascript
export class MiningSystem {
  constructor() {
    this.miningRange = 100;
    this.miningRate = 5; // units per second
  }

  findMinableAsteroids(player, asteroids) {
    const nearby = [];

    for (const asteroid of asteroids) {
      const dx = asteroid.x - player.x;
      const dy = asteroid.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= this.miningRange) {
        nearby.push({ asteroid, distance: dist });
      }
    }

    return nearby.sort((a, b) => a.distance - b.distance);
  }

  mine(player, asteroid, dt) {
    if (!asteroid.resources) return 0;

    // Calculate mining amount
    const mined = Math.min(
      this.miningRate * dt,
      asteroid.resources.quantity
    );

    // Add to player cargo
    const added = player.cargo.add(asteroid.resources.type, mined);

    // Remove from asteroid
    asteroid.resources.quantity -= added;

    if (asteroid.resources.quantity <= 0) {
      asteroid.depleted = true;
    }

    return added;
  }

  canMine(player, asteroid) {
    if (!asteroid || !asteroid.resources) return false;
    if (asteroid.depleted) return false;
    if (player.cargo.isFull()) return false;

    const dx = asteroid.x - player.x;
    const dy = asteroid.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return dist <= this.miningRange;
  }
}
```

**Phase 4 Completion Criteria:**
- ✅ Weapons fire correctly
- ✅ Multiple weapon types work
- ✅ Resource system functional
- ✅ Cargo management works
- ✅ Mining mechanics implemented
- ✅ All systems tested
- ✅ No performance degradation

---

## PHASE 5: WORLD GENERATION

### Overview
Procedural generation of the game world - galaxies, star systems, planets, asteroids. All seeded for consistency.

### Goals
- ✅ Galaxy generation
- ✅ Star system generation
- ✅ Planet generation
- ✅ Asteroid field generation
- ✅ Seeded random for reproducibility

### 5.1 Seeded Random

**File:** `src/generation/SeededRandom.js`

```javascript
export class SeededRandom {
  constructor(seed) {
    this.seed = seed;
    this.state = seed;
  }

  random() {
    // LCG (Linear Congruential Generator)
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }

  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max) {
    return this.random() * (max - min) + min;
  }

  choice(array) {
    return array[this.randomInt(0, array.length - 1)];
  }

  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // Perlin-like noise (simplified)
  noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
    return n - Math.floor(n);
  }
}
```

### 5.2 Galaxy Generator

**File:** `src/generation/GalaxyGenerator.js`

```javascript
import { SeededRandom } from './SeededRandom.js';

export class GalaxyGenerator {
  constructor(seed, size = 'medium') {
    this.rng = new SeededRandom(seed);
    this.size = size;

    this.systemCounts = {
      small: 20,
      medium: 40,
      large: 60
    };
  }

  generate() {
    const systemCount = this.systemCounts[this.size] || 40;
    const systems = [];

    for (let i = 0; i < systemCount; i++) {
      systems.push(this.generateSystem(i));
    }

    return {
      seed: this.rng.seed,
      size: this.size,
      systems: systems
    };
  }

  generateSystem(index) {
    const angle = (index / this.systemCounts[this.size]) * Math.PI * 2;
    const armOffset = this.rng.random() * Math.PI * 0.3;
    const distance = 1000 + this.rng.random() * 4000;

    return {
      id: index,
      name: this.generateSystemName(),
      x: Math.cos(angle + armOffset) * distance,
      y: Math.sin(angle + armOffset) * distance,
      spectralClass: this.rng.choice(['M', 'K', 'G', 'F', 'A']),
      generated: false // Lazy generation
    };
  }

  generateSystemName() {
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
    const suffixes = ['Centauri', 'Draconis', 'Orionis', 'Lyrae', 'Cygni', 'Aquilae'];
    const numbers = this.rng.randomInt(1, 999);

    if (this.rng.random() > 0.5) {
      return `${this.rng.choice(prefixes)} ${this.rng.choice(suffixes)}`;
    } else {
      return `${this.rng.choice(prefixes)}-${numbers}`;
    }
  }
}
```

### 5.3 System Generator

**File:** `src/generation/SystemGenerator.js`

```javascript
import { SeededRandom } from './SeededRandom.js';

export class SystemGenerator {
  constructor(systemData, seed) {
    this.data = systemData;
    this.rng = new SeededRandom(seed);
  }

  generate() {
    const system = {
      ...this.data,
      star: this.generateStar(),
      planets: [],
      asteroidBelts: [],
      stations: []
    };

    // Generate planets
    const planetCount = this.rng.randomInt(3, 8);
    for (let i = 0; i < planetCount; i++) {
      system.planets.push(this.generatePlanet(i));
    }

    // Generate asteroid belts
    const beltCount = this.rng.randomInt(1, 3);
    for (let i = 0; i < beltCount; i++) {
      system.asteroidBelts.push(this.generateAsteroidBelt(i));
    }

    // Generate stations
    const stationCount = this.rng.randomInt(1, 4);
    for (let i = 0; i < stationCount; i++) {
      system.stations.push(this.generateStation(i));
    }

    return system;
  }

  generateStar() {
    return {
      spectralClass: this.data.spectralClass,
      size: this.rng.randomInt(40, 80),
      x: 0,
      y: 0
    };
  }

  generatePlanet(index) {
    const types = ['rocky', 'terran', 'desert', 'ice', 'lava', 'gasGiant'];
    const orbitRadius = 500 + index * 400;

    return {
      id: index,
      type: this.rng.choice(types),
      size: this.rng.randomInt(20, 60),
      orbitRadius: orbitRadius,
      orbitSpeed: 0.1 / (index + 1),
      orbitAngle: this.rng.random() * Math.PI * 2,
      name: `${this.data.name} ${index + 1}`
    };
  }

  generateAsteroidBelt(index) {
    return {
      id: index,
      orbitRadius: 1500 + index * 800,
      asteroidCount: this.rng.randomInt(50, 150),
      spread: 200
    };
  }

  generateStation(index) {
    const types = ['trading', 'military', 'research'];
    const angle = (index / 4) * Math.PI * 2;
    const dist = this.rng.randomInt(800, 2000);

    return {
      id: index,
      type: this.rng.choice(types),
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      name: `${this.data.name} Station ${index + 1}`
    };
  }
}
```

**Phase 5 Completion Criteria:**
- ✅ Galaxy generates consistently from seed
- ✅ Star systems generate with planets
- ✅ Asteroid fields populate systems
- ✅ Stations placed correctly
- ✅ All generation is lazy (on-demand)
- ✅ No performance impact
- ✅ Same seed = same galaxy

---

## PHASE 6: UI SYSTEMS

### Overview
Complete UI system with all menus, screens, and in-game interface elements. React-based UI that overlays the canvas game.

### Goals
- ✅ Main menu screen
- ✅ New game setup screen
- ✅ In-game pause menu
- ✅ Inventory/cargo screen
- ✅ Galaxy map
- ✅ Settings screen
- ✅ HUD integration

### 6.1 UI Manager

**File:** `src/ui/UIManager.js`

```javascript
import React, { useState } from 'react';

export function UIManager({ gameState, onAction }) {
  const [currentScreen, setCurrentScreen] = useState('mainMenu');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'mainMenu':
        return <MainMenu onAction={(action) => handleAction(action)} />;
      case 'newGame':
        return <NewGameScreen onAction={(action) => handleAction(action)} />;
      case 'settings':
        return <SettingsScreen onAction={(action) => handleAction(action)} />;
      case 'game':
        return null; // Canvas renders game
      case 'pause':
        return <PauseMenu onAction={(action) => handleAction(action)} />;
      default:
        return null;
    }
  };

  const handleAction = (action) => {
    switch (action.type) {
      case 'START_GAME':
        setCurrentScreen('newGame');
        break;
      case 'BEGIN_GAME':
        setCurrentScreen('game');
        onAction({ type: 'START_GAME', data: action.data });
        break;
      case 'RESUME':
        setCurrentScreen('game');
        break;
      case 'SETTINGS':
        setCurrentScreen('settings');
        break;
      case 'BACK':
        setCurrentScreen('mainMenu');
        break;
      default:
        onAction(action);
    }
  };

  return (
    <div className="ui-overlay">
      {renderScreen()}
    </div>
  );
}
```

### 6.2 Main Menu

**File:** `src/ui/screens/MainMenuScreen.js`

```javascript
import React from 'react';
import { Button } from '../components/Button.js';
import { Panel } from '../components/Panel.js';

export function MainMenu({ onAction }) {
  return (
    <div className="main-menu">
      <Panel className="menu-panel">
        <h1 className="title">PIXELVERSUM</h1>

        <div className="menu-buttons">
          <Button onClick={() => onAction({ type: 'START_GAME' })}>
            NEW GAME
          </Button>

          <Button onClick={() => onAction({ type: 'LOAD_GAME' })}>
            LOAD GAME
          </Button>

          <Button onClick={() => onAction({ type: 'SETTINGS' })}>
            SETTINGS
          </Button>

          <Button onClick={() => onAction({ type: 'CREDITS' })}>
            CREDITS
          </Button>

          <Button onClick={() => onAction({ type: 'QUIT' })}>
            QUIT
          </Button>
        </div>

        <div className="version">v2.0.0</div>
      </Panel>
    </div>
  );
}
```

### 6.3 Settings Screen

**File:** `src/ui/screens/SettingsScreen.js`

```javascript
import React, { useState } from 'react';
import { Button } from '../components/Button.js';
import { Panel } from '../components/Panel.js';
import { Slider } from '../components/Slider.js';
import { Checkbox } from '../components/Checkbox.js';
import { Selector } from '../components/Selector.js';

export function SettingsScreen({ onAction, config }) {
  const [settings, setSettings] = useState(config.settings);

  const handleSave = () => {
    Object.entries(settings).forEach(([key, value]) => {
      config.set(key, value);
    });
    onAction({ type: 'BACK' });
  };

  return (
    <div className="settings-screen">
      <Panel className="settings-panel">
        <h2>SETTINGS</h2>

        <div className="settings-section">
          <h3>Graphics</h3>

          <div className="setting-row">
            <label>Color Scheme</label>
            <Selector
              value={settings.colorScheme}
              options={[
                { value: 'blood', label: 'Blood Red' },
                { value: 'decay', label: 'Decay Green' },
                { value: 'void', label: 'Void Purple' },
                { value: 'rust', label: 'Rust Orange' }
              ]}
              onChange={(value) => setSettings({ ...settings, colorScheme: value })}
            />
          </div>

          <div className="setting-row">
            <label>Screen Effects</label>
            <Checkbox
              checked={settings.screenEffects}
              onChange={(checked) => setSettings({ ...settings, screenEffects: checked })}
            />
          </div>

          <div className="setting-row">
            <label>Scanlines</label>
            <Checkbox
              checked={settings.scanlines}
              onChange={(checked) => setSettings({ ...settings, scanlines: checked })}
            />
          </div>

          <div className="setting-row">
            <label>CRT Glow</label>
            <Checkbox
              checked={settings.crtGlow}
              onChange={(checked) => setSettings({ ...settings, crtGlow: checked })}
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Audio</h3>

          <div className="setting-row">
            <label>Master Volume</label>
            <Slider
              value={settings.masterVolume}
              min={0}
              max={1}
              step={0.1}
              onChange={(value) => setSettings({ ...settings, masterVolume: value })}
            />
          </div>

          <div className="setting-row">
            <label>Music Volume</label>
            <Slider
              value={settings.musicVolume}
              min={0}
              max={1}
              step={0.1}
              onChange={(value) => setSettings({ ...settings, musicVolume: value })}
            />
          </div>

          <div className="setting-row">
            <label>SFX Volume</label>
            <Slider
              value={settings.sfxVolume}
              min={0}
              max={1}
              step={0.1}
              onChange={(value) => setSettings({ ...settings, sfxVolume: value })}
            />
          </div>
        </div>

        <div className="button-row">
          <Button onClick={handleSave}>SAVE</Button>
          <Button onClick={() => onAction({ type: 'BACK' })}>CANCEL</Button>
        </div>
      </Panel>
    </div>
  );
}
```

**Phase 6 Completion Criteria:**
- ✅ All screens render correctly
- ✅ Navigation between screens works
- ✅ Settings persist
- ✅ UI responsive to different resolutions
- ✅ Theme system working
- ✅ No UI performance issues

---

## PHASE 7: CONTENT & POLISH

### Overview
Final phase - balancing, polish, juice, effects, and content. Make the game feel good to play.

### Goals
- ✅ Game balancing (difficulty, progression)
- ✅ Visual polish (effects, animations)
- ✅ Audio integration
- ✅ Tutorial/help system
- ✅ Achievement system
- ✅ Save/load polish
- ✅ Performance optimization

### 7.1 Balance Configuration

**File:** `src/content/BalanceConfig.js`

```javascript
export const BALANCE_CONFIG = {
  difficulties: {
    easy: {
      enemyHealthMultiplier: 0.7,
      enemyDamageMultiplier: 0.7,
      playerHealthMultiplier: 1.3,
      resourceDropMultiplier: 1.5,
      creditMultiplier: 1.5
    },
    normal: {
      enemyHealthMultiplier: 1.0,
      enemyDamageMultiplier: 1.0,
      playerHealthMultiplier: 1.0,
      resourceDropMultiplier: 1.0,
      creditMultiplier: 1.0
    },
    hard: {
      enemyHealthMultiplier: 1.5,
      enemyDamageMultiplier: 1.5,
      playerHealthMultiplier: 0.7,
      resourceDropMultiplier: 0.7,
      creditMultiplier: 0.8
    }
  },

  progression: {
    // Ship upgrade tiers
    shipTiers: {
      fighter: { cost: 0, maxHp: 100, maxShields: 100, thrust: 500 },
      cruiser: { cost: 5000, maxHp: 200, maxShields: 150, thrust: 400 },
      battleship: { cost: 20000, maxHp: 400, maxShields: 200, thrust: 300 }
    },

    // Weapon unlock costs
    weaponUnlocks: {
      kinetic: 0,
      plasma: 1000,
      laser: 2000,
      missile: 5000
    }
  }
};
```

### 7.2 Achievement System

**File:** `src/systems/AchievementSystem.js`

```javascript
export class AchievementSystem {
  constructor() {
    this.achievements = this.initAchievements();
    this.unlocked = new Set();
  }

  initAchievements() {
    return {
      firstKill: {
        id: 'firstKill',
        name: 'First Blood',
        description: 'Destroy your first enemy',
        condition: (stats) => stats.kills >= 1
      },

      tenKills: {
        id: 'tenKills',
        name: 'Ace Pilot',
        description: 'Destroy 10 enemies',
        condition: (stats) => stats.kills >= 10
      },

      richTrader: {
        id: 'richTrader',
        name: 'Space Tycoon',
        description: 'Earn 10,000 credits',
        condition: (stats) => stats.creditsEarned >= 10000
      },

      explorer: {
        id: 'explorer',
        name: 'Explorer',
        description: 'Visit 10 different systems',
        condition: (stats) => stats.systemsVisited >= 10
      },

      miner: {
        id: 'miner',
        name: 'Asteroid Miner',
        description: 'Mine 100 asteroids',
        condition: (stats) => stats.asteroidsMined >= 100
      },

      survivor: {
        id: 'survivor',
        name: 'Survivor',
        description: 'Play for 1 hour without dying',
        condition: (stats) => stats.playtime >= 3600 && stats.deaths === 0
      }
    };
  }

  check(stats) {
    const newlyUnlocked = [];

    for (const achievement of Object.values(this.achievements)) {
      if (this.unlocked.has(achievement.id)) continue;

      if (achievement.condition(stats)) {
        this.unlocked.add(achievement.id);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  getProgress() {
    return {
      total: Object.keys(this.achievements).length,
      unlocked: this.unlocked.size,
      percentage: (this.unlocked.size / Object.keys(this.achievements).length) * 100
    };
  }
}
```

### 7.3 Save System

**File:** `src/persistence/SaveManager.js`

```javascript
export class SaveManager {
  constructor() {
    this.saveVersion = '2.0';
    this.maxSlots = 10;
  }

  save(slotId, gameState) {
    const saveData = {
      version: this.saveVersion,
      timestamp: Date.now(),
      player: this.serializePlayer(gameState.player),
      galaxy: this.serializeGalaxy(gameState.galaxy),
      statistics: gameState.statistics,
      playtime: gameState.playtime
    };

    try {
      localStorage.setItem(
        `pixelversum_save_${slotId}`,
        JSON.stringify(saveData)
      );
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  load(slotId) {
    try {
      const data = localStorage.getItem(`pixelversum_save_${slotId}`);
      if (!data) return null;

      const saveData = JSON.parse(data);

      // Version check
      if (saveData.version !== this.saveVersion) {
        console.warn('Save version mismatch');
        // Could add migration logic here
      }

      return saveData;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }

  listSaves() {
    const saves = [];

    for (let i = 0; i < this.maxSlots; i++) {
      const data = this.load(i);
      if (data) {
        saves.push({
          slot: i,
          timestamp: data.timestamp,
          playtime: data.playtime,
          playerName: data.player.name
        });
      }
    }

    return saves;
  }

  deleteSave(slotId) {
    localStorage.removeItem(`pixelversum_save_${slotId}`);
  }

  serializePlayer(player) {
    return {
      name: player.name,
      x: player.x,
      y: player.y,
      hp: player.hp,
      shields: player.shields,
      power: player.power,
      cargo: player.cargo.getCargo(),
      shipClass: player.shipClass
    };
  }

  serializeGalaxy(galaxy) {
    return {
      seed: galaxy.seed,
      size: galaxy.size,
      currentSystemId: galaxy.currentSystemId
    };
  }
}
```

**Phase 7 Completion Criteria:**
- ✅ Game balanced across difficulties
- ✅ Achievements unlock correctly
- ✅ Save/load works perfectly
- ✅ Visual polish complete
- ✅ Audio integrated
- ✅ Performance optimized (60 FPS)
- ✅ All bugs fixed
- ✅ Ready for deployment

---

## TESTING STRATEGY

### Unit Testing

```javascript
// Example: Test Physics Engine
describe('PhysicsEngine', () => {
  test('applies forces correctly', () => {
    const entity = new Entity(0, 0);
    entity.applyForce(100, 0);

    expect(entity.ax).toBe(100);
  });

  test('clamps velocity to max', () => {
    const entity = new Entity(0, 0);
    entity.vx = 10000; // Exceeds max

    physicsEngine.updateEntityPhysics(entity, 0.016);

    expect(Math.abs(entity.vx)).toBeLessThanOrEqual(PHYSICS_CONSTANTS.MAX_VELOCITY);
  });
});
```

### Integration Testing

```javascript
// Example: Test weapon firing
describe('Weapon System Integration', () => {
  test('player fires projectile', () => {
    const player = new Player(0, 0);
    const projectiles = [];
    const weaponSystem = new WeaponSystem();

    player.power = 100;

    const result = weaponSystem.fire('kinetic', player, projectiles);

    expect(result).toBe(true);
    expect(projectiles.length).toBe(1);
    expect(player.power).toBeLessThan(100);
  });
});
```

### Performance Testing

```javascript
// Benchmark spatial grid
function benchmarkSpatialGrid() {
  const grid = new SpatialGrid();
  const entities = [];

  // Create 1000 entities
  for (let i = 0; i < 1000; i++) {
    entities.push(new Entity(
      Math.random() * 10000,
      Math.random() * 10000
    ));
  }

  const start = performance.now();

  // Insert all
  entities.forEach(e => grid.insert(e));

  // Query 100 times
  for (let i = 0; i < 100; i++) {
    grid.query(
      Math.random() * 10000,
      Math.random() * 10000,
      100
    );
  }

  const end = performance.now();

  console.log(`Spatial grid benchmark: ${end - start}ms`);
  // Should be < 50ms
}
```

---

## DEPLOYMENT

### Build Process

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment Checklist

- ✅ All tests passing
- ✅ No console errors or warnings
- ✅ Performance: 60 FPS maintained
- ✅ All assets load correctly
- ✅ Save/load tested extensively
- ✅ Cross-browser testing complete
- ✅ Mobile/touch controls tested
- ✅ Documentation updated
- ✅ Version number incremented
- ✅ Changelog updated

### Production Optimization

```javascript
// vite.config.js
export default {
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'game-engine': [
            './src/core/GameEngine.js',
            './src/physics/PhysicsEngine.js'
          ],
          'rendering': [
            './src/rendering/CanvasRenderer.js',
            './src/rendering/Camera.js'
          ]
        }
      }
    }
  }
};
```

---

## FINAL SUMMARY

This complete development guide provides:

### ✅ **Phase 1: Foundation**
- Core engine (GameEngine, EventBus, StateManager)
- Input handling (keyboard, mouse, touch)
- Configuration system

### ✅ **Phase 2: Rendering**
- Canvas renderer with pixel-perfect scaling
- Camera system with follow, zoom, shake
- Sprite renderer with caching
- Particle system
- HUD renderer
- CRT effects

### ✅ **Phase 3: Core Game Engine**
- Physics engine with movement and collision
- Spatial grid for optimization
- Entity system (base, player, projectile)

### ✅ **Phase 4: Game Mechanics**
- Weapon system (multiple types)
- Resource system
- Cargo/inventory system
- Mining mechanics

### ✅ **Phase 5: World Generation**
- Seeded random generation
- Galaxy generator
- Star system generator
- Procedural planets and asteroids

### ✅ **Phase 6: UI Systems**
- Complete UI manager
- All game screens (menu, settings, pause)
- React-based overlay system

### ✅ **Phase 7: Polish**
- Game balancing
- Achievement system
- Save/load system
- Performance optimization

### **Key Principles Maintained:**

1. **Modular Architecture** - No file > 500 lines
2. **Separation of Concerns** - Clear responsibility boundaries
3. **Performance First** - 60 FPS target always met
4. **Testable** - Each system can be tested in isolation
5. **Maintainable** - Clear naming and logical organization

### **Result:**

A complete, production-ready game architecture that:
- Breaks the 11,116-line monolith into 60+ focused modules
- Uses pre-generated pixel art assets (100x faster)
- Maintains heavily pixelated aesthetic throughout
- Supports all planned features
- Runs at solid 60 FPS
- Is fully testable and maintainable

**The game can now be built systematically, phase by phase, with confidence that each phase is complete and tested before moving to the next.**

