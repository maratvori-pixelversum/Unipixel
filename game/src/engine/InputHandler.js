/**
 * InputHandler - Centralized input management for keyboard, mouse, and touch
 *
 * Extracted from Game.js to reduce complexity and improve maintainability.
 * Handles all user input and translates it into game actions.
 *
 * ARCHITECTURE: This class manages input state and dispatches actions to the game.
 * It follows the Single Responsibility Principle by focusing only on input.
 */

export class InputHandler {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;

    // Input state
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

    // Store event handlers for cleanup
    this.eventHandlers = {
      keydown: null,
      keyup: null,
      mousedown: null,
      mouseup: null,
      contextmenu: null,
      click: null,
      mousemove: null,
      wheel: null,
      touchstart: null,
      touchmove: null,
      touchend: null,
      visibilitychange: null
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard handlers
    this.eventHandlers.keydown = (e) => this.handleKeyDown(e);
    this.eventHandlers.keyup = (e) => this.handleKeyUp(e);
    window.addEventListener('keydown', this.eventHandlers.keydown);
    window.addEventListener('keyup', this.eventHandlers.keyup);

    // Mouse handlers
    this.eventHandlers.mousedown = (e) => this.handleMouseDown(e);
    this.eventHandlers.mouseup = (e) => this.handleMouseUp(e);
    this.eventHandlers.mousemove = (e) => this.handleMouseMove(e);
    this.eventHandlers.click = (e) => this.handleClick(e);
    this.eventHandlers.contextmenu = (e) => e.preventDefault();
    this.eventHandlers.wheel = (e) => this.handleWheel(e);

    this.canvas.addEventListener('mousedown', this.eventHandlers.mousedown);
    this.canvas.addEventListener('mouseup', this.eventHandlers.mouseup);
    this.canvas.addEventListener('mousemove', this.eventHandlers.mousemove);
    this.canvas.addEventListener('click', this.eventHandlers.click);
    this.canvas.addEventListener('contextmenu', this.eventHandlers.contextmenu);
    this.canvas.addEventListener('wheel', this.eventHandlers.wheel, { passive: false });

    // Touch handlers
    this.eventHandlers.touchstart = (e) => this.handleTouchStart(e);
    this.eventHandlers.touchmove = (e) => this.handleTouchMove(e);
    this.eventHandlers.touchend = (e) => this.handleTouchEnd(e);

    this.canvas.addEventListener('touchstart', this.eventHandlers.touchstart);
    this.canvas.addEventListener('touchmove', this.eventHandlers.touchmove);
    this.canvas.addEventListener('touchend', this.eventHandlers.touchend);

    // Visibility change handler (auto-pause)
    this.eventHandlers.visibilitychange = () => this.handleVisibilityChange();
    document.addEventListener('visibilitychange', this.eventHandlers.visibilitychange);
  }

  handleKeyDown(e) {
    this.input.keys.add(e.code);

    // Combat controls
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
    if (e.code === 'KeyQ' && this.game.weaponSystem) {
      this.game.weaponSystem.previousWeapon();
    }

    // 'E' key - prioritize interaction over weapon switching
    if (e.code === 'KeyE') {
      if (this.game.interactionSystem && this.game.uiState.showInteractionPrompt) {
        // Activate full interaction popup when prompt is showing
        this.game.interactionSystem.activateFullPopup();
        e.preventDefault();
      } else if (this.game.weaponSystem) {
        // Weapon switching (only when not near interactive objects)
        this.game.weaponSystem.nextWeapon();
      }
    }

    // Inertial dampening toggle
    if (e.code === 'KeyJ' && this.game.inertialSystem) {
      this.game.inertialSystem.toggleInertialDampening();
    }

    // Mining
    if (e.code === 'KeyF') {
      this.input.mining = true;
    }

    // UI Screens (toggle on/off)
    if (e.code === 'KeyI') {
      this.toggleScreen('showInventory');
    }
    if (e.code === 'KeyT') {
      this.toggleScreen('showTrading');
    }
    if (e.code === 'KeyM') {
      this.toggleScreen('showGalaxyMap');
    }
    if (e.code === 'KeyD') {
      this.toggleScreen('showDiplomacy');
    }

    // Let InteractionSystem handle popup navigation first
    if (this.game.interactionSystem && this.game.interactionSystem.handleKeyDown(e.code)) {
      e.preventDefault();
      return;
    }

    // Escape - close UI
    if (e.code === 'Escape') {
      this.handleEscape();
    }

    // Save/Load shortcuts
    if (e.code === 'F5') {
      e.preventDefault();
      this.handleQuickSave();
    }
    if (e.code === 'F6') {
      e.preventDefault();
      this.toggleScreen('showSaveScreen');
    }
    if (e.code === 'F7') {
      e.preventDefault();
      this.toggleScreen('showLoadScreen');
    }
    if (e.code === 'F9') {
      e.preventDefault();
      this.handleQuickLoad();
    }
  }

  handleKeyUp(e) {
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
  }

  handleMouseDown(e) {
    this.input.mouse.down = true;

    // Galaxy map drag-to-pan
    if (this.game.uiState.showGalaxyMap && this.game.galaxyMapState) {
      this.game.galaxyMapState.dragging = true;
      this.game.galaxyMapState.lastMouseX = this.input.mouse.x;
      this.game.galaxyMapState.lastMouseY = this.input.mouse.y;
    }

    if (e.button === 0) this.input.fire = true;
    if (e.button === 2) this.input.shield = true;
  }

  handleMouseUp(e) {
    this.input.mouse.down = false;

    // Galaxy map drag-to-pan
    if (this.game.galaxyMapState) {
      this.game.galaxyMapState.dragging = false;
    }

    if (e.button === 0) this.input.fire = false;
    if (e.button === 2) this.input.shield = false;
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.input.mouse.x = (e.clientX - rect.left) / this.game.scale;
    this.input.mouse.y = (e.clientY - rect.top) / this.game.scale;

    // Galaxy map drag-to-pan
    if (this.game.galaxyMapState && this.game.galaxyMapState.dragging && this.game.uiState.showGalaxyMap) {
      const dx = this.input.mouse.x - this.game.galaxyMapState.lastMouseX;
      const dy = this.input.mouse.y - this.game.galaxyMapState.lastMouseY;
      this.game.galaxyMapState.offsetX += dx;
      this.game.galaxyMapState.offsetY += dy;
      this.game.galaxyMapState.lastMouseX = this.input.mouse.x;
      this.game.galaxyMapState.lastMouseY = this.input.mouse.y;
    }
  }

  handleClick(e) {
    if (this.game.handleCanvasClick) {
      this.game.handleCanvasClick(e);
    }
  }

  handleWheel(e) {
    // Galaxy map zoom
    if (this.game.uiState.showGalaxyMap && this.game.galaxyMapState) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.game.galaxyMapState.zoom = Math.max(
        0.01,
        Math.min(0.2, this.game.galaxyMapState.zoom * zoomFactor)
      );
    }

    // Inventory scrolling
    if (this.game.uiState.showInventory && this.game.inventoryScrollState) {
      e.preventDefault();
      const scrollAmount = e.deltaY > 0 ? 50 : -50;
      this.game.inventoryScrollState.scrollOffset = Math.max(
        0,
        this.game.inventoryScrollState.scrollOffset + scrollAmount
      );
    }
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / this.game.scale;
    const y = (touch.clientY - rect.top) / this.game.scale;

    // Check popup button touches first
    if (this.game.uiState.showPopup && this.game.popupButtonBounds) {
      for (const button of this.game.popupButtonBounds) {
        if (x >= button.x && x <= button.x + button.w &&
            y >= button.y && y <= button.y + button.h) {
          // Touch on popup button
          if (typeof button.action === 'function') {
            button.action();
          } else {
            this.game.handlePopupAction(button.action);
          }
          return;
        }
      }
      // Touch outside popup - close it
      if (this.game.interactionSystem) {
        this.game.interactionSystem.closePopup();
      }
      return;
    }

    // Right side = fire button
    if (x > this.game.width - 150) {
      this.input.fire = true;
    } else {
      // Left side = joystick
      this.input.touch.active = true;
      this.input.touch.startX = x;
      this.input.touch.startY = y;
      this.input.touch.currentX = x;
      this.input.touch.currentY = y;
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (!this.input.touch.active) return;

    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.input.touch.currentX = (touch.clientX - rect.left) / this.game.scale;
    this.input.touch.currentY = (touch.clientY - rect.top) / this.game.scale;
  }

  handleTouchEnd(e) {
    e.preventDefault();
    this.input.touch.active = false;
    this.input.fire = false;
    this.input.thrust = 0;
    this.input.rotation = 0;
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.game.paused = true;
    } else {
      this.game.paused = false;
    }
  }

  /**
   * Helper methods for UI screen toggling
   */

  toggleScreen(screenName) {
    const wasOpen = this.game.uiState[screenName];
    this.game.uiState[screenName] = !wasOpen;

    if (this.game.uiState[screenName]) {
      // Close other screens when opening this one
      const screens = ['showInventory', 'showTrading', 'showDiplomacy', 'showGalaxyMap', 'showSaveScreen', 'showLoadScreen'];
      screens.forEach(screen => {
        if (screen !== screenName) {
          this.game.uiState[screen] = false;
        }
      });
    }

    if (this.game.updatePauseState) {
      this.game.updatePauseState();
    }
  }

  handleEscape() {
    // Close popup if showing
    if (this.game.uiState.showPopup) {
      this.game.uiState.showPopup = false;
      this.game.uiState.popupTarget = null;
      return;
    }

    // Close all UI screens
    this.game.uiState.showInventory = false;
    this.game.uiState.showTrading = false;
    this.game.uiState.showDiplomacy = false;
    this.game.uiState.showGalaxyMap = false;
    this.game.uiState.showSaveScreen = false;
    this.game.uiState.showLoadScreen = false;

    if (this.game.updatePauseState) {
      this.game.updatePauseState();
    }
  }

  handleQuickSave() {
    if (this.game.saveSystem) {
      this.game.saveSystem.saveGame('save_1', 'Quick Save');
    }
  }

  handleQuickLoad() {
    if (this.game.saveSystem) {
      const saves = this.game.saveSystem.getSaveList();
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
        this.game.saveSystem.loadGame(mostRecent.slot);
      } else {
        if (this.game.notificationSystem) {
          this.game.notificationSystem.show('No saves found', 'warning');
        }
      }
    }
  }

  /**
   * Get current input state (called by Game during update loop)
   */
  getInput() {
    return this.input;
  }

  /**
   * Clean up event listeners (called when destroying the game)
   */
  destroy() {
    window.removeEventListener('keydown', this.eventHandlers.keydown);
    window.removeEventListener('keyup', this.eventHandlers.keyup);

    this.canvas.removeEventListener('mousedown', this.eventHandlers.mousedown);
    this.canvas.removeEventListener('mouseup', this.eventHandlers.mouseup);
    this.canvas.removeEventListener('mousemove', this.eventHandlers.mousemove);
    this.canvas.removeEventListener('click', this.eventHandlers.click);
    this.canvas.removeEventListener('contextmenu', this.eventHandlers.contextmenu);
    this.canvas.removeEventListener('wheel', this.eventHandlers.wheel);

    this.canvas.removeEventListener('touchstart', this.eventHandlers.touchstart);
    this.canvas.removeEventListener('touchmove', this.eventHandlers.touchmove);
    this.canvas.removeEventListener('touchend', this.eventHandlers.touchend);

    document.removeEventListener('visibilitychange', this.eventHandlers.visibilitychange);
  }
}
